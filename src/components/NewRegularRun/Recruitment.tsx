import { useCallback, useEffect, useState } from 'react';
import { request, errorMessage, utcDate } from '../../features/improvements/shared';
import { previewFeaturesEnabled } from '../../shared/config/features';

export interface Enrollment {
  userId: number; name: string; role: 'RUNNER' | 'PACER';
  state: 'CONFIRMED' | 'WAITLISTED'; group: string; waitingNumber: number; attendance: string;
}
export interface Recruitment {
  configured: boolean; capacity: number | null;
  groups: { name: string; distanceKm: number; capacity?: number | null; pace: string }[];
  confirmed: Enrollment[]; waiting: Enrollment[]; mine: Enrollment | null;
}
export function useRecruitment(postId?: string) {
  const [data, setData] = useState<Recruitment>();
  const [error, setError] = useState('');
  const reload = useCallback(async () => {
    if (!postId) return;
    if (!previewFeaturesEnabled) {
      setData({configured:false,capacity:0,groups:[],confirmed:[],waiting:[],mine:null});
      return;
    }
    try { setData(await request<Recruitment>('get', `/run/regular/post/${postId}/recruitment`)); setError(''); }
    catch (e) { setError(errorMessage(e)); }
  }, [postId]);
  useEffect(() => { void reload(); }, [reload]);
  return { data, error, reload };
}
export function groupPacers(data: Recruitment | undefined, pacers: any[]) {
  if (!data?.configured) return pacers;
  return data.groups.flatMap(group => {
    const assigned = pacers.filter(p => p.group === group.name);
    return (assigned.length ? assigned : [{ group: group.name, pacerName: '-', profileImg: null }])
      .map(p => ({...p, distance: `${group.distanceKm} km`, pace: group.pace}));
  });
}
export function RecruitmentActions({data, postId, date, postStatus, canApplyAsPacer, onChange, onAttend}: {
  data: Recruitment; postId: string; date: string; postStatus: string; canApplyAsPacer: boolean;
  onChange: () => Promise<void>; onAttend?: () => void;
}) {
  const [role, setRole] = useState<'RUNNER'|'PACER'>();
  const [group, setGroup] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const open = postStatus === 'NOW' && utcDate(date).getTime() > Date.now();
  const mine = data.mine;
  const groupFull = (g: Recruitment['groups'][number]) => g.capacity != null && data.confirmed.filter(p => p.group === g.name).length >= g.capacity;
  const full = (data.capacity !== null && data.confirmed.length >= data.capacity) || data.groups.every(groupFull);
  const editable = open && mine?.attendance !== 'ATTENDED';
  async function save(cancel = false) {
    setBusy(true); setError('');
    try {
      await request(cancel ? 'delete' : 'put', `/run/regular/post/${postId}/enrollment`, cancel ? undefined : {role, group});
      await onChange(); setRole(undefined);
    } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  }
  function choose(next: 'RUNNER'|'PACER') { setRole(next); setGroup(mine?.group || data.groups[0]?.name || ''); setError(''); }
  const button = 'h-[52px] rounded-lg font-bold text-white disabled:bg-kuLightGray disabled:text-kuDarkGray';
  return <div className="w-full max-w-[335px] my-6 text-left">
    {mine ? <>
      <div className="flex gap-2"><button className={`${button} flex-1 bg-kuGreen`} disabled={busy || !editable || mine.state === 'WAITLISTED'} onClick={() => choose(mine.role)}>그룹 수정</button><button className={`${button} flex-1 bg-kuDarkGreen`} disabled={busy || !editable} onClick={() => { if (window.confirm('신청을 취소하시겠습니까?')) void save(true); }}>신청 취소</button></div>
      {mine.state === 'CONFIRMED' && onAttend && postStatus === 'NOW' && <button className={`${button} w-full mt-2 bg-kuDarkGreen`} disabled={mine.attendance === 'ATTENDED'} onClick={onAttend}>{mine.attendance === 'ATTENDED' ? '출석완료' : '출석하기'}</button>}
    </> : <div className="flex gap-2">
      <button className={`${button} flex-1 bg-kuGreen`} disabled={!open || busy} onClick={() => choose('RUNNER')}>
        {full ? '대기 신청' : '참여하기'}
      </button>
      {canApplyAsPacer && (
        <button className={`${button} flex-1 bg-kuDarkGreen`} disabled={!open || busy} onClick={() => choose('PACER')}>
          {full ? '페이서 대기 신청' : '페이서 신청'}
        </button>
      )}
    </div>}
    {!open && <p className="text-sm text-kuDarkGray mt-2">모집 종료</p>}
    {error && <p role="alert" className="text-sm text-red-500 mt-2">{error}</p>}
    {role && <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
      <div role="dialog" aria-modal="true" aria-label="신청 그룹 선택" className="bg-white p-6 rounded-lg w-[300px] max-w-[90%] text-center relative">
        <button aria-label="닫기" className="absolute top-2 right-3 text-2xl" onClick={() => setRole(undefined)}>×</button>
        <h2 className="text-base mb-4">그룹 선택</h2>
        <div className="flex flex-col gap-3">
          {data.groups.map(g => (
            <button key={g.name} className={`flex items-center gap-4 rounded-lg border px-4 py-3 text-left ${group === g.name ? 'bg-[#F3F8E8] border-kuDarkGreen' : 'bg-gray-100'}`} onClick={() => setGroup(g.name)}>
              <span>{g.name}</span><span>{g.distanceKm}km</span><span>{g.pace}</span>{g.capacity != null && <span>{data.confirmed.filter(p => p.group === g.name).length}/{g.capacity}명</span>}
            </button>
          ))}
        </div>
        <button className="mt-5 w-full py-3 bg-kuDarkGreen text-white rounded-lg disabled:opacity-50" disabled={busy || !group} onClick={() => void save()}>{!mine && (full || data.groups.some(g => g.name === group && groupFull(g))) ? '대기 신청' : '확인'}</button>
        {error && <p role="alert" className="text-sm text-red-500 mt-2">{error}</p>}
      </div>
    </div>}
  </div>;
}

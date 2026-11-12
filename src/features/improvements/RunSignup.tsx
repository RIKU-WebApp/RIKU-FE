import { useRef, useState } from 'react';
import { seatsLabel, totalLabel } from './availableSeats';
import { errorMessage } from './shared';
import type { useRunQueue } from './RunWaitlist';

export function groupSignupLabel(remaining: number, waiting = 0) {
  return remaining === 0 && waiting > 0 ? `대기 ${waiting}명` : seatsLabel(remaining);
}

export function SignupStatus({ remaining, waiting, group }: { remaining?: number; waiting?: number; group?: string }) {
  const seats = totalLabel(remaining);
  if (!seats && !waiting) return null;
  return <p className="mb-2 flex flex-wrap justify-center gap-x-3 text-sm text-kuDarkGreen" aria-live="polite">
    {seats && <span>{seats}</span>}
    {waiting != null && waiting > 0 && <span>{group && group + '그룹 '}대기 {waiting}명</span>}
  </p>;
}

export function RunJoinButton({ waitlist, onJoin }: {
  waitlist: ReturnType<typeof useRunQueue>;
  onJoin: (group: string) => Promise<void>;
}) {
  const { queue, seats } = waitlist;
  const dialog = useRef<HTMLDialogElement>(null);
  const [group, setGroup] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const groups = queue?.groups ?? [];
  const full = seats?.total === 0;
  const action = 'w-full rounded-lg bg-kuGreen py-3 font-bold text-white disabled:opacity-50';
  async function submit(name: string) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await onJoin(name);
      dialog.current?.close();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  const singleGroup = groups.length === 1 ? groups[0].name : undefined;
  const waiting = singleGroup ? queue?.waitingByGroup?.[singleGroup] : queue?.waiting.length;
  const status = <SignupStatus remaining={seats?.total} group={singleGroup} waiting={groups.length > 1 ? undefined : waiting} />;
  return <div className="mx-auto mb-2 mt-8 w-[min(327px,90vw)]">
    {status}
    <button type="button" className={action} disabled={!queue || busy} onClick={() => {
      if (groups.length > 1) {
        setGroup('');
        setError('');
        dialog.current?.showModal();
      } else {
        void submit(groups[0]?.name ?? '');
      }
    }}>{full ? '대기 신청' : '참여하기'}</button>
    {error && !dialog.current?.open && <p role="alert">{error}</p>}
    <dialog ref={dialog} aria-label="신청 그룹 선택" className="m-auto w-[300px] max-w-[90vw] rounded-lg p-6 text-center backdrop:bg-black/50"
      onClose={() => setError('')}>
      <button type="button" aria-label="닫기" className="absolute right-2 top-1 px-2 text-2xl" onClick={() => dialog.current?.close()}>×</button>
      <h2 className="mb-3">그룹 선택</h2>
      {status}
      <div className="mb-4 flex max-h-[55vh] flex-col gap-2 overflow-y-auto">
        {groups.map(g => <button key={g.name} type="button" aria-pressed={group === g.name}
          className={`flex items-center gap-2 rounded-lg border px-3 py-3 text-left ${group === g.name ? 'border-kuDarkGreen bg-[#F3F8E8]' : 'bg-gray-100'}`}
          onClick={() => setGroup(g.name)}>
          <span>{g.name}</span><span>{g.distanceKm}km</span><span>{g.pace}</span>
          {seats && (g.capacity != null || seats.total !== Infinity) && <small className="ml-auto text-kuDarkGreen">{groupSignupLabel(seats.forGroup(g.name), queue?.waitingByGroup?.[g.name])}</small>}
        </button>)}
      </div>
      <button type="button" disabled={busy || !groups.some(g => g.name === group)} className={action}
        onClick={() => void submit(group)}>{seats?.forGroup(group) === 0 ? '대기 신청' : '참여하기'}</button>
      {error && <p role="alert">{error}</p>}
    </dialog>
  </div>;
}

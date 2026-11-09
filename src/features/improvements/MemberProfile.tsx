import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { badgeCondition } from './badgeCondition';
import { BadgePatch } from './BadgePatch';
import type { Motif } from './badgeCollection';
import catalog from './badgeSeries.json';
import { type RankMedal, medalPeriod, rankPalette, RankPatch } from './RankMedals';
import { errorMessage, request, type Badge } from './shared';
import './rankMedals.css';
import './memberProfile.css';

type Profile = { name: string; badges: Badge[]; medals: RankMedal[] };
type Item = { key: string; title: string; period?: string; accent?: string; detail: string; art: React.ReactNode };
const previewLimit = 2;
const profileCatalog = [...catalog].sort((a, b) =>
  (a.profileOrder ?? Number.MAX_SAFE_INTEGER) - (b.profileOrder ?? Number.MAX_SAFE_INTEGER));

export function earnedItems(badges: Badge[]): Item[] {
  const items: Item[] = [];
  const grants = new Map(badges.filter(b => !b.code.startsWith('monthlyRank_')).map(b => [b.code, b]));
  for (const d of profileCatalog) {
    let best: Item | undefined;
    d.levels.forEach((target, grade) => {
      const code = (d.prefix ?? d.id) + '_' + target;
      if (!grants.delete(code)) return;
      const tier = d.tiers[grade];
      best = {
        key: code, title: d.name + ' ' + tier,
        detail: badgeCondition(d, grade),
        art: <BadgePatch patch={{ motif: d.motif as Motif, grade, single: d.levels.length === 1 }} />,
      };
    });
    if (best) items.push(best);
  }
  for (const b of grants.values()) items.push({
    key: b.code, title: b.name, detail: b.description,
    art: <BadgePatch patch={{ motif: 'star', grade: 0, single: true }} />,
  });
  return items;
}

function MemberProfile({ userId, onClose }: { userId: number; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useId();
  const [profile, setProfile] = useState<Profile>();
  const [error, setError] = useState('');
  const [attempt, retry] = useState(0);
  const [expanded, expand] = useState(false);
  const [selected, select] = useState<string>();
  useEffect(() => {
    const el = dialog.current;
    el?.showModal();
    return () => el?.close();
  }, []);
  useEffect(() => {
    let active = true;
    setError('');
    request<Profile>('get', '/user/' + userId + '/public-profile')
      .then(p => {
        // Older servers returned computed and manual badges here. Only display the issued-profile contract.
        if (!Array.isArray(p?.medals) || !Array.isArray(p.badges)) throw new Error('배지 프로필을 아직 불러올 수 없어요.');
        if (active) setProfile(p);
      })
      .catch(e => { if (active) setError(errorMessage(e)); });
    return () => { active = false; };
  }, [userId, attempt]);
  const ranks = profile ? profile.medals.map(m => ({
    kind: m.kind,
    key: m.kind + m.start, title: (m.kind === 'MONTH' ? '월간 ' : '학기 ') + m.place + '위',
    period: medalPeriod(m), accent: rankPalette(m)[1], art: <RankPatch medal={m}/>,
    detail: m.achievedOn.replace(/-/g, '.') + ' 달성',
  })) : [];
  const selectedRank = ranks.find(rank => rank.key === selected);
  const items = profile ? earnedItems(profile.badges) : [];
  const picked = items.find(item => item.key === selected);
  const rankButton = (rank: Item, full = false) => <button className="profile-rank" key={rank.key}
    style={{borderTopColor:rank.accent}} aria-label={rank.title + ', ' + rank.period}
    aria-pressed={selected === rank.key} onClick={() => select(selected === rank.key ? undefined : rank.key)}>
    {rank.art}<span>{rank.title}</span>{full && <small>{rank.period}</small>}
  </button>;
  return <dialog ref={dialog} className="riku-dialog member-profile" aria-labelledby={heading}
    onCancel={onClose} onClick={e => { if (e.target === dialog.current) onClose(); }}>
    <div className="profile-body">
      <div className="profile-heading">
      <h2 id={heading}>{profile?.name ?? '프로필'}</h2>
      {ranks.length > 0 && !expanded && <div className="profile-ranks" aria-label="입상 배지">
        {ranks.slice(0, previewLimit).map(rank => rankButton(rank))}
      </div>}
      <button className="dialog-close" onClick={onClose} aria-label="프로필 닫기">×</button>
      </div>
      {ranks.length > previewLimit && <div className="rank-collection">
        <button className="rank-disclosure" aria-expanded={expanded} aria-controls={heading+'-collection'} onClick={()=>{expand(!expanded);select(undefined);}}>
          <span>입상 배지 <b>{ranks.length}</b></span><span>{expanded?'접기':'전체보기'} {expanded?'⌃':'⌄'}</span>
        </button>
        <div id={heading+'-collection'} hidden={!expanded}>{expanded && (['SEMESTER', 'MONTH'] as const).map(kind =>{
          const group=ranks.filter(rank => rank.kind === kind);
          return group.length>0 && <section key={kind}><h3>{kind === 'SEMESTER' ? '학기' : '월간'} <small>{group.length}</small></h3>
            <div className="all-rank-grid">{group.map(r=><div key={r.key}>{rankButton(r,true)}
              {selected===r.key && <small role="status">{r.detail}</small>}
            </div>)}</div></section>;
        })}</div>
      </div>}
      {selectedRank && !expanded && <div className="profile-detail" role="status"><strong>{selectedRank.title}</strong><p>{selectedRank.period} ({selectedRank.detail})</p></div>}
      {error ? <p role="alert">{error} <button onClick={() => retry(i => i + 1)}>다시 시도</button></p>
        : !profile ? <p role="status">불러오는 중…</p>
        : items.length === 0 ? (ranks.length ? null : <p>아직 획득한 배지가 없어요.</p>)
        : <>
          <h3>획득 배지</h3>
          <div className="profile-shelf">{items.map(item =>
            <button key={item.key} aria-label={item.title} aria-pressed={selected === item.key}
              onClick={() => select(selected === item.key ? undefined : item.key)}>
              {item.art}<span>{item.title}</span>
            </button>)}
            {picked && <div className="profile-detail" role="status"
              style={{ gridRow: Math.floor(items.indexOf(picked) / 3) + 2 }}>
              <strong>{picked.title}</strong><p>{picked.detail}</p>
            </div>}
          </div>
        </>}
    </div>
  </dialog>;
}

export function ProfileTrigger({ userId, name, className, children }: {
  userId?: number;
  name: string;
  className: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  if (!userId || !Number.isSafeInteger(userId) || userId < 1) return <span className={className}>{children}</span>;
  return <>
    <button type="button" className={className} aria-haspopup="dialog" aria-label={name + ' 프로필'} onClick={() => setOpen(true)}>
      {children}
    </button>
    {open && createPortal(<MemberProfile key={userId} userId={userId} onClose={() => setOpen(false)} />, document.body)}
  </>;
}

export function ProfileName({ userId, name, editing, photo }: { userId: number; name: string; editing: boolean; photo?: { url?: string | null; size: number } }) {
  const identity = <>{photo && <span aria-hidden="true" className="shrink-0 rounded-full overflow-hidden bg-gray-400 text-white font-bold flex items-center justify-center" style={{ width: photo.size, height: photo.size }}>{photo.url ? <img src={photo.url} alt="" draggable={false} className="w-full h-full object-cover" /> : name.charAt(0)}</span>}{name}</>;
  return <ProfileTrigger userId={editing ? undefined : userId} name={name} className="profile-trigger">{identity}</ProfileTrigger>;
}

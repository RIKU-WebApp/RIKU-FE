import { BadgeDisplayEditor } from './BadgeDisplayEditor';
import { getRankHonors } from './rankHonorsApi';
import { useEffect, useRef, useState } from 'react';
import { Check, ChevronRight, SlidersHorizontal, LockKeyhole, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Header, errorMessage, request } from './shared';
import { collection, earned, type Activity, type Patch, type Progress } from './badgeCollection';
import { minimumTarget } from './badgeCondition';
import { BadgePatch, PendingBadgeOutline } from './BadgePatch';
import { MedalCard, sampleMedals, type RankMedal } from './RankMedals';
import './badgeBook.css';
import './rankMedals.css';

const demo: Progress = {
  visits: 55,
  months: 9,
  kinds: 4,
  leads: 5,
  weekends: 15,
  streak: 3,
  hosted: 1,
  checkins: 26,
  fourSeasons: 2,
  certificateDays: 1,
  byType: { REGULAR: 28, FLASH: 16, TRAINING: 5, EVENT: 6 },
};
const demoDistance: Activity = { verifiedKm: 122, personalKm: 65, badges: [] };
const filters = ['전체', '획득', '미획득'] as const;
const highest = (family: Patch[]) => family.filter(earned).slice(-1)[0];
type BadgeDates = Record<string, {issuedOn: string; activityOn?: string | null}>;
// Sample dates illustrate the detail view. A signed-in member's dates come from the grant ledger.
const sampleTierDates = ['2025-09-04','2025-10-02','2025-11-13','2026-04-09','2026-10-29','2026-11-06'];
const demoDates: BadgeDates = import.meta.env.DEV ? Object.fromEntries(
  collection(demo, demoDistance, true).flat().filter(earned).map(patch => [
    patch.id, {issuedOn: '2026-11-07', activityOn: patch.single ? null : sampleTierDates[patch.grade]},
  ])
) : {};
function dateLabel(day: string, label: string) {
  return <time dateTime={day}>{day.replace(/-/g, '.')} {label}</time>;
}
function Detail({
  family,
  initial,
  close,
  dates, dateError, retryDates,
}: {
  family: Patch[];
  initial: Patch;
  close: () => void;
  dates?: BadgeDates;
  dateError: boolean;
  retryDates: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [active, select] = useState(initial);
  const stamp = dates?.[active.id];
  useEffect(() => {
    const el = ref.current;
    el?.showModal();
    return () => el?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="patch-sheet"
      aria-labelledby="patch-title"
      onCancel={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="patch-sheet-body">
        <button className="sheet-close" onClick={close} aria-label="닫기">
          <X size={21} />
        </button>
        <BadgePatch patch={active} muted={!earned(active)} />
        <span className="patch-state">
          {active.family !== 'certificateDays' && active.tier + ' '}{earned(active) ? '획득' : '미획득'}
        </span>
        <h2 id="patch-title">{active.name}</h2>
        <p>{active.rule}</p>
        {earned(active) && stamp && <small>{dateLabel(stamp.issuedOn, '발급')}</small>}
        {dateError && <small role="status">획득 날짜를 불러오지 못했습니다. <button onClick={retryDates}>다시 시도</button></small>}
        {active.unit && (
          <div className="patch-meter">
            <i style={{ width: Math.min(100, (active.value / active.target) * 100) + '%' }} />
          </div>
        )}
        {family.length > 1 && (
          <div className="level-ladder" aria-label="등급별 달성 조건">
            {family.map((b) => (
              <button key={b.id} aria-pressed={active.id === b.id} onClick={() => select(b)}>
                <span className={'rank-chip rank-' + b.grade} />
                <b>{b.tier}</b>
                <span>
                  {b.condition ?? minimumTarget(b.target, b.unit)}
                  {earned(b) && dates?.[b.id] && <small className="tier-date">
                    {dateLabel(dates[b.id].activityOn ?? dates[b.id].issuedOn, '획득')}
                  </small>}
                </span>
                {earned(b) ? (
                  <Check size={14} aria-label="획득" />
                ) : (
                  <LockKeyhole size={12} aria-label="미획득" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </dialog>
  );
}
export default function AchievementsPage() {
  const [params] = useSearchParams();
  const sample = import.meta.env.DEV && params.get('sample') === '1';
  const [live, setLive] = useState<[Progress, Activity, RankMedal[]]>();
  const [error, setError] = useState('');
  const [attempt, retry] = useState(0);
  const [filter, setFilter] = useState<(typeof filters)[number]>(params.get('filter') === 'earned' ? '획득' : params.get('filter') === 'unearned' ? '미획득' : '전체');
  const medals = sample ? sampleMedals : live?.[2] ?? [];
  const openRegularEditor = params.get('edit') === 'badges';
  const [editing, setEditing] = useState(openRegularEditor);
  const [savingDisplay, setSavingDisplay] = useState(false);
  const editButton = useRef<HTMLButtonElement>(null);
  function closeEditor() {
    setEditing(false);
    requestAnimationFrame(() => editButton.current?.focus({preventScroll: true}));
  }
  const [detail, setDetail] = useState<Patch>();
  const [dates, setDates] = useState<BadgeDates>();
  const [dateError, setDateError] = useState(false);
  const [dateAttempt, retryDates] = useState(0);
  const [loadDates, setLoadDates] = useState(false);
  function showDetail(p: Patch) {
    setDetail(p);
    setLoadDates(true);
  }
  useEffect(() => {
    if (sample || !loadDates) return;
    let current = true;
    setDateError(false);
    request<BadgeDates | undefined>('get', '/user/activity/badge-dates').then(result => {
      if (current) setDates(result ?? {});
    }).catch(() => { if (current) setDateError(true); });
    return () => { current = false; };
  }, [loadDates, sample, dateAttempt]);
  useEffect(() => {
    if (sample) return;
    let active = true;
    setError('');
    Promise.all([
      request<Progress>('get', '/user/activity/badge-progress'),
      request<Activity>('get', '/user/activity/badges'),
      getRankHonors(),
    ])
      .then((r) => {
        if (active) setLive(r);
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      });
    return () => {
      active = false;
    };
  }, [sample, attempt]);
  const data = sample ? ([demo, demoDistance] as const) : live;
  const ready = Boolean(data);
  useEffect(() => {
    if (openRegularEditor && ready) editButton.current?.closest('.badge-toolbar')?.scrollIntoView({ block: 'start' });
  }, [openRegularEditor, ready]);
  const families = data ? collection(data[0], data[1], sample) : [];
  const list = families.flat();
  const count = list.filter(earned).length;
  const next = families
    .map((f) => f.find((p) => !earned(p)))
    .filter((p): p is Patch => !!p)
    .sort((a, b) => b.value / b.target - a.value / a.target)[0];
  const hero = next ?? list[0];
  const selected = families.find((f) => f[0].family === detail?.family);
  const sections = families
    .map((f) => ({
      f,
      card:
        filter === '미획득'
          ? f.find((p) => !earned(p))
          : (highest(f) ?? (filter === '전체' ? f[0] : undefined)),
    }))
    .filter((s) => s.card !== undefined);
  return (
    <main className="riku-page patch-book">
      <Header title="배지 관리" />
      <div className="patch-wrap">
        <div className="patch-page-title">
          <h2>{sample ? '예시 배지첩' : '내 배지첩'}</h2>
        </div>
        {!data ? (
          error ? (
            <div role="alert">
              {error} <button onClick={() => retry(attempt + 1)}>다시 시도</button>
            </div>
          ) : (
            <p role="status">배지를 불러오는 중…</p>
          )
        ) : (
          <>
            <div className="patch-hero">
              <svg
                className="patch-lines"
                aria-hidden="true"
                viewBox="0 0 360 155"
                preserveAspectRatio="xMidYMid slice"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <path
                    key={i}
                    d={
                      'M' +
                      (90 + i * 8) +
                      ' -10 C ' +
                      (165 + i * 8) +
                      ' 36 ' +
                      (160 + i * 8) +
                      ' 64 ' +
                      (210 + i * 8) +
                      ' 73 S ' +
                      (310 + i * 8) +
                      ' 80 ' +
                      (330 + i * 8) +
                      ' 168'
                    }
                  />
                ))}
              </svg>
              <div className="patch-hero-top">
                <span>RIKU RUNNING CLUB</span>
                <span>BADGE BOOK</span>
              </div>
              <div className="patch-hero-main">
                <div>
                  <small>모은 배지</small>
                  <div className="patch-count">
                    <b>{count}</b>
                    <span>/ {list.length}</span>
                  </div>
                </div>
                {hero && (
                  <button
                    className="patch-feature"
                    onClick={() => showDetail(hero)}
                    aria-label={hero.name + (hero.single ? '' : ' ' + hero.tier) + ' 상세'}
                  >
                    <BadgePatch patch={hero} muted={!earned(hero)} />
                  </button>
                )}
              </div>
              {hero && (
                <button className="patch-next" onClick={() => showDetail(hero)}>
                  <span>{next ? '다음 배지' : '획득한 배지'}</span>
                  <strong>
                    {hero.name}{!hero.single && ' ' + hero.tier}
                  </strong>
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
            <div className="badge-toolbar">
              <nav className="patch-filters" aria-label="배지 필터">
                {filters.map(f => <button key={f} aria-pressed={filter === f} disabled={savingDisplay}
                  onClick={() => { setFilter(f); setEditing(false); }}>{f}</button>)}
              </nav>
              <button ref={editButton} type="button" className="showcase-toggle" aria-expanded={editing}
                aria-controls="badge-display-panel" disabled={savingDisplay} onClick={() => setEditing(open => !open)}>
                <SlidersHorizontal size={14} aria-hidden="true"/>대표 배지 편집
              </button>
            </div>
            <div id="badge-display-panel" hidden={!editing}>
              {editing && <BadgeDisplayEditor families={families} medals={medals} sample={sample} initialGroup={openRegularEditor ? 'badges' : undefined}
                saving={savingDisplay} setSaving={setSavingDisplay} close={closeEditor}/>}
            </div>
            <div className="patch-grid">
              {filter !== '미획득' && medals.map(m => <MedalCard key={m.kind+m.start} medal={m}/>)}
              {sections.map(({ f, card }) => {
                const p = card!;
                return (
                  <button
                    key={p.family}
                    className={'patch-tile ' + (earned(p) ? 'won' : 'locked')}
                    onClick={() => showDetail(p)}
                  >
                    <BadgePatch patch={p} muted={!earned(p)} />
                    <strong>{p.name}</strong>
                    <small>
                      {earned(p) ? (
                        <span className={'rank-chip '+(p.single?'rank-single':'rank-'+p.grade)} />
                      ) : (
                        <LockKeyhole size={11} />
                      )}{' '}
                      {f.length === 1 ? (earned(p) ? '획득' : '미획득') : (earned(p) ? '보유 ' : '다음 목표 ') + p.tier}
                    </small>
                      <span
                        className="rank-steps"
                        aria-label={f.filter(earned).length + ' / ' + f.length + '단계 획득'}
                      >
                        {f.map((b) => (
                          <i key={b.id} className={earned(b) ? (b.single?'rank-single':'rank-' + b.grade) : ''} />
                        ))}
                      </span>
                  </button>
                );
              })}
              {filter !== '획득' && <div className="patch-tile locked">
                <PendingBadgeOutline />
                <strong>마라톤 관련</strong>
                <small>준비 중</small>
              </div>}
            </div>
            {!sections.length && filter === '획득' && !medals.length && (
              <p className="patch-empty">
                {filter === '획득' ? '아직 획득한 배지가 없어요.' : '모든 배지를 모았어요.'}
              </p>
            )}
          </>
        )}
      </div>
      {detail && selected && (
        <Detail family={selected} initial={detail} close={() => setDetail(undefined)}
          dates={sample ? demoDates : dates} dateError={dateError} retryDates={() => retryDates(n => n + 1)} />
      )}
    </main>
  );
}

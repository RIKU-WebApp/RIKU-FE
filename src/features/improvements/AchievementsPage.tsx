import { useEffect, useRef, useState } from 'react';
import { Check, ChevronRight, LockKeyhole, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Header, errorMessage, request } from './shared';
import { collection, earned, type Activity, type Patch, type Progress } from './badgeCollection';
import { BadgePatch } from './BadgePatch';
import { MedalCard, sampleMedals } from './RankMedals';
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
  bestMonthlyRank: 3,
  certificateDays: 0,
  byType: { REGULAR: 28, FLASH: 16, TRAINING: 5, EVENT: 6 },
};
const demoDistance: Activity = { verifiedKm: 122, personalKm: 65, badges: [] };
const filters = ['전체', '획득', '미획득'] as const;
const fmt = (v: number) => v.toLocaleString('ko-KR', { maximumFractionDigits: 1 });
const highest = (family: Patch[]) => family.filter(earned).slice(-1)[0];
function Detail({
  family,
  initial,
  close,
}: {
  family: Patch[];
  initial: Patch;
  close: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [active, select] = useState(initial);
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
        <BadgePatch patch={active} />
        <span className="patch-state">
          {active.tier} {earned(active) ? '획득' : '미획득'}
        </span>
        <h2 id="patch-title">{active.name}</h2>
        <p>{active.rule}</p>
        {active.standing && <small>{active.standing} / 목표 {active.condition}</small>}
        {active.unit && (
          <>
            <div className="patch-meter">
              <i style={{ width: Math.min(100, (active.value / active.target) * 100) + '%' }} />
            </div>
            <small>
              내 기록 {fmt(active.value)}
              {active.unit === 'km' ? ' ' : ''}
              {active.unit} / 목표 {fmt(active.target)}
              {active.unit === 'km' ? ' ' : ''}
              {active.unit}
            </small>
          </>
        )}
        {family.length > 1 && (
          <div className="level-ladder" aria-label="등급별 달성 조건">
            {family.map((b) => (
              <button key={b.id} aria-pressed={active.id === b.id} onClick={() => select(b)}>
                <span className={'rank-chip rank-' + b.grade} />
                <b>{b.tier}</b>
                <span>
                  {b.condition ?? (fmt(b.target) + ' ' + b.unit)}
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
  const [params, setParams] = useSearchParams();
  const sample = import.meta.env.DEV && params.get('sample') === '1';
  const [live, setLive] = useState<[Progress, Activity]>();
  const [error, setError] = useState('');
  const [attempt, retry] = useState(0);
  const [filter, setFilter] = useState<(typeof filters)[number]>(params.get('filter')==='earned'?'획득':'전체');
  const medals = sample ? sampleMedals : [];
  const [detail, setDetail] = useState<Patch>();
  useEffect(() => {
    if (sample) return;
    let active = true;
    setError('');
    Promise.all([
      request<Progress>('get', '/user/activity/badge-progress'),
      request<Activity>('get', '/user/activity/badges'),
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
  if(filter==='획득'){
    const priority=(p:Patch)=>p.grade===5 || p.single ? 0 : 1;
    sections.sort((a,b)=>priority(a.card!)-priority(b.card!));
  }
  return (
    <main className="riku-page patch-book">
      <Header title="배지 관리" back="/record/archive" />
      <div className="patch-wrap">
        <div className="patch-page-title">
          <h2>{sample ? '예시 배지첩' : '내 배지첩'}</h2>
          {import.meta.env.DEV && (
            <button
              onClick={() => {
                setParams(sample ? {} : { sample: '1' }, { replace: true });
                setFilter('전체');
                setDetail(undefined);
              }}
            >
              {sample ? '내 배지 보기' : '예시 보기'} <ChevronRight size={14} />
            </button>
          )}
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
                    onClick={() => setDetail(hero)}
                    aria-label={hero.name + ' ' + hero.tier + ' 상세'}
                  >
                    <BadgePatch patch={hero} />
                  </button>
                )}
              </div>
              {hero && (
                <button className="patch-next" onClick={() => setDetail(hero)}>
                  <span>{next ? '다음 배지' : '획득한 배지'}</span>
                  <strong>
                    {hero.name} {hero.tier}
                  </strong>
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
            <nav className="patch-filters" aria-label="배지 필터">
              {filters.map((f) => (
                <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}>
                  {f}
                </button>
              ))}
            </nav>
            {filter==='획득' && medals.length>0 && <section className="honor-shelf">
              <h3>입상 기록</h3><div className="patch-grid">{medals.map(m=>
                <MedalCard key={m.kind+m.start} medal={m}/>)}</div>
            </section>}
            <div className="patch-grid">
              {sections.map(({ f, card }) => {
                const p = card!;
                return (
                  <button
                    key={p.family}
                    className={'patch-tile ' + (earned(p) ? 'won' : 'locked')}
                    onClick={() => setDetail(p)}
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
                    {f.length === 1 && <span className="patch-cap">단일 배지</span>}
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
            </div>
            {!sections.length && !(filter==='획득' && medals.length) && (
              <p className="patch-empty">
                {filter === '획득' ? '아직 획득한 배지가 없어요.' : '모든 배지를 모았어요.'}
              </p>
            )}
          </>
        )}
      </div>
      {detail && selected && (
        <Detail family={selected} initial={detail} close={() => setDetail(undefined)} />
      )}
    </main>
  );
}

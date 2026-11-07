import type { Patch, Motif } from './badgeCollection';
import { useId, type ReactNode } from 'react';
const frames: Partial<Record<Motif, string>> = {
  track:
    'M50 5C66 5 84 14 90 28L94 53Q95 72 78 84L59 95Q50 100 41 95L22 84Q5 72 6 53L10 28C16 14 34 5 50 5Z',
  summit:
    'M43 9Q50 5 57 9L88 28Q93 31 93 38V69Q93 75 87 79L57 95Q50 99 43 95L13 79Q7 75 7 69V38Q7 31 12 28Z',
  compass: 'M50 5A45 45 0 1 1 49.99 5Z',
  flag: 'M10 18Q50 -1 90 18V56Q89 80 50 97Q11 80 10 56Z',
  road: 'M8 50A42 42 0 0 1 92 50V78Q92 88 82 88H18Q8 88 8 78Z',
  star: 'M50 5L61 12L75 12L81 24L92 31L91 45L96 57L87 68L84 82L70 85L59 95L46 91L32 94L23 83L10 77L11 63L4 50L10 37L10 24L24 19L33 9Z',
};
export const metals = [
  ['#773e2e', '#d89366', '#ffe1bd'],
  ['#465568', '#a7b9c9', '#f1f4ed'],
  ['#705516', '#e9bf55', '#ffedb1'],
  ['#1f625e', '#83d6bb', '#e7fff1'],
  ['#37457d', '#95c9fc', '#edf2ff'],
  ['#5b366d', '#e9b3e9', '#fff1da'],
];
function Mark({ m, light, accent }: { m: Motif; light: string; accent: string }) {
  const common = {
    stroke: light,
    strokeWidth: 2.7,
    fill: 'none',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  const drawings: Partial<Record<Motif, React.ReactNode>> = {
    stadium: (
      <g {...common}>
        <path d="M25 62h50M30 61V42l9 6V37l11 9 11-9v11l9-6v19" />
        <path d="M36 55h28m-25 7 3-6m14 6 3-6" />
      </g>
    ),
    bolt: <path d="m56 25-25 30h18l-5 18 27-36H53z" fill={accent} />,
    ticket: (
      <g transform="rotate(-18 50 50)">
        <path d="M24 35h52v10q-9 1-1 10v9H24v-9q8-6 0-11z" />
        <path d="M60 36v26" strokeDasharray="2 4" />
        <path d="m41 42 2 5 6 1-5 4 1 5-5-3-5 3 1-6-4-3 6-1z" fill={accent} />
      </g>
    ),
    calendar: (
      <>
        <rect x="29" y="32" width="42" height="36" rx="5" />
        <path d="M29 42h42M39 28v8m20-8v8m-20 15 7 7 12-13" />
      </>
    ),
    chain: (
      <g transform="rotate(-40 50 50)">
        <rect x="24" y="41" width="31" height="18" rx="9" />
        <rect x="46" y="41" width="31" height="18" rx="9" />
        <path d="M42 50h16" />
      </g>
    ),
    sun: (
      <>
        <path d="M25 57h50m-43 6h37m-30 6h23" />
        <path d="M35 52a15 15 0 0 1 30 0" fill={accent} />
        <path d="M50 25v6m-19 2 5 5m29-5-5 5m-36 9 6 1m40-1 6-1" />
      </>
    ),
    camp: (
      <>
        <path d="m25 65 25-36 25 36z" />
        <path d="m40 65 10-17 10 17z" fill={accent} />
        <path d="M50 30V21l14 5-14 4" />
      </>
    ),
    shoe: (
      <g transform="rotate(-12 50 50)">
        <path d="M24 44l9 4 6-8 14 13 14 3q9 2 9 10H24z" fill={accent} />
        <path d="M24 61h51m-30-15-4 5m10-1-4 5" />
      </g>
    ),
  };
  if (drawings[m]) return <g {...common}>{drawings[m]}</g>;
  if (m === 'track')
    return (
      <g transform="rotate(-19 50 50)" {...common}>
        <rect x="21" y="34" width="58" height="31" rx="15.5" />
        <rect x="26" y="39" width="48" height="21" rx="10.5" />
        <rect x="31" y="44" width="38" height="11" rx="5.5" fill={accent} stroke="none" />
        <path d="M52 34v9m5-9v9" />
      </g>
    );
  if (m === 'summit')
    return (
      <g {...common}>
        <circle cx="63" cy="37" r="7" fill={accent} stroke="none" />
        <path d="M19 64l20-28 10 13 7-9 24 24H19z" />
        <path d="m32 46 7 3 5-6m-8 20 14-15m-5 15 10-9" />
      </g>
    );
  if (m === 'compass')
    return (
      <g {...common}>
        <circle cx="50" cy="50" r="21" strokeDasharray="2 4" />
        <path d="m66 31-9 25-24 14 10-26z" fill={light} />
        <path d="m65 32-15 18-7-5z" fill={accent} stroke="none" />
        <path d="m34 69 16-19 6 6z" fill="#334b51" stroke="none" />
      </g>
    );
  if (m === 'flag')
    return (
      <g {...common}>
        <path d="m34 70 9-43" />
        <path d="M43 30c12-8 17 9 31 1l-5 20c-13 7-19-10-31-2z" fill={accent} />
        <path d="m44 34-2 7m17-6-2 8m10-5-2 8" strokeWidth="4" />
        <path d="M26 70h17" />
      </g>
    );
  if (m === 'road')
    return (
      <g {...common}>
        <path d="M17 53l15-16 10 9 11-17 25 25" />
        <path d="M55 51c-33 7 23 7-18 20h16c35-15-11-13 8-20z" fill={accent} stroke="none" />
        <circle cx="69" cy="33" r="5" fill={light} stroke="none" />
      </g>
    );
  return (
    <path
      d="m50 26 7 14 16 3-12 12 3 16-14-8-15 8 3-16-12-12 17-3z"
      fill={accent}
      stroke={light}
      strokeWidth="3"
    />
  );
}
const semesterShield = 'M10 18Q50 -1 90 18V69Q90 90 50 108Q10 90 10 69Z';

export function PatchFrame({motif:m, palette:[base, accent, light], rankFrame, children}:{
  motif: Motif; palette: string[]; rankFrame?: "monthly" | "semester"; children: ReactNode;
}) {
  const metal = useId().replace(/:/g, '');
  const semester = rankFrame === "semester";
  const frame = semester ? semesterShield : frames[m] ??
    (m === 'bolt' || m === 'shoe'
      ? frames.track
      : m === 'ticket' || m === 'calendar'
        ? frames.road
        : frames.summit);
  return (
    <svg aria-hidden="true" focusable="false"
      viewBox={semester ? "-8.5 -2 117 119.34" : rankFrame ? "-3.5 -3.2 107 109.14" : "0 0 100 102"}
      className="patch-art">
      <defs>
        <linearGradient id={metal} x2="1" y2="1" gradientUnits="objectBoundingBox">
          <stop stopColor={light} />
          <stop offset=".35" stopColor={accent} />
          <stop offset=".56" stopColor={light} />
          <stop offset="1" stopColor={accent} />
        </linearGradient>
      </defs>
      {rankFrame && <path d={frame} transform="translate(-3.5 -3.5) scale(1.07)" fill="none"
        stroke={base} strokeWidth="1.65" strokeLinejoin="round"/>}
      <path d={frame} fill={'url(#' + metal + ')'} stroke={base} strokeWidth="1.4" />
      <path d={frame} transform="translate(4.5 4.5) scale(.91)" fill={base} />
      <path
        d={frame}
        transform="translate(7 7) scale(.86)"
        fill="none"
        stroke={light}
        strokeWidth="1"
        strokeDasharray="2.4 2.6"
        opacity=".78"
      />
      {children}
    </svg>
  );
}

export function BadgePatch({ patch, muted = false }: { patch: Pick<Patch,'motif'|'grade'|'single'>; muted?: boolean }) {
  const { motif: m, grade } = patch;
  const [base, accent, light] = muted
    ? ['#657166', '#b8beab', '#e5e8d9']
    : patch.single ? ['#220e09','#ee321b','#ffd2b4'] : metals[grade];
  return (
    <PatchFrame motif={m} palette={[base,accent,light]}>
      {grade >= 3 && <path d="m46 21 4-5 4 5-4 4z" fill={light} />}
      <Mark m={m} light={light} accent={accent} />
      {patch.single && <path d="m36 18 14 5 14-5-14 10z" fill={muted ? accent : '#ff3921'}/>}
      {Array.from({ length: grade + 1 }, (_, i) => (
        <path
          key={i}
          d="m0 -2 2 2-2 2-2-2z"
          transform={'translate(' + (50 + (i - grade / 2) * 6) + ' 76)'}
          fill={accent}
        />
      ))}
    </PatchFrame>
  );
}

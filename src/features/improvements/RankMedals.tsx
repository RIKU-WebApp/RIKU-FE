import { type CSSProperties, type ReactNode } from 'react';
import {rankSeason, SeasonMark} from './rankSeasons';
import { PatchFrame, metals } from './BadgePatch';

export type RankMedal = {kind:'MONTH'|'SEMESTER';start:string;achievedOn:string;place:number};


export const sampleMedals: RankMedal[] = [
  {kind:'SEMESTER',start:'2025-09-01',achievedOn:'2026-03-01',place:2},
  {kind:'MONTH',start:'2026-10-01',achievedOn:'2026-10-31',place:1},
  {kind:'MONTH',start:'2026-09-01',achievedOn:'2026-09-30',place:3},
];

export function medalPeriod(m:RankMedal) {
  const [year,month]=m.start.split('-').map(Number);
  return m.kind==='MONTH' ? year+'년 '+month+'월' : year+'년 '+(month<8?1:2)+'학기';
}
// Draw the bib numbers as paths so they keep the same proportions in the offline catalog.
const digits: Record<number,string> = {
  1: 'M40 39l11-8v34m-11 0h22',
  2: 'M37 38l6-7h15l6 6v8L37 64v1h27',
  3: 'M37 31h25L47 47h9l8 7v5l-7 6H37',
};

function SemesterStar({accent,light}:{accent:string;light:string}) {
  return <g transform="translate(0 -2)" strokeLinejoin="round">
    <path d="m50 13 2.8 5.5 6 .9-4.4 4.2 1.1 5.9-5.5-3-5.5 3 1.1-5.9-4.4-4.2 6-.9z"
      fill={light} stroke={accent} strokeWidth="1.2"/>
    <path d="m35 21-3-1m5-2-2-2m30 5 3-1m-5-2 2-2" fill="none" stroke={accent} strokeWidth="1.6" strokeLinecap="round"/>
  </g>;
}

function PeriodStamp({medal, ink, base}:{medal:RankMedal;ink:string;base:string}){
  const [year,month]=medal.start.split('-');
  const semester=medal.kind==='SEMESTER';
  const period=semester ? (Number(month)<8?'S1':'S2') : month;
  const y=semester ? 88 : 82;
  return <g>
    {!semester && <rect x="29" y={y-11} width="42" height="14" rx="4" fill={base}/>}
    <text fill={ink} fontFamily="system-ui,sans-serif" fontSize={semester ? 16 : 13.5} fontWeight="700"
      style={{fontVariantNumeric:'tabular-nums'}} y={y}>
      <tspan x="47.5" textAnchor="end">{year.slice(-2)}</tspan>{' '}
      <tspan x="52.5" textAnchor="start">{period}</tspan>
    </text>
  </g>;
}

export function rankPalette(medal: RankMedal) {
  return metals[(medal.kind === 'SEMESTER' ? 6 : 3) - medal.place];
}

// Monthly patches share their term's edge motif. Keep the number and date area clear.
const termMarks = [
  'M20 55q7-6 11-21q-12 4-11 21Zm0 0 8-15', // leaf
  'm20 38 10 6-10 6m0 0 10 6-10 6',          // switchbacks
  'M21 59V39l10-5v14l-10 5m1-8 8-4',         // pennant
  'M19 54q1-12 6-8t6-10m-12 25q1-12 6-8t6-10', // waves
];

export function LegacyTermMark({medal, accent}: {medal: RankMedal; accent: string}) {
  const [year, month] = medal.start.split('-').map(Number);
  const schoolYear = month < 3 ? year - 1 : year;
  const secondTerm = month >= 9 || month < 3;
  const index = (schoolYear * 2 + Number(secondTerm)) % termMarks.length;
  return <g fill="none" stroke={accent} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d={termMarks[index]}/><path d={termMarks[index]} transform="translate(100 0) scale(-1 1)"/>
  </g>;
}

export function RankPatch({medal, stamped=true, edgeDetail}:{medal:RankMedal;stamped?:boolean;edgeDetail?:ReactNode}) {
  const semester = medal.kind === 'SEMESTER';
  const palette = rankPalette(medal);
  const [base,accent,light] = palette;
  return <PatchFrame motif={semester?'flag':'track'} palette={palette} rankFrame={semester?'semester':'monthly'}>
      {semester ? <>
        <SemesterStar accent={accent} light={light}/>
        <path d={stamped?"m28 66 9 5-1 3-8-5zm44 0-9 5 1 3 8-5z":"m26 65 24 13 24-13v5L50 83 26 70z"} fill={accent}/>
        {!stamped && <path d="m38 80 12 7 12-7" stroke={light} strokeWidth="1.5" fill="none"/>}
      </> : <g stroke={accent} fill="none" transform="rotate(-12 50 50)">
        <rect x="16" y="24" width="68" height="51" rx="23" strokeWidth="2.2"/>
        <path d="M21 42q3-14 18-15h18m22 31q-4 14-19 14H42" strokeWidth="1.3"/>
        <path d="m34 24 .5 5m4-6 .5 5" stroke={light} strokeWidth="2"/>
      </g>}
      {edgeDetail ?? (rankSeason(medal) ? <SeasonMark medal={medal} accent={accent} light={light}/> : <LegacyTermMark medal={medal} accent={accent}/>)}
      <path d={digits[medal.place]} transform={stamped?'translate(0 -1.5)':semester?'translate(0 2)':undefined}
        fill="none" stroke={light} strokeWidth="6.3" strokeLinecap="square" strokeLinejoin="bevel"/>
      {stamped && <PeriodStamp medal={medal} ink={light} base={base}/>}
      {!semester && !stamped && <path d="M43 82h14" stroke={accent} strokeWidth="2"/>}
    </PatchFrame>;
}

export function MedalCard({medal, stamped=true}:{medal:RankMedal;stamped?:boolean}) {
  const semester = medal.kind === 'SEMESTER';
  return <div className="honor-card" style={{'--edge':rankPalette(medal)[1]} as CSSProperties}>
    <RankPatch medal={medal} stamped={stamped}/>
    <strong>{semester?'학기':'월간'} {medal.place}위</strong>
    <span>{medalPeriod(medal)}</span>
    <small><time dateTime={medal.achievedOn}>{medal.achievedOn.replace(/-/g,'.')}</time> 달성</small>
  </div>;
}

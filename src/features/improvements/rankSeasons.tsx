import type {RankMedal} from './RankMedals';

// These are artwork seasons. Future seasons here are not settlement dates.
export const rankSeasons = [
  {term:'25 S2',start:'2025-09-01',month:'2025-09-01',name:'첫 출발',note:'첫 학기 기록을 알리는 스타트 깃발.'},
  {term:'26 S1',start:'2026-03-02',month:'2026-03-01',name:'봄 트랙',note:'크기가 다른 두 잎이 나란히 돋는 봄.'},
  {term:'26 S2',start:'2026-08-31',month:'2026-09-01',name:'억새',note:'바람에 휘어진 줄기와 은빛 이삭.'},
] as const;

export function rankSeason(m:RankMedal){
  // A monthly podium represents the entire month. August 2026 stays a spring
  // season edition; the semester podium starting on Aug 31 gets the fall motif.
  const key=m.kind==='MONTH'?'month':'start';
  return [...rankSeasons].reverse().find(s=>m.start>=s[key]);
}

export function SeasonMark({medal,accent,light}:{medal:RankMedal;accent:string;light:string}){
  const s=rankSeason(medal);
  if(!s)return null;
  const art={
    '26 S2':<g>
      <path d="M19 61Q21 47 32 34M21 60q4-8 10-11" fill="none" stroke={accent} strokeWidth="1.9" strokeLinecap="round"/>
      <path d="M21 51q-1-7 3-12l.2 5q1-6 6-10l-1.1 4.5 5-5q-1.8 7-6.1 10l3.6-1.2q-3 6-10.7 9.7Z" fill={light}/>
      <path d="M23 56q1-9 11-12-2 8-11 12Z" fill={accent}/>
    </g>,
    '25 S2':<g transform="translate(26 49) scale(.97) translate(-26 -49)"><path d="M19.5 61V37" fill="none" stroke={accent} strokeWidth="2.8"/><path d="M21 37c5-4 7 3 13-1l-3 10c-4 4-6-3-10 0Z" fill={light}/></g>,
    '26 S1':<><path d="M20 55q-2-15 11-21 1 13-11 21Z" fill={accent}/><path d="M22 61q1-9 11-11-2 8-11 11Z" fill={light}/></>,
  }[s.term];
  return <g>{art}<g transform="translate(100 0) scale(-1 1)">{art}</g></g>;
}

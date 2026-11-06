import type { Badge } from './shared';
import definitions from './badgeSeries.json';
export type Motif =
  | 'track'
  | 'summit'
  | 'compass'
  | 'flag'
  | 'road'
  | 'star'
  | 'bolt'
  | 'ticket'
  | 'calendar'
  | 'chain'
  | 'sun'
  | 'camp'
  | 'shoe'
  | 'stadium';
export interface Progress {
  visits: number;
  months: number;
  kinds: number;
  leads: number;
  weekends: number;
  streak: number;
  hosted: number;
  checkins: number;
  fourSeasons: number;
  certificateDays: number;
  bestMonthlyRank: number | null;
  byType: Record<string, number>;
}
export interface Activity {
  verifiedKm: number;
  personalKm: number;
  badges: Badge[];
}
export interface Patch {
  id: string;
  family: string;
  name: string;
  motif: Motif;
  target: number;
  value: number;
  unit: string;
  rule: string;
  grade: number;
  single?: boolean;
  granted?: boolean;
  tier: string;
  condition?: string;
  standing?: string;
}
export const earned = (p: Patch) => p.granted ?? (p.value >= p.target);
export function collection(p: Progress, a: Activity, sample=false): Patch[][] {
  const values: Record<string, number> = {
    ...p.byType,
    visits: p.visits,
    months: p.months,
    kinds: p.kinds,
    leads: p.leads,
    weekends: p.weekends,
    streak: p.streak,
    hosted: p.hosted,
    verifiedKm: Number(a.verifiedKm),
    personalKm: Number(a.personalKm),
    checkins: p.checkins,
    fourSeasons: p.fourSeasons,
    certificateDays: p.certificateDays,
    monthlyRank: p.bestMonthlyRank && p.bestMonthlyRank > 0 && p.bestMonthlyRank <= 10 ? (p.bestMonthlyRank===1?3:p.bestMonthlyRank<=3?2:1) : 0,
  };
  const known = new Set<string>();
  const granted = new Set(a.badges.map((b) => b.code));
  const series = definitions.map((d) =>
    d.levels.map((target, i) => {
      const id = (d.prefix ?? d.id) + '_' + target;
      known.add(id);
      return {
        id,
        family: d.id,
        name: d.name,
        motif: d.motif as Motif,
        target,
        value: values[d.id] ?? 0,
        unit: d.unit,
        rule: d.rule,
        grade: i,
        single: d.levels.length === 1,
        granted: sample ? undefined : granted.has(id),
        tier: d.tiers[i],
        condition: d.conditions?.[i],
        standing: d.id === 'monthlyRank' ? (p.bestMonthlyRank ? '월간 최고 '+p.bestMonthlyRank+'위' : '집계된 월간 순위 없음') : undefined,
      };
    })
  );
  for (const b of a.badges.filter((b) => !known.has(b.code)))
    series.push([
      {
        id: b.code,
        family: b.code,
        name: b.name,
        motif: 'star',
        target: 1,
        value: 1,
        unit: '',
        rule: b.description,
        grade: 0,
        single: true,
        granted: true,
        tier: b.source === 'ADMIN' ? '운영진 수여' : '획득',
        condition: undefined,
        standing: undefined,
      },
    ]);
  return series;
}

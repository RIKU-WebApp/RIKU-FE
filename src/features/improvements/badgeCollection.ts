import { badgeCondition } from './badgeCondition';
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
  seasonVisits?: number[];
  certificateDays: number;
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
    // Personal mileage is paused. Keep previously issued tiers, never infer them from distance.
    checkins: p.checkins,
    fourSeasons: p.fourSeasons,
    certificateDays: p.certificateDays,
  };
  const known = new Set<string>();
  const granted = new Set(a.badges.map((b) => b.code));
  const series = definitions.filter(d => d.id !== 'monthlyRank').map((d) =>
    d.levels.map((target, i) => {
      const id = (d.prefix ?? d.id) + '_' + target;
      known.add(id);
      let achieved = values[d.id] ?? 0, goal = target;
      if (i >= 3 && d.id === 'kinds') {
        const needs = i === 3 ? [3,3,2,2] : [15,15,6,6];
        achieved = ['REGULAR','FLASH','TRAINING','EVENT'].reduce((n,k,j) => n + Math.min(p.byType[k] ?? 0, needs[j]), 0);
        goal = needs.reduce((a,b) => a+b, 0);
      } else if (i >= 3 && d.id === 'fourSeasons') {
        const need = i === 3 ? 2 : 5;
        achieved = (p.seasonVisits ?? []).reduce((sum,n) => sum + Math.min(n,need), 0);
        goal = 4 * need;
      }
      return {
        id,
        family: d.id,
        name: d.name,
        motif: d.motif as Motif,
        target: goal,
        value: d.id === 'personalKm' ? (granted.has(id) ? goal : 0) : achieved,
        unit: d.unit,
        rule: badgeCondition(d, i),
        grade: i,
        single: d.levels.length === 1,
        granted: sample ? undefined : granted.has(id),
        tier: d.tiers[i],
        condition: d.conditions?.[i],
      };
    }).filter(patch => patch.family !== 'personalKm' || granted.has(patch.id))
  ).filter(family => family.length > 0);
  for (const b of a.badges.filter((b) => !known.has(b.code) && !b.code.startsWith('monthlyRank_')))
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
      },
    ]);
  return series;
}

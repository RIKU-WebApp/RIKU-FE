import { request } from './shared';
import type { RankMedal } from './RankMedals';

export async function getRankHonors(): Promise<RankMedal[]> {
  // The API omits result when a successful collection is empty.
  return (await request<RankMedal[] | null | undefined>('get', '/user/activity/rank-honors')) ?? [];
}

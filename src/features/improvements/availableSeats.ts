interface SeatGroup { name: string; capacity?: number | null }

export function availableSeats(capacity: number | null, groups: SeatGroup[], used: Record<string, number>) {
  const remaining = (limit: number | null | undefined, count: number) =>
    limit == null ? Infinity : Math.max(0, limit - count);
  const totalUsed = Object.values(used).reduce((sum, count) => sum + count, 0);
  const byGroup = new Map(groups.map(g => [g.name, remaining(g.capacity, used[g.name] ?? 0)]));
  const groupSeats = groups.length ? [...byGroup.values()].reduce((sum, count) => sum + count, 0) : Infinity;
  const total = Math.min(remaining(capacity, totalUsed), groupSeats);
  const forGroup = (name: string) => Math.min(total, byGroup.get(name) ?? Infinity);
  return { total, forGroup };
}

export function seatsLabel(count: number) {
  if (count === Infinity) return '제한 없음';
  return count === 0 ? '대기 신청' : `${count}자리 남음`;
}

export function totalLabel(total?: number) {
  if (total === undefined || total === Infinity) return '';
  return total === 0 ? '전체 마감' : `전체 ${total}자리 남음`;
}


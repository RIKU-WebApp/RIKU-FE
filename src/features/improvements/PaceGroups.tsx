export interface PacePlan { name: string; pace: string; distanceKm: number; capacity?: number | null }
export interface GroupRow { id: string; pace: string; distance: string; capacity?: string }

export function nextGroup(rows: GroupRow[]) {
  return 'ABCDEFGHIJKLMNOPQRST'.split('').find(id => !rows.some(row => row.id === id));
}
export function fromPlan(plan: PacePlan): GroupRow {
  return { id: plan.name, pace: plan.pace, distance: String(plan.distanceKm), capacity: String(plan.capacity ?? '') };
}
export function makePlans(rows: GroupRow[]): PacePlan[] {
  return rows.map(row => {
    const capacity = row.capacity ? Number(row.capacity) : null;
    const distanceKm = parseFloat(row.distance);
    if (!/^\d{1,2}:[0-5]\d$/.test(row.pace) || !Number.isFinite(distanceKm) || distanceKm < 0.1 || distanceKm > 200 ||
        (capacity !== null && (!Number.isInteger(capacity) || capacity < 1 || capacity > 1000))) {
      throw new Error(row.id + '그룹의 페이스, 거리, 정원을 확인해주세요.');
    }
    return { name: row.id, pace: row.pace, distanceKm, capacity };
  });
}
export function appendPlans(data: FormData, rows: GroupRow[]) {
  data.set('replaceGroups', 'true');
  makePlans(rows).forEach((plan, index) => {
    Object.entries(plan).forEach(([key, value]) => {
      if (value != null) data.set('groupPlans[' + index + '].' + key, String(value));
    });
  });
}
export function CapacityNote() {
  return <p className="mt-2 text-xs text-gray-500">그룹에 자리가 있어도 총정원이 차면 대기 신청됩니다.</p>;
}

export function GroupLimit({ row, onChange }: { row: GroupRow; onChange: (s: string) => void }) {
  return <input aria-label={row.id + '그룹 정원'} type="number" min={1} max={1000}
    className="w-14 rounded border p-1 text-center" placeholder="제한 없음" value={row.capacity ?? ''} onChange={e => onChange(e.target.value)} />;
}
export function PaceGroups({ rows, onChange }: { rows: GroupRow[]; onChange: (r: GroupRow[]) => void }) {
  const next = nextGroup(rows);
  const update = (id: string, field: keyof GroupRow, value: string) =>
    onChange(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
  return <section className="my-4">
    {rows.length > 0 && <table className="w-full text-center text-sm"><thead><tr>
      <th>그룹</th><th>거리(km)</th><th>페이스</th><th>정원</th><th />
    </tr></thead><tbody>{rows.map(row => <tr key={row.id} className="border-b">
      <td>{row.id}</td><td><input aria-label={row.id + '그룹 거리'} className="w-14 text-center" type="number" min="0.1" step="0.1" value={row.distance} onChange={e => update(row.id,'distance', e.target.value)} /></td>
      <td><input aria-label={row.id + '그룹 페이스'} className="w-14 text-center" placeholder="6:00" value={row.pace} onChange={e => update(row.id,'pace',e.target.value)} /></td>
      <td><GroupLimit row={row} onChange={v => update(row.id,'capacity',v)} /></td>
      <td><button type="button" aria-label={row.id + '그룹 삭제'} onClick={() => onChange(rows.filter(r => r.id !== row.id))}>×</button></td>
    </tr>)}</tbody></table>}
    <button type="button" disabled={!next} className="mt-2 w-full rounded-lg border py-2" onClick={() => next && onChange([...rows,{id:next,distance:'',pace:''}])}>그룹 추가</button>
    <CapacityNote />
  </section>;
}

import { availableSeats } from './availableSeats';
import { TotalCapacityInput } from './TotalCapacityInput';
import { PaceGroups, fromPlan, appendPlans, type GroupRow, type PacePlan } from './PaceGroups';
import { useEffect, useState } from 'react';
import { request, errorMessage } from './shared';

type Type = 'flash' | 'event' | 'training';
interface Queue { capacity: number | null; waiting: string[]; mine: boolean; groups: PacePlan[]; usedByGroup?: Record<string, number>; waitingByGroup?: Record<string, number> }
const path = (type: Type, id: string | number) => '/run/' + type + '/post/' + id + '/waitlist';

export function useRunQueue(type: Type, id: string | number | undefined, tab: string) {
  const [queue, setQueue] = useState<Queue>();
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    async function load() {
      if (!id) return;
      try {
        const result = await request<Queue>('get', path(type, id));
        if (active) { setQueue(result); setError(''); }
      } catch (e) { if (active) setError(errorMessage(e)); }
    }
    void load();
    window.addEventListener('focus', load);
    return () => { active = false; window.removeEventListener('focus', load); };
  }, [type, id, tab]);
  async function leave() {
    if (!id) return;
    try { await request('delete', path(type, id) + '/me'); window.location.reload(); }
    catch (e) { setError(errorMessage(e)); }
  }
  const seats = queue?.usedByGroup ? availableSeats(queue.capacity, queue.groups, queue.usedByGroup) : undefined;
  return { queue, leave, error, seats };
}

export function WaitingNames({ names }: { names?: string[] }) {
  if (!names?.length) return null;
  return <section className="mx-auto w-full max-w-[335px] py-4 text-left">
    <h3 className="mb-2 font-semibold">대기명단</h3>
    <ol>{names.map((name, i) => <li key={i} className="py-1">{name}</li>)}</ol>
  </section>;
}

export function useCapacityInput(type: Type, id?: string) {
  const [value, setValue] = useState('');
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [groupsDirty, setGroupsDirty] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [loaded, setLoaded] = useState(!id);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoaded(false);
    setDirty(false);
    void request<Queue>('get', path(type, id)).then(data => {
      if (active) { setGroups((data.groups ?? []).map(fromPlan)); setValue(data.capacity?.toString() ?? ''); setLoaded(true); setError(''); }
    }).catch(e => { if (active) setError(errorMessage(e)); });
    return () => { active = false; };
  }, [type, id]);
  function append(data: FormData) {
    if (groupsDirty) appendPlans(data, groups);
    if (!dirty) return;
    if (value === '') { if (id) data.append('clearCapacity', 'true'); return; }
    const number = Number(value);
    if (!Number.isInteger(number) || number < 1 || number > 1000) throw new Error('정원은 1~1000명으로 입력해주세요.');
    data.append('capacity', String(number));
  }
  const fieldFor = (rows: GroupRow[]) => <div className="my-3">
    <TotalCapacityInput rows={rows} value={value} disabled={!loaded} onChange={v => { setDirty(true); setValue(v); }} />
    {error && <span role="alert">{error}</span>}
  </div>;
  const groupField = <fieldset disabled={!loaded}><PaceGroups rows={groups} onChange={rows => { setGroupsDirty(true); setGroups(rows); }} /></fieldset>;
  return { append, field: fieldFor(groups), fieldFor, groupField };
}

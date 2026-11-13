import { useEffect, useRef, useState, type ReactNode, type PointerEvent } from 'react';
import { Check, RotateCcw, X } from 'lucide-react';
import { BadgePatch } from './BadgePatch';
import { medalPeriod, RankPatch, type RankMedal } from './RankMedals';
import { earned, type Patch } from './badgeCollection';
import { errorMessage, request, type Badge } from './shared';
import './badgeDisplay.css';

type Group = 'medals' | 'badges';
type Selection = Record<Group, string[] | null>;
type Option = { id: string; title: string; art: ReactNode };
const automatic: Selection = { medals: null, badges: null };
const groups: Group[] = ['medals', 'badges'];
const limits = { medals: 2, badges: 6 };
const label = { medals: '입상 배지', badges: '일반 배지' };
const keyOf = (m: RankMedal) => m.kind + m.start;
const sampleKey = 'riku.sample.badge-display';

type Drag = { id: string; pointer: number; x: number; y: number };

function SelectedGrid({ items, disabled, move, remove }: {
  items: Option[]; disabled: boolean; move: (from: number, to: number) => void; remove: (id: string) => void;
}) {
  const grid = useRef<HTMLOListElement>(null);
  const start = useRef<Drag | null>(null);
  const hasDragged = useRef(false);
  const [drag, setDrag] = useState<{ id: string; target: number; dx: number; dy: number }>();
  function targetAt(x: number, y: number) {
    return Array.from(grid.current?.children ?? []).findIndex(el => {
      const r = el.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    });
  }
  function update(event: PointerEvent<HTMLButtonElement>) {
    const origin = start.current;
    if (!origin || origin.pointer !== event.pointerId) return;
    const dx = event.clientX - origin.x, dy = event.clientY - origin.y;
    if (!hasDragged.current && Math.hypot(dx, dy) < 5) return;
    hasDragged.current = true;
    setDrag({ id: origin.id, dx, dy, target: targetAt(event.clientX, event.clientY) });
  }
  function finish(event: PointerEvent<HTMLButtonElement>, drop: boolean) {
    const origin = start.current;
    if (!origin || origin.pointer !== event.pointerId) return;
    start.current = null;
    setDrag(undefined);
    if (drop && hasDragged.current) move(items.findIndex(item => item.id === origin.id), targetAt(event.clientX, event.clientY));
  }
  return <ol ref={grid} className="showcase-grid">
    {items.map((item, i) => {
      const floating = drag?.id === item.id ? drag : undefined;
      return <li key={item.id} className={'showcase-slot' + (drag?.target === i && !floating ? ' drop-target' : '')}>
        <div className={'showcase-card' + (floating ? ' dragging' : '')}
          style={floating ? { transform: `translate(${floating.dx}px, ${floating.dy}px)` } : undefined}>
          <button type="button" className="showcase-grip" aria-label={`${i + 1}번 ${item.title} 순서 변경`}
            disabled={disabled || items.length < 2}
            onPointerDown={event => {
              if (!event.isPrimary || event.button !== 0) return;
              hasDragged.current = false;
              start.current = { id: item.id, pointer: event.pointerId, x: event.clientX, y: event.clientY };
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={update} onPointerUp={event => finish(event, true)}
            onPointerCancel={event => finish(event, false)} onLostPointerCapture={event => finish(event, false)}
            onKeyDown={event => {
              if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) return;
              event.preventDefault();
              move(i, i + (event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1));
            }}>
            <span className="showcase-position" aria-hidden="true">{i + 1}</span>
          </button>
          <span className="showcase-art">{item.art}</span>
          <span className="showcase-title">{item.title}</span>
          <button className="showcase-remove" aria-label={item.title + ' 선택 해제'} onClick={() => remove(item.id)}><X size={13}/></button>
        </div>
      </li>;
    })}
  </ol>;
}

export function BadgeDisplayEditor({ families, medals, sample, initialGroup, close, saving, setSaving }: {
  families: Patch[][]; medals: RankMedal[]; sample: boolean; initialGroup?: Group; close: () => void;
  saving: boolean; setSaving: (value: boolean) => void;
}) {
  const [group, setGroup] = useState<Group>(initialGroup ?? (medals.length ? 'medals' : 'badges'));
  const [draft, setDraft] = useState<Selection>();
  const [defaults, setDefaults] = useState<Record<Group, string[]>>({ medals: [], badges: [] });
  const [error, setError] = useState('');
  const [attempt, retry] = useState(0);
  const options: Record<Group, Option[]> = {
    medals: medals.map(m => ({ id: keyOf(m), title: medalPeriod(m) + ' ' + m.place + '위', art: <RankPatch medal={m}/> })),
    badges: families.flat().filter(earned).map(p => ({ id: p.id, title: p.name + (p.single ? '' : ' ' + p.tier), art: <BadgePatch patch={p}/> })),
  };
  useEffect(() => {
    let active = true;
    setError('');
    if (sample) {
      const saved = sessionStorage.getItem(sampleKey);
      setDraft(saved ? JSON.parse(saved) : automatic);
      setDefaults({medals: medals.slice(0, 3).map(keyOf), badges: families.map(f => f.filter(earned).slice(-1)[0]?.id).filter((v): v is string => !!v).slice(0, 3)});
      return;
    }
    request<{ selection: Selection; defaults: { medals: RankMedal[]; badges: Badge[] } }>('get', '/user/activity/badge-display')
      .then(({ selection, defaults: preview }) => {
      if (!active) return;
      setDraft(selection);
      setDefaults({ medals: preview.medals.map(keyOf), badges: preview.badges.map(b => b.code) });
    }).catch(e => { if (active) setError(errorMessage(e)); });
    return () => { active = false; };
  }, [attempt, sample]);
  function change(group: Group, value: string[] | null) {
    setDraft(previous => previous && ({ ...previous, [group]: value }));
  }
  async function save() {
    if (!draft || saving) return;
    setSaving(true);
    setError('');
    try {
      if (sample) sessionStorage.setItem(sampleKey, JSON.stringify(draft));
      else await request('put', '/user/activity/badge-display', draft);
      close();
    } catch (e) { setError(errorMessage(e)); }
    finally { setSaving(false); }
  }
  const available = options[group];
  const selected = (draft?.[group] ?? defaults[group]).filter(id => available.some(o => o.id === id)).slice(0, limits[group]);
  function move(from: number, to: number) {
    if (from < 0 || to < 0 || to >= selected.length || from === to) return;
    const next = selected.slice();
    next.splice(to, 0, next.splice(from, 1)[0]);
    change(group, next);
  }

  return <section className="showcase-editor" aria-label="대표 배지 편집">
    <div className="showcase-head">
      <div className="showcase-groups" role="group" aria-label="편집할 배지 종류">
        {groups.map(g => <button key={g} aria-pressed={g === group} disabled={saving}
          onClick={() => setGroup(g)}>{label[g]}</button>)}
      </div>
      {draft && <small aria-live="polite">{selected.length} / {limits[group]}개</small>}
    </div>
    {error && <p role="alert">{error} {!draft && <button onClick={() => retry(n => n + 1)}>다시 시도</button>}</p>}
    {!draft && !error && <p role="status">불러오는 중…</p>}
    {draft && <fieldset disabled={saving} aria-label={label[group]}>
      <SelectedGrid key={group} items={selected.map(id => available.find(o => o.id === id)!)}
        move={move} disabled={saving} remove={id => change(group, selected.filter(key => key !== id))}/>
      {available.length === 0 ? <p>아직 획득한 배지가 없어요.</p> :
          <div className="showcase-options" role="group" aria-label="보유 배지">{available.map(o => {
            const chosen = selected.includes(o.id);
            return <button key={o.id} aria-pressed={chosen} disabled={!chosen && selected.length >= limits[group]}
              onClick={() => change(group, chosen ? selected.filter(id => id !== o.id) : [...selected, o.id])}>
              <span>{o.art}</span>{o.title}{chosen && <Check size={12}/>}</button>;
          })}</div>}
      <footer>
        <button className="showcase-reset" disabled={draft[group] === null} onClick={() => change(group, null)}>
          <RotateCcw size={13}/>기본 순서
        </button>
        <button className="showcase-cancel" onClick={close}>취소</button>
        <button className="showcase-save" onClick={save}>{saving ? '저장 중…' : '저장'}</button>
      </footer>
    </fieldset>}
  </section>;
}

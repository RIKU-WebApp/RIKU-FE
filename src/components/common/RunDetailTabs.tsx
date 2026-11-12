import { useRef, type ReactNode, type PointerEvent } from 'react';

type RunTab = '소개' | '명단';

export default function RunDetailTabs({ activeTab, onChange, children }: {
  activeTab: RunTab;
  onChange: (tab: RunTab) => void;
  children: ReactNode;
}) {
  const start = useRef<{ id: number; x: number; y: number } | null>(null);
  const dragged = useRef(false);

  function begin(event: PointerEvent<HTMLElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    dragged.current = false;
    start.current = null;
    const target = event.target as Element;
    if (!event.currentTarget.contains(target) || target.closest(
      'dialog, [role="dialog"], .swiper, [data-no-swipe], input, select, textarea, a, button:not([aria-haspopup="dialog"]):not([data-run-tab])'
    )) return;
    start.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
  }

  function move(event: PointerEvent<HTMLElement>) {
    const origin = start.current;
    if (!origin || origin.id !== event.pointerId) return;
    const dx = Math.abs(event.clientX - origin.x);
    const dy = Math.abs(event.clientY - origin.y);
    if (!dragged.current && dy >= 12 && dy > dx) {
      start.current = null;
      return;
    }
    if (!dragged.current && dx >= 12 && dx > dy * 1.7) {
      dragged.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  }

  function finish(event: PointerEvent<HTMLElement>) {
    const origin = start.current;
    if (!origin || origin.id !== event.pointerId) return;
    start.current = null;
    const dx = event.clientX - origin.x;
    const dy = event.clientY - origin.y;
    if (Math.abs(dx) < 65 || Math.abs(dx) <= Math.abs(dy) * 1.7) return;
    dragged.current = true;
    const next = dx < 0 ? '명단' : '소개';
    if (next !== activeTab) onChange(next);
  }

  return <section aria-label="소개 및 명단" className="flex w-full flex-col items-center touch-pan-y"
    onPointerDown={begin} onPointerMove={move} onPointerUp={finish}
    onPointerCancel={() => { start.current = null; }}
    onDragStart={event => { if (start.current) event.preventDefault(); }}
    onClickCapture={event => {
      if (dragged.current && event.detail > 0) {
        event.preventDefault();
        event.stopPropagation();
      }
      dragged.current = false;
    }}>
    <div className="mt-3 w-full max-w-[370px] px-4">
      <div className="flex w-full">
        {(['소개', '명단'] as const).map(tab =>
          <button key={tab} type="button" data-run-tab aria-pressed={activeTab === tab}
            className={`flex-1 py-2 ${activeTab === tab ? 'text-[#355c48] font-semibold' : 'text-gray-400'}`}
            onClick={() => { if (tab !== activeTab) onChange(tab); }}>{tab}</button>)}
      </div>
      <div className="relative mt-1 h-1 rounded bg-gray-300">
        <div className={`absolute h-full w-1/2 rounded bg-[#355c48] transition-all duration-300 ${activeTab === '소개' ? 'left-0' : 'left-1/2'}`} />
      </div>
    </div>
    {children}
  </section>;
}

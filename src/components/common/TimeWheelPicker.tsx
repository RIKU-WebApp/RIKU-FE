import React, { useLayoutEffect, useRef } from 'react';

interface TimeWheelPickerProps {
  items: string[];
  selected: number;
  onSelect: (index: number) => void;
}

const TimeWheelPicker: React.FC<TimeWheelPickerProps> = ({ items, selected, onSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemHeight = 56;
  const isAutoScrolling = useRef(false);

  const handleScroll = () => {
    if (isAutoScrolling.current) return;

    const container = containerRef.current;
    if (!container) return;

    const index = Math.round(container.scrollTop / itemHeight);
    if (index !== selected) {
      onSelect(index);
    }
  };

  // ✅ selected 바뀔 때 정확한 포커싱 보장 (DOM 렌더 직후)
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const expectedTop = selected * itemHeight;

    isAutoScrolling.current = true;
    requestAnimationFrame(() => {
      container.scrollTo({
        top: expectedTop,
        behavior: 'auto', // 최초 로딩 시엔 instant
      });

      setTimeout(() => {
        isAutoScrolling.current = false;
      }, 200);
    });
  }, [selected]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-[180px] overflow-y-scroll no-scrollbar snap-y snap-mandatory relative"
    >
      {/* 구분선 */}
      <div className="absolute top-[56px] left-0 w-full z-10 " />
      <div className="absolute top-[112px] left-0 w-full z-10" />

      <div className="flex flex-col items-center py-[56px] relative z-0">
        {items.map((item, index) => (
          <div
            key={index}
            onClick={() => onSelect(index)}
            className={`h-[56px] flex items-center justify-center snap-center cursor-pointer
        ${index === selected ? 'text-black font-bold text-[50px] border-b border-t' : 'text-gray-400 text-[50px]'}
      `}
          >
            {item.padStart(2, '0')}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeWheelPicker;

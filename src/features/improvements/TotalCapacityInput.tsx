import { useId } from 'react';

interface Props {
  rows: { id: string; capacity?: string }[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function TotalCapacityInput({ rows, value, onChange, disabled }: Props) {
  const id = useId();
  const limits = rows.map(row => Number(row.capacity));
  const hasSum = limits.length > 0 && limits.every(n => Number.isInteger(n) && n >= 1 && n <= 1000);
  const placeholder = hasSum ? String(limits.reduce((sum, n) => sum + n, 0)) : undefined;
  return <>
    <label htmlFor={id} className="block">총정원</label>
    <input id={id} type="number" min={1} max={1000} step={1} value={value}
      className="mt-2 w-full rounded-lg border p-2" disabled={disabled} placeholder={placeholder}
      aria-describedby={value ? undefined : id + '-hint'} onChange={e => onChange(e.target.value)} />
    {!value && <p id={id + '-hint'} className="mt-1 text-xs text-gray-500">{hasSum ? '페이서 그룹 합계 (직접 입력한 총정원 우선)' : '총정원 제한 없음'}</p>}
  </>;
}

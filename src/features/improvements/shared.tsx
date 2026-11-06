import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@shared/lib/customAxios';
import BackIcon from '../../assets/BackBtn.svg';
import './improvements.css';

export async function request<T>(method: string, url: string, data?: unknown): Promise<T> {
  const response = await api.request({ method, url, data });
  if (!response.data.isSuccess) throw new Error(response.data.responseMessage || '요청을 처리할 수 없습니다.');
  return response.data.result as T;
}
export function errorMessage(error: unknown) {
  return (error as {response?: {data?: {responseMessage?: string}}})?.response?.data?.responseMessage || (error as { message?: string })?.message || '요청을 처리하지 못했습니다. 다시 시도해주세요.';
}
export function utcDate(value: string) { return new Date(/[Zz]|[+-]\d\d:\d\d$/.test(value) ? value : value + 'Z'); }
export function Header({ title, back = '/tab/my-page' }: { title: string; back?: string }) {
  const navigate = useNavigate();
  return <header className="riku-header"><button aria-label="뒤로가기" onClick={() => navigate(back, { replace: true })}><img src={BackIcon} alt="" className="w-6 h-6"/></button><h1>{title}</h1></header>;
}
export function useSwipeTabs(onSwipe: (direction: 'left' | 'right') => void) {
  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  return {
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
      if (event.button !== 0 || (event.target as Element).closest('button,a,input,select,textarea,.swiper,[data-no-swipe]')) return;
      start.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
    },
    onPointerUp: (event: React.PointerEvent<HTMLElement>) => {
      const first = start.current; start.current = null;
      if (!first || first.id !== event.pointerId) return;
      const dx = event.clientX - first.x, dy = event.clientY - first.y;
      if (Math.abs(dx) >= 65 && Math.abs(dx) > Math.abs(dy) * 1.7) onSwipe(dx < 0 ? 'left' : 'right');
    },
    onPointerCancel: () => { start.current = null; },
    style: { touchAction: 'pan-y' } as React.CSSProperties,
  };
}
export interface Badge { code: string; name: string; description: string; source: 'CLUB' | 'PERSONAL' | 'ADMIN' }

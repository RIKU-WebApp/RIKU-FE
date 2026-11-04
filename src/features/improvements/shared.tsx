import { useEffect, useRef, useState } from 'react';
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
export function BadgeGrid({ badges }: { badges: Badge[] }) {
  return badges.length ? <div className="badge-grid">{badges.map(b => <div className="badge-tile" key={b.code} title={b.description}><strong>{b.name}</strong><small>{b.source === 'CLUB' ? '공식 출석' : b.source === 'ADMIN' ? '운영진 수여' : '개인 기록'}</small></div>)}</div> : <p className="riku-muted">배지 없음</p>;
}
export function ProfileDialog({ userId, onClose, canAward = false }: { userId: number; onClose: () => void; canAward?: boolean }) {
  const [profile, setProfile] = useState<{ name: string; badges: Badge[] }>();
  const [error, setError] = useState(''); const [name, setName] = useState(''); const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false); const [awarding, setAwarding] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const refresh = () => request<{ name: string; badges: Badge[] }>('get', `/user/${userId}/public-profile`).then(setProfile).catch(e => setError(errorMessage(e)));
  useEffect(() => { void refresh(); dialog.current?.showModal(); }, [userId]);
  return <dialog ref={dialog} className="riku-dialog" onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <button className="dialog-close" onClick={onClose} aria-label="프로필 닫기">×</button>
    <h2>{profile?.name || '프로필'}</h2>
    <BadgeGrid badges={profile?.badges || []} />
    {canAward && <><button className="riku-secondary" onClick={() => setAwarding(!awarding)}>배지 수여하기</button>{awarding && <form className="riku-form" onSubmit={async e => { e.preventDefault(); setBusy(true);setError(''); try { await request('post', `/admin/users/${userId}/badges`, {name,description}); await refresh();setAwarding(false); } catch(e) {setError(errorMessage(e));} finally {setBusy(false);} }}><label>배지 이름<input value={name} onChange={e => setName(e.target.value)} maxLength={40} required /></label><label>수여 이유<input value={description} onChange={e => setDescription(e.target.value)} maxLength={200} required /></label><button disabled={busy} className="riku-primary">배지 수여</button></form>}</>}
    {error && <p role="alert" className="riku-error">{error}</p>}
  </dialog>;
}

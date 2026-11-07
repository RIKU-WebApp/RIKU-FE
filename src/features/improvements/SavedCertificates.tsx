import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '@shared/lib/customAxios';
import { Header, errorMessage, request } from './shared';
import './recentCertificates.css';

interface Certificate { id: number; title: string; date: string }
interface OldRun extends Certificate { distanceKm: number; minutes: number }

function CertificateHeading({count}: {count?: number}) {
  return <h2>보관한 기록증 {count !== undefined && <span className="certificate-count">{count}개</span>}</h2>;
}

function GalleryCard({card}: {card: Certificate}) {
  const tile = useRef<HTMLAnchorElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!tile.current || !('IntersectionObserver' in window)) { setVisible(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect(); }
    }, {rootMargin:'160px'});
    observer.observe(tile.current);
    return () => observer.disconnect();
  }, []);
  const {src, error} = useCertificateImage(visible ? String(card.id) : undefined);
  return <Link ref={tile} className="certificate-tile" to={'/record/saved/' + card.id}>
    <div className="certificate-photo">{src ? <img src={src} alt="" /> : error && <small>이미지 로드 실패</small>}</div>
    <strong>{card.title}</strong><time dateTime={card.date}>{card.date.replace(/-/g, '.')}</time>
  </Link>;
}

export function SavedCertificates() {
  const [cards, setCards] = useState<Certificate[]>();
  const [records, setRecords] = useState<OldRun[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    void request<Certificate[]>('get', '/user/certificates').then(items => setCards(items ?? [])).catch(e => setError(errorMessage(e)));
    void request<{records: OldRun[]}>('get', '/user/activity/badges')
      .then(activity => setRecords(activity.records)).catch(e => setError(errorMessage(e)));
  }, []);
  return <main className="riku-page"><Header title="내 기록" back="/record" />
    <section className="riku-section">
      <CertificateHeading count={cards?.length}/>
      {cards?.length === 0 && <p>아직 보관한 기록증이 없습니다.</p>}
      <div className="certificate-gallery">{cards?.map(card => <GalleryCard key={card.id} card={card}/>)}</div>
      {records.length > 0 && <h2>개인 러닝 기록</h2>}
      {records.map(record => <article className="riku-card" key={record.id}>
        <strong>{record.title}</strong><p>{record.date}　{record.distanceKm} km　{record.minutes}분</p>
        <div className="riku-inline-actions">
          <Link className="riku-secondary" to="/record" state={{record}}>기록증 만들기</Link>
          <button className="riku-link" onClick={async () => {
            if (!window.confirm('기록을 삭제하시겠습니까?')) return;
            try {
              await request('delete', '/user/records/' + record.id);
              setRecords(current => current.filter(item => item.id !== record.id));
            } catch (e) { setError(errorMessage(e)); }
          }}>삭제</button>
        </div>
      </article>)}
      {error && <p role="alert">{error}</p>}
    </section>
  </main>;
}

function useCertificateImage(id?: string) {
  const [src, setSrc] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    if (!id) return;
    let active = true;
    const controller = new AbortController();
    let url = '';
    setSrc('');
    setError('');
    void api.get<Blob>('/user/certificates/' + id + '/image', { responseType: 'blob', signal:controller.signal })
      .then(response => {
        if (active) { url = URL.createObjectURL(response.data); setSrc(url); }
      }).catch(e => { if (active) setError(errorMessage(e)); });
    return () => { active = false; controller.abort(); if (url) URL.revokeObjectURL(url); };
  }, [id]);
  return {src, error, setError};
}

function CertificatePreview({card, close}: {card: Certificate; close: () => void}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const {src, error} = useCertificateImage(String(card.id));
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  return <dialog className="riku-dialog cert-dialog" aria-label={card.title} ref={dialog}
    onCancel={close} onClick={event => { if (event.target === dialog.current) close(); }}>
    <div><header><h2>{card.title}</h2><button aria-label="기록증 닫기" onClick={close}>×</button></header>
      <p>{card.date}</p>
      {error ? <p role="alert">{error}</p> : src ? <img src={src} alt={card.title + ' 기록증'}/> : <p role="status">불러오는 중…</p>}
    </div>
  </dialog>;
}

export function RecentCertificates() {
  const [cards, setCards] = useState<Certificate[]>();
  const [selected, setSelected] = useState<Certificate>();
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    request<Certificate[]>('get', '/user/certificates')
      .then(list => { if (active) setCards(list ?? []); })
      .catch(e => { if (active) setError(errorMessage(e)); });
    return () => { active = false; };
  }, []);
  return <section className="recent-certificates">
    <header><CertificateHeading count={cards?.length}/><Link to="/record/saved">전체 보기 ›</Link></header>
    {cards?.slice(0, 2).map(card => <button key={card.id} onClick={() => setSelected(card)}>
      <span>{card.title}</span><time dateTime={card.date}>{card.date.replace(/-/g, '.')}</time>
    </button>)}
    {error ? <p role="alert">{error}</p> : !cards ? <p role="status">불러오는 중…</p> :
      cards.length === 0 && <p>아직 보관한 기록증이 없어요.</p>}
    {selected && <CertificatePreview card={selected} close={() => setSelected(undefined)}/>}
  </section>;
}

export function CertificateImage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const {src, error, setError} = useCertificateImage(id!);
  return <main className="riku-page"><Header title="기록증" back="/record/saved" />
    <section className="riku-section">
      {src && <><img src={src} alt="보관한 러닝 기록증" className="w-full" />
        <div className="riku-inline-actions">
          <a className="riku-secondary" href={src} download={'riku-record-' + id + '.jpg'}>다운로드</a>
          <button className="riku-link" disabled={deleting} onClick={async () => {
            if (!window.confirm('이 기록증을 삭제할까요?')) return;
            setDeleting(true);
            try {
              await api.delete('/user/certificates/' + id);
              navigate('/record/saved', { replace: true });
            } catch (e) {
              setError(errorMessage(e));
              setDeleting(false);
            }
          }}>삭제</button>
        </div></>}
      {error && <p role="alert">{error}</p>}
    </section>
  </main>;
}

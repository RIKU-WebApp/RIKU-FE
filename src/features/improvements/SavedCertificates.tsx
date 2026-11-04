import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '@shared/lib/customAxios';
import { Header, errorMessage, request } from './shared';

interface Certificate { id: number; title: string; date: string }
interface OldRun extends Certificate { distanceKm: number; minutes: number }

export function SavedCertificates() {
  const [cards, setCards] = useState<Certificate[]>();
  const [records, setRecords] = useState<OldRun[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    void request<Certificate[]>('get', '/user/certificates').then(items => setCards(items ?? [])).catch(e => setError(errorMessage(e)));
    void request<{records: OldRun[]}>('get', '/user/activity/badges')
      .then(activity => setRecords(activity.records)).catch(e => setError(errorMessage(e)));
  }, []);
  return <main className="riku-page"><Header title="내 기록" back="/record/archive" />
    <section className="riku-section">
      <h2>보관한 기록증</h2>
      {cards?.length === 0 && <p>아직 보관한 기록증이 없습니다.</p>}
      {cards?.map(card => <Link className="riku-card block" key={card.id} to={'/record/saved/' + card.id}>
        <strong>{card.title}</strong><p>{card.date}</p>
      </Link>)}
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

export function CertificateImage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [src, setSrc] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    let url = '';
    setSrc('');
    setError('');
    void api.get<Blob>('/user/certificates/' + id + '/image', { responseType: 'blob' })
      .then(response => {
        if (active) { url = URL.createObjectURL(response.data); setSrc(url); }
      }).catch(e => { if (active) setError(errorMessage(e)); });
    return () => { active = false; if (url) URL.revokeObjectURL(url); };
  }, [id]);
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

import { useEffect, useState, type FormEvent } from 'react';
import { FeedbackList } from './FeedbackPage';
import { errorMessage, Header, request, utcDate } from './shared';

const statusLabels = { RECEIVED: '접수 완료', REVIEWING: '확인 중', COMPLETED: '처리 완료' };
type Status = keyof typeof statusLabels;

interface Inquiry {
  id: number;
  studentId: string;
  name: string;
  major: string;
  phone: string | null;
  status: Status;
  createdAt: string;
}

interface InquiryPage {
  content: Inquiry[];
  first: boolean;
  last: boolean;
}
interface Member {
  userId: number;
  studentId: string;
  name: string;
  phoneNumber: string | null;
  major: string;
  role: string;
}

function InquiryCard({
  inquiry,
  onUpdate,
}: {
  inquiry: Inquiry;
  onUpdate: (updated: Inquiry) => void;
}) {
  const [member, setMember] = useState<Member>();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function saveStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const status = new FormData(event.currentTarget).get('status');
    void run(async () => {
      const updated = await request<Inquiry>('patch', `/admin/password-inquiries/${inquiry.id}`, {
        status,
      });
      onUpdate(updated);
    });
  }

  function lookupMember() {
    void run(async () => {
      const rows = await request<Member[]>(
        'get',
        `/admin/user/search?name=${encodeURIComponent(inquiry.name)}`
      );
      const matches = (rows ?? []).filter(
        (row) =>
          row.studentId === inquiry.studentId &&
          row.name === inquiry.name &&
          row.role !== 'INACTIVE'
      );
      if (matches.length !== 1)
        throw new Error('신청한 학번과 이름이 일치하는 활동 회원을 확인할 수 없습니다.');
      setMember(matches[0]);
    });
  }

  function resetPassword() {
    if (
      !member ||
      !window.confirm(
        `${member.name} (${member.studentId})님의 본인을 확인하셨나요? 임시 비밀번호를 발급하면 이 회원의 기존 비밀번호가 변경됩니다.`
      )
    )
      return;
    void run(async () => {
      const result = await request<{ password: string }>(
        'post',
        `/admin/user/${member.userId}/reset-password`
      );
      setPassword(result.password);
    });
  }

  return (
    <article className="riku-card">
      <div className="feedback-meta">
        <time dateTime={inquiry.createdAt}>
          {utcDate(inquiry.createdAt).toLocaleDateString('ko-KR')}
        </time>
        <span className="role-pill">{statusLabels[inquiry.status]}</span>
      </div>
      <h3>
        {inquiry.name} · {inquiry.studentId}
      </h3>
      <p>신청 학과 · {inquiry.major}</p>
      <p>신청 전화번호 · {inquiry.phone || '미입력'}</p>
      {inquiry.status !== 'COMPLETED' && !member && (
        <button className="riku-link" disabled={busy} onClick={lookupMember}>
          가입 정보 확인
        </button>
      )}
      {inquiry.status !== 'COMPLETED' && member && !password && (
        <div className="riku-group mt-4">
          <h3>회원가입 정보</h3>
          <p>
            {member.name} · {member.studentId} · {member.major}
          </p>
          <p>등록 전화번호 · {member.phoneNumber || '미등록'}</p>
          <p className="riku-muted">
            등록된 연락처나 기존 동아리 연락망으로 본인을 확인한 뒤 발급해 주세요.
          </p>
          <button className="riku-secondary" disabled={busy} onClick={resetPassword}>
            본인 확인 후 임시 비밀번호 발급
          </button>
        </div>
      )}
      {password && (
        <div className="riku-group mt-4" role="status">
          <h3>발급한 임시 비밀번호</h3>
          <p>
            <code>{password}</code>
          </p>
          <p className="riku-muted">
            확인한 본인에게 전달해 주세요. 화면을 벗어나면 다시 볼 수 없습니다.
          </p>
          <p className="riku-muted">
            로그인 후 마이페이지의 ‘프로필 수정’에서 새 비밀번호로 변경하도록 안내해 주세요.
          </p>
          <button
            className="riku-link"
            onClick={() => {
              setPassword('');
              setMember(undefined);
            }}
          >
            전달 완료 · 비밀번호 닫기
          </button>
        </div>
      )}
      <form className="riku-form mt-4" onSubmit={saveStatus}>
        <label>
          처리 상태
          <select name="status" defaultValue={inquiry.status}>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button className="riku-secondary" disabled={busy}>
          상태 저장
        </button>
      </form>
      {error && (
        <p className="riku-error" role="alert">
          {error}
        </p>
      )}
    </article>
  );
}

function PasswordInquiries() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<InquiryPage>();
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let current = true;
    setData(undefined);
    setError('');
    request<InquiryPage>('get', `/admin/password-inquiries?page=${page}`)
      .then((result) => {
        if (current) setData(result);
      })
      .catch((err) => {
        if (current) setError(errorMessage(err));
      });
    return () => {
      current = false;
    };
  }, [page, attempt]);

  function update(updated: Inquiry) {
    setData(
      (previous) =>
        previous && {
          ...previous,
          content: previous.content.map((row) => (row.id === updated.id ? updated : row)),
        }
    );
  }

  if (error)
    return (
      <div>
        <p className="riku-error" role="alert">
          {error}
        </p>
        <button className="riku-link" onClick={() => setAttempt((i) => i + 1)}>
          다시 불러오기
        </button>
      </div>
    );
  if (!data)
    return (
      <p className="riku-muted" role="status">
        문의를 불러오는 중입니다.
      </p>
    );
  return (
    <>
      {data.content.length === 0 && <p className="riku-muted">접수된 비밀번호 문의가 없습니다.</p>}
      {data.content.map((row) => (
        <InquiryCard key={row.id} inquiry={row} onUpdate={update} />
      ))}
      {!(data.first && data.last) && (
        <div className="riku-row">
          <button
            className="riku-secondary"
            disabled={data.first}
            onClick={() => setPage(page - 1)}
          >
            이전
          </button>
          <span className="text-center text-sm">{page + 1}페이지</span>
          <button className="riku-secondary" disabled={data.last} onClick={() => setPage(page + 1)}>
            다음
          </button>
        </div>
      )}
    </>
  );
}

export default function AdminInbox() {
  const [tab, setTab] = useState<'feedback' | 'password'>('feedback');
  return (
    <main className="riku-page">
      <Header title="건의사항 / 비밀번호 문의" />
      <section className="riku-section">
        <div className="riku-row" role="group" aria-label="문의 분류">
          <button
            aria-pressed={tab === 'feedback'}
            className={tab === 'feedback' ? 'riku-primary' : 'riku-secondary'}
            onClick={() => setTab('feedback')}
          >
            건의사항
          </button>
          <button
            aria-pressed={tab === 'password'}
            className={tab === 'password' ? 'riku-primary' : 'riku-secondary'}
            onClick={() => setTab('password')}
          >
            비밀번호 문의
          </button>
        </div>
        {tab === 'feedback' ? <FeedbackList admin /> : <PasswordInquiries />}
      </section>
    </main>
  );
}

import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { errorMessage, Header, request } from '../features/improvements/shared';

export default function AccountHelpPage() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const value = (key: string) => String(fields.get(key) ?? '').trim();
    const studentId = value('studentId');
    const name = value('name');
    const major = value('major');

    if (!studentId || !name || !major) {
      setError('학번, 이름, 학과를 모두 입력해 주세요.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await request('post', '/user/password-inquiries', {
        studentId,
        name,
        major,
        phone: value('phone') || null,
      });
      setSent(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="riku-page">
      <Header title="아이디 · 비밀번호 찾기" back="/login" />
      <div className="riku-section">
        <section>
          <h2>아이디는 가입할 때 입력한 학번입니다.</h2>
          <p className="text-sm">학번을 잘못 입력했다면 운영진에게 문의해 주세요.</p>
        </section>
        <section>
          <h2>비밀번호 문의</h2>
          {sent ? (
            <div className="riku-card" role="status">
              <h3>문의가 접수됐습니다.</h3>
              <Link className="riku-link" to="/login">
                로그인으로 돌아가기
              </Link>
            </div>
          ) : (
            <form className="riku-form riku-card" onSubmit={submit}>
              <label>
                학번
                <input name="studentId" autoComplete="username" required maxLength={255} />
              </label>
              <label>
                이름
                <input name="name" autoComplete="name" required maxLength={255} />
              </label>
              <label>
                학과
                <input name="major" required maxLength={255} />
              </label>
              <label>
                전화번호 (가입 시 입력한 경우)
                <input
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  pattern="01[016789][0-9]{3,4}[0-9]{4}"
                  placeholder="01012345678"
                  title="휴대전화 번호 10~11자리를 숫자로 입력해 주세요."
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                  }}
                />
              </label>
              {error && (
                <p className="riku-error" role="alert">
                  {error}
                </p>
              )}
              <button className="riku-primary" disabled={busy}>
                {busy ? '접수 중…' : '문의하기'}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

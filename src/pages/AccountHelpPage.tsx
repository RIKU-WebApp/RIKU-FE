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
      <Header title="ID/PW 찾기" back="/login" />
      <div className="riku-section">
        <section>
          <h2>아이디 찾기</h2>
          <p className="text-sm">
            아이디는 회원가입 시 입력하신 학번입니다. 학번을 잘못 입력하셨다면 운영진에게 문의해
            주세요.
          </p>
        </section>
        <section>
          <h2>비밀번호 찾기 신청</h2>
          {sent ? (
            <div className="riku-card" role="status">
              <h3>비밀번호 문의를 접수했습니다.</h3>
              <p>
                운영진이 본인 확인 후 비밀번호 재설정을 도와드립니다. 가입 시 전화번호를 남기지
                않았다면 동아리 운영진에게 직접 연락해 주세요.
              </p>
              <p className="mt-2">
                임시 비밀번호를 받으면 로그인한 뒤 마이페이지의 ‘프로필 수정’에서 새 비밀번호로
                변경해 주세요.
              </p>
              <Link className="riku-link" to="/login">
                로그인으로 돌아가기
              </Link>
            </div>
          ) : (
            <form className="riku-form riku-card" onSubmit={submit}>
              <p>
                회원가입 시 입력하신 정보를 적어 주세요. 운영진이 본인을 확인한 뒤 재설정을
                안내합니다.
              </p>
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
                {busy ? '접수 중…' : '비밀번호 찾기 신청'}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

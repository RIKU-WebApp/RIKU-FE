import { useRef, useState } from 'react';
import SignupStep from './SignupStep';
import { useCreateAccountData } from '@features/auth/hooks/useCreateAccountData';

const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;

export default function PasswordInput() {
  const { signupData, setSignupData, handleNext, showError } = useCreateAccountData();
  const [password, setPassword] = useState(signupData.password);
  const [confirm, setConfirm] = useState(signupData.password);
  const confirmRef = useRef<HTMLInputElement>(null);
  const valid = passwordPattern.test(password);
  const mismatch = confirm !== '' && confirm !== password;
  const ready = valid && password === confirm;
  return (
    <SignupStep
      title="비밀번호를 설정해 주세요."
      disabled={!ready}
      onSubmit={(e) => {
        e.preventDefault();
        if (!ready) return;
        setSignupData({ ...signupData, password });
        handleNext();
      }}
    >
      <input
        aria-label="비밀번호"
        type="password"
        autoComplete="new-password"
        enterKeyHint="next"
        value={password}
        placeholder="비밀번호"
        onChange={(e) => {
          setPassword(e.target.value);
          showError('');
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
            e.preventDefault();
            if (valid) confirmRef.current?.focus();
          }
        }}
        className="w-full rounded-md border border-gray-300 px-4 py-2"
      />
      {password && !valid && (
        <p role="alert" className="text-sm text-red-700">
          영문, 숫자, 특수문자(!@#$%^&amp;*)를 포함해 8~20자로 입력해 주세요.
        </p>
      )}
      <input
        ref={confirmRef}
        aria-label="비밀번호 확인"
        type="password"
        autoComplete="new-password"
        enterKeyHint="next"
        value={confirm}
        placeholder="비밀번호 확인"
        onChange={(e) => {
          setConfirm(e.target.value);
          showError('');
        }}
        className="w-full rounded-md border border-gray-300 px-4 py-2"
      />
      {mismatch && (
        <p role="alert" className="text-sm text-red-700">
          비밀번호가 일치하지 않습니다.
        </p>
      )}
    </SignupStep>
  );
}

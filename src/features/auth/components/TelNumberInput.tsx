import SignupStep from './SignupStep';
import useTelNumberInputData from '@features/auth/hooks/useTelNumberInputData';

export default function TelNumberInput() {
  const { phone, submitting, inputError, canSubmit, handleChangePhone, handleSubmitPhone } =
    useTelNumberInputData();
  return (
    <SignupStep
      title="전화번호를 입력해 주세요."
      onSubmit={handleSubmitPhone}
      disabled={!canSubmit}
      action={submitting ? '가입 중…' : '가입하기'}
    >
      <input
        type="tel"
        aria-label="전화번호 (선택)"
        placeholder="전화번호 (선택)"
        inputMode="numeric"
        enterKeyHint="done"
        autoComplete="tel-national"
        value={phone}
        readOnly={submitting}
        aria-invalid={!!inputError}
        aria-describedby={inputError ? 'phone-error' : undefined}
        onChange={handleChangePhone}
        className="w-full rounded-md border border-gray-300 px-4 py-2"
      />
      {inputError && (
        <p id="phone-error" role="alert" className="text-sm text-red-700">
          {inputError}
        </p>
      )}
    </SignupStep>
  );
}

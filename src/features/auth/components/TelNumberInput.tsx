import useTelNumberInputData from '@features/auth/hooks/useTelNumberInputData';

export default function TelNumberInput() {
  const { phone, submitting, inputError, clearPhone, handleChangePhone, handleSubmitPhone } =
    useTelNumberInputData();
  return (
    <form onSubmit={handleSubmitPhone} className="w-full max-w-sm mt-16">
      <h1 className="text-left font-bold text-2xl text-black mt-12">
        <label htmlFor="signup-phone">전화번호를 입력해 주세요.</label>
      </h1>
      <p id="phone-help" className="text-sm text-gray-600 mb-8">
        선택 사항입니다. 번호 없이 가입하려면 빈칸으로 두세요.
      </p>
      <input
        id="signup-phone"
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        value={phone}
        readOnly={submitting}
        aria-invalid={!!inputError}
        aria-describedby={inputError ? 'phone-help phone-error' : 'phone-help'}
        onChange={handleChangePhone}
        placeholder="예: 01012345678"
        className="w-full px-4 py-2 border border-gray-300 rounded-md"
      />
      {inputError && (
        <p id="phone-error" role="alert" className="mt-2 text-sm text-red-700">
          {inputError}
        </p>
      )}
      {(phone || inputError) && (
        <button
          type="button"
          disabled={submitting}
          onClick={clearPhone}
          className="mt-2 text-sm underline"
        >
          전화번호 지우기
        </button>
      )}
      <button
        type="submit"
        disabled={submitting || !!inputError}
        className="w-full py-3 mt-72 rounded-md bg-kuDarkGreen text-white disabled:bg-gray-100 disabled:text-gray-500"
      >
        {submitting ? '가입 중…' : phone ? '가입하기' : '전화번호 없이 가입하기'}
      </button>
    </form>
  );
}

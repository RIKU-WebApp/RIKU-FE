import usePasswordInputData from '@features/auth/hooks/usePasswordInputData';

// 비밀번호 입력 컴포넌트
function PasswordInput() {
  const {
    password,
    handleSubmitPassword,
    passwordConfirm,
    handleChangePasswordConfirm,
    validationMessage,
    validationMessageInConfirm,
    isValidPW,
    isValidPWConfirm,
    handleChangePassword,
  } = usePasswordInputData(); // '회원가입 페이지'의 '비밀번호 입력 컴포넌트'의 비즈니스 로직을 담당하는 훅에서 필요한 것만 가져오기

  return (
    <>
      <form onSubmit={handleSubmitPassword} className="w-full max-w-sm mt-16">
        {/* '비밀번호를 설정해 주세요' 텍스트 */}
        <div className="w-full max-w-sm">
          <h1 className="text-left font-bold text-2xl text-black mb-12">
            비밀번호를 설정해 주세요.
          </h1>
        </div>

        {/* 비밀번호 입력 필드 */}
        <div className="mb-6">
          <input
            type="password"
            value={password}
            onChange={handleChangePassword}
            placeholder="비밀번호"
            className={`w-full px-4 py-2 border ${
              password === '' ? 'border-gray-300' : isValidPW ? 'border-gray-300' : 'border-red-500'
            } rounded-md focus:outline-none`}
          />
          <div className="w-full max-w-sm">
            {!(isValidPW || password === '') && (
              <p className="text-red-500 text-sm text-left mt-2">{validationMessage}</p>
            )}
          </div>
        </div>

        {/* 비밀번호 입력 확인 필드(재입력) */}
        <div className="mb-6">
          <input
            type="password"
            value={passwordConfirm}
            onChange={handleChangePasswordConfirm}
            placeholder="비밀번호 확인"
            className={`w-full px-4 py-2 border ${
              passwordConfirm === ''
                ? 'border-gray-300'
                : isValidPWConfirm
                  ? 'border-kuDarkGreen'
                  : 'border-red-500'
            } rounded-md focus:outline-none`}
          />
          <div className="w-full max-w-sm">
            {!(passwordConfirm === '') ? (
              isValidPWConfirm ? (
                <p className="text-kuDarkGreen text-sm mt-2 text-left">
                  {validationMessageInConfirm}
                </p>
              ) : (
                <p className="text-red-500 text-sm mt-2 text-left">{validationMessageInConfirm}</p>
              )
            ) : null}
          </div>
        </div>

        {/* 다음 버튼 */}
        <button
          type="submit"
          className={`w-full py-3 mt-72 rounded-md ${
            isValidPW && isValidPWConfirm
              ? 'bg-kuDarkGreen text-kuWhite hover: hover:bg-kuGreen'
              : ' text-gray-500 bg-gray-100'
          } transition-colors`}
          disabled={!(isValidPW && isValidPWConfirm)}
        >
          다음
        </button>
      </form>

      {/* 빈 공간 추가 */}
      <div className="mb-4"></div>
    </>
  );
}

export default PasswordInput;

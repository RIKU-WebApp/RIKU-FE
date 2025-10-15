import useNameInputData from '@features/auth/hooks/useNameInputData';

// 이름 입력 컴포넌트
function NameInput() {
  const { name, handleChangeName, handleSubmitName } = useNameInputData(); // '회원가입 페이지'의 '이름 입력 컴포넌트'의 비즈니스 로직을 담당하는 훅에서 필요한 것만 가져오기

  return (
    <>
      {/* 이름 입력 폼 */}
      <form onSubmit={handleSubmitName} className="w-full max-w-sm mt-16">
        {/* '이름을 입력해 주세요' 텍스트 */}
        <div className="w-full max-w-sm">
          <h1 className="text-left font-bold text-2xl text-black mb-12">이름을 입력해 주세요.</h1>
        </div>

        {/* 이름 입력 필드 */}
        <div className="mb-6">
          <input
            type="text"
            value={name}
            onChange={handleChangeName}
            placeholder="이름"
            className={`w-full px-4 py-2 border 'border-gray-300' rounded-md focus:outline-none`}
          />
        </div>

        {/* 다음 버튼 */}
        <button
          type="submit"
          className={`w-full py-3 mt-72 rounded-md ${name !== '' ? 'bg-kuDarkGreen text-kuWhite hover: hover:bg-kuGreen' : ' text-gray-500 bg-gray-100'} transition-colors`}
          disabled={name === ''}
        >
          다음
        </button>
      </form>

      {/* 빈 공간 추가 */}
      <div className="mb-4"></div>
    </>
  );
}

export default NameInput;

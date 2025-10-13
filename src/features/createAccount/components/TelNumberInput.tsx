import useTelNumberInputData from '@features/createAccount/hooks/useTelNumberInputData';

//전화번호 입력하는 화면인 TelNumberInput
function TelNumberInput() {
  const { phone, handleChangePhone, handleSubmitPhone } = useTelNumberInputData(); // '회원가입 페이지'에서 '전화번호' 입력하는 것에 대한 비즈니스 로직을 담당하는 훅에서 필요한 것만 가져오기

  return (
    <>
      {/* Main Form */}
      <form onSubmit={handleSubmitPhone} className="w-full max-w-sm mt-16">
        {/* '전화번호를 입력해 주세요' 텍스트 */}
        <div className="w-full max-w-sm">
          <h1 className="text-left font-bold text-2xl text-black mt-12">
            전화번호를 입력해 주세요.
          </h1>
          <h3 className="text-left font-medium text-sm text-gray-500 mb-12">
            전화번호 입력은 선택 사항입니다(ex. 010-1111-1111)
          </h3>
        </div>

        {/* 전화번호 필드 */}
        <div className="mb-6">
          <input
            type="text"
            value={phone}
            onChange={handleChangePhone}
            placeholder="전화번호"
            className={`w-full px-4 py-2 border 'border-gray-300' rounded-md focus:outline-none`}
          />
        </div>

        {/* 다음 버튼 */}
        <button
          type="submit"
          className={`w-full py-3 mt-72 rounded-md bg-kuDarkGreen text-kuWhite hover: hover:bg-kuGreen transition-colors`}
        >
          다음
        </button>
      </form>

      {/* 빈 공간 추가 */}
      <div className="mb-4"></div>
    </>
  );
}

export default TelNumberInput;

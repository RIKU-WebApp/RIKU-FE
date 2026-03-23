import useSchoolInfoInputData from '@features/auth/hooks/useSchoolInfoInputData';

// 학교 정보 입력 컴포넌트
function SchoolInfoInput() {
  const {
    college,
    major,
    gotoNextScreenValid,
    handleChangeCollege,
    handleChangeMajor,
    handleSubmitSchoolInfo,
  } = useSchoolInfoInputData(); // '회원가입 페이지'에서 '단과대학/학과 정보' 입력하는 것에 대한 비즈니스 로직을 담당하는 훅에서 필요한 것만 가져오기

  return (
    <>
      {/* Main Form */}
      <form onSubmit={handleSubmitSchoolInfo} className="w-full max-w-sm mt-16">
        {/* '아이디를 입력해 주세요' 텍스트 */}
        <div className="w-full max-w-sm">
          <h1 className="text-left font-bold text-2xl text-black mb-12">
            학교 정보를 입력해 주세요.
          </h1>
        </div>

        {/* 단과대 입력 필드(드롭다운 형식) */}
        <div className="mb-6">
          <select
            value={college}
            onChange={handleChangeCollege}
            className={`w-full px-4 py-2 border 'border-gray-300' rounded-md focus:outline-none`}
          >
            <option value="">단과대를 선택해 주세요</option>
            <option value="문과대학">문과대학</option>
            <option value="이과대학">이과대학</option>
            <option value="건축대학">건축대학</option>
            <option value="공과대학">공과대학</option>
            <option value="사회과학대학">사회과학대학</option>
            <option value="경영대학">경영대학</option>
            <option value="부동산과학원">부동산과학원</option>
            <option value="KU융합과학기술원">KU융합과학기술원</option>
            <option value="상허생명과학대학">상허생명과학대학</option>
            <option value="수의과대학">수의과대학</option>
            <option value="예술디자인대학">예술디자인대학</option>
            <option value="사범대학">사범대학</option>
            <option value="언어교육원">언어교육원</option>
            <option value="KU자율전공학부">KU자율전공학부(단과대 미정)</option>
            <option value="대학원">대학원</option>
          </select>
          {college !== '' ? (
            <input
              type="text"
              value={major}
              onChange={handleChangeMajor}
              placeholder="학과(학부)를 입력해주세요"
              className={`w-full px-4 py-2 border 'border-gray-300' rounded-md focus:outline-none mt-4`}
            />
          ) : null}
        </div>

        {/* 다음 버튼 */}
        <button
          type="submit"
          className={`w-full py-3 mt-72 rounded-md ${college !== '' && major !== '' ? 'bg-kuDarkGreen text-kuWhite hover: hover:bg-kuGreen' : ' text-gray-500 bg-gray-100'} transition-colors`}
          disabled={!gotoNextScreenValid}
        >
          다음
        </button>
      </form>

      {/* 빈 공간 추가 */}
      <div className="mb-4"></div>
    </>
  );
}

export default SchoolInfoInput;

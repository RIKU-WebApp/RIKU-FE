import { majorsByCollege } from '@features/auth/majorsByCollege';
import useSchoolInfoInputData from '@features/auth/hooks/useSchoolInfoInputData';

// 학교 정보 입력 컴포넌트
function SchoolInfoInput() {
  const {
    college,
    major,
    suggestions,
    needsConfirmation,
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
            className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none`}
          >
            <option value="">단과대를 선택해 주세요</option>
            {Object.keys(majorsByCollege).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
            <option value="언어교육원">언어교육원</option>
            <option value="KU자율전공학부">KU자율전공학부</option>
            <option value="대학원">대학원</option>
          </select>
          {college !== '' && college !== 'KU자율전공학부' ? (
            <>
              <input
                type="text"
                list="signup-major-list"
                maxLength={255}
                aria-label="학과 또는 학부"
                aria-describedby={needsConfirmation ? 'major-hint' : undefined}
                value={major}
                onChange={handleChangeMajor}
                placeholder="학과(학부)를 입력해주세요"
                className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none mt-4`}
              />
              <datalist id="signup-major-list">
                {suggestions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
              {needsConfirmation && (
                <p id="major-hint" role="alert" className="mt-2 text-sm text-red-700">
                  선택한 단과대학의 학과 목록에서 찾을 수 없습니다. 단과대학과 학과명을 확인해
                  주세요. 개편 전 학과명이나 세부 전공명이 맞다면 그대로 진행할 수 있습니다.
                </p>
              )}
            </>
          ) : null}
        </div>

        {/* 다음 버튼 */}
        <button
          type="submit"
          className={`w-full py-3 mt-72 rounded-md ${gotoNextScreenValid ? 'bg-kuDarkGreen text-kuWhite hover:bg-kuGreen' : ' text-gray-500 bg-gray-100'} transition-colors`}
          disabled={!gotoNextScreenValid}
        >
          {needsConfirmation ? '입력한 학과명으로 계속' : '다음'}
        </button>
      </form>

      {/* 빈 공간 추가 */}
      <div className="mb-4"></div>
    </>
  );
}

export default SchoolInfoInput;

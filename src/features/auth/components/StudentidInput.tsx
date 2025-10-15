import useStudentidInputData from '@features/auth/hooks/useStudentidInputData';

// 학번 입력 컴포넌트
function StudentidInput() {
  // '회원가입 페이지'에서 '학번' 입력하는 것에 대한 비즈니스 로직을 담당하는 훅에서 필요한 것만 가져오기
  const { studentId, handleChangeStudentid, handleSubmitStudentid } = useStudentidInputData();

  return (
    <>
      {/* 메인 폼 */}
      <form onSubmit={handleSubmitStudentid} className="w-full max-w-sm mt-16">
        {/* '아이디를 입력해 주세요' 텍스트 */}
        <div className="w-full max-w-sm">
          <h1 className="text-left font-bold text-2xl text-black mb-12">학번을 입력해 주세요.</h1>
        </div>

        {/* 학번 입력 필드 */}
        <div className="mb-6">
          <input
            type="text"
            value={studentId}
            onChange={handleChangeStudentid}
            placeholder="학번(StudentID)"
            className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none`}
          />
        </div>

        {/* 다음 버튼 */}
        <button
          type="submit"
          className={`w-full py-3 mt-72 rounded-md ${
            studentId !== ''
              ? 'bg-kuDarkGreen text-kuWhite hover: hover:bg-kuGreen'
              : ' text-gray-500 bg-gray-100'
          } transition-colors`}
          disabled={studentId === ''}
        >
          다음
        </button>
      </form>

      {/* 빈 공간 추가 */}
      <div className="mb-4"></div>
    </>
  );
}

export default StudentidInput;

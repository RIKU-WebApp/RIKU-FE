import useStudentidInputData from '@features/auth/hooks/useStudentidInputData';

export default function StudentidInput() {
  const { studentId, ready, checking, handleChangeStudentid, handleSubmitStudentid } =
    useStudentidInputData();
  return (
    <form onSubmit={handleSubmitStudentid} className="w-full max-w-sm mt-16">
      <h1 className="text-left font-bold text-2xl text-black mb-12">
        <label htmlFor="signup-id">학번을 입력해 주세요.</label>
      </h1>
      <input
        id="signup-id"
        type="text"
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        pattern="([0-9]{9}|KL[0-9]{6})"
        readOnly={checking}
        value={studentId}
        onChange={handleChangeStudentid}
        placeholder="학번(StudentID)"
        aria-describedby="id-help"
        className="w-full px-4 py-2 border border-gray-300 rounded-md"
      />
      <p id="id-help" className="mt-2 text-sm text-gray-600">
        학번은 숫자 9자리입니다. 언어교육원은 KL로 시작하는 수강생 번호(KL + 숫자 6자리)를 입력해
        주세요.
      </p>
      <button
        type="submit"
        disabled={!ready}
        className="w-full py-3 mt-72 rounded-md bg-kuDarkGreen text-white disabled:bg-gray-100 disabled:text-gray-500"
      >
        {checking ? '확인 중…' : '다음'}
      </button>
    </form>
  );
}

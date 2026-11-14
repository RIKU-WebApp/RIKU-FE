import SignupStep from './SignupStep';
import useStudentidInputData from '@features/auth/hooks/useStudentidInputData';

export default function StudentidInput() {
  const { studentId, ready, checking, handleChangeStudentid, handleSubmitStudentid } =
    useStudentidInputData();
  return (
    <SignupStep
      title="학번을 입력해 주세요."
      onSubmit={handleSubmitStudentid}
      disabled={!ready}
      action={checking ? '확인 중…' : '다음'}
    >
      <input
        aria-label="학번"
        placeholder="학번"
        type="text"
        enterKeyHint="next"
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        readOnly={checking}
        value={studentId}
        onChange={handleChangeStudentid}
        className="w-full rounded-md border border-gray-300 px-4 py-2"
      />
    </SignupStep>
  );
}

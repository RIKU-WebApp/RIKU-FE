import SignupStep from './SignupStep';
import useNameInputData from '@features/auth/hooks/useNameInputData';

export default function NameInput() {
  const { name, ready, handleChangeName, handleSubmitName } = useNameInputData();
  return (
    <SignupStep title="이름을 입력해 주세요." onSubmit={handleSubmitName} disabled={!ready}>
      <input
        type="text"
        aria-label="이름"
        autoComplete="name"
        enterKeyHint="next"
        value={name}
        onChange={handleChangeName}
        placeholder="이름"
        className="w-full rounded-md border border-gray-300 px-4 py-2"
      />
    </SignupStep>
  );
}

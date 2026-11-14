import useNameInputData from '@features/auth/hooks/useNameInputData';

export default function NameInput() {
  const { name, ready, handleChangeName, handleSubmitName } = useNameInputData();
  return (
    <form onSubmit={handleSubmitName} className="w-full max-w-sm mt-16">
      <h1 className="text-left font-bold text-2xl text-black mb-12">
        <label htmlFor="signup-name">이름을 입력해 주세요.</label>
      </h1>
      <input
        id="signup-name"
        type="text"
        autoComplete="name"
        maxLength={20}
        value={name}
        onChange={handleChangeName}
        placeholder="이름"
        aria-describedby="name-help"
        className="w-full px-4 py-2 border border-gray-300 rounded-md"
      />
      <p id="name-help" className="mt-2 text-sm text-gray-600">
        이름은 공백을 포함해 20자까지 입력할 수 있습니다.
      </p>
      <button
        type="submit"
        disabled={!ready}
        className="w-full py-3 mt-72 rounded-md bg-kuDarkGreen text-white disabled:bg-gray-100 disabled:text-gray-500"
      >
        다음
      </button>
    </form>
  );
}

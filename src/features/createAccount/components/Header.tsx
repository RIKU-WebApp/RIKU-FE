// 회원가입 페이지의 헤더 컴포넌트의 props 타입 정의
interface HeaderProps {
  handlePrev: () => void;
  step: number;
}

// 회원가입 페이지의 헤더 컴포넌트
function Header({ handlePrev, step }: HeaderProps) {
  return (
    <>
      {/* Header 부분(뒤로가기 버튼과 Progress 번호 있는 곳) */}
      <div className="flex justify-between items-center w-full max-w-sm">
        <button onClick={handlePrev} className="text-black text-lg">
          &larr;
        </button>
        <span className="text-gray-400 text-sm">{step}/5</span>
      </div>
    </>
  );
}

export default Header;

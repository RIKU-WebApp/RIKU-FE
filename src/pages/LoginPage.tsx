import useLoginPage from '@features/auth/hooks/useLoginPage';
import riku_logo from '@assets/riku_logo_loginPage.png'; //라이쿠 로고 불러오기
import { Link } from 'react-router-dom'; // Link 컴포넌트 import

// 로그인을 진행하는 "최상단" 컴포넌트 -> Route에 바로 붙일 수 있는 컴포넌트
function LoginPage() {
  const {
    id,
    setID,
    password,
    setPassword,
    handleKeyDown,
    handleLoginClick,
    handleFindIDPW,
    isLoginBtnValid,
  } = useLoginPage(); // '로그인 페이지'에 대한 비즈니스 로직을 담당하는 훅에서 필요한 것만 가져오기

  //Tailwind를 사용하여 스타일링 진행
  return (
    <div className="min-h-screen flex items-center justify-center bg-whiteSmoke p-4">
      <div className="bg-whiteSmoke p-6 rounded-lg w-full max-w-sm">
        <img src={riku_logo} alt="Riku_Logo" className="mx-auto mb-12 mt-8 w-auto h-auto" />{' '}
        {/* 원본 크기 유지 */}
        {/* 학번 입력 */}
        <div className="mb-4">
          <input
            id="student-id"
            type="text"
            value={id}
            onChange={(e) => setID(e.target.value)}
            placeholder="학번(ID)"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={handleKeyDown}
          />
        </div>
        {/* 비밀번호 입력 */}
        <div className="mb-6">
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={handleKeyDown}
          />
        </div>
        {/* 로그인 버튼 */}
        <button
          className={`w-full py-2 ${
            isLoginBtnValid()
              ? 'bg-kuGreen hover:bg-kuDarkGreen text-white'
              : 'bg-kuLightGray text-gray-900 cursor-not-allowed'
          } font-bold rounded-md transition-colors`}
          onClick={handleLoginClick}
          disabled={!isLoginBtnValid()}
        >
          로그인
        </button>
        {/* 회원가입 / ID/PW 찾기 */}
        <div className="flex flex-col items-center mt-4 text-sm text-gray-500 space-y-1">
          <div className="flex space-x-4">
            <Link to="/create-account" className="hover:text-gray-700">
              회원가입하기
            </Link>
            <span>|</span>
            <a
              href="#"
              className="hover:text-gray-700"
              onClick={(e) => {
                e.preventDefault(); //기본 동작인 페이지 새로고침 방지
                handleFindIDPW(); //핸들링 함수 호출
              }}
            >
              ID/PW 찾기
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

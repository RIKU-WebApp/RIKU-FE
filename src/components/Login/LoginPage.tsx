import React, { useState } from 'react';
import riku_logo from '../../assets/riku_logo.png'; //라이쿠 로고 불러오기
import { Link, useNavigate } from 'react-router-dom'; // Link 컴포넌트 import

//로그인 페이지 
function LoginPage() {

  const navigate = useNavigate(); //useNavigate 훅을 사용해 navigate 함수 생성

  //로그인 버튼을 눌렀을 때 수행해야 할 로직을 담은 함수 (추후 로그인 API 연동 예정)
  function handleLoginClick()
  {
    navigate('/schedule-page'); //버튼 클릭 시 '/schedule-page'로 이동
  }

  const [id, setID] = useState<string>(''); //ID state
  const [password, setPassword] = useState<string>(''); //비밀번호가 유효한지 확인하기 위한 state
  
  //Tailwind를 사용하여 스타일링 진행
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-sm">
        <img src={riku_logo} alt="Riku_Logo" className="mx-auto mb-12 mt-8 w-auto h-auto"/> {/* 원본 크기 유지 */}

        {/* 학번 입력 */}
        <div className="mb-4">
          <input
            id="student-id"
            type="text"
            value={id}
            onChange={(e) => setID(e.target.value)}
            placeholder="학번(ID)를 입력하세요"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 비밀번호 입력 */}
        <div className="mb-6">
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 로그인 버튼 */}
        <button 
          className="w-full py-2 bg-kuGreen text-white rounded-md hover:bg-kuDarkGreen transition-colors"
          onClick={handleLoginClick}>
          로그인하기
        </button>

        {/* 회원가입 / ID/PW 찾기 */}
        <div className="flex flex-col items-center mt-4 text-sm text-gray-500 space-y-1">
          <div className="flex space-x-4">
            <Link to="/student-id" className="hover:text-gray-700">
              회원가입하기
            </Link>
            <span>|</span>
            <a href="#" className="hover:text-gray-700">
              ID/PW 찾기
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
import React, { useState } from 'react';
import riku_logo from '../../assets/riku_logo.png'; //라이쿠 로고 불러오기
import { Link, useNavigate } from 'react-router-dom'; // Link 컴포넌트 import
import customAxios from '../../apis/customAxios'; //커스텀 axios 호출

import axios from 'axios'

//로그인 페이지 
function LoginPage() {

  const navigate = useNavigate(); //useNavigate 훅을 사용해 navigate 함수 생성

  const [id, setID] = useState<string>(''); //ID state
  const [password, setPassword] = useState<string>(''); //비밀번호가 유효한지 확인하기 위한 state

  //로그인 버튼을 눌렀을 때 수행해야 할 로직을 담은 함수 (추후 로그인 API 연동 예정)
  async function handleLoginClick()
  {
    //ID와 패스워드 필드를 모두 채우지 않았다면.. 그냥 return
    if(id.length === 0 || password.length === 0)
    {
      alert('아이디와 비밀번호를 모두 입력해 주세요!');
      return; 
    }

    //post 요청 보낼 data 생성
    const data = {
      "studentId": id,
      "password": password
    }

    const url = '/users/login';
    try {
      const response = await customAxios.post(url, data);
      if(response.data.isSuccess === true)
      {
        console.log(response.data.result.jwtInfo.accessToken);
        alert(`로그인에 성공했습니다! 회원의 학번: ${response.data.result.studentId}`);
        localStorage.setItem('accessToken', JSON.stringify(response.data.result.jwtInfo.accessToken));
        navigate('/tab/main'); //버튼 클릭 시 '/tab'으로 이동
      } else {
        alert(`로그인 실패, 사유: ${response.data.responseMessage}`);
      }
    } catch(error) {
      // AxiosError 타입으로 확인
      if (axios.isAxiosError(error)) {
        if (error.code === 'ERR_BAD_REQUEST') {
          alert('ERR_BAD_REQUEST 발생: 잘못된 요청입니다.');
        } else if (error.response?.status === 400) {
          alert('400 Bad Request: 잘못된 요청입니다.');
        } else {
          alert('기타 Axios 오류! 다시 시도해 주십시오');
        }
      } else {
        alert('예상치 못한 오류 발생! 다시 시도해 주십시오');
      }
    }
  }
  
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
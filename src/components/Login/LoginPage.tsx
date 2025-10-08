import React, { useState } from 'react';
import riku_logo from '../../assets/riku_logo_loginPage.png'; //라이쿠 로고 불러오기
import { Link, useNavigate } from 'react-router-dom'; // Link 컴포넌트 import
import customAxios from '../../apis/customAxios'; //커스텀 axios 호출
import axios from 'axios';

//ID와 비밀번호 찾기 버튼을 눌렀을 경우의 이벤트 처리
function handleFindIDPW() {
  alert('열심히 기능 준비 중입니다!');
}

//로그인 페이지
function LoginPage() {
  //로그인 세션이 있으면 메인페이지로 연결
  // useEffect(() => {
  //   const token = localStorage.getItem("accessToken");

  //   if (token) {
  //     console.log("자동 로그인?: ", token);
  //     // 이미 로그인 되어 있는 경우
  //     navigate("/tab/main");
  //   }
  // }, []);

  const navigate = useNavigate(); //useNavigate 훅을 사용해 navigate 함수 생성

  const [id, setID] = useState<string>(''); //ID state
  const [password, setPassword] = useState<string>(''); //비밀번호가 유효한지 확인하기 위한 state

  //로그인 버튼 활성,비활성 관리
  function isLoginBtnValid() {
    return id.trim().length > 0 && password.trim().length > 0;
  }

  //로그인 버튼을 눌렀을 때 수행해야 할 로직을 담은 함수 (추후 로그인 API 연동 예정)
  async function handleLoginClick() {
    //ID와 패스워드 필드를 모두 채우지 않았다면.. 그냥 return
    if (id.length === 0 || password.length === 0) {
      alert('아이디와 비밀번호를 모두 입력해 주세요!');
      return;
    }

    //post 요청 보낼 data 생성
    const data = {
      studentId: id,
      password: password,
    };

    const url = '/user/login';

    try {
      const response = await customAxios.post(url, data);
      // 성공적인 응답 처리
      if (response.data.isSuccess) {
        // alert(`로그인에 성공했습니다! 회원의 학번: ${response.data.result.studentId}`);

        localStorage.setItem(
          'accessToken',
          JSON.stringify(response.data.result.jwtInfo.accessToken)
        );
        localStorage.setItem('MyId', JSON.stringify(response.data.result.userId));
        navigate('/tab/main'); // 로그인 성공 시 메인 페이지로 이동
      } else {
        // 요청 실패 처리
        alert(`로그인 실패, 사유: ${response.data.responseMessage}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const { responseCode, result } = error.response.data;

          // 요청 값 오류 (responseCode 2020)인 경우
          if (responseCode === 2020 && result?.errors?.length > 0) {
            let errorMessages = '유효하지 않은 입력입니다:\n';

            result.errors.forEach(
              (err: { fieldName: string; rejectValue: string; message: string }) => {
                console.warn(
                  `오류 필드: ${err.fieldName}, 거부 값: ${err.rejectValue}, 메시지: ${err.message}`
                );
                errorMessages += `- ${err.fieldName}: ${err.message} (입력 값: ${err.rejectValue})\n`;
              }
            );

            alert(errorMessages); // 모든 오류를 한 번에 출력
            return;
          }

          // 일반적인 400 Bad Request 처리
          if (error.response.status === 400) {
            alert('400 Bad Request: 요청 데이터가 올바르지 않습니다.');
            return;
          }

          // 서버 오류(500 등)
          alert(`서버 오류 발생! 상태 코드: ${error.response.status}`);
        } else if (error.request) {
          // 요청이 전송되었지만 응답이 없는 경우
          alert('서버에서 응답이 없습니다. 네트워크 상태를 확인하고 다시 시도해 주세요.');
        } else {
          // 기타 Axios 요청 관련 에러
          alert(`예상치 못한 오류 발생: ${error.message}`);
        }
      } else {
        // Axios 외의 오류 처리
        alert('알 수 없는 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    }
  }

  //엔터키로 로그인 버튼 작동하게 하는 함수
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLoginClick();
    }
  };

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
            <Link to="/student-id" className="hover:text-gray-700">
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

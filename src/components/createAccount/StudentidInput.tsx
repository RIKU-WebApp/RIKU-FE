import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; //react-router-dom 라이브러리를 사용 (useNavigation 사용할 예정)

import { useDispatch } from 'react-redux'; 
import { setStudentID } from '../../redux/slices/signupSlice' //Action Creator를 import 해온다!

import axios from 'axios'; //axios(서버와의 통신을 위한 라이브러리) import!

//학번의 유효성을 검사하는 메소드 validateStudentID
function validateStudentID(id: string) {
  const currentYear = new Date().getFullYear();
  const idRegex = /^\d{9}$/;

  if (!idRegex.test(id)) {
    return { valid: false, message: "학번은 9자리 숫자여야 합니다." };
  }

  const year = parseInt(id.slice(0, 4), 10);
  if (year > currentYear) {
    return { valid: false, message: "유효한 형식의 학번이 아닙니다" };
  }

  return { valid: true, message: "유효한 학번입니다." };
}

//학생의 학번을 입력하는 화면인 studentIDInput (추후 중복 검사 후 다음 화면으로 넘어가게 설계해야 함)
function StudentidInput() {
  const [studentID, setStudentIDInput] = useState<string>("");
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [isValidID, setIsValidID] = useState<boolean>(false);
  const navigate = useNavigate(); //제출 후에 다음 화면으로 넘어가기 위해 useNavigate() hook 활용!
  const dispatch = useDispatch(); //redux 사용을 위해 useDispatch 훅 활용

  //Form의 입력 값이 바뀔 때마다 취하는 액션을 정의한 handleChange 메소드
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setStudentIDInput(input);

    const result = validateStudentID(input);
    setValidationMessage(result.message);
    setIsValidID(result.valid);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    //학번이 유효한 형태인 경우
    if (isValidID) {
      // //학번 중복 확인을 서버 요청을 통해 먼저 진행해야 한다 (try-catch 구문 활용)
      // try {
      //   const response = await axios.get(`/validate/loginId?loginId=${studentID}`);
      //   // 서버로부터 성공적인 응답을 받은 경우 처리
      //   alert('학번이 중복되지 않습니다! 다음으로 넘어갑니다');
        
      // } catch(error) {
      //   // 오류가 발생한 경우 처리
      //   if (axios.isAxiosError(error)) {
      //     alert('An error occurred while validating the Login ID: ' + (error.response?.data?.message || error.message));
      //   } else {
      //     alert('An unexpected error occurred');
      //   }
      // }

      alert("학번이 유효합니다!");
      //redux 저장소에 studentID 저장
      dispatch(setStudentID(studentID));
      navigate('/password-input'); //'/next-step'라는 값을 가진 컴포넌트로 이동한다 (navigating)
      
    } else {
      alert("학번을 다시 확인해주세요.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-white px-6 py-10">
      {/* Header 부분(뒤로가기 버튼과 Progress 번호 있는 곳) */}
      <div className="flex justify-between items-center w-full max-w-sm">
        <button onClick={() => navigate(-1)} className="text-black text-lg">
          &larr;
        </button>
        <span className="text-gray-400 text-sm">1/5</span>
      </div>

      
  
      {/* Main Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm mt-16">
        {/* '아이디를 입력해 주세요' 텍스트 */}
        <div className="w-full max-w-sm">
          <h1 className="text-left font-bold text-2xl text-black mb-12">학번을 입력해 주세요.</h1>
        </div>
  
        {/* 학번 입력 필드 */}
        <div className="mb-6">
          <input
            type="text"
            value={studentID}
            onChange={handleChange}
            placeholder="학번(StudentID)"
            className={`w-full px-4 py-2 border ${studentID === '' ? 'border-gray-300' : isValidID ? 'border-gray-300' : 'border-red-500'} rounded-md focus:outline-none`}
          />
          <div className="w-full max-w-sm">
            {!(isValidID || studentID === '') && <p className="text-red-500 text-sm mt-2 text-left">{validationMessage}</p>}
          </div>
        </div>

        {/* 다음 버튼 */}
        <button
          type="submit"
          className={`w-full py-3 mt-72 rounded-md ${isValidID ? 'bg-kuDarkGreen text-kuWhite hover: hover:bg-kuGreen' : ' text-gray-500 bg-gray-100'} transition-colors`}
          disabled={!isValidID}
        >
          다음
        </button>
      </form>

      {/* 빈 공간 추가 */}
      <div className="mb-4"></div>
    </div>
  );
  
}

export default StudentidInput;

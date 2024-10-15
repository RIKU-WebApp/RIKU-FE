import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; //react-router-dom 라이브러리를 사용 (useNavigation 사용할 예정)

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
  const [studentID, setStudentID] = useState<string>("");
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [isValidID, setIsValidID] = useState<boolean>(false);
  const navigate = useNavigate(); // to handle navigation after submission

  //Form의 입력 값이 바뀔 때마다 취하는 액션을 정의한 handleChange 메소드
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setStudentID(input);

    const result = validateStudentID(input);
    setValidationMessage(result.message);
    setIsValidID(result.valid);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    //학번이 유효한 경우
    if (isValidID) {
      alert("학번이 유효합니다!");
      navigate('/next-step'); //'/next-step'라는 값을 가진 컴포넌트로 이동한다 (navigating)
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
        <h1 className="text-left font-medium text-black mb-4">아이디를 입력해 주세요.</h1>
  
        {/* 학번 입력 필드 */}
        <div className="mb-6">
          <input
            type="text"
            value={studentID}
            onChange={handleChange}
            placeholder="아이디"
            className={`w-full px-4 py-2 border ${isValidID ? 'border-gray-300' : 'border-red-500'} rounded-md focus:outline-none focus:ring-2 focus:ring-kuDarkGreen`}
          />
          {!isValidID && <p className="text-red-500 text-sm mt-2">{validationMessage}</p>}
        </div>
  
        {/* 다음 버튼 */}
        <button
          type="submit"
          className={`w-full py-3 text-gray-500 bg-gray-100 rounded-md ${isValidID ? 'hover:bg-gray-300' : ''} transition-colors`}
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

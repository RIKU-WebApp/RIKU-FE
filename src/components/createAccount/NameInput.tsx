import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; //react-router-dom 라이브러리를 사용 (useNavigation 사용할 예정)

//redux를 사용하기 위한 구문
import { useDispatch } from 'react-redux'; 
import { setName } from '../../redux/slices/signupSlice' //Action Creator를 import 해온다!

//이름을 입력하는 화면인 NameInput
function NameInput() {
  const navigate = useNavigate(); //제출 후에 다음 화면으로 넘어가기 위해 useNavigate() hook 활용!
  
  const dispatch = useDispatch(); //dispatch 함수를 가져온다 (useDispatch)
  const [name, setNameInput] = useState<string>("");

  //'이름' 입력 란의 입력 값이 바뀔 때마다 취하는 액션을 정의한 handleChangeName 메소드
  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setNameInput(input);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    //이름에는 유효한 입력 상태가 딱히 존재하지 않으므로, 바로 다음 버튼을 누를 경우, alert()를 띄우며 navigate를 통해 다음으로 넘어가도록 한다
    alert("이름 입력을 완료했습니다");

    // Dispatch the action to update the Redux state
    dispatch(setName(name)); 
    
    navigate('/school-info');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-white px-6 py-10">
      {/* Header 부분(뒤로가기 버튼과 Progress 번호 있는 곳) */}
      <div className="flex justify-between items-center w-full max-w-sm">
        <button onClick={() => navigate(-1)} className="text-black text-lg">
          &larr;
        </button>
        <span className="text-gray-400 text-sm">3/5</span>
      </div>

      
  
      {/* Main Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm mt-16">
        {/* '아이디를 입력해 주세요' 텍스트 */}
        <div className="w-full max-w-sm">
          <h1 className="text-left font-bold text-2xl text-black mb-12">이름을 입력해 주세요.</h1>
        </div>
  
        {/* 비밀번호 입력 필드 */}
        <div className="mb-6">
          <input
            type="text"
            value={name}
            onChange={handleChangeName}
            placeholder="이름"
            className={`w-full px-4 py-2 border 'border-gray-300' rounded-md focus:outline-none`}
          />
        </div>

        {/* 다음 버튼 */}
        <button
          type="submit"
          className={`w-full py-3 mt-72 rounded-md ${(name !== '') ? 'bg-kuDarkGreen text-kuWhite hover: hover:bg-kuGreen' : ' text-gray-500 bg-gray-100'} transition-colors`}
          disabled={(name === '')}
        >
          다음
        </button>
      </form>

      {/* 빈 공간 추가 */}
      <div className="mb-4"></div>
    </div>
  );
  
}

export default NameInput;
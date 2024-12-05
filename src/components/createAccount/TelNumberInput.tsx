import React, { useState, useEffect } from 'react';
import { UNSAFE_ErrorResponseImpl, useNavigate } from 'react-router-dom'; //react-router-dom 라이브러리를 사용 (useNavigation 사용할 예정)

import { useDispatch, useSelector} from 'react-redux'; //상태값을 가져오기 위해 useSelector 사용
import { setTelNum } from '../../redux/slices/signupSlice' //Action Creator를 import 해온다!
import { RootState } from '../../redux/store'

import customAxios from '../../apis/customAxios' //커스텀 axios 컴포넌트 가져오기

//비밀번호를 입력하는 화면인 PasswordInput
function TelNumberInput() {
  const navigate = useNavigate(); //제출 후에 다음 화면으로 넘어가기 위해 useNavigate() hook 활용!

  const [telNum, setTelNumInput] = useState<string>(''); //전화번호를 저장하는 state

  const dispatch = useDispatch(); //redux 사용을 위해 useDispatch 활용
  const signupState = useSelector((state: RootState) => state.signup); //상태값 가져오기

  //'비밀번호' 입력 란의 입력 값이 바뀔 때마다 취하는 액션을 정의한 handleChangeInPassword 메소드
  const handleChangeTelNum = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setTelNumInput(input);
  };

  //서버에 회원가입 request 진행(POST 요청)
  const signUpRequest = async () => {

    //post 요청 보낼 data 세팅
    const data = {
      "studentId" : signupState.studentID,
      "password": signupState.password,
      "name": signupState.name,
      "college": signupState.collegeName,
      "major": signupState.departmentName,
      "phone": signupState.telNum
    }

    console.log('구성된 데이터: ', data);

    //해당 구역에 axios 요청을 진행할 것임(서버에 입력된 회원 정보를 저장해야 함)
    try {
      const response = await customAxios.post('/users/signup', data)
      if(response.data.isSuccess === "true")
      {
        alert('정상적으로 회원 가입이 완료되었습니다');
        navigate('/login-page'); //'/next-step'라는 값을 가진 컴포넌트로 이동한다 (navigating)
      } else if(response.data.isSuccess === "false") {
        alert(response.data.responseMessage);
      }
    } catch (error) {
      alert(error);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    //전화번호 입력 후 '다음' 버튼을 입력했을 경우(해당 경우에 대해서는 axios 요청을 진행해야 함)
    if (telNum === '') {
      alert("전화번호가 입력되지 않았습니다. 그대로 진행합니다");
    } else {
      alert("전화번호가 입력되었습니다. 이대로 진행합니다");
    }
    dispatch(setTelNum(telNum)); //redux 저장소에 저장
    
    signUpRequest(); //회원가입 수행
  };

  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-white px-6 py-10">
      {/* Header 부분(뒤로가기 버튼과 Progress 번호 있는 곳) */}
      <div className="flex justify-between items-center w-full max-w-sm">
        <button onClick={() => navigate(-1)} className="text-black text-lg">
          &larr;
        </button>
        <span className="text-gray-400 text-sm">5/5</span>
      </div>

      
  
      {/* Main Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm mt-16">
        {/* '아이디를 입력해 주세요' 텍스트 */}
        <div className="w-full max-w-sm">
          <h1 className="text-left font-bold text-2xl text-black mt-12">전화번호를 입력해 주세요.</h1>
          <h3 className="text-left font-medium text-sm text-gray-500 mb-12">전화번호 입력은 선택 사항입니다(ex. 010-1111-1111)</h3>
        </div>
  
        {/* 전화번호 필드 */}
        <div className="mb-6">
          <input
            type="text"
            value={telNum}
            onChange={handleChangeTelNum}
            placeholder="전화번호"
            className={`w-full px-4 py-2 border 'border-gray-300' rounded-md focus:outline-none`}
          />
        </div>

        {/* 다음 버튼 */}
        <button
          type="submit"
          className={`w-full py-3 mt-72 rounded-md bg-kuDarkGreen text-kuWhite hover: hover:bg-kuGreen transition-colors`}
        >
          다음
        </button>
      </form>

      {/* 빈 공간 추가 */}
      <div className="mb-4"></div>
    </div>
  );
  
}

export default TelNumberInput;
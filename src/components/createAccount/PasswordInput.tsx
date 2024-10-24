import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; //react-router-dom 라이브러리를 사용 (useNavigation 사용할 예정)

//redux를 사용하기 위한 구문
import { useDispatch } from 'react-redux'; 
import { setPassword } from '../../redux/slices/signupSlice' //Action Creator를 import 해온다!

//비밀번호가 유효한지 확인하는 메소드 validatePassword
function validatePassword(password: string) {
  // 영문, 숫자, 특수문자 조합 8~20자리까지 가능
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;

  if (!passwordRegex.test(password)) {
    return { valid: false, message: "영문, 숫자, 특수문자 조합 8~20자리까지 가능합니다." };
  } else {
    return { valid: true, message: "유효한 비밀번호 형식입니다" };
  }
}

//비밀번호를 입력하는 화면인 PasswordInput
function PasswordInput() {
  const [password, setPasswordInput] = useState<string>("");
  const [passwordConfirm, setPasswordConfirm] = useState<string>("");
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [validationMessageInConfirm, setValidationMessageInConfirm] = useState<string>("");
  const [isValidPW, setIsValidPW] = useState<boolean>(false);
  const [isValidPWConfirm, setIsValidPWConfirm] = useState<boolean>(false);
  const navigate = useNavigate(); //제출 후에 다음 화면으로 넘어가기 위해 useNavigate() hook 활용!
  const dispatch = useDispatch(); //redux 저장소 사용을 위해 useDispatch 사용

  //'비밀번호' 입력 란의 입력 값이 바뀔 때마다 취하는 액션을 정의한 handleChangeInPassword 메소드
  const handleChangeInPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setPasswordInput(input);

    const result = validatePassword(input);
    setValidationMessage(result.message);
    setIsValidPW(result.valid); //유효한 비밀번호인지를 확인하여 그것으로 set한다(true/false)
  };

  //'비밀번호' 입력 란의 입력 값이 바뀔 때마다 취하는 액션을 정의한 handleChangeInPassword 메소드
  const handleChangeInPasswordConfirm = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordConfirm(e.target.value);
  };

  //useEffect로 passwordConfirm 값과 password 상태가 변경될 때마다 확인 (상태 변경은 React에서 비동기적으로 처리될 수 있기 때문)
  useEffect(() => {
    if(passwordConfirm === password) {
      setValidationMessageInConfirm("비밀번호가 일치합니다");
      setIsValidPWConfirm(true);
    } else {
      setValidationMessageInConfirm("비밀번호가 일치하지 않습니다");
      setIsValidPWConfirm(false);
    }
  }, [password, passwordConfirm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    //비밀번호가 유효한 경우
    if (isValidPW) {
      alert("비밀번호가 유효합니다");

      //redux 저장소에 password 정보 저장
      dispatch(setPassword(password));

      navigate('/name-input'); //'/next-step'라는 값을 가진 컴포넌트로 이동한다 (navigating)
    } else {
      alert("비밀번호 설정을 다시 확인해주세요.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-white px-6 py-10">
      {/* Header 부분(뒤로가기 버튼과 Progress 번호 있는 곳) */}
      <div className="flex justify-between items-center w-full max-w-sm">
        <button onClick={() => navigate(-1)} className="text-black text-lg">
          &larr;
        </button>
        <span className="text-gray-400 text-sm">2/5</span>
      </div>

      
  
      {/* Main Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm mt-16">
        {/* '아이디를 입력해 주세요' 텍스트 */}
        <div className="w-full max-w-sm">
          <h1 className="text-left font-bold text-2xl text-black mb-12">비밀번호를 설정해 주세요.</h1>
        </div>
  
        {/* 비밀번호 입력 필드 */}
        <div className="mb-6">
          <input
            type="text"
            value={password}
            onChange={handleChangeInPassword}
            placeholder="비밀번호"
            className={`w-full px-4 py-2 border ${password === '' ? 'border-gray-300' : isValidPW ? 'border-gray-300' : 'border-red-500'} rounded-md focus:outline-none`}
          />
          <div className="w-full max-w-sm">
            {!(isValidPW || password === '') && <p className="text-red-500 text-sm text-left mt-2">{validationMessage}</p>}
          </div>
        </div>

        {/* 비밀번호 입력 확인 필드(재입력) */}
        <div className="mb-6">
          <input
            type="text"
            value={passwordConfirm}
            onChange={handleChangeInPasswordConfirm}
            placeholder="비밀번호 확인"
            className={`w-full px-4 py-2 border ${passwordConfirm === '' ? 'border-gray-300' : isValidPWConfirm ? 'border-kuDarkGreen' : 'border-red-500'} rounded-md focus:outline-none`}
          />
          <div className="w-full max-w-sm">
            {!(passwordConfirm === '') ? 
              (isValidPWConfirm ? <p className="text-kuDarkGreen text-sm mt-2 text-left">{validationMessageInConfirm}</p> : <p className="text-red-500 text-sm mt-2 text-left">{validationMessageInConfirm}</p>) : null}
          </div>
        </div>

        {/* 다음 버튼 */}
        <button
          type="submit"
          className={`w-full py-3 mt-72 rounded-md ${(isValidPW && isValidPWConfirm) ? 'bg-kuDarkGreen text-kuWhite hover: hover:bg-kuGreen' : ' text-gray-500 bg-gray-100'} transition-colors`}
          disabled={!(isValidPW && isValidPWConfirm)}
        >
          다음
        </button>
      </form>

      {/* 빈 공간 추가 */}
      <div className="mb-4"></div>
    </div>
  );
  
}

export default PasswordInput;

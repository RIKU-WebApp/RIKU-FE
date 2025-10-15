import { useState } from 'react';
import { useCreateAccountData } from '@features/auth/hooks/useCreateAccountData';

// 비밀번호 입력 컴포넌트에 대한 비즈니스 로직을 담당하는 훅
function usePasswordInputData() {
  const { setSignupData, handleNext, signupData } = useCreateAccountData(); // '회원가입 페이지' 전체의 비즈니스 로직을 담당하는 훅에서 필요한 것만 가져오기

  const [password, setPasswordInput] = useState<string>(''); // 비밀번호를 저장하는 state
  const [passwordConfirm, setPasswordConfirm] = useState<string>(''); // '비밀번호 확인' 입력 란의 입력 값을 저장하는 state
  const [validationMessage, setValidationMessage] = useState<string>(''); // '비밀번호' 입력 란의 유효성 검사 메시지를 저장하는 state
  const [validationMessageInConfirm, setValidationMessageInConfirm] = useState<string>(''); // '비밀번호 확인' 입력 란의 유효성 검사 메시지를 저장하는 state
  const [isValidPW, setIsValidPW] = useState<boolean>(false); // '비밀번호' 입력 란의 유효성 검사 결과를 저장하는 state
  const [isValidPWConfirm, setIsValidPWConfirm] = useState<boolean>(false); // '비밀번호 확인' 입력 란의 유효성 검사 결과를 저장하는 state

  //비밀번호가 유효한지 확인하는 메소드 validatePassword
  const validatePassword = (password: string) => {
    // 영문, 숫자, 특수문자 조합 8~20자리까지 가능
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;

    if (!passwordRegex.test(password)) {
      return { valid: false, message: '영문, 숫자, 특수문자 조합 8~20자리까지 가능합니다.' };
    } else {
      return { valid: true, message: '유효한 비밀번호 형식입니다' };
    }
  };

  //'비밀번호' 입력 란의 입력 값이 바뀔 때마다 취하는 액션을 정의한 handleChangeInPassword 메소드
  const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setPasswordInput(input);

    const result = validatePassword(input);
    setValidationMessage(result.message);
    setIsValidPW(result.valid); //유효한 비밀번호인지를 확인하여 그것으로 set한다(true/false)
  };

  //'비밀번호 확인' 입력 란의 입력 값이 바뀔 때마다 취하는 액션을 정의한 handleChangeInPasswordConfirm 메소드
  const handleChangePasswordConfirm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPasswordConfirm(value);

    // 비밀번호가 일치하는지 확인
    if (value === password) {
      setValidationMessageInConfirm('비밀번호가 일치합니다');
      setIsValidPWConfirm(true);
    } else {
      setValidationMessageInConfirm('비밀번호가 일치하지 않습니다');
      setIsValidPWConfirm(false);
    }
  };

  // 비밀번호 입력 후 '다음' 버튼을 입력했을 경우
  const handleSubmitPassword = (e: React.FormEvent) => {
    e.preventDefault();

    //비밀번호가 유효한 경우
    if (isValidPW) {
      setSignupData({ ...signupData, password: password }); // 비밀번호 signupData에 저장
      handleNext(); // 다음 step으로 핸들링
    } else {
      alert('비밀번호 설정을 다시 확인해주세요.');
    }
  };

  return {
    password,
    setPasswordInput,
    handleChangePassword,
    passwordConfirm,
    setPasswordConfirm,
    handleChangePasswordConfirm,
    handleSubmitPassword,
    validationMessage,
    validationMessageInConfirm,
    isValidPW,
    isValidPWConfirm,
  };
}

export default usePasswordInputData;

import { useState } from 'react';
import { useCreateAccountData } from '@features/auth/hooks/useCreateAccountData';
import postSignUpRequest from '@features/auth/api/postSignUpRequest';

// 전화번호 입력 컴포넌트에 대한 비즈니스 로직을 담당하는 훅
function useTelNumberInputData() {
  const { setSignupData, handleNext, signupData } = useCreateAccountData(); // '회원가입 페이지' 전체의 비즈니스 로직을 담당하는 훅에서 필요한 것만 가져오기

  const [phone, setPhoneInput] = useState<string>(''); //전화번호를 저장하는 state

  //'비밀번호' 입력 란의 입력 값이 바뀔 때마다 취하는 액션을 정의한 handleChangeInPassword 메소드
  const handleChangePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setPhoneInput(input);
  };

  // 전화번호 입력 후 '다음' 버튼을 입력했을 경우
  const handleSubmitPhone = async (e: React.FormEvent) => {
    e.preventDefault();

    //전화번호 입력 후 '다음' 버튼을 입력했을 경우(해당 경우에 대해서는 axios 요청을 진행해야 함)
    if (phone === '') {
      alert('전화번호가 입력되지 않았습니다. 그대로 진행합니다');
    } else {
      alert('전화번호가 입력되었습니다. 이대로 진행합니다');
      setSignupData({ ...signupData, phone: phone }); // 전화번호 signupData에 저장
      const isSuccess = await postSignUpRequest({ ...signupData, phone: phone }); // 회원가입 요청
      if (isSuccess) {
        // 회원가입이 성공했을 경우에만
        handleNext();
      }
    }
  };

  return { phone, setPhoneInput, handleChangePhone, handleSubmitPhone };
}

export default useTelNumberInputData;

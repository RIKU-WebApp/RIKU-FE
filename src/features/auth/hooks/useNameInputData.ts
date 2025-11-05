import { useState } from 'react';
import { useCreateAccountData } from '@features/auth/hooks/useCreateAccountData';

// 이름 입력 컴포넌트에 대한 비즈니스 로직을 담당하는 훅
function useNameInputData() {
  const { setSignupData, handleNext, signupData } = useCreateAccountData(); // '회원가입 페이지' 전체의 비즈니스 로직을 담당하는 훅에서 필요한 것만 가져오기

  const [name, setName] = useState<string>('');

  // '이름' 입력 란의 입력 값이 바뀔 때마다 취하는 액션을 정의한 handleChangeName 메소드
  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setName(input); // 이름 입력에 따라 '다음' 버튼의 활성화 여부를 결정해야 하므로, setName() 메소드를 통해 상태 변화를 일일이 추적해야 한다
  };

  // '이름' 입력 후 '다음' 버튼을 입력했을 경우
  const handleSubmitName = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupData({ ...signupData, name: name }); // 이름 signupData에 저장
    handleNext(); // 다음 step으로 핸들링
  };

  return { name, setName, handleChangeName, handleSubmitName };
}

export default useNameInputData;

import { useState } from 'react';
import { useCreateAccountData } from '@features/auth/hooks/useCreateAccountData';
import getIsStudentidValidate from '@features/auth/api/getIsStudentidValidate';

// 학번 입력 컴포넌트에 대한 비즈니스 로직을 담당하는 훅
function useStudentidInputData() {
  const { setSignupData, handleNext, signupData } = useCreateAccountData(); // '회원가입 페이지' 전체의 비즈니스 로직을 담당하는 훅에서 필요한 것만 가져오기

  const [studentId, setStudentIdInput] = useState<string>(''); //학번을 저장하는 state

  //Form의 입력 값이 바뀔 때마다 취하는 액션을 정의한 handleChange 메소드
  const handleChangeStudentid = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setStudentIdInput(input);

    /*
			아래는 학번 유효성 검사 로직이었으나, 현재는 중복 검사만 진행하므로 주석 처리
		*/
    // const result = validateStudentID(input);
    // setValidationMessage(result.message);
    // setIsValidID(result.valid);
  };

  // 학번 입력 후 '다음' 버튼을 입력했을 경우
  const handleSubmitStudentid = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await getIsStudentidValidate(studentId); // 학번 중복 검사 수행
    if (isValid) {
      // 학번 중복 검사 성공했을 경우
      setSignupData({ ...signupData, studentId: studentId }); // 학번 signupData에 저장
      handleNext(); // 다음 step으로 핸들링
    }
  };

  return { handleChangeStudentid, handleSubmitStudentid, studentId, setStudentIdInput };
}

export default useStudentidInputData;

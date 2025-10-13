// "회원가입" 관련 내용들을 관리하는 콘텍스트 생성

import { useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignupData } from '@features/createAccount/types';
import { CreateAccountContext } from '@features/createAccount/context/CreateAccountContext';

// "회원가입" 페이지에 대한 Provider 컴포넌트
export function CreateAccountProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 초기 step은 1
  const [signupData, setSignupData] = useState<SignupData>({
    // 초기 signupData는 빈 값으로 설정 (-> telNum은 nullable 값이므로 null로 설정)
    studentId: '',
    password: '',
    name: '',
    college: '',
    major: '',
    phone: null,
  });

  // "회원가입" 페이지에서 해당하는 step으로 이동하는 핸들러
  const handleNext = () => setStep((prev) => prev + 1);
  const handlePrev = () => setStep((prev) => prev - 1);

  // "회원가입" 페이지에서 step이 0 또는 6일 경우에는 로그인 페이지로 이동
  useEffect(() => {
    if (step === 0 || step === 6) {
      navigate('/login');
    }
  }, [step, navigate]);

  return (
    <CreateAccountContext.Provider
      value={{
        step,
        handleNext,
        handlePrev,
        signupData,
        setSignupData,
      }}
    >
      {children}
    </CreateAccountContext.Provider>
  );
}

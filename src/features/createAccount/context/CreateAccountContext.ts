import { createContext } from 'react';
import { SignupData } from '@features/createAccount/types';

// Context가 제공할 값의 타입 정의
export interface CreateAccountContextType {
  step: number;
  handleNext: () => void;
  handlePrev: () => void;
  signupData: SignupData;
  setSignupData: React.Dispatch<React.SetStateAction<SignupData>>;
}

// "회원가입" 페이지에 대한 Context 생성
export const CreateAccountContext = createContext<CreateAccountContextType | null>(null);

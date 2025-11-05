// 회원가입할 때 사용하는 페이지들에 대해 사용하는 타입 정의
export interface SignupData {
  studentId: string;
  password: string;
  name: string;
  college: string;
  major: string;
  phone: string | null;
}

// 회원가입 페이지의 입력 관련 컴포넌트들에 대해 props 타입 정의
export interface signUpInputProps {
  handleNext: () => void;
  setSignupData: (signupData: SignupData) => void;
  signupData: SignupData;
}

import Header from '@features/createAccount/components/Header';
import PasswordInput from '@features/createAccount/components/PasswordInput';
import NameInput from '@features/createAccount/components/NameInput';
import SchoolInfoInput from '@features/createAccount/components/SchoolInfoInput';
import TelNumberInput from '@features/createAccount/components/TelNumberInput';
import StudentidInput from '@features/createAccount/components/StudentidInput';
import { useCreateAccountData } from '@features/createAccount/hooks/useCreateAccountData';

// 회원가입을 진행하는 페이지의 "최상단" 컴포넌트 -> Route에 바로 붙일 수 있는 컴포넌트
function CreateAccountPage() {
  const { step, handlePrev } = useCreateAccountData();

  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-whiteSmoke px-6 py-10">
      <Header handlePrev={handlePrev} step={step} />
      {/* 회원가입 페이지의 각 화면, step에 따라 해당하는 컴포넌트가 렌더링 되도록 설계 */}
      {step === 1 && <StudentidInput />}
      {step === 2 && <PasswordInput />}
      {step === 3 && <NameInput />}
      {step === 4 && <SchoolInfoInput />}
      {step === 5 && <TelNumberInput />}
    </div>
  );
}

export default CreateAccountPage;

import Header from '@features/auth/components/Header';
import PasswordInput from '@features/auth/components/PasswordInput';
import NameInput from '@features/auth/components/NameInput';
import SchoolInfoInput from '@features/auth/components/SchoolInfoInput';
import TelNumberInput from '@features/auth/components/TelNumberInput';
import StudentidInput from '@features/auth/components/StudentidInput';
import { useCreateAccountData } from '@features/auth/hooks/useCreateAccountData';

export default function CreateAccountPage() {
  const { step, handlePrev } = useCreateAccountData();
  return (
    <main className="bg-whiteSmoke px-6">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-sm flex-col py-8">
        <Header handlePrev={handlePrev} step={step} />
        {step === 1 && <StudentidInput />}
        {step === 2 && <PasswordInput />}
        {step === 3 && <NameInput />}
        {step === 4 && <SchoolInfoInput />}
        {step === 5 && <TelNumberInput />}
      </div>
    </main>
  );
}

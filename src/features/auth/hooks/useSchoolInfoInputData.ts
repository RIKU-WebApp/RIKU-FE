import { useState } from 'react';
import { useCreateAccountData } from '@features/auth/hooks/useCreateAccountData';
import { majorsByCollege } from '@features/auth/majorsByCollege';

export default function useSchoolInfoInputData() {
  const { signupData, setSignupData, handleNext } = useCreateAccountData();
  const [college, setCollege] = useState(signupData.college);
  const [major, setMajor] = useState(signupData.major);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const suggestions = majorsByCollege[college] ?? [];
  const undecided = college === 'KU자율전공학부';
  const gotoNextScreenValid = Boolean(college && (undecided || major.trim()));

  const handleChangeCollege = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCollege(e.target.value);
    setMajor('');
    setNeedsConfirmation(false);
  };
  const handleChangeMajor = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMajor(e.target.value);
    setNeedsConfirmation(false);
  };
  const handleSubmitSchoolInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gotoNextScreenValid) return;
    const value = undecided ? '미정' : major.trim();
    if (suggestions.length && !suggestions.includes(value) && !needsConfirmation) {
      setNeedsConfirmation(true);
      return;
    }
    setSignupData((prev) => ({ ...prev, college, major: value }));
    handleNext();
  };

  return {
    college,
    major,
    suggestions,
    needsConfirmation,
    gotoNextScreenValid,
    handleChangeCollege,
    handleChangeMajor,
    handleSubmitSchoolInfo,
  };
}

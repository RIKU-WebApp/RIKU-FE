import { useState } from 'react';
import { useCreateAccountData } from '@features/auth/hooks/useCreateAccountData';
import getIsStudentidValidate from '@features/auth/api/getIsStudentidValidate';

const studentIdFormat = /^(?:[0-9]{9}|KL[0-9]{6})$/;

export default function useStudentidInputData() {
  const { setSignupData, handleNext, signupData, showError } = useCreateAccountData();
  const [studentId, setStudentId] = useState(signupData.studentId);
  const [checking, setChecking] = useState(false);
  const ready = studentIdFormat.test(studentId) && !checking;

  const handleChangeStudentid = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    const warning = value.startsWith('K')
      ? '언어교육원 번호는 KL과 숫자 6자리입니다.'
      : '학번은 숫자 9자리입니다.';
    if (!/^(?:[0-9]{0,9}|K|KL[0-9]{0,6})$/.test(value)) {
      showError(warning);
      return;
    }
    setStudentId(value);
    const incomplete = value.length > 0 && !studentIdFormat.test(value);
    showError(incomplete ? warning : '');
  };

  const handleSubmitStudentid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    setChecking(true);
    try {
      if (await getIsStudentidValidate(studentId)) {
        setSignupData({ ...signupData, studentId });
        handleNext();
      }
    } finally {
      setChecking(false);
    }
  };

  return { studentId, checking, ready, handleChangeStudentid, handleSubmitStudentid };
}

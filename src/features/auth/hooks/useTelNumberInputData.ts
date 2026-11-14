import { useState } from 'react';
import { useCreateAccountData } from '@features/auth/hooks/useCreateAccountData';
import postSignUpRequest from '@features/auth/api/postSignUpRequest';

export default function useTelNumberInputData() {
  const { setSignupData, handleNext, signupData, showError } = useCreateAccountData();
  const [phone, setPhone] = useState(signupData.phone ?? '');
  const [submitting, setSubmitting] = useState(false);

  const handleChangePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
    showError('');
  };

  const handleSubmitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const value = phone.trim() || null;
    if (value && !/^01[016789]-?\d{3,4}-?\d{4}$/.test(value)) {
      showError('휴대전화 번호를 010-1234-5678 형식으로 입력하거나 비워 두세요.');
      return;
    }
    const data = { ...signupData, phone: value };
    setSignupData(data);
    setSubmitting(true);
    try {
      const problem = await postSignUpRequest(data);
      if (problem) {
        showError(problem.message, problem.step);
      } else {
        alert('정상적으로 회원 가입이 완료되었습니다');
        handleNext();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return { phone, submitting, handleChangePhone, handleSubmitPhone };
}

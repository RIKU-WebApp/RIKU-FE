import { useState } from 'react';
import { useCreateAccountData } from '@features/auth/hooks/useCreateAccountData';
import postSignUpRequest from '@features/auth/api/postSignUpRequest';

export default function useTelNumberInputData() {
  const { setSignupData, handleNext, signupData, showError } = useCreateAccountData();
  const [phone, setPhone] = useState(signupData.phone ?? '');
  const [inputError, setInputError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const phoneFormat = /^01[016789][0-9]{7,8}$/;
  const formatWarning = '휴대전화 번호는 숫자 10자리 이상, 최대 11자리입니다.';
  const canSubmit = !submitting && (!phone || phoneFormat.test(phone));

  const handleChangePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    showError('');
    if (!/^[0-9\s-]*$/.test(input)) {
      setInputError(formatWarning);
      return;
    }
    const digits = input.replace(/[\s-]/g, '');
    if (digits.length > 11) {
      setInputError(formatWarning);
      return;
    }
    setPhone(digits);
    setInputError(digits && !phoneFormat.test(digits) ? formatWarning : '');
  };

  const handleSubmitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setInputError('');
    const data = { ...signupData, phone: phone || null };
    setSignupData(data);
    setSubmitting(true);
    try {
      const problem = await postSignUpRequest(data);
      if (problem) {
        showError(problem.message, problem.step);
      } else {
        alert('가입이 완료되었습니다.');
        handleNext();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return { phone, submitting, inputError, canSubmit, handleChangePhone, handleSubmitPhone };
}

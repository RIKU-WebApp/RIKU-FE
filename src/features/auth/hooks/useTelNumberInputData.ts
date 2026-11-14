import { useState } from 'react';
import { useCreateAccountData } from '@features/auth/hooks/useCreateAccountData';
import postSignUpRequest from '@features/auth/api/postSignUpRequest';

export default function useTelNumberInputData() {
  const { setSignupData, handleNext, signupData, showError } = useCreateAccountData();
  const [phone, setPhone] = useState(signupData.phone ?? '');
  const [inputError, setInputError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const clearPhone = () => {
    setPhone('');
    setInputError('');
    showError('');
  };

  const handleChangePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    showError('');
    if (!/^[0-9\s-]*$/.test(input)) {
      setInputError('문자는 입력할 수 없습니다. 휴대전화 번호를 숫자로 입력해 주세요.');
      return;
    }
    const digits = input.replace(/[\s-]/g, '');
    if (digits.length > 11) {
      setInputError('휴대전화 번호는 숫자 10~11자리입니다.');
      return;
    }
    setInputError('');
    setPhone(digits);
  };

  const handleSubmitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || inputError) return;
    if (phone && !/^01[016789][0-9]{7,8}$/.test(phone)) {
      setInputError('01로 시작하는 휴대전화 번호 10~11자리를 확인하거나 번호를 지워 주세요.');
      return;
    }
    const data = { ...signupData, phone: phone || null };
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

  return { phone, submitting, inputError, clearPhone, handleChangePhone, handleSubmitPhone };
}

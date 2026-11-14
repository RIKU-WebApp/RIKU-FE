import { useState } from 'react';
import { useCreateAccountData } from '@features/auth/hooks/useCreateAccountData';

export default function useNameInputData() {
  const { setSignupData, handleNext, signupData, showError } = useCreateAccountData();
  const [name, setName] = useState(signupData.name);
  const ready = name.trim().length > 0 && name.length <= 20;
  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > 20) {
      showError('이름은 최대 20자입니다.');
      return;
    }
    setName(value);
    showError(value && !value.trim() ? '공백만으로는 이름을 입력할 수 없습니다.' : '');
  };
  const handleSubmitName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    setSignupData({ ...signupData, name: name.trim() });
    handleNext();
  };
  return { name, ready, handleChangeName, handleSubmitName };
}

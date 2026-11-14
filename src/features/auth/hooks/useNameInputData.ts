import { useState } from 'react';
import { useCreateAccountData } from '@features/auth/hooks/useCreateAccountData';

export default function useNameInputData() {
  const { setSignupData, handleNext, signupData, showError } = useCreateAccountData();
  const [name, setName] = useState(signupData.name);
  const ready = name.trim().length > 0 && name.length <= 20;
  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    showError('');
  };
  const handleSubmitName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    setSignupData({ ...signupData, name: name.trim() });
    handleNext();
  };
  return { name, ready, handleChangeName, handleSubmitName };
}

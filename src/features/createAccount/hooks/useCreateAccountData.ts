// "회원가입" 페이지에 대한 Context 소비 훅
import { useContext } from 'react';
import { CreateAccountContext } from '@/features/createAccount/context/CreateAccountContext';

// "회원가입" 페이지에 대한 Context 소비 훅 (-> 회원가입 페이지에 대한 비즈니스 로직을 담당하는 훅)
export function useCreateAccountData() {
  const context = useContext(CreateAccountContext);
  if (!context) {
    throw new Error('useCreateAccountData must be used within a CreateAccountProvider');
  }
  return context;
}

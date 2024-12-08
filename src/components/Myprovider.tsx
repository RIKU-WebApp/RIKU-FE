//로그인 한 userId 전역관리를 위한 컴포넌트

import React, { createContext, useContext, useState, ReactNode } from 'react';

// 전역 상태를 저장할 Context 생성
const MyContext = createContext<any>(null);

// Context를 제공하는 Provider 컴포넌트
export const MyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [value, setValue] = useState<number>();

  return (
    <MyContext.Provider value={{ value, setValue }}>
      {children}
    </MyContext.Provider>
  );
};

// Context 값을 쉽게 가져오는 Custom Hook
export const useMyContext = () => useContext(MyContext);

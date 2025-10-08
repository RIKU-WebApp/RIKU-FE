import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

//인증 여부를 확인하고 라우팅을 제어하는 보호 Route Component
const ProtectedRoute = () => {
  //로그인 여부를 localStorage에 저장된 'accessToken'으로 판단
  const isAuthenticated = !!localStorage.getItem('accessToken');

  //localStorage에 accessToken이 저장되어 있지 않은 경우, 로그인 페이지로 redirect 시킨다
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  //localStorage에 accessToken이 저장되어 있는 경우, 하위 Route 렌더링
  return <Outlet />;
};

export default ProtectedRoute;

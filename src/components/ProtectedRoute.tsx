import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getAccessToken, getRefreshToken, reissueToken } from '@features/auth/api/tokenAuth';

//인증 여부를 확인하고 라우팅을 제어하는 보호 Route Component
const ProtectedRoute = () => {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      if (getAccessToken()) {
        setIsAuthenticated(true);
        setIsCheckingAuth(false);
        return;
      }

      if (!getRefreshToken()) {
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
        return;
      }

      const isReissued = await reissueToken();

      if (isMounted) {
        setIsAuthenticated(isReissued);
        setIsCheckingAuth(false);
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white">
        <span className="text-gray-400 text-sm animate-pulse">로그인 정보를 확인 중입니다...</span>
      </div>
    );
  }

  //localStorage에 accessToken이 저장되어 있지 않은 경우, 로그인 페이지로 redirect 시킨다
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  //localStorage에 accessToken이 저장되어 있는 경우, 하위 Route 렌더링
  return <Outlet />;
};

export default ProtectedRoute;

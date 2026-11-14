import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import postLogin from '@features/auth/api/postLogin';
import { getAccessToken, getRefreshToken, reissueToken } from '@features/auth/api/tokenAuth';

// 로그인 페이지 컴포넌트에 대해 비즈니스 로직을 관리하는 훅
function useLoginPage() {
  const location = useLocation();
  const next = new URLSearchParams(location.search).get('next');
  const returnTo = next && /^\/(regular|flash|training|event|tab|record|my-achievements)(\/|$|[?#])/i.test(next) && !next.includes('\\') ? next : '/tab/main';
  const navigate = useNavigate(); //useNavigate 훅을 사용해 navigate 함수 생성

  const [id, setID] = useState<string>(''); //ID state
  const [password, setPassword] = useState<string>(''); //비밀번호가 유효한지 확인하기 위한 state

  useEffect(() => {
    let isMounted = true;

    const autoLogin = async () => {
      if (getAccessToken()) {
        navigate(returnTo, { replace: true });
        return;
      }

      if (!getRefreshToken()) {
        return;
      }

      const isReissued = await reissueToken();

      if (isMounted && isReissued) {
        navigate(returnTo, { replace: true });
      }
    };

    autoLogin();

    return () => {
      isMounted = false;
    };
  }, [navigate, returnTo]);

  //로그인 버튼 활성,비활성 관리
  const isLoginBtnValid = () => {
    return id.trim().length > 0 && password.trim().length > 0;
  };

  //로그인 버튼을 눌렀을 때 수행해야 할 로직을 담은 함수 (추후 로그인 API 연동 예정)
  const handleLoginClick = async () => {
    //ID와 패스워드 필드를 모두 채우지 않았다면.. 그냥 return
    if (id.length === 0 || password.length === 0) {
      alert('아이디와 비밀번호를 모두 입력해 주세요!');
      return;
    }

    const isLoginSuccess = await postLogin(id, password); // api 함수인 postLogin 호출
    if (isLoginSuccess) {
      // 로그인 성공 시, 메인 화면으로 이동
      navigate(returnTo, { replace: true });
    } else {
      return;
    }
  };

  //엔터키로 로그인 버튼 작동하게 하는 함수
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLoginClick();
    }
  };

  return {
    id,
    setID,
    password,
    setPassword,
    isLoginBtnValid,
    handleLoginClick,
    handleKeyDown,
  };
}

export default useLoginPage;

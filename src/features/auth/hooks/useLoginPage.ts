import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import postLogin from '@features/auth/api/postLogin';
import { getAccessToken, getRefreshToken, reissueToken } from '@features/auth/api/tokenAuth';

// 로그인 페이지 컴포넌트에 대해 비즈니스 로직을 관리하는 훅
function useLoginPage() {
  const navigate = useNavigate(); //useNavigate 훅을 사용해 navigate 함수 생성

  const [id, setID] = useState<string>(''); //ID state
  const [password, setPassword] = useState<string>(''); //비밀번호가 유효한지 확인하기 위한 state

  useEffect(() => {
    let isMounted = true;

    const autoLogin = async () => {
      if (getAccessToken()) {
        navigate('/tab/main', { replace: true });
        return;
      }

      if (!getRefreshToken()) {
        return;
      }

      const isReissued = await reissueToken();

      if (isMounted && isReissued) {
        navigate('/tab/main', { replace: true });
      }
    };

    autoLogin();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  //로그인 버튼 활성,비활성 관리
  const isLoginBtnValid = () => {
    return id.trim().length > 0 && password.trim().length > 0;
  };

  //ID와 비밀번호 찾기 버튼을 눌렀을 경우의 이벤트 처리
  const handleFindIDPW = () => {
    alert('열심히 기능 준비 중입니다!');
  };

  // 입력된 비밀번호 유효성 검사
  const isValidPassword = () => {
    // 영문, 숫자, 특수문자 조합 8~20자리까지 가능
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
    return passwordRegex.test(password);
  };

  //로그인 버튼을 눌렀을 때 수행해야 할 로직을 담은 함수 (추후 로그인 API 연동 예정)
  const handleLoginClick = async () => {
    //ID와 패스워드 필드를 모두 채우지 않았다면.. 그냥 return
    if (id.length === 0 || password.length === 0) {
      alert('아이디와 비밀번호를 모두 입력해 주세요!');
      return;
    }

    // 비밀번호 입력 때문에, 400 Bad Request 오류 발생 방지하려면, isValidPassword() 메소드를 통해 유효성 검사를 진행해야 함
    if (!isValidPassword()) {
      alert(
        '입력한 비밀번호 형식이 올바르지 않습니다. \n영문, 숫자, 특수문자 조합 8~20자리까지 가능합니다.'
      );
      return;
    }

    const isLoginSuccess = await postLogin(id, password); // api 함수인 postLogin 호출
    if (isLoginSuccess) {
      // 로그인 성공 시, 메인 화면으로 이동
      navigate('/tab/main');
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
    handleFindIDPW,
    handleLoginClick,
    handleKeyDown,
  };
}

export default useLoginPage;

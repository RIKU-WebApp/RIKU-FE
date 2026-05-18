import customAxios from '@shared/lib/customAxios';
import { AUTH_ENDPOINTS } from '@features/auth/constants';
import { saveAuthResult } from './tokenAuth';

// '로그인' 요청을 보내는 API 함수
async function postLogin(id: string, password: string) {
  // 데이터 생성
  const data = {
    studentId: id,
    password: password,
  };

  const url = AUTH_ENDPOINTS.login;
  console.log('data', data);

  try {
    const response = await customAxios.post(url, data); // 요청 보내기

    // 1. HTTP 응답은 인터셉터에서 이미 처리되었으므로, 여기에 도달했다면 2xx 응답임
    const { isSuccess, result, responseMessage } = response.data;

    // 2. 비즈니스 로직 에러에 대해서만 이쪽에서 처리
    if (!isSuccess) {
      alert(`로그인 실패, 사유: ${responseMessage}`);
      return false; // 'false'를 반환하여, 로그인 실패 여부를 컴포넌트에서 확인할 수 있도록 함
    }

    // 3. 성공 처리
    saveAuthResult(result);
    return true; // 'true'를 반환하여, 로그인 성공 여부를 컴포넌트에서 확인할 수 있도록 함
  } catch (error) {
    // 인터셉터에서 정제된 message를 그대로 사용
    alert((error as Error).message || '요청 처리 중 오류가 발생했습니다.');
    return false; // 'false'를 반환하여, 로그인 실패 여부를 컴포넌트에서 확인할 수 있도록 함
  }
}

export default postLogin;

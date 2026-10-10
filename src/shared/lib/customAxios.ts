import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { clearAuthStorage, getAccessToken, reissueToken } from '@features/auth/api/tokenAuth';

// 요청 취소 함수(cancelRequest)에서 사용할 인터페이스들
interface CancelMetadata {
  cancel?: {
    cancel: (message: string) => void;
  };
}
interface RequestConfig {
  metadata?: CancelMetadata;
}

// Axios 인스턴스 생성
const customAxios: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // 기본 URL
  timeout: 30000, // 기본 타임아웃 설정 (10초), 추후에 오버라이드 가능
});

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

customAxios.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = accessToken;
  }

  return config;
});

// 응답(Response) 관련 에러 interceptor로 처리 (-> 응답 관련한 오류에 대해서 interceptor가 오류 처리를 "알아서" 해줌")
customAxios.interceptors.response.use(
  (response) => response, // 성공적인 응답은 그대로 반환
  async (error) => {
    let message = '알 수 없는 오류가 발생했습니다.'; // 기본 메시지
    const originalRequest = error.config ? (error.config as RetryableRequestConfig) : null;

    if (axios.isCancel(error)) {
      // 요청이 취소된 경우
      message = '요청이 취소되었습니다.';
    } else if (!error.response) {
      // 네트워크 오류인 경우 (서버 응답 없음)
      message = '네트워크 오류: 연결을 확인해주세요.';
    } else if (error.response.status === 401) {
      //토큰 만료 라우팅 처리
      if (originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;
        const isReissued = await reissueToken();

        if (isReissued) {
          const accessToken = getAccessToken();
          if (accessToken) {
            originalRequest.headers.Authorization = accessToken;
          }

          return customAxios(originalRequest);
        }
      }

      message = '인증이 만료되었습니다. 다시 로그인해주세요.';
      clearAuthStorage();
      window.location.href = '/';
    } else {
      // 그 외의 서버 응답 에러
      message = error.response.data?.message || '서버 오류가 발생했습니다.';
    }

    // error 객체를 정제해서 reject
    return Promise.reject({
      status: error.response?.status,
      message,
      raw: error, // 원본 보존
    });
  }
);

// 요청 취소 함수
export const cancelRequest = (config: RequestConfig) => {
  if (config.metadata?.cancel) {
    config.metadata.cancel.cancel('사용자 요청에 의해 취소되었습니다.');
  }
};

export default customAxios;

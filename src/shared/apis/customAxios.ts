import axios, { AxiosInstance } from 'axios';

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
  baseURL: 'https://test.riku-server.shop/',
  timeout: 30000, // 기본 타임아웃 설정 (10초), 추후에 오버라이드 가능
});

// Axios 응답 및 에러 처리
customAxios.interceptors.response.use(
  (response) => response, // 성공적인 응답은 그대로 반환
  async (error) => {
    // 요청이 취소된 경우
    if (axios.isCancel(error)) {
      alert('요청이 취소되었습니다.');
      console.warn('요청이 취소되었습니다:', error.message);
      return Promise.reject(error);
    }

    // 네트워크 오류인 경우 (서버 응답 없음)
    if (!error.response) {
      console.error('네트워크 오류 발생:', error.message);
      alert('네트워크 오류: 인터넷 연결 상태를 확인해주세요.');
      return Promise.reject(error); // 네트워크 오류인 경우 요청을 중단
    }

    //토큰 만료 라우팅 처리
    if (error.response.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/';
      return new Promise(() => {}); // 후속 실행 차단
    }

    // 그 외의 서버 응답 에러
    console.error('서버 응답 에러:', error.response?.data);
    return Promise.reject(error);
  }
);

// 요청 취소 함수
export const cancelRequest = (config: RequestConfig) => {
  if (config.metadata?.cancel) {
    config.metadata.cancel.cancel('사용자 요청에 의해 취소되었습니다.');
  }
};

export default customAxios;

import axios from 'axios';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const MY_ID_KEY = 'MyId';
const STUDENT_ID_KEY = 'studentId';

interface JwtInfo {
  accessToken: string;
  refreshToken: string;
}

interface AuthResult {
  userId: number;
  studentId?: string;
  jwtInfo: JwtInfo;
}

interface ApiResponse<T> {
  isSuccess: boolean;
  responseCode: number;
  responseMessage: string;
  result: T;
}

const authAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
});

let reissueTokenPromise: Promise<boolean> | null = null;

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function saveAuthResult(result: AuthResult) {
  localStorage.setItem(ACCESS_TOKEN_KEY, result.jwtInfo.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, result.jwtInfo.refreshToken);
  localStorage.setItem(MY_ID_KEY, String(result.userId));

  if (result.studentId) {
    localStorage.setItem(STUDENT_ID_KEY, result.studentId);
  }
}

export function clearAuthStorage() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(MY_ID_KEY);
  localStorage.removeItem(STUDENT_ID_KEY);
}

async function requestReissueToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearAuthStorage();
    return false;
  }

  try {
    const response = await authAxios.post<ApiResponse<AuthResult>>('/user/reissue', {
      refreshToken,
    });

    if (!response.data.isSuccess || !response.data.result?.jwtInfo) {
      clearAuthStorage();
      return false;
    }

    saveAuthResult(response.data.result);
    return true;
  } catch {
    clearAuthStorage();
    return false;
  }
}

export function reissueToken() {
  if (!reissueTokenPromise) {
    reissueTokenPromise = requestReissueToken().finally(() => {
      reissueTokenPromise = null;
    });
  }

  return reissueTokenPromise;
}

export async function logout() {
  const refreshToken = getRefreshToken();

  try {
    if (refreshToken) {
      await authAxios.post('/user/logout', { refreshToken });
    }
  } catch {
    // 서버 로그아웃에 실패해도 현재 브라우저의 인증 정보는 반드시 제거한다.
  } finally {
    clearAuthStorage();
  }
}

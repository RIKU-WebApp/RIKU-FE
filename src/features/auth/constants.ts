export const AUTH_STORAGE_KEYS = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  myId: 'MyId',
  studentId: 'studentId',
} as const;

export const AUTH_ENDPOINTS = {
  login: '/user/login',
  signup: '/user/signup',
  checkStudentId: (studentId: string) =>
    `/user/check-id?studentId=${encodeURIComponent(studentId)}`,
  reissue: '/user/reissue',
  logout: '/user/logout',
} as const;

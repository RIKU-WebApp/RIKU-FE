// Main Tab별 마지막 방문 경로 저장

// 텝 별 마지막 위치 기본 값
export const tabHistory = {
  home: '/tab/main',
  schedule: '/tab/schedule-page',
  ranking: '/tab/ranking-page',
  mypage: '/tab/my-page',
};

// 특정 탭 경로 업데이트
export const setTabHistory = (tab: keyof typeof tabHistory, path: string) => {
  tabHistory[tab] = path;
};

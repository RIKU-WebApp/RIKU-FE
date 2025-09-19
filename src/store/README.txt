# store 폴더
Zustand를 활용한 전역 상태 관리 공간입니다.
- 도메인 단위로 상태를 분리 (ex. useAuthStore.ts, useHomeStore.ts, useRankingStore.ts)
- 각 스토어는 해당 도메인의 상태, 액션, 비즈니스 로직을 포함
즉, 전역적으로 필요한 상태를 도메인별로 관리하는 역할을 합니다.

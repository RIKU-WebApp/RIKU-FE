# shared 폴더
전역적으로 재사용 가능한 코드들을 모아둔 폴더입니다. (Atomic Design 기반)
- ui/: 버튼, 인풋, 모달 등 공통 UI 컴포넌트
- lib/: axios 인스턴스, dayjs 플러그인 등 "도구"
- api/: lib의 도구를 활용해 만든 실제 API 함수
- hooks/: useDebounce, useOutsideClick 등 공용 훅
- utils/: 네트워크 통신이 없는 순수 함수
- types/: 전역적으로 공유되는 타입 정의
즉, 특정 기능에 종속되지 않고, 여러 Feature에서 재사용 가능한 자원입니다.

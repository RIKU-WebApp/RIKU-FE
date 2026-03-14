# RIKU-FE Claude Code 가이드

건국대학교 중앙 러닝 동아리 **RIKU** 웹플랫폼의 프론트엔드 레포지토리입니다.
이 문서는 Claude Code가 프로젝트 컨벤션을 정확히 파악하고 일관된 코드를 작성할 수 있도록 돕습니다.

---

## 프로젝트 개요

- **목적**: 러닝 이벤트(정규런, 번개런, 훈련, 행사) 관리, 출석, 포인트, 랭킹 시스템
- **팀**: 이운태/허준호 & 박태희/정상현
- **스택**: React 18, TypeScript (strict), Vite, Tailwind CSS, React Router v6, Axios

---

## 폴더 구조

```
src/
├── app/
│   ├── App.tsx              # 라우터 전체 구성
│   └── layouts/
│       └── MainTabLayout.tsx  # 탭 내비게이션 레이아웃 (Outlet 포함)
├── pages/                   # 페이지 컴포넌트 (라우트 단위)
├── features/                # 기능별 모듈 (핵심 구조)
│   └── [feature]/
│       ├── api/             # API 함수
│       ├── components/      # 해당 기능 전용 컴포넌트
│       ├── hooks/           # 해당 기능 전용 훅
│       ├── context/         # Context Provider (필요 시)
│       └── types.ts         # 해당 기능 타입 정의
├── shared/                  # 여러 기능에서 공유하는 코드
│   ├── ui/                  # 공유 UI 컴포넌트 (NavBar, ActionBar 등)
│   ├── hooks/               # 공유 커스텀 훅
│   ├── lib/
│   │   └── customAxios.ts   # Axios 인스턴스 (인터셉터 포함)
│   ├── utils/               # 유틸리티 함수
│   └── types.ts             # 전역 공유 타입
├── assets/                  # 이미지, SVG, 폰트
└── styles/                  # Tailwind 설정 및 글로벌 CSS
```

> **주의**: `src/components/` 폴더는 현재 위 구조로 마이그레이션 중입니다.
> 신규 컴포넌트는 반드시 `features/[feature]/components/` 또는 `shared/ui/`에 생성하세요.
> `src/components/`에는 새 파일을 추가하지 마세요.

---

## 파일 네이밍 컨벤션

| 종류      | 규칙                                    | 예시                                        |
| --------- | --------------------------------------- | ------------------------------------------- |
| 컴포넌트  | PascalCase + `.tsx`                     | `RunCard.tsx`, `NavBar.tsx`                 |
| 페이지    | PascalCase + `Page.tsx`                 | `LoginPage.tsx`, `RankingPage.tsx`          |
| 커스텀 훅 | `use` 접두사 + camelCase + `.ts`        | `useNavBar.ts`, `useLoginPage.ts`           |
| API 함수  | 동사+명사 + `.ts`                       | `postLogin.ts`, `getIsStudentidValidate.ts` |
| 타입 파일 | `types.ts`                              | `features/auth/types.ts`                    |
| 공유 타입 | 컴포넌트 파일 내 인라인 또는 `types.ts` |                                             |

---

## TypeScript 패턴

### 컴포넌트 패턴

```typescript
// Props 인터페이스는 컴포넌트 파일 내에 정의
interface RunCardProps {
  title: string;
  status: 'NOW' | 'CLOSED' | 'CANCELED' | 'URGENT';
  onClick: () => void;
}

function RunCard({ title, status, onClick }: RunCardProps) {
  return <div onClick={onClick}>{title}</div>;
}

export default RunCard;
```

### 타입 패턴

```typescript
// 상태 값은 union type 사용
type RunCategory = 'regular' | 'flash' | 'training' | 'event';

// 매핑 객체에는 Record 사용
const titleToKorean: Record<RunCategory, string> = {
  regular: '정규런',
  flash: '번개런',
  training: '훈련',
  event: '행사',
};
```

- `strict: true` 모드 적용 — `any` 타입 사용 금지
- 공유 타입은 `@shared/types` 에서 import

---

## Import 경로 (Path Aliases)

절대경로 alias를 우선 사용하세요. 상대경로(`../../`) 사용을 피하세요.

```typescript
import customAxios from '@shared/lib/customAxios';
import NavBar from '@shared/ui/NavBar';
import RankingPage from '@pages/RankingPage';
import { RunCategory } from '@shared/types';
import MainIcon from '@assets/navi-icon/main-icon.svg?react';
```

| Alias         | 경로             |
| ------------- | ---------------- |
| `@/*`         | `src/*`          |
| `@app/*`      | `src/app/*`      |
| `@pages/*`    | `src/pages/*`    |
| `@features/*` | `src/features/*` |
| `@shared/*`   | `src/shared/*`   |
| `@assets/*`   | `src/assets/*`   |
| `@styles/*`   | `src/styles/*`   |

---

## 컴포넌트 배치 기준

| 상황                                  | 위치                                 |
| ------------------------------------- | ------------------------------------ |
| 여러 기능에서 공유하는 UI (NavBar 등) | `src/shared/ui/`                     |
| 특정 기능에서만 쓰는 컴포넌트         | `src/features/[feature]/components/` |
| 여러 기능에서 공유하는 훅             | `src/shared/hooks/`                  |
| 특정 기능에서만 쓰는 훅               | `src/features/[feature]/hooks/`      |

---

## 라우팅

React Router **v6** 사용 (`react-router-dom: ^6.x`).

### 주요 라우트 구조

```
/                  → OnboardingPage (공개)
/login             → LoginPage (공개)
/create-account    → CreateAccountPage (공개)

Protected (accessToken 필요):
├── /tab/*         → MainTabLayout (탭 내비게이션 레이아웃)
│   ├── (index)    → NewMain
│   ├── main       → NewMain
│   ├── schedule-page → SchedulePage
│   ├── ranking-page  → RankingPage
│   ├── my-page       → MyPage
│   └── :runType      → RunList (regular/flash/training/event)
├── /flash/:postId     → 번개런 상세
├── /regular/:postId   → 정규런 상세
├── /make/flash        → 번개런 생성
└── ...
```

### MainTabLayout

`src/app/layouts/MainTabLayout.tsx` — `/tab/*` 하위 라우트의 공통 레이아웃.
`<Outlet />`으로 자식 라우트를 렌더링하고, 상단 ActionBar와 하단 NavBar를 제공합니다.

### ProtectedRoute

`localStorage.getItem('accessToken')` 존재 여부로 인증 확인.
미인증 시 `/`로 redirect.

---

## 상태 관리

| 범위                           | 방법                                     |
| ------------------------------ | ---------------------------------------- |
| 컴포넌트 로컬                  | `useState`                               |
| 멀티스텝 폼 / 컴포넌트 간 공유 | Context API (`createContext` + Provider) |
| 인증 정보                      | `localStorage` (`accessToken`, `MyId`)   |

- Redux가 설치되어 있으나 **현재 사용하지 않습니다**. 새 기능에 Redux를 추가하지 마세요.
- 전역 상태 관리가 필요한 경우 Context API를 사용하세요.

---

## API / 데이터 페칭

### customAxios

`src/shared/lib/customAxios.ts` — 모든 API 요청에 이 인스턴스를 사용하세요.

- base URL: `https://test.riku-server.shop/`
- 401 응답 시 자동으로 토큰 제거 및 `/` 리다이렉트

### 현재 방식 (기존 코드)

```typescript
useEffect(() => {
  const fetchData = async () => {
    const token = localStorage.getItem('accessToken');
    const response = await customAxios.get('/api/endpoint', {
      headers: { Authorization: `${token}` },
    });
    setData(response.data.result);
  };
  fetchData();
}, []);
```

### 신규 기능: TanStack Query 사용 권장

TanStack Query 도입이 예정되어 있습니다. **새로운 기능을 개발할 때는 TanStack Query를 사용하세요.**
기존 코드는 마이그레이션 전까지 위의 패턴을 유지합니다.

### API 함수 패턴

```typescript
// features/[feature]/api/postSomething.ts
async function postSomething(param: string): Promise<boolean> {
  try {
    const response = await customAxios.post('/endpoint', { param });
    const { isSuccess, result, responseMessage } = response.data;
    if (!isSuccess) {
      alert(responseMessage);
      return false;
    }
    return true;
  } catch (error) {
    alert((error as Error).message);
    return false;
  }
}
```

**API 응답 구조**: `{ isSuccess: boolean, result: T, responseMessage: string }`

---

## 스타일링

### Tailwind CSS + 커스텀 팔레트 (`ku*` 접두사)

```tsx
// 올바른 색상 사용
<div className="bg-kuDarkGreen text-kuWhite">
<button className="bg-kuLightGreen text-kuDarkGreen">
```

**주요 커스텀 색상**:

- `kuDarkGreen` (#366943) — 주요 브랜드 색상
- `kuLightGreen` (#C6F059) — 액센트
- `kuCoolGray` (#B2B3B4) — 보조 텍스트
- `kuRed` (#D7260D), `kuBlue` (#7CA6D8), `kuBeige` (#F0F4DD)

### 반응형 (모바일 퍼스트)

최대 너비 `max-w-[430px]` 기준 (iPhone 15 Pro Max).

```tsx
// 커스텀 브레이크포인트
// zfold(344px), iphonese(375px), iphonepro(390px), iphonepromax(430px)
<div className="max-w-[430px] w-full mx-auto">
```

### 애니메이션

```tsx
<div className="animate-fade-in animation-delay-300">
<div className="animate-fade-up animation-delay-600">
```

---

## 날짜 처리

- **`date-fns`만 사용** — `moment`는 레거시이므로 신규 코드에 사용 금지
- KST 표시 시 UTC + 9시간 변환 필요

```typescript
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
const formatted = format(kstDate, 'MM/dd EEEE', { locale: ko });
```

---

## SVG / 아이콘

```typescript
// SVG를 React 컴포넌트로 import (vite-plugin-svgr)
import MainIcon from '@assets/navi-icon/main-icon.svg?react';
<MainIcon className="w-6 h-6 text-kuDarkGreen" />

// 아이콘 라이브러리: lucide-react (권장), react-icons
import { ChevronLeft } from 'lucide-react';
```

---

## 커스텀 훅 패턴

훅은 상태와 핸들러를 캡슐화하고 객체로 반환합니다.

```typescript
// features/[feature]/hooks/useFeatureName.ts
function useFeatureName() {
  const navigate = useNavigate();
  const [data, setData] = useState<SomeType | null>(null);

  const handleAction = async () => {
    // 비즈니스 로직
  };

  return { data, handleAction };
}

export default useFeatureName;
```

---

## 코드 품질

- **ESLint + Prettier**: `git commit` 시 pre-commit 훅으로 자동 실행
- 커밋 메시지 컨벤션: `[RIKU-{티켓번호}] type: 설명` (husky commit-msg 훅 적용)
- max-warnings=0 정책 — lint 경고도 허용하지 않음

```bash
npm run dev          # 개발 서버 실행 (Vite)
npm run build        # 타입 체크 + 빌드
npm run lint         # ESLint 검사
npm run format       # Prettier 포맷
npm run type-check   # TypeScript 타입 체크만
npm run test         # Vitest 테스트 실행
```

---

## 주의사항 요약

1. `src/components/`에 새 파일 추가 금지 — 마이그레이션 중인 폴더
2. `moment` 사용 금지 — `date-fns` 사용
3. Redux 사용 금지 — Context API 또는 React Query 사용
4. `styled-components` 사용 금지 — Tailwind CSS 사용
5. 상대경로(`../../`) import 금지 — path alias 사용
6. `any` 타입 사용 금지 — strict TypeScript 준수
7. 신규 데이터 페칭은 React Query로 작성 (도입 예정)

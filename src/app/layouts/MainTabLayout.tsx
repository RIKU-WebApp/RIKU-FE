import { Outlet, useParams } from 'react-router-dom';
import NavBar from '@shared/ui/NavBar';
import ActionBar from '@shared/ui/ActionBar';
import DetailActionBar from '@shared/ui/DetailActionBar';
import { RunCategory } from '@shared/types';

// 메인화면, 일정, 순위, 마이페이지 페이지를 이용해서 오고가는 MainTabLayout 페이지
function MainTabLayout() {
  const runType = useParams<{ runType: string }>(); // 현재 url에 있는 runType 가져오기
  console.log(runType);
  const title = runType?.runType || ''; // runType이 있으면 runType을 사용, 없으면 빈 문자열

  return (
    <div>
      {title !== '' ? <DetailActionBar title={title as RunCategory} /> : <ActionBar />}
      {/* 하위 라우트들이 렌더링될 공간 */}
      <Outlet />
      <NavBar />
    </div>
  );
}

export default MainTabLayout;

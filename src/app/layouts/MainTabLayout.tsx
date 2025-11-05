import { Outlet } from 'react-router-dom';
import NavBar from '@shared/ui/NavBar';
import ActionBar from '../../components/ActionBar';

// 메인화면, 일정, 순위, 마이페이지 페이지를 이용해서 오고가는 MainTabLayout 페이지
function MainTabLayout() {
  return (
    <div>
      <ActionBar />
      {/* 하위 라우트들이 렌더링될 공간 */}
      <Outlet />
      <NavBar />
    </div>
  );
}

export default MainTabLayout;

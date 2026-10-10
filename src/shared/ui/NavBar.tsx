//Icon들 import
import useNavBar from '@shared/hooks/useNavBar';
import MainIcon from '@assets/navi-icon/main-icon.svg?react';
import CalendarIcon from '@assets/navi-icon/calendar-icon.svg?react';
import RankingIcon from '@assets/navi-icon/ranking-icon.svg?react';
import MyPageIcon from '@assets/navi-icon/mypage-icon.svg?react';

// NavBar 컴포넌트
function NavBar() {
  const { handleNavigation, getIconColor, getTextColor, handleHomeClick } = useNavBar();
  return (
    <div className="w-full">
      {/* 네비게이션 바 */}

      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 flex justify-between items-center max-w-[430px] w-full h-16 border-t-[1.5px] border-gray-300 bg-white z-[1000]">
        {/* 홈 아이콘 */}
        <div className="w-1/4 flex flex-col items-center cursor-pointer" onClick={handleHomeClick}>
          <MainIcon className={`w-6 h-6 ${getIconColor('main')}`} />
          <div className={`text-xs ${getTextColor('main')}`}>홈</div>
        </div>

        {/* 일정 아이콘 */}
        <div
          className="w-1/4 flex flex-col items-center cursor-pointer"
          onClick={() => handleNavigation('/tab/schedule-page', 'schedule-page')}
        >
          <CalendarIcon className={`w-6 h-6 ${getIconColor('schedule-page')}`} />
          <div className={`text-xs ${getTextColor('schedule-page')}`}>일정</div>
        </div>

        {/* 순위 아이콘 */}
        <div
          className="w-1/4 flex flex-col items-center cursor-pointer"
          onClick={() => handleNavigation('/tab/ranking-page', 'ranking-page')}
        >
          <RankingIcon className={`w-6 h-6 ${getIconColor('ranking-page')}`} />
          <div className={`text-xs ${getTextColor('ranking-page')}`}>순위</div>
        </div>

        {/* 마이페이지 아이콘 */}
        <div
          className="w-1/4 flex flex-col items-center cursor-pointer"
          onClick={() => handleNavigation('/tab/my-page', 'my-page')}
        >
          <MyPageIcon className={`w-6 h-6 ${getIconColor('my-page')}`} />
          <div className={`text-xs ${getTextColor('my-page')}`}>마이페이지</div>
        </div>
      </nav>
    </div>
  );
}

export default NavBar;

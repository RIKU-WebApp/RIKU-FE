import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

//Icon들 import
import MainIcon from '../assets/navi-icon/main-icon.svg?react';
import CalendarIcon from '../assets/navi-icon/calendar-icon.svg?react';
import RankingIcon from '../assets/navi-icon/ranking-icon.svg?react';
import MyPageIcon from '../assets/navi-icon/mypage-icon.svg?react';

const NavBar: React.FC = () => {
  const navigate = useNavigate(); //네비게이팅을 위해 useNavigate() 훅 사용
  const location = useLocation(); //현재 경로 가져오기
  const [selectedTab, setSelectedTab] = useState<string>('main'); //초기에는 main

  //경로와 Tab 이름의 Mapping
  const tabMapping: { [key: string]: string } = {
    '/tab/main': 'main',
    '/tab/schedule-page': 'schedule-page',
    '/tab/ranking-page': 'ranking-page',
    '/tab/my-page': 'my-page',
  };

  //현재 경로에 따라 selectedTab을 업데이트(location 객체를 활용하여..)
  useEffect(() => {
    const currentTab = tabMapping[location.pathname] || 'main'; //경로에 맵핑되지 않으면 기본값 'main'
    setSelectedTab(currentTab);
  }, [location.pathname]); //location.pathname이 변경될 때마다 실행

  //각 네비게이션 아이템에 클릭 이벤트 추가
  function handleNavigation(path: string, tabName: string) {
    setSelectedTab(tabName); //넘어온 tabName을 바탕으로 selectedTab state 세팅!
    navigate(path); //지정한 경로로 이동
  }

  //아이콘을 선택 상태에 따라 동적으로 색깔 적용
  const getIconColor = (tabName: string) =>
    selectedTab === tabName ? 'text-kuDarkGreen' : 'text-gray-400';

  //텍스트를 선택 상태에 따라 동적으로 색깔 적용
  const getTextColor = (tabName: string) =>
    selectedTab === tabName ? 'font-bold text-kuDarkGreen' : 'text-gray-400';

  //모바일은 375px가 우선이지만, 데스크탑 또는 다른 모바일 기기에서의 호환성을 위해 추후 논의 필요할 듯
  return (
    <div className="w-full">
      {/* 네비게이션 바 */}

      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 flex justify-between items-center max-w-[430px] w-full h-16 border-t-[1.5px] border-gray-300 bg-white z-[1000]">
        {/* 홈 아이콘 */}
        <div
          className="w-1/4 flex flex-col items-center cursor-pointer"
          onClick={() => handleNavigation('/tab/main', 'main')}
        >
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
};

export default NavBar;

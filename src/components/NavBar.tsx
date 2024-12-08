import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";

//Icon들 import
import MainIcon from '../assets/navi-icon/main-icon.svg?react';
import CalendarIcon from '../assets/navi-icon/calendar-icon.svg?react';
import RankingIcon from '../assets/navi-icon/ranking-icon.svg?react';
import MyPageIcon from '../assets/navi-icon/mypage-icon.svg?react';

const NavBar: React.FC = () => {

  const navigate = useNavigate(); //네비게이팅을 위해 useNavigate() 훅 사용
  const [selectedTab, setSelectedTab] = useState<string>("main"); //초기에는 main

  //각 네비게이션 아이템에 클릭 이벤트 추가
  function handleNavigation(path: string, tabName: string) {
    setSelectedTab(tabName); //넘어온 tabName을 바탕으로 selectedTab state 세팅!
    navigate(path); //지정한 경로로 이동
  }

  //아이콘을 선택 상태에 따라 동적으로 색깔 적용
  const getIconColor = (tabName: string) =>
    selectedTab === tabName ? "text-green-500" : "text-gray-400";

  //텍스트를 선택 상태에 따라 동적으로 색깔 적용
  const getTextColor = (tabName: string) =>
    selectedTab === tabName ? "font-bold text-green-500" : "text-gray-400";


  return (
    <div className="w-full">
      {/* 네비게이션 바 */}
      <nav className="fixed bottom-0 left-0 right-0 flex justify-between items-center w-full h-16 border-t-[1.5px] border-gray-300 bg-white z-[1000] pl-8 pr-8 pb-1">
        {/* 홈 아이콘 */}
        <div
          className="flex flex-col items-center cursor-pointer"
          onClick={() => handleNavigation("/tab/main", "main")}
        >
          <MainIcon className={`w-6 h-6 ${getIconColor("main")}`}/>
          <div className={`text-xs ${getTextColor("main")}`}>홈</div>
        </div>
        {/* 일정 아이콘 */}
        <div
          className="flex flex-col items-center cursor-pointer"
          onClick={() => handleNavigation("/tab/schedule-page", "schedule-page")}
        >
          <CalendarIcon className={`w-6 h-6 ${getIconColor("schedule-page")}`}/>
          <div className={`text-xs ${getTextColor("schedule-page")}`}>일정</div>
        </div>
        {/* 순위 아이콘 */}
        <div
          className="flex flex-col items-center cursor-pointer"
          onClick={() => handleNavigation("/tab/ranking-page", "ranking-page")}
        >
          <RankingIcon className={`w-6 h-6 ${getIconColor("ranking-page")}`}/>
          <div className={`text-xs ${getTextColor("ranking-page")}`}>순위</div>
        </div>
        {/* 마이페이지 아이콘 */}
        <div
          className="flex flex-col items-center cursor-pointer"
          onClick={() => handleNavigation("/tab/my-page", "my-page")}
        >
          <MyPageIcon className={`w-6 h-6 ${getIconColor("my-page")}`}/>
          <div className={`text-xs ${getTextColor("my-page")}`}>마이페이지</div>
        </div>
      </nav>
    </div>
  );
};

export default NavBar;




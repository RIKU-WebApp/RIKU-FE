import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function useNavBar() {
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

  // 각 네비게이션 아이템에 클릭 이벤트 추가
  function handleNavigation(path: string, tabName: string) {
    setSelectedTab(tabName); //넘어온 tabName을 바탕으로 selectedTab state 세팅!
    navigate(path); //지정한 경로로 이동
  }

  // 아이콘을 선택 상태에 따라 동적으로 색깔 적용
  const getIconColor = (tabName: string) =>
    selectedTab === tabName ? 'text-kuDarkGreen' : 'text-gray-400';

  // 텍스트를 선택 상태에 따라 동적으로 색깔 적용
  const getTextColor = (tabName: string) =>
    selectedTab === tabName ? 'font-bold text-kuDarkGreen' : 'text-gray-400';

  return {
    navigate,
    location,
    selectedTab,
    setSelectedTab,
    handleNavigation,
    getIconColor,
    getTextColor,
  };
}

export default useNavBar;

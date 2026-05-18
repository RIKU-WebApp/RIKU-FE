import React from 'react';
import { useNavigate } from 'react-router-dom';

//Icon들 import
import rikuLogo_text from '@assets/navi-icon/rikuLogo_text.svg'; //라이쿠 로고(왼쪽) 불러오기
import rikuLogo_picture from '@assets/navi-icon/rikuLogo_picture.svg'; //라이쿠 로고(왼쪽) 불러오기

const ActionBar: React.FC = () => {
  const navigate = useNavigate();
  const handleMain = () => navigate('/tab/main');

  return (
    <div className="fixed top-0 inset-x-0 mx-auto flex justify-between items-center max-w-[430px] w-full h-[56px] border-t-[1.5px] z-[1000] border-kuDarkGreen bg-kuDarkGreen">
      {/* 상단 액션 바(MainTabLayout에서 하단의 NavBar와 함께 계속 떠있을 것임) */}
      {/* 아이콘 2개를 양쪽에 정렬한다 */}
      <div onClick={handleMain} className="cursor-pointer">
        <object data={rikuLogo_text} className="ml-8 w-auto h-auto pointer-events-none" />{' '}
      </div>

      {/* 원본 크기 유지 */}
      <div onClick={handleMain} className="cursor-pointer">
        <object
          data={rikuLogo_picture}
          className="mr-8 w-auto h-aut pointer-events-none"
          onClick={handleMain}
        />{' '}
      </div>

      {/* 원본 크기 유지 */}
    </div>
  );
};

export default ActionBar;

import React, { useState } from "react";
import calicon from "../assets/navi-icon/calender-icon.svg";
import homeicon from "../assets/navi-icon/home-icon.svg";
import myicon from "../assets/navi-icon/my-icon.svg";
import rankicon from "../assets/navi-icon/ranking-icon.svg";

const NavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleButtonAndOverlay = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative w-full mx-auto">
      {/* 네비게이션 바 */}
      <nav className="flex justify-between items-center w-full h-16 border-t-[1.5px] border-gray-300 fixed bottom-0 bg-white z-[1000] px-5">
        <div className="flex flex-col items-center">
          <img src={homeicon} alt="home" className="w-6 h-6" />
          <div className="text-xs">홈</div>
        </div>
        <div className="flex flex-col items-center">
          <img src={calicon} alt="calendar" className="w-6 h-6" />
          <div className="text-xs">일정</div>
        </div>
        <div className="flex flex-col items-center">
          <img src={rankicon} alt="ranking" className="w-6 h-6" />
          <div className="text-xs">순위</div>
        </div>
        <div className="flex flex-col items-center">
          <img src={myicon} alt="mypage" className="w-6 h-6" />
          <div className="text-xs">마이페이지</div>
        </div>
      </nav>
    </div>
  );
};

export default NavBar;




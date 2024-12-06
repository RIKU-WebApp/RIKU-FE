import React, { useState } from 'react';
import calicon from '../assets/navi-icon/calender-icon.svg';
import homeicon from '../assets/navi-icon/home-icon.svg';
import myicon from '../assets/navi-icon/my-icon.svg';
import rankicon from '../assets/navi-icon/ranking-icon.svg';
import { useNavigate } from 'react-router-dom';

const NavBar: React.FC = () => {
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const toggleButtonAndOverlay = () => {
        setIsOpen(!isOpen);
    };

    const onClickFlashRunMake = () => {
        navigate('/flash-run/user')
    }

    return (
        <div className="relative w-full max-w-[375px] mx-auto">
            {/* 네비게이션 바 */}
            <nav className="flex justify-around items-center w-full h-16 border-t-[1.5px] border-gray-300 fixed bottom-0 left-1/2 -translate-x-1/2 bg-white z-[1000] px-4">
                <div className="text-center space-y-1">
                    <img src={homeicon} alt="home" />
                    <div className="text-[9px]">홈</div>
                </div>
                <div className="text-center space-y-1">
                    <img src={calicon} alt="calender" />
                    <div className="text-[9px]">일정</div>
                </div>
                <div className="text-center space-y-1">
                    <img src={rankicon} alt="ranking" />
                    <div className="text-[9px]">순위</div>
                </div>
                <div className="text-center space-y-1">
                    <img src={myicon} alt="mypage" />
                    <div className="text-[9px]">마이페이지</div>
                </div>
            </nav>

            {/* 오버레이 */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-60 z-[1050]"
                    onClick={toggleButtonAndOverlay}
                ></div>
            )}

            {/* 플로팅 버튼 */}
            <div className="fixed bottom-[80px] left-[calc(50%+100px)]">
                <button
                    className={`w-[60px] h-[60px] bg-green-500 text-white text-[36px] flex justify-center items-center rounded-full shadow-lg z-[1100] transition-transform ${
                        isOpen ? 'rotate-45' : 'rotate-0'
                    }`}
                    onClick={toggleButtonAndOverlay}
                >
                    +
                </button>
            </div>

            {/* 메뉴 */}
            {isOpen && (
                <div className="fixed bottom-[150px] left-[calc(50%+27px)] z-[1100] flex flex-col items-center">
                    <ul className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                        <li className="px-5 py-3 text-center text-base border-b border-gray-200 cursor-pointer hover:bg-gray-100">
                            정규런 만들기
                        </li>
                        <li className="px-5 py-3 text-center text-base border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                        onClick={onClickFlashRunMake}>
                            번개런 만들기
                        </li>
                        <li className="px-5 py-3 text-center text-base border-b border-gray-200 cursor-pointer hover:bg-gray-100">
                            훈련 만들기
                        </li>
                        <li className="px-5 py-3 text-center text-base cursor-pointer hover:bg-gray-100">
                            행사 만들기
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default NavBar;

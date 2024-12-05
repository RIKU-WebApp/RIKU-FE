import ContentList from './ContentList';
import toplogo from '../../assets/Main-img/toplogo.svg';
import RikuMainPhoto from '../../assets/Main-img/RikuMainPhoto.svg';
import NavBar from '../NavBar';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import {useEffect, useState} from 'react'

import plusBtn from '../../assets/plus_Icon.svg'; //라이쿠 로고 불러오기

const Main: React.FC = () => {

    const [isFloatingButtonOpen, setIsFloatingButtonOpen] = useState(false);

    //각 버튼의 개별 상태를 관리하여 순차적 pop-up 효과를 구현
    const [showFirstButton, setShowFirstButton] = useState(false);
    const [showSecondButton, setShowSecondButton] = useState(false);
    const [showThirdButton, setShowThirdButton] = useState(false);
    const [showFourthButton, setShowFourthButton] = useState(false);
    const navigate = useNavigate();

    const handleCardClick = () => {
    navigate('/flash-run/user');
    };

    //플로팅 버튼을 눌렀을 때.. 동작하는 floatingButton
    const toggleFloatingButton = () => {
    setIsFloatingButtonOpen(!isFloatingButtonOpen);
    };

    //플로팅 버튼의 상태가 변경될 때 순차적으로 pop-up 시키는 효과 적용
    useEffect(() => {
    if(isFloatingButtonOpen) {
        // 플로팅 버튼이 열리면 순차적으로 각 버튼을 표시
        setShowFirstButton(false);
        setShowSecondButton(false);
        setShowThirdButton(false);
        setShowFourthButton(false);

        setTimeout(() => setShowFourthButton(true), 100); // 세 번째 버튼(맨 밑 버튼) 100ms 후 표시
        setTimeout(() => setShowThirdButton(true), 200); // 세 번째 버튼(맨 밑 버튼) 100ms 후 표시
        setTimeout(() => setShowSecondButton(true), 300); // 두 번째 버튼 200ms 후 표시
        setTimeout(() => setShowFirstButton(true), 400); // 첫 번째 버튼(맨 위 버튼) 300ms 후 표시
    } else {
        // 플로팅 버튼이 닫힐 때 모든 버튼을 즉시 숨기기
        setShowFirstButton(false);
        setShowSecondButton(false);
        setShowThirdButton(false);
        setShowFourthButton(false);
    }
    }, [isFloatingButtonOpen]); //isFloatingButtonOpen state값이 바뀔 때마다 적용
    

    return (
    <div className="min-h-screen flex flex-col items-center">
        {/* Top Logo Section */}
        <img src={toplogo} alt="Riku-logo" className="flex flex-col items-center p-4"/>

        {/* Main Photo Section */}
        <img src={RikuMainPhoto} alt="rikumain" className="flex flex-col items-center"/>

        {/* 컨텐츠 wrapper */}
        <div className="flex flex-col items-center justify-center pb-20">
            <div className="mt-8 w-[375px] grid grid-cols-2 grid-rows-2 gap-0 justify-center content-center">
                <ContentList name="정규런" path="/run" run_name="다음학기에~" run_date="..." />
                <ContentList name="번개런" path="/flash-run" onClick={handleCardClick} run_name="일감호" run_date="11/10 일요일" />
                <ContentList name="훈련" path="/training" run_name="주말훈련" run_date="11/15" />
                <ContentList name="행사" path="/event" run_name="행사X" run_date="..." />
            </div>
        </div>

        {/* 플로팅 버튼 */}
        <button
        onClick={toggleFloatingButton}
        className={`fixed bottom-10 right-10 w-16 h-16 rounded-full bg-kuDarkGreen text-white flex items-center justify-center shadow-lg hover:bg-kuDarkGreen-dark focus:outline-none z-50 transition-transform duration-300 ${isFloatingButtonOpen ? 'rotate-45' : 'rotate-0'}`}
        >
        <img
            src={plusBtn}
            alt='플로팅 버튼 아이콘'
            className={`w-8 h-8 transition-transform duration-300 ${isFloatingButtonOpen ? 'rotate-20' : 'rotate-0'}`}
        />
        </button>
        
        {/* 플로팅 버튼이 열렸을 때 나타나는 옵션들 */}
        {isFloatingButtonOpen && (
        <div onClick={() => setIsFloatingButtonOpen(false)} className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-500 ease-in-out flex justify-end items-end p-8 z-40">
            <div onClick={(e) => e.stopPropagation()} className="fixed bottom-28 right-10 flex flex-col space-y-4 pointer-events-auto">
            {/* 첫 번째 버튼 */}
            <button
                className={`w-auto h-auto rounded-tl-xl rounded-tr-xl rounded-bl-xl bg-white text-black font-semibold shadow-lg py-2 px-4 hover:bg-gray-100 transition-all duration-300 ease-out transform ${
                showFirstButton ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
            >
                번개런 일정 추가하기
            </button>

            {/* 두 번째 버튼 */}
            <button
                className={`w-auto h-auto rounded-tl-xl rounded-tr-xl rounded-bl-xl bg-white text-black font-semibold shadow-lg py-2 px-4 hover:bg-gray-100 transition-all duration-300 ease-out transform ${
                showSecondButton ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
            >
                정규런 일정 추가하기
            </button>

            {/* 세 번째 버튼 */}
            <button
                className={`w-auto h-auto rounded-tl-xl rounded-tr-xl rounded-bl-xl bg-white text-black font-semibold shadow-lg py-2 px-4 hover:bg-gray-100 transition-all duration-300 ease-out transform ${
                showThirdButton ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
            >
                훈련 일정 추가하기
            </button>

            {/* 세 번째 버튼 */}
            <button
                className={`w-auto h-auto rounded-tl-xl rounded-tr-xl rounded-bl-xl bg-white text-black font-semibold shadow-lg py-2 px-4 hover:bg-gray-100 transition-all duration-300 ease-out transform ${
                showFourthButton ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
            >
                행사 일정 추가하기
            </button>
            </div>
        </div>
        )}

        {/* Footer Section */}
        <div className="footer">
            <NavBar />
        </div>
    </div>
  );
};

export default Main;

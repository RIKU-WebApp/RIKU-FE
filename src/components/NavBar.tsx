import React from 'react';
import './NavBar.css';
import calicon from '../assets/navi-icon/calender-icon.svg';
import homeicon from '../assets/navi-icon/home-icon.svg';
import myicon from '../assets/navi-icon/my-icon.svg';
import rankicon from '../assets/navi-icon/ranking-icon.svg';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { useState } from 'react';

const NavBar: React.FC = () => {
    // 버튼과 오버레이 상태를 관리하는 state (true일 때 열림 상태)
    const [isOpen, setIsOpen] = useState<boolean>(false);

    // 버튼과 오버레이 상태를 동시에 토글하는 함수
    const toggleButtonAndOverlay = () => {
        setIsOpen(!isOpen); // 현재 상태의 반대로 변경
    };

    return (
        <div className='navbar-container'>
            <nav>
                <div>
                    <img src={homeicon} alt='home'/>
                    <div>홈</div>
                </div>
                <div>
                    <img src={calicon} alt='calender'/>
                    <div>일정</div>
                </div>
                <div>
                    <img src={rankicon} alt='ranking'/>
                    <div>순위</div>
                </div>
                <div>
                    <img src={myicon} alt='mypage'/>
                    <div>마이페이지</div>
                </div>
            </nav>

            {/* 오버레이가 활성화되면 화면을 어둡게 하는 요소 */}
            {isOpen && (
                <div className="nav-overlay" onClick={toggleButtonAndOverlay}></div>
            )}

            <div className='btn-container'>
                <button className={`floating-btn ${isOpen ? 'open' : ''}`} onClick={toggleButtonAndOverlay}>
                    <span className="nav-icon">+</span>
                </button>

                {/* 메뉴가 열릴 때 세로로 펼쳐지는 메뉴 리스트 */}
                {isOpen && (
                    <div className="menu-container">
                        <ul className="menu-list">
                            <li>정규런 만들기</li>
                            <li>번개런 만들기</li>
                            <li>훈련 만들기</li>
                            <li>행사 만들기</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NavBar;

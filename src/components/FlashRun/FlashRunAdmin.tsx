import React, { useState } from "react";
import './FlashRunAdmin.css';
import FlashRunBackimg from '../../assets/FlashRunDetail/flashrunimage.jpeg';
import FlashRunlogo from '../../assets/FlashRunDetail/flashrunlogo.svg';
import people from '../../assets/FlashRunDetail/people.svg';
import place from '../../assets/FlashRunDetail/place.svg';
import time from '../../assets/FlashRunDetail/time.svg';
import TabButton from "./TapButton";
import AttendanceList from "./AttendanceList";
import { User } from "./types"; // User 타입 import

const mockUsers: User[] = [
    { id: 1, name: "이운태", profileImage: null, isPresent: true },
    { id: 2, name: "헤유니", profileImage: null, isPresent: true },
    { id: 3, name: "신땅호", profileImage: null, isPresent: true },
    { id: 4, name: "김갱민", profileImage: null, isPresent: false },
    { id: 5, name: "허준호", profileImage: null, isPresent: true },
    { id: 6, name: "남예지", profileImage: null, isPresent: true },
];


const FlashRunAdmin: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [buttonText, setButtonText] = useState("시작하기");
    const [code, setCode] = useState(""); // 랜덤 숫자를 저장
    const [checkCode, setCheckCode] = useState<string | null>(null); // 참여 코드 저장
    const [isInputDisabled, setIsInputDisabled] = useState(false);
    const [activeTab, setActiveTab] = useState<'소개' | '명단'>('소개');
    const [isFinished, setIsFinished] = useState(false);

    const handleStartClick = () => {
        if (!checkCode) {
            // 참여 코드가 없을 경우에만 새 코드 생성
            const randomCode = Math.floor(100 + Math.random() * 900).toString(); // 3자리 랜덤 숫자 생성
            setCode(randomCode);
            setCheckCode(randomCode); // checkCode 변수에 저장
        } else {
            setCode(checkCode); // 기존 코드 유지
        }
        setIsInputDisabled(true); // 입력창 비활성화
        setIsModalOpen(true); // 모달 열기
    };

    const handleModalStartClick = () => {
        if (isFinished) {
            return; // 이미 종료 상태일 경우 아무 작업도 하지 않음
        }
        if (!checkCode) {
            return; // 참여 코드가 없으면 실행하지 않음
        }
        setButtonText("마감됨");
        setIsFinished(true);
        setIsModalOpen(false);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleTabChange = (tab: '소개' | '명단') => {
        setActiveTab(tab);
    };

    return (
        <div className="container">
            <div>
                <img src={FlashRunBackimg} alt="flashrunimg" width="373px" />
            </div>
            <div className="title-container">
                <div>
                    <img src={FlashRunlogo} alt="flshrunlogo" />
                </div>
                <div className="flashrun-title">어린이대공원 러닝</div>
            </div>
            <div className="info-container">
                <div className="info-item">
                    <img src={place} alt="place-icon" className="icon" />
                    <span>동방 앞</span>
                </div>
                <div className="info-item">
                    <img src={time} alt="time-icon" className="icon" />
                    <span>8월 7일 19:00</span>
                </div>
                <div className="info-item">
                    <img src={people} alt="people-icon" className="icon" />
                    <span>11 / 0</span>
                </div>
            </div>
            <div>
                <TabButton
                    leftLabel="소개"
                    rightLabel="명단"
                    onTabChange={handleTabChange}
                />
            </div>
            {activeTab === '소개' && (
                <>
                    <div className="pacer">이운태</div>
                    <div className="detail">
                        <div className="pacer-name">이운태</div>
                        <div className="detail-content">
                            <p>업힐도 적당히 있고 공원길도 넓어서 뛰기에 아주 재밌는 코스야~</p>
                            <p>
                                물품보관소가 매우 협소하고 짐칸이 몇 개 없어서 짐을 못 맡길 수 있으니 짐을 최소화해
                                주거나 동방에 두고 오기!!
                            </p>
                        </div>
                    </div>
                </>
            )}
            {activeTab === '명단' && 
                <div>
                <AttendanceList users={mockUsers} />
    
                </div>}

            <button
                className="start-button"
                onClick={handleStartClick}
                style={{
                    backgroundColor: isFinished ? "#ECEBE4" : "#366943",
                    color: isFinished ? "#757575" : "white",
                    cursor: isFinished ? "not-allowed" : "pointer",
                }}
                disabled={isFinished}
            >
                {buttonText}
            </button>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <button className="close-button" onClick={handleCloseModal}>
                            ×
                        </button>
                        <h2>참여 코드가 생성되었습니다.</h2>
                        <input
                            type="text"
                            className="code-input"
                            value={code}
                            disabled={true} // 항상 비활성화
                        />
                        <div className="modal-button-container">
                            <button
                                className="modal-start-button active"
                                onClick={handleModalStartClick}
                            >
                                종료하기
                            </button>
                            <button
                                className="modal-start-button cancel-button"
                                onClick={handleCloseModal}
                            >
                                창닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FlashRunAdmin;

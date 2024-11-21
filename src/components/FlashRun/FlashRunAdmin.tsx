import React, { useState } from "react";
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
        if (isFinished) return; // 이미 종료 상태일 경우 아무 작업도 하지 않음
        if (!checkCode) return; // 참여 코드가 없으면 실행하지 않음

        setButtonText("마감됨");
        setIsFinished(true);
        setIsModalOpen(false);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleTabChange = (tab: '소개' | '명단') => setActiveTab(tab);

    return (
        <div className="flex flex-col items-center text-center px-5">
            <div>
                <img src={FlashRunBackimg} alt="flashrunimg" className="w-[373px]" />
            </div>
            <div className="flex flex-col items-center mt-2.5">
                <img src={FlashRunlogo} alt="flashrunlogo" />
                <div className="text-lg font-semibold mt-2">어린이대공원 러닝</div>
            </div>
            <div className="flex flex-col items-start w-full max-w-[360px] mt-5">
                <div className="flex items-center my-1.5">
                    <img src={place} alt="place-icon" className="w-6 h-6 mr-2" />
                    <span>동방 앞</span>
                </div>
                <div className="flex items-center my-1.5">
                    <img src={time} alt="time-icon" className="w-6 h-6 mr-2" />
                    <span>8월 7일 19:00</span>
                </div>
                <div className="flex items-center my-1.5">
                    <img src={people} alt="people-icon" className="w-6 h-6 mr-2" />
                    <span>11 / 0</span>
                </div>
            </div>
            <TabButton
                leftLabel="소개"
                rightLabel="명단"
                onTabChange={handleTabChange}
            />
            {activeTab === '소개' && (
                <>
                    <div className="flex justify-center items-center w-[327px] h-14 bg-[#F0F4DD] rounded-lg text-sm font-normal mt-5">
                        이운태
                    </div>
                    <div className="mt-5 w-[327px] border border-[#ECEBE4] rounded-lg">
                        <div className="text-left p-5">이운태</div>
                        <div className="text-[#686F75] p-5 text-justify">
                            <p>업힐도 적당히 있고 공원길도 넓어서 뛰기에 아주 재밌는 코스야~</p>
                            <p>
                                물품보관소가 매우 협소하고 짐칸이 몇 개 없어서 짐을 못 맡길 수 있으니 짐을
                                최소화해 주거나 동방에 두고 오기!!
                            </p>
                        </div>
                    </div>
                </>
            )}
            {activeTab === '명단' && <AttendanceList users={mockUsers} />}
            <button
                className={`flex justify-center items-center w-[327px] h-14 rounded-lg text-lg font-bold mt-20 mb-2 ${
                    isFinished
                        ? 'bg-[#ECEBE4] text-[#757575] cursor-not-allowed'
                        : 'bg-[#366943] text-white'
                }`}
                onClick={handleStartClick}
                disabled={isFinished}
            >
                {buttonText}
            </button>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
                    <div className="bg-white p-5 rounded-lg w-[280px] text-center relative">
                        <button
                            className="absolute top-2.5 right-2.5 text-2xl cursor-pointer"
                            onClick={handleCloseModal}
                        >
                            ×
                        </button>
                        <h2>참여 코드가 생성되었습니다.</h2>
                        <input
                            type="text"
                            className="w-full p-2 border-b border-gray-300 text-center text-lg mt-5"
                            value={code}
                            disabled
                        />
                        <div className="flex justify-between mt-5 gap-2">
                            <button
                                className="w-full py-3 rounded-lg bg-[#366943] text-white text-lg"
                                onClick={handleModalStartClick}
                            >
                                종료하기
                            </button>
                            <button
                                className="w-full py-3 rounded-lg bg-gray-300 text-gray-700"
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

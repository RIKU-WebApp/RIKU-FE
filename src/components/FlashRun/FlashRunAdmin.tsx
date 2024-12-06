// import React, { useState } from "react";
// import FlashRunBackimg from '../../assets/FlashRunDetail/flashrunimage.jpeg';
// import FlashRunlogo from '../../assets/FlashRunDetail/flashrunlogo.svg';
// import people from '../../assets/FlashRunDetail/people.svg';
// import place from '../../assets/FlashRunDetail/place.svg';
// import time from '../../assets/FlashRunDetail/time.svg';
// import TabButton from "./TapButton";
// import AttendanceList from "./AttendanceList";
// import { User } from "./types"; // User 타입 import

// const mockUsers: User[] = [
//     { id: 1, name: "이운태", profileImage: null, isPresent: true },
//     { id: 2, name: "헤유니", profileImage: null, isPresent: true },
//     { id: 3, name: "신땅호", profileImage: null, isPresent: true },
//     { id: 4, name: "김갱민", profileImage: null, isPresent: false },
//     { id: 5, name: "허준호", profileImage: null, isPresent: true },
//     { id: 6, name: "남예지", profileImage: null, isPresent: true },
// ];

// interface FlashRunAdminProps {
//     title : string,
//     location : string,
//     date : string,
//     content : string,
//     userName : string,
//     participantsNum : number,
// }

// const FlashRunAdmin: React.FC<FlashRunAdminProps> = ({ title , location, date, participantsNum, content, userName }) => {
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [buttonText, setButtonText] = useState("시작하기");
//     const [code, setCode] = useState(""); // 랜덤 숫자를 저장
//     const [checkCode, setCheckCode] = useState<string | null>(null); // 참여 코드 저장
//     const [isInputDisabled, setIsInputDisabled] = useState(false);
//     const [activeTab, setActiveTab] = useState<'소개' | '명단'>('소개');
//     const [isFinished, setIsFinished] = useState(false);

//     const handleStartClick = () => {
//         if (!checkCode) {
//             const randomCode = Math.floor(100 + Math.random() * 900).toString(); // 3자리 랜덤 숫자 생성
//             setCode(randomCode);
//             setCheckCode(randomCode); // checkCode 변수에 저장
//         } else {
//             setCode(checkCode); // 기존 코드 유지
//         }
//         setIsInputDisabled(true); // 입력창 비활성화
//         setIsModalOpen(true); // 모달 열기
//     };

//     const handleModalStartClick = () => {
//         if (isFinished) return; // 이미 종료 상태일 경우 아무 작업도 하지 않음
//         if (!checkCode) return; // 참여 코드가 없으면 실행하지 않음

//         setButtonText("마감됨");
//         setIsFinished(true);
//         setIsModalOpen(false);
//     };

//     const handleCloseModal = () => setIsModalOpen(false);

//     const handleTabChange = (tab: '소개' | '명단') => setActiveTab(tab);

//     return (
//         <div className="flex flex-col items-center text-center px-5 justify-center">
//             <div>
//                 <img src={FlashRunBackimg} alt="flashrunimg" className="w-[373px]" />
//             </div>
//             <div className="flex flex-col items-center mt-2.5">
//                 <img src={FlashRunlogo} alt="flashrunlogo" />
//                 <div className="text-lg font-semibold mt-2">{title}</div>
//             </div>
//             <div className="flex flex-col items-start w-full max-w-[360px] mt-5">
//                 <div className="flex items-center my-1.5">
//                     <img src={place} alt="place-icon" className="w-6 h-6 mr-2" />
//                     <span>{location}</span>
//                 </div>
//                 <div className="flex items-center my-1.5">
//                     <img src={time} alt="time-icon" className="w-6 h-6 mr-2" />
//                     <span>{date}</span>
//                 </div>
//                 <div className="flex items-center my-1.5">
//                     <img src={people} alt="people-icon" className="w-6 h-6 mr-2" />
//                     <span>{participantsNum}</span>
//                 </div>
//             </div>
//             <TabButton
//                 leftLabel="소개"
//                 rightLabel="명단"
//                 onTabChange={handleTabChange}
//             />
//             {activeTab === '소개' && (
//                 <>
//                     <div className="flex justify-center items-center w-[327px] h-14 bg-[#F0F4DD] rounded-lg text-sm font-normal mt-5">
//                         {userName}
//                     </div>
//                     <div className="mt-5 w-[327px] border border-[#ECEBE4] rounded-lg">
//                         <div className="text-left p-5">이운태</div>
//                         <div className="text-[#686F75] p-5 text-justify">
//                             {content}
//                         </div>
//                     </div>
//                 </>
//             )}
//             {activeTab === '명단' && <AttendanceList users={mockUsers} />}
//             <button
//                 className={`flex justify-center items-center w-[327px] h-14 rounded-lg text-lg font-bold mt-20 mb-2 ${
//                     isFinished
//                         ? 'bg-[#ECEBE4] text-[#757575] cursor-not-allowed'
//                         : 'bg-[#366943] text-white'
//                 }`}
//                 onClick={handleStartClick}
//                 disabled={isFinished}
//             >
//                 {buttonText}
//             </button>
//             {isModalOpen && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
//                     <div className="bg-white p-5 rounded-lg w-[280px] text-center relative">
//                         <button
//                             className="absolute top-2.5 right-2.5 text-2xl cursor-pointer"
//                             onClick={handleCloseModal}
//                         >
//                             ×
//                         </button>
//                         <h2>참여 코드가 생성되었습니다.</h2>
//                         <input
//                             type="text"
//                             className="w-full p-2 border-b border-gray-300 text-center text-lg mt-5"
//                             value={code}
//                             disabled
//                         />
//                         <div className="flex justify-between mt-5 gap-2">
//                             <button
//                                 className="w-full py-3 rounded-lg bg-[#366943] text-white text-lg"
//                                 onClick={handleModalStartClick}
//                             >
//                                 종료하기
//                             </button>
//                             <button
//                                 className="w-full py-3 rounded-lg bg-gray-300 text-gray-700"
//                                 onClick={handleCloseModal}
//                             >
//                                 창닫기
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default FlashRunAdmin;

import React from "react";
import FlashRunBackimg from "../../assets/FlashRunDetail/flashrunimage.jpeg";
import FlashRunlogo from "../../assets/FlashRunDetail/flashrunlogo.svg";
import people from "../../assets/FlashRunDetail/people.svg";
import place from "../../assets/FlashRunDetail/place.svg";
import time from "../../assets/FlashRunDetail/time.svg";
import TabButton from "./TapButton";
import AttendanceList from "./AttendanceList";

// 참가자 데이터 타입 정의
interface Participant {
  id: number;
  name: string;
  profileImage?: string | null;
  isPresent: boolean;
}

// FlashRunAdmin 데이터 타입 정의
interface FlashRunAdminData {
  title: string;
  location: string;
  date: string;
  participants: Participant[];
  participantsNum: number;
  content: string;
  userName: string;
}

const FlashRunAdmin: React.FC<FlashRunAdminData> = ({
  title,
  location,
  date,
  participants,
  participantsNum,
  content,
  userName,
}) => {
  const [activeTab, setActiveTab] = React.useState<"소개" | "명단">("소개");

  // 탭 변경 핸들러
  const handleTabChange = (tab: "소개" | "명단") => setActiveTab(tab);

  return (
    <div className="flex flex-col items-center text-center px-5 justify-center">
      {/* 배경 이미지 */}
      <div>
        <img src={FlashRunBackimg} alt="flashrunimg" className="w-[373px]" />
      </div>

      {/* 로고와 제목 */}
      <div className="flex flex-col items-center mt-2.5">
        <img src={FlashRunlogo} alt="flashrunlogo" />
        <div className="text-lg font-semibold mt-2">{title}</div>
      </div>

      {/* 장소, 시간, 참여 인원 정보 */}
      <div className="flex flex-col items-start w-full max-w-[360px] mt-5">
        <div className="flex items-center my-1.5">
          <img src={place} alt="place-icon" className="w-6 h-6 mr-2" />
          <span>{location}</span>
        </div>
        <div className="flex items-center my-1.5">
          <img src={time} alt="time-icon" className="w-6 h-6 mr-2" />
          <span>{date}</span>
        </div>
        <div className="flex items-center my-1.5">
          <img src={people} alt="people-icon" className="w-6 h-6 mr-2" />
          <span>{participantsNum}명 참여 중</span>
        </div>
      </div>

      {/* 탭 버튼 */}
      <TabButton
        leftLabel="소개"
        rightLabel="명단"
        onTabChange={handleTabChange}
      />

      {/* 소개 탭 */}
      {activeTab === "소개" && (
        <>
          <div className="flex justify-center items-center w-[327px] h-14 bg-[#F0F4DD] rounded-lg text-sm font-normal mt-5">
            {userName}
          </div>
          <div className="mt-5 w-[327px] border border-[#ECEBE4] rounded-lg">
            <div className="text-left p-5">{userName}</div>
            <div className="text-[#686F75] p-5 text-justify">{content}</div>
          </div>
        </>
      )}

      {/* 명단 탭 */}
      {activeTab === "명단" && <AttendanceList users={participants} />}
    </div>
  );
};

export default FlashRunAdmin;

import React, { useState } from "react";
import FlashRunBackimg from "../../assets/FlashRunDetail/flashrunimage.jpeg";
import FlashRunlogo from "../../assets/FlashRunDetail/flashrunlogo.svg";
import people from "../../assets/FlashRunDetail/people.svg";
import place from "../../assets/FlashRunDetail/place.svg";
import time from "../../assets/FlashRunDetail/time.svg";
import TabButton from "./TapButton";
import AttendanceList from "./AttendanceList";
import customAxios from "../../apis/customAxios";

interface Participant {
  id: number;
  name: string;
  profileImage?: string | null;
  isPresent: boolean;
}

interface FlashRunUserData {
  title: string;
  location: string;
  date: string;
  participants: Participant[];
  participantsNum: number;
  content: string;
  userName: string;
  code?: string;
  postId?: string; // 게시글 ID
  userStatus?: string; // 유저의 현재 상태 (참여, 출석 등)
}

const FlashRunUser: React.FC<FlashRunUserData> = ({
  title,
  location,
  date,
  participants,
  participantsNum,
  content,
  userName,
  postId,
}) => {
  const [activeTab, setActiveTab] = useState<"소개" | "명단">("소개");
  const [buttonText, setButtonText] = useState("참여하기");
  const [code, setCode] = useState(""); // 출석 코드
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null); // 에러 메시지
  const [userStatus, setUserStatus] = useState(""); // 기본 상태 PENDING

  const handleStartClick = async () => {
    try {
      
      const response = await customAxios.post(`/run/post/${postId}/join`, {}, {
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIzIiwicm9sZSI6IlJPTEVfTUVNQkVSIiwiZXhwIjoxNzM4NjE0ODc0fQ.Rky7Mr2aywLO98GOLCAl-oNL4nRHOMdrA41DR3fpcMg`, // 적절한 토큰으로 교체
        },
      });

      if (response.data.isSuccess) {
        setUserStatus(response.data.result.status); // 상태 업데이트
        setButtonText("출석하기");
        setError(null);
      } else {
        setError(response.data.responseMessage);
      }
    } catch (error: any) {
      setError("러닝 참여에 실패했습니다.");
    }
  };

  const handleOpenAttendanceModal = () => {
    setIsModalOpen(true); // 모달 열기
  };

  const handleAttendanceClick = async () => {
    if (!code) {
      setError("출석 코드를 입력해주세요.");
      return;
    }

    try {
      const UNTAE_TOKEN = process.env.UNTAE_TOKEN
      const response = await customAxios.post(
        `/run/post/${postId}/attend`,
        { code },
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIzIiwicm9sZSI6IlJPTEVfTUVNQkVSIiwiZXhwIjoxNzM4NjE0ODc0fQ.Rky7Mr2aywLO98GOLCAl-oNL4nRHOMdrA41DR3fpcMg`
          },
        }
      );

      if (response.data.isSuccess) {
        setUserStatus(response.data.result.status); // 출석 상태로 업데이트
        setButtonText("마감됨");
        setError(null);
        setIsModalOpen(false); // 모달 닫기
      } else {
        setError(response.data.responseMessage);
      }
    } catch (error: any) {
      setError("출석에 실패했습니다.");
    }
  };

  const handleTabChange = (tab: "소개" | "명단") => setActiveTab(tab);

  return (
    <div className="flex flex-col items-center text-center px-5 justify-center">
      <div>
        <img src={FlashRunBackimg} alt="flashrunimg" className="w-[373px]" />
      </div>
      <div className="flex flex-col items-center mt-2.5">
        <img src={FlashRunlogo} alt="flashrunlogo" />
        <div className="text-lg font-semibold mt-2">{title}</div>
      </div>
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
      <TabButton
        leftLabel="소개"
        rightLabel="명단"
        onTabChange={handleTabChange}
      />
      {activeTab === "소개" && (
        <>
          <div className="flex justify-center items-center w-[327px] h-14 bg-[#F0F4DD] rounded-lg text-sm font-normal mt-5">
            <div className="flex items-center">
              <div className="flex justify-center items-center bg-[#B4D34D] w-6 h-6 rounded-full relative mr-2">
                <span className="text-white text-xs font-bold">
                  {userName.charAt(0)}
                </span>
              </div>
              {userName}
            </div>
          </div>
          <div className="mt-5 w-[327px] border border-[#ECEBE4] rounded-lg">
            <div className="text-left p-5">{userName}</div>
            <div className="text-[#686F75] p-5 text-justify">{content}</div>
          </div>
        </>
      )}
      {activeTab === "명단" && <AttendanceList users={participants} />}
      <button
        className={`flex justify-center items-center w-[327px] h-14 rounded-lg text-lg font-bold mt-20 mb-2 ${
          userStatus === "ATTENDED"
            ? "bg-[#ECEBE4] text-[#757575] cursor-not-allowed"
            : "bg-[#366943] text-white"
        }`}
        onClick={userStatus === "PENDING" ? handleStartClick : handleOpenAttendanceModal}
        disabled={userStatus === "ATTENDED"}
      >
        {buttonText}
      </button>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
          <div className="bg-white p-5 rounded-lg w-[280px] text-center relative">
            <button
              className="absolute top-2.5 right-2.5 text-2xl cursor-pointer"
              onClick={() => setIsModalOpen(false)}
            >
              ×
            </button>
            <h2>출석 코드를 입력해주세요.</h2>
            <input
              type="text"
              className="w-full p-2 border-b border-gray-300 text-center text-lg mt-5"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button
              className="w-full py-3 rounded-lg bg-[#366943] text-white text-lg mt-5"
              onClick={handleAttendanceClick}
            >
              확인
            </button>
            {error && <div className="text-red-500 mt-2">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashRunUser;

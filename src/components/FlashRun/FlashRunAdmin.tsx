import React, { useState } from "react";
import FlashRunlogo from "../../assets/FlashRunDetail/flashrunlogo.svg";
import people from "../../assets/FlashRunDetail/people.svg";
import place from "../../assets/FlashRunDetail/place.svg";
import time from "../../assets/FlashRunDetail/time.svg";
import TabButton from "./TapButton";
import AttendanceList from "./AttendanceList";
import customAxios from "../../apis/customAxios";
import flashrunimage from "../../assets/Run-img/flashrunimage.jpg"; // 번개런 기본이미지

interface Participant {
  id: number;
  name: string;
  profileImage?: string | null;
  isPresent: boolean;
}

interface FlashRunAdminData {
  title: string;
  location: string;
  date: string;
  participants: Participant[];
  participantsNum: number;
  content: string;
  userName: string;
  code?: string;
  postId?: string; // 게시글 ID 추가
  postimgurl:string
}

const FlashRunAdmin: React.FC<FlashRunAdminData> = ({
  title,
  location,
  date,
  participants,
  participantsNum,
  content,
  userName,
  postId,
  postimgurl
}) => {
  const [activeTab, setActiveTab] = useState<"소개" | "명단">("소개");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [buttonText, setButtonText] = useState("시작하기");
  const [code, setCode] = useState(""); // 출석 코드
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState<string | null>(null); // 에러 메시지
  const [currentParticipants, setCurrentParticipants] = useState<Participant[]>(participants);

  const handleStartClick = async () => {
    if (!code) {
      try {
        // 출석 코드 생성 API 호출
        const token = JSON.parse(localStorage.getItem('accessToken') || 'null');
        const response = await customAxios.post(
          `/run/post/${postId}/code`,
          {},
          {
            headers: {
              Authorization: `${token}`, // 적절한 토큰으로 교체
            },
          }
        );
        console.log(response.data)
        if (response.data.isSuccess) {
          const generatedCode = response.data.result.code;
          setCode(generatedCode);
          setIsInputDisabled(true);
          setError(null); // 에러 초기화
        } else {
          setError(response.data.responseMessage);
        }
      } catch (error: any) {
        setError("출석 코드를 생성할 수 없습니다. 다시 시도해주세요.");
      }
    }

    setIsModalOpen(true);
  };

  const handleModalStartClick = () => {
    if (isFinished) return;
    if (!code) return;

    setButtonText("마감됨");
    setIsFinished(true);
    setIsModalOpen(false);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleTabChange = async (tab: "소개" | "명단") => { //명단 탭누를때 마다 명단 사람들의 상태 최신화
    setActiveTab(tab);
    if (tab === "명단") {
      try {
        const token = JSON.parse(localStorage.getItem("accessToken") || "null");
        const response = await customAxios.get(`/run/post/${postId}`, {
          headers: {
            Authorization: `${token}`,
          },
        });
        if (response.data.isSuccess) {
          console.log(response.data)
          setCurrentParticipants(response.data.result.participants); // 최신 참가자 목록 설정
        } else {
          setError(response.data.responseMessage);
        }
      } catch (error: any) {
        setError("참가자 목록을 가져오는 데 실패했습니다.");
      }
    }
  };
  
  return (
    <div className="flex flex-col items-center text-center px-5 justify-center">
      <div>
        <img src={postimgurl || flashrunimage} alt="flashrunimg" className="w-[373px] rounded-b-xl mb-2" />
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
            <div className="text-[#686F75] p-5 text-justify">{content}</div>
          </div>
        </>
      )}
      {activeTab === "명단" && <AttendanceList users={currentParticipants} />}
      <button
        className={`flex justify-center items-center w-[327px] h-14 rounded-lg text-lg font-bold mt-20 mb-2 ${
          isFinished
            ? "bg-[#ECEBE4] text-[#757575] cursor-not-allowed"
            : "bg-[#366943] text-white"
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
            {error && <div className="text-red-500 mt-2">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashRunAdmin;

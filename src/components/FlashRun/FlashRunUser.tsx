import React, { useState } from "react";
import axios from "axios";
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
  title?: string;
  location?: string;
  date?: string;
  participants?: Participant[];
  participantsNum?: number;
  content?: string;
  userName?: string;
  postId?: string; // 게시글 ID
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isParticipated, setIsParticipated] = useState(false);
  const [attendanceCode, setAttendanceCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 참여하기 API 호출
  const handleJoin = async () => {
    try {
      const response = await customAxios.post(
        `run/post/${postId}/join`,
        {},
        {
          headers: {
            Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIzIiwicm9sZSI6IlJPTEVfTUVNQkVSIiwiZXhwIjoxNzM4NjE0ODc0fQ.Rky7Mr2aywLO98GOLCAl-oNL4nRHOMdrA41DR3fpcMg", // 적절한 토큰으로 교체
          },
        }
      );
      if (response.data.isSuccess) {
        setIsParticipated(true);
        alert("참여 신청이 완료되었습니다.");
      } else {
        setErrorMessage(response.data.responseMessage);
      }
    } catch (error) {
      setErrorMessage("참여 요청에 실패했습니다.");
    }
  };

  // 출석하기 API 호출
  const handleAttendance = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8080/run/post/${postId}/attend`,
        { code: attendanceCode },
        {
          headers: {
            Authorization: "Bearer YOUR_TOKEN_HERE", // 적절한 토큰으로 교체
          },
        }
      );
      if (response.data.isSuccess) {
        setIsModalOpen(false);
        alert("출석이 완료되었습니다.");
      } else {
        setErrorMessage(response.data.responseMessage);
      }
    } catch (error) {
      setErrorMessage("출석 요청에 실패했습니다.");
    }
  };

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
        onTabChange={setActiveTab}
      />

      {/* 소개 탭 */}
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

      {/* 명단 탭 */}
      {activeTab === "명단" && <AttendanceList users={participants} />}

      {/* 참여하기 또는 출석하기 버튼 */}
      {!isParticipated ? (
        <button
          className="flex justify-center items-center w-[327px] h-14 bg-[#366943] text-white text-lg font-bold mt-20"
          onClick={handleJoin}
        >
          참여하기
        </button>
      ) : (
        <button
          className="flex justify-center items-center w-[327px] h-14 bg-[#366943] text-white text-lg font-bold mt-20"
          onClick={() => setIsModalOpen(true)}
        >
          출석하기
        </button>
      )}

      {/* 출석 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-5 rounded-lg w-[280px] text-center relative">
            <button
              className="absolute top-2 right-2 text-xl"
              onClick={() => setIsModalOpen(false)}
            >
              ×
            </button>
            <h2 className="text-lg font-semibold">참여 코드를 입력해주세요.</h2>
            <input
              type="text"
              value={attendanceCode}
              onChange={(e) => setAttendanceCode(e.target.value)}
              className="w-full mt-3 p-2 border rounded-lg text-center"
              placeholder="출석 코드"
            />
            <button
              className="bg-[#366943] text-white w-full mt-5 py-2 rounded-lg"
              onClick={handleAttendance}
            >
              출석하기
            </button>
            {errorMessage && (
              <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashRunUser;

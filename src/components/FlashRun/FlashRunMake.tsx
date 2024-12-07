// const handleSubmit = async () => {
  //   if (!title || !location || !content || !dateTime.date) {
  //     alert("모든 정보를 입력해주세요.");
  //     return;
  //   }
  
  //   const options: Intl.DateTimeFormatOptions = {
  //     month: "2-digit",
  //     day: "2-digit",
  //     weekday: "short",
  //   };
  //   const formatter = new Intl.DateTimeFormat("ko-KR", options);
  //   const formattedDateParts = formatter.formatToParts(dateTime.date);
  
  //   const month = formattedDateParts.find((part) => part.type === "month")?.value;
  //   const day = formattedDateParts.find((part) => part.type === "day")?.value;
  //   const weekday = formattedDateParts.find((part) => part.type === "weekday")?.value;
  
  //   if (!month || !day || !weekday) {
  //     alert("날짜 포맷 오류가 발생했습니다.");
  //     console.error("날짜 포맷 오류:", { month, day, weekday });
  //     return;
  //   }
  
  //   const displayDate = `${month}/${day} ${weekday}요일`;
    
  
  //   // 상태 계산
  //   const status = calculateStatus(dateTime.date, dateTime.time);

    
  
  //   const eventData = {
  //     id: getNextId(),
  //     title,
  //     location,
  //     date: displayDate, // 사용자에게 표시될 포맷
  //     isoDate: dateTime.date.toISOString().split("T")[0], // ISO 8601 형식 저장
  //     time: dateTime.time,
  //     imageUrl: file ? URL.createObjectURL(file) : flashrunimage,
  //     status,
  //   };
  
  //   const storedEvents = JSON.parse(localStorage.getItem("events") || "[]");
  //   localStorage.setItem("events", JSON.stringify([...storedEvents, eventData]));
  
  //   navigate("/flash-run");
  // };
  // const getNextId = (): number => {
    //   const storedEvents = JSON.parse(localStorage.getItem("events") || "[]");
    //   if (storedEvents.length === 0) {
    //     return 1;
    //   }
    //   const maxId = Math.max(...storedEvents.map((event: { id: number }) => event.id));
    //   return maxId + 1;
    // };
  // const calculateStatus = (eventDate: Date, eventTime: string): string => {
  //   const currentDateTime = new Date(); // 현재 시간
    
  //   const eventDateTime = new Date(`${eventDate.toISOString().split("T")[0]}T${eventTime}`); // 이벤트 날짜 + 시간
  
  //   const timeDiff = (eventDateTime.getTime() - currentDateTime.getTime() + 86400000) / (1000 * 60); // 분 단위 차이 계산, isodate 때문에 하루 시간이 밀려서 보정한 하루 밀리초 86400000
    

  //   if (timeDiff >= 60) return "prog"; // 1시간 이상 남음
  //   else if (timeDiff < 60 && timeDiff > 0) return "argent"; // 1시간 이하 남음
  //   else return "closed"; // 시간이 초과됨
  // };


import React, { useState } from "react";
import BackIcon from "../../assets/Main-img/back-icon.svg";
import { useNavigate } from "react-router-dom";
import PhotoUpload from "./PhotoUpload";
import { DateNtime } from "./DateNtime";
import flashrunimage from '../../assets/Run-img/flashrunimage.jpg';
import axios from "axios";
import customAxios from '../../apis/customAxios'; // customAxios 경로에 맞게 변경


function FlashRunMake() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [content, setContent] = useState("");
  const [dateTime, setDateTime] = useState<{ date: Date | null; time: string }>({
    date: null,
    time: "00:00",
  });
  const [file, setFile] = useState<File | null>(null);

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      month: "numeric",
      day: "numeric",
      weekday: "long",
    };
  
    // "12월 13일 수요일" 형식으로 포맷팅
    const formattedDate = new Intl.DateTimeFormat("ko-KR", options).format(date);
  
    // "12월 13일 수요일" → ["12월", "13일", "수요일"]
    const [monthDay, weekday] = formattedDate.split(" ");
    const month = monthDay?.split("월")[0]?.trim(); // "12월" → "12"
    const day = monthDay?.split("일")[0]?.split(" ")[1]?.trim(); // "13일" → "13"
  
    // 데이터가 올바르게 파싱되지 않으면 기본값 반환
    if (!month || !day || !weekday) {
      console.error("날짜 포맷 오류:", { month, day, weekday });
      return "날짜 포맷 오류";
    }
  
    return `${month}/${day} ${weekday}`;
  };
  

  const handleDateTimeChange = (date: Date | null, time: string) => {
    setDateTime({ date, time });
  };

  const handleTitle = (e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value);
  const handleLocation = (e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value);
  const handleContent = (e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value);
  const handleFileChange = (selectedFile: File | null) => setFile(selectedFile);


  
  const handleSubmit = async () => {
    if (!title || !location || !content || !dateTime.date) {
      alert("모든 정보를 입력해주세요.");
      return;
    }
  
    try {
      // 날짜 및 시간 포맷팅
      const isoDate = dateTime.date.toISOString().split("T")[0];
      const eventDateTime = `${isoDate}T${dateTime.time}`;
      
      // FormData 생성
      const formData = new FormData();
      formData.append("title", title);
      formData.append("location", location);
      formData.append("date", eventDateTime);
      formData.append("content", content);
      if (file) {
        formData.append("postImage", file);
      }
  
      // API 요청
      const response = await customAxios.post(
        "run/flash/post", // 엔드포인트
        formData,
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIzIiwicm9sZSI6IlJPTEVfTUVNQkVSIiwiZXhwIjoxNzM4NjE0ODc0fQ.Rky7Mr2aywLO98GOLCAl-oNL4nRHOMdrA41DR3fpcMg`, // 적절한 토큰으로 교체
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      console.log(response.data)
      // 성공 처리
      if (response.data.isSuccess) {
        alert("번개런이 성공적으로 생성되었습니다!");
        navigate("/run");
      } else {
        alert(`요청 실패: ${response.data.responseMessage}`);
      }
    } catch (error) {
      console.error("번개런 생성 중 오류:", error);
      alert("번개런 생성 중 문제가 발생했습니다.");
    }
  };
  
  

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          maxWidth: "600px",
          padding: "0 20px",
          marginBottom: "20px",
          position: "relative",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            position: "absolute",
            left: "160px",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
          aria-label="뒤로가기"
        >
          <img src={BackIcon} alt="뒤로가기" style={{ width: "24px", height: "24px" }} />
        </button>
        <div style={{ margin: "20px", fontSize: "24px", fontWeight: "600" }}>번개런 만들기</div>
      </div>
      <div>
        <div className="my-2">제목</div>
        <input
          placeholder="제목을 입력하세요"
          className="my-2 border border-gray-300 rounded-lg px-4 py-2 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
          onChange={handleTitle}
        />
        <div className="my-2">집합 장소</div>
        <input
          placeholder="장소명을 입력하세요"
          className="my-2 border border-gray-300 rounded-lg px-4 py-2 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
          onChange={handleLocation}
        />
        <div className="my-2">날짜 및 시간</div>
        <DateNtime onDateTimeChange={handleDateTimeChange} />
        <div className="my-2">세부사항</div>
        <textarea
          className="my-2 w-full p-2 border rounded-lg"
          rows={10}
          placeholder="세부사항을 입력하세요"
          value={content}
          onChange={handleContent}
        ></textarea>
        <div className="my-2">게시글 사진</div>
        <PhotoUpload onFileChange={handleFileChange} />
        <button
          type="button"
          onClick={handleSubmit}
          className="my-2 w-full py-3 rounded-lg bg-[#366943] text-white text-lg my-4"
        >
          만들기
        </button>
      </div>
    </div>
  );
}

export default FlashRunMake;

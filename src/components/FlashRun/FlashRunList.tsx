// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import EventCard from "./EventCard";
// import BackIcon from "../../assets/Main-img/back-icon.svg";

// interface CardData {
//   id: number;
//   title: string;
//   date: string;
//   date_name: string;
//   time: string;
//   participants?: number;
//   status: string;
//   imageUrl: string;
//   isoDate: string;
//   onClick?: () => void;
// }

// const FlashRunList: React.FC = () => {
//   const [events, setEvents] = useState<CardData[]>([]);
//   const navigate = useNavigate();

//   // 상태 계산 함수
//   const calculateStatus = (isoDate: string, eventTime: string): string => {
//     const currentDateTime = new Date(); // 현재 시간
//     const eventDateTime = new Date(`${isoDate}T${eventTime}`); // 이벤트 날짜 + 시간
  
//     const timeDiff = (eventDateTime.getTime() - currentDateTime.getTime() + 86400000) / (1000 * 60); // 분 단위 차이 계산, isodate 때문에 하루 시간이 밀려서 보정한 하루 밀리초 86400000
  
//     if (timeDiff >= 60) return "prog"; // 1시간 이상 남음
//     else if (timeDiff < 60 && timeDiff > 0) return "argent"; // 1시간 이하 남음
//     else return "closed"; // 시간이 초과됨
//   };
  
  
  
  
//   // 초기 데이터 로드 및 상태 계산
//   useEffect(() => {
//     const storedEvents = JSON.parse(localStorage.getItem("events") || "[]");
  
//     const updatedEvents = storedEvents.map((event: CardData) => ({
//       ...event,
//       status: calculateStatus(event.isoDate, event.time), // isoDate를 사용
//     }));
  
//     setEvents(updatedEvents);
//   }, []);
  
  
  
  
  
  
//   // 이벤트 삭제 처리
//   const handleDelete = (id: number) => {
//     const updatedEvents = events.filter((event) => event.id !== id);
//     setEvents(updatedEvents);
//     localStorage.setItem("events", JSON.stringify(updatedEvents));
//   };

//   const handleCardClickUser = () => navigate("/flash-run/user");
//   const handleCardClickAdmin = () => navigate("/flash-run/admin");

//   return (
//     <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh" }}>
//       {/* 상단 바 */}
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           width: "100%",
//           maxWidth: "600px",
//           padding: "0 20px",
//           marginBottom: "20px",
//           position: "relative",
//         }}
//       >
//         <button onClick={() => navigate(-1)} style={{ position: "absolute", left: "160px", background: "none", border: "none", cursor: "pointer" }} aria-label="뒤로가기">
//           <img src={BackIcon} alt="뒤로가기" style={{ width: "24px", height: "24px" }} />
//         </button>
//         <div style={{ margin: "20px", fontSize: "24px", fontWeight: "600" }}>번개런</div>
//       </div>

//       {/* 내용 */}
//       <div className="content">
//         {/* 기본 테스트 카드 */}
//         <EventCard title={"관리자 test"} date={"7/28 월요일"} status={"argent"} time="13:00" path="/flash-run/admin" onClick={handleCardClickAdmin} />
//         <EventCard title={"만들기 test"} date={"7/28 월요일"} status={"prog"} path="/flash-run/user" onClick={handleCardClickUser} /> 

//         {/* 동적 이벤트 카드 */}
//         {events.map((event) => (
//         <EventCard
//             key={event.id}
//             id={event.id}
//             title={event.title}
//             date={event.date}
//             time={event.time}
//             imageUrl={event.imageUrl}
//             status={event.status} // 계산된 상태 전달
//             onDelete={() => handleDelete(event.id)} // 삭제 핸들러 전달
//         />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default FlashRunList;


// // 상태 계산 함수
  // const calculateStatus = (isoDate: string): string => {
  //   const currentDateTime = new Date();
  //   const eventDateTime = new Date(isoDate);
  //   const timeDiff = (eventDateTime.getTime() - currentDateTime.getTime() + 86400000) / (1000 * 60); // 분 단위 차이 계산

  //   if (timeDiff >= 60) return "prog"; // 1시간 이상 남음
  //   else if (timeDiff < 60 && timeDiff > 0) return "argent"; // 1시간 이하 남음
  //   else return "closed"; // 시간이 초과됨
  // };

  // // 이벤트 삭제 처리
  // const handleDelete = (id: number) => {
  //   const updatedEvents = events.filter((event) => event.id !== id);
  //   setEvents(updatedEvents);
  //   localStorage.setItem("events", JSON.stringify(updatedEvents));
  // };

  // const handleCardClickUser = () => navigate("/flash-run/user");
  // const handleCardClickAdmin = () => navigate("/flash-run/admin");

  
  import React, { useEffect, useState } from "react";
  import { useNavigate } from "react-router-dom";
  import EventCard from "./EventCard";
  import BackIcon from "../../assets/Main-img/back-icon.svg";
  import customAxios from "../../apis/customAxios"; // Axios 인스턴스
  
  // 이벤트 카드 데이터 인터페이스 정의
  interface CardData {
    id: number;
    title: string;
    date: string; // 표시할 날짜 문자열
    time: string; // 표시할 시간 (HH:mm 형식)
    participants?: number; // 참가자 수 (선택 사항)
    status: string; // 이벤트 상태 (prog, argent, closed 등)
    imageUrl: string; // 이벤트 이미지 URL
    isoDate: string; // ISO 형식의 원본 날짜
    onClick?: () => void; // 클릭 이벤트 핸들러 (선택 사항)
  }
  
  const FlashRunList: React.FC = () => {
    const [events, setEvents] = useState<CardData[]>([]); // 이벤트 목록 상태
    const navigate = useNavigate(); // 페이지 이동을 위한 네비게이트 훅
  
    // 서버에서 데이터를 가져오는 함수
    useEffect(() => {
      const fetchEvents = async () => {
        try {
          // 서버에 요청을 보낼 때 사용할 인증 토큰
          
  
          // 서버 API 호출
          const response = await customAxios.get(`/run/flash`, {
            headers: { Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIzIiwicm9sZSI6IlJPTEVfTUVNQkVSIiwiZXhwIjoxNzM4NjE0ODc0fQ.Rky7Mr2aywLO98GOLCAl-oNL4nRHOMdrA41DR3fpcMg` },
          });
          console.log(response.data)
          // API 응답이 성공적인 경우
          if (response.data.isSuccess) {
            // 상태 매핑 객체 정의
            const statusMap: Record<string, string> = {
              NOW: "prog",
              CLOSING: "argent",
              CLOSED: "closed",
            };
  
            // 이벤트 데이터를 변환하여 사용 가능한 형식으로 매핑
            const fetchedEvents = response.data.result.map((event: any) => {
              const eventDate = new Date(event.date); // ISO 형식의 날짜를 Date 객체로 변환
              const hours = eventDate.getHours(); // 시 추출
              const minutes = eventDate.getMinutes(); // 분 추출
  
              // 날짜를 "12월 5일 목요일" 형식으로 포맷팅
              const formattedDate = eventDate.toLocaleDateString("ko-KR", {
                month: "long",
                day: "numeric",
                weekday: "long",
              });
  
              // 상태 매핑 및 디버깅 로그
              const mappedStatus = statusMap[event.postStatus] || "closed";
              console.log(
                `Mapping status: ${event.postStatus} → ${mappedStatus}`
              );
  
              return {
                id: event.id,
                title: event.title,
                date: formattedDate, // 포맷된 날짜 사용
                time: `${hours.toString().padStart(2, "0")}:${minutes
                  .toString()
                  .padStart(2, "0")}`, // HH:mm 형식의 시간
                participants: event.participants,
                status: mappedStatus,
                imageUrl: event.postImageUrl,
              };
            });
  
            setEvents(fetchedEvents); // 상태 업데이트
          } else {
            console.error("데이터 로드 실패:", response.data.responseMessage);
          }
        } catch (error) {
          console.error("API 요청 오류:", error);
        }
      };
  
      fetchEvents(); // 데이터 가져오기 호출
    }, []);
  
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        {/* 상단 바 */}
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
          {/* 뒤로가기 버튼 */}
          <button
            onClick={() => navigate("/main")}
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
          {/* 제목 */}
          <div style={{ margin: "20px", fontSize: "24px", fontWeight: "600" }}>번개런</div>
        </div>
  
        {/* 내용 */}
        <div className="content">
          {/* 동적으로 생성된 이벤트 카드 */}
          {events.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              title={event.title}
              date={event.date} // 포맷된 날짜 전달
              time={event.time} // 시간 전달
              imageUrl={event.imageUrl} // 이미지 URL 전달
              status={event.status} // 상태 전달
              onClick={() => navigate(`/run/post/${event.id}`)}
            />
          ))}
        </div>
      </div>
    );
  };
  
  export default FlashRunList;
  

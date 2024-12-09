import React from 'react';
import ContentList from './ContentList';
import toplogo from './assets/Main-img/toplogo.svg';
import RikuMainPhoto from './assets/Main-img/RikuMainPhoto.svg';
import NavBar from './components/NavBar';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import plusBtn from './assets/plus_Icon.svg'; //라이쿠 로고 불러오기
import customAxios from './apis/customAxios';
import { el } from 'date-fns/locale';
interface MainData {
  id?: number;
  location?: string;
  date?: string; // 표시할 날짜 문자열
  time?: string; // 표시할 시간 (HH:mm 형식)
  participants?: number; // 참가자 수 (선택 사항)
  postStatus?: string; // 이벤트 상태 (prog, argent, closed 등)
  imageUrl?: string; // 이벤트 이미지 URL
  isoDate?: string; // ISO 형식의 원본 날짜
  runtype?: string //러닝 개최 방식
  onClick?: () => void; // 클릭 이벤트 핸들러 (선택 사항)
}
interface EventData {
  location?: string; // 이벤트 위치
  date?: string;     // 표시할 날짜 문자열
}

interface MainData {
  regularRun: EventData; // 정규런 데이터
  flashRun: EventData;   // 번개런 데이터
  training: EventData;   // 훈련 데이터
  event: EventData;      // 행사 데이터
}


const Main_change: React.FC<MainData> = () => {


  const [maindata, setMaindata] = useState<MainData>({
    regularRun: { location: "다음학기에~", date: "..." },
    flashRun: { location: "N/A", date: "..." },
    training: { location: "주말훈련", date: "11/15" },
    event: { location: "행사X", date: "..." },
  });
  const [isFloatingButtonOpen, setIsFloatingButtonOpen] = useState(false);

  //각 버튼의 개별 상태를 관리하여 순차적 pop-up 효과를 구현
  const [showFirstButton, setShowFirstButton] = useState(false);
  const [showSecondButton, setShowSecondButton] = useState(false);
  const [showThirdButton, setShowThirdButton] = useState(false);
  const [showFourthButton, setShowFourthButton] = useState(false);
  const navigate = useNavigate();

  //그리드 레이아웃에 있는 동그라미 버튼(GridContent)를 눌렀을 시의 동작 수행
  const handleCardClick = () => {
    navigate('/run');
  };
  const handleRunMake = () => {
    navigate('/run/make')
  }

  //플로팅 버튼을 눌렀을 때.. 동작하는 floatingButton
  const toggleFloatingButton = () => {
    setIsFloatingButtonOpen(!isFloatingButtonOpen);
  };

  //플로팅 버튼의 상태가 변경될 때 순차적으로 pop-up 시키는 효과 적용
  useEffect(() => {
    if (isFloatingButtonOpen) {
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

  useEffect(() => {
    const fetchMain = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('accessToken') || 'null');
        const response = await customAxios.get(`/home`, {
          headers: { Authorization: `${token}` },
        });

        if (response.data.isSuccess) {
          const MainStatusMap: Record<string, string> = {
            NOW: "prog",
            CLOSING: "argent",
            CLOSED: "closed",
          };

          const result = response.data.result;
          console.log(response.data)
          // 상태를 각 ContentList에 맞게 분리하여 저장
          setMaindata({
            regularRun: {
              location: "See you",
              date: "next time",
            },
            flashRun: {
              location: result[0]?.location || "번개런이 없네요",
              date: (() => {
                const dateObj = new Date(result[0]?.date);
                const month = dateObj.getMonth() + 1; // 월 (0부터 시작하므로 +1)
                const day = dateObj.getDate(); // 일
                const weekday = dateObj.toLocaleDateString("ko-KR", { weekday: "short" }); // 요일
                return `${month}/${day} ${weekday}`;
              })() || "...",
            },
            training: {
              location: "주말훈련",
              date: "11/15",
            },
            event: {
              location: "행사X",
              date: "...",
            },
          });
        } else {
          console.error("데이터를 불러오지 못했습니다.", response.data.responseMessage);
        }
      } catch (error) {
        console.error("API 요청 오류", error);
      }
    };

    fetchMain();
  }, []);


  return (
    <>
      <div className="flex flex-col items-center my-2.5">
        <img src={toplogo} alt="Riku-logo" />
      </div>
      <div className="flex flex-col items-center">
        <img src={RikuMainPhoto} alt="rikumain" className='rounded-xl' />
      </div>
      <div className="flex flex-col items-center justify-center pb-24">
        <div className="grid grid-cols-2 grid-rows-2 w-[375px] mt-7 gap-0 justify-center content-center">
          <ContentList
            eventName="정규런"
            path="/run"
            location={maindata?.regularRun?.location}
            run_date={maindata?.regularRun?.date}
          />
          <ContentList
            eventName="번개런"
            path="/run"
            onClick={handleCardClick}
            location={maindata?.flashRun?.location}
            run_date={maindata?.flashRun?.date}
          />
          <ContentList
            eventName="훈련"
            path="/training"
            location={maindata?.training?.location}
            run_date={maindata?.training?.date}
          />
          <ContentList
            eventName="행사"
            path="/event"
            location={maindata?.event?.location}
            run_date={maindata?.event?.date}
          />
        </div>
      </div>
      {/* 플로팅 버튼 */}
      <button
        onClick={toggleFloatingButton}
        className={`fixed bottom-20 right-4 w-16 h-16 rounded-full bg-kuDarkGreen text-white flex items-center justify-center shadow-lg hover:bg-kuDarkGreen-dark focus:outline-none z-50 transition-transform duration-300 ${isFloatingButtonOpen ? 'rotate-45' : 'rotate-0'}`}
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
          <div onClick={(e) => e.stopPropagation()} className="fixed bottom-40 right-10 flex flex-col space-y-4 pointer-events-auto">
            {/* 첫 번째 버튼 */}
            <button
              className={`w-auto h-auto rounded-tl-xl rounded-tr-xl rounded-bl-xl bg-white text-black font-semibold shadow-lg py-2 px-4 hover:bg-gray-100 transition-all duration-300 ease-out transform ${showFirstButton ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
              onClick={handleRunMake}
            >
              번개런 일정 추가하기
            </button>

            {/* 두 번째 버튼 */}
            <button
              className={`w-auto h-auto rounded-tl-xl rounded-tr-xl rounded-bl-xl bg-white text-black font-semibold shadow-lg py-2 px-4 hover:bg-gray-100 transition-all duration-300 ease-out transform ${showSecondButton ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
            >
              정규런 일정 추가하기
            </button>

            {/* 세 번째 버튼 */}
            <button
              className={`w-auto h-auto rounded-tl-xl rounded-tr-xl rounded-bl-xl bg-white text-black font-semibold shadow-lg py-2 px-4 hover:bg-gray-100 transition-all duration-300 ease-out transform ${showThirdButton ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
            >
              훈련 일정 추가하기
            </button>

            {/* 세 번째 버튼 */}
            <button
              className={`w-auto h-auto rounded-tl-xl rounded-tr-xl rounded-bl-xl bg-white text-black font-semibold shadow-lg py-2 px-4 hover:bg-gray-100 transition-all duration-300 ease-out transform ${showFourthButton ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
            >
              행사 일정 추가하기
            </button>
          </div>
        </div>
      )}
      <div className="fixed bottom-0 w-full">
        <NavBar />
      </div>
    </>
  );
};

export default Main_change;

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NewMainCard from './NewMainCard';
import flashImage from '@assets/default_flashRun.jpeg';
import trainImage from '@assets/defalut_trainingRun.jpeg';
import regularImg from '@assets/default_regular.jpeg';
import eventImg from '@assets/default_event.jpeg';
import TabNavigationUI from '../TabNavigationUI';
import plusBtn from '@assets/plus_Icon.svg';
import img1 from '@assets/main_new.jpg';
import img2 from '@assets/Main-img/main-moving-images/1.png';
import img3 from '@assets/Main-img/main-moving-images/2.png';
import img4 from '@assets/Main-img/main-moving-images/3.jpg';

import customAxios from '@/shared/lib/customAxios';
import NOWimg from '@assets/Main-img/NewOpenStatus.svg';
import PROGRESSimg from '@assets/progress.svg';
import CLODESDimg from '@assets/Main-img/NewClosedStatus.svg';
import CANCELEDimg from '@assets/Main-img/NewCanceledStatus.svg';
import ARGENTimg from '@assets/Main-img/NewUrgentStatus.svg';

import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

interface EventData {
  location?: string; // 이벤트 위치
  date?: string; // 표시할 날짜 문자열
  postimgurl?: string; // 포스트 이미지
  poststatus?: string; // 포스트 상태
  rawDate?: string;
}

interface MainData {
  regularRun: EventData; // 정규런 데이터
  flashRun: EventData; // 번개런 데이터
  training: EventData; // 훈련 데이터
  event: EventData; // 행사 데이터
  onClick?: () => void; // 클릭 이벤트 핸들러
}

const NewMain: React.FC = () => {
  const getStatusImg = (status: string | null | undefined, date?: string) => {
    if (!status || !date) return undefined;

    const utcDate = new Date(date);
    const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
    const now = new Date();

    if (kstDate <= now && (status === 'NOW' || status === 'URGENT')) {
      return PROGRESSimg;
    }

    switch (status) {
      case 'NOW':
        return NOWimg;
      case 'URGENT':
        return ARGENTimg;
      case 'CLOSED':
        return CLODESDimg;
      case 'CANCELED':
        return CANCELEDimg;
      default:
        return undefined;
    }
  };

  const isWithinOneHour = (isoDateString?: string) => {
    if (!isoDateString) return false;

    // 1. UTC → KST로 변환
    const utcDate = new Date(isoDateString);
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstDate = new Date(utcDate.getTime() + kstOffset);

    const now = new Date();

    return kstDate.getTime() - now.getTime() <= 60 * 60 * 1000 && kstDate > now;
  };

  const [maindata, setMaindata] = useState<MainData>({
    regularRun: { location: '없습니다', date: '정규런이' },
    flashRun: { location: '없습니다', date: '번개런이' },
    training: { location: '없습니다', date: '훈련이' },
    event: { location: '없습니다', date: '행사가' },
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [startX, setStartX] = useState<number | null>(null);
  const slideRef = useRef<HTMLDivElement | null>(null);

  const [isFloatingButtonOpen, setIsFloatingButtonOpen] = useState(false);

  const [showFirstButton, setShowFirstButton] = useState(false);
  const [showSecondButton, setShowSecondButton] = useState(false);
  const [showThirdButton, setShowThirdButton] = useState(false);
  const [showFourthButton, setShowFourthButton] = useState(false);

  const [userRole, setUserRole] = useState<string | null>(null);

  const navigate = useNavigate();
  const images = [img1, img2, img3, img4];

  const formatDate = (isoDateString?: string): string => {
    if (!isoDateString) return '-';

    const utcDate = new Date(isoDateString);
    const kstOffset = 9 * 60 * 60 * 1000; // 9시간을 밀리초로 변환
    const kstDate = new Date(utcDate.getTime() + kstOffset);

    const month = kstDate.getMonth() + 1;
    const day = kstDate.getDate();
    const weekday = kstDate.toLocaleDateString('ko-KR', { weekday: 'long' });

    return `${month}/${day} ${weekday}`;
  };

  // 슬라이드 변경 로직
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    const fetchMain = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('accessToken') || 'null');
        const response = await customAxios.get(`/run`, {
          headers: { Authorization: `${token}` },
        });

        if (response.data.isSuccess) {
          const MainStatusMap: Record<string, string> = {
            NOW: 'prog',
            CLOSING: 'argent',
            CLOSED: 'closed',
          };

          const result = response.data.result;

          //userRole저장
          setUserRole(result.userRole || null);

          // 상태를 각 ContentList에 맞게 분리하여 저장
          setMaindata({
            regularRun:
              result.regularRun?.postStatus === 'CANCELED'
                ? { location: '등록된 정규런이\n없습니다' }
                : {
                    location: result.regularRun?.title || '등록된 정규런이\n없습니다',
                    date: formatDate(result.regularRun?.date),
                    rawDate: result.regularRun?.date,
                    postimgurl: result.regularRun?.postImageUrl,
                    poststatus: isWithinOneHour(result.regularRun?.date)
                      ? 'URGENT'
                      : result.regularRun?.postStatus,
                  },
            flashRun:
              result.flashRun?.postStatus === 'CANCELED'
                ? { location: '등록된 번개런이\n없습니다' }
                : {
                    location: result.flashRun?.title || '등록된 번개런이\n없습니다',
                    date: formatDate(result.flashRun?.date), // 표시용
                    rawDate: result.flashRun?.date, // 원본 ISO string 추가
                    postimgurl: result.flashRun?.postImageUrl,
                    poststatus: isWithinOneHour(result.flashRun?.date)
                      ? 'URGENT'
                      : result.flashRun?.postStatus,
                  },
            training:
              result.trainingRun?.postStatus === 'CANCELED'
                ? { location: '등록된 훈련이\n없습니다' }
                : {
                    location: result.trainingRun?.title || '등록된 훈련이\n없습니다',
                    date: formatDate(result.trainingRun?.date),
                    rawDate: result.trainingRun?.date,
                    postimgurl: result.trainingRun?.postImageUrl,
                    poststatus: isWithinOneHour(result.trainingRun?.date)
                      ? 'URGENT'
                      : result.trainingRun?.postStatus,
                  },
            event:
              result.eventRun?.postStatus === 'CANCELED'
                ? { location: '등록된 행사가\n없습니다' }
                : {
                    location: result.eventRun?.title || '등록된 행사가\n없습니다',
                    date: formatDate(result.eventRun?.date),
                    rawDate: result.eventRun?.date,
                    postimgurl: result.eventRun?.postImageUrl,
                    poststatus: isWithinOneHour(result.eventRun?.date)
                      ? 'URGENT'
                      : result.eventRun?.postStatus,
                  },
          });
        } else {
          console.error('데이터를 불러오지 못했습니다.', response.data.responseMessage);
        }
      } catch (error) {
        console.error('API 요청 오류', error);
      }
    };

    fetchMain();
  }, []);

  // 플로팅 버튼 토글
  const toggleFloatingButton = () => {
    setIsFloatingButtonOpen(!isFloatingButtonOpen);
  };

  // 플로팅 버튼 애니메이션
  useEffect(() => {
    if (isFloatingButtonOpen) {
      setShowFirstButton(false);
      setShowSecondButton(false);
      setShowThirdButton(false);
      setShowFourthButton(false);

      setTimeout(() => setShowFourthButton(true), 100);
      setTimeout(() => setShowThirdButton(true), 200);
      setTimeout(() => setShowSecondButton(true), 300);
      setTimeout(() => setShowFirstButton(true), 400);
    } else {
      setShowFirstButton(false);
      setShowSecondButton(false);
      setShowThirdButton(false);
      setShowFourthButton(false);
    }
  }, [isFloatingButtonOpen]);

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  //그리드 레이아웃에 있는 동그라미 버튼(GridContent)를 눌렀을 시의 동작 수행
  const handleCardClick = () => {
    navigate('/run');
  };

  const handleflashRunMake = () => {
    navigate('/make/flash');
  };
  const handleRegularRunMake = () => {
    navigate('/make/regular');
  };
  const handleEventMake = () => {
    navigate('/make/event');
  };
  const handleTrainingtMake = () => {
    navigate('/make/training');
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {/* 상단바 */}
      <div className="h-[56px]"></div>

      {/* 슬라이드쇼 */}
      <div className="max-w-[430px] w-full h-[300px] mx-auto m-0 relative">
        <div className="flex justify-center items-center h-full relative">
          <div className="max-w-[430px] w-full h-[300px] mx-auto relative overflow-hidden">
            <picture className="block w-full h-full">
              <source srcSet={images[currentIndex]} type="image/webp" />
              <img
                src={images[currentIndex]}
                alt={`메인 배너 ${currentIndex + 1}`}
                className="w-full h-full object-cover block"
                fetchPriority={currentIndex === 0 ? 'high' : undefined}
                loading={currentIndex === 0 ? 'eager' : 'lazy'}
              />
            </picture>

            {/* 왼쪽 화살표 */}
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50
             text-white p-1.5 rounded-full shadow-md transition transform hover:scale-110"
            >
              <HiChevronLeft className="text-2xl" />
            </button>

            {/* 오른쪽 화살표 */}
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50
             text-white p-1.5 rounded-full shadow-md transition transform hover:scale-110"
            >
              <HiChevronRight className="text-2xl" />
            </button>
          </div>
        </div>

        {/* 하단 점(dot) 네비게이션 */}
        <div className="flex max-w-[430px] w-full h-[40px] justify-center items-center space-x-2 bg-kuDarkGreen">
          {images.map((_, index) => (
            <span
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-2 w-2 rounded-full transition-[opacity,transform] duration-300 ease-in-out cursor-pointer 
          ${currentIndex === index ? 'bg-white/80 scale-125' : 'bg-white/40 scale-100'}
        `}
              style={{ willChange: 'transform, opacity' }}
            />
          ))}
        </div>
      </div>

      {/* NewMainCard 그리드 */}
      <div className="grid grid-cols-2 grid-rows-2 gap-x-3 gap-y-[15px] mt-[70px] mb-36">
        <div className="cursor-pointer">
          <NewMainCard
            title={maindata?.regularRun.location}
            date={maindata?.regularRun.date}
            statusImg={getStatusImg(maindata.regularRun.poststatus, maindata.regularRun.rawDate)}
            imageUrl={maindata.regularRun.postimgurl || regularImg}
            event_type="정규런"
            path="/regular"
          />
        </div>
        <div className="cursor-pointer">
          <NewMainCard
            title={maindata?.flashRun.location}
            date={maindata?.flashRun.date}
            statusImg={getStatusImg(maindata.flashRun.poststatus, maindata.flashRun.rawDate)}
            imageUrl={maindata.flashRun.postimgurl || flashImage}
            event_type="번개런"
            path="/flash"
          />
        </div>
        <div className="cursor-pointer">
          <NewMainCard
            title={maindata?.training.location}
            date={maindata?.training.date}
            statusImg={getStatusImg(maindata.training.poststatus, maindata.training.rawDate)}
            imageUrl={maindata.training.postimgurl || trainImage}
            event_type="훈련"
            path="/training"
          />
        </div>
        <div className="cursor-pointer">
          <NewMainCard
            title={maindata?.event.location}
            date={maindata?.event.date}
            statusImg={getStatusImg(maindata.event.poststatus, maindata.event.rawDate)}
            imageUrl={maindata.event.postimgurl || eventImg}
            event_type="행사"
            path="/event"
          />
        </div>
      </div>

      {/* 플로팅 버튼 */}
      <button
        onClick={toggleFloatingButton}
        className={`fixed bottom-20 
    left-1/2 
    translate-x-[calc(215px-100%-20px)]
    zfold:translate-x-[calc(215px-100%-50px)]     
    iphonese:translate-x-[calc(215px-100%-35px)]  
    iphonepro:translate-x-[calc(215px-100%-30px)]
    iphonepromax:translate-x-[calc(215px-100%-12px)]
    lg:translate-x-[calc(215px-100%-10px)]      /* 큰 화면: 오른쪽 네비 옆 */
    w-16 h-16 rounded-full bg-kuDarkGreen text-white
    flex items-center justify-center shadow-lg hover:bg-kuDarkGreen-dark
    focus:outline-none z-50 transition-transform duration-300
    ${isFloatingButtonOpen ? 'rotate-45' : 'rotate-0'}`}
      >
        <img
          src={plusBtn}
          alt="플로팅 버튼 아이콘"
          className={`w-8 h-8 transition-transform duration-300 
      ${isFloatingButtonOpen ? 'rotate-20' : 'rotate-0'}`}
        />
      </button>

      {/* 플로팅 버튼 메뉴 */}
      {isFloatingButtonOpen && (
        <div
          onClick={() => setIsFloatingButtonOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-500 ease-in-out flex justify-end items-end z-40"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`fixed bottom-40 left-1/2 
        translate-x-[calc(215px-100%-35px)]
        zfold:translate-x-[calc(215px-100%-60px)]     
        iphonese:translate-x-[calc(215px-100%-45px)]  
        iphonepro:translate-x-[calc(215px-100%-35px)]
        iphonepromax:translate-x-[calc(215px-100%-22px)]
        lg:translate-x-[calc(215px-100%-20px)] // 데스크탑
        flex flex-col space-y-4 pointer-events-auto`}
          >
            {/* 번개런 일정 추가하기 */}
            <button
              className={`w-auto h-auto rounded-tl-xl rounded-tr-xl rounded-bl-xl font-semibold shadow-lg py-2 px-4 transition-all duration-300 ease-out transform 
          ${showFirstButton ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
          bg-white text-black hover:bg-gray-100`}
              onClick={handleflashRunMake}
            >
              번개런 일정 추가하기
            </button>

            {/* 정규런 일정 추가하기 */}
            <button
              className={`w-auto h-auto rounded-tl-xl rounded-tr-xl rounded-bl-xl font-semibold shadow-lg py-2 px-4 transition-all duration-300 ease-out transform 
          ${showSecondButton ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
          ${
            userRole === 'ADMIN' || userRole === 'PACER'
              ? 'bg-white text-black hover:bg-gray-100'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
              onClick={
                userRole === 'ADMIN' || userRole === 'PACER'
                  ? handleRegularRunMake
                  : () => alert('관리자만 사용할 수 있는 기능입니다.')
              }
            >
              정규런 일정 추가하기
            </button>

            {/* 훈련 일정 추가하기 */}
            <button
              className={`w-auto h-auto rounded-tl-xl rounded-tr-xl rounded-bl-xl font-semibold shadow-lg py-2 px-4 transition-all duration-300 ease-out transform 
          ${showThirdButton ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
          ${
            userRole === 'ADMIN' || userRole === 'PACER'
              ? 'bg-white text-black hover:bg-gray-100'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
              onClick={
                userRole === 'ADMIN' || userRole === 'PACER'
                  ? handleTrainingtMake
                  : () => alert('관리자만 사용할 수 있는 기능입니다.')
              }
            >
              훈련 일정 추가하기
            </button>

            {/* 행사 일정 추가하기 */}
            <button
              className={`w-auto h-auto rounded-tl-xl rounded-tr-xl rounded-bl-xl font-semibold shadow-lg py-2 px-4 transition-all duration-300 ease-out transform 
          ${showFourthButton ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
          ${
            userRole === 'ADMIN'
              ? 'bg-white text-black hover:bg-gray-100'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
              onClick={
                userRole === 'ADMIN'
                  ? handleEventMake
                  : () => alert('관리자만 사용할 수 있는 기능입니다.')
              }
            >
              행사 일정 추가하기
            </button>
          </div>
        </div>
      )}

      {/* TabNavigationUI */}
      <TabNavigationUI />
    </div>
  );
};

export default NewMain;

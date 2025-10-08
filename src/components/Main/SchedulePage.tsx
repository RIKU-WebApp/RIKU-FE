import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import plusBtn from '../../assets/plus_Icon.svg'; //라이쿠 로고 불러오기
import customAxios from '../../apis/customAxios'; //커스텀 axios 호출

import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  parseISO,
  addYears,
  subYears,
  addHours,
} from 'date-fns';

//한 달 달력에 들어갈 내용(날짜(Date))들의 배열을 만든다.
function makeCalendarDays(pointDate: Date) {
  const monthStart = startOfMonth(pointDate); //현재 달의 시작 날짜
  const monthEnd = endOfMonth(pointDate); //현재 달의 마지막 날짜
  const startDate = startOfWeek(monthStart); //현재 달의 시작 날짜가 포함된 주의 시작 날짜(그니까, 전 달의 날짜가 나올수도 있음!)
  const endDate = endOfWeek(monthEnd); //현재 달의 마지막 날짜가 포함된 주의 끝 날짜(그니까, 다음 달의 날짜가 나올수도 있음!)

  const calendarDays = [];
  let start = startDate;

  while (start <= endDate) {
    //start가 endDate보다 작거나 같은 동안엔 반복문을 지속한다
    calendarDays.push(start); //calendarDays 배열의 끝에 start 값 추가
    start = addDays(start, 1); //날짜를 하루 더해준다(이것을 통해 start를 업데이트 한다)
  }

  return calendarDays;
}

//"일별 캘린더 조회"시에 이벤트의 마커 컬러를 return하는 메소드
function setMarkerColor(postType: string) {
  if (postType === 'REGULAR') {
    //정규런이면..
    return 'bg-kuDarkGreen';
  } else if (postType === 'TRAINING') {
    //훈련이면..
    return 'bg-kuYellow';
  } else if (postType === 'EVENT') {
    //행사이면..
    return 'bg-kuBrown';
  } else if (postType === 'FLASH') {
    //번개런이면..
    return 'bg-kuGreen';
  }
}

//일정과 캘린더를 확인할 수 있는 SchedulePage
function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [pointDate, setPointDate] = useState(new Date());
  const [pointDateInModal, setPointDateInModal] = useState(new Date());
  const [selectedDateInModal, setSelectedDateInModal] = useState(new Date());
  const [monthlyPlan, setMonthlyPlan] = useState<{ date: string; eventCount: number }[]>([]);
  const [selectedDateEvent, setSelectedDateEvent] = useState<
    { postId: number; postType: string; title: string; date: string; location: string }[]
  >([]);
  const [userRole, setUserRole] = useState('');

  const navigate = useNavigate();

  //uesrRole 받아오기
  useEffect(() => {
    const fetchMain = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('accessToken') || 'null');
        const response = await customAxios.get(`/run`, {
          headers: { Authorization: `${token}` },
        });

        if (response.data.isSuccess) {
          const result = response.data.result;
          setUserRole(result.userRole || null);
          console.log('userRole성공');
        } else {
          console.error('데이터를 불러오지 못했습니다.', response.data.responseMessage);
        }
      } catch (error) {
        console.error('API 요청 오류', error);
      }
    };
    fetchMain();
  }, []);

  //캘린더 월별 조회 메소드
  async function fetchMonthlyData() {
    const formattedPointDate = format(pointDate, 'yyyy-MM-dd'); //pointDate(기준이 되는 날짜) 포맷팅
    const accessToken = JSON.parse(localStorage.getItem('accessToken') || ''); //localStorage에 저장된 accessToken 값이 없으면 ''으로 초기화

    //url에 날짜를 'yyyy-MM-dd' 형식으로 담아서 보내야 함
    const url = `/calendar/monthly?date=${formattedPointDate}`;

    try {
      const response = await customAxios.get(
        url, //요청 url
        {
          headers: {
            Authorization: accessToken, //accessToken을 헤더로 추가해서 요청 보냄
          },
        }
      );
      setMonthlyPlan(response.data.result.schedules); //불러온 data의 result 값으로 monthlyPlan 값 저장
    } catch (error) {
      alert('서버 요청 중 오류 발생!');
      console.error('요청 실패: ', error);
    }
  }

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

  //캘린더 일별 조회 메소드
  async function fetchSelectedDateEventData() {
    const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd'); // selectedDate(선택된 날짜) 포맷팅
    const accessToken = JSON.parse(localStorage.getItem('accessToken') || ''); //localStorage에 저장된 accessToken 값이 없으면 ''으로 초기화

    //url에 날짜를 'yyyy-MM-dd' 형식으로 담아서 보내야 함
    const url = `/calendar/daily?date=${formattedSelectedDate}`;

    try {
      const response = await customAxios.get(
        url, //요청 url
        {
          headers: {
            Authorization: accessToken, //accessToken을 헤더로 추가해서 요청 보냄
          },
        }
      );
      setSelectedDateEvent(response.data.result); //불러온 data의 result 값으로 selectedDateEvent 값 저장
    } catch (error) {
      alert('서버 요청 중 오류 발생!');
      console.error('요청 실패: ', error);
    }
  }

  //pointDate 값이 바뀔 때마다 월별 일정을 불러 와야 한다 (fetchMonthlyData 호출)
  useEffect(() => {
    fetchMonthlyData();
  }, [pointDate]);

  //selectedDate 값이 바뀔 때마다 일별 일정을 불러 와야 한다 (fetchSelectedDateEventData 호출)
  useEffect(() => {
    fetchSelectedDateEventData();
  }, [selectedDate]);

  const [isFloatingButtonOpen, setIsFloatingButtonOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); //날짜 선택하는 모달창 open 여부 관리

  //각 버튼의 개별 상태를 관리하여 순차적 pop-up 효과를 구현
  const [showFirstButton, setShowFirstButton] = useState(false);
  const [showSecondButton, setShowSecondButton] = useState(false);
  const [showThirdButton, setShowThirdButton] = useState(false);
  const [showFourthButton, setShowFourthButton] = useState(false);

  const calendarDaysList = makeCalendarDays(pointDate);
  const weeks: Date[][] = [];
  let week: Date[] = [];
  const dayOfTheWeek = ['일', '월', '화', '수', '목', '금', '토'];

  calendarDaysList.forEach((day) => {
    if (week.length < 7) {
      week.push(day);
    } else {
      weeks.push(week);
      week = [day];
    }
  });
  if (week.length > 0) weeks.push(week);

  const nextMonth = () => {
    setPointDate(addMonths(pointDate, 1));
  };

  const prevMonth = () => {
    setPointDate(subMonths(pointDate, 1));
  };

  //모달창에서 연도 더하기
  const nextYearInModal = () => {
    setPointDateInModal(addYears(pointDateInModal, 1));
  };

  //모달창에서 연도 빼기
  const prevYearInModal = () => {
    setPointDateInModal(subYears(pointDateInModal, 1));
  };

  //모달창에서 월을 선택했을 때 동작하는 액션 (아래와 같이 값을 바꾸는 것이 권장됨(-> state는 불변성을 보장해 줘야 하고, 그를 위해 바꾸는 것은 set 함수를 써서 바꾸는 것이 필요...))
  const selectMonthInModal = (month: number) => {
    const newDate = new Date(selectedDateInModal); //복사
    newDate.setMonth(month - 1); //0부터 시작하니까 -1
    if (pointDateInModal.getFullYear() !== selectedDateInModal.getFullYear()) {
      //모달 내에서 현재 선택된 날짜(selectedDateInModal)가 pointDateInModal과 다른 경우
      newDate.setFullYear(pointDateInModal.getFullYear()); //newDate의 연도 값도 바꿔줘야 한다
    }
    setPointDate(newDate); //안에서 선택한 연/월을 바깥의 pointDate로 설정한다
    setIsModalOpen(false); //누르자마자 모달창 닫도록 설정
    // setSelectedDateInModal(newDate); //모달창 내부에서 선택한 날짜에 대한 정보를 바꿔줘야 한다.
  };

  const handleDateClick = (date: Date) => {
    if (date.getMonth() !== pointDate.getMonth()) {
      //이전 혹은 다음 달의 날짜를 선택했을 경우
      setSelectedDate(date);
      setPointDate(date); //기준 날짜도 바꿔야 한다 (그래야, 달력도 그에 맞춰 바뀐다)
    } else {
      //아니라면
      setSelectedDate(date);
    }
  };

  const handleNavigateToNotice = (postId: number, postType: string) => {
    navigate(`/${postType}/${postId}`);
  };

  //플로팅 버튼을 눌렀을 때.. 동작하는 floatingButton
  const toggleFloatingButton = () => {
    setIsFloatingButtonOpen(!isFloatingButtonOpen);
  };

  //상단에 있는 화살표 사이에 있는 월 표시를 눌렀을 때.. 월 선택 모달창을 띄우는 메소드 toggleMonthSelectModal
  const toggleMonthSelectModal = () => {
    if (!isModalOpen) {
      //modal이 닫혀 있던 경우라면
      setPointDateInModal(pointDate); //이래야 모달창에 진입할 때마다 pointDate 기준으로 탐색 가능
      setSelectedDateInModal(pointDate); //이래야 모달창에 진입할 때마다 pointDate 기준으로 월이 선택되어 있는 UI 제공 가능
      setIsModalOpen(!isModalOpen); //모달 열기
    } else {
      setPointDate(selectedDateInModal); //안에서 선택한 연/월을 바깥의 pointDate로 설정한다
      setIsModalOpen(!isModalOpen); //모달 닫기
    }
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

  return (
    <div className="min-h-screen flex flex-col items-center bg-white pt-20 px-6 py-10 pb-16">
      {/* 캘린더 상단의 화살표로 월을 조절하는 부분 */}
      <div className="flex flex-col items-center justify-center space-y-0 mb-4">
        <span className="text-xs font-light text-black">{pointDate.getFullYear()}</span>
        <div className="flex items-center justify-center space-x-4 mb-4">
          <button
            onClick={prevMonth}
            aria-label="Previous month"
            className="rounded-full hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <span
            className="text-2xl font-semibold text-black rounded-sm pl-2 pr-2 hover:bg-gray-100 cursor-pointer"
            onClick={toggleMonthSelectModal}
          >
            {pointDate.getMonth() + 1}월
          </span>
          <button
            onClick={nextMonth}
            aria-label="Next month"
            className="rounded-full hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 실제적으로 달력이 보이는 부분 */}
      <div className="grid grid-cols-7 mb-4 text-center w-full max-w-sm">
        {dayOfTheWeek.map((dayName, index) => (
          <div key={index}>
            <div className="font-bold text-gray-600">{dayName}</div>
            <div className="w-full h-px bg-gray-200 mt-2" />
          </div>
        ))}
      </div>

      {/* 중첩 map 함수를 사용해서 달력을 출력할 것이다 */}
      {weeks.map((week, index) => (
        <div key={index} className="grid grid-cols-7 mb-2 text-center w-full max-w-sm">
          {week.map((day, subIndex) => {
            const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

            const planCounts =
              monthlyPlan?.find(
                (item: { date: string; eventCount: number }) =>
                  item.date === format(day, 'yyyy-MM-dd')
              )?.eventCount || 0;

            const isCurrentMonth = day.getMonth() === pointDate.getMonth();
            const style = isSelected
              ? 'bg-kuDarkGreen text-white'
              : isCurrentMonth
                ? 'text-black'
                : 'text-gray-400';

            return (
              <div key={subIndex} className="flex flex-col items-center">
                <button
                  onClick={() => handleDateClick(day)}
                  className={`p-2 w-10 ${style} rounded-2xl hover:bg-gray-200 flex flex-col items-center justify-center`}
                >
                  <span className="text-base font-normal">{day.getDate()}</span>
                  {/* marker를 날짜 아래에 배치하여 하나의 요소처럼 보이게 함 */}
                  {isCurrentMonth ? (
                    <div className={'flex flex-col items-center justify-center'}>
                      {planCounts > 0 ? (
                        <div className="flex items-center justify-center gap-0.5">
                          <span
                            className={`font-bold text-xs mt-2 ${
                              isSelected ? 'text-kuWhite' : 'text-kuDarkGray'
                            }`}
                          >
                            +{planCounts}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <div className={`w-1.5 h-1.5 mt-2 rounded-full bg-transparent`} />
                          <span className={'font-bold text-xs mt-2 text-transparent'}>0</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1">
                      <div className={`w-1.5 h-1.5 mt-2 rounded-full bg-transparent`} />
                      <span className={'font-bold text-xs mt-2 text-transparent'}>0</span>
                    </div>
                  )}
                </button>
                {/* 마지막 줄이 아닌 경우에만 선을 추가 */}
                {index < weeks.length - 1 && <div className="w-full h-px bg-gray-200 mt-2" />}
              </div>
            );
          })}
        </div>
      ))}

      {/* 하단의 일정 출력되는 곳 (Event 섹션 카드는.. 일정이 있는대로 map 함수로 렌더링할 것이다) */}
      <div className="w-full max-w-sm mt-6 flex flex-col items-start">
        <span className="text-xl font-bold mb-4">
          {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
        </span>
        {selectedDateEvent && selectedDateEvent.length !== 0 ? (
          selectedDateEvent.map((event, index) => (
            //일정을 표현하는 카드 섹션
            <div
              key={index}
              onClick={() => handleNavigateToNotice(event.postId, event.postType)}
              className="w-full max-w-sm bg-white border border-gray-300 rounded-lg p-2 shadow-sm mb-4 flex flex-row items-center"
            >
              <div className={`w-2 h-2 ml-2 ${setMarkerColor(event.postType)} rounded-full`} />
              <div className="pl-4 flex flex-col items-start">
                <p className="text-gray-800 font-medium">{event.title}</p>
                <p className="text-gray-500 text-sm">
                  {format(addHours(parseISO(event.date), 9), 'HH:mm')} {event.location}
                </p>
              </div>
            </div>
          ))
        ) : (
          //없다고 적어놔야 한다
          <span className="text-xl font-bold mb-4">일정이 없습니다.</span>
        )}
      </div>

      {/* 연/월을 선택하는 모달창이 열렸을 때 나타나는 옵션들 */}
      {isModalOpen && (
        <div
          onClick={toggleMonthSelectModal}
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-500 ease-in-out flex justify-center items-center p-8 z-50"
        >
          {/* 날짜를 선택하는 모달 본체 */}
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl p-8">
            {/* 연도 선택하는 선택창 */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <button
                onClick={prevYearInModal}
                aria-label="Previous month"
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <span className="text-2xl font-semibold text-black">
                {pointDateInModal.getFullYear()}
              </span>
              <button
                onClick={nextYearInModal}
                aria-label="Next month"
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
            {/* 월 선택 버튼들 나타나는 구역(grid) */}
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                //조건부 렌더링을 위한 변수 선언
                const isSelected =
                  month === selectedDateInModal.getMonth() + 1 &&
                  pointDateInModal.getFullYear() === selectedDateInModal.getFullYear();
                return (
                  <button
                    key={month}
                    onClick={() => selectMonthInModal(month)}
                    className={`py-2 px-6 rounded-md text-sm font-semibold transition
                      ${
                        isSelected
                          ? 'bg-kuDarkGreen text-white'
                          : 'bg-whiteSmoke hover:bg-kuDarkGreen hover:text-white text-kuDarkGray'
                      }
                    `}
                  >
                    {month}월
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}

export default SchedulePage;

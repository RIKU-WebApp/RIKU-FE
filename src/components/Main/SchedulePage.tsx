import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import plusBtn from '../../assets/plus_Icon.svg';
import customAxios from '../../apis/customAxios';
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
} from 'date-fns';

// 한 달 달력에 들어갈 내용(날짜(Date))들의 배열을 생성
function makeCalendarDays(pointDate: Date) {
  const monthStart = startOfMonth(pointDate);
  const monthEnd = endOfMonth(pointDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  let calendarDays = [];
  let start = startDate;

  while (start <= endDate) {
    calendarDays.push(start);
    start = addDays(start, 1);
  }

  return calendarDays;
}

// 에러 방어용 parseISO 래퍼 함수
const safeParseISO = (dateString: string | null | undefined): Date | null => {
  if (!dateString) {
    console.warn('safeParseISO: Received null or undefined dateString');
    return null;
  }
  try {
    return parseISO(dateString);
  } catch (error) {
    console.error('safeParseISO: Invalid date string:', dateString, error);
    return null;
  }
};

function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [pointDate, setPointDate] = useState(new Date());
  const [monthlyPlan, setMonthlyPlan] = useState<{ date: string; eventCount: number }[]>([]);
  const [selectedDateEvent, setSelectedDateEvent] = useState<{ title: string; time: string; location: string }[]>([]);
  

  const [markerColor] = useState(['bg-blue-500', 'bg-orange-600', 'bg-purple-400', 'bg-green-300', 'bg-gray-400']);
  const [isFloatingButtonOpen, setIsFloatingButtonOpen] = useState(false);

  const calendarDaysList = makeCalendarDays(pointDate);
  let weeks: Date[][] = [];
  let week: Date[] = [];
  let dayOfTheWeek = ['일', '월', '화', '수', '목', '금', '토'];

  calendarDaysList.forEach(day => {
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

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (date.getMonth() !== pointDate.getMonth()) {
      setPointDate(date);
    }
  };

  const toggleFloatingButton = () => {
    setIsFloatingButtonOpen(!isFloatingButtonOpen);
  };

  async function fetchMonthlyData() {
    const formattedPointDate = format(pointDate, 'yyyy-MM-dd');
    const accessToken = JSON.parse(localStorage.getItem('accessToken') || '""');

    const data = { date: formattedPointDate };
    const url = '/calendar/monthly';

    try {
      const response = await customAxios.post(url, data, {
        headers: { Authorization: accessToken },
      });
      setMonthlyPlan(response.data.result || []);
    } catch (error) {
      console.error('Failed to fetch monthly data:', error);
      alert('서버 요청 중 오류 발생!');
    }
  }

  async function fetchSelectedDateEventData() {
    const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');
    const accessToken = JSON.parse(localStorage.getItem('accessToken') || '""');

    const data = { date: formattedSelectedDate };
    const url = '/calendar/daily';

    try {
      const response = await customAxios.post(url, data, {
        headers: { Authorization: accessToken },
      });
      setSelectedDateEvent(
        response.data.result?.map((event: any) => ({
          ...event,
          time: event.time || null, // time이 없는 경우 null로 초기화
        })) || []
      );
    } catch (error) {
      console.error('Failed to fetch daily data:', error);
      alert('서버 요청 중 오류 발생!');
    }
  }

  useEffect(() => {
    fetchMonthlyData();
  }, [pointDate]);

  useEffect(() => {
    fetchSelectedDateEventData();
  }, [selectedDate]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-white px-6 py-10 pb-16">
      <div className="flex flex-col items-center justify-center space-y-0 mb-4">
        <span className="text-xs font-light text-black">{pointDate.getFullYear()}</span>
        <div className="flex items-center justify-center space-x-4 mb-4">
          <button onClick={prevMonth} aria-label="Previous month" className="p-2 rounded-full hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-2xl font-semibold text-black">{pointDate.getMonth() + 1}월</span>
          <button onClick={nextMonth} aria-label="Next month" className="p-2 rounded-full hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-4 text-center w-full max-w-sm">
        {dayOfTheWeek.map((dayName, index) => (
          <div key={index}>
            <div className="font-bold text-gray-600">{dayName}</div>
            <div className="w-full h-px bg-gray-200 mt-2" />
          </div>
        ))}
      </div>

      {weeks.map((week, index) => (
        <div key={index} className="grid grid-cols-7 mb-2 text-center w-full max-w-sm">
          {week.map((day, subIndex) => {
            let isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
            let planCounts = monthlyPlan.find(item => item.date === format(day, 'yyyy-MM-dd'))?.eventCount || 0;
            let isCurrentMonth = day.getMonth() === pointDate.getMonth();
            let style = isSelected ? 'bg-kuDarkGreen text-white' : isCurrentMonth ? 'text-black' : 'text-gray-400';

            return (
              <div key={subIndex} className="flex flex-col items-center">
                <button
                  onClick={() => handleDateClick(day)}
                  className={`p-2 w-10 ${style} rounded-full hover:bg-gray-200 flex flex-col items-center justify-center`}
                >
                  <span className="text-base font-normal">{day.getDate()}</span>
                  {isCurrentMonth && planCounts > 0 && (
                    <div className="mt-2 text-xs font-bold text-gray-500">{`+${planCounts}`}</div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      ))}

      <div className="w-full max-w-sm mt-6 flex flex-col items-start">
        <span className="text-xl font-bold mb-4">{`${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`}</span>
        {selectedDateEvent.length > 0 ? (
          selectedDateEvent.map((event, index) => {
            const eventTime = safeParseISO(event.time);
            return (
              <div key={index} className="w-full max-w-sm bg-white border rounded-lg p-2 shadow-sm mb-4 flex flex-row items-center">
                <div className={`w-2 h-2 ml-2 ${markerColor[index % markerColor.length]} rounded-full`} />
                <div className="pl-4 flex flex-col items-start">
                  <p className="text-gray-800 font-medium">{event.title}</p>
                  <p className="text-gray-500 text-sm">
                    {eventTime ? format(eventTime, 'HH:mm') : '시간 미정'} {event.location}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <span className="text-xl font-bold mb-4">일정이 없습니다.</span>
        )}
      </div>
    </div>
  );
}

export default SchedulePage;

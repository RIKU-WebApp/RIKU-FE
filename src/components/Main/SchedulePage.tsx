import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { 
    format, 
    addMonths, 
    subMonths, 
    startOfMonth, 
    endOfMonth, 
    startOfWeek, 
    endOfWeek, 
    addDays,
    getYear,
    getMonth
} from 'date-fns';

import axios from 'axios'; //axios(서버와의 통신을 위한 라이브러리) import!

//한 달 달력에 들어갈 내용(날짜(Date))들의 배열을 만든다.
function makeCalendarDays(pointDate: Date) {
  const monthStart = startOfMonth(pointDate); //현재 달의 시작 날짜
  const monthEnd = endOfMonth(pointDate); //현재 달의 마지막 날짜
  const startDate = startOfWeek(monthStart); //현재 달의 시작 날짜가 포함된 주의 시작 날짜(그니까, 전 달의 날짜가 나올수도 있음!)
  const endDate = endOfWeek(monthEnd); //현재 달의 마지막 날짜가 포함된 주의 끝 날짜(그니까, 다음 달의 날짜가 나올수도 있음!)

  let calendarDays = [];
  let start = startDate;

  while(start <= endDate) //start가 endDate보다 작거나 같은 동안엔 반복문을 지속한다
  {
      calendarDays.push(start); //calendarDays 배열의 끝에 start 값 추가
      start = addDays(start, 1); //날짜를 하루 더해준다(이것을 통해 start를 업데이트 한다)
  }

  return calendarDays;
}

//일정과 캘린더를 확인할 수 있는 SchedulePage
function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [pointDate, setPointDate] = useState(new Date());

  //서버로부터 일정 정보를 받아올 것임 (그리고 그것을 state로 관리할 것임 / 현재는 하드코딩 해놓음)
  let [event, setEvent] = useState([
    {"type": "[정규런]", "place": "뚝섬 유원지", "time": "19:00", "gathering_Place": "자양역 물품보관함"}, 
    {"type": "[행사]", "place": "라이쿠 여름방학 깜짝 회식", "time": "20:30", "gathering_Place": "홍콩 포차"}]
  );

  //marker 색깔을 state로 관리할 것이다
  let [markerColor, setMarkerColor] = useState(['bg-blue-500', 'bg-orange-600']);

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
    if(date.getMonth() !== pointDate.getMonth()){  //이전 혹은 다음 달의 날짜를 선택했을 경우
      setSelectedDate(date);
      setPointDate(date); //기준 날짜도 바꿔야 한다 (그래야, 달력도 그에 맞춰 바뀐다)
    } else { //아니라면
      setSelectedDate(date);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-white px-6 py-10">
      {/* 캘린더 상단의 화살표로 월을 조절하는 부분 */}
      <div className="flex flex-col items-center justify-center space-y-0 mb-4">
        <span className="text-base font-light text-black">{pointDate.getFullYear()}</span>
        <div className="flex items-center justify-center space-x-4 mb-4">
          <button onClick={prevMonth} aria-label="Previous month" className="p-2 rounded-full hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-lg font-semibold text-black">{pointDate.getMonth()+1}월</span>
          <button onClick={nextMonth} aria-label="Next month" className="p-2 rounded-full hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>           
      </div>          

      {/* 실제적으로 달력이 보이는 부분 */}
      <div className="grid grid-cols-7 gap-2 mb-4 text-center w-full max-w-sm">
        {dayOfTheWeek.map((dayName, index) => (
          <div key={index} className="font-bold text-gray-600">{dayName}</div>
        ))}
      </div>

      {/* 중첩 map 함수를 사용해서 달력을 출력할 것이다 */}
      {weeks.map((week, index) => (
        <div key={index} className="grid grid-cols-7 gap-2 mb-4 text-center w-full max-w-sm">
          {week.map((day, subIndex) => {
            let isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
            let isCurrentMonth = day.getMonth() === pointDate.getMonth();
            let style = isSelected
              ? 'bg-kuDarkGreen text-white'
              : isCurrentMonth
              ? 'text-black'
              : 'text-gray-400';

            return (
              <div key={subIndex} className="flex flex-col items-center">
                <button
                  onClick={() => handleDateClick(day)}
                  className={`p-2 w-10 ${style} rounded-full hover:bg-gray-200 flex flex-col items-center justify-center`}
                >
                  <span className="text-base font-normal">{day.getDate()}</span>
                  {/* marker를 날짜 아래에 배치하여 하나의 요소처럼 보이게 함 */}
                  {isCurrentMonth && (
                    <div className={`w-2 h-2 mt-4 rounded-full ${isSelected ? 'outline outline-1 outline-white bg-purple-500' : 'bg-purple-500'}`} />
                  )}
                </button>
            </div>
            );
          })}
        </div>
      ))}

      {/* 하단의 일정 출력되는 곳 */}
      <div className="w-full max-w-sm mt-6 flex flex-col items-start">
        <span className="text-xl font-bold mb-4">{selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일</span>
        {
          event.map((event, index) => (
            //일정을 표현하는 카드 섹션
            <div key={index} className="w-full max-w-sm bg-white border border-gray-300 rounded-lg p-2 shadow-sm mb-4 flex flex-row items-center">
              <div className={`w-2 h-2 ml-2 ${markerColor[index]} rounded-full`}/>
              <div className="pl-4 flex flex-col items-start">
                <p className="text-gray-800 font-medium">{event.type} {event.place}</p>
                <p className="text-gray-500 text-sm">{event.time} {event.gathering_Place}</p>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
  

export default SchedulePage;
import React, { useState, ChangeEventHandler } from "react";
import { setHours, setMinutes } from "date-fns"; // 날짜와 시간을 설정하는 유틸리티 함수
import { DayPicker } from "react-day-picker"; // 날짜 선택 컴포넌트
import "react-day-picker/dist/style.css"; // DayPicker 스타일

// 부모 컴포넌트에서 전달받는 props 타입 정의
interface DateNtimeProps {
  onDateTimeChange: (date: Date | null, time: string) => void; // 날짜 및 시간을 전달하는 함수
}

export function DateNtime({ onDateTimeChange }: DateNtimeProps) {
  const [selected, setSelected] = useState<Date | undefined>(undefined); // 선택된 날짜 상태
  const [timeValue, setTimeValue] = useState<string>("00:00"); // 선택된 시간 상태

  // 시간 변경 처리
  const handleTimeChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const time = e.target.value; // 입력된 시간 값
    setTimeValue(time); // 시간 상태 업데이트

    if (selected) {
      // 날짜가 선택된 경우, 선택된 날짜와 시간을 조합하여 새로운 날짜 생성
      const [hours, minutes] = time.split(":").map((str) => parseInt(str, 10));
      const newSelectedDate = setHours(setMinutes(selected, minutes), hours);
      setSelected(newSelectedDate); // 날짜 상태 업데이트
      onDateTimeChange(newSelectedDate, time); // 부모 컴포넌트로 날짜와 시간 전달
    } else {
      // 날짜가 선택되지 않은 경우
      onDateTimeChange(null, time); // 시간만 부모로 전달
    }
  };

  // 날짜 선택 처리
  const handleDaySelect = (date: Date | undefined) => {
    if (!date) {
      // 날짜가 선택되지 않은 경우
      setSelected(undefined);
      onDateTimeChange(null, timeValue); // 부모로 null 전달
      return;
    }

    // 선택된 날짜와 시간 조합
    const [hours, minutes] = timeValue.split(":").map((str) => parseInt(str, 10));
    const newDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hours,
      minutes
    );
    setSelected(newDate); // 날짜 상태 업데이트
    onDateTimeChange(newDate, timeValue); // 부모 컴포넌트로 전달
  };

  return (
    <div className="my-2 max-w-[375px] mx-auto bg-white p-4 rounded-lg shadow-lg">
      {/* 시간 입력 필드 */}
      <div className="mb-4">
        <input
          type="time"
          value={timeValue}
          onChange={handleTimeChange} // 시간 변경 시 처리
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#366943]"
        />
      </div>
      {/* 날짜 선택 필드 */}
      <DayPicker
        mode="single"
        selected={selected} // 선택된 날짜
        onSelect={handleDaySelect} // 날짜 선택 시 처리
        footer={
          <p className="mt-4 text-center text-[#366943] font-medium">
            {selected ? selected.toLocaleString() : "날짜를 선택해주세요"}
          </p>
        }
        styles={{
          day: { color: "#366943", fontWeight: "bold" },
          day_selected: { backgroundColor: "#366943", color: "white" },
        }}
      />
    </div>
  );
}

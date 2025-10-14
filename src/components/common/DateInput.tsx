import React, { useState } from 'react';
import CalIcon from '../../assets/cal_icon.svg';
import { DayPicker } from 'react-day-picker';
import { ko } from 'date-fns/locale';
import { AnimatePresence, motion } from 'framer-motion';
import 'react-day-picker/dist/style.css';

interface DateInputProps {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
}

export const DateInput: React.FC<DateInputProps> = ({ selectedDate, onChange }) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const today = new Date();

  return (
    <>
      <div className="my-2 text-base font-medium">날짜</div>
      <div className="flex items-center my-2">
        <img src={CalIcon} className="ml-[10px] w-[21.6px] h-[24px]" />
        <input
          type="text"
          readOnly
          value={formatDate(selectedDate)}
          onClick={() => setIsCalendarOpen(true)}
          placeholder="날짜를 선택하세요"
          className="ml-[24.4px] border-b border-gray-300 rounded px-4 py-2 text-base w-full cursor-pointer"
        />
      </div>

      <AnimatePresence>
        {isCalendarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="w-full max-w-md bg-white rounded-t-2xl px-4 pt-6 pb-8"
            >
              <div className="w-full flex justify-center">
                <div className="w-[320px]">
                  <DayPicker
                    mode="single"
                    selected={selectedDate || undefined}
                    onSelect={(date) => onChange(date ?? null)}
                    locale={ko}
                    disabled={{ before: today }} // 오늘만 선택 가능
                    classNames={{
                      caption: 'mb-4 text-black',
                      table: 'w-full border-collapse',
                      head_row: 'grid grid-cols-7 text-center text-gray-500 text-sm',
                      head_cell: 'py-2',
                      row: 'grid grid-cols-7',
                      cell: 'w-[40px] h-[40px] text-base text-center text-gray-800 hover:bg-gray-100 rounded-full flex items-center justify-center cursor-pointer',
                      selected: 'bg-kuDarkGreen text-white font-semibold rounded-full',
                      today: 'text-kuDarkGreen font-bold',
                      outside: 'text-gray-300',
                      chevron: 'fill-black',
                      disabled: 'text-gray-300 cursor-not-allowed', // 비활성화된 날짜 스타일
                    }}
                  />
                </div>
              </div>

              <button
                onClick={() => setIsCalendarOpen(false)}
                className="mt-6 w-full bg-kuDarkGreen text-white text-[17px] font-semibold py-3 rounded-lg"
                disabled={!selectedDate}
              >
                적용하기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

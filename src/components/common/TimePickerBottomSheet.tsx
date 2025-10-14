import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import TimeWheelPicker from './TimeWheelPicker';
import TimeIcon from '../../assets/time_icon.svg';

interface TimePickerBottomSheetProps {
  time: string;
  onChange: (time: string) => void;
}

export const TimePickerBottomSheet: React.FC<TimePickerBottomSheetProps> = ({ time, onChange }) => {
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

  const [hour, setHour] = useState('00');
  const [minute, setMinute] = useState('00');
  const [isOpen, setIsOpen] = useState(false);

  // 🧠 바텀시트 열릴 때마다 time 값을 기준으로 상태 세팅
  useEffect(() => {
    if (isOpen && time) {
      const [h, m] = time.split(':');
      setHour(h.padStart(2, '0'));
      setMinute(m.padStart(2, '0'));
    }
  }, [isOpen, time]);

  const handleApply = () => {
    const selectedTime = `${hour}:${minute}`;
    onChange(selectedTime);
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <div className="my-2">시간</div>
      <div className="flex items-center my-2">
        <img src={TimeIcon} alt="시간 아이콘" className="ml-[7.9px] w-[23.64px] h-[24px]" />
        <div
          onClick={() => setIsOpen(true)}
          className="ml-[24.4px] border-b border-gray-300 rounded px-4 py-1 text-[16px] w-full text-gray-600 cursor-pointer"
        >
          {time || '시간을 선택하세요'}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40 flex items-end z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="w-full max-w-[430px] bg-white rounded-t-2xl px-4 pt-10 pb-4 mx-auto"
            >
              {/* <div className="text-lg font-semibold text-center mb-4">시간 선택</div> */}

              <div className="flex justify-center gap-4">
                <TimeWheelPicker
                  items={hours}
                  selected={hours.indexOf(hour)}
                  onSelect={(index) => setHour(hours[index])}
                />
                <div className="text-3xl font-bold flex items-center">:</div>
                <TimeWheelPicker
                  items={minutes}
                  selected={minutes.indexOf(minute)}
                  onSelect={(index) => setMinute(minutes[index])}
                />
              </div>

              <div className="mt-9 flex flex-col gap-2">
                <button
                  onClick={handleApply}
                  className="w-full bg-kuDarkGreen text-white py-3 rounded-lg text-lg"
                >
                  적용하기
                </button>
                {/* <button
                  onClick={() => setIsOpen(false)}
                  className="w-full text-gray-500 text-sm"
                >
                  닫기
                </button> */}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

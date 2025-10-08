import React from 'react';
import NOWimg from '../../assets/Main-img/NewOpenStatus.svg';
import PROGRESSimg from '../../assets/progress.svg';
import CLODESDimg from '../../assets/Main-img/NewClosedStatus.svg';
import CANCELEDimg from '../../assets/Main-img/NewCanceledStatus.svg';
import peopleimg from '../../assets/people_darkgreen.svg';
import defaultimg from '../../assets/CardDefaultImg.svg';
import ARGENTimg from '../../assets/Main-img/NewUrgentStatus.svg';

interface EventCardProps {
  location: string;
  postimg?: string;
  runDate: string; // 전체 ISO 날짜 문자열 (예: 2025-03-27T15:00:00)
  runState: 'NOW' | 'CANCELED' | 'CLOSED';
  date: string; // 가공된 날짜 문자열 (예: 2025.03.27)
  time: string; // 가공된 시간 문자열 (예: 15:00)
  participants: string;
  onClick: () => void;
}

const NewEventCard: React.FC<EventCardProps> = ({
  location,
  postimg,
  runDate,
  runState,
  date,
  time,
  participants,
  onClick,
}) => {
  const getStatusImage = () => {
    const now = new Date();

    // time props를 "HH:mm" → Date 객체로 변환 (오늘 날짜 기준)
    const [hourStr, minuteStr] = time.split(':');
    const runTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      parseInt(hourStr, 10),
      parseInt(minuteStr, 10)
    );

    const diff = runTime.getTime() - now.getTime();
    const oneHourInMs = 60 * 60 * 1000;

    //  현재 시간이 runDate를 넘겼으면 진행중 이미지 반환
    const runDateTime = new Date(runDate);
    if (runState === 'NOW' && runDateTime <= now) {
      return PROGRESSimg;
    }

    //  1시간 이내면 마감임박
    if (runState === 'NOW' && diff <= oneHourInMs && diff > 0) {
      return ARGENTimg;
    }

    switch (runState) {
      case 'NOW':
        return NOWimg;
      case 'CANCELED':
        return CANCELEDimg;
      case 'CLOSED':
        return CLODESDimg;
      default:
        return NOWimg;
    }
  };

  return (
    <div
      className="flex flex-col relative w-[335px] h-[322px] bg-kuLightGray rounded-lg"
      onClick={onClick}
    >
      {/* 상태 뱃지 */}
      <img src={getStatusImage()} className="w-[50px] h-[20px] absolute top-[16px] left-[14px]" />
      {/* 날짜 및 시간 */}
      <div className="absolute top-[44px] left-[16px] text-[14px] text-black/60">
        {`${date} | ${time}`}
      </div>

      {/* 참가자 수 */}
      <div className="absolute top-[16px] left-[280px] flex items-center space-x-1">
        <img src={peopleimg} className="w-[20px] h-[20px]" alt="참가자" />
        <div className="text-[12px] font-bold text-black/60">{participants}</div>
      </div>

      {/* 러닝 장소 또는 제목 */}
      <div className="absolute top-[64px] left-[16px] text-[20px] font-semibold max-w-[300px] truncate overflow-hidden whitespace-nowrap">
        {location}
      </div>

      {/* 러닝 이미지 */}
      <div className="absolute top-[106px] left-[16px] overflow-hidden w-[303px] h-[200px] justify-center">
        <img
          className="w-full h-full rounded-[8px] object-cover"
          src={postimg ? postimg : defaultimg}
        />
      </div>
    </div>
  );
};

export default NewEventCard;

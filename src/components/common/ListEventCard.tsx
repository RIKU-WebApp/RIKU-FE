import React from 'react';
import RunCardImage from './RunCardImage';
import NOWimg from '../../assets/Main-img/NewOpenStatus.svg';
import CLODESDimg from '../../assets/Main-img/NewClosedStatus.svg';
import CANCELEDimg from '../../assets/Main-img/NewCanceledStatus.svg';
import peopleimg from '../../assets/people_darkgreen.svg';
import defaultimg from '../../assets/CardDefaultImg.svg';

interface EventCardProps {
  compact?: boolean;
  showFullImage?: boolean;
  location: string;
  postimg?: string;
  runState: 'NOW' | 'CANCELED' | 'CLOSED';
  date: string; // 가공된 날짜 문자열 (예: 2025.03.27)
  time: string; // 가공된 시간 문자열 (예: 15:00)
  participants: number;
  onClick?: () => void;
}

const ListEventCard: React.FC<EventCardProps> = ({
  compact = false,
  showFullImage,
  location,
  postimg,
  runState,
  date,
  time,
  participants,
  onClick,
}) => {
  // 상태에 따라 뱃지 이미지 선택
  const getStatusImage = () => {
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
      className={`flex flex-col relative w-[335px] max-w-full bg-kuLightGray rounded-lg ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      {/* 상태 뱃지 */}
      <img src={getStatusImage()} className="w-[50px] h-[20px] absolute top-[16px] left-[14px]" />

      {/* 날짜 및 시간 */}
      <div className="absolute top-[44px] left-[16px] text-[14px] text-black/60">
        {`${date} | ${time}`}
      </div>

      {/* 참가자 수 */}
      <div className="absolute top-[20px] right-4 flex items-center space-x-1">
        <img src={peopleimg} className="w-[20px] h-[20px]" alt="참가자" />
        <div className="text-[12px] font-bold text-black/60">{participants}</div>
      </div>

      {/* 러닝 장소 또는 제목 */}
      <div className="absolute top-[64px] left-[16px] text-[20px] font-semibold right-4 truncate overflow-hidden whitespace-nowrap">
        {location}
      </div>

      {/* 러닝 이미지 */}
      <div className="mt-[106px] mx-4 mb-4">
        <div className={`w-full ${compact ? "h-[140px]" : "h-[200px]"} overflow-hidden rounded-[8px]`}>
          <RunCardImage src={postimg || defaultimg} showFullImage={showFullImage} />
        </div>
      </div>
    </div>
  );
};

export default ListEventCard;

import React from 'react';

interface Pacer {
  group: string;
  pacerName: string;
  distance: string;
  pace: string;
  profileImg?: string | null;
}

interface PacerCardProps {
  pacers: Pacer[];
}

const PacerCard: React.FC<PacerCardProps> = ({ pacers }) => {
  return (
    <div className="w-[335px] rounded-xl space-y-1">
      {/* 헤더 */}
      <div className="flex">
        {/* 그룹 셀 (헤더용 더미 블럭) */}
        <div className="w-[52px] h-[52px] bg-[#F5F5F5] rounded-[10px]" />

        {/* 헤더 셀들 */}
        <div className="flex flex-1 text-white text-sm font-semibold text-center ml-[4px]">
          <div className="relative w-[123px]  bg-kuDarkGreen font-bold h-[52px] text-[16px] flex items-center justify-center rounded-tl-[10px] rounded-bl-[10px]">
            페이서
            <div className="absolute top-[20%] right-0 w-[1px] h-[60%] bg-white opacity-60 font-bold" />
          </div>
          <div className="relative w-[79px] bg-kuDarkGreen h-[52px] flex text-[16px] items-center justify-center font-bold">
            거리
            <div className="absolute top-[20%] right-0 w-[1px] h-[60%] bg-white opacity-60  font-bold" />
          </div>
          <div className="w-[77px] bg-kuDarkGreen h-[52px] flex items-center text-[16px] justify-center rounded-tr-[10px] rounded-br-[10px] font-bold">
            페이스
          </div>
        </div>
      </div>

      {/* 페이서 목록 */}
      {pacers.map((pacer, idx) => {
        const opacity =
          idx === 0
            ? 'bg-opacity-100'
            : idx === 1
              ? 'bg-opacity-75'
              : idx === 2
                ? 'bg-opacity-50'
                : 'bg-opacity-30';

        return (
          <div key={idx} className="flex gap-x-[4px] items-center">
            {/* 그룹 셀 - 왼쪽에 단독 박스로 분리 */}
            <div
              className={`w-[52px] h-[52px] flex items-center justify-center text-white font-bold bg-kuDarkGreen ${opacity} rounded-[10px]`}
            >
              {pacer.group}
            </div>

            {/* 나머지 셀 - 오른쪽에 단독 박스 */}
            <div className="flex flex-1 items-center rounded-[10px] bg-[#F5F5F5]">
              {/* 페이서 */}
              <div className="relative w-[123px] flex items-center justify-center gap-1 h-[52px]">
                {pacer.profileImg ? (
                  <img src={pacer.profileImg} className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#844E4E] text-white text-xs flex items-center justify-center">
                    {pacer.pacerName.charAt(0)}
                  </div>
                )}
                <span className="text-gray-800 font-medium">{pacer.pacerName}</span>
                <div className="absolute top-[20%] right-0 h-[60%] w-[1px] bg-gray-300 opacity-80 translate-x-1/2" />
              </div>

              {/* 거리 */}
              <div className="relative w-[79px] font-bold text-kuDarkGreen h-[52px] flex items-center justify-center">
                {pacer.distance}
                <div className="absolute top-[20%] right-0 h-[60%] w-[1px] bg-gray-300 opacity-80 translate-x-1/2" />
              </div>

              {/* 페이스 */}
              <div className="w-[77px] font-bold text-kuDarkGreen h-[52px] flex items-center justify-center">
                {pacer.pace}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PacerCard;

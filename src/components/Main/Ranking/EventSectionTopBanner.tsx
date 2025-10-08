import React from 'react';

import eventTypo from '../../../assets/RankingPage/eventTypo.png';
import arrow from '../../../assets/RankingPage/arrow.png';

// 이벤트 랭킹 페이지 맨 상단에 위치한 EventSectionTopBanner
const EventSectionTopBanner = ({ onShowDetailModal }: { onShowDetailModal: () => void }) => {
  return (
    <div className="w-full h-auto flex flex-col items-center bg-gradient-to-br from-white to-lime-300 pt-[72px]">
      <img
        src={eventTypo}
        alt="RIKU 웹앱을 사용해 주셔서 감사합니다"
        className="w-[300px] h-auto object-cover"
      />

      {/* 안내문 + 버튼이 들어가는 div */}
      <div className="w-[300px] flex flex-col items-center text-center">
        <span className="font-['danjoBoldRegular']">6.2-6.15</span>
        <span className="font-normal pt-[20px]">
          이벤트 기간 중 번개런에 참여하면 <br />
          상품을 드립니다!
        </span>

        {/* "자세히 보기" 버튼 */}
        <div
          onClick={onShowDetailModal}
          className="bg-kuLightBlack flex flex-row justify-between gap-2 items-center py-2 px-4 mt-8 my-20"
        >
          <span className="font-normal text-kuWhite">자세히 보기</span>
          <img src={arrow} alt="화살표" className="w-[16px] h-auto object-cover" />
        </div>
      </div>
    </div>
  );
};

export default EventSectionTopBanner;

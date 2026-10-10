// "이벤트" 기간에 토글이 가능한 이벤트 순위 페이지

import React, { useEffect, useState } from 'react';
import { SimpleUserInfo } from '../../../types/RankingPageTypes';
import customAxios from '@/shared/lib/customAxios';
import defaultProfileImg from '@assets/default_profile.png';
import eventStar from '@assets/RankingPage/eventStar.png';
import EventSectionTopBanner from './EventSectionTopBanner';

import star1 from '@assets/RankingPage/star1.png';
import star2 from '@assets/RankingPage/star2.png';

export default function EventSection({ onShowDetailModal }: { onShowDetailModal: () => void }) {
  const [eventTop20, setEventTop20] = useState<SimpleUserInfo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false); // 로딩이 다 되었는지에 대한 boolean 값

  // 자신의 정보 myInfo (안 불러와졌을 경우 표시할 placeholder 격의 데이터 하나 넣어놓을 것임)
  const [eventMyInfo, setEventMyInfo] = useState<SimpleUserInfo>({
    userName: '라이꾸',
    userProfileImg: 'https://via.placeholder.com/48',
    totalPoints: 111,
    userId: 1,
  });

  // 자신의 랭킹 정보 myRankingInfo
  const [myRankingInfo, setMyRankingInfo] = useState<number>(12);

  // 현재 하단 순위표에 보여줄 인원수(top10 혹은 top20), 이걸로 렌더링할 회원 갯수 조절할 것임
  const [viewCount, setViewCount] = useState(10);

  // 하단 순위표를 toggle할 메소드 toggleViewCount ('전체보기' 혹은 '간략히 보기' 버튼에 장착할 메소드)
  const toggleViewCount = () => {
    setViewCount(viewCount === 10 ? eventTop20.length : 10);
  };

  // 이벤트에 관한 랭킹 정보를 가지고 오는 메소드 fetchEventRanking
  const fetchEventRanking = async () => {
    const accessToken = localStorage.getItem('accessToken') || ''; //localStorage에 저장된 accessToken 값이 없으면 ''으로 초기화
    const url = '/ranking/event';

    try {
      const response = await customAxios.post(
        url, // 요청 url
        {
          startDate: '2025-06-02',
          endDate: '2025-06-30',
          pointTypes: ['ADD_FLASH_CREATE', 'ADD_FLASH_JOIN'],
        },
        {
          headers: {
            Authorization: accessToken,
            'Content-Type': 'application/json', // 일반적으로 명시해줌
          },
        }
      );

      //공동 순위 처리에 용이하도록 userId는 서버에서 받아온 정보가 아닌 순위대로 ++하는 idx로 선언(추후 공동 순위 처리 로직이 추가로 삽입됨)
      let idx: number = 1;

      //상위 10명의 정보를 넣어둘 배열 top20 (response.data.result의 "top20"에서 정보를 가져온다)
      const top20: SimpleUserInfo[] = response.data.result.top20?.map((user: SimpleUserInfo) => ({
        userId: idx++,
        userName: user.userName,
        userProfileImg: user.userProfileImg || null,
        totalPoints: user.totalPoints,
      }));

      //공동 순위 처리해야 함
      for (let i: number = 0; i < top20.length; i++) {
        //이전 totalPoints랑 지금 totalPoints가 같다면
        if (i > 0 && top20[i - 1].totalPoints === top20[i].totalPoints) {
          top20[i].userId = top20[i - 1].userId;
        }
      }

      const my: SimpleUserInfo = response.data.result.userPoints; //사용자 정보를 불러와서 저장
      const myRank: number = response.data.result.userRanking; //사용자 랭킹 정보를 불러와서 저장

      //불러온 정보를 바탕으로 set
      setEventTop20(top20);
      setEventMyInfo(my);
      setMyRankingInfo(myRank);
    } catch (err) {
      console.error('이벤트 랭킹 정보 불러오기 실패: ', err);
    } finally {
      setIsLoaded(true); // 로딩이 다 되었다고 표시(state 변경)
    }
  };

  useEffect(() => {
    fetchEventRanking(); // 해당 컴포넌트가 실제로 렌더링 되는 시점에만 호출
  }, []);

  return (
    <>
      <EventSectionTopBanner onShowDetailModal={onShowDetailModal} />
      {/* 상단의 Top3 프로필 카드 */}
      <div className="w-full max-w-sm rounded-xl flex flex-col justify-center items-center pt-12 px-4">
        <div className="w-fit text-center font-bold text-kuWhite bg-kuLightBlack py-1 px-6 stroke-kuWhite border-[2px] shadow-kuWhite">
          Top 3
        </div>
        {/* Top3 섹션(top20_Info 배열의 길이가 3 미만일 경우, "집계 준비중"이라고 띄울 것임) */}
        {eventTop20.length > 3 ? (
          <div className="flex flex-row justify-between items-end my-4 gap-3">
            {/* 2nd 섹션 */}
            <div className="flex flex-1 flex-col items-center animate-fade-up animation-delay-600 opacity-0">
              <span className="block text-center text-2xl font-bold mb-1 text-whiteSmoke">2nd</span>
              {/* 프로필 이미지 (userProfileImg 값이 null일 경우 기본 프사 url을, 아닐 경우 불러온 url을 src로 삼는다) */}
              <div className="w-full aspect-square bg-gray-300 rounded-full flex items-center justify-center border-kuBeige overflow-hidden z-10">
                <img
                  src={eventTop20[1].userProfileImg ?? defaultProfileImg}
                  alt="1st"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 이름 및 포인트 정보 (겹쳐진 부분) */}
              <div className="w-full bg-kuBeige rounded-xl -mt-4 py-4">
                <span className="block text-center text-lg font-bold text-black pt-2 max-w-[100px] truncate m-auto">
                  {eventTop20[1].userName}
                </span>
                <span className="block text-center text-sm text-kuDarkGreen font-semibold max-w-[100px] truncate m-auto">
                  {eventTop20[1].totalPoints}P
                </span>
              </div>
            </div>

            {/* 1st 섹션 */}
            <div className="flex flex-1 flex-col items-center animate-fade-up animation-delay-1000 opacity-0">
              {/* 1st 섹션에는 라이쿠 뿔이 양옆으로 들어가야 한다, 따라서 따로 div를 판다 */}
              <div className="flex flex-row items-end justify-between space-x-1 mb-1">
                <img src={eventStar} alt="eventStar" className="w-[28px] h-[28px] object-cover" />
                <span className="inline-block text-center text-2xl font-bold text-yellow-200">
                  1st
                </span>
                <img src={eventStar} alt="eventStar" className="w-[28px] h-[28px] object-cover" />
              </div>
              <div className="flex flex-col items-center -space-y-4">
                {/* 프로필 이미지 */}
                <div className="w-full aspect-square bg-gray-300 rounded-full flex items-center justify-center border-kuBeige overflow-hidden z-10">
                  <img
                    src={eventTop20[0].userProfileImg ?? defaultProfileImg}
                    alt="1st"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* 이름 및 포인트 정보 (겹쳐진 부분) */}
                <div className="w-full bg-kuBeige rounded-xl pt-4 pb-14">
                  <span className="block text-center text-lg font-bold text-black pt-2 max-w-[100px] truncate m-auto">
                    {eventTop20[0].userName}
                  </span>
                  <span className="block text-center text-sm text-kuDarkGreen font-semibold max-w-[100px] truncate m-auto">
                    {eventTop20[0].totalPoints}P
                  </span>
                </div>
              </div>
            </div>

            {/* 3rd 섹션 */}
            <div className="flex flex-1 flex-col items-center animate-fade-up animation-delay-300 opacity-0">
              <span className="block text-center text-2xl font-bold text-whiteSmoke mb-1">3rd</span>
              {/* 프로필 이미지 */}
              <div className="w-full aspect-square bg-gray-300 rounded-full flex items-center justify-center border-kuBeige overflow-hidden z-10">
                <img
                  src={eventTop20[2].userProfileImg ?? defaultProfileImg}
                  alt="1st"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 이름 및 포인트 정보 (겹쳐진 부분) */}
              <div className="w-full bg-kuBeige rounded-xl -mt-4 py-4">
                <span className="block text-center text-lg font-bold text-black pt-2 max-w-[100px] truncate m-auto">
                  {eventTop20[2].userName}
                </span>
                <span className="block text-center text-sm text-kuDarkGreen font-semibold max-w-[100px] truncate m-auto">
                  {eventTop20[2].totalPoints}P
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* 로딩이 완료되었을 때만 아래의 UI를 띄운다 */}
      {isLoaded ? (
        <div className="animate-fade-in w-full flex flex-col items-center px-4">
          {/* "이번달 내 순위" 내용을 표현하는 부분 */}
          <div className="w-full max-w-sm text-left m-4">
            <span className="text-xl font-bold pr-4 text-whiteSmoke">이벤트 기간 내 순위</span>
            <span className="text-xl font-bold pr-4 text-whiteSmoke">|</span>
            <span className="text-xl font-bold text-kuLightGreen">{myRankingInfo}</span>
          </div>

          {/* 자신의 랭킹을 표시하는 카드 섹션 */}
          <div className="w-full max-w-sm bg-kuLightGray rounded-xl flex flex-row justify-between items-center px-3 py-2 mb-6">
            <div className="flex flex-row flex-start items-center">
              <span className="text-kuDarkGray text-base font-bold mr-4">{myRankingInfo}</span>
              <img
                src={eventMyInfo.userProfileImg ?? defaultProfileImg}
                alt="myProfileImg"
                className="w-16 h-16 rounded-full mr-4 object-cover"
              />
              <span className="text-black text-xl font-bold">{eventMyInfo.userName}</span>
            </div>
            <span className="text-kuDarkGreen text-xl font-bold mr-3">
              {eventMyInfo.totalPoints}P
            </span>
          </div>

          {/* 그 밑의 4위부터 회원들 랭킹 프로필 카드 (받아온 랭킹 정보를 바탕으로 map 함수로 return할 것임) */}
          {eventTop20.slice(3, viewCount).map((user, index) => (
            <div
              key={index}
              className="w-full max-w-sm bg-kuWarmGray rounded-xl flex flex-row justify-between items-center px-3 py-2 mb-2"
            >
              {/* 왼쪽 영역: 순위, 프로필 이미지, 이름 */}
              <div className="flex flex-row items-center">
                <span className="text-kuDarkGray text-sm font-bold mr-4">{user.userId}</span>
                <img
                  src={user.userProfileImg ?? defaultProfileImg}
                  alt={`${user.userName} Profile`}
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <span className="text-black text-base">{user.userName}</span>
              </div>
              {/* 오른쪽 영역: 포인트 */}
              <span className="text-kuDarkGreen text-base font-semibold mr-3">
                {user.totalPoints}P
              </span>
            </div>
          ))}

          {/* 하단의 '전체보기' 버튼 */}
          <div
            className="w-full max-w-sm bg-kuBeige rounded-xl text-center py-2 mt-4 mb-12"
            onClick={toggleViewCount}
          >
            <span className="text-black text-base font-normal">
              {viewCount === 10 ? '전체보기' : '간략히 보기'}
            </span>
          </div>
        </div>
      ) : null}
      {/* ⭐ 절대 위치 이미지 1 */}
      <img
        src={star1}
        alt="Star 1"
        className="absolute top-[480px] -right-14 w-[178px] h-auto z-10 pointer-events-none opacity-80 animate-fade-up"
      />

      {/* ⭐ 절대 위치 이미지 2 */}
      <img
        src={star2}
        alt="Star 2"
        className="absolute top-[620px] left-4 w-[78px] h-auto z-10 pointer-events-none opacity-80 animate-fade-up"
      />
    </>
  );
}

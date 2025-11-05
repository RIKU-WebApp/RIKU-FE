import React, { useEffect, useState } from 'react';
import defaultProfileImg from '@assets/default_profile.png';
import rikuHorn_left from '@assets/RankingPage/rikuHorn_left.svg';
import rikuHorn_right from '@assets/RankingPage/rikuHorn_right.svg';
import { SimpleUserInfo } from '../../../types/RankingPageTypes';
import customAxios from '@/shared/lib/customAxios';

// 토글에서 "순위" 탭이 선택된 경우, 보여줄 RankingSection
export default function RankingSection() {
  const [top20, setTop20] = useState<SimpleUserInfo[]>([]);
  const [myInfo, setMyInfo] = useState<SimpleUserInfo>({
    userName: '라이쿠',
    userProfileImg: 'https://via.placeholder.com/48',
    totalPoints: 111,
    userId: 1,
  });
  const [myRanking, setMyRanking] = useState<number>(0);
  const [viewCount, setViewCount] = useState(10);
  const [isLoaded, setIsLoaded] = useState(false);

  // 10명만 보여줄지, 20명 보여줄지 toggle하는 메소드
  const toggleViewCount = () => {
    setViewCount(viewCount === 10 ? top20.length : 10);
  };

  // top20 랭킹 정보를 가져오는 fetchRanking
  const fetchRanking = async () => {
    const accessToken = JSON.parse(localStorage.getItem('accessToken') || '');

    try {
      const response = await customAxios.get('/ranking', {
        headers: { Authorization: accessToken },
      });

      let idx = 1;
      const rawTop20 = response.data.result.top20;
      const formattedTop20 = rawTop20.map((user: SimpleUserInfo) => ({
        userId: idx++,
        userName: user.userName,
        userProfileImg: user.userProfileImg || null,
        totalPoints: user.totalPoints,
      }));

      for (let i = 1; i < formattedTop20.length; i++) {
        if (formattedTop20[i].totalPoints === formattedTop20[i - 1].totalPoints) {
          formattedTop20[i].userId = formattedTop20[i - 1].userId;
        }
      }

      setTop20(formattedTop20);
      setMyInfo(response.data.result.userPoints);
      setMyRanking(response.data.result.userRanking);
    } catch (error) {
      console.error('랭킹 정보 요청 실패:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchRanking();
  }, []);

  return (
    <div className="py-[84px] px-4">
      {/* 상단의 Top3 프로필 카드 */}
      <div className="w-full max-w-sm bg-kuDarkGreen rounded-xl flex flex-col justify-center items-center">
        <span className="w-fit text-center font-semibold text-kuDarkGreen bg-white py-1 px-8 rounded-xl">
          Top 3
        </span>
        {/* Top3 섹션(top20_Info 배열의 길이가 3 미만일 경우, "집계 준비중"이라고 띄울 것임) */}
        {top20.length > 3 ? (
          <div className="flex flex-row justify-between items-end my-4 gap-3">
            {/* 2nd 섹션 */}
            <div className="flex flex-1 flex-col items-center animate-fade-up animation-delay-600 opacity-0">
              <span className="block text-center text-2xl font-bold mb-1 text-whiteSmoke">2nd</span>
              {/* 프로필 이미지 (userProfileImg 값이 null일 경우 기본 프사 url을, 아닐 경우 불러온 url을 src로 삼는다) */}
              <div className="w-full aspect-square bg-gray-300 rounded-full flex items-center justify-center border-[6px] border-kuBeige overflow-hidden z-10">
                <img
                  src={top20[1].userProfileImg ?? defaultProfileImg}
                  alt="1st"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 이름 및 포인트 정보 (겹쳐진 부분) */}
              <div className="w-full bg-kuBeige rounded-xl -mt-4 py-4">
                <span className="block text-center text-lg font-bold text-black max-w-[100px] truncate m-auto">
                  {top20[1].userName}
                </span>
                <span className="block text-center text-sm text-kuDarkGreen font-semibold max-w-[100px] truncate m-auto">
                  {top20[1].totalPoints}P
                </span>
              </div>
            </div>

            {/* 1st 섹션 */}
            <div className="flex flex-1 flex-col items-center animate-fade-up animation-delay-1000 opacity-0">
              {/* 1st 섹션에는 라이쿠 뿔이 양옆으로 들어가야 한다, 따라서 따로 div를 판다 */}
              <div className="flex flex-row items-end justify-between space-x-1 mb-1">
                <img
                  src={rikuHorn_left}
                  alt="rikuHornLeft"
                  className="w-full h-full object-cover"
                />
                <span className="inline-block text-center text-2xl font-bold text-yellow-200">
                  1st
                </span>
                <img
                  src={rikuHorn_right}
                  alt="rikuHornRight"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col items-center -space-y-4">
                {/* 프로필 이미지 */}
                <div className="w-full aspect-square bg-gray-300 rounded-full flex items-center justify-center border-[6px] border-kuBeige overflow-hidden z-10">
                  <img
                    src={top20[0].userProfileImg ?? defaultProfileImg}
                    alt="1st"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* 이름 및 포인트 정보 (겹쳐진 부분) */}
                <div className="w-full bg-kuBeige rounded-xl pt-4 pb-14">
                  <span className="block text-center text-lg font-bold text-black max-w-[100px] truncate m-auto">
                    {top20[0].userName}
                  </span>
                  <span className="block text-center text-sm text-kuDarkGreen font-semibold max-w-[100px] truncate m-auto">
                    {top20[0].totalPoints}P
                  </span>
                </div>
              </div>
            </div>

            {/* 3rd 섹션 */}
            <div className="flex flex-1 flex-col items-center animate-fade-up animation-delay-300 opacity-0">
              <span className="block text-center text-2xl font-bold text-whiteSmoke mb-1">3rd</span>
              {/* 프로필 이미지 */}
              <div className="w-full aspect-square bg-gray-300 rounded-full flex items-center justify-center border-[6px] border-kuBeige overflow-hidden z-10">
                <img
                  src={top20[2].userProfileImg ?? defaultProfileImg}
                  alt="1st"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 이름 및 포인트 정보 (겹쳐진 부분) */}
              <div className="w-full bg-kuBeige rounded-xl -mt-4 py-4">
                <span className="block text-center text-lg font-bold text-black max-w-[100px] truncate m-auto">
                  {top20[2].userName}
                </span>
                <span className="block text-center text-sm text-kuDarkGreen font-semibold max-w-[100px] truncate m-auto">
                  {top20[2].totalPoints}P
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* 로딩이 완료되었을 때만 아래의 UI를 띄운다 */}
      {isLoaded ? (
        <div className="animate-fade-in">
          {/* "이번달 내 순위" 내용을 표현하는 부분 */}
          <div className="w-full max-w-sm text-left m-4">
            <span className="text-xl font-bold pr-4 text-whiteSmoke">이번 학기 내 순위</span>
            <span className="text-xl font-bold pr-4 text-whiteSmoke">|</span>
            <span className="text-xl font-bold text-kuLightGreen">{myRanking}</span>
          </div>

          {/* 자신의 랭킹을 표시하는 카드 섹션 */}
          <div className="w-full max-w-sm bg-kuLightGray rounded-xl flex flex-row justify-between items-center px-3 py-2 mb-6">
            <div className="flex flex-row flex-start items-center">
              <span className="text-kuDarkGray text-base font-bold mr-4">{myRanking}</span>
              <img
                src={myInfo.userProfileImg ?? defaultProfileImg}
                alt="myProfileImg"
                className="w-16 h-16 rounded-full mr-4 object-cover"
              />
              <span className="text-black text-xl font-bold">{myInfo.userName}</span>
            </div>
            <span className="text-kuDarkGreen text-xl font-bold mr-3">{myInfo.totalPoints}P</span>
          </div>

          {/* 그 밑의 4위부터 회원들 랭킹 프로필 카드 (받아온 랭킹 정보를 바탕으로 map 함수로 return할 것임) */}
          {top20.slice(3, viewCount).map((user, index) => (
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
    </div>
  );
}

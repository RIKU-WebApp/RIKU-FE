import { useState, useEffect } from 'react';
import defaultProfileImg from '@assets/default_profile.png'; //기본 프로필 이미지 불러오기
import rikuHorn_left from '@assets/RankingPage/rikuHorn_left.svg';
import rikuHorn_right from '@assets/RankingPage/rikuHorn_right.svg';
import customAxios from '@shared/apis/customAxios';

//랭킹 페이지에서 보여줄 간단한 회원 정보에 관한 SimpleUserInfo interface
interface SimpleUserInfo {
  userId: number;
  userName: string;
  userProfileImg: string | null; // 우선은 File이 아닌 string(URL)로 가정
  totalPoints: number;
}

//랭킹 페이지
function RankingPage() {
  //상위 10명 정보를 저장한 top20_Info (서버에서 받아온 정보로 업데이트할 것임)
  const [top20_Info, setTop20_Info] = useState<SimpleUserInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false); //랭킹 정보가 모두 불러와 졌는지 체크
  const [error, setError] = useState<string | null>(null); // 에러 상태 관리

  //자신의 정보 myInfo (안 불러져왔을 경우 표시할 placeholder 격의 데이터 하나 넣어놓을 것임)
  const [myInfo, setMyInfo] = useState<SimpleUserInfo>({
    userName: '정보없음',
    userProfileImg: 'https://via.placeholder.com/48',
    totalPoints: 111,
    userId: 1,
  });

  //자신의 랭킹 정보 myRankingInfo
  const [myRankingInfo, setMyRankingInfo] = useState<number>(0);

  //현재 하단 순위표에 보여줄 인원수(top10 혹은 top20), 이걸로 렌더링할 갯수 조절할 것임
  const [viewCount, setViewCount] = useState(10);

  //하단 순위표를 toggle할 메소드 toggleViewCount ('전체보기' 혹은 '간략히 보기' 버튼에 장착할 메소드)
  const toggleViewCount = () => {
    setViewCount(viewCount === 10 ? top20_Info.length : 10);
  };

  //초기에 랭킹 정보를 가져와야 한다. 해당 기능을 수행하는 메소드 fetchRankingInfo()
  async function fetchRankingInfo() {
    const accessToken = JSON.parse(localStorage.getItem('accessToken') || ''); //localStorage에 저장된 accessToken 값이 없으면 ''으로 초기화

    const url = '/ranking';

    try {
      setIsLoading(true); // 현재 데이터 로딩 중임을 표시
      setError(null); // 에러 상태 null로 설정
      const response = await customAxios.get(
        url, //요청 url
        {
          headers: {
            Authorization: accessToken, //accessToken을 헤더로 추가해서 요청 보냄
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

      //불러온 정보들 바탕으로 set
      setTop20_Info(top20);
      setMyInfo(my);
      setMyRankingInfo(myRank);
    } catch (error) {
      alert('서버 요청 중 오류 발생!');
      setError('요청 실패: ' + error);
    } finally {
      setIsLoading(false); // 데이터 로딩 완료 표시
    }
  }

  //처음 렌더링 될 때만 회원 랭킹 정보 불러오기
  useEffect(() => {
    fetchRankingInfo();
  }, []);

  // 에러 상태가 있을 경우의 렌더링 ('다시 시도' 했을 때 재시도할 수 있도록 설계)
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-kuDarkGreen py-20 px-4">
        <div className="text-center">
          <span className="text-red-400 text-lg mb-4 block">{error}</span>
          <button
            onClick={fetchRankingInfo}
            className="bg-kuLightGreen text-kuDarkGreen px-6 py-2 rounded-xl font-semibold hover:bg-opacity-90 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 로딩 중일 때 렌더링 (Skeleton UI 사용)
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-kuDarkGreen py-20 px-4">
        <span className="text-white text-2xl font-bold">로딩 중입니다...</span>
      </div>
    );
  }

  // 메인 콘텐츠 렌더링 (로딩 다 되었을 때, 여기가 렌더링 될 것임)
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-kuDarkGreen py-20 px-4">
      {/* 기존에 Top3 프로필 카드가 애니메이션이 들어가 있음 -> 여기에도 애니메이션을 넣어야 자연스러움 */}
      <div className="animate-fade-in">
        {/* 상단의 Top3 프로필 카드 */}
        <div className="w-full max-w-sm rounded-xl flex flex-col justify-center items-center">
          <span className="w-fit text-center font-semibold text-kuDarkGreen bg-white py-1 px-8 rounded-xl">
            Top 3
          </span>
          <div className="w-full h-[294px]">
            <div className="flex flex-row justify-between items-end my-4 gap-3">
              {/* 2nd 섹션 */}
              <div className="flex flex-1 flex-col items-center animate-fade-up animation-delay-600 opacity-0">
                <span className="block text-center text-2xl font-bold mb-1 text-whiteSmoke">
                  2nd
                </span>
                <div className="w-full aspect-square bg-gray-300 rounded-full flex items-center justify-center border-[6px] border-kuBeige overflow-hidden z-10">
                  <img
                    src={top20_Info[1]?.userProfileImg ?? defaultProfileImg}
                    alt="2nd"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-full bg-kuBeige rounded-xl -mt-4 py-4">
                  <span className="block text-center text-lg font-bold text-black">
                    {top20_Info[1]?.userName}
                  </span>
                  <span className="block text-center text-sm text-kuDarkGreen font-semibold">
                    {top20_Info[1]?.totalPoints}P
                  </span>
                </div>
              </div>

              {/* 1st 섹션 */}
              <div className="flex flex-1 flex-col items-center animate-fade-up animation-delay-1000 opacity-0">
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
                  <div className="w-full aspect-square bg-gray-300 rounded-full flex items-center justify-center border-[6px] border-kuBeige overflow-hidden z-10">
                    <img
                      src={top20_Info[0]?.userProfileImg ?? defaultProfileImg}
                      alt="1st"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-full bg-kuBeige rounded-xl pt-4 pb-14">
                    <span className="block text-center text-lg font-bold text-black">
                      {top20_Info[0]?.userName}
                    </span>
                    <span className="block text-center text-sm text-kuDarkGreen font-semibold">
                      {top20_Info[0]?.totalPoints}P
                    </span>
                  </div>
                </div>
              </div>

              {/* 3rd 섹션 */}
              <div className="flex flex-1 flex-col items-center animate-fade-up animation-delay-300 opacity-0">
                <span className="block text-center text-2xl font-bold text-whiteSmoke mb-1">
                  3rd
                </span>
                <div className="w-full aspect-square bg-gray-300 rounded-full flex items-center justify-center border-[6px] border-kuBeige overflow-hidden z-10">
                  <img
                    src={top20_Info[2]?.userProfileImg ?? defaultProfileImg}
                    alt="3rd"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-full bg-kuBeige rounded-xl -mt-4 py-4">
                  <span className="block text-center text-lg font-bold text-black">
                    {top20_Info[2]?.userName}
                  </span>
                  <span className="block text-center text-sm text-kuDarkGreen font-semibold">
                    {top20_Info[2]?.totalPoints}P
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* "이번달 내 순위" 내용을 표현하는 부분 */}
        <div className="w-full max-w-sm text-left m-4">
          <span className="text-xl font-bold pr-4 text-whiteSmoke">이번 학기 내 순위</span>
          <span className="text-xl font-bold pr-4 text-whiteSmoke">|</span>
          <span className="text-xl font-bold text-kuLightGreen">{myRankingInfo}</span>
        </div>

        {/* 자신의 랭킹을 표시하는 카드 섹션 */}
        <div className="w-full max-w-sm bg-kuLightGray rounded-xl flex flex-row justify-between items-center px-3 py-2 mb-6">
          <div className="flex flex-row flex-start items-center">
            <span className="text-kuDarkGray text-base font-bold mr-4">{myRankingInfo}</span>
            <img
              src={myInfo.userProfileImg ?? defaultProfileImg}
              alt="myProfileImg"
              className="w-16 h-16 rounded-full mr-4 object-cover"
            />
            <span className="text-black text-xl font-bold">{myInfo.userName}</span>
          </div>
          <span className="text-kuDarkGreen text-xl font-bold mr-3">{myInfo.totalPoints}P</span>
        </div>

        {/* 그 밑의 4위부터 회원들 랭킹 프로필 카드 */}
        {top20_Info.slice(3, viewCount).map((user, index) => (
          <div
            key={index}
            className="w-full max-w-sm bg-kuWarmGray rounded-xl flex flex-row justify-between items-center px-3 py-2 mb-2"
          >
            <div className="flex flex-row items-center">
              <span className="text-kuDarkGray text-sm font-bold mr-4">{user.userId}</span>
              <img
                src={user.userProfileImg ?? defaultProfileImg}
                alt={`${user.userName} Profile`}
                className="w-12 h-12 rounded-full mr-4 object-cover"
              />
              <span className="text-black text-base">{user.userName}</span>
            </div>
            <span className="text-kuDarkGreen text-base font-semibold mr-3">
              {user.totalPoints}P
            </span>
          </div>
        ))}

        {/* 하단의 '전체보기' 버튼 */}
        <div
          className="w-full max-w-sm bg-kuBeige rounded-xl text-center py-2 mt-4 mb-12 cursor-pointer hover:bg-opacity-90 transition-colors"
          onClick={toggleViewCount}
        >
          <span className="text-black text-base font-normal">
            {viewCount === 10 ? '전체보기' : '간략히 보기'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default RankingPage;

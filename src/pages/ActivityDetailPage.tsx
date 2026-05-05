import { useState, useEffect } from 'react';
import customAxios from '@shared/lib/customAxios';
import ActionBar from '@shared/ui/ActionBar';
import defaultProfileImg from '@assets/default_profile.png';

interface points {
  date: string;
  tag: string;
  type: string;
  postTitle: string;
  point: number;
}

interface userData {
  userProfileImg: string;
  userName: string;
  userRole: string;
  totalPoint: number;
  participationCount: number;
  rank: number;
  points: points[];
}

//활동 내역의 종류에 따라 마커 컬러를 return하는 메소드
function setMarkerColor(type: string) {
  if (type === '정규런') {
    //정규런이면..
    return 'bg-kuDarkGreen';
  } else if (type === '훈련') {
    //훈련이면..
    return 'bg-kuYellow';
  } else if (type === '행사') {
    //행사이면..
    return 'bg-kuBrown';
  } else if (type === '번개런') {
    //번개런이면..
    return 'bg-kuGreen';
  } else {
    return 'bg-kuCoolGray';
  }
}

//들어오는 정보에 따라 적당한 역할 문자열을 반환해 주는 getUserRole
function getUserRole(role: string | undefined) {
  if (role === 'NEW_MEMBER') {
    return '신입부원';
  } else if (role === 'MEMBER') {
    return '일반부원';
  } else if (role === 'ADMIN') {
    return '운영진';
  } else if (role === 'INACTIVE') {
    return '비활성화 사용자';
  } else {
    return '살려주세요';
  }
}

//user의 활동 내역을 불러오는 화면 ActivityDetailPage()
function ActivityDetailPage() {
  const [userData, setUserData] = useState<userData | null>(null);

  //유저 세부 정보를 불러오는 fetchUserDetailedProfile()
  async function fetchUserDetailedProfile() {
    try {
      const url = '/user/profile/participations'; //"마이페이지 활동내역 조회" api의 url로 설정
      const accessToken = localStorage.getItem('accessToken') || ''; //localStorage에 저장된 accessToken 값이 없으면 ''으로 초기화
      const response = await customAxios.get(url, {
        headers: {
          Authorization: accessToken,
        },
      });
      setUserData(response.data.result); //불러온 값(response.data.result)으로 userData를 세팅!
      console.log(response.data.result);
    } catch (error) {
      console.error('프로필 불러오기 실패:', error);
      alert('프로필 불러오기 실패!');
    }
  }

  //페이지 최초 로딩 1회 시에만 유저 정보를 불러와야 함
  useEffect(() => {
    fetchUserDetailedProfile();
  }, []);

  function toKST_YMD(utcDateString: string): string {
    const utcDate = new Date(utcDateString);
    const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000); // KST = UTC + 9시간
    const year = kstDate.getFullYear();
    const month = String(kstDate.getMonth() + 1).padStart(2, '0');
    const day = String(kstDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return (
    <>
      <ActionBar />
      <div className="min-h-screen w-full max-w-[430px] mx-auto flex flex-col items-center justify-start bg-white pt-[56px] pb-20">
        <div className="w-full text-left mt-2 mb-16 p-4 pl-8">
          <span className="text-2xl font-bold">포인트 / 활동 상세 내역</span>
        </div>
        <div className="relative w-full">
          {/* 프로필 사진 */}
          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-28 h-28 rounded-full bg-gray-300 border-[4px] border-kuCoolGray overflow-hidden">
              <img
                src={userData?.userProfileImg ?? defaultProfileImg} //userData의 userProfileImg가 null이면 기본 이미지 출력하는 구조
                alt="프로필사진"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* 기준이 되는 하단 박스 */}
          <div className="bg-kuLightGray w-full pt-16 pb-4 pl-8 pr-8 mb-8">
            <div className="w-full flex flex-col gap-1 justify-center items-center">
              <span className="text-2xl font-bold">{userData?.userName}</span>
              <span className="text-xs text-kuBlack">{getUserRole(userData?.userRole)}</span>
            </div>
            {/* 포인트, 활동 내역, 순위를 나타내는 박스 */}
            <div className="flex flex-row justify-center items-center py-3 px-0 bg-kuWhite rounded-lg mt-6 mb-10">
              <div className="w-1/3 flex flex-col justify-center items-center gap-1">
                <span className="text-2xl font-bold text-kuDarkGreen">{userData?.totalPoint}</span>
                <span className="text-xs text-kuDarkGray">포인트</span>
              </div>
              <div className="w-1/3 flex flex-col justify-center items-center gap-1 border-x-[1px] border-kuCoolGray ">
                <span className="text-2xl font-bold text-kuDarkGreen">
                  {userData?.participationCount}
                </span>
                <span className="text-xs text-kuDarkGray">활동 내역</span>
              </div>
              <div className="w-1/3 flex flex-col justify-center items-center gap-1">
                <span className="text-2xl font-bold text-kuDarkGreen">{userData?.rank}</span>
                <span className="text-xs text-kuDarkGray">순위</span>
              </div>
            </div>
            {/* 여기서부터는 상세 활동 내역을 출력하는 곳입니다 */}
            {userData?.points.map((participationDetail, i) => {
              return (
                <div
                  key={i}
                  className="flex w-full rounded-xl overflow-hidden border border-gray-200 mb-3"
                >
                  {/* 좌측 정보 영역 */}
                  <div className="flex flex-col justify-center gap-1 px-4 py-3 bg-white w-4/5">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{toKST_YMD(participationDetail.date)}</span>
                      <span
                        className={`${setMarkerColor(
                          participationDetail.tag
                        )} text-white px-2 py-0.5 rounded-lg text-[10px] font-semibold`}
                      >
                        {participationDetail.tag}
                      </span>
                    </div>
                    <div className="text-m font-medium text-gray-800">
                      [
                      {participationDetail.tag === '출석' //tag가 "출석"인 경우에는 type만 띄워준다
                        ? participationDetail.type
                        : (participationDetail.tag, participationDetail.type)}
                      ] {participationDetail.postTitle} {/*postTitle(게시글 제목 등)을 띄워준다*/}
                    </div>
                  </div>

                  {/* 우측 포인트 영역 */}
                  <div className="flex items-center justify-center w-1/5 bg-kuWarmGray">
                    <span className="text-lg font-medium text-gray-600">
                      {participationDetail.point}P
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default ActivityDetailPage;

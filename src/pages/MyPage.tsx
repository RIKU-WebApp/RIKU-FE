import { Fragment, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // Link 컴포넌트 import
import profile_Img from '@assets/default_profile.png'; //이미지 불러오기
import rightArrow_Icon from '@assets/right_arrow.svg'; //라이쿠 로고 불러오기
import customAxios from '@/shared/lib/customAxios';
import { logout } from '@features/auth/api/tokenAuth';
import { previewFeaturesEnabled } from '../shared/config/features';
import MyBadgePreview from '../features/improvements/MyBadgePreview';
import LocalRunTestButton from '../features/improvements/LocalRunTestButton';

import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  getMonth,
} from 'date-fns';

// 재사용 가능한 버튼 컴포넌트
function renderButton(text: string, iconSrc: string, onClick: () => void) {
  return (
    <button onClick={onClick} className="w-full min-h-[56px] flex justify-between items-center px-4 py-3 text-left">
      <span className="text-xl font-normal text-gray-800">{text}</span>
      <img src={iconSrc} alt="" className="h-5 w-5" />
    </button>
  );
}

function getUserRole(role: string) {
  if (role === 'NEW_MEMBER') {
    return '신입부원';
  } else if (role === 'MEMBER') {
    return '일반부원';
  } else if (role === 'ADMIN') {
    return '운영진';
  } else if (role === 'PACER') {
    return '페이서';
  } else {
    return '';
  }
}

//한 달 달력에 들어갈 내용(날짜(Date))들의 배열을 만든다.
function makeCalendarDays(pointDate: Date) {
  const monthStart = startOfMonth(pointDate); //현재 달의 시작 날짜
  const monthEnd = endOfMonth(pointDate); //현재 달의 마지막 날짜
  const startDate = startOfWeek(monthStart); //현재 달의 시작 날짜가 포함된 주의 시작 날짜(그니까, 전 달의 날짜가 나올수도 있음!)
  const endDate = endOfWeek(monthEnd); //현재 달의 마지막 날짜가 포함된 주의 끝 날짜(그니까, 다음 달의 날짜가 나올수도 있음!)

  const calendarDays = [];
  let start = startDate;

  while (start <= endDate) {
    //start가 endDate보다 작거나 같은 동안엔 반복문을 지속한다
    calendarDays.push(start); //calendarDays 배열의 끝에 start 값 추가
    start = addDays(start, 1); //날짜를 하루 더해준다(이것을 통해 start를 업데이트 한다)
  }

  return calendarDays;
}

//UserInfo의 타입을 명확하게 지정하기 위함
//--> String, Number와 같이 대문자 타입은 JS의 래퍼 객체 타입, 아래와 같은 상황에선 소문자 써야함!
interface UserInfo {
  localRunTestOrigin?: string;
  studentId: string;
  userName: string;
  userProfileImgUrl: string | null;
  userRole: string;
  points: number;
  participationCount: number;
  profileAttendanceDates: string[];
}

//로그인 페이지
function MyPage() {
  const navigate = useNavigate(); //useNavigate 훅을 사용해 navigate 함수 생성

  //마이페이지에 표시할 유저의 정보를 저장하는 state(서버에서 받아와서 해당 정보를 업데이트할 예정)
  const [userInfo, setUserInfo] = useState<UserInfo>({
    studentId: '',
    userName: '',
    userProfileImgUrl: '',
    userRole: '',
    points: 0,
    participationCount: 0,
    profileAttendanceDates: [],
  });
  const [isUserInfoLoaded, setIsUserInfoLoaded] = useState(false); //유저 정보 로딩 여부
  const [attendChecked, setAttendChecked] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  //오늘 날짜 기준으로 한달 치 날짜 만들기 (추후, "출석체크" 캘린더에서 사용할 예정)
  const pointDate = useMemo(() => new Date(), []);
  const calendarDaysList = makeCalendarDays(pointDate);
  const weeks: Date[][] = [];
  let week: Date[] = [];
  calendarDaysList.forEach((day) => {
    if (week.length < 7) {
      week.push(day);
    } else {
      weeks.push(week);
      week = [day];
    }
  });
  if (week.length > 0) weeks.push(week);

  //유저 정보를 가져오는 메소드 fetchUserInfo
  async function fetchUserInfo() {
    const accessToken = localStorage.getItem('accessToken') || ''; //localStorage에 저장된 accessToken 값이 없으면 ''으로 초기화
    const todayDate = format(new Date(), 'yyyy-MM-dd');
    const url = `/user/profile?date=${todayDate}`;

    try {
      const response = await customAxios.get(
        url, //요청 url
        {
          headers: {
            Authorization: accessToken, //accessToken을 헤더로 추가해서 요청 보냄
          },
        }
      );

      if (response.data.isSuccess === true) {
        const data = {
          localRunTestOrigin: response.data.result.localRunTestOrigin,
          studentId: response.data.result.studentId,
          userName: response.data.result.userName,
          userProfileImgUrl: response.data.result.userProfileImgUrl,
          userRole: response.data.result.userRole,
          points: response.data.result.points,
          participationCount: response.data.result.participationCount,
          profileAttendanceDates: response.data.result.profileAttendanceDates,
        };
        setUserInfo(data);
        setIsUserInfoLoaded(true); //데이터 로딩 완료 되었다는 표시
        console.log(response.data);
      } else if (response.data.isSuccess === false) {
        alert(`서버에서 제대로 유저 정보를 불러오지 못했습니다: ${response.data.responseMessage}`);
      }
    } catch (error) {
      alert('서버 요청 중 오류 발생!');
      console.error('요청 실패: ', error);
    }
  }

  //'프로필 수정' 버튼 눌렀을 때 수행할 함수
  function handleProfileFixBtnClick() {
    navigate('/profilefix-page');
  }

  //'활동 내역' 영역 눌렀을 시, '활동 상세 내역' 페이지로 가게 만드는 함수
  function handleParticipationCountClick() {
    navigate('/activity-detail');
  }

  //"출석하기" 버튼 state 활성,비활성 관리
  function isAttendCheckBtnValid() {
    return attendChecked;
  }

  //"출석하기" 버튼 클릭 시 이벤트 수행
  async function handleAttendCheckBtn() {
    const accessToken = localStorage.getItem('accessToken') || ''; //localStorage에 저장된 accessToken 값이 없으면 ''으로 초기화
    const url = `/user/attend`;

    try {
      await customAxios.post(
        url, //요청 url
        {},
        {
          headers: {
            Authorization: accessToken, //accessToken을 헤더로 추가해서 요청 보냄
          },
        }
      );
      alert('출석이 완료됨!'); //"출석이 완료되었습니다"가 출력될 것
      setAttendChecked(true); //'출석됨'으로 표시
      await fetchUserInfo(); //여기에서 유저 정보를 갱신하는 함수(fetchUserInfo)를 call해야 캘린더에 반영된다
    } catch (error) {
      alert('출석 요청 중 오류 발생!');
      console.error('요청 실패: ', error);
    }
  }

  //"로그아웃" 버튼 클릭 시 이벤트 수행
  async function handleLogout() {
    await logout();
    alert('정상적으로 로그아웃 되었습니다.');
    navigate('/');
  }

  //첫 렌더링 시에만 유저 정보 불러오기
  useEffect(() => {
    fetchUserInfo();
  }, []);

  //userInfo가 정상적으로 업데이트 되었을 시에만 출석 검사 수행 ('출석하기' 버튼 클릭 후, attendChecked가 변했을 때에도 다시 수행해야 함)
  useEffect(() => {
    if (userInfo.profileAttendanceDates.length > 0) {
      //profileAttendanceDates가 비어있지 않은 경우에만 수행
      const formattedDate = format(new Date(), 'yyyy-MM-dd'); // 오늘 날짜를 formattedDate로 포맷팅
      const isTodayAttended = userInfo.profileAttendanceDates.includes(formattedDate);
      if (isTodayAttended) {
        // 오늘 날짜가 출석되어 있다면
        setAttendChecked(true); // 출석 더 이상 못하게 한다
      }
    }
  }, [userInfo]);

  // isUserInfoLoaded가 false일 때는, "로딩 중.." 렌더링
  if (!isUserInfoLoaded) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white">
        <span className="text-gray-400 text-sm animate-pulse">로딩 중입니다...</span>
      </div>
    );
  }

  // isUserInfoLoaded가 true일 때만 해당 컴포넌트가 출력될 것임 (최초 로딩 시에 fade-in 애니메이션 적용됨)
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-white pt-20 p-4 pb-20 animate-fade-in">
      <div className="w-full max-w-sm text-left mt-2 mb-6">
        <span className="text-2xl font-bold">마이페이지</span>
      </div>
      <div className="bg-whiteSmoke p-6 mb-4 rounded-xl w-full max-w-sm">
        {/*프로필 이미지와 이름 섹션*/}
        <div className="flex items-center mb-4">
          <img
            src={userInfo.userProfileImgUrl || profile_Img}
            alt="Profile"
            className="w-16 h-16 rounded-full mr-4"
          />
          <div className="text-start">
            <p className="text-xl font-semibold text-gray-800">{userInfo.userName}</p>
            <p className="text-base text-gray-500">{getUserRole(userInfo.userRole)}</p>
          </div>
          <button
            className="ml-auto px-4 py-1 text-base bg-green-600 text-white rounded-lg hover hover:bg-green-900 transition"
            onClick={handleProfileFixBtnClick}
          >
            프로필 수정
          </button>
        </div>

        {/* 포인트와 활동 내역 섹션 */}
        <div className="flex justify-around mt-6 pt-4 border-t-2">
          <div className="text-center" onClick={handleParticipationCountClick}>
            <p className="text-2xl font-bold text-gray-800">{userInfo.points}</p>
            <p className="text-base text-gray-500">포인트</p>
          </div>
          <div className="text-center" onClick={handleParticipationCountClick}>
            {
              //활동내역 갯수가 0 이하인 경우를 따진다
              userInfo.participationCount <= 0 ? (
                <p className="text-2xl font-bold text-gray-800">-</p>
              ) : (
                <p className="text-2xl font-bold text-gray-800">{userInfo.participationCount}</p>
              )
            }
            <p className="text-base text-gray-500">활동 내역</p>
          </div>
        </div>
      </div>

      {/* 오늘의 출석 세션 */}
      <div className="bg-whiteSmoke px-4 py-3 mb-4 rounded-xl w-full max-w-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <h2 className="text-lg font-bold text-gray-800">오늘의 출석</h2>
            <span className="text-sm text-gray-600">출석하면 +1P!</span>
          </div>
          <button aria-expanded={calendarOpen} onClick={() => setCalendarOpen(!calendarOpen)}
            className="py-1 text-sm text-gray-600">{calendarOpen ? '달력 접기' : '출석 달력'}</button>
        </div>

        {/* 중첩 map 함수를 사용해서 출석체크 달력을 출력할 것이다(캘린더 렌더링) */}
        {calendarOpen && weeks.map((week, index) => (
          <Fragment key={index}>
            <div
              className="relative grid grid-cols-7 mt-4 mb-4 text-center w-full max-w-sm"
            >
              {week.map((day, subIndex) => {
                const formattedDate = format(day, 'yyyy-MM-dd');
                const markerOn = userInfo.profileAttendanceDates.includes(formattedDate);
                const isToday = format(pointDate, 'yyyy-MM-dd') === formattedDate; //오늘 날짜인지 아닌지 체크
                const isCurrentMonth = getMonth(pointDate) === getMonth(day);
                const style = isCurrentMonth ? 'text-black' : 'text-gray-400';

                return (
                  <div key={subIndex} className="flex flex-col items-center justify-center">
                    {/* 오늘 날짜에 대한 Marker 표시(출석 안했을 때만 표시) */}
                    {!attendChecked && isToday ? (
                      <>
                        <span className="text-lg font-normal z-10 text-white">
                          {day.getDate()}
                        </span>
                        <div className="absolute w-10 h-10 rounded-full bg-kuDarkGreen z-0" />
                      </>
                    ) : (
                      <>
                        <span className={`text-lg font-normal z-10 ${style}`}>
                          {day.getDate()}
                        </span>
                        {/* 출석한 날짜에 대한 Marker 표시 */}
                        {markerOn && (
                          <div className="absolute w-10 h-10 rounded-full bg-kuWarmGray z-0" />
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            {/* 마지막 줄이 아닌 경우에만 선을 추가 */}
            {index < weeks.length - 1 && <div className="w-full h-px bg-gray-200" />}
          </Fragment>
        ))}

        {/* 출석하기 버튼 */}
        <button
          className={`w-full mt-2 py-2 ${
            !isAttendCheckBtnValid()
              ? 'bg-kuDarkGreen hover:bg-kuGreen text-white'
              : 'bg-kuLightGray text-gray-900 cursor-not-allowed'
          } text-lg font-bold rounded-md transition-colors`}
          onClick={handleAttendCheckBtn}
          disabled={isAttendCheckBtnValid()}
        >
          {attendChecked ? '출석 완료' : '출석하기'}
        </button>
      </div>

      <MyBadgePreview />
      <LocalRunTestButton origin={userInfo.localRunTestOrigin} />
      {/* '공지사항' 버튼 */}
      {/* <div className="w-full max-w-sm mt-4">
        {renderButton("공지사항", rightArrow_Icon, handleNoticeClick)}
      </div> */}

      {/* '문의하기' 버튼 */}
      {/* <div className="w-full max-w-sm mt-2">
        {renderButton("문의하기", rightArrow_Icon, handleNoticeClick)}
      </div> */}

      {/* 'FAQ' 버튼 */}
      {/* <div className="w-full max-w-sm mt-2">
        {renderButton("FAQ", rightArrow_Icon, handleNoticeClick)}
      </div> */}

      {userInfo.userRole === 'ADMIN' && (
        <section aria-labelledby="admin-menu-title" className="w-full max-w-sm mt-6 overflow-hidden rounded-lg border border-kuDarkGreen">
          <h2 id="admin-menu-title" className="bg-kuDarkGreen px-4 py-3 text-lg font-semibold text-white">관리자 메뉴</h2>
          <div className="divide-y divide-kuLightGray">
            {renderButton('회원 관리', rightArrow_Icon, () => navigate('/admin/members'))}
            {previewFeaturesEnabled && renderButton('건의사항 관리', rightArrow_Icon, () => navigate('/admin/feedback'))}
          </div>
        </section>
      )}

      <div className="flex w-full max-w-sm mt-8 mb-8 justify-center">
        <span
          className="text-xl font-normal underline underline-offset-2 text-kuDarkGray"
          onClick={handleLogout}
        >
          로그아웃
        </span>
      </div>
    </div>
  );
}

export default MyPage;

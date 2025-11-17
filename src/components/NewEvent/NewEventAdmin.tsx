import React, { useState, useEffect, useRef } from 'react';

import people from '@assets/FlashRunDetail/people.svg';
import place from '@assets/FlashRunDetail/place.svg';
import time from '@assets/FlashRunDetail/time.svg';
import TabButtonUser from './TapButtonUser';

import customAxios from '@/shared/lib/customAxios';
import flashrunimage from '@assets/Run-img/flashrunimage.jpg'; // 번개런 기본이미지
import { useNavigate } from 'react-router-dom';
import BackBtnimg from '@assets/BackBtn.svg';
import pacermark from '@assets/pacer-mark.svg';
import CommentSection from '../common/CommentSection';
import EditableAttendanceList, { EditableAttendanceListHandle } from './EditableAttendanceList';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

import { motion } from 'framer-motion';

interface Participant {
  id: number;
  name: string;
  profileImage?: string | null;
  isPresent: boolean;
}

interface FlashRunUserData {
  title: string;
  location: string;
  date: string;
  participants: Participant[];
  participantsNum: number;
  content: string;
  userName: string;
  code?: string;
  postId?: string; // 게시글 ID
  userStatus?: string; // 유저의 현재 상태 (참여, 출석 등)
  postimgurl?: string;
  attachmentUrls?: string[];
  userRole?: string;
}

const NewEventAdmin: React.FC<FlashRunUserData> = ({
  title,
  location,

  participants,
  participantsNum,
  content,
  userName,
  postId,
  postimgurl,
  userRole,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'소개' | '명단'>('소개');
  const [buttonText, setButtonText] = useState(() => {
    // 로컬 스토리지에서 buttonText 초기값 가져옴
    return (
      localStorage.getItem(`buttonText-${postId}`) ||
      (localStorage.getItem(`userStatus-${postId}`) === 'ATTENDED' ? '출석완료' : '참여하기')
    );
  });
  const [code, setCode] = useState(''); // 출석 코드
  const [currentParticipants, setCurrentParticipants] = useState<Participant[]>(participants);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null); // 에러 메시지
  const [userStatus, setUserStatus] = useState('');
  const [eventtype, setEventtype] = useState('');
  const [date, setDate] = useState('');
  const [currentParticipantsNum, setCurrentParticipantsNum] = useState<number>(participantsNum); // 현재 불러오는 값
  const [postCreatorId, setPostCreatorId] = useState<number | null>(null);
  const [postStatus, setPostStatus] = useState('');

  // 상단바 점 버튼 관련 코드
  const [showMenu, setShowMenu] = useState(false); // 메뉴 열림 상태 추가
  const menuRef = useRef<HTMLDivElement>(null);
  const dotButtonRef = useRef<HTMLDivElement>(null);

  const [isClosing, setIsClosing] = useState(false); // 출석 종료 중 여부

  const attendanceListRef = useRef<EditableAttendanceListHandle>(null);

  const handleCloseAttendance = async () => {
    const confirmClose = window.confirm('출석을 종료하시겠습니까?');
    if (!confirmClose) return;

    try {
      setIsClosing(true);

      // 명단 자동 저장
      if (attendanceListRef.current) {
        await attendanceListRef.current.saveAttendance();
      }

      const token = JSON.parse(localStorage.getItem('accessToken') || 'null');
      const response = await customAxios.patch(
        `/run/event/post/${postId}/close`,
        {},
        {
          headers: { Authorization: `${token}` },
        }
      );

      if (response.data.isSuccess) {
        alert('출석이 성공적으로 종료되었습니다.');
        setPostStatus('CLOSED');
      } else {
        alert(response.data.responseMessage || '출석 종료에 실패했습니다.');
      }
    } catch (error) {
      alert('출석 종료 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      setIsClosing(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        dotButtonRef.current &&
        !dotButtonRef.current.contains(e.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // buttonText 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    if (buttonText) {
      localStorage.setItem(`buttonText-${postId}`, buttonText);
    }
  }, [buttonText, postId]);

  // userStatus 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    if (userStatus) {
      localStorage.setItem(`userStatus-${postId}`, userStatus);
    }
  }, [userStatus, postId]);

  const handleStartClick = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('accessToken') || 'null');
      const response = await customAxios.patch(
        `/run/event/post/${postId}/join`,
        {},
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.data.isSuccess) {
        setUserStatus(response.data.result.status);
        setButtonText('출석하기');
        setError(null);

        await fetchParticipants(); // 🔥 명단 즉시 반영
      } else {
        if (response.data.responseMessage === '이미 참여한 유저입니다.') {
          alert('이미 참여했습니다.');
        } else {
          setError(response.data.responseMessage);
        }
      }
    } catch (error: any) {
      setError('러닝 참여에 실패했습니다.');
    }
  };

  const handleOpenAttendanceModal = () => {
    setIsModalOpen(true); // 모달 열기
  };

  const handleAttendanceClick = async () => {
    if (!code) {
      setError('출석 코드를 입력해주세요.');
      return;
    }

    try {
      const token = JSON.parse(localStorage.getItem('accessToken') || 'null');
      const response = await customAxios.post(
        `/run/event/post/${postId}/attend`,
        { code },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.data.isSuccess) {
        setUserStatus(response.data.result.status); // 출석 상태로 업데이트
        setButtonText('출석완료'); // 버튼 텍스트를 출석완료로 설정
        setError(null);
        setIsModalOpen(false); // 모달 닫기
      } else {
        setError(response.data.responseMessage);
      }
    } catch (error: any) {
      setError('출석 코드를 다시 확인해주세요.');
    }
  };

  const [refreshComments, setRefreshComments] = useState(false);

  const handleTabChange = async (tab: '소개' | '명단') => {
    setActiveTab(tab);
    const token = JSON.parse(localStorage.getItem('accessToken') || 'null');

    try {
      const response = await customAxios.get(`/run/event/post/${postId}`, {
        headers: {
          Authorization: `${token}`,
        },
      });

      if (response.data.isSuccess) {
        const result = response.data.result;

        // 공통 업데이트 (댓글 관련 정보 등)
        setUserInfo({
          userId: result.userInfo?.userId || 0,
          userName: result.userInfo?.userName || '',
          userProfileImg: result.userInfo?.userProfileImg || '',
          userRole: result.userInfo?.userRole || '',
        });
        setPostCreatorImg(result.postCreatorInfo?.userProfileImg || null);
        setCurrentParticipantsNum(result.participantsNum); // 참가자 수 갱신
        setDate(result.date); // 날짜도 혹시 변경되었을 수 있음

        // 탭 별 업데이트
        if (tab === '명단') {
          setCurrentParticipants(result.participants);
        }

        if (tab === '소개') {
          setAttachmentUrls(result.attachmentUrls || []);
          setCreatorName(result.postCreatorInfo?.userName || '');
        }

        // 댓글 최신화 트리거
        setRefreshComments((prev) => !prev);
      } else {
        setError(response.data.responseMessage);
      }
    } catch (error) {
      setError('데이터를 불러오는 데 실패했습니다.');
    }
  };
  const [userInfo, setUserInfo] = useState<{
    userId: number;
    userName: string;
    userProfileImg: string;
    userRole: string;
  }>({
    userId: 0,
    userName: '',
    userProfileImg: '',
    userRole: '',
  });

  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([]);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('accessToken') || 'null');
        const response = await customAxios.get(`/run/event/post/${postId}`, {
          headers: { Authorization: `${token}` },
        });
        if (response.data.isSuccess) {
          const result = response.data.result;
          console.log(userName);
          setCreatorName(result.postCreatorInfo?.userName || '');

          setDate(result.date);
          setAttachmentUrls(result.attachmentUrls || []);
          setEventtype(result.eventType);
          setUserInfo({
            userId: result.userInfo?.userId || 0,
            userName: result.userInfo?.userName || '',
            userProfileImg: result.userInfo?.userProfileImg || '',
            userRole: result.userInfo?.userRole || '',
          });
          setPostCreatorImg(result.postCreatorInfo.userProfileImg || null);
          setPostCreatorName(result.postCreatorInfo.userName);
          setPostStatus(result.postStatus);

          console.log(response.data.result);

          const currentUser = result.participants.find(
            (p: any) => p.userId === result.userInfo.userId
          );
          if (currentUser) {
            setUserStatus(currentUser.status); // 서버로부터 받아온 내 상태로 갱신
            setButtonText(
              currentUser.status === 'ATTENDED'
                ? '출석완료'
                : currentUser.status === 'PENDING'
                  ? '출석하기'
                  : '참여하기'
            );
          }
        } else {
          setError(response.data.responseMessage);
        }
      } catch {
        setError('데이터를 불러오는 데 실패했습니다.');
      }
    };
    fetchPostData();
  }, [postId]);

  const [creatorName, setCreatorName] = useState(''); // 작성자 이름
  const [postCreatorName, setPostCreatorName] = useState('');

  const formatDateTime = (iso: string) => {
    const utcDate = new Date(iso);
    const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);

    const month = kstDate.getMonth() + 1;
    const day = kstDate.getDate();
    const hours = kstDate.getHours().toString().padStart(2, '0');
    const minutes = kstDate.getMinutes().toString().padStart(2, '0');

    return `${month}월 ${day}일 ${hours}:${minutes}`;
  };

  const [postCreatorImg, setPostCreatorImg] = useState<string | null>(null);

  const fetchParticipants = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('accessToken') || 'null');
      const response = await customAxios.get(`/run/event/post/${postId}`, {
        headers: { Authorization: `${token}` },
      });

      if (response.data.isSuccess) {
        const result = response.data.result;
        setCurrentParticipants(result.participants);
        setCurrentParticipantsNum(result.participantsNum);

        const currentUser = result.participants.find(
          (p: any) => p.userId === result.userInfo.userId
        );
        if (currentUser) {
          setUserStatus(currentUser.status);
          setButtonText(
            currentUser.status === 'ATTENDED'
              ? '출석완료'
              : currentUser.status === 'PENDING'
                ? '출석하기'
                : '참여하기'
          );
        } else {
          setUserStatus('');
          setButtonText('참여하기');
        }
      }
    } catch (err) {
      console.error('명단 갱신 실패', err);
    }
  };

  const handleCancelParticipation = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('accessToken') || 'null');
      const response = await customAxios.patch(
        `/run/event/post/${postId}/join`,
        {},
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.data.isSuccess) {
        setUserStatus(''); // 초기 상태로 설정
        setButtonText('참여하기');
        setError(null);
      } else {
        setError(response.data.responseMessage);
      }
    } catch (error) {
      setError('참여 취소 요청에 실패했습니다.');
    }
  };

  return (
    <div className="flex flex-col items-center text-center max-w-[430px] mx-auto overflow-y-auto justify-center">
      {/* 상단바 */}
      <div className="relative flex bg-kuDarkGreen w-full h-[56px] text-white text-center text-xl font-semibold justify-center items-center">
        <img src={BackBtnimg} className="absolute left-[24px]" onClick={() => navigate(-1)}></img>
        행사
        <div
          ref={dotButtonRef}
          className="absolute right-[5px] top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation(); // 이벤트 버블링 방지
            setShowMenu((prev) => !prev);
          }}
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center gap-y-[4px]">
            {[...Array(3)].map((_, i) => (
              <span key={i} className="w-[4px] h-[4px] bg-white rounded-full" />
            ))}
          </div>
        </div>
        {showMenu && (
          <motion.div
            ref={menuRef}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={{ hidden: {}, visible: {}, exit: {} }}
            className="absolute top-[50px] right-[18px] z-20 flex flex-col gap-y-2"
          >
            {['수정하기', '취소하기'].map((label, index) => (
              <motion.button
                key={label}
                custom={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.1 * index, duration: 0.2 }}
                className="w-[100px] py-2 px-3 rounded-tl-xl rounded-b-xl bg-white shadow-md text-black text-sm"
                onClick={async () => {
                  if (label === '수정하기') {
                    if (postStatus === 'CLOSED' || postStatus === 'CANCELED') {
                      alert('종료된 러닝이나 취소된 러닝은 수정이 불가능합니다.');
                      return;
                    }
                    const now = new Date();
                    const runUtcDate = new Date(date);
                    const runKstDate = new Date(runUtcDate.getTime() + 9 * 60 * 60 * 1000);
                    if (now > runKstDate) {
                      alert('집합 시간이 지난 게시글은 수정할 수 없습니다.');
                      return;
                    }
                    navigate(`/event/edit/${postId}`, { replace: true });
                    setShowMenu(false);
                  } else {
                    if (postStatus === 'CLOSED' || postStatus === 'CANCELED') {
                      alert('이미 종료되었거나 취소된 게시글은 취소할 수 없습니다.');
                      return;
                    }
                    const confirmCancel = window.confirm('정말 게시글을 취소하시겠습니까?');
                    if (!confirmCancel) return;

                    try {
                      const token = JSON.parse(localStorage.getItem('accessToken') || 'null');
                      if (!token) {
                        alert('로그인이 필요합니다.');
                        return;
                      }
                      const { data } = await customAxios.patch(
                        `/run/event/post/${postId}/cancel`,
                        {},
                        { headers: { Authorization: `${token}` } }
                      );
                      if (data.isSuccess) {
                        alert('게시글이 성공적으로 취소되었습니다.');
                        setShowMenu(false);
                        navigate('/event');
                      } else {
                        alert(data.responseMessage || '취소에 실패했습니다.');
                      }
                    } catch (error) {
                      console.error(error);
                      alert('요청 중 오류가 발생했습니다.');
                    }
                  }
                }}
              >
                {label}
              </motion.button>
            ))}

            {userInfo.userRole === 'ADMIN' && (
              <motion.button
                key="삭제하기"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.2, duration: 0.2 }}
                className="w-[100px] py-2 px-3 rounded-tl-xl rounded-b-xl bg-white shadow-md text-black text-sm"
                onClick={async () => {
                  const ok = window.confirm(
                    '정말 게시글을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.'
                  );
                  if (!ok) return;
                  try {
                    const token = JSON.parse(localStorage.getItem('accessToken') || 'null');
                    if (!token) {
                      alert('로그인이 필요합니다.');
                      return;
                    }
                    const { data } = await customAxios.delete(`/run/event/post/${postId}`, {
                      headers: { Authorization: `${token}` },
                    });
                    if (data.isSuccess) {
                      alert('게시글이 삭제되었습니다.');
                      setShowMenu(false);
                      navigate('/event'); // 또는 window.location.href = "/event";
                    } else {
                      alert(data.responseMessage || '삭제에 실패했습니다.');
                    }
                  } catch (err) {
                    console.error(err);
                    alert('삭제 요청 중 오류가 발생했습니다.');
                  }
                }}
              >
                삭제하기
              </motion.button>
            )}
          </motion.div>
        )}
      </div>
      {/* 러닝 포스팅 사진 */}
      <div className="relative w-full pb-[50px]">
        <div className="relative w-full h-[250px] overflow-hidden">
          <img
            src={postimgurl || flashrunimage}
            className={`w-full h-full object-cover ${postStatus === 'CANCELED' || postStatus === 'CLOSED' ? 'brightness-50' : ''}`}
          />
          {(postStatus === 'CANCELED' || postStatus === 'CLOSED') && (
            <div className="absolute inset-0 flex justify-center items-center bg-opacity-40 bg-black">
              <div className="text-white text-lg font-bold bg-opacity-60 px-4 py-2 rounded">
                {postStatus === 'CANCELED' ? '취소된 행사입니다.' : '마감된 행사입니다.'}
              </div>
            </div>
          )}
        </div>

        {/* 번개런 정보 */}
        <div className="absolute top-[230px] w-full rounded-t-[20px] bg-white">
          <div className="flex flex-col items-center mt-[14px]">
            <div className="relative flex items-center bg-[#D96941] p-[10px] text-[14px] w-auto h-[24px] rounded-[8px]">
              <div className="flex items-center font-bold text-white">
                <span>{eventtype}</span>
              </div>
            </div>
            <div className="text-lg font-semibold mt-2 text-[24px]">{title}</div>
          </div>
          <div className="flex flex-col items-start w-full max-w-[360px] mt-5 px-5">
            <div className="flex items-center my-1.5">
              <object data={place} className="w-[24px] h-[24px] mr-2" />
              <span>{location}</span>
            </div>
            <div className="flex items-center my-1.5">
              <object data={time} className="w-[24px] h-[24px] mr-2" />
              <span>{formatDateTime(date)}</span>
            </div>
            <div className="flex items-center my-1.5">
              <object data={people} className="w-[24px] h-[24px] mr-2 font-bold font-#366943" />
              <span className="font-bold text-kuDarkGreen">{currentParticipantsNum}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-[70px]">
        <TabButtonUser leftLabel="소개" rightLabel="명단" onTabChange={handleTabChange} />
      </div>
      {activeTab === '소개' && (
        <>
          <div className="flex justify-center items-center w-[327px] h-14 bg-[#F0F4DD] rounded-lg text-sm font-normal mt-5">
            <div className="flex items-center">
              <div className="relative w-6 h-6 mr-2">
                {postCreatorImg && postCreatorImg.trim() !== '' ? (
                  <img
                    src={postCreatorImg}
                    alt={`${creatorName} 프로필`}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-kuBlue text-white text-xs font-bold flex items-center justify-center">
                    {creatorName?.charAt(0) || '?'}
                  </div>
                )}
                <div className="absolute top-[-15px] left-[-19px] w-[32.78px] h-[32px]">
                  <img src={pacermark} alt="pacer mark" />
                </div>
              </div>
              <span className="text-black font-semibold">{creatorName}</span>
            </div>
          </div>
          {attachmentUrls.length > 0 && (
            <div className="mt-5 w-[327px]">
              <div className="text-left text-[16px] mb-2">행사 사진</div>
              <div className="relative">
                <Swiper
                  pagination={{ clickable: true }}
                  modules={[Pagination]}
                  spaceBetween={10}
                  slidesPerView={1}
                >
                  {attachmentUrls.map((url, index) => (
                    <SwiperSlide key={index}>
                      <div className="relative">
                        <div className="w-full h-[300px] overflow-hidden">
                          <img
                            src={url}
                            alt={`코스 사진 ${index + 1}`}
                            className="rounded-lg w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                          {index + 1}/{attachmentUrls.length}
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          )}
          <div className="flex flex-col mt-2 items-start text-left w-full max-w-[327px]">
            세부 내용
          </div>
          <div className="mt-2 w-[327px] border border-[#ECEBE4] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              {postCreatorImg ? (
                <img
                  src={postCreatorImg}
                  alt={`${postCreatorName} 프로필`}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#844E4E] text-white text-xs flex items-center justify-center font-bold leading-none">
                  {postCreatorName.charAt(0)}
                </div>
              )}
              <span className="text-sm font-medium text-black">{postCreatorName}</span>
            </div>
            <div className="text-black p-3 text-sm text-left whitespace-pre-wrap">{content}</div>
          </div>
        </>
      )}
      {/* 명단 탭 렌더링 시 ref 연결 */}
      {activeTab === '명단' && (
        <EditableAttendanceList
          ref={attendanceListRef}
          postId={postId!}
          runType="event"
          users={currentParticipants}
          onUsersChange={setCurrentParticipants}
          canEdit={true}
          postStatus={postStatus}
          postDate={date}
          userRole={userInfo.userRole}
        />
      )}
      <div className="">
        <CommentSection
          postId={postId!}
          postType="event"
          userInfo={userInfo}
          refreshTrigger={refreshComments}
        />
      </div>

      <button
        onClick={handleCloseAttendance}
        disabled={postStatus === 'CLOSED' || isClosing}
        className={`w-[327px] h-14 rounded-lg text-lg font-bold mt-20 mb-[100px] ${postStatus === 'CLOSED' ? 'bg-kuLightGray text-kuDarkGray' : 'bg-kuGreen text-white'}`}
      >
        {isClosing ? '종료 중...' : postStatus === 'CLOSED' ? '모집 종료' : '출석 종료'}
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
          <div className="bg-white p-5 rounded-lg w-[280px] text-center relative">
            <button
              className="absolute top-2.5 right-2.5 text-2xl cursor-pointer"
              onClick={() => setIsModalOpen(false)}
            >
              ×
            </button>
            <h2>출석 코드를 입력해주세요.</h2>
            <input
              type="text"
              className="w-full p-2 border-b border-gray-300 text-center text-lg mt-5"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button
              className="w-full py-3 rounded-lg bg-[#366943] text-white text-lg mt-5"
              onClick={handleAttendanceClick}
            >
              확인
            </button>
            {error && <div className="text-red-500 mt-2">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewEventAdmin;

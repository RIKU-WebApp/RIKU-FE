import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import customAxios from '@shared/apis/customAxios';
import { motion } from 'framer-motion';
import { useRef } from 'react';

import RegularRunlogo from '../../assets/regularRunMark.svg';
import people from '../../assets/FlashRunDetail/people.svg';
import place from '../../assets/FlashRunDetail/place.svg';
import time from '../../assets/FlashRunDetail/time.svg';
import BackBtnimg from '../../assets/BackBtn.svg';
import pacermark from '../../assets/pacer-mark.svg';
import flashrunimage from '../../assets/Run-img/flashrunimage.jpg';

import TabButton from './TapButton';
import AttendanceList from './AttendanceList';
import PacerCard from './PacerCard';
import CommentSection from '../common/CommentSection';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

import TabNavigationUI_detail from '../TabNavigationUI_detail';

interface Participant {
  userId: number;
  userName: string;
  userProfileImg?: string;
  status: string;
}

interface Pacer {
  group: string;
  pacerName: string;
  distance: string;
  pace: string;
  profileImg?: string | null;
}

interface Props {
  postId?: string;
}

const NewRegularRunAdmin: React.FC<Props> = ({ postId }) => {
  const navigate = useNavigate();
  const handleBack = () => navigate(-1);

  const [activeTab, setActiveTab] = useState<'소개' | '명단'>('소개');
  const [code, setCode] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [content, setContent] = useState('');
  const [postImageUrl, setPostImageUrl] = useState<string | null>(null);
  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantsNum, setParticipantsNum] = useState<number>(0);
  const [pacers, setPacers] = useState<Pacer[]>([]);
  const [postCreatorName, setPostCreatorName] = useState('');
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
  const [buttonText, setButtonText] = useState('시작하기');
  const handleCloseModal = () => setIsModalOpen(false);
  const [refreshComments, setRefreshComments] = useState(false);
  const [groupedParticipants, setGroupedParticipants] = useState<any[]>([]);

  const fetchPostData = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('accessToken') || 'null');
      const response = await customAxios.get(`/run/regular/post/${postId}`, {
        headers: { Authorization: `${token}` },
      });
      if (response.data.isSuccess) {
        const result = response.data.result;
        setTitle(result.title);
        setLocation(result.location);
        setDate(result.date);
        setContent(result.content);
        setPostImageUrl(result.postImageUrl);
        setParticipants(result.participants || []);
        setParticipantsNum(result.participantsNum || 0);
        setPacers(result.pacers || []);
        setAttachmentUrls(result.attachmentUrls || []);
        setPostCreatorName(result.postCreatorInfo.userName);
        setPostStatus(result.postStatus); // CLOSED, NOW 등
        setUserInfo({
          userId: result.userInfo?.userId || 0,
          userName: result.userInfo?.userName || '',
          userProfileImg: result.userInfo?.userProfileImg || '',
          userRole: result.userInfo?.userRole || '',
        });
        setPostCreatorImg(result.postCreatorInfo.userProfileImg || null);
        setGroupedParticipants(result.groupedParticipants || []);
        console.log(result.attachmentUrls); // 1장인지, 여러 장인지
      } else {
        setError(response.data.responseMessage);
      }
    } catch {
      setError('데이터를 불러오는 데 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchPostData();
  }, [postId]);

  const formatDateTime = (iso: string) => {
    const utcDate = new Date(iso);
    const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);

    const month = kstDate.getMonth() + 1;
    const day = kstDate.getDate();
    const hours = kstDate.getHours().toString().padStart(2, '0');
    const minutes = kstDate.getMinutes().toString().padStart(2, '0');

    return `${month}월 ${day}일 ${hours}:${minutes}`;
  };

  const handleStartClick = async () => {
    if (!code) {
      try {
        const token = JSON.parse(localStorage.getItem('accessToken') || 'null');
        const response = await customAxios.post(
          `/run/regular/post/${postId}/code`,
          {},
          {
            headers: { Authorization: `${token}` },
          }
        );
        console.log('응답', response.data);
        if (response.data.isSuccess) {
          setCode(response.data.result.code);
        } else {
          setError(response.data.responseMessage);
        }
      } catch {
        setError('출석 코드 생성에 실패했습니다.');
      }
    }

    setIsModalOpen(true);
  };

  const [postStatus, setPostStatus] = useState<string>('');

  const handleModalStartClick = async () => {
    const confirmClose = window.confirm('정말 출석을 종료하시겠습니까?');
    if (!confirmClose) return;

    if (!code) return;

    try {
      const token = JSON.parse(localStorage.getItem('accessToken') || 'null');

      //수정된 출석 정보가 있다면 먼저 저장
      if (Object.keys(editedAttendance).length > 0) {
        const payload = Object.entries(editedAttendance).map(([userId, isAttend]) => ({
          userId: Number(userId),
          isAttend,
        }));

        await customAxios.patch(`/run/regular/post/${postId}/manual-attendance`, payload, {
          headers: { Authorization: `${token}` },
        });

        setEditedAttendance({});
        setIsEditMode(false);
      }

      // 출석 종료 처리
      const response = await customAxios.patch(
        `/run/regular/post/${postId}/close`,
        {},
        {
          headers: { Authorization: `${token}` },
        }
      );

      if (response.data.isSuccess) {
        setIsFinished(true);
        setPostStatus('CLOSED');
        setIsModalOpen(false);
        alert('출석이 종료되었습니다.');
      } else {
        setError(response.data.responseMessage);
      }
    } catch (error) {
      console.error(error);
      setError('출석 종료 처리에 실패했습니다.');
    }
  };

  const handleTabChange = async (tab: '소개' | '명단') => {
    setActiveTab(tab);
    const token = JSON.parse(localStorage.getItem('accessToken') || 'null');

    try {
      const response = await customAxios.get(`/run/regular/post/${postId}`, {
        headers: { Authorization: `${token}` },
      });

      if (response.data.isSuccess) {
        const result = response.data.result;

        setParticipants(result.participants || []);
        setParticipantsNum(result.participantsNum);
        setPostStatus(result.postStatus);
        setDate(result.date);
        setAttachmentUrls(result.attachmentUrls || []);
        setPacers(result.pacers || []);
        setPostCreatorName(result.postCreatorInfo.userName);
        setPostCreatorImg(result.postCreatorInfo.userProfileImg || null);
        setUserInfo({
          userId: result.userInfo?.userId || 0,
          userName: result.userInfo?.userName || '',
          userProfileImg: result.userInfo?.userProfileImg || '',
          userRole: result.userInfo?.userRole || '',
        });

        // 댓글도 항상 최신화
        setRefreshComments((prev) => !prev);
      } else {
        setError(response.data.responseMessage);
      }
    } catch {
      setError('데이터를 불러오는 데 실패했습니다.');
    }
  };

  const fetchParticipantsInfo = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('accessToken') || 'null');
      const response = await customAxios.get(`/run/regular/post/${postId}`, {
        headers: { Authorization: `${token}` },
      });

      if (response.data.isSuccess) {
        const result = response.data.result;
        setParticipants(result.participants || []);
        setParticipantsNum(result.participantsNum || 0);
        setGroupedParticipants(result.groupedParticipants || []);
      }
    } catch {
      setError('명단 정보 불러오기 실패');
    }
  };

  useEffect(() => {
    if (activeTab === '명단') {
      fetchParticipantsInfo();
    }
  }, [activeTab]);

  const [postCreatorImg, setPostCreatorImg] = useState<string | null>(null);

  // 출석 상태 상태
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedAttendance, setEditedAttendance] = useState<{ [userId: number]: boolean }>({});

  const toggleAttendance = (userId: number, originalStatus: string) => {
    setEditedAttendance((prev) => {
      const current = userId in prev ? prev[userId] : originalStatus === 'ATTENDED';
      return {
        ...prev,
        [userId]: !current,
      };
    });
  };

  const saveAttendanceChanges = async () => {
    const token = JSON.parse(localStorage.getItem('accessToken') || 'null');
    const payload = Object.entries(editedAttendance).map(([userId, isAttend]) => ({
      userId: Number(userId),
      isAttend,
    }));

    try {
      // ADMIN + CLOSED => fix-attendance 사용
      if (postStatus === 'CLOSED' && userInfo.userRole === 'ADMIN') {
        await customAxios.patch(`/run/regular/post/${postId}/fix-attendance`, payload, {
          headers: { Authorization: `${token}` },
        });
      } else {
        // 기존 경로
        await customAxios.patch(`/run/regular/post/${postId}/manual-attendance`, payload, {
          headers: { Authorization: `${token}` },
        });
      }

      alert('출석 정보가 저장되었습니다.');
      setIsEditMode(false);
      setEditedAttendance({});
      await fetchPostData();
    } catch {
      alert('저장에 실패했습니다.');
    }
  };

  const editedCheckedCount = participants.filter((p) => {
    if (p.userId in editedAttendance) return editedAttendance[p.userId];
    return p.status === 'ATTENDED';
  }).length;

  const attendedCount = participants.filter((p) => p.status === 'ATTENDED').length;
  const pendingCount = participants.length - attendedCount;

  // 상단바 점 버튼 관련 코드
  const [showMenu, setShowMenu] = useState(false); // 메뉴 열림 상태 추가
  const menuRef = useRef<HTMLDivElement>(null);
  const dotButtonRef = useRef<HTMLDivElement>(null);

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

  // 명단 수정 조건 검사 함수
  const handleEditAttempt = () => {
    const now = new Date(); // 현재 로컬 시간
    const postDateKST = new Date(new Date(date).getTime() + 9 * 60 * 60 * 1000);

    if (now < postDateKST) {
      alert('아직 명단 수정을 할 수 없습니다.');
      return;
    }

    // 취소 글은 누구도 편집 불가
    if (postStatus === 'CANCELED') {
      alert('취소된 러닝은 명단을 수정할 수 없습니다.');
      return;
    }

    // ADMIN 은 CLOSED 여도 편집 허용
    if (userInfo.userRole === 'ADMIN') {
      setIsEditMode(true);
      return;
    }

    // 일반 작성자/유저는 기존 정책 유지
    if (postStatus === 'CLOSED') {
      alert('출석이 종료되어 명단 수정이 불가능합니다.');
      return;
    }

    setIsEditMode(true);
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isModalOpen]);

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-white overflow-x-hidden">
      <div className="w-full max-w-[430px] mx-auto flex flex-col items-center text-center justify-center">
        <div className="relative flex bg-kuDarkGreen w-full h-[56px] z-50 text-white text-xl font-semibold justify-center items-center">
          <img
            src={BackBtnimg}
            className="absolute left-[24px] cursor-pointer"
            onClick={handleBack}
          />
          정규런
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
              {/* 기본 메뉴: 수정하기, 취소하기 */}
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
                      navigate(`/regular/edit/${postId}`, { replace: true });
                      setShowMenu(false);
                    } else if (label === '취소하기') {
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
                          `/run/regular/post/${postId}/cancel`,
                          {},
                          { headers: { Authorization: `${token}` } }
                        );
                        if (data.isSuccess) {
                          alert('게시글이 성공적으로 취소되었습니다.');
                          setShowMenu(false);
                          navigate('/regular');
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
                  transition={{ delay: 0.3, duration: 0.2 }}
                  className="w-[100px] py-2 px-3 rounded-tl-xl rounded-b-xl bg-white shadow-md text-black text-sm"
                  onClick={async () => {
                    const confirmDelete = window.confirm(
                      '정말 게시글을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.'
                    );
                    if (!confirmDelete) return;
                    try {
                      const token = JSON.parse(localStorage.getItem('accessToken') || 'null');
                      if (!token) {
                        alert('로그인이 필요합니다.');
                        return;
                      }
                      const { data } = await customAxios.delete(`/run/regular/post/${postId}`, {
                        headers: { Authorization: `${token}` },
                      });
                      if (data.isSuccess) {
                        alert('게시글이 삭제되었습니다.');
                        setShowMenu(false);
                        navigate('/regular');
                      } else {
                        alert(data.responseMessage || '삭제에 실패했습니다.');
                      }
                    } catch (error) {
                      console.error(error);
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

        <div className="relative w-full max-w-[430px] pb-[90px]">
          <div className="relative w-full overflow-hidden">
            <img
              src={postImageUrl || flashrunimage}
              className={`w-full h-[308px] object-cover transition-all duration-300 ${
                showMenu || postStatus === 'CANCELED' || postStatus === 'CLOSED'
                  ? 'brightness-75'
                  : ''
              }`}
            />
            {(postStatus === 'CANCELED' || postStatus === 'CLOSED') && (
              <div className="absolute inset-0 flex justify-center items-center bg-opacity-40 bg-black">
                <div className="text-white text-xl font-bold bg-opacity-60 px-4 py-2 rounded">
                  {postStatus === 'CANCELED' ? '취소된 러닝입니다.' : '마감된 러닝입니다.'}
                </div>
              </div>
            )}
          </div>

          <div className="absolute top-[230px] w-full max-w-[430px] rounded-t-[20px] bg-white">
            <div className="flex flex-col items-center mt-[14px]">
              <object data={RegularRunlogo} className="w-[60px] h-[24px]" />
              <div className="text-lg font-semibold mt-2 text-[24px]">{title}</div>
            </div>
            <div className="flex flex-col items-start w-full max-w-[430px] px-5 mt-5">
              <div className="flex items-center my-1.5">
                <object data={place} className="w-[24px] h-[24px] mr-2" />
                <span>{location}</span>
              </div>
              <div className="flex items-center my-1.5">
                <object data={time} className="w-[24px] h-[24px] mr-2" />
                <span>{formatDateTime(date)}</span>
              </div>
              <div className="flex items-center my-1.5">
                <object data={people} className="w-[24px] h-[24px] mr-2" />
                <span className="font-bold text-kuDarkGreen">{participantsNum}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-[14px]">
          <TabButton leftLabel="소개" rightLabel="명단" onTabChange={handleTabChange} />
        </div>

        {activeTab === '소개' && (
          <>
            <div className="flex items-start text-left w-full  mt-3 my-2 max-w-[349px]">
              <img src={pacermark} />
              <div className="m-1">PACER</div>
            </div>
            <PacerCard pacers={pacers} />
            {attachmentUrls.length > 0 && (
              <div className="mt-5 w-[327px]">
                <div className="text-left text-[16px] mb-2">코스 사진</div>
                <Swiper
                  pagination={{ clickable: true }}
                  modules={[Pagination]}
                  spaceBetween={10}
                  slidesPerView={1}
                >
                  {attachmentUrls.map((url, index) => (
                    <SwiperSlide key={index}>
                      <div className="relative">
                        <div className="w-full max-w-[430px] h-[300px] overflow-hidden rounded-lg">
                          <img
                            src={url}
                            alt={`코스 사진 ${index + 1}`}
                            className="rounded-lg w-full max-w-[430px] h-full object-cover"
                            style={{ maxWidth: '100%', height: '300px' }}
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

        {activeTab === '명단' && (
          <>
            <AttendanceList
              groupedParticipants={groupedParticipants}
              isEditMode={isEditMode}
              editedAttendance={editedAttendance}
              toggleAttendance={toggleAttendance}
              onSaveAttendance={saveAttendanceChanges}
              onToggleEditMode={handleEditAttempt}
              userInfoName={userInfo.userName}
              postCreatorName={postCreatorName}
              canEdit={userInfo.userRole === 'ADMIN' || userInfo.userName === postCreatorName}
            />
          </>
        )}

        <CommentSection
          postId={postId!}
          postType="regular"
          userInfo={userInfo}
          refreshTrigger={refreshComments}
        />

        {/* 시작하기 버튼 */}
        <button
          className={`flex justify-center items-center w-full max-w-[327px] h-14 rounded-lg text-lg font-bold mt-[32px] mb-[100px] ${
            isFinished || postStatus === 'CLOSED'
              ? 'bg-[#ECEBE4] text-[#757575] cursor-not-allowed'
              : 'bg-[#366943] text-white'
          }`}
          onClick={handleStartClick}
          disabled={isFinished || postStatus === 'CLOSED'}
        >
          {buttonText}
        </button>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
            <div className="bg-white p-5 rounded-lg w-[280px] text-center relative">
              <button
                className="absolute top-2.5 right-2.5 text-2xl cursor-pointer"
                onClick={handleCloseModal}
              >
                ×
              </button>
              <h2>참여 코드가 생성되었습니다.</h2>
              <input
                type="text"
                className="w-full max-w-[430px] p-2 border-b border-gray-300 text-center text-lg mt-5"
                value={code}
                disabled
              />
              <div className="flex justify-between mt-5 gap-2">
                <button
                  className="w-full max-w-[430px] py-3 rounded-lg bg-[#366943] text-white text-lg"
                  onClick={handleModalStartClick}
                >
                  출석종료
                </button>
                <button
                  className="w-full max-w-[430px] py-3 rounded-lg bg-gray-300 text-gray-700"
                  onClick={handleCloseModal}
                >
                  창닫기
                </button>
              </div>
              {error && <div className="text-red-500 mt-2">{error}</div>}
            </div>
          </div>
        )}
        <TabNavigationUI_detail />
      </div>
    </div>
  );
};

export default NewRegularRunAdmin;

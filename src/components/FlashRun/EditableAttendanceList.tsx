import React, { useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import customAxios from '@shared/apis/customAxios';
import peopleimg from '@assets/people_darkgreen.svg';

interface User {
  userId: number;
  userName: string;
  userProfileImg?: string | null;
  status: 'ATTENDED' | 'PENDING' | 'ABSENT';
}

interface EditableAttendanceListProps {
  postId: string;
  runType: string;
  users: User[];
  onUsersChange: (newUsers: User[]) => void;
  onSaveComplete?: () => void;
  canEdit?: boolean;
  postStatus?: string;
  postDate?: string;
  userRole?: string;
}

const EditableAttendanceList: React.FC<EditableAttendanceListProps> = ({
  postId,
  runType,
  users,
  onUsersChange,
  onSaveComplete,
  canEdit,
  postDate,
  postStatus,
  userRole,
}) => {
  const [editMode, setEditMode] = useState(false);

  const handleToggle = (userId: number) => {
    const updated: User[] = users.map((user) =>
      user.userId === userId // 유저 아이디가 같으면
        ? {
            ...user,
            status: user.status === 'ATTENDED' ? 'PENDING' : 'ATTENDED', // 참석 상태면 대기, 대기 상태면 참석
          }
        : user
    );
    onUsersChange(updated); // 유저 상태 변경
  };

  const handleSave = async () => {
    const token = JSON.parse(localStorage.getItem('accessToken') || 'null');

    // 서버에 보낼 payload (종료 전/후 동일)
    const payload = users.map((user) => ({
      userId: user.userId,
      isAttend: user.status === 'ATTENDED',
    }));

    // 종료 여부에 따라 엔드포인트 분기
    const base = `/run/${runType}/post/${postId}`;
    const endpoint =
      postStatus === 'CLOSED' ? `${base}/fix-attendance` : `${base}/manual-attendance`;

    try {
      const { data } = await customAxios.patch(endpoint, payload, {
        headers: { Authorization: `${token}` },
      });

      if (data.isSuccess) {
        alert('명단이 저장되었습니다.');
        setEditMode(false);
        onSaveComplete?.();
      } else {
        alert(data.responseMessage || '저장에 실패했습니다.');
      }
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.');
      console.error('오류 코드', error);
    }
  };

  return (
    <div className="flex flex-col p-5 gap-3">
      {/* 상단 통계 & 버튼 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <img src={peopleimg} alt="체크 아이콘" className="w-[24px] h-[17px]" />
          <span className="text-[16px] font-semibold">
            <span className="text-kuDarkGreen">
              {users.filter((u) => u.status === 'ATTENDED').length}
            </span>{' '}
            / {users.length}
          </span>
        </div>
        {canEdit && (
          <button
            onClick={() => {
              if (!editMode) {
                // 상태 제약: ADMIN은 예외
                if (postStatus === 'CLOSED' || postStatus === 'CANCELED') {
                  if (userRole !== 'ADMIN') {
                    alert('출석이 종료되어 명단 수정이 불가능합니다.');
                    return;
                  }
                }
                // 시간 제약: ADMIN은 예외
                if (postDate) {
                  const now = new Date();
                  const kst = new Date(new Date(postDate).getTime() + 9 * 60 * 60 * 1000);
                  if (now < kst) {
                    alert('아직 명단 수정을 할 수 없습니다.');
                    return;
                  }
                }
              }
              if (editMode) {
                // editMode가 true면 명단 저장
                handleSave();
              } else {
                setEditMode(true); // editMode가 false면 명단 수정
              }
            }}
            className={`text-[12px] w-[72px] h-[24px] font-semibold rounded-[10px] ${
              editMode ? 'bg-kuDarkGreen text-white' : 'bg-kuLightGray text-kuDarkGray'
            }`}
          >
            {editMode ? '명단 저장' : '명단 수정'}
          </button>
        )}
      </div>

      {/* 유저 목록 */}
      {users.map((user, index) => {
        const isAttended = user.status === 'ATTENDED';
        const background =
          user.status === 'ATTENDED'
            ? 'bg-[#F0F4DD]' // 참석
            : user.status === 'ABSENT'
              ? 'bg-[#ECEBE4]'
              : 'bg-[#F0F4DD]'; // 대기
        return (
          <div
            key={user.userId}
            className={`flex items-center gap-3 w-[335px] h-[56px] px-4 py-2.5 rounded-lg ${background}`}
          >
            {/* 순서 */}
            <div className="w-5 text-center text-gray-500 font-semibold">{index + 1}</div>

            {/* 프로필 */}
            <div className="w-10 h-10 rounded-full bg-gray-400 text-white font-bold flex items-center justify-center overflow-hidden">
              {user.userProfileImg ? (
                <img
                  src={user.userProfileImg}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                user.userName?.charAt(0) || '?'
              )}
            </div>

            {/* 이름 */}
            <div className="flex-1 text-left">{user.userName}</div>

            {/* 상태 표시 or 토글 */}
            {editMode ? (
              <div className="cursor-pointer" onClick={() => handleToggle(user.userId)}>
                {isAttended ? (
                  <FaCheckCircle size={24} color="#4CAF50" />
                ) : (
                  <div className="w-[24px] h-[24px] border border-kuDarkGreen rounded-full"></div>
                )}
              </div>
            ) : isAttended ? (
              <FaCheckCircle size={24} color="#4CAF50" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export default EditableAttendanceList;

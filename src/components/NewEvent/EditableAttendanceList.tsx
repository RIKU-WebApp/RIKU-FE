import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import customAxios from '@/shared/lib/customAxios';
import peopleimg from '@assets/people_darkgreen.svg';

interface User {
  userId: number;
  userName: string;
  userProfileImg?: string | null;
  status: 'ATTENDED' | 'PENDING' | 'ABSENT';
  canEdit: string;
}

export interface EditableAttendanceListHandle {
  saveAttendance: () => Promise<void>;
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

const EditableAttendanceList = forwardRef<
  EditableAttendanceListHandle,
  EditableAttendanceListProps
>(
  (
    {
      postId,
      runType,
      users,
      onUsersChange,
      onSaveComplete,
      canEdit,
      postStatus,
      postDate,
      userRole,
    },
    ref
  ) => {
    const [editMode, setEditMode] = useState(false);

    const handleToggle = (userId: number) => {
      const updated = users.map((user) => {
        if (user.userId !== userId) return user;

        const next = user.status === 'ATTENDED' ? 'ABSENT' : 'ATTENDED';
        return { ...user, status: next };
      });
      onUsersChange(updated);
    };

    const handleSave = async () => {
      const token = localStorage.getItem('accessToken') || 'null';

      const payload = users.map((u) => ({
        userId: u.userId,
        isAttend: u.status === 'ATTENDED',
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
      } catch {
        alert('저장 중 오류가 발생했습니다.');
      }
    };

    useImperativeHandle(ref, () => ({
      saveAttendance: handleSave,
    }));

    const handleEditOrSaveClick = () => {
      if (!editMode) {
        // 종료/취소 상태: ADMIN만 편집 허용
        if (postStatus === 'CLOSED' || postStatus === 'CANCELED') {
          if (userRole !== 'ADMIN') {
            alert('출석이 종료되어 명단 수정이 불가능합니다.');
            return;
          }
        } else {
          // 시작 전 일반 사용자 편집 제한
          if (postDate) {
            const now = new Date();
            const postKST = new Date(new Date(postDate).getTime() + 9 * 60 * 60 * 1000);
            if (now < postKST) {
              alert('아직 명단 수정을 할 수 없습니다.');
              return;
            }
          }
        }
        setEditMode(true);
      } else {
        handleSave();
      }
    };

    const attendedCount = users.filter((u) => u.status === 'ATTENDED').length;

    return (
      <div className="flex flex-col p-5 gap-3">
        {/* 상단 인원 수 */}
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

          {(canEdit || userRole === 'ADMIN') && (
            <button
              onClick={handleEditOrSaveClick} // 변경
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
          const backgroundClass =
            user.status === 'ATTENDED'
              ? 'bg-[#F0F4DD]' // 연두색
              : user.status === 'ABSENT'
                ? 'bg-[#ECEBE4]'
                : 'bg-[#F0F4DD]';

          return (
            <div
              key={user.userId}
              className={`flex items-center gap-3 w-[335px] h-[56px] px-4 py-2.5 rounded-lg ${backgroundClass}`}
            >
              {/* 순번 */}
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

              {/* 상태 아이콘 */}
              {editMode ? (
                <div className="cursor-pointer" onClick={() => handleToggle(user.userId)}>
                  {user.status === 'ATTENDED' ? (
                    <FaCheckCircle size={24} color="#4CAF50" />
                  ) : (
                    <div className="w-[24px] h-[24px] border rounded-full border-[#366943]" />
                  )}
                </div>
              ) : user.status === 'ATTENDED' ? (
                <FaCheckCircle size={24} color="#4CAF50" />
              ) : null}
            </div>
          );
        })}
      </div>
    );
  }
);

export default EditableAttendanceList;

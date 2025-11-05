import React, { useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { BsCircle } from 'react-icons/bs';
import customAxios from '@/shared/lib/customAxios';

interface User {
  userId: number;
  userName: string;
  userProfileImg?: string | null;
  status: 'ATTENDED' | 'PENDING';
}

interface EditableAttendanceListProps {
  postId: string;
  runType: string;
  users: User[];
  onUsersChange: (newUsers: User[]) => void;
  onSaveComplete?: () => void;
}

const EditableAttendanceList: React.FC<EditableAttendanceListProps> = ({
  postId,
  runType,
  users,
  onUsersChange,
  onSaveComplete,
}) => {
  const [editMode, setEditMode] = useState(false);

  const handleToggle = (userId: number) => {
    const updated = users.map((user) =>
      user.userId === userId
        ? {
            ...user,
            status: user.status === 'ATTENDED' ? 'PENDING' : 'ATTENDED',
          }
        : user
    );
    onUsersChange(updated as User[]);
  };

  const handleSave = async () => {
    const token = JSON.parse(localStorage.getItem('accessToken') || 'null');

    // status를 확실하게 명시해줘야 타입 에러 방지됨
    const payload = users.map((user) => ({
      userId: user.userId,
      isAttend: user.status === 'ATTENDED',
    }));

    try {
      const response = await customAxios.patch(
        `/run/${runType}/post/${postId}/manual-attend`,
        payload,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.data.isSuccess) {
        alert('명단이 저장되었습니다.');
        setEditMode(false);
        if (onSaveComplete) onSaveComplete();
      } else {
        alert(response.data.responseMessage);
      }
    } catch {
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="flex flex-col p-5 gap-3">
      {/* 상단 통계 & 버튼 */}
      <div className="flex justify-between items-center">
        <span className="text-[16px] text-kuDarkGreen font-semibold">
          {users.filter((u) => u.status === 'ATTENDED').length} / {users.length}
        </span>
        <button
          onClick={() => {
            if (editMode) {
              handleSave();
            } else {
              setEditMode(true);
            }
          }}
          className={`px-3 py-1 text-sm font-semibold rounded ${
            editMode ? 'bg-kuDarkGreen text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {editMode ? '명단 저장' : '명단 수정'}
        </button>
      </div>

      {/* 유저 목록 */}
      {users.map((user, index) => {
        const isAttended = user.status === 'ATTENDED';
        const background = isAttended ? 'bg-[#F0F4DD]' : 'bg-[#ECEBE4]';

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
                user.userName.charAt(0)
              )}
            </div>

            {/* 이름 */}
            <div className="flex-1 text-left">{user.userName}</div>

            {/* 상태 표시 or 토글 */}
            {editMode ? (
              <div className="cursor-pointer" onClick={() => handleToggle(user.userId)}>
                {isAttended ? (
                  <FaCheckCircle size={20} color="#4CAF50" />
                ) : (
                  <BsCircle size={20} color="#aaa" />
                )}
              </div>
            ) : isAttended ? (
              <FaCheckCircle size={20} color="#4CAF50" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export default EditableAttendanceList;

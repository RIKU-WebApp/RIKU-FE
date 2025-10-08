import React from 'react';
import peopleimg from '../../assets/people_darkgreen.svg';
import checkicon from '../../assets/checkedicon.svg';

interface Participant {
  userId: number;
  userName: string;
  userProfileImg?: string | null;
  status: 'ATTENDED' | 'PENDING' | string;
}

interface GroupedParticipants {
  group: string;
  participants: Participant[];
}

interface AttendanceListProps {
  groupedParticipants: GroupedParticipants[];
  isEditMode?: boolean;
  editedAttendance?: { [userId: number]: boolean };
  toggleAttendance?: (userId: number, originalStatus: string) => void;
  onSaveAttendance?: () => void;
  onToggleEditMode?: () => void;
  userInfoName: string;
  postCreatorName: string;
  userRole?: string;
  postStatus?: string;
}

const AttendanceList: React.FC<AttendanceListProps> = ({
  userInfoName,
  postCreatorName,
  groupedParticipants = [],
  isEditMode = false,
  editedAttendance = {},
  toggleAttendance = () => {},
  onSaveAttendance = () => {},
  onToggleEditMode = () => {},
  userRole,
  postStatus,
}) => {
  const allParticipants = (groupedParticipants || []).flatMap((group) => group.participants);

  const validParticipants = allParticipants.filter(
    (user) => user.status === 'ATTENDED' || user.status === 'PENDING'
  );

  const realTimeCheckedCount = validParticipants.filter((user) => {
    if (user.userId in editedAttendance) return editedAttendance[user.userId];
    return user.status === 'ATTENDED';
  }).length;

  const originalAttendedCount = allParticipants.filter((user) => user.status === 'ATTENDED').length;
  const originalPendingCount = validParticipants.filter((user) => user.status === 'PENDING').length;
  const totalCount = allParticipants.filter(
    (user) => user.status === 'PENDING' || user.status === 'ATTENDED' || user.status === 'ABSENT'
  ).length;
  return (
    <div className="flex flex-col gap-3 px-5 mt-[22px]">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center text-sm font-medium text-[#366943] gap-1">
          <img src={peopleimg} alt="people icon" className="w-[24px] h-[17px]" />
          {isEditMode ? (
            <span className="text-[16px]">
              <span className="text-kuDarkGreen font-bold">{realTimeCheckedCount}</span>
              <span className="text-black"> / {totalCount}</span>
            </span>
          ) : (
            <span className="text-[16px]">
              <span className="text-kuDarkGreen font-bold">{originalAttendedCount} </span>
              <span className="text-black">/ {totalCount}</span>
            </span>
          )}
        </div>

        {/* 작성자인 경우에만 명단 수정/저장 버튼 노출 */}
        {(userRole === 'ADMIN' || userInfoName === postCreatorName) &&
          (postStatus !== 'CLOSED' || userRole === 'ADMIN') && (
            <button
              className={`text-[12px] w-[72px] h-[24px] font-semibold rounded-[10px] ${isEditMode ? 'bg-kuDarkGreen text-white' : 'bg-kuLightGray text-kuDarkGray'}`}
              onClick={isEditMode ? onSaveAttendance : onToggleEditMode}
            >
              {isEditMode ? '명단 저장' : '명단 수정'}
            </button>
          )}
      </div>

      {groupedParticipants.map((group) =>
        group.participants.length === 0 ? (
          <div key={group.group} className="flex items-start gap-2.5">
            <div className="w-[30px] font-bold text-gray-600 pt-2">{group.group}</div>
            <div className="text-sm text-gray-400">참가자가 없습니다.</div>
          </div>
        ) : (
          group.participants.map((user, index) => {
            const isChecked =
              user.userId in editedAttendance
                ? editedAttendance[user.userId]
                : user.status === 'ATTENDED';

            const backgroundColor = isEditMode
              ? isChecked
                ? 'bg-[#F0F4DD]'
                : 'bg-[#ECEBE4]'
              : user.status === 'ATTENDED' || user.status === 'PENDING'
                ? 'bg-[#F0F4DD]'
                : 'bg-[#ECEBE4]';

            return (
              <div
                key={user.userId || `user-${index}`}
                className="flex items-center ml-[4px] justify-center w-full "
              >
                {index === 0 ? (
                  <div className="w-[30px] font-bold text-gray-600 pr-[20.54px]">{group.group}</div>
                ) : (
                  <div className="w-[30px]" />
                )}

                <div
                  className={`flex items-center gap-2.5 w-[288px] h-[52px] px-4 py-2.5 rounded-lg text-base font-medium ${backgroundColor}`}
                >
                  <div className="flex items-center gap-2 ">
                    <div className="w-[36px] h-[36px] text-[14.4px] rounded-full overflow-hidden flex justify-center items-center bg-gray-400 text-white font-bold">
                      {user.userProfileImg ? (
                        <img
                          src={user.userProfileImg}
                          alt={`${user.userName} profile`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{user.userName?.charAt(0) || '?'}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 ml-1 text-left text-[16px]">{user.userName}</div>

                  {isEditMode ? (
                    <div
                      onClick={() => toggleAttendance(user.userId, user.status)}
                      className={`w-6 h-6 rounded-full border-[1px] flex items-center justify-center cursor-pointer transition-all duration-150 ${
                        isChecked
                          ? 'border-green-600 bg-green-500'
                          : 'border-green-700 bg-transparent'
                      }`}
                    >
                      {isChecked && <img src={checkicon}></img>}
                    </div>
                  ) : (
                    isChecked && (
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <img src={checkicon}></img>
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })
        )
      )}
    </div>
  );
};

export default AttendanceList;

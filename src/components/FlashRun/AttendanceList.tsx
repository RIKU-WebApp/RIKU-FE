// import React from "react";
// import { User } from "./types"; // User 타입 import

// interface AttendanceListProps {
//     users: User[];
// }

// const AttendanceList: React.FC<AttendanceListProps> = ({ users }) => {
//     return (
//         <div className="flex flex-col gap-2.5 p-5">
//             {users.map((user, index) => (
//                 <div
//                     key={user.id}
//                     className={`flex items-center gap-2.5 w-[335px] h-[57px] px-4 py-2.5 rounded-lg text-base font-medium ${
//                         user.isPresent ? "bg-[#F0F4DD]" : "bg-[#ECEBE4]"
//                     }`}
//                 >
//                     {/* 순서 표시 */}
//                     <div className="font-bold text-base text-gray-600 mr-2.5 flex justify-center items-center w-5 text-center">
//                         {index + 1}
//                     </div>
//                     {/* 프로필 이미지 또는 대체 아이콘 */}
//                     <div className="w-10 h-10 rounded-full overflow-hidden flex justify-center items-center bg-gray-400 text-white text-lg font-bold">
//                         {user.profileImage ? (
//                             <img
//                                 src={user.profileImage}
//                                 alt={`${user.name} profile`}
//                                 className="w-full h-full object-cover"
//                             />
//                         ) : (
//                             <div className="bg-gray-600 w-full h-full flex justify-center items-center rounded-full">
//                                 {user.name.charAt(0)}
//                             </div>
//                         )}
//                     </div>
//                     {/* 이름 */}
//                     <div className="flex-1 text-left">{user.name}</div>
//                     {/* 상태 아이콘 */}
//                     {user.isPresent && (
//                         <div className="flex justify-center items-center">
//                             <svg
//                                 xmlns="http://www.w3.org/2000/svg"
//                                 fill="#4CAF50"
//                                 viewBox="0 0 24 24"
//                                 width="24px"
//                                 height="24px"
//                             >
//                                 <path d="M20.29 5.3a1 1 0 0 0-1.41 0l-9.17 9.17-3.17-3.17a1 1 0 1 0-1.41 1.41l4 4a1 1 0 0 0 1.41 0l10-10a1 1 0 0 0 0-1.41z" />
//                             </svg>
//                         </div>
//                     )}
//                 </div>
//             ))}
//         </div>
//     );
// };

// export default AttendanceList;

// // 참석자 데이터를 정의하는 타입
// interface User {
//     id: number; // 유저 고유 ID
//     name: string; // 유저 이름
//     profileImage: string | null; // 프로필 이미지 (null이면 대체 표시)
//     isPresent: boolean; // 참석 여부
// }

// 기존 코드

import React from "react";

interface AttendanceListProps {
  users: {
    userId: number;
    userName: string | undefined; // name이 undefined일 수 있으므로 타입 정의
    profileImage?: string | null;
    status: string;
  }[];
}

const AttendanceList: React.FC<AttendanceListProps> = ({ users }) => {
  console.log(users)
  return (
    <div className="flex flex-col gap-2.5 p-5">
      {users.map((user, index) => (
    <div
        key={user.userId || `user-${index}`} // user.id가 없으면 index를 사용해 고유한 key 생성
        className={`flex items-center gap-2.5 w-[335px] h-[57px] px-4 py-2.5 rounded-lg text-base font-medium ${
        user.status === "ATTENDED" ? "bg-[#F0F4DD]" : "bg-[#ECEBE4]"
        }`}
    >
        {/* 순서 표시 */}
        <div className="font-bold text-base text-gray-600 mr-2.5 flex justify-center items-center w-5 text-center">
        {index + 1}
        </div>
        {/* 프로필 이미지 또는 대체 아이콘 */}
        <div className="w-10 h-10 rounded-full overflow-hidden flex justify-center items-center bg-gray-400 text-white text-lg font-bold">
        {user.profileImage ? (
            <img
            src={user.profileImage}
            alt={`${user.userName || "Unknown"} profile`}
            className="w-full h-full object-cover"
            />
        ) : (
            <div className="bg-gray-600 w-full h-full flex justify-center items-center rounded-full">
            {user.userName?.charAt(0) || "?"}
            </div>
        )}
        </div>
        {/* 이름 */}
        <div className="flex-1 ml-2 text-left">{user.userName || "이름 없음"}</div>
        {/* 상태 아이콘 */}
        {user.status && (
        <div className="flex justify-center items-center">
            <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="#4CAF50"
            viewBox="0 0 24 24"
            width="24px"
            height="24px"
            >
            <path d="M20.29 5.3a1 1 0 0 0-1.41 0l-9.17 9.17-3.17-3.17a1 1 0 1 0-1.41 1.41l4 4a1 1 0 0 0 1.41 0l10-10a1 1 0 0 0 0-1.41z" />
            </svg>
        </div>
        )}
    </div>
))}


    </div>
  );
};

export default AttendanceList;


import React from "react";
import './AttendanceList.css';
import { User } from "./types"; // User 타입 import

interface AttendanceListProps {
    users: User[];
}

const AttendanceList: React.FC<AttendanceListProps> = ({ users }) => {
    return (
        <div className="attendance-list">
            {users.map((user, index) => (
                <div
                    key={user.id}
                    className={`attendance-item ${user.isPresent ? "present" : "absent"}`}
                >
                    <div className="order-number">{index + 1}</div> {/* 순서 표시 */}
                    <div className="profile-container">
                        {user.profileImage ? (
                            <img
                                src={user.profileImage}
                                alt={`${user.name} profile`}
                                className="profile-image"
                            />
                        ) : (
                            <div className="profile-placeholder">
                                {user.name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="name">{user.name}</div>
                    {user.isPresent && (
                        <div className="status-icon">
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

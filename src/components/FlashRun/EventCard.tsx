import React from 'react';
import flashrunimage from '../../assets/Run-img/flashrunimage.svg';
import runargent from '../../assets/Run-img/run-urgent.svg';

interface EventCardProps {
    title: string;
    date: string;
    people: string;
    status?: string;
    imageSrc?: string;
    path?: string;
    onClick?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ title, date, people, status, imageSrc, path, onClick }) => {
    return (
        <div
            className="flex justify-between items-start w-[327px] h-[225px] border border-gray-300 rounded-lg shadow-md relative mb-7 cursor-pointer"
            onClick={onClick}
        >
            {/* 왼쪽 섹션 */}
            <div className="flex flex-col p-2.5 self-start">
                <div className="text-black text-xl font-bold">{title}</div>
                <div className="text-base">{date}</div>
            </div>

            {/* 오른쪽 섹션 */}
            <div className="flex flex-col p-2.5 self-start text-right">
                <div className="mb-1">{people}</div>
                <div className="mb-1">
                    <img src={runargent} alt="runstate" className="w-74.2px h-32px inline-block " />
                </div>
            </div>

            {/* 하단 이미지 */}
            <img
                src={imageSrc || flashrunimage}
                alt={title}
                className="absolute bottom-0 left-0 w-full h-[144px] object-cover rounded-b-lg"
            />
        </div>
    );
};

export default EventCard;

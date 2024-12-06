import React from "react";
import flashrunimage from "../../assets/Run-img/flashrunimage.jpg";
import runargent from "../../assets/Run-img/run-urgent.svg";
import runInprog from "../../assets/Run-img/run-InProgress.svg";
import runclosed from "../../assets/Run-img/run-closed.svg";

interface EventCardProps {
  id?: number;
  title: string;
  date?: string;
  status: string;
  time?: string;
  imageUrl?: string;
  onClick?: () => void;
  onDelete?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  date,
  status = "closed",
  time,
  imageUrl,
  onClick,
  onDelete,
}) => {
  const statusImages: Record<string, string> = {
    argent: runargent,
    prog: runInprog,
    closed: runclosed,
  };

  // 디버깅용 로그 추가
  console.log("EventCard status:", status);
  if (!statusImages[status]) {
    console.error(`Invalid status: '${status}'`);
    console.warn(
      "유효하지 않은 status 값입니다. 'closed'로 기본값을 사용합니다."
    );
  }

  return (
    <div
      className="flex justify-between items-start w-[327px] h-[225px] border-color-#F5F5F5 rounded-lg shadow-2xl relative mb-7 cursor-pointer border"
      onClick={onClick}
    >
      <div className="flex flex-col m-1 items-start">
        <div className="text-black text-xl font-bold m-0">{title}</div>
        <div className="text-base m-0 text-kuCoolGray font-medium">{date}</div>
        <div className="m-0">{time}</div>
      </div>
      <div className="flex flex-col self-start text-right ml-1">
        <div className="mt-2">
          <img
            src={statusImages[status] || runclosed} // 유효하지 않은 값에 대해 기본값 사용
            alt={status}
            className="ml-1 w-74.2px h-32px inline-block"
          />
        </div>
        {/* <button
          onClick={onDelete}
          className="bg-red-500 text-white rounded-md px-2 py-1 w-[70px] h-9"
        >
          삭제
        </button> */}
      </div>
      <img
        src={imageUrl || flashrunimage}
        alt={title}
        className="absolute bottom-0 left-0 w-full h-[144px] object-cover rounded-b-lg"
      />
    </div>
  );
};

export default EventCard;

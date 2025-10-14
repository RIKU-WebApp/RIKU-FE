import RunInProgress from './assets/Run-img/run-InProgress.svg';
import RunprogCircle from './assets/Run-img/run-circle.svg';
import runcircleargent from './assets/Run-img/runcircle-argent.svg';
import runcircleclosed from './assets/Run-img/runcircle-closed.svg';
import runclosedstatus from './assets/Run-img/run-closed.svg';
import runargetstatus from './assets/Run-img/run-urgent.svg';
import { useNavigate } from 'react-router-dom';
import React from 'react';

interface ContentListProps {
  location?: string;
  path: string;
  eventName?: string;
  run_date?: string;
  onClick?: () => void;
  imgurl?: string;
  circleimg?: string;
  statusimg?: string;
  poststatus?: string;
}

const ContentList: React.FC<ContentListProps> = ({
  imgurl,
  location,
  path,
  eventName,
  run_date,
  poststatus = 'CLOSED',
}) => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(path);
  };

  const getCircleSrc = (status: string) => {
    if (status === 'NOW') {
      return RunprogCircle;
    } else if (status === 'CLOSED') {
      return runcircleclosed;
    } else if (status === 'CLOSING') {
      return runcircleargent;
    }
  };

  const getstatusbox = (status: string) => {
    if (status === 'NOW') {
      return RunInProgress;
    } else if (status === 'CLOSED') {
      return runclosedstatus;
    } else if (status === 'CLOSING') {
      return runargetstatus;
    }
  };

  function shortenText(text: string, maxLength: number = 6): string {
    //text 일정 글자 넘으면 자르는 함수
    if (text.length <= maxLength) {
      return text; // 문자열이 7글자 이하일 경우 그대로 반환
    }
    return `${text.slice(0, 3)}...`; // 앞의 3글자와 '...' 반환
  }

  return (
    <div className="mt-2.5 flex flex-col items-center justify-center">
      <div className="w-full text-left text-xl font-bold mb-1 ml-6">{eventName}</div>
      <div className="relative" onClick={handleClick}>
        <img src={imgurl} className="brightness-[0.7]" onClick={handleClick} />
        <img
          src={getCircleSrc(poststatus)}
          onClick={handleClick}
          className="absolute w-[160px] h-[160px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        />
        <object
          data={getstatusbox(poststatus)}
          onClick={handleClick}
          className="absolute left-[28%] top-[55%]"
        />
        <div
          className="absolute top-[35%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-base font-bold"
          onClick={handleClick}
        >
          {shortenText(location ?? 'Unknown', 6)}
          {/* ts는 undefined인 경우 striong으로 처리 불가능해서 써놓음 */}
        </div>
        <div
          className="absolute top-[47%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-base"
          onClick={handleClick}
        >
          {run_date}
        </div>
      </div>
    </div>
  );
};

export default ContentList;

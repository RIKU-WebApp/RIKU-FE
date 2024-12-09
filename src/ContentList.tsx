import RunImage from './assets/Run-img/run-image.svg';
import RunCircle from './assets/Run-img/run-circle.svg';
import RunInProgress from './assets/Run-img/run-InProgress.svg';
import RunprogCircle from './assets/Run-img/run-circle.svg'
import runcircleargent from './assets/Run-img/runcircle-argent.svg';
import runcircleclosed from './assets/Run-img/runcircle-closed.svg'
import runclosedstatus from './assets/Run-img/run-closed.svg'
import runargetstatus from './assets/Run-img/run-urgent.svg'
import { useNavigate } from 'react-router-dom';
import React from 'react';

interface ContentListProps {
    location?: string;
    path: string;
    eventName?: string;
    run_date?: string;
    onClick?: () => void;
    imgurl?:string
    circleimg?:string,
    statusimg?:string,
    poststatus?:string,
}

const ContentList: React.FC<ContentListProps> = ({ imgurl, location, path, eventName, run_date, circleimg, statusimg, poststatus='CLOSED' }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(path);
    };

    return (
        <div className="mt-2.5 flex flex-col items-center justify-center">
            <div className="w-full text-left text-xl font-bold mb-1 ml-6">
                {eventName}
            </div>
            <div className="relative" onClick={handleClick}>
                <img
                    src={imgurl}
                    alt="runimage"
                    className="brightness-[0.7]"
                />
                <img
                    src={
                        poststatus === 'NOW'
                            ? RunprogCircle
                            : poststatus === 'CLOSED'
                            ? runcircleclosed
                            : poststatus === 'CLOSING'
                            ? runcircleargent
                            : ""
                    }
                    alt="runcircle"
                    className="absolute w-[160px] h-[160px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                />
                <img
                    src={poststatus === 'NOW'
                        ? RunInProgress
                        : runargetstatus
                    }
                    alt="statusbox"
                    className="absolute left-[28%] top-[55%]"
                />
                <div className="absolute top-[35%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-base font-bold">
                    {location}
                </div>
                <div className="absolute top-[47%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-base">
                    {run_date}
                </div>
            </div>
        </div>
    );
};

export default ContentList;

import RunImage from '../../assets/Run-img/run-image.svg';
import RunCircle from '../../assets/Run-img/run-circle.svg';
import RunInProgress from '../../assets/Run-img/run-InProgress.svg';
import { useNavigate } from 'react-router-dom';
import React from 'react';

interface ContentListProps {
    name: string;
    path: string;
    run_name: string;
    run_date: string;
    onClick?: () => void;
}

const ContentList: React.FC<ContentListProps> = ({ name, path, run_name, run_date }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(path);
    };

    return (
        <div className="mt-2.5 flex flex-col items-center justify-center">
            <div className="w-full text-left text-xl font-bold mb-1 ml-6">
                {name}
            </div>
            <div className="relative" onClick={handleClick}>
                <img
                    src={RunImage}
                    alt="runimage"
                    className="brightness-[0.7]"
                />
                <img
                    src={RunCircle}
                    alt="runcircle"
                    className="absolute w-[160px] h-[160px] left-0"
                />
                <img
                    src={RunInProgress}
                    alt="runinprogress"
                    className="absolute left-[28%] top-[55%]"
                />
                <div className="absolute top-[35%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-base font-bold">
                    {run_name}
                </div>
                <div className="absolute top-[47%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-base">
                    {run_date}
                </div>
            </div>
        </div>
    );
};

export default ContentList;
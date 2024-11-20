import './ContentList.css';
import RunImage from '../../assets/Run-img/run-image.svg';
import RunCircle from '../../assets/Run-img/run-circle.svg';
import RunInProgress from '../../assets/Run-img/run-InProgress.svg';
import { useNavigate } from 'react-router-dom';
import React from 'react';


interface ContentListProps {
    name: string;
    path: string;
    run_name:string;
    run_date:string;
    onClick?: () => void;

}

const ContentList: React.FC<ContentListProps> = ({ name, path, run_name, run_date }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(path);
    };

    return (
        <div className='container' >
            <div className='run-title'>
                {name}
            </div>
            <div className='image-Wrapper' onClick={handleClick}>
                <img src={RunImage} alt='runimage' className='content-image' />
                <img src={RunCircle} alt='runcircle' className='circle-image' />
                <img src={RunInProgress} alt='runinprogress' className='progress-image' />
                <div className='mapname'>{run_name}</div>
                <div className='day'>{run_date}</div>
            </div>
        </div>
    );
}

export default ContentList;

import './ContentList.css';
import RunImage from '../assets/Run/run-image.svg';
import RunCircle from '../assets/Run/run-circle.svg';
import RunInProgress from '../assets/Run/run-InProgress.svg';
import { useNavigate } from 'react-router-dom';
import React from 'react';


interface ContentListProps {
    name: string;
    path: string;
    onClick?: () => void;

}

const ContentList: React.FC<ContentListProps> = ({ name, path }) => {
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
                <div className='mapname'>반포한강</div>
                <div className='day'>8/13 수요일</div>
            </div>
        </div>
    );
}

export default ContentList;

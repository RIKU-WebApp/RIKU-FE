import './Main.css';
import ContentList from './ContentList.tsx';
import toplogo from '../assets/Main/toplogo.svg';
import RikuMainPhoto from '../assets/Main/RikuMainPhoto.svg';
import NavBar from './NavBar.tsx';
import React from 'react';
import { useNavigate } from 'react-router-dom';




const Main: React.FC = () => {

    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate('/flash-run/user');
    };

    return(
    <>
    <div className='main-container'>
        <img src={toplogo} alt='Riku-logo'/>
    </div>
    <div className='main-photo'>
        <img src={RikuMainPhoto} alt='rikumain'/>
    </div>
    <div className='content-Wrapper'>
        <div className='content-container'>
            <ContentList name='정규런' path='/run' />
            <ContentList name='번개런' path='/flash-run' onClick={handleCardClick}/>
            <ContentList name='훈련' path='/training'/>
            <ContentList name='행사' path='/event'/>
        </div>
    </div>
    <div className='footer'>
        <NavBar/>
    </div>
    </>
    );
}

export default Main;
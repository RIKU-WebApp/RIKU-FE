import './Main.css';
import ContentList from './ContentList';
import toplogo from '../../assets/Main-img/toplogo.svg';
import RikuMainPhoto from '../../assets/Main-img/RikuMainPhoto.svg';
import NavBar from '../NavBar'
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
            <ContentList name='정규런' path='/run' run_name='다음학기에~' run_date='...' />
            <ContentList name='번개런' path='/flash-run' onClick={handleCardClick} run_name='일감호'run_date='11/10 일요일'/>
            <ContentList name='훈련' path='/training' run_name='주말훈련'run_date='11/15'/>
            <ContentList name='행사' path='/event' run_name='행사X' run_date='...'/>
        </div>
    </div>
    <div className='footer'>
        <NavBar/>
    </div>
    </>
    );
}

export default Main;
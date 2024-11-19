import React from "react";
import { useNavigate } from "react-router-dom";
import EventCard from "./EventCard";
import BackIcon from '../../assets/Main/back-icon.svg';



const FlashRunList: React.FC = () => {
    const navigate = useNavigate();

    const handleCardClickUser = () => {
        navigate('/flash-run/user');
    };

    const handleCardClickAdmin = () => {
        navigate('/flash-run/admin');
    };

    const handleCardClickTest = () => {
        navigate('/flash-run/test');
    };

    const containerStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        textAlign: 'center'
    };

    const topBarStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', // 제목을 중앙에 정렬
        width: '100%',
        maxWidth: '600px', // 필요에 따라 조절
        padding: '0 20px',
        marginBottom: '20px',
        position: 'relative' // 버튼 위치를 위한 상대 포지션
    };

    const titleStyle: React.CSSProperties = {
        margin: '20px',
        fontSize: '24px',
        fontWeight: '600'
    };

    const buttonStyle: React.CSSProperties = {
        position: 'absolute',
        left: '160px', // 제목의 왼쪽 가장자리에 버튼 위치
        background: 'none',
        border: 'none',
        cursor: 'pointer'
    };

    const imgStyle: React.CSSProperties = {
        width: '24px',
        height: '24px'
    };

    return (
        <div style={containerStyle}>
            <div style={topBarStyle}>
                <button
                    onClick={() => navigate(-1)}
                    style={buttonStyle}
                    aria-label="뒤로가기"
                >
                    <img src={BackIcon} alt="뒤로가기" style={imgStyle} />
                </button>
                <div style={titleStyle}>번개런</div>
            </div>

            <div className="content">
                <EventCard title={'관리자 test'} date={'7/28 월요일'} people={'11 / 0'} status={'마감임박'} path="/flash-run/admin" onClick={handleCardClickAdmin}/>
                <EventCard title={'사용자 test'} date={'7/28 월요일'} people={'11 / 0'} status={'마감임박'} path="/flash-run/user" onClick={handleCardClickUser}/>
                <EventCard title={'컴포넌트 test'} date={'7/28 월요일'} people={'11 / 0'} status={'마감임박'} path="/flash-run/test" onClick={handleCardClickTest}/>
                <EventCard title={'서울숲'} date={'7/28 월요일'} people={'11 / 0'} status={'마감임박'} />
            </div>

            
        </div>
    );
};

export default FlashRunList;

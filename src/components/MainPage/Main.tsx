import React from 'react';
import ContentList from './ContentList';
import toplogo from '../../assets/Main-img/toplogo.svg';
import RikuMainPhoto from '../../assets/Main-img/RikuMainPhoto.svg';
import NavBar from '../NavBar';
import { useNavigate } from 'react-router-dom';

const Main: React.FC = () => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate('/flash-run/user');
  };

  return (
    <>
      <div className="flex flex-col items-center my-2.5">
        <img src={toplogo} alt="Riku-logo" />
      </div>
      <div className="flex flex-col items-center">
        <img src={RikuMainPhoto} alt="rikumain" />
      </div>
      <div className="flex flex-col items-center justify-center pb-24">
        <div className="grid grid-cols-2 grid-rows-2 w-[375px] mt-7 gap-0 justify-center content-center">
          <ContentList
            name="정규런"
            path="/run"
            run_name="다음학기에~"
            run_date="..."
          />
          <ContentList
            name="번개런"
            path="/flash-run"
            onClick={handleCardClick}
            run_name="일감호"
            run_date="11/10 일요일"
          />
          <ContentList
            name="훈련"
            path="/training"
            run_name="주말훈련"
            run_date="11/15"
          />
          <ContentList
            name="행사"
            path="/event"
            run_name="행사X"
            run_date="..."
          />
        </div>
      </div>
      <div className="fixed bottom-0 w-full">
        <NavBar />
      </div>
    </>
  );
};

export default Main;

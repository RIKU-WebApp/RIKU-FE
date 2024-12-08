import React, { useState } from 'react';
import riku_logo from '../../assets/riku_logo.png'; //라이쿠 로고 불러오기
import { Link, useNavigate } from 'react-router-dom'; // Link 컴포넌트 import
import profile_Img from '../../assets/marathon_finisher.png'; //이미지 불러오기
import rightArrow_Icon from '../../assets/right_arrow.svg'; //라이쿠 로고 불러오기

//랭킹 페이지
function RankingPage() {

  return (
    <div>
        <span className="text-xl">랭킹 페이지입니다!</span>
        <span className="text-xl">열심히 준비중입니다~</span>
    </div>

  )
}

export default RankingPage;
import React, { useState } from 'react';
import riku_logo from '../../assets/riku_logo.png'; //라이쿠 로고 불러오기
import { Link, useNavigate } from 'react-router-dom'; // Link 컴포넌트 import
import profile_Img from '../../assets/marathon_finisher.png'; //이미지 불러오기
import rightArrow_Icon from '../../assets/right_arrow.svg'; //라이쿠 로고 불러오기

// 재사용 가능한 버튼 컴포넌트
function renderButton(text: string, iconSrc: string, onClick: () => void) {
  return (
    <button onClick={onClick} className="w-full flex justify-between items-center p-4">
      <span className="text-xl font-normal text-gray-800">{text}</span>
      <img src={iconSrc} alt="Right Arrow Icon" className="h-5 w-5" />
    </button>
  );
}

//로그인 페이지
function MyPage() {

  const navigate = useNavigate(); //useNavigate 훅을 사용해 navigate 함수 생성

  //로그인 버튼을 눌렀을 때 수행해야 할 로직을 담은 함수 (추후 로그인 API 연동 예정)
  function handleLoginClick()
  {
    navigate('/schedule-page'); //버튼 클릭 시 '/schedule-page'로 이동
  }

  // 버튼 클릭 시 수행할 함수
  function handleNoticeClick()
  {
    alert("열심히 기능 준비중입니다!");
  };

  //마이페이지에 표시할 유저의 정보를 저장하는 state(서버에서 받아와서 해당 정보를 업데이트할 예정)
  const [userInfo, setUserInfo] = useState({"name": "허준호", "role": "운영진", "point": 600, "attendEventCount": 15});

  
  //Tailwind를 사용하여 스타일링 진행
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-white p-4">
      <div className="w-full max-w-sm text-left mt-6 mb-6">
        <span className="text-2xl font-bold">마이페이지</span>
      </div>
      <div className="bg-gray-50 p-6 rounded-xl w-full max-w-sm shadow-lg">

        {/*프로필 이미지와 이름 섹션*/}
        <div className="flex items-center mb-4">
          <img src={profile_Img} alt="Profile" className="w-16 h-16 rounded-full mr-4"/>
          <div className="text-start">
            <p className="text-lg font-semibold text-gray-800">{userInfo.name}</p>
            <p className="text-sm text-gray-500">{userInfo.role}</p>
          </div>
          <button 
            className="ml-auto px-4 py-1 text-sm bg-green-600 text-white rounded-lg hover hover:bg-green-900 transition" 
            onClick={handleNoticeClick}>
              프로필 수정
          </button>
        </div>
        
        {/* 포인트와 활동 내역 섹션 */}
        <div className="flex justify-around mt-6 pt-4 border-t-2">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{userInfo.point}</p>
            <p className="text-sm text-gray-500">포인트</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{userInfo.attendEventCount}</p>
            <p className="text-sm text-gray-500">활동 내역</p>
          </div>
        </div>
      </div>

      {/* '공지사항' 버튼 */}
      <div className="w-full max-w-sm mt-8">
        {renderButton("공지사항", rightArrow_Icon, handleNoticeClick)}
      </div>

      {/* '문의하기' 버튼 */}
      <div className="w-full max-w-sm mt-2">
        {renderButton("문의하기", rightArrow_Icon, handleNoticeClick)}
      </div>

      {/* 'FAQ' 버튼 */}
      <div className="w-full max-w-sm mt-2">
        {renderButton("FAQ", rightArrow_Icon, handleNoticeClick)}
      </div>

      {/* '운영진 페이지' 버튼 */}
      <div className="w-full max-w-sm mt-2">
        {renderButton("운영진 페이지", rightArrow_Icon, handleNoticeClick)}
      </div>

    </div>
  );
}

export default MyPage;
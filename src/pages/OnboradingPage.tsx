import rikulogo from '@assets/onboarding_logo.svg';
import { useNavigate } from 'react-router-dom';
import backgroundVideo from '@assets/onboard_video_no_sound.mp4';

// 웹사이트 처음 접속 시 보여지는 "온보딩" 페이지
function OnbordingPage() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-white">
      {/* 배경 비디오 */}
      <video
        src={backgroundVideo}
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-1/2 left-1/2 w-auto h-full transform -translate-x-1/2 -translate-y-1/2 z-0 object-cover"
      />

      {/* 내용 및 버튼 */}
      <div className="z-10 flex flex-col items-center justify-center h-screen">
        <div className="mt-[-10px] opacity-70">
          <object data={rikulogo} />
        </div>
        <div className="flex flex-col mt-5">
          <button
            onClick={handleLoginClick}
            className="w-[327px] h-[52px] rounded-[10px] text-[18px] bg-black/20  text-white font-bold 
            hover:bg-kuWarmGray hover:bg-opacity-100 hover:text-white transition-colors duration-300"
          >
            시작하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default OnbordingPage;

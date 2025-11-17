import { useNavigate } from 'react-router-dom';
import BacbBtnimg from '@assets/BackBtn.svg';
import { RunCategory, titleToKorean } from '@shared/types';

// 정규런, 번개런, 훈련, 행사 등의 list를 보는 페이지에서(RunList.tsx) 사용하는 상단바
function DetailActionBar({ title }: { title: RunCategory }) {
  const navigate = useNavigate();
  return (
    <div className="relative flex bg-kuDarkGreen w-full h-[56px] text-white text-xl font-semibold justify-center items-center">
      <img
        src={BacbBtnimg}
        className="absolute left-[24px] cursor-pointer"
        alt="Back"
        onClick={() => navigate('/tab/main')}
      />
      {titleToKorean[title]}
    </div>
  );
}

export default DetailActionBar;

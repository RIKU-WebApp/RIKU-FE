import React from 'react';
import { useNavigate } from 'react-router-dom';
import ARGENTimg from '../../assets/Main-img/NewUrgentStatus.svg';

interface CardProps {
  title: string;
  date: string;
  imageUrl: string;
  statusImg?: string; // status -> statusImg로 변경
  event_type: string;

  path: string;
}

const NewMainCard: React.FC<CardProps> = ({
  title,
  date,
  statusImg,
  imageUrl,
  event_type,
  path,
}) => {
  const navigate = useNavigate();
  const handleClick = () => navigate(path);
  //줄바꿈 처리 함수
  const renderMultilineTitle = (text: string) => {
    return text.split('\n').map((line, idx) => (
      <React.Fragment key={idx}>
        {line}
        <br />
      </React.Fragment>
    ));
  };
  //러닝이 없을 때
  const isEmptyContent = title.includes('없습니다');

  return (
    <div className="w-[160px] h-[250px] bg-kuLightGray rounded-lg relative" onClick={handleClick}>
      {/* 이미지 영역 */}
      <div className="w-full h-[120px] overflow-hidden rounded-lg">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover" loading="lazy" />
      </div>

      {/* 콘텐츠 유형 배지 */}
      <div
        className={`absolute top-[100px] text-[12px] rounded-lg px-4 py-1
    ${isEmptyContent ? 'bg-kuLightGray' : 'bg-kuLightGray'}`}
      >
        {event_type}
      </div>

      {/* 정보 영역 */}
      <div
        className={`ml-[16px] mr-[16px] mb-[20px] mt-[16px]
    ${isEmptyContent ? 'text-kuDarkGray' : 'text-black'}`}
      >
        {statusImg && (
          <img
            src={statusImg}
            alt="Status"
            className={`${statusImg === ARGENTimg ? 'w-[46px] h-[20px]' : 'w-[40px] h-[20px]'}`}
          />
        )}

        <div className="text-[12px] mt-1">{date}</div>

        <div className="font-bold text-[20px] w-[130px] h-[64px] overflow-hidden text-ellipsis break-words line-clamp-2">
          {renderMultilineTitle(title)}
        </div>
      </div>
    </div>
  );
};

export default NewMainCard;

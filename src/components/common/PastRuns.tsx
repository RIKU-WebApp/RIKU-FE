import React from 'react';
import RunCardImage from './RunCardImage';
import sampleimg from '../../assets/pastrunsample.svg';
import peopleimg from '../../assets/people_darkgreen.svg';

interface PastRunsProps {
  showFullImage?: boolean;
  location: string;
  postimg: string;
  runDate: string;
  runState: string;
  date: string;
  peoplecount: string;
  title: string;
  onClick?: () => void;
}

const PastRuns: React.FC<PastRunsProps> = ({ showFullImage, date, peoplecount, title, postimg, onClick }) => {
  return (
    <div className="relative w-full max-w-[103.05px] h-[152px] bg-kuLightGray rounded-xl" onClick={onClick}>
      <div className={`absolute top-0 w-full max-w-[103.05px] ${showFullImage ? "h-[66px]" : "h-[85px]"} overflow-hidden rounded-xl`}>
        <RunCardImage src={postimg || sampleimg} showFullImage={showFullImage} />
      </div>
      <div className="absolute top-[66px] w-full h-[88px] rounded-xl bg-kuLightGray">
        <div className="relative">
          <div className="absolute top-[10px] left-[10px] text-[10px] font-semibold text-black/60">
            {date}
          </div>
          <div className="absolute top-[28px] left-[10px] text-[10px] w-[14.12px] h-[10px]">
            <img src={peopleimg} />
          </div>
          <div className="absolute top-[26px] left-[28.59px] text-[10px] font-semibold">
            {peoplecount}
          </div>
          <div className="absolute top-[42px] left-[10px] text-[12px] font-bold right-[10px] h-[34px] text-black/80 overflow-hidden text-ellipsis line-clamp-2">
            {title}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PastRuns;

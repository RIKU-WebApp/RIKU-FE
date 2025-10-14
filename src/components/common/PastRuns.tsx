import React from 'react';
import sampleimg from '../../assets/pastrunsample.svg';
import peopleimg from '../../assets/people_darkgreen.svg';

interface PastRunsProps {
  location: string;
  postimg: string;
  runDate: string;
  runState: string;
  date: string;
  peoplecount: string;
  title: string;
  onClick?: () => void;
}

const PastRuns: React.FC<PastRunsProps> = ({ date, peoplecount, title, postimg, onClick }) => {
  return (
    <div className="relative w-[103.05px] h-[152px] bg-kuLightGray rounded-xl" onClick={onClick}>
      <div className="absolute top-[0px] w-[103.05px] h-[85px] overflow-hidden rounded-xl">
        <img className="w-full h-full object-cover rounded-t-[6.44px]" src={postimg || sampleimg} />
      </div>
      <div className="absolute top-[66px] w-[103px] h-[88px] rounded-xl bg-kuLightGray">
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
          <div className="absolute top-[42px] left-[10px] text-[12px] font-bold w-[82.44px] h-[34px] text-black/80 overflow-hidden text-ellipsis line-clamp-2">
            {title}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PastRuns;

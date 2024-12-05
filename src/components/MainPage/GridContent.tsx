import React from 'react';
import CutText from './CutText';

interface RunCardProps {
    place: string;
    date: string;
    status: string;
    image: string; //이미지 경로(상대경로로 전달)
    bgColor: string;
}

//그리드에 들어갈 콘텐츠
function GridContent(props: RunCardProps) {
    const {place, date, status, image, bgColor} = props; //props를 받아와서 구조 파괴

    return (
        <div className="relative flex flex-col items-center bg-white rounded-xl">
            {/* 원형 배경 이미지 */}
            <div
                className={`relative w-32 h-32 rounded-full overflow-hidden flex items-center justify-center`}
                style={{
                    backgroundImage: `url(${image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* 오버레이 */}
                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full z-10"></div>

                {/* 텍스트 오버레이 */}
                <div className="absolute z-20 text-center text-white">
                    <CutText text={place} maxLength={7}/>
                    <p className="text-sm">{date}</p>
                    <span className={`px-2 py-1 text-xs font-bold rounded ${bgColor}`}>
                        {status}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default GridContent;
import React from 'react';

interface EllipsisTextProps {
    text: string;
    maxLength: number; // 최대 글자 수
}

//maxLength 글자만큼 
const CutText: React.FC<EllipsisTextProps> = ({ text, maxLength }) => {
    const truncatedText = text.length > maxLength ? text.slice(0, maxLength) + '...' : text;

    return <p className="text-sm text-white">{truncatedText}</p>;
};

export default CutText;

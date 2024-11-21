import React, { useState } from "react";

interface TabButtonProps {
    leftLabel: string;
    rightLabel: string;
    onTabChange: (tab: '소개' | '명단') => void;
}

const TabButton: React.FC<TabButtonProps> = ({ leftLabel, rightLabel, onTabChange }) => {
    const [activeTab, setActiveTab] = useState<'소개' | '명단'>('소개');

    const handleBarClick = (tab: '소개' | '명단') => {
        setActiveTab(tab);
        onTabChange(tab); // 부모 컴포넌트로 상태 전달
    };

    return (
        <div className="flex flex-col items-center w-[370px]">
            {/* 탭 버튼 */}
            <div className="flex w-full">
                <button
                    className={`flex-1 text-center py-2 cursor-pointer ${
                        activeTab === '소개' ? 'text-[#355c48] font-semibold' : 'text-gray-400'
                    }`}
                    onClick={() => handleBarClick('소개')}
                >
                    {leftLabel}
                </button>
                <button
                    className={`flex-1 text-center py-2 cursor-pointer ${
                        activeTab === '명단' ? 'text-[#355c48] font-semibold' : 'text-gray-400'
                    }`}
                    onClick={() => handleBarClick('명단')}
                >
                    {rightLabel}
                </button>
            </div>
            {/* 하단 바 */}
            <div className="relative w-full h-1 bg-gray-300 rounded mt-1">
                <div
                    className={`absolute w-1/2 h-full bg-[#355c48] rounded transition-all duration-300 ${
                        activeTab === '소개' ? 'left-0' : 'left-1/2'
                    }`}
                ></div>
            </div>
        </div>
    );
};

export default TabButton;

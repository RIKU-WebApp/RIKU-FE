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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            <div style={{ display: "flex", width: "100%", marginBottom: "10px" }}>
                <span
                    style={{
                        flex: 1,
                        textAlign: "center",
                        color: activeTab === '소개' ? "#355c48" : "#aaa",
                        cursor: "pointer",
                    }}
                    onClick={() => handleBarClick('소개')}
                >
                    {leftLabel}
                </span>
                <span
                    style={{
                        flex: 1,
                        textAlign: "center",
                        color: activeTab === '명단' ? "#355c48" : "#aaa",
                        cursor: "pointer",
                    }}
                    onClick={() => handleBarClick('명단')}
                >
                    {rightLabel}
                </span>
            </div>
            <div
                style={{
                    width: "375px",
                    height: "4px",
                    background: "#ccc",
                    position: "relative",
                    cursor: "pointer",
                    borderRadius: "2px",
                }}
            >
                <div
                    style={{
                        width: "50%",
                        height: "100%",
                        background: "#355c48",
                        position: "absolute",
                        left: activeTab === '소개' ? "0%" : "50%",
                        transition: "left 0.3s ease",
                        borderRadius: "2px",
                    }}
                ></div>
            </div>
        </div>
    );
};

export default TabButton;

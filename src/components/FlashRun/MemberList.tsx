import React from "react";

const containerStyle: React.CSSProperties = {
    width: '335px',
    height: '65px',
    backgroundColor: '#F0F4DD',
    borderRadius: '12px',
};

const contentStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

// 함수 선언 방식으로 타입 지정
function MemberList({ number, name }: { number: number; name: string }) {
    return (
        <div style={containerStyle}>
            <div style={contentStyle}>
                {number} {name}
            </div>
        </div>
    );
}

export default MemberList;

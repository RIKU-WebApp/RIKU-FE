import React from "react";

const containerStyle: React.CSSProperties = {
    width: '335px',
    height: '56px',
    backgroundColor: '#F0F4DD',
    borderRadius:'12px',

};

const contentStyle: React.CSSProperties = {
    display: 'inline-block',
    alignContent: 'center',
}

//멤버 list 박스 1개
function MemberList ({ number, name }) {
    return(
        <div style={containerStyle}>
            <div style={containerStyle}>{number} {name}</div>
        </div>
    )
}

export default MemberList;
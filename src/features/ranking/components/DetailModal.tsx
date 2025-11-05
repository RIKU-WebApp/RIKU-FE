import React from 'react';

interface DetailModalProps {
  isDetailModalOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}

// "자세히 보기" 버튼을 눌렀을 때 나오는 모달창 (children 값을 상위 컴포넌트로부터 받아와 렌더링한다)
const DetailModal = ({ isDetailModalOpen, onClose, title, children }: DetailModalProps) => {
  if (!isDetailModalOpen) return null;

  return (
    <div
      onClick={onClose} // 배경 누르면 닫기
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
    >
      {/* inset-0 옵션을 통해, fixed된 상태에서 상하좌우 모두 0 */}
      <div
        onClick={(e) => e.stopPropagation()} //내부 클릭은 전파 막기
        className="flex-col items-center bg-white p-6 rounded-lg shadow-lg w-[300px] text-center"
      >
        {title && <h2 className="text-xl font-['danjoBoldRegular'] mb-4">{title}</h2>}
        <div className="flex flex-col items-center justify-start w-full">{children}</div>
      </div>
    </div>
  );
};

export default DetailModal;

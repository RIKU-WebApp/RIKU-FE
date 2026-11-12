import BackIcon from '@assets/BackBtn.svg';

export default function RunBackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label="뒤로가기"
      className="absolute left-2.5 flex h-11 w-11 items-center justify-center">
      <img src={BackIcon} alt="" />
    </button>
  );
}

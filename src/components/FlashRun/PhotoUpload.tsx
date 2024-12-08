import React, { useState } from "react";
import ImgSaveIcon from "../../assets/img-save.svg";

interface PhotoUploadProps {
  onFileChange: (file: File | null) => void; // 부모 컴포넌트에 파일 상태 전달
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onFileChange }) => {
  const [preview, setPreview] = useState<string | null>(null); // 미리보기 URL

  // 파일 선택 핸들러
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile)); // 미리보기 URL 생성
      onFileChange(selectedFile); // 부모 컴포넌트로 파일 전달
    } else {
      setPreview(null);
      onFileChange(null);
    }
  };

  return (
    <div>
      {/* 아이콘 */}
      <div
        onClick={() => document.getElementById("fileInput")?.click()} // 숨겨진 input 트리거
        className="cursor-pointer text-4xl text-blue-500 hover:text-blue-700"
      >
        <img src={ImgSaveIcon} alt="이미지 업로드 아이콘" />
      </div>

      {/* 숨겨진 파일 입력 */}
      <input
        id="fileInput"
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* 미리보기 */}
      {preview && (
        <div className="w-375 h-52">
          <img
            src={preview}
            alt="미리보기"
            className="w-full h-full object-cover border rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;

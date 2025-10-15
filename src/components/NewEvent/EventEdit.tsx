import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import customAxios from '@/shared/lib/customAxios';
import BackIcon from '@assets/BackBtn.svg';
import { DateInput } from '../common/DateInput';
import { TimePickerBottomSheet } from '../common/TimePickerBottomSheet';
import imageCompression from 'browser-image-compression';

interface Pacer {
  id: number;
  name: string;
}

interface PacerGroup {
  id: string;
  pacer: string;
  distance: string;
  pace: string;
}

interface CreatePacerRequest {
  group: string;
  pacerId: number;
  distance: string;
  pace: string;
}

function EventEdit() {
  const navigate = useNavigate();
  const { postId } = useParams(); // URL에서 eventId를 가져옴

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [content, setContent] = useState('');
  const [dateTime, setDateTime] = useState<{ date: Date | null; time: string }>({
    date: null,
    time: '00:00',
  });
  const [pacerGroups, setPacerGroups] = useState<PacerGroup[]>([]);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [bottomSheetType, setBottomSheetType] = useState<'distance' | 'pace' | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedDistance, setSelectedDistance] = useState<string>('5');
  const [selectedMinutes, setSelectedMinutes] = useState<string>('5');
  const [selectedSeconds, setSelectedSeconds] = useState<string>('30');
  const [pacers, setPacers] = useState<Pacer[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
  const [postImage, setPostImage] = useState<File | null>(null);

  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);
  const [originalAttachmentUrls, setOriginalAttachmentUrls] = useState<string[]>([]); // 기존 URL
  const [newAttachmentFiles, setNewAttachmentFiles] = useState<File[]>([]); // 새로 업로드된 파일

  const fetchImageAsFile = async (url: string, index: number): Promise<File> => {
    const response = await fetch(url);
    const blob = await response.blob();
    const ext = url.split('.').pop()?.split('?')[0] || 'jpg';
    return new File([blob], `existing_${index}.${ext}`, { type: blob.type });
  };

  // 행사 데이터를 수정 시 로딩
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('accessToken') || 'null');
        const response = await customAxios.get(`/run/event/post/${postId}`, {
          headers: { Authorization: `${token}` },
        });
        if (response.data.isSuccess) {
          const eventData = response.data.result;
          setTitle(eventData.title);
          setLocation(eventData.location);
          setContent(eventData.content);
          const utcDate = new Date(eventData.date); // 서버에서 받은 UTC 날짜
          const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000); // 9시간 더해 KST로 변환

          setDateTime({
            date: kstDate,
            time: kstDate.toTimeString().slice(0, 5), // KST 기준 시간 추출
          });
          setPostImagePreview(eventData.postImageUrl);
          setAttachmentPreviews(eventData.attachmentUrls || []);
          setAttachments([]); // File은 새로 업로드할 때만 추가

          console.log(eventData);
        }
      } catch (error) {
        console.error('행사 데이터 로드 중 오류 발생:', error);
      }
    };
    fetchEventData();
  }, [postId]);

  const handleContent = (e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value);

  const handleSubmit = async () => {
    if (!title && !location && !content && !dateTime.date && !postImage) {
      alert('수정할 내용을 하나 이상 입력해주세요.');
      return;
    }

    try {
      const [hours, minutes] = dateTime.time.split(':').map(Number);
      const selected = dateTime.date!;

      const kstDate = new Date(
        selected.getFullYear(),
        selected.getMonth(),
        selected.getDate(),
        hours,
        minutes,
        0
      );

      const utcDate = new Date(kstDate.getTime() - 9 * 60 * 60 * 1000);

      const pad = (n: number) => n.toString().padStart(2, '0');
      const eventDateTime = `${utcDate.getFullYear()}-${pad(utcDate.getMonth() + 1)}-${pad(utcDate.getDate())}T${pad(utcDate.getHours())}:${pad(utcDate.getMinutes())}:${pad(utcDate.getSeconds())}`;

      const token = JSON.parse(localStorage.getItem('accessToken') || 'null');
      const formData = new FormData();

      // 변경된 필드만 추가
      if (title) formData.append('title', title);
      if (location) formData.append('location', location);
      if (content) formData.append('content', content);
      if (eventDateTime) formData.append('date', eventDateTime);
      if (postImage) formData.append('postImage', postImage);

      let fileIndex = 0;
      for (const preview of attachmentPreviews) {
        if (preview.startsWith('http')) {
          // 기존 이미지 → fetch해서 file 변환
          const res = await fetch(preview);
          const blob = await res.blob();
          const file = new File([blob], `original_attachment_${Date.now()}.jpg`, {
            type: blob.type,
          });
          formData.append('attachments', file);
        } else if (preview.startsWith('data:')) {
          // 새로 추가한 이미지 → 파일로 전송
          const file = newAttachmentFiles[fileIndex];
          if (file) {
            formData.append('attachments', file);
            fileIndex++;
          }
        }
      }

      const response = await customAxios.patch(`/run/event/post/${postId}`, formData, {
        headers: {
          Authorization: `${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.isSuccess) {
        alert('행사가 성공적으로 수정되었습니다!');
        navigate(`/event/${postId}`, { replace: true });
      } else {
        alert(`요청 실패: ${response.data.responseMessage}`);
      }
    } catch (error) {
      console.error('행사 수정 중 오류:', error);
      alert('행사 수정 중 문제가 발생했습니다.');
    }
  };

  const handleRemoveAttachment = (index: number) => {
    const toRemove = attachmentPreviews[index];
    setAttachmentPreviews((prev) => prev.filter((_, i) => i !== index));

    if (toRemove.startsWith('http')) {
      // 기존 URL 삭제
      setOriginalAttachmentUrls((prev) => prev.filter((url) => url !== toRemove));
    } else {
      // 새로 추가한 파일 삭제
      setNewAttachmentFiles((prev) => {
        const fileIndex = index - originalAttachmentUrls.length;
        return prev.filter((_, i) => i !== fileIndex);
      });
    }
  };

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const selectedArray = Array.from(selectedFiles);

    const currentTotal = originalAttachmentUrls.length + newAttachmentFiles.length;

    if (currentTotal + selectedArray.length > 6) {
      alert('최대 6장까지만 업로드할 수 있습니다.');
      e.target.value = '';
      return;
    }

    try {
      for (const file of selectedArray) {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 5,
          maxWidthOrHeight: 1000,
          useWebWorker: true,
        });

        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachmentPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(compressedFile);

        setNewAttachmentFiles((prev) => [...prev, compressedFile]);
      }
    } catch (error) {
      console.error('첨부 이미지 압축 실패:', error);
      alert('첨부 이미지 압축 중 오류가 발생했습니다.');
    }

    e.target.value = '';
  };

  const handlePostImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 5,
        maxWidthOrHeight: 1000,
        useWebWorker: true,
      });

      setPostImage(compressedFile);

      const reader = new FileReader();
      reader.onloadend = () => setPostImagePreview(reader.result as string);
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('대표 이미지 압축 실패:', error);
      alert('대표 이미지 압축 중 오류가 발생했습니다.');
    }

    event.target.value = ''; // input 초기화
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="max-w-[430px] w-full">
        <div className="flex items-center justify-center w-full h-[56px] px-5 mb-5 relative bg-kuDarkGreen">
          <div className="text-2xl font-semibold text-white text-center">행사 수정</div>
          <button onClick={() => navigate(-1)} className="absolute left-4">
            <img src={BackIcon} alt="뒤로가기" className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* 행사 제목, 장소, 내용, 날짜 및 시간 */}
      <div className="w-full max-w-md px-4">
        <div className="my-2">제목</div>
        <input
          className="border rounded-lg w-full p-2"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="my-2">집합 장소</div>
        <input
          className="border rounded-lg w-full p-2"
          placeholder="장소명을 입력하세요"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <DateInput
          selectedDate={dateTime.date}
          onChange={(date) => setDateTime({ ...dateTime, date })}
        />
        <TimePickerBottomSheet
          time={dateTime.time}
          onChange={(time) => setDateTime({ ...dateTime, time })}
        />

        <div className="mb-2 mt-4">세부사항</div>
        <textarea
          className="my-2 w-full p-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
          rows={10}
          placeholder="세부사항을 입력하세요"
          value={content}
          onChange={handleContent}
        ></textarea>

        {/* 대표 이미지 업로드 */}
        <div className="my-4">
          <h2 className="mb-2">대표 이미지 (필수)</h2>
          {postImagePreview ? (
            <div className="relative w-[104px] h-[104px]">
              <img src={postImagePreview} className="w-full h-full object-cover rounded-md" />
              <button
                onClick={() => {
                  setPostImage(null);
                  setPostImagePreview(null);
                }}
                className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>
          ) : (
            <label
              htmlFor="postImageUpload"
              className="w-[104px] h-[104px] border border-dashed border-gray-400 flex items-center justify-center text-gray-500 cursor-pointer rounded-md"
            >
              +
            </label>
          )}
          <input
            type="file"
            id="postImageUpload"
            accept="image/*"
            onChange={(e) => handlePostImageUpload(e)}
            className="hidden"
          />
        </div>

        {/* 첨부 이미지 업로드 */}
        <div className="my-4">
          <h2 className="mb-2">코스 사진 (최대 6장)</h2>
          <div className="grid grid-cols-3 gap-2">
            {attachmentPreviews.map((img, index) => (
              <div key={index} className="relative w-[104px] h-[104px]">
                <img src={img} className="w-full h-full object-cover rounded-md" />
                <button
                  onClick={() => handleRemoveAttachment(index)}
                  className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
            {attachmentPreviews.length < 6 && (
              <label
                htmlFor="attachmentUpload"
                className="w-[104px] h-[104px] border border-dashed border-gray-400 flex items-center justify-center text-gray-500 cursor-pointer rounded-md"
              >
                +
              </label>
            )}
          </div>
          <input
            type="file"
            id="attachmentUpload"
            multiple
            accept="image/*"
            onChange={handleAttachmentUpload}
            className="hidden"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-[#366943] text-white py-3 rounded-lg mt-4"
        >
          수정하기
        </button>
      </div>
    </div>
  );
}

export default EventEdit;

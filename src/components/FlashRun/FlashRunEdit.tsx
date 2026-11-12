import { goBackOrReplace } from '@shared/lib/runNavigation';
import RunCoverField from '../common/RunCoverField';
import { useOriginalRunFields } from '../../features/improvements/runEdit';
import { errorMessage } from '../../features/improvements/shared';
import { useCapacityInput } from '../../features/improvements/RunWaitlist';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import customAxios from '@/shared/lib/customAxios';
import BackIcon from '@assets/BackBtn.svg';
import { DateInput } from '../common/DateInput';
import { TimePickerBottomSheet } from '../common/TimePickerBottomSheet';
import imageCompression from 'browser-image-compression';

function FlashRunEdit() {
  const navigate = useNavigate();
  const { postId } = useParams();

  const limit = useCapacityInput('flash', postId);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [content, setContent] = useState('');
  const original = useOriginalRunFields();
  const [dateTime, setDateTime] = useState<{ date: Date | null; time: string }>({
    date: null,
    time: '00:00',
  });
  const [postImage, setPostImage] = useState<File | null>(null);
  const [savedImage, setSavedImage] = useState<string | null>(null);
  const [savedFit, setSavedFit] = useState(false);
  const [editedFit, setEditedFit] = useState<boolean>();
  const [participants, setParticipants] = useState(0);
  const [coverBusy, setCoverBusy] = useState(false);

  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);
  const [newAttachmentFiles, setNewAttachmentFiles] = useState<File[]>([]);
  const [originalAttachmentUrls, setOriginalAttachmentUrls] = useState<string[]>([]);

  useEffect(() => {
    const fetchPost = async () => {
      const token = localStorage.getItem('accessToken') || 'null';
      const res = await customAxios.get(`/run/flash/post/${postId}`, {
        headers: { Authorization: `${token}` },
      });
      if (res.data.isSuccess) {
        const result = res.data.result;
        setTitle(result.title);
        setLocation(result.location);
        setContent(result.content);
        setSavedImage(result.postImageUrl);
        setSavedFit(result.showFullImage ?? false);
        setParticipants(result.participantsNum ?? 0);
        setAttachmentPreviews(result.attachmentUrls || []);
        setAttachmentPreviews(result.attachmentUrls || []);
        setOriginalAttachmentUrls(result.attachmentUrls || []);

        setDateTime(original.load(result.date, result.attachmentUrls));
        console.log(result);

      }
    };
    fetchPost();
  }, [postId]);


  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const selectedArray = Array.from(selectedFiles);
    const currentTotal = attachmentPreviews.length;

    if (currentTotal + selectedArray.length > 6) {
      alert('최대 6장까지 업로드할 수 있습니다.');
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
      console.error('코스 사진 압축 실패:', error);
      alert('코스 사진 압축 중 오류가 발생했습니다.');
    }

    e.target.value = '';
  };

  const handleRemoveAttachment = (index: number) => {
    const toRemove = attachmentPreviews[index];
    setAttachmentPreviews((prev) => prev.filter((_, i) => i !== index));

    if (toRemove.startsWith('http')) {
      setOriginalAttachmentUrls((prev) => prev.filter((url) => url !== toRemove));
    } else {
      // base64일 경우, newAttachmentFiles에서도 제거
      setNewAttachmentFiles((prev) => {
        const newFiles = [...prev];
        newFiles.splice(index - originalAttachmentUrls.length, 1);
        return newFiles;
      });
    }
  };

  const handleTimeChange = (time: string) => {
    setDateTime((prev) => ({ ...prev, time }));
  };

  const handleSubmit = async () => {
    if (
      !title &&
      !location &&
      !content &&
      !dateTime.date &&
      !postImage &&
      attachmentPreviews.length === 0
    ) {
      alert('수정할 내용을 하나 이상 입력해주세요.');
      return;
    }

    try {

      const token = localStorage.getItem('accessToken') || 'null';
      const formData = new FormData();
      if (editedFit !== undefined) formData.append('showFullImage', String(editedFit));
      limit.append(formData);

      if (title) formData.append('title', title);
      if (location) formData.append('location', location);
      if (content) formData.append('content', content);
      original.appendDate(formData, dateTime.date!, dateTime.time);
      if (postImage) formData.append('postImage', postImage);

      // 기존 S3 이미지들을 File로 변환해서 append
      if (original.changedPhotos(attachmentPreviews)) for (let i = 0; i < originalAttachmentUrls.length; i++) {
        const url = originalAttachmentUrls[i];
        const res = await fetch(url);
        const blob = await res.blob();
        const file = new File([blob], `original_attachment_${i}.jpg`, { type: blob.type });
        formData.append('attachments', file);
      }

      // 새로 업로드된 이미지들도 append
      for (const file of newAttachmentFiles) {
        formData.append('attachments', file);
      }

      // 디버깅용: FormData 내용 출력
      // for (const [key, value] of formData.entries()) {
      //   if (value instanceof File) {
      //     console.log(`${key}: [File] name=${value.name}, size=${value.size}`);
      //   } else {
      //     console.log(`${key}: ${value}`);
      //   }
      // }

      const endpoint = `/run/flash/post/${postId}`;

      const res = await customAxios.patch(endpoint, formData, {
        headers: {
          Authorization: `${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('요청된 최종 엔드포인트:', res.config.url);
      if (res.data.isSuccess) {
        alert('번개런이 성공적으로 수정되었습니다!');
        navigate(`/flash/${postId}`, { replace: true });
      } else {
        alert(`요청 실패: ${res.data.responseMessage}`);
      }
    } catch (err) {
      console.error('번개런 수정 중 오류:', err);
      alert(errorMessage(err));
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen overflow-y-auto">
      <div className="max-w-[430px] w-full">
        <div className="flex items-center justify-center w-full h-[56px] px-5 mb-5 relative bg-kuDarkGreen">
          <div className="text-2xl font-semibold text-white text-center">번개런 수정</div>
          <button onClick={() => goBackOrReplace(navigate, `/flash/${postId}`)} className="absolute left-4">
            <img src={BackIcon} alt="뒤로가기" className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="w-full max-w-md px-4">
        {limit.field}
        {limit.groupField}
        <div className="my-2">제목</div>
        <input
          className="border rounded-lg w-full p-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="my-2">집합 장소</div>
        <input
          className="border rounded-lg w-full p-2"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <DateInput
          selectedDate={dateTime.date}
          onChange={(date) => setDateTime((prev) => ({ ...prev, date }))}
        />

        <TimePickerBottomSheet time={dateTime.time} onChange={handleTimeChange} />

        <div className="mb-2 mt-4">세부사항</div>
        <textarea
          className="w-full p-2 border rounded-lg"
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <RunCoverField runLabel="번개런" title={title} dateTime={dateTime}
          savedImage={savedImage} participants={participants} showFullImage={editedFit ?? savedFit} onFitChange={setEditedFit}
          onFileChange={setPostImage} onBusyChange={setCoverBusy} />

        {/* 첨부 이미지 */}
        <div className="my-4">
          <h2 className="mb-2">코스 사진</h2>
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
            <input
              type="file"
              id="attachmentUpload"
              multiple
              accept="image/*"
              onChange={handleAttachmentUpload}
              className="hidden"
            />
          </div>
        </div>

        <button
          disabled={coverBusy}
          onClick={handleSubmit}
          className="w-full bg-[#366943] text-white py-3 font-bold rounded-lg mt-4 mb-4"
        >
          수정하기
        </button>
      </div>
    </div>
  );
}

export default FlashRunEdit;

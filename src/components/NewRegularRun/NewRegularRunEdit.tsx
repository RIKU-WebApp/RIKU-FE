import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import customAxios from '@/shared/lib/customAxios';
import { motion } from 'framer-motion';
import BackIcon from '../../assets/BackBtn.svg';
import { DateInput } from '../common/DateInput';
import { TimePickerBottomSheet } from '../common/TimePickerBottomSheet';
import imageCompression from 'browser-image-compression';

interface Pacer {
  id: number;
  name?: string;
  pacerName?: string;
}

interface PacerGroup {
  id: string;
  pacer: string;
  distance: string;
  pace: string;
}

function NewRegularRunEdit() {
  const navigate = useNavigate();
  const { postId } = useParams();

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [content, setContent] = useState('');
  const [dateTime, setDateTime] = useState<{ date: Date | null; time: string }>({
    date: null,
    time: '00:00',
  });
  const [pacerGroups, setPacerGroups] = useState<PacerGroup[]>([]);
  const [pacers, setPacers] = useState<Pacer[]>([]);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [bottomSheetType, setBottomSheetType] = useState<'distance' | 'pace' | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedDistance, setSelectedDistance] = useState<string>('5');
  const [selectedMinutes, setSelectedMinutes] = useState<string>('5');
  const [selectedSeconds, setSelectedSeconds] = useState<string>('30');
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [courseImages, setCourseImages] = useState<File[]>([]);
  const [coursePreviews, setCoursePreviews] = useState<string[]>([]);

  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([]);

  useEffect(() => {
    const fetchPacers = async () => {
      const token = JSON.parse(localStorage.getItem('accessToken') || 'null');
      const response = await customAxios.get('/pacers', {
        headers: { Authorization: `${token}` },
      });
      if (response.data.isSuccess) setPacers(response.data.result);
    };
    const fetchPostData = async () => {
      const token = JSON.parse(localStorage.getItem('accessToken') || 'null');
      const res = await customAxios.get(`/run/regular/post/${postId}`, {
        headers: { Authorization: `${token}` },
      });
      if (res.data.isSuccess) {
        const result = res.data.result;
        setTitle(result.title);
        setLocation(result.location);
        setContent(result.content);
        setMainPreview(result.postImageUrl);
        setCoursePreviews(result.attachmentUrls || []);
        setAttachmentUrls(result.attachmentUrls || []);

        const utcDate = new Date(result.date); // 서버에서 받은 UTC 날짜
        const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000); // 9시간 더해 KST로 변환

        setDateTime({
          date: kstDate,
          time: kstDate.toTimeString().slice(0, 5), // KST 기준 시간 추출
        });
        setPacerGroups(
          result.pacers.map((p: any) => ({
            id: p.group,
            pacer: p.pacerName || '', // pacerId 대신 pacerName을 저장
            pacerName: p.pacerName || '',
            distance: p.distance,
            pace: p.pace,
          }))
        );
        console.log(result);
      }
    };
    fetchPacers();
    fetchPostData();
  }, [postId]);

  const addPacerGroup = () => {
    const nextGroupId = String.fromCharCode(65 + pacerGroups.length);
    setPacerGroups([...pacerGroups, { id: nextGroupId, pacer: '', distance: '', pace: '' }]);
  };

  const removePacerGroup = (id: string) => {
    setPacerGroups((prev) => {
      // 1) 삭제
      const filtered = prev.filter((group) => group.id !== id);
      // 2) A, B, C… 순서대로 다시 매기기
      return filtered.map((group, idx) => ({
        ...group,
        id: String.fromCharCode(65 + idx), // 65 = 'A'
      }));
    });
  };

  const handleInputChange = (id: string, field: keyof PacerGroup, value: string) => {
    setPacerGroups(
      pacerGroups.map((group) => (group.id === id ? { ...group, [field]: value } : group))
    );
  };

  const handleDateChange = (date: Date | null) => setDateTime((prev) => ({ ...prev, date }));
  const handleTimeChange = (time: string) => setDateTime((prev) => ({ ...prev, time }));
  const openBottomSheet = (id: string, type: 'distance' | 'pace') => {
    setSelectedGroup(id);
    setBottomSheetType(type);
    setIsBottomSheetOpen(true);
  };
  const applySelection = () => {
    if (selectedGroup) {
      if (bottomSheetType === 'distance') {
        handleInputChange(selectedGroup, 'distance', `${selectedDistance} km`);
      } else if (bottomSheetType === 'pace') {
        handleInputChange(selectedGroup, 'pace', `${selectedMinutes}:${selectedSeconds}`);
      }
    }
    setIsBottomSheetOpen(false);
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 5,
          maxWidthOrHeight: 1000,
          useWebWorker: true,
        });

        const reader = new FileReader();
        reader.onloadend = () => setMainPreview(reader.result as string);
        reader.readAsDataURL(compressedFile);

        setMainImage(compressedFile);
      } catch (error) {
        console.error('대표 이미지 압축 실패:', error);
        alert('대표 이미지 압축 중 문제가 발생했습니다.');
      }
    }
  };

  const handleCourseImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const selectedArray = Array.from(selectedFiles);

    //  현재 총 이미지 수 = 기존 URL 수 + 새로 업로드된 파일 수
    const currentImageCount = attachmentUrls.length + courseImages.length;

    if (currentImageCount >= 6) {
      alert('코스 사진은 최대 6장까지 업로드할 수 있습니다.');
      return;
    }

    //  추가할 수 있는 파일 개수 계산
    const availableSlots = 6 - currentImageCount;
    const limitedFiles = selectedArray.slice(0, availableSlots); // 남은 칸만큼 자르기

    try {
      for (const file of limitedFiles) {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 5,
          maxWidthOrHeight: 1000,
          useWebWorker: true,
        });

        const reader = new FileReader();
        reader.onloadend = () => {
          setCoursePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(compressedFile);

        setCourseImages((prev) => [...prev, compressedFile]);
      }
    } catch (error) {
      console.error('코스 이미지 압축 실패:', error);
      alert('코스 이미지 압축 중 문제가 발생했습니다.');
    }
  };

  const removeCourseImage = (index: number) => {
    const toRemove = coursePreviews[index];

    // coursePreviews에서 제거
    setCoursePreviews((prev) => prev.filter((_, i) => i !== index));

    // 기존 이미지일 경우: attachmentUrls에서 제거
    if (toRemove.startsWith('http')) {
      setAttachmentUrls((prev) => prev.filter((url) => url !== toRemove));
    } else {
      // 새 이미지일 경우: courseImages에서도 제거
      setCourseImages((prev) => prev.filter((_, i) => i !== index - attachmentUrls.length));
    }
  };

  const handleSubmit = async () => {
    if (
      !title ||
      !location ||
      !content ||
      !dateTime.date ||
      pacerGroups.some((g) => !g.pacer || !g.distance || !g.pace)
    ) {
      alert('모든 정보를 입력해주세요.');
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
      formData.append('title', title);
      formData.append('location', location);
      formData.append('date', eventDateTime);
      formData.append('content', content);
      if (mainImage) formData.append('postImage', mainImage);
      const fileIdx = 0;

      // 기존 이미지 URL → File 변환 후 attachments에 포함
      for (let i = 0; i < attachmentUrls.length; i++) {
        const url = attachmentUrls[i];
        const file = await urlToFile(url, `existing_image_${i}.jpg`);
        formData.append('attachments', file);
      }

      // 새로 추가한 이미지도 추가
      courseImages.forEach((file) => {
        formData.append('attachments', file);
      });

      pacerGroups.forEach((group, index) => {
        const matchedPacer = pacers.find(
          (p) => p.name === group.pacer || p.pacerName === group.pacer
        );
        const pacerId = matchedPacer ? matchedPacer.id : '';
        formData.append(`pacers[${index}].group`, group.id);
        formData.append(`pacers[${index}].pacerId`, String(pacerId));
        formData.append(`pacers[${index}].distance`, group.distance);
        formData.append(`pacers[${index}].pace`, group.pace);
      });
      const response = await customAxios.patch(`/run/regular/post/${postId}`, formData, {
        headers: {
          Authorization: `${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.isSuccess) {
        alert('정규런이 성공적으로 수정되었습니다!');
        navigate(`/regular/${postId}`, { replace: true });
      } else {
        alert(`요청 실패: ${response.data.responseMessage}`);
      }
    } catch (error) {
      console.error('정규런 수정 중 오류:', error);
      alert('정규런 수정 중 문제가 발생했습니다.');
    }
  };

  const handlePacerChange = (id: string, pacerId: string) => {
    setPacerGroups((prev) =>
      prev.map((group) => (group.id === id ? { ...group, pacer: pacerId } : group))
    );
  };

  const urlToFile = async (url: string, filename: string): Promise<File> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="flex items-center justify-center w-full h-[56px] px-5 mb-5 relative bg-kuDarkGreen">
        <div className="text-2xl font-semibold text-white text-center">정규런 수정</div>
        <button onClick={() => navigate(-1)} className="absolute left-4">
          <img src={BackIcon} alt="뒤로가기" className="w-6 h-6" />
        </button>
      </div>
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

        <DateInput selectedDate={dateTime.date} onChange={handleDateChange} />

        <TimePickerBottomSheet time={dateTime.time} onChange={handleTimeChange} />

        <div className="mb-2 mt-4">세부사항</div>
        <textarea
          className="my-2 w-full p-2 border rounded-lg"
          rows={10}
          placeholder="세부사항을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>

        {/* 페이서 그룹 입력 UI */}
        <div className="flex flex-col items-center w-full max-w-md p-4 bg-white rounded-lg relative">
          {isBottomSheetOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-10"
              onClick={() => setIsBottomSheetOpen(false)}
            ></div>
          )}
          <h2 className="text-lg font-semibold mb-4 self-start">페이서</h2>
          <div className="w-full">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-gray-700 border-b w-[50px]">그룹</th>
                  <th className="p-2 text-gray-700 border-b w-[85px]">페이서</th>
                  <th className="p-2 text-gray-700 border-b w-[85px]">거리</th>
                  <th className="p-2 text-gray-700 border-b w-[70px]">페이스</th>
                  <th className="p-2 w-[40px] border-b"></th>
                </tr>
              </thead>
              <tbody>
                {pacerGroups.map((group) => (
                  <tr key={group.id} className="border-b border-gray-300">
                    <td className="p-2 text-gray-900 text-center w-[50px]">{group.id}</td>
                    <td className="p-2">
                      <select
                        value={group.pacer} // 이제 pacerName 기반
                        onChange={(e) => handlePacerChange(group.id, e.target.value)}
                        className="w-full text-center border-gray-400 focus:outline-none"
                      >
                        <option value="">-</option>
                        {pacers.map((pacer) => (
                          <option
                            key={pacer.name || pacer.pacerName}
                            value={pacer.name || pacer.pacerName}
                          >
                            {pacer.name || pacer.pacerName}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => openBottomSheet(group.id, 'distance')}
                        className="w-full text-center border-gray-400 focus:outline-none"
                      >
                        {group.distance || '-'}
                      </button>
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => openBottomSheet(group.id, 'pace')}
                        className="w-full text-center border-gray-400 focus:outline-none"
                      >
                        {group.pace || '-'}
                      </button>
                    </td>
                    <td className="p-2 w-[40px]">
                      {group.id !== 'A' && (
                        <button
                          onClick={() => removePacerGroup(group.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ✖
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={addPacerGroup}
            className="mt-4 w-full bg-kuDarkGreen text-white py-2 rounded-lg hover:bg-green-700"
          >
            페이서 그룹 추가
          </button>

          {isBottomSheetOpen && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 w-full bg-white shadow-lg rounded-t-lg p-4 z-20"
            >
              <div className="flex flex-col items-center">
                <div className="text-lg font-semibold">
                  {bottomSheetType === 'distance' ? '거리 선택' : '페이스 선택'}
                </div>
                {bottomSheetType === 'distance' ? (
                  <select
                    className="mt-4 p-2 border border-gray-300 rounded-lg w-24 text-center"
                    value={selectedDistance}
                    onChange={(e) => setSelectedDistance(e.target.value)}
                  >
                    {Array.from({ length: 20 }, (_, i) => `${i + 1}`).map((km) => (
                      <option key={km} value={km}>
                        {km} km
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex space-x-2 mt-4">
                    <select
                      className="p-2 border border-gray-300 rounded-lg w-16 text-center"
                      value={selectedMinutes}
                      onChange={(e) => setSelectedMinutes(e.target.value)}
                    >
                      {Array.from({ length: 60 }, (_, i) => `${i}`).map((min) => (
                        <option key={min} value={min}>
                          {min}
                        </option>
                      ))}
                    </select>
                    <span className="text-lg font-bold">:</span>
                    <select
                      className="p-2 border border-gray-300 rounded-lg w-16 text-center"
                      value={selectedSeconds}
                      onChange={(e) => setSelectedSeconds(e.target.value)}
                    >
                      {Array.from({ length: 60 }, (_, i) => `${i}`).map((sec) => (
                        <option key={sec} value={sec}>
                          {sec}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <button
                  onClick={applySelection}
                  className="mt-4 bg-kuDarkGreen text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  적용하기
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* 대표 이미지 */}
        <div className="my-4">
          <h2 className="mb-2">대표 게시글 사진</h2>
          <div className="relative w-[104px] h-[104px]">
            {mainPreview ? (
              <>
                <img
                  src={mainPreview}
                  alt="대표 이미지"
                  className="w-full h-full object-cover rounded-md"
                />
                <button
                  onClick={() => {
                    setMainImage(null);
                    setMainPreview(null);
                  }}
                  className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </>
            ) : (
              <label
                htmlFor="mainImageUpload"
                className="w-full h-full border border-dashed border-gray-400 flex items-center justify-center text-gray-500 cursor-pointer rounded-md"
              >
                +
              </label>
            )}
          </div>
          <input
            type="file"
            id="mainImageUpload"
            accept="image/*"
            onChange={handleMainImageUpload}
            className="hidden"
          />
        </div>

        {/* 코스 사진 */}
        <div className="my-4">
          <h2 className="mb-2">코스 사진</h2>
          <div className="grid grid-cols-3 gap-2">
            {coursePreviews.map((img, index) => (
              <div key={index} className="relative w-[104px] h-[104px]">
                <img
                  src={img}
                  alt={`course-${index}`}
                  className="w-full h-full object-cover rounded-md"
                />
                <button
                  onClick={() => removeCourseImage(index)}
                  className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
            {coursePreviews.length < 6 && (
              <label
                htmlFor="courseImageUpload"
                className="w-[104px] h-[104px] border border-dashed border-gray-400 flex items-center justify-center text-gray-500 cursor-pointer rounded-md"
              >
                +
              </label>
            )}
          </div>
          <input
            type="file"
            id="courseImageUpload"
            multiple
            accept="image/*"
            onChange={handleCourseImageUpload}
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

export default NewRegularRunEdit;

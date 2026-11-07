import { CapacityNote, GroupLimit, makePlans, nextGroup } from '../../features/improvements/PaceGroups';
import { TotalCapacityInput } from '../../features/improvements/TotalCapacityInput';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import customAxios from '@/shared/lib/customAxios';
import { previewFeaturesEnabled } from '@/shared/config/features';
import { motion } from 'framer-motion';
import BackIcon from '../../assets/BackBtn.svg';

import { DateInput } from '../common/DateInput';
import { TimePickerBottomSheet } from '../common/TimePickerBottomSheet';

import imageCompression from 'browser-image-compression';

interface Pacer {
  id: number;
  name: string;
}

interface PacerGroup {
  capacity?: string;
  id: string;
  pacer: string;
  distance: string;
  pace: string;
}

function NewRegularRunMake() {
  const navigate = useNavigate();

  const [capacity, setCapacity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [content, setContent] = useState('');
  const [dateTime, setDateTime] = useState<{ date: Date | null; time: string }>({
    date: null,
    time: '00:00',
  });

  const [pacerGroups, setPacerGroups] = useState<PacerGroup[]>([
    { id: 'A', pacer: '', distance: '', pace: '' },
  ]);

  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [bottomSheetType, setBottomSheetType] = useState<'distance' | 'pace' | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedDistance, setSelectedDistance] = useState<string>('5');
  const [selectedMinutes, setSelectedMinutes] = useState<string>('5');
  const [selectedSeconds, setSelectedSeconds] = useState<string>('30');

  const [pacers, setPacers] = useState<Pacer[]>([]);

  useEffect(() => {
    if (previewFeaturesEnabled) return;
    customAxios.get('/pacers').then(({data}) => {
      if (data.isSuccess) setPacers(data.result);
    }).catch(() => alert('페이서 목록을 불러오지 못했습니다.'));
  }, []);

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [courseImages, setCourseImages] = useState<File[]>([]);
  const [coursePreviews, setCoursePreviews] = useState<string[]>([]);


  const addPacerGroup = () => {
    const nextGroupId = nextGroup(pacerGroups);
    if (!nextGroupId) return;
    setPacerGroups([...pacerGroups, { id: nextGroupId, pacer: '', distance: '', pace: '' }]);
  };

  const removePacerGroup = (id: string) => {
    setPacerGroups(pacerGroups.filter(group => group.id !== id));
  };
  const handleInputChange = (id: string, field: keyof PacerGroup, value: string) => {
    setPacerGroups(
      pacerGroups.map((group) => (group.id === id ? { ...group, [field]: value } : group))
    );
  };

  const handlePacerChange = (id: string, value: string) => {
    handleInputChange(id, 'pacer', value);
  };

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
    if (!file) return;

    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 5,
        maxWidthOrHeight: 1000,
        useWebWorker: true,
      });

      setMainImage(compressedFile);

      const reader = new FileReader();
      reader.onloadend = () => setMainPreview(reader.result as string);
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('대표 이미지 압축 실패:', error);
      alert('대표 이미지 압축 중 오류가 발생했습니다.');
    }

    e.target.value = ''; // input 초기화
  };

  const handleCourseImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const selectedArray = Array.from(selectedFiles);

    if (courseImages.length + selectedArray.length > 6) {
      alert('코스 사진은 최대 6장까지 업로드할 수 있습니다.');
      e.target.value = ''; // input 초기화
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
          setCoursePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(compressedFile);

        setCourseImages((prev) => [...prev, compressedFile]);
      }
    } catch (error) {
      console.error('코스 이미지 압축 실패:', error);
      alert('코스 이미지 압축 중 오류가 발생했습니다.');
    }

    e.target.value = ''; // input 초기화
  };

  const removeCourseImage = (index: number) => {
    setCourseImages((prev) => prev.filter((_, i) => i !== index));
    setCoursePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDateTimeChange = (date: Date | null, time: string) => {
    setDateTime({ date, time });
  };

  const handleSubmit = async () => {
    if (
      (previewFeaturesEnabled && capacity !== '' && (
      !Number.isInteger(Number(capacity)) || Number(capacity) < 1 || Number(capacity) > 1000)) ||
      !title ||
      !mainImage ||
      !location ||
      !content ||
      !dateTime.date ||
      pacerGroups.some((g) => !g.distance || !g.pace || (!previewFeaturesEnabled && !g.pacer))
    ) {
      alert('모든 정보를 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const [hours, minutes] = dateTime.time.split(':').map(Number);
      const selected = dateTime.date!;
      const local = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate(), hours, minutes);
      const request = {title, location, content, date: local.toISOString().slice(0,19), capacity: capacity === '' ? null : Number(capacity), groups: makePlans(pacerGroups)};
      const formData = new FormData();
      if (previewFeaturesEnabled) {
        formData.append('request', new Blob([JSON.stringify(request)], {type:'application/json'}));
      } else {
        formData.append('title', title);
        formData.append('location', location);
        formData.append('content', content);
        formData.append('date', request.date);
        pacerGroups.forEach((group, index) => {
          formData.append(`pacers[${index}].group`, group.id);
          formData.append(`pacers[${index}].pacerId`, group.pacer);
          formData.append(`pacers[${index}].distance`, group.distance);
          formData.append(`pacers[${index}].pace`, group.pace);
        });
      }
      if (mainImage) formData.append('postImage', mainImage);
      courseImages.forEach(file => formData.append('attachments', file));
      const response = await customAxios.post(previewFeaturesEnabled ? '/run/regular/recruitment' : '/run/regular/post', formData);
      if (!response.data.isSuccess) throw new Error(response.data.responseMessage);
      navigate(`/regular/${response.data.result.postId}`, {replace:true});
    } catch (error) { alert(error instanceof Error ? error.message : '정규런 생성 중 문제가 발생했습니다.'); }
    finally { setSubmitting(false); }
  };

  const handleDateChange = (date: Date | null) => {
    setDateTime((prev) => ({ ...prev, date }));
  };

  // 시간 입력 관련 상태 및 핸들러
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  const handleTimeChange = (time: string) => {
    setDateTime((prev) => ({ ...prev, time }));
  };

  return (
    <div className="flex flex-col items-center min-h-screen w-full max-w-[430px] mx-auto">
      <div className="flex items-center justify-center w-full h-[56px] px-5 mb-5 relative bg-kuDarkGreen">
        <div className="text-2xl font-semibold text-white text-center">정규런 만들기</div>
        <button onClick={() => navigate('/tab/regular')} className="absolute left-4">
          <img src={BackIcon} alt="뒤로가기" className="w-6 h-6" />
        </button>
      </div>

      <div className="w-full max-w-md px-4">
        <div className="my-2">제목</div>
        <input
          className="border rounded-lg w-full p-2"
          placeholder="제목을 입력하세요"
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="my-2">집합 장소</div>
        <input
          className="border rounded-lg w-full p-2"
          placeholder="장소명을 입력하세요"
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

        {previewFeaturesEnabled && <div className="flex gap-3 my-4">
          <div className="flex-1 text-sm"><TotalCapacityInput rows={pacerGroups} value={capacity} onChange={setCapacity} /></div>
        </div>}
        {/* 러닝 그룹 입력 UI */}
        <div className="flex flex-col items-center w-full max-w-md p-4 bg-white rounded-lg relative">
          {isBottomSheetOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-10"
              onClick={() => setIsBottomSheetOpen(false)}
            ></div>
          )}
          <h2 className="text-lg font-semibold mb-4 self-start">{previewFeaturesEnabled ? '러닝 그룹' : '페이서'}</h2>
          <div className="w-full">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-gray-700 border-b w-[50px]">그룹</th>
                  {!previewFeaturesEnabled && <th className="p-2 text-gray-700 border-b">페이서</th>}
                  <th className="p-2 text-gray-700 border-b w-[85px]">거리</th>
                  <th className="p-2 text-gray-700 border-b w-[70px]">페이스</th>
                  <th className="border-b">정원</th>
                  <th className="p-2 w-[40px] border-b"></th>
                </tr>
              </thead>
              <tbody>
                {pacerGroups.map((group) => (
                  <tr key={group.id} className="border-b border-gray-300">
                    <td className="p-2 text-gray-900 text-center w-[50px]">{group.id}</td>
                    {!previewFeaturesEnabled && <td className="p-2"><select aria-label={`${group.id} 그룹 페이서`} value={group.pacer} onChange={e => handlePacerChange(group.id, e.target.value)} className="w-full bg-white"><option value="">선택</option>{pacers.map(pacer => <option key={pacer.id} value={pacer.id}>{pacer.name}</option>)}</select></td>}
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
                    <td><GroupLimit row={group} onChange={v => handleInputChange(group.id, 'capacity', v)} /></td>
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
            disabled={pacerGroups.length >= 20}
            onClick={addPacerGroup}
            className="mt-4 w-full bg-kuDarkGreen text-white py-2 rounded-lg hover:bg-green-700"
          >
            그룹 추가
          </button>
          <CapacityNote />

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
                      {Array.from({ length: 11 }, (_, i) => (
                        <option key={i} value={String(i)}>
                          {i}
                        </option>
                      ))}
                    </select>
                    <span className="text-lg font-bold">:</span>
                    <select
                      className="p-2 border border-gray-300 rounded-lg w-16 text-center"
                      value={selectedSeconds}
                      onChange={(e) => setSelectedSeconds(e.target.value)}
                    >
                      {Array.from({ length: 6 }, (_, i) => {
                        const sec = i * 10;
                        const padded = String(sec).padStart(2, '0');
                        return (
                          <option key={padded} value={padded}>
                            {padded}
                          </option>
                        );
                      })}
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
          <h2 className="mb-2">대표 이미지 (필수)</h2>
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
          disabled={submitting}
          onClick={handleSubmit}
          className="w-full bg-[#366943] text-white py-3 rounded-lg mt-4"
        >
          만들기
        </button>
      </div>
    </div>
  );
}

export default NewRegularRunMake;

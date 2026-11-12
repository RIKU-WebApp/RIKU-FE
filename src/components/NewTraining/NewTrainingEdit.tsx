import RunCoverField from '../common/RunCoverField';
import { useOriginalRunFields } from '../../features/improvements/runEdit';
import { errorMessage } from '../../features/improvements/shared';
import { CapacityNote, GroupLimit, appendPlans, nextGroup, fromPlan, type PacePlan } from '../../features/improvements/PaceGroups';
import { useCapacityInput } from '../../features/improvements/RunWaitlist';
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
  capacity?: string;
  id: string;
  pacer: string;
  pacerIds?: number[];
  distance: string;
  pace: string;
}

function NewTrainingEdit() {
  const navigate = useNavigate();
  const { postId } = useParams();

  const limit = useCapacityInput('training', postId);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [content, setContent] = useState('');
  const original = useOriginalRunFields();
  const [dateTime, setDateTime] = useState<{ date: Date | null; time: string }>({
    date: null,
    time: '00:00',
  });
  const [pacerGroups, setPacerGroups] = useState<PacerGroup[]>([]);
  const [initialGroups, setInitialGroups] = useState<string>();
  const groupsChanged = initialGroups !== JSON.stringify(pacerGroups);
  const [pacers, setPacers] = useState<Pacer[]>([]);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [bottomSheetType, setBottomSheetType] = useState<'distance' | 'pace' | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedDistance, setSelectedDistance] = useState<string>('5');
  const [selectedMinutes, setSelectedMinutes] = useState<string>('5');
  const [selectedSeconds, setSelectedSeconds] = useState<string>('30');
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [savedImage, setSavedImage] = useState<string | null>(null);
  const [savedFit, setSavedFit] = useState(false);
  const [editedFit, setEditedFit] = useState<boolean>();
  const [participants, setParticipants] = useState(0);
  const [coverBusy, setCoverBusy] = useState(false);

  const [coursePreviews, setCoursePreviews] = useState<string[]>([]);
  const [originalUrls, setOriginalUrls] = useState<string[]>([]); // 서버에서 불러온 URL만 저장
  const [courseImages, setCourseImages] = useState<File[]>([]); // 새로 업로드한 파일

  useEffect(() => {
    const fetchPacers = async () => {
      const token = localStorage.getItem('accessToken') || 'null';
      const response = await customAxios.get('/pacers', {
        headers: { Authorization: `${token}` },
      });
      if (response.data.isSuccess) setPacers(response.data.result);
    };
    const fetchPostData = async () => {
      const token = localStorage.getItem('accessToken') || 'null';
      const res = await customAxios.get(`/run/training/post/${postId}`, {
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
        setCoursePreviews(result.attachmentUrls || []);
        setDateTime(original.load(result.date, result.attachmentUrls));
        const config = await customAxios.get('/run/training/post/' + postId + '/waitlist');
        const plans: PacePlan[] = config.data.result.groups ?? [];
        const assigned = result.pacers as {group:string; pacerId:number; distance:string; pace:string}[];
        const rows = plans.length ? plans.map(plan => ({...fromPlan(plan), distance: plan.distanceKm + ' km'}))
          : [...new Map(assigned.map(p => [p.group, {id:p.group,distance:p.distance,pace:p.pace}])).values()];
        const loaded = rows.map(row => ({...row, pacer:'', pacerIds: assigned.filter(p => p.group === row.id).map(p => p.pacerId)}));
        setPacerGroups(loaded);
        setInitialGroups(JSON.stringify(loaded));

        setCoursePreviews(result.attachmentUrls || []);
        setOriginalUrls(result.attachmentUrls || []);

        console.log(result);
      }
    };
    fetchPacers();
    fetchPostData();
  }, [postId]);

  const addPacerGroup = () => {
    const nextGroupId = nextGroup(pacerGroups);
    if (!nextGroupId) return;
    setPacerGroups([...pacerGroups, { id: nextGroupId, pacer: '', distance: '', pace: '' }]);
  };

  const removePacerGroup = (id: string) => {
    setPacerGroups(pacerGroups.filter((group) => group.id !== id));
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


  const handleCourseImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const selectedArray = Array.from(selectedFiles);

    const currentTotal = originalUrls.length + courseImages.length;

    if (currentTotal + selectedArray.length > 6) {
      alert('코스 사진은 최대 6장까지만 업로드할 수 있습니다.');
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
          setCoursePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(compressedFile);

        setCourseImages((prev) => [...prev, compressedFile]);
      }
    } catch (error) {
      console.error('코스 사진 압축 실패:', error);
      alert('코스 사진 압축 중 오류가 발생했습니다.');
    }

    e.target.value = '';
  };

  const handleSubmit = async () => {
    if (
      !title ||
      !location ||
      !content ||
      !dateTime.date ||
      pacerGroups.some((g) => !g.distance || !g.pace)
    ) {
      alert('모든 정보를 입력해주세요.');
      return;
    }
    try {
      const token = localStorage.getItem('accessToken') || 'null';
      const formData = new FormData();
      if (editedFit !== undefined) formData.append('showFullImage', String(editedFit));
      limit.append(formData);
      if (groupsChanged) {
        appendPlans(formData, pacerGroups);
        formData.append('replacePacers', 'true');
      }
      formData.append('title', title);
      formData.append('location', location);
      original.appendDate(formData, dateTime.date!, dateTime.time);
      formData.append('content', content);
      if (mainImage) formData.append('postImage', mainImage);
      let fileIndex = 0;
      if (original.changedPhotos(coursePreviews)) for (const preview of coursePreviews) {
        if (preview.startsWith('http')) {
          const res = await fetch(preview);
          const blob = await res.blob();
          const file = new File([blob], `original_${Date.now()}.jpg`, { type: blob.type });
          formData.append('attachments', file);
        } else if (preview.startsWith('data:')) {
          const file = courseImages[fileIndex];
          if (file) {
            formData.append('attachments', file);
            fileIndex++;
          }
        }
      }

      // attachments가 없으면 아무것도 append 안 함

      if (groupsChanged) pacerGroups.flatMap(group => (group.pacerIds ?? []).map(id => ({group,id}))).forEach(({group,id}, index) => {
        formData.append(`pacers[${index}].group`, group.id);
        formData.append(`pacers[${index}].pacerId`, String(id));
        formData.append(`pacers[${index}].distance`, group.distance);
        formData.append(`pacers[${index}].pace`, group.pace);
      });

      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: [File] name=${value.name}, size=${value.size}`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      const response = await customAxios.patch(`/run/training/post/${postId}`, formData, {
        headers: {
          Authorization: `${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.isSuccess) {
        alert('훈련이 성공적으로 수정되었습니다!');

        console.log(formData);
        navigate(`/training/${postId}`, { replace: true });
      } else {
        alert(`요청 실패: ${response.data.responseMessage}`);
        console.log(response.data);
      }
    } catch (error) {
      console.error('훈련 수정 중 오류:', error);
      alert(errorMessage(error));
    }
  };



  const removeCourseImage = (index: number) => {
    const toRemove = coursePreviews[index];
    setCoursePreviews((prev) => prev.filter((_, i) => i !== index));

    if (toRemove.startsWith('http')) {
      setOriginalUrls((prev) => prev.filter((url) => url !== toRemove));
    } else {
      setCourseImages((prev) => {
        const fileIndex = index - originalUrls.length;
        return prev.filter((_, i) => i !== fileIndex);
      });
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="max-w-[430px] w-full">
        <div className="flex items-center justify-center w-full h-[56px] px-5 mb-5 relative bg-kuDarkGreen">
          <div className="text-2xl font-semibold text-white text-center">훈련 수정</div>
          <button onClick={() => navigate(-1)} className="absolute left-4">
            <img src={BackIcon} alt="뒤로가기" className="w-6 h-6" />
          </button>
        </div>
      </div>
      <div className="w-full max-w-md px-4">
        {limit.fieldFor(pacerGroups)}
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

        {/* <div className="my-2">날짜 및 시간</div> */}
        {/* <DateNtime onDateTimeChange={handleDateTimeChange} /> */}

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

        {/* 페이서 UI는 기존 그대로 유지 */}
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
                  <th className="border-b">정원</th>
                  <th className="p-2 w-[40px] border-b"></th>
                </tr>
              </thead>
              <tbody>
                {pacerGroups.map((group) => (
                  <tr key={group.id} className="border-b border-gray-300">
                    <td className="p-2 text-gray-900 text-center w-[50px]">{group.id}</td>
                    <td className="p-2">
                      <details>
                        <summary className="cursor-pointer">{pacers.filter(p => group.pacerIds?.includes(p.id)).map(p => p.name || p.pacerName).join(', ') || '선택'}</summary>
                        {pacers.map(p => <label key={p.id} className="flex items-center gap-1 py-1">
                          <input type="checkbox" checked={group.pacerIds?.includes(p.id) ?? false}
                            onChange={e => {
                              const ids = group.pacerIds ?? [];
                              const pacerIds = e.target.checked ? [...ids, p.id] : ids.filter(id => id !== p.id);
                              setPacerGroups(rows => rows.map(row => row.id === group.id ? {...row, pacerIds} : row));
                            }} />
                          {p.name || p.pacerName}
                        </label>)}
                      </details>
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
            onClick={addPacerGroup}
            className="mt-4 w-full bg-kuDarkGreen text-white py-2 rounded-lg hover:bg-green-700"
          >
            페이서 그룹 추가
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

        <RunCoverField runLabel="훈련" title={title} dateTime={dateTime}
          savedImage={savedImage} participants={participants} showFullImage={editedFit ?? savedFit} onFitChange={setEditedFit}
          onFileChange={setMainImage} onBusyChange={setCoverBusy} />

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
          disabled={coverBusy || initialGroups === undefined}
          onClick={handleSubmit}
          className="w-full bg-[#366943] text-white py-3 rounded-lg mt-4"
        >
          수정하기
        </button>
      </div>
    </div>
  );
}

export default NewTrainingEdit;

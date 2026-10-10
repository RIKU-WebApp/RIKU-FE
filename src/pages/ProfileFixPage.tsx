import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Link 컴포넌트 import
import customAxios from '@shared/lib/customAxios';
import pencil_Icon from '@assets/Main-img/pencil.svg'; //연필 로고 불러오기
import ActionBar from '@shared/ui/ActionBar';
import defaultProfileImg from '@assets/default_profile.png';
import imageCompression from 'browser-image-compression'; //이미지 압축을 위한 라이브러리 추가

import EyeIcon from '@assets/visibility_true.svg';
import EyeOffIcon from '@assets/visibility_false.svg';

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string, isValid?: boolean) => void;
  disabled?: boolean;
  password?: boolean;
  errorMessage?: string;
  hasError?: boolean;
  placeholder?: string;
}

//입력 필드 공통 컴포넌트
const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  disabled = false,
  password = false,
  errorMessage = '',
  hasError = false,
  placeholder = '',
}) => {
  const [showPassword, setShowPassword] = useState(false); //비밀번호 입력창인 경우 비밀번호를 보여주는 여부
  const inputType = password ? (showPassword ? 'text' : 'password') : 'text';

  return (
    <div className="mb-6 max-w-[430px] w-full mx-auto">
      <label className="block mb-2 text-m font-semibold text-gray-700">{label}</label>
      <div className="relative w-full">
        <input
          className={`w-full border rounded-xl px-3 py-3 ${
            hasError
              ? 'border-red-500 focus:outline-red-600'
              : 'border-kuCoolGray focus:outline-kuDarkGreen'
          }`}
          value={value}
          onChange={(e) => {
            const newValue = e.target.value;
            if (password) {
              const { valid } = validatePassword(newValue);
              onChange(newValue, valid);
            } else {
              onChange(newValue);
            }
          }}
          disabled={disabled}
          type={inputType}
          placeholder={placeholder}
        />
        {password && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
          >
            {showPassword ? (
              <img src={EyeIcon} className="w-4 h-4" />
            ) : (
              <img src={EyeOffIcon} className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      {/*에러 메시지 렌더링 추가*/}
      {hasError && errorMessage && <p className="mt-2 text-sm text-red-500">{errorMessage}</p>}
    </div>
  );
};

//"학교 정보" 입력 컴포넌트
const SchoolInfoInputField: React.FC<{
  label: string;
  value: string[];
  onChange_1: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChange_2: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, value, onChange_1, onChange_2 }) => (
  <div className="mb-6 max-w-[430px] w-full mx-auto">
    <label className="block mb-2 text-m font-semibold text-gray-700">{label}</label>
    <input
      className="w-full border border-kuCoolGray rounded-xl px-3 py-3 mb-4 focus: outline-kuDarkGreen"
      value={value[0]}
      onChange={onChange_1}
      disabled
    />
    {/* 학과 입력란 */}
    <input
      className="read-only w-full border border-kuCoolGray rounded-xl px-3 py-3 focus: outline-kuDarkGreen"
      value={value[1]}
      onChange={onChange_2}
      disabled
    />
  </div>
);

//비밀번호가 유효한지 확인하는 메소드 validatePassword
function validatePassword(password: string) {
  // 영문, 숫자, 특수문자 조합 8~20자리까지 가능
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;

  if (!passwordRegex.test(password)) {
    return { valid: false, message: '영문, 숫자, 특수문자 조합 8~20자리까지 가능합니다.' };
  } else {
    return { valid: true, message: '유효한 비밀번호 형식입니다' };
  }
}

//한 달 달력에 들어갈 내용(날짜(Date))들의 배열을 만든다.
function ProfileFixPage() {
  const navigate = useNavigate(); //useNavigate 훅을 사용해 navigate 함수 생성

  const [name, setName] = useState('허기철'); //이름
  const [collegeName, setCollegeName] = useState('공과대학'); //학교 정보-단과대명
  const [departmentName, setDepartmentName] = useState('힙합공학부'); //학교 정보-학과명
  const [telNum, setTelNum] = useState(''); //전화번호
  const [telNumChanged, setTelNumChanged] = useState(false); //전화번호가 바뀌었는지 확인하는 state
  const [studentID, setStudentID] = useState('201911291'); //학번(ID)
  const [userProfileImageUrl, setUserProfileImageUrl] = useState(''); //유저 프로필 이미지 url

  //비밀번호 유효성 검사 관련
  const [password, setPassword] = useState(''); //비밀번호
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  //프로필 이미지 관련
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  //클릭 시 input 열기 위한 ref 추가
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleEditClick = () => {
    fileInputRef.current?.click();
  };

  //저장 버튼 클릭 시 처리하는 이벤트 (FormData에 password, 이미지, 전화번호 값을 담아서 보낼 것임)
  async function handleSubmitBtnClick() {
    const formData = new FormData();

    if (telNum) formData.append('phone', telNum);
    if (selectedImage) formData.append('userProfileImg', selectedImage);
    if (password !== '') formData.append('password', password); //비밀번호가 공백이라면, 빈 채로 보내줘야 함

    try {
      const accessToken = localStorage.getItem('accessToken') || ''; //localStorage에 저장된 accessToken 값이 없으면 ''으로 초기화
      const url = `/user/profile`;
      const response = await customAxios.patch(url, formData, {
        headers: {
          Authorization: accessToken,
          'Content-Type': 'multipart/form-data',
        },
      });

      //성공했다면
      if (response.data.isSuccess) {
        alert('프로필 수정에 성공했습니다.');
        navigate('/tab/my-page');
      } else {
        alert(response.data.errors.message);
      }
    } catch (error) {
      console.error('프로필 수정 실패:', error);
      alert('프로필 수정 실패!');
    }
  }

  const MAX_FILE_SIZE = 3 * 1024 * 1024; // 업로드 최대 가능 용량: 3MB로 우선 하드코딩

  //파일 선택 시 -> file 객체 상태에 저장 + 미리보기 URL 생성하는 메소드 handleFileChange
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return; //file이 null일 경우, return

    try {
      const options = {
        maxSizeMB: 1, //최대 1MB 목표 (가볍게 하려면 추후 0.5로도 가능할 듯)
        maxWidthOrHeight: 512, //가로/세로 길이 제한
        useWebWorker: true,
        fileType: 'image/webp', //변환 포맴ㅅ 지정 (브라우저 지원 범위 고려해서..)
      };

      const compressedFile = await imageCompression(file, options); //압축할 것임

      // 압축 후에도 3MB를 초과한다면 업로드 금지
      if (compressedFile.size > MAX_FILE_SIZE) {
        alert('압축 후에도 파일이 너무 큽니다. 다른 파일을 선택해 주세요.');
        return;
      }
      setSelectedImage(compressedFile);
      setPreviewUrl(URL.createObjectURL(compressedFile)); // 미리보기용 URL 생성
    } catch (error) {
      console.error('이미지 압축 실패: ', error);
      alert('이미지 압축하는 도중에 오류가 발생함!');
    }
  };

  //핸드폰 번호의 정보가 바뀌었을 때 바뀌었다는 것을 표시하기 위한 handleTelNumChanged
  const handleTelNumChanged = useCallback((value: string) => {
    if (!telNumChanged) {
      setTelNumChanged(true); //전화번호가 바뀌었다고 표시한다
    }
    setTelNum(value);
  }, []);

  //저장하기 전에 필수 form이 다 채워졌나 확인하는 변수들 (전화번호를 제외한 모든 form이 채워져 있어야 함), 그리고 이를 검증하는 isFormsValid() 함수
  const isPasswordFormValid = password.trim() === '' || isPasswordValid;

  function isFormsValid() {
    //비번도 비어있는 상태이고, 프사 선택도 안했다면, 가차없이 false 반환
    if (password.trim() === '' && selectedImage === null && telNumChanged === false) return false;

    if (isPasswordFormValid) {
      //비밀번호가 유효한 경우
      return true;
    } else {
      //비밀번호가 유효하지 않은 경우
      return false;
    }
  }

  //유저 세부 정보를 불러오는 fetchUserDetailedProfile()
  async function fetchUserDetailedProfile() {
    try {
      const url = '/user/profile/detail';
      const accessToken = localStorage.getItem('accessToken') || ''; //localStorage에 저장된 accessToken 값이 없으면 ''으로 초기화
      const response = await customAxios.get(url, {
        headers: {
          Authorization: accessToken,
        },
      });

      //400, 405, 500 오류일 경우, catch가 잡아줄 것이므로 따로 예외처리할 필요 없을 듯
      setName(response.data.result.name);
      setCollegeName(response.data.result.college);
      setDepartmentName(response.data.result.major);
      setTelNum(response.data.result.phone);
      setStudentID(response.data.result.studentId);
      setUserProfileImageUrl(response.data.result.profileImageUrl);
    } catch (error) {
      console.error('프로필 불러오기 실패:', error);
      alert('프로필 불러오기 실패!');
    }
  }

  //password를 바꿨을 때를 컨트롤 하는 handlePasswordChange
  const handlePasswordChange = (value: string, isValid?: boolean) => {
    setPassword(value);
    if (typeof isValid === 'boolean') {
      setIsPasswordValid(isValid);
      setPasswordError(isValid ? '' : '영문, 숫자, 특수문자 조합 8~20자리까지 가능합니다.');
    }
  };

  //페이지 최초 로딩 1회 시에 유저 정보를 불러와야 함
  useEffect(() => {
    fetchUserDetailedProfile();
  }, []);

  return (
    <>
      <ActionBar />
      <div className="min-h-screen max-w-[430px] w-full mx-auto flex flex-col items-center justify-start bg-white pt-[56px] pb-20">
        <div className="w-full text-left mt-2 mb-16 p-4 pl-8">
          <span className="text-2xl font-bold">프로필 수정</span>
        </div>
        <div className="relative w-full">
          {/* 프로필 사진 */}
          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-28 h-28 rounded-full bg-gray-300 border-[4px] border-kuDarkGreen overflow-hidden">
              <img
                src={previewUrl || (userProfileImageUrl ?? defaultProfileImg)}
                alt="1st"
                className="w-full h-full object-cover"
              />
              {/* 연필 아이콘 */}
              <div
                onClick={handleEditClick}
                className="absolute top-0 right-0 bg-kuDarkGreen p-1.5 rounded-full cursor-pointer"
              >
                <img src={pencil_Icon} alt="Pencil Icon" className="h-5 w-5" />
              </div>
              {/* 숨겨진 파일 input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* 기준이 되는 하단 박스 */}
          <div className="bg-whiteSmoke w-full pt-16 pb-4 pl-8 pr-8">
            <InputField label="이름" value={name} onChange={setName} disabled />
            <SchoolInfoInputField
              label="학교 정보"
              value={[collegeName, departmentName]}
              onChange_1={(e) => setCollegeName(e.target.value)}
              onChange_2={(e) => setDepartmentName(e.target.value)}
            />
            <InputField
              label="전화번호"
              value={telNum}
              onChange={handleTelNumChanged}
              placeholder="ex) 010-1111-2222"
            />
            <InputField label="학번(ID)" value={studentID} onChange={setStudentID} disabled />
            <InputField
              label="비밀번호"
              value={password}
              onChange={handlePasswordChange}
              password={true}
              hasError={!isPasswordValid && password.length > 0}
              errorMessage={passwordError}
            />
          </div>

          {/* 저장 버튼 */}
          <div className="w-full text-left p-4 pr-8 pl-8">
            <button
              disabled={!isFormsValid()}
              onClick={handleSubmitBtnClick}
              className={`w-full font-bold text-xl py-3 rounded-lg mt-6
            ${
              isFormsValid()
                ? 'bg-kuDarkGreen text-white hover:bg-kuGreen'
                : 'bg-kuLightGray text-white'
            }`}
            >
              저장하기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfileFixPage;

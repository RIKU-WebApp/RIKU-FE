import { useEffect, useState } from 'react';
import { useCreateAccountData } from '@features/auth/hooks/useCreateAccountData';

// 단과대학, 학과 정보 입력 컴포넌트에 대한 비즈니스 로직을 담당하는 훅
function useSchoolInfoInputData() {
  const { setSignupData, handleNext } = useCreateAccountData(); // '회원가입 페이지' 전체의 비즈니스 로직을 담당하는 훅에서 필요한 것만 가져오기

  const [college, setCollege] = useState<string>(''); //단과대 이름
  const [major, setMajorInput] = useState<string>(''); //학과(학부) 이름
  const [gotoNextScreenValid, setGotoNextScreenValid] = useState(false); //다음 화면으로 넘어가도 되는지 체크하는 valid값

  // 단과대 이름 변경 시 취하는 액션을 정의한 handleChangeCollege 메소드
  const handleChangeCollege = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCollegeName = e.target.value;
    setCollege(selectedCollegeName);
    setMajorInput('');
  };

  // 학과 이름 변경 시 취하는 액션을 정의한 handleChangeMajor 메소드
  const handleChangeMajor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setMajorInput(input);
  };

  // 단과대학, 학과 정보 입력 후 '다음' 버튼을 입력했을 경우
  const handleSubmitSchoolInfo = (e: React.FormEvent) => {
    e.preventDefault();

    if (!gotoNextScreenValid) return;

    const finalMajor = college === 'KU자율전공학부' ? '미정' : major;

    setSignupData((prev) => ({
      ...prev,
      college,
      major: finalMajor,
    })); // 단과대학, 학과 정보 signupData에 저장
    handleNext(); // 다음 step으로 핸들링
  };

  // 다음 화면으로 넘어갈 수 있는 valid값은 useState를 통해 관리한다(college, major 값이 변할 때에만 동작하도록 설계)
  useEffect(() => {
    if (college !== '' && (college === 'KU자율전공학부' || major !== '')) {
      setGotoNextScreenValid(true);
    } else {
      setGotoNextScreenValid(false);
    }
  }, [college, major, setGotoNextScreenValid]);

  return {
    college,
    setCollege,
    handleChangeCollege,
    major,
    setMajorInput,
    handleChangeMajor,
    handleSubmitSchoolInfo,
    gotoNextScreenValid,
    setGotoNextScreenValid,
  };
}

export default useSchoolInfoInputData;

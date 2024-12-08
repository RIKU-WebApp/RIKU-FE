import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; //react-router-dom 라이브러리를 사용 (useNavigation 사용할 예정)

import { useDispatch } from 'react-redux'; 
import { setCollegeName, setDepartmentName } from '../../redux/slices/signupSlice' //Action Creator를 import 해온다!

//학교 이름을 입력하는 화면인 SchoolInputInfo
function SchoolInputInfo() {
  const navigate = useNavigate(); //제출 후에 다음 화면으로 넘어가기 위해 useNavigate() hook 활용!

  const dispatch = useDispatch(); //redux 사용을 위해 dispatch
  
  const [collegeName, setCollegeNameInput] = useState<string>(""); //단과대 이름
  const [departmentName, setDepartmentNameInput] = useState<string>("") //학과(학부) 이름
  const [gotoNextScreenValid, setGotoNextScreenValid] = useState(false); //다음 화면으로 넘어가도 되는지 체크하는 valid값

  const handleChangeCollegeName = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCollegeName = e.target.value;
    setCollegeNameInput(selectedCollegeName);
    setDepartmentNameInput('');
  };

  const handleChangeDepartmentName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setDepartmentNameInput(input);
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    //이름에는 유효한 입력 상태가 딱히 존재하지 않으므로, 바로 다음 버튼을 누를 경우, alert()를 띄우며 navigate를 통해 다음으로 넘어가도록 한다
    alert("학교 정보 입력을 완료했습니다");

    //redux 저장소에 입력 정보들 저장
    dispatch(setCollegeName(collegeName));
    dispatch(setDepartmentName(departmentName));
    
    navigate('/telNum-input')
  };

  //다음 화면으로 넘어갈 수 있는 valid값은 useState를 통해 관리한다(collegeName, departmentName 값이 변할 때에만 동작하도록 설계)
  useEffect(() => {
    if(collegeName !== "" && departmentName !== "")
    {
        setGotoNextScreenValid(true);
    } else {
        setGotoNextScreenValid(false);
    }
  }, [collegeName, departmentName])

  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-white px-6 py-10">
      {/* Header 부분(뒤로가기 버튼과 Progress 번호 있는 곳) */}
      <div className="flex justify-between items-center w-full max-w-sm">
        <button onClick={() => navigate(-1)} className="text-black text-lg">
          &larr;
        </button>
        <span className="text-gray-400 text-sm">4/5</span>
      </div>

      
  
      {/* Main Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm mt-16">
        {/* '아이디를 입력해 주세요' 텍스트 */}
        <div className="w-full max-w-sm">
          <h1 className="text-left font-bold text-2xl text-black mb-12">학교 정보를 입력해 주세요.</h1>
        </div>
  
        {/* 단과대 입력 필드(드롭다운 형식) */}
        <div className="mb-6">
          <select
            value={collegeName}
            onChange={handleChangeCollegeName}
            className={`w-full px-4 py-2 border 'border-gray-300' rounded-md focus:outline-none`}
          >
            <option value="">단과대를 선택해 주세요</option>
            <option value="문과대학">문과대학</option>
            <option value="이과대학">이과대학</option>
            <option value="건축대학">건축대학</option>
            <option value="공과대학">공과대학</option>
            <option value="사회과학대학">사회과학대학</option>
            <option value="경영대학">경영대학</option>
            <option value="부동산과학원">부동산과학원</option>
            <option value="KU융합과학기술원">KU융합과학기술원</option>
            <option value="상허생명과학대학">상허생명과학대학</option>
            <option value="수의과대학">수의과대학</option>
            <option value="예술디자인대학">예술디자인대학</option>
            <option value="사범대학">사범대학</option>
            <option value="언어교육원">언어교육원</option>
            <option value="대학원">대학원</option>
        </select>
        {collegeName !== '' ? (
            <input
            type="text"
            value={departmentName}
            onChange={handleChangeDepartmentName}
            placeholder="학과(학부)를 입력해주세요"
            className={`w-full px-4 py-2 border 'border-gray-300' rounded-md focus:outline-none mt-4`}
          />
        ) : (
            null
        )}

        </div>

        {/* 다음 버튼 */}
        <button
          type="submit"
          className={`w-full py-3 mt-72 rounded-md ${(collegeName !== '' && departmentName !== '') ? 'bg-kuDarkGreen text-kuWhite hover: hover:bg-kuGreen' : ' text-gray-500 bg-gray-100'} transition-colors`}
          disabled={!gotoNextScreenValid}
        >
          다음
        </button>
      </form>

      {/* 빈 공간 추가 */}
      <div className="mb-4"></div>
    </div>
  );
  
}

export default SchoolInputInfo;
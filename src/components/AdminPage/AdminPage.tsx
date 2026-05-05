import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Link 컴포넌트 import
import customAxios from '@/shared/lib/customAxios';
import riku_logo from '@assets/riku_logo_loginPage.png'; //라이쿠 로고 불러오기

//회원 정보와 관련된 객체 정보를 정의한 Member interface
interface Member {
  studentId: string;
  userName: string;
  college: string;
  major: string;
  phone: string | null;
  points: number;
  participationCount: number;
  userRole: string;
  isPacer: boolean;
}

//운영진 페이지
//회원 정보를 모두 조회하고, 권한 변경 및 회원 삭제를 할 수 있는 API 필요
function AdminPage() {
  const navigate = useNavigate(); //useNavigate 훅을 사용해 navigate 함수 생성

  //필요한 state 정의
  const [members, setMembers] = useState<Member[]>([]);
  const [editedMembers, setEditedMembers] = useState<Member[]>([]);
  const [roleChangedMembers, setRoleChangedMembers] = useState<Member[]>([]); //역할 바뀐 놈들 저장
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Member;
    sortDirection: 'asc' | 'desc';
  } | null>(null);

  //회원 정보 불러올 함수 fetchMembers()
  async function fetchMembers() {
    const accessToken = localStorage.getItem('accessToken') || ''; //localStorage에 저장된 accessToken 값이 없으면 ''으로 초기화
    const url = '/admin';

    try {
      const response = await customAxios.get(
        url, //요청 url
        {
          headers: {
            Authorization: accessToken, //accessToken을 헤더로 추가해서 요청 보냄
          },
        }
      );

      const fetchedMembers = response.data.result.map((user: Member) => ({
        studentId: user.studentId,
        userName: user.userName,
        college: user.college,
        major: user.major,
        phone: user.phone,
        points: user.points,
        participationCount: user.participationCount,
        userRole: user.userRole,
        isPacer: user.isPacer, //이 친구가 페이서인지 아닌지 판명
      }));

      setMembers(fetchedMembers);
      setEditedMembers(fetchedMembers);
    } catch {
      alert('회원 정보를 가져 오는 데 실패했습니다');
    }
  }

  //API를 이용해서 서버로부터 데이터를 가져오는 작업
  useEffect(() => {
    // setMembers(dummyData);
    // setEditedMembers(dummyData);
    fetchMembers();
  }, []);

  //회원 등급(userRole)을 바꾸기 위한 드롭다운 핸들링 함수 handleRoleChange
  function handleRoleChange(index: number, newRole: string) {
    const updatedMembers = [...editedMembers];
    const changedMember = { ...updatedMembers[index], userRole: newRole }; //바뀐 친구들
    updatedMembers[index] = changedMember;

    //이미 변경된 회원이 있다면 기존 정보를 제거하고 새 정보로 업데이트 해야 함
    const updatedRoleChangedMembers = roleChangedMembers.filter(
      (member) => member.studentId !== changedMember.studentId
    );
    updatedRoleChangedMembers.push(changedMember);

    //상태 업데이트
    setEditedMembers(updatedMembers);
    setRoleChangedMembers(updatedRoleChangedMembers);
  }

  //페이서 여부(isPacer)를 토글하기 위한 핸들러 함수 handlePacerToggle
  const handlePacerToggle = (index: number) => {
    const updatedMembers = [...editedMembers];
    const changedMember = {
      ...updatedMembers[index],
      isPacer: !updatedMembers[index].isPacer,
    };
    updatedMembers[index] = changedMember;

    //바뀐 멤버가 기존의 roleChangedMembers에 있는지 확인 후 추가 or 교체
    const updatedRoleChanged = roleChangedMembers.filter(
      (m) => m.studentId !== changedMember.studentId
    );
    updatedRoleChanged.push(changedMember);

    //상태 업데이트
    setEditedMembers(updatedMembers);
    setRoleChangedMembers(updatedRoleChanged);
  };

  //회원 정보 관련해서 분기 처리를 한 함수에서 처리해서 유틸 함수화
  function compareValues(
    a: string | number | boolean | null,
    b: string | number | boolean | null,
    direction: 'asc' | 'desc'
  ) {
    //telNum 옵션에서 null이 발생할 수 있음, 이에 대해선 예외 처리를 해주어야 함
    if (a === null || b === null) return a === b ? 0 : a === null ? 1 : -1;

    // boolean 처리
    if (typeof a === 'boolean' && typeof b === 'boolean') {
      const aNum = a ? 1 : 0;
      const bNum = b ? 1 : 0;
      return direction === 'asc' ? aNum - bNum : bNum - aNum;
    }

    // 타입 안전한 비교 (number vs string)
    if (typeof a === 'number' && typeof b === 'number') {
      return direction === 'asc' ? a - b : b - a;
    }

    // 문자열 비교 (localeCompare로 안정성 확보한다 --> 다국어 문자열 비교 지원을 하나, 성능이 부등호 보단 다소 느릴 수 있음)
    return direction === 'asc'
      ? String(a).localeCompare(String(b))
      : String(b).localeCompare(String(a));
  }

  //회원 정보들을 정렬하기 위한 handleSort
  function handleSort(key: keyof Member) {
    let sortDirection: 'asc' | 'desc' = 'asc'; //내림차순(desc) 혹은 오름차순(asc) 옵션 관련한 자료형 sortDirection 선언

    //sortConfig 값이 null이 아니라면, sortDirection을 반전 시킨다
    if (sortConfig && sortConfig.key === key && sortConfig.sortDirection === 'asc') {
      sortDirection = 'desc';
    }

    const sortedMembers = [...editedMembers].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      return compareValues(aValue, bValue, sortDirection); //해당 함수를 통해 number, string 둘 다에 대해 정렬 가능
    });

    setEditedMembers(sortedMembers);
    setSortConfig({ key, sortDirection }); //sortConfig 재설정
  }

  //저장하는 프로세스를 핸들링하는 메소드 handleSave
  async function handleSave() {
    try {
      const accessToken = localStorage.getItem('accessToken') || ''; //localStorage에 저장된 accessToken 값이 없으면 ''으로 초기화
      const url = '/admin';
      //roleChangedMembers 배열의 요소들에서 studentId, userName만을 추출
      const payload = roleChangedMembers.map(({ studentId, userRole, isPacer }) => ({
        studentId,
        userRole,
        isPacer,
      }));
      //바뀐 친구가 없다면(roleChangedMembers에 들어간 놈이 아무것도 없다면..)
      if (payload.length === 0) {
        alert('현재 바뀐 정보가 없습니다.');
      } else {
        await customAxios.patch(url, payload, {
          headers: {
            Authorization: accessToken, //accessToken을 헤더로 추가해서 요청 보냄
          },
        }); //추후 해당하는 api 엔드포인트로 교체할 예정
        alert('성공적으로 회원 정보 수정이 완료 되었습니다!');
        navigate('/tab/my-page');
      }
    } catch (error) {
      console.error('수정 사항을 저장하는 데 오류가 발생했습니다', error);
      alert('수정 사항을 저장하는 데 오류가 발생했습니다!');
    }
  }

  //editedMembers state를 초기화하는 프로세스를 핸들링하는 메소드 handleReset
  function handleReset() {
    setEditedMembers([...members]);
  }

  //마이 페이지로 돌아가는 버튼
  function handleToMyPage() {
    navigate('/tab/my-page');
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-8">
        <img src={riku_logo} alt="Logo" className="h-10 mr-4" />
        <span className="text-2xl font-bold">회원 정보 관리</span>
      </div>
      <div className="flex items-center ml-4 mbs-4">
        {/* 유의사항 및 총 인원 표시 */}
        <span className="text-sm font-bold">
          참고 사항: 표의 제목을 누르실 경우, 각 항목에 대해 정렬하여 조회하실 수 있습니다
        </span>
        <span className="text-sm font-bold">총 인원: {members.length}명</span>
      </div>
      <div className="overflow-x-auto">
        <table className="table-auto w-[1220px] text-left border-collapse">
          {/*표 상단의 header 부분 렌더링*/}
          <thead>
            <tr>
              {[
                '학번',
                '이름',
                '단과대학명',
                '전공명',
                '전화번호',
                '포인트',
                '활동내역 갯수',
                '회원등급',
                '페이서 여부',
              ].map((header, index) => (
                <th
                  key={index}
                  className="px-4 py-2 border-b cursor-pointer"
                  onClick={() =>
                    handleSort(
                      [
                        'studentId',
                        'userName',
                        'college',
                        'major',
                        'phone',
                        'points',
                        'participationCount',
                        'userRole',
                        'isPacer',
                      ][index] as keyof Member
                    )
                  }
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          {/*표 하단의 회원 정보 출력하는 부분 렌더링*/}
          <tbody>
            {editedMembers.map((member, index) => (
              <tr key={index}>
                <td className="px-4 py-2 border-b">{member.studentId}</td>
                <td className="px-4 py-2 border-b">{member.userName}</td>
                <td className="px-4 py-2 border-b">{member.college}</td>
                <td className="px-4 py-2 border-b">{member.major}</td>
                <td className="px-4 py-2 border-b">{member.phone}</td>
                <td className="px-4 py-2 border-b">{member.points}</td>
                <td className="px-4 py-2 border-b">{member.participationCount}</td>
                <td className="px-4 py-2 border-b">
                  <select
                    value={member.userRole}
                    onChange={(e) => handleRoleChange(index, e.target.value)}
                    className="border rounded p-1"
                  >
                    <option value="NEW_MEMBER">신입 부원</option>
                    <option value="MEMBER">일반 부원</option>
                    <option value="ADMIN">운영진</option>
                    <option value="INACTIVE">비활성화 사용자</option>
                  </select>
                </td>
                <td className="px-4 py-2 border-b text-center">
                  <input
                    type="checkbox"
                    checked={member.isPacer}
                    onChange={() => handlePacerToggle(index)}
                    className="w-4 h-4 mr-2 accent-kuDarkGreen"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-4 space-x-4">
        <button
          onClick={handleToMyPage}
          className="bg-kuLightGreen text-black px-4 py-2 rounded hover:bg-gray-400"
        >
          마이 페이지로 돌아가기
        </button>
        <button
          onClick={handleReset}
          className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-400"
        >
          초기화
        </button>
        <button
          onClick={handleSave}
          className="bg-kuDarkGreen text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          저장
        </button>
      </div>
    </div>
  );
}

export default AdminPage;

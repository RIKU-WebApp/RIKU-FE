import customAxios from '@shared/apis/customAxios';

// 학번 중복 검사 요청하는 api 함수
async function getIsStudentidValidate(studentID: string) {
  try {
    const response = await customAxios.get(`/user/check-id?studentId=${studentID}`);
    //중복 확인 검사 성공했을 경우에만 (result 값이 false여야 함)
    if (response.data.result === false) {
      // alert("학번이 유효합니다! 다음 단계로 넘어갑니다.");
      return true;
    } else {
      //중복 검사 실패 (겹치는 놈 있음)
      alert('이미 가입된 학번입니다. 다른 학번으로 가입을 다시 시도해 주세요.');
      return false;
    }
  } catch (error) {
    console.error('예상치 못한 오류 발생, 오류 내용: ', error);
    return false;
  }
}

export default getIsStudentidValidate;

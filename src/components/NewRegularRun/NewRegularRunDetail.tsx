import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import customAxios from '@/shared/lib/customAxios';
import NewRegularRunAdmin from './NewRegularRunAdmin';
import NewRegularRunUser from './NewRegularRunUser';

interface Participant {
  id: number;
  name: string;
  profileImage?: string | null;
  isPresent: boolean;
}

interface DetailData {
  title: string;
  location: string;
  date: string;
  content: string;
  userName: string;
  participantsNum: number;
  participants: Participant[];
  adminId: number;
  postimgurl: string;
}

const NewRegularRunDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>(); // URL의 postId 파라미터 가져오기
  const navigate = useNavigate(); // 페이지 이동 훅
  const [detailData, setDetailData] = useState<DetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const myId = JSON.parse(localStorage.getItem('MyId') || 'null');
  const location = useLocation();
  const listPath = '/tab/regular';

  useEffect(() => {
    // 공유 링크가 앱의 첫 방문 기록이면 브라우저 뒤로가기도 목록으로 연결한다.
    if (window.history.state?.idx !== 0) return;
    navigate(listPath, { replace: true });
    navigate(location.pathname + location.search + location.hash, {
      state: { ...location.state, fromRunList: listPath },
    });
  }, [location, navigate]);

  function handleBack() {
    if (location.state?.fromRunList === listPath) navigate(-1);
    else navigate(listPath, { replace: true });
  }
  // 서버에서 데이터를 가져오는 함수
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem('accessToken') || 'null';
        const response = await customAxios.get(`/run/regular/post/${postId}`, {
          headers: {
            Authorization: `${token}`,
          },
        });
        console.log(myId);

        if (response.data.isSuccess) {
          const result = response.data.result;
          setDetailData({
            title: result.title,
            location: result.location,
            date: new Date(result.date).toLocaleDateString('ko-KR', {
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            }),
            content: result.content,
            userName: result.userName,
            participantsNum: result.participantsNum,
            participants: result.participants,
            adminId: result.postCreatorInfo.userId,
            postimgurl: result.postImageUrl,
          });
          console.log(response.data);
        } else {
          console.error('데이터를 불러오지 못했습니다:', response.data.responseMessage);
          setError(response.data.responseMessage || '데이터를 불러오지 못했습니다.');
        }
      } catch (error) {
        console.error('API 요청 오류:', error);
        setError('데이터를 불러오지 못했습니다. 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [postId, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!detailData) {
    return <div className="max-w-[430px] mx-auto p-5"><p role="alert">{error || '데이터가 없습니다.'}</p><button className="mt-4 text-kuDarkGreen" onClick={() => navigate('/tab/regular', {replace:true})}>목록으로</button></div>;
  }
  if (detailData.adminId == myId)
    // 내 userId와 게시글 만든 사람의 Id 비교후 렌더링
    return <NewRegularRunAdmin {...detailData} postId={postId} onBack={handleBack} />;
  else return <NewRegularRunUser {...detailData} postId={postId} onBack={handleBack} />;
};

export default NewRegularRunDetail;

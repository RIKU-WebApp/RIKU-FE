import { useRunDetailBack } from '@shared/lib/runNavigation';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import customAxios from '@/shared/lib/customAxios';
import NewTrainingAdmin from './NewTrainingAdmin';
import NewTrainingUser from './NewTrainingUser';

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
  isCreator: boolean;
  postimgurl: string;
}

const NewTrainingDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>(); // URL의 postId 파라미터 가져오기
  const navigate = useNavigate(); // 페이지 이동 훅
  const handleBack = useRunDetailBack('training');
  const [detailData, setDetailData] = useState<DetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // 서버에서 데이터를 가져오는 함수
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setDetailData(null);
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem('accessToken') || 'null';
        const response = await customAxios.get(`/run/training/post/${postId}`, {
          headers: {
            Authorization: `${token}`,
          },
        });

        if (!active) return;
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
            participants: result.participants ?? [],
            isCreator: result.userInfo?.userId != null && result.userInfo.userId === result.postCreatorInfo?.userId,
            postimgurl: result.postImageUrl,
          });
          console.log(response.data);
        } else {
          console.error('데이터를 불러오지 못했습니다:', response.data.responseMessage);
          setDetailData(null);
        }
      } catch (error) {
        if (!active) return;
        console.error('API 요청 오류:', error);
        setDetailData(null);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchDetail();
    return () => { active = false; };
  }, [postId, attempt]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!detailData) {
    return <div className="mx-auto max-w-[430px] p-5">
      <p role="alert">{"러닝 정보를 불러오지 못했습니다."}</p>
      <button className="mt-4 mr-5 text-kuDarkGreen" onClick={() => setAttempt(n => n + 1)}>다시 시도</button>
      <button onClick={() => navigate('/tab/training', {replace: true})}>목록으로</button>
    </div>;
  }
  if (detailData.isCreator)
    // 내 userId와 게시글 만든 사람의 Id 비교후 렌더링
    return <NewTrainingAdmin {...detailData} postId={postId} onBack={handleBack} />;
  else return <NewTrainingUser {...detailData} postId={postId} onBack={handleBack} />;
};

export default NewTrainingDetail;

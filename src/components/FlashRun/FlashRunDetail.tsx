import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import customAxios from "../../apis/customAxios";
import FlashRunAdmin from "./FlashRunAdmin";

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
}

const FlashRunDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>(); // URL의 postId 파라미터 가져오기
  const navigate = useNavigate(); // 페이지 이동 훅
  const [detailData, setDetailData] = useState<DetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 서버에서 데이터를 가져오는 함수
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await customAxios.get(`/run/post/${postId}`, {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIzIiwicm9sZSI6IlJPTEVfTUVNQkVSIiwiZXhwIjoxNzM4NjE0ODc0fQ.Rky7Mr2aywLO98GOLCAl-oNL4nRHOMdrA41DR3fpcMg`, // .env에 저장된 토큰 사용
          },
        });

        if (response.data.isSuccess) {
          const result = response.data.result;
          setDetailData({
            title: result.title,
            location: result.location,
            date: new Date(result.date).toLocaleDateString("ko-KR", {
              month: "long",
              day: "numeric",
              weekday: "long",
            }),
            content: result.content,
            userName: result.userName,
            participantsNum: result.participants.length,
            participants: result.participants,
          });
        } else {
          console.error("데이터를 불러오지 못했습니다:", response.data.responseMessage);
          navigate("/");
        }
      } catch (error) {
        console.error("API 요청 오류:", error);
        navigate("/");
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
    return <div>데이터가 없습니다.</div>;
  }

  return <FlashRunAdmin {...detailData} />;
};

export default FlashRunDetail;

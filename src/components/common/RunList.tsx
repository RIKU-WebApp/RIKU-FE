//러닝 리스트 Page
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import customAxios from '@shared/apis/customAxios';
import BacbBtnimg from '@assets/BackBtn.svg';
import ListEventCard from './ListEventCard';
import TodayRun from './TodayRun';
import PastRuns from './PastRuns';
import NavBar from '../NavBar';

interface RunData {
  id: number;
  title: string;
  date: string;
  participants: number;
  postStatus: 'NOW' | 'CANCELED' | 'CLOSED';
  postImageUrl: string;
}

const config = {
  regular: { title: '정규런', api: '/run/regular', path: 'regular' },
  flash: { title: '번개런', api: '/run/flash', path: 'flash' },
  event: { title: '행사', api: '/run/event', path: 'event' },
  training: { title: '훈련', api: '/run/training', path: 'training' },
};

const RunList: React.FC = () => {
  const { runType } = useParams<{ runType: keyof typeof config }>();
  const navigate = useNavigate();
  const paginationRef = useRef<HTMLDivElement | null>(null);
  const swiperInstance = useRef<any>(null);

  const [todayRuns, setTodayRuns] = useState<RunData[]>([]);
  const [upcomingRuns, setUpcomingRuns] = useState<RunData[]>([]);
  const [pastRuns, setPastRuns] = useState<RunData[]>([]);

  const current = config[runType ?? 'regular'];

  // 조사 분기 함수 => 이 / 가
  const getSubjectParticle = (word: string) => {
    const lastChar = word[word.length - 1];
    const code = lastChar.charCodeAt(0);
    return (code - 44032) % 28 === 0 ? '가' : '이';
  };

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem('accessToken') || 'null');
    const fetchRunData = async () => {
      try {
        const response = await customAxios.get(current.api, {
          headers: { Authorization: `${token}` },
        });
        const result = response.data.result;
        setTodayRuns(result.todayRuns ?? []);
        setUpcomingRuns(result.upcomingRuns ?? []);
        setPastRuns(result.pastRuns ?? []);
      } catch (error) {
        console.error('Error fetching run data:', error);
      }
    };
    fetchRunData();
  }, [current.api]);

  useEffect(() => {
    if (swiperInstance.current && paginationRef.current) {
      swiperInstance.current.params.pagination.el = paginationRef.current;
      swiperInstance.current.pagination.init();
      swiperInstance.current.pagination.render();
      swiperInstance.current.pagination.update();
    }
  }, []);

  const toKST = (dateStr: string) => {
    const utc = new Date(dateStr);
    const kst = new Date(utc.getTime() + 9 * 60 * 60 * 1000);
    return {
      kst,
      formattedDate: format(kst, 'MM/dd EEEE', { locale: ko }),
      formattedTime: format(kst, 'HH:mm'),
    };
  };

  return (
    <div className="flex flex-col justify-center items-center mx-auto max-w-[430px]">
      {/* 상단바 */}
      <div className="relative flex bg-kuDarkGreen w-full h-[56px] text-white text-xl font-semibold justify-center items-center">
        <img
          src={BacbBtnimg}
          className="absolute left-[24px] cursor-pointer"
          alt="Back"
          onClick={() => navigate('/tab/main')}
        />
        {current.title}
      </div>

      {/* 오늘의 러닝 */}
      <div className="relative bg-kuDarkGreen w-full min-h-[268px]">
        <div className="w-full flex flex-col items-center pt-2">
          <div className="w-[114px] h-[32px] bg-white text-kuDarkGreen text-[16px] font-bold rounded-xl flex items-center justify-center">
            오늘의 {current.title}
          </div>

          {todayRuns.length > 0 ? (
            <div className="relative w-[335px] mt-3">
              <Swiper
                modules={[Pagination, Navigation]}
                pagination={{
                  el: '.custom-pagination',
                  clickable: true,
                }}
                spaceBetween={16}
                slidesPerView={1}
              >
                {todayRuns.map((run) => {
                  const { kst, formattedDate, formattedTime } = toKST(run.date);
                  return (
                    <SwiperSlide key={run.id}>
                      <TodayRun
                        location={run.title}
                        postimg={run.postImageUrl}
                        runDate={kst}
                        runState={run.postStatus}
                        participants={run.participants}
                        date={formattedDate}
                        time={formattedTime}
                        onClick={() => navigate(`/${current.path}/${run.id}`)}
                      />
                    </SwiperSlide>
                  );
                })}
              </Swiper>
              <div
                ref={paginationRef}
                className="custom-pagination h-[20px] mb-[12px] mt-[12px] flex justify-center items-center [&>.swiper-pagination-bullet]:bg-white [&>.swiper-pagination-bullet-active]:bg-white [&>.swiper-pagination-bullet]:mx-[4px]"
              ></div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-[335px] h-[200px] bg-kuLightGray rounded-lg mt-4">
              <p className="text-[18px] font-semibold text-black">
                현재 진행중인 {current.title}
                {getSubjectParticle(current.title)} 없습니다.
              </p>
              {runType === 'flash' && (
                <p className="text-[14px] text-gray-500 mt-2">
                  직접 러닝을 만들어보는 건 어떨까요?
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 예정된 러닝 */}
      <div className="w-[375px] mt-4">
        <h2 className="text-[20px] font-semibold ml-5">예정된 {current.title}</h2>
        <div className="flex flex-col space-y-[12px] mt-[16px] ml-[20px]">
          {upcomingRuns.map((run) => {
            const { kst, formattedDate, formattedTime } = toKST(run.date);
            return (
              <ListEventCard
                key={run.id}
                location={run.title}
                postimg={run.postImageUrl}
                runDate={kst}
                runState={run.postStatus}
                participants={run.participants}
                date={formattedDate}
                time={formattedTime}
                onClick={() => navigate(`/${current.path}/${run.id}`)}
              />
            );
          })}
        </div>
      </div>

      {/* 구분선 */}
      <div className="w-full h-[8px] bg-kuLightGray mt-[32px]"></div>

      {/* 지난 러닝 */}
      <div className="w-[375px] mt-4 mb-[100px]">
        <h2 className="text-[20px] font-semibold ml-5">지난 {current.title}</h2>
        <div className="grid grid-cols-3 gap-x-[12px] gap-y-[16px] mt-[20px] px-3">
          {[...pastRuns]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 6)
            .map((run) => {
              const { formattedDate } = toKST(run.date);
              return (
                <div key={run.id} className="justify-self-center">
                  <PastRuns
                    title={run.title}
                    date={formattedDate}
                    peoplecount={String(run.participants)}
                    postimg={run.postImageUrl}
                    location=""
                    runDate=""
                    runState=""
                    onClick={() => navigate(`/${current.path}/${run.id}`)}
                  />
                </div>
              );
            })}
        </div>
      </div>

      <NavBar />
    </div>
  );
};

export default RunList;

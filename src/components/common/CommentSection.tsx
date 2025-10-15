import React, { useEffect, useState } from 'react';
import customAxios from '@/shared/lib/customAxios';
import CommentIcon from '@assets/CommentIcon.svg';
import CommentInputOn from '@assets/comment_input_on.svg';
import CommentInputOff from '@assets/comment_input_off.svg';

// 대댓글(Reply) 인터페이스
interface Reply {
  commentId: number;
  userId: number;
  userName: string;
  userProfileImg?: string | null;
  content: string;
  commentStatus: string;
  replies: Reply[];
  createdAt?: string;
}

// 댓글(Comment)은 Reply와 동일한 구조
interface Comment extends Reply {}

// 컴포넌트 Props 타입
interface CommentSectionProps {
  postId: string;
  postType: 'event' | 'regular' | 'training' | 'flash';
  userInfo: {
    userId: number;
    userName: string;
    userProfileImg?: string | null;
  };
  refreshTrigger?: boolean; // 외부 트리거로 댓글 새로고침할 때 사용
}

// 댓글 섹션 컴포넌트
const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  userInfo,
  refreshTrigger,
  postType,
}) => {
  // 상태 관리
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [replyInputs, setReplyInputs] = useState<Record<number, string>>({});
  const [replyTargetCommentId, setReplyTargetCommentId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [inputReady, setInputReady] = useState(false); // 입력창 자동 포커싱 방지용

  // 입력창 활성화 지연 (0.5초 후 입력 가능)
  useEffect(() => {
    const timer = setTimeout(() => setInputReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // 댓글 가져오기
  useEffect(() => {
    fetchComments();
  }, [refreshTrigger]);

  // 서버에서 댓글 데이터 불러오기
  const fetchComments = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('accessToken') || 'null');
      const response = await customAxios.get(`/run/${postType}/post/${postId}`, {
        headers: { Authorization: `${token}` },
      });
      if (response.data.isSuccess) {
        setComments(response.data.result.comments);
      }
    } catch (err) {
      console.error('댓글 불러오기 실패', err);
    }
  };

  // 댓글 작성하기
  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const token = JSON.parse(localStorage.getItem('accessToken') || 'null');
      const response = await customAxios.post(
        `/run/${postType}/post/${postId}/comment`,
        { content: newComment, targetId: null },
        { headers: { Authorization: `${token}` } }
      );
      if (response.data.isSuccess) {
        setNewComment(''); // 입력창 비우기
        fetchComments(); // 댓글 목록 새로고침
      }
    } catch {
      alert('댓글 등록 오류');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 대댓글 작성하기
  const handleSubmitReply = async (targetId: number) => {
    const content = replyInputs[targetId];
    if (!content?.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const token = JSON.parse(localStorage.getItem('accessToken') || 'null');
      const response = await customAxios.post(
        `/run/${postType}/post/${postId}/comment`,
        { content, targetId },
        { headers: { Authorization: `${token}` } }
      );
      if (response.data.isSuccess) {
        setReplyInputs((prev) => ({ ...prev, [targetId]: '' }));
        setReplyTargetCommentId(null); // 대댓글 입력창 닫기
        fetchComments(); // 댓글 목록 새로고침
      }
    } catch {
      alert('대댓글 등록 오류');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 대댓글 입력창 입력 감지
  const handleReplyChange = (id: number, value: string) => {
    setReplyInputs((prev) => ({ ...prev, [id]: value }));
  };

  // 댓글 삭제하기
  const handleDeleteComment = async (commentId: number) => {
    try {
      const token = JSON.parse(localStorage.getItem('accessToken') || 'null');
      const response = await customAxios.patch(
        `/run/${postType}/post/${postId}/comment/${commentId}`,
        {},
        { headers: { Authorization: `${token}` } }
      );
      if (response.data.isSuccess) {
        fetchComments(); // 삭제 후 목록 새로고침
      }
    } catch {
      alert('댓글 삭제 오류');
    }
  };

  // 댓글과 대댓글 중 ACTIVE 상태만 필터링
  const activeComments = comments.filter((c) => c.commentStatus === 'ACTIVE');
  const totalActiveCount =
    activeComments.length +
    activeComments.reduce(
      (sum, c) => sum + c.replies.filter((r) => r.commentStatus === 'ACTIVE').length,
      0
    );

  // 렌더링
  return (
    <div className="w-[327px]">
      {/* 댓글 개수 */}
      <div className="mt-[52px] mb-2 text-[16px] text-left">댓글 {totalActiveCount}</div>

      {/* 댓글 리스트 */}
      <div className="bg-[#F5F5F5] rounded-xl p-4 space-y-4">
        {activeComments.map((comment) => {
          const activeReplies = comment.replies.filter((r) => r.commentStatus === 'ACTIVE');
          return (
            <div key={comment.commentId} className="border-b border-[#E0E0E0] pb-3 space-y-2">
              {/* 원댓글 */}
              <div className="flex justify-between items-start w-full">
                <div className="flex items-start gap-2 flex-1">
                  {/* 작성자 프로필 */}
                  <div className="w-6 aspect-square rounded-full flex items-center justify-center overflow-hidden bg-[#9DC34A] text-white text-[10px] font-bold">
                    {comment.userProfileImg ? (
                      <img
                        src={comment.userProfileImg}
                        alt="작성자"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      comment.userName.charAt(0)
                    )}
                  </div>

                  {/* 작성자 이름, 내용 */}
                  <div className="flex flex-col w-full">
                    <div className="font-semibold text-left">{comment.userName}</div>
                    <div className="text-[16px] text-left break-words whitespace-pre-wrap">
                      {comment.content}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{comment.createdAt}</span>
                      <button
                        onClick={() => setReplyTargetCommentId(comment.commentId)}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#7EC24F]"
                      >
                        <img src={CommentIcon} alt="답글" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 삭제 버튼 (본인 글만) */}
                {comment.userId === userInfo.userId && (
                  <button
                    onClick={() => handleDeleteComment(comment.commentId)}
                    className="text-xs text-red-500 ml-2 whitespace-nowrap"
                  >
                    삭제
                  </button>
                )}
              </div>

              {/* 대댓글 리스트 */}
              {activeReplies.map((reply) => (
                <div
                  key={reply.commentId}
                  className="w-full mt-2 pl-8 flex justify-between items-start"
                >
                  <div className="flex items-start gap-2 flex-1">
                    {/* 대댓글 작성자 */}
                    <div className="w-6 aspect-square rounded-full flex items-center justify-center overflow-hidden bg-[#9DC34A] text-white text-[10px] font-bold">
                      {reply.userProfileImg ? (
                        <img
                          src={reply.userProfileImg}
                          alt="작성자"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        reply.userName.charAt(0)
                      )}
                    </div>

                    {/* 대댓글 내용 */}
                    <div className="flex flex-col w-full">
                      <div className="font-semibold text-[16px] text-left">{reply.userName}</div>
                      <div className="text-[16px] text-left break-words whitespace-pre-wrap">
                        {reply.content}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 text-left">{reply.createdAt}</div>
                    </div>
                  </div>

                  {/* 대댓글 삭제 버튼 (본인 글만) */}
                  {reply.userId === userInfo.userId && (
                    <button
                      onClick={() => handleDeleteComment(reply.commentId)}
                      className="text-xs text-red-500 ml-2 whitespace-nowrap"
                    >
                      삭제
                    </button>
                  )}
                </div>
              ))}

              {/* 대댓글 입력창 */}
              {replyTargetCommentId === comment.commentId && (
                <div className="flex items-center gap-[8px] mt-2 pl-8">
                  {/* 내 프로필 */}
                  <div className="w-6 aspect-square rounded-full flex items-center justify-center overflow-hidden bg-[#9DC34A] text-white text-[10px] font-bold">
                    {userInfo.userProfileImg ? (
                      <img
                        src={userInfo.userProfileImg}
                        alt="내 프로필"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      userInfo.userName.charAt(0)
                    )}
                  </div>

                  {/* 대댓글 입력 인풋 */}
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="대댓글 작성..."
                      readOnly={!inputReady}
                      onFocus={() => {
                        if (!inputReady) {
                          (document.activeElement as HTMLElement)?.blur();
                        }
                      }}
                      className="w-full bg-kuLightGray text-[16px] py-[9px] pr-[35px] pl-[8px] rounded-[8px] h-[32px]"
                      value={replyInputs[comment.commentId] || ''}
                      onChange={(e) => handleReplyChange(comment.commentId, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && replyInputs[comment.commentId]?.trim()) {
                          e.preventDefault();
                          handleSubmitReply(comment.commentId);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleSubmitReply(comment.commentId)}
                      disabled={!replyInputs[comment.commentId]?.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      <img
                        src={
                          replyInputs[comment.commentId]?.trim() ? CommentInputOn : CommentInputOff
                        }
                        alt="등록"
                        className="w-4 h-4"
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* 원댓글 입력창 */}
        <div className="flex items-center mt-3 bg-[#F5F5F5] rounded-xl px-3 py-2 gap-[8px]">
          <div className="w-6 aspect-square rounded-full flex items-center justify-center overflow-hidden bg-[#9DC34A] text-white text-[10px] font-bold">
            {userInfo.userProfileImg ? (
              <img
                src={userInfo.userProfileImg}
                alt="내 프로필"
                className="w-full h-full object-cover"
              />
            ) : (
              userInfo.userName.charAt(0)
            )}
          </div>

          {/* 댓글 작성 인풋 */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="댓글 추가..."
              readOnly={!inputReady}
              onFocus={() => {
                if (!inputReady) {
                  (document.activeElement as HTMLElement)?.blur();
                }
              }}
              className="w-full bg-kuLightGray text-[16px] rounded-[8px] py-[9px] pr-[35px] pl-[8px] h-[32px] focus:outline-none"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newComment.trim()) {
                  e.preventDefault();
                  handleSubmitComment();
                }
              }}
            />
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
              className="absolute right-[8px] top-1/2 -translate-y-1/2 w-[18px] h-[18px]"
            >
              <img
                src={newComment.trim() ? CommentInputOn : CommentInputOff}
                alt="댓글 등록"
                className="w-4 h-4"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;

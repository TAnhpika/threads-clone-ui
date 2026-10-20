import CreatePostModal from './CreatePostModal';

/**
 * ReplyModal là wrapper tái sử dụng CreatePostModal
 * cho luồng mở rộng trả lời (Reply Modal) từ bài viết chi tiết hoặc bài viết trên feed.
 */
export default function ReplyModal(props) {
  return <CreatePostModal {...props} isReplyModal={true} placement="center" />;
}

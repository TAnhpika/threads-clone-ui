import CreatePostModal from './CreatePostModal';

/**
 * QuoteModal là wrapper chuyển tiếp sử dụng chung Component CreatePostModal
 * với quotedPost được truyền vào, đảm bảo tính thống nhất 100% giữa New Thread và Quote.
 */
export default function QuoteModal(props) {
  return <CreatePostModal {...props} placement="center" />;
}

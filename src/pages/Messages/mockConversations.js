export const initialConversations = [
  {
    id: 'conv-1',
    user: {
      name: 'm.ylittlesecret_',
      username: 'm.ylittlesecret_',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      isVerified: false,
    },
    lastMessage: 'Dạ em cảm ơn anh nhiều ạ! Em sẽ áp dụng cách này cho đồ án tới.',
    timestamp: '15m',
    unread: true,
    messages: [
      {
        id: 'msg-1',
        sender: 'them',
        text: 'Chào anh, cho em hỏi thêm về tài liệu đồ án kiến trúc với ạ!',
        timestamp: '14:20',
      },
      {
        id: 'msg-2',
        sender: 'me',
        text: 'Em tham khảo các sách về Modern Architecture và xem ảnh trên ArchDaily thử xem.',
        timestamp: '14:25',
      },
      {
        id: 'msg-3',
        sender: 'them',
        text: 'Dạ em cảm ơn anh nhiều ạ! Em sẽ áp dụng cách này cho đồ án tới.',
        timestamp: '14:30',
      },
    ],
  },
  {
    id: 'conv-2',
    user: {
      name: 'Miniature Station',
      username: 'miniature.station',
      avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=120&auto=format&fit=crop&q=80',
      isVerified: false,
    },
    lastMessage: 'Haha chuẩn luôn rồi bác ơi :)))',
    timestamp: '2h',
    unread: false,
    messages: [
      {
        id: 'msg-4',
        sender: 'me',
        text: 'Đồ án kỳ này bảo vệ xong thấy nhẹ nhõm ghê nhỉ',
        timestamp: '12:00',
      },
      {
        id: 'msg-5',
        sender: 'them',
        text: 'Haha chuẩn luôn rồi bác ơi :)))',
        timestamp: '12:05',
      },
    ],
  },
  {
    id: 'conv-3',
    user: {
      name: 'Alexander Vance',
      username: 'alexander.sartorial',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      isVerified: true,
    },
    lastMessage: 'Chiếc blazer navy đợt trước anh may ở đâu vậy ạ?',
    timestamp: '1d',
    unread: false,
    messages: [
      {
        id: 'msg-6',
        sender: 'them',
        text: 'Chiếc blazer navy đợt trước anh may ở đâu vậy ạ?',
        timestamp: 'Hôm qua',
      },
    ],
  },
  {
    id: 'conv-4',
    user: {
      name: 'Hải Kiến Trúc',
      username: 'haikts2000yahoocom',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      isVerified: false,
    },
    lastMessage: 'Web xem ảnh kiến trúc là trang nào vậy bạn?',
    timestamp: '2d',
    unread: false,
    messages: [
      {
        id: 'msg-7',
        sender: 'them',
        text: 'Web xem ảnh kiến trúc là trang nào vậy bạn?',
        timestamp: 'T7',
      },
    ],
  },
];

export const suggestedUsers = [
  {
    id: 'u-1',
    name: 'The Gentleman Archive',
    username: 'the.gentleman.archive',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-2',
    name: 'Luca Moretti',
    username: 'luca_menswear',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-3',
    name: 'Savile Row Journal',
    username: 'savile_row_journal',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
  },
];

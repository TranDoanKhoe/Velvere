/* eslint-disable */
import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from 'react';
import axios from 'axios';

interface ChatMessage {
    _id: string;
    session_id: string;
    user_id?: string;
    sender_type: 'user' | 'admin' | 'system';
    message: string;
    read: boolean;
    createdAt: string;
    updatedAt: string;
}

interface ChatSession {
    _id: string;
    user_id?: string;
    user_name: string;
    user_email?: string;
    status: 'active' | 'closed';
    last_message: string;
    assigned_admin?: string;
    createdAt: string;
    updatedAt: string;
}

interface ChatContextType {
    isChatOpen: boolean;
    toggleChat: () => void;
    currentSession: ChatSession | null;
    messages: ChatMessage[];
    sendMessage: (message: string) => Promise<void>;
    loadMessages: () => Promise<void>;
    closeChat: () => Promise<void>;
    unreadCount: number;
    isLoading: boolean;
}

interface ChatProviderProps {
    children: ReactNode;
}

const ChatContext = createContext<ChatContextType | null>(null);
export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat phải được sử dụng trong ChatProvider');
    }
    return context;
};

export const ChatProvider = ({ children }: ChatProviderProps) => {
    const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
    const [currentSession, setCurrentSession] = useState<ChatSession | null>(
        null,
    );
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Kiểm tra localStorage khi component mount
    useEffect(() => {
        const sessionId = localStorage.getItem('chat_session_id');
        if (sessionId) {
            fetchSession(sessionId);
            fetchMessages(sessionId);
        }
        // Check unread messages every 10 seconds
        const intervalId = setInterval(checkUnreadMessages, 10000);
        return () => clearInterval(intervalId);
    }, []);

    // Hàm này dùng để kiểm tra và tạo phiên chat mới nếu cần
  const ensureSession = async (): Promise<string> => {
      const backendUrl =
          import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        setIsLoading(true);
        try {
            // Nếu đã có session, trả về session_id
            if (currentSession) {
                setIsLoading(false);
                return currentSession._id;
            }

            // Kiểm tra localStorage xem có session_id không
            const savedSessionId = localStorage.getItem('chat_session_id');
            if (savedSessionId) {
                try {
                    // Kiểm tra xem session có còn active không
                    const response = await axios.get(
                        `${backendUrl}/api/chat/sessions/${savedSessionId}/messages`,
                    );
                    if (response.status === 200) {
                        await fetchSession(savedSessionId);
                        setIsLoading(false);
                        return savedSessionId;
                    }
                } catch (error) {
                    console.error('Lỗi khi kiểm tra phiên chat:', error);
                    // Nếu có lỗi, xóa session_id cũ và tạo mới
                    localStorage.removeItem('chat_session_id');
                }
            }

            // Nếu không có session hoặc session không còn active, tạo mới

            let userData: any = {
                user_name: 'Khách',
            };

            // Kiểm tra nếu người dùng đã đăng nhập
            const userJSON = localStorage.getItem('user');
            if (userJSON) {
                try {
                    const user = JSON.parse(userJSON);
                    userData = {
                        user_id: user._id,
                        user_name: user.name,
                        user_email: user.email,
                    };
                } catch (e) {
                    console.error('Lỗi khi parse thông tin người dùng:', e);
                }
            }

            // Tạo phiên chat mới
            console.log('Đang tạo phiên chat mới với dữ liệu:', userData);
            const response = await axios.post(
                `${backendUrl}:3000/api/chat/sessions`,
                userData,
            );

            if (
                !response.data ||
                !response.data.session ||
                !response.data.session._id
            ) {
                console.error('Phản hồi API không hợp lệ:', response.data);
                throw new Error('Không thể tạo phiên chat mới');
            }

            const newSessionId = response.data.session._id;

            // Lưu session_id vào localStorage
            localStorage.setItem('chat_session_id', newSessionId);

            // Cập nhật state
            setCurrentSession(response.data.session);
            if (response.data.welcomeMessage) {
                setMessages([response.data.welcomeMessage]);
            }

            setIsLoading(false);
            return newSessionId;
        } catch (error) {
            console.error('Lỗi khi tạo phiên chat mới:', error);
            setIsLoading(false);
            // Rethrow để component gọi có thể xử lý
            throw error;
        }
    };

    // Lấy thông tin phiên chat
    const fetchSession = async (sessionId: string) => {
      try {
          const backendUrl =
              import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
            const response = await axios.get(
                `${backendUrl}/api/chat/sessions`,
            );
            const session = response.data.find(
                (s: ChatSession) => s._id === sessionId,
            );
            if (session && session.status === 'active') {
                setCurrentSession(session);
            } else {
                // Nếu phiên chat không còn active, xóa session_id
                localStorage.removeItem('chat_session_id');
                setCurrentSession(null);
            }
        } catch (error) {
            console.error('Lỗi khi lấy thông tin phiên chat:', error);
        }
    };

    // Lấy tin nhắn của phiên chat
    const fetchMessages = async (sessionId: string) => {
      try {
          const backendUrl =
              import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
            const response = await axios.get(
                `${backendUrl}/api/chat/sessions/${sessionId}/messages`,
            );
            setMessages(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy tin nhắn chat:', error);
        }
    };

    // Gửi tin nhắn
    const sendMessage = async (message: string) => {
        if (isLoading) {
            console.log('Đang tải, không thể gửi tin nhắn');
            return;
        }

        setIsLoading(true);
        try {
            console.log('Chuẩn bị gửi tin nhắn:', message);
            // Đảm bảo có session
            const sessionId = await ensureSession();
            console.log('Phiên chat ID:', sessionId);

            // Chuẩn bị dữ liệu người dùng
            let userId = null;
            const userJSON = localStorage.getItem('user');
            if (userJSON) {
                try {
                    const user = JSON.parse(userJSON);
                    userId = user._id;
                } catch (e) {
                    console.error('Lỗi khi parse thông tin người dùng:', e);
                }
            }

            // Thêm tin nhắn tạm thời vào UI để phản hồi ngay lập tức
            const tempMessage: ChatMessage = {
                _id: 'temp_' + Date.now(),
                session_id: sessionId,
                user_id: userId,
                sender_type: 'user',
                message: message,
                read: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, tempMessage]);

            // Gửi tin nhắn
            console.log('Gửi tin nhắn đến API:', {
                session_id: sessionId,
                user_id: userId,
                sender_type: 'user',
                message,
            });
          const backendUrl =
              import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

            const response = await axios.post(
                `${backendUrl}/api/chat/messages`,
                {
                    session_id: sessionId,
                    user_id: userId,
                    sender_type: 'user',
                    message,
                },
            );

            console.log('Phản hồi từ API:', response.data);

            // Cập nhật messages với tin nhắn thực từ server
            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === tempMessage._id
                        ? response.data.chatMessage
                        : msg,
                ),
            );

            // Đánh dấu tin nhắn của admin là đã đọc
            await markMessagesAsRead(sessionId);
        } catch (error) {
            console.error('Lỗi khi gửi tin nhắn:', error);
            // Hiển thị lỗi để người dùng biết
            alert('Không thể gửi tin nhắn. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    };

    // Đánh dấu tin nhắn đã đọc
    const markMessagesAsRead = async (sessionId: string) => {
      try {
          const backendUrl =
              import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
            await axios.patch(
                `${backendUrl}/api/chat/sessions/${sessionId}/read`,
                {
                    sender_type: 'user',
                },
            );
            // Cập nhật trạng thái đã đọc trong messages
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.sender_type === 'admin' ? { ...msg, read: true } : msg,
                ),
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Lỗi khi đánh dấu tin nhắn đã đọc:', error);
        }
    };

    // Kiểm tra tin nhắn chưa đọc
    const checkUnreadMessages = async () => {
        const sessionId = localStorage.getItem('chat_session_id');
        if (!sessionId) return;

      try {
          const backendUrl =
              import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
            const response = await axios.get(
                `${backendUrl}/api/chat/sessions/${sessionId}/messages`,
            );
            const unreadMessages = response.data.filter(
                (msg: ChatMessage) => msg.sender_type === 'admin' && !msg.read,
            );
            setUnreadCount(unreadMessages.length);

            // Cập nhật messages nếu có tin nhắn mới
            if (
                unreadMessages.length > 0 &&
                JSON.stringify(messages) !== JSON.stringify(response.data)
            ) {
                setMessages(response.data);
            }
        } catch (error) {
            console.error('Lỗi khi kiểm tra tin nhắn chưa đọc:', error);
        }
    };

    // Đóng chat
    const closeChat = async () => {
        if (!currentSession) return;

      try {
          const backendUrl =
              import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
            await axios.patch(
                `${backendUrl}/api/chat/sessions/${currentSession._id}/close`,
            );
            localStorage.removeItem('chat_session_id');
            setCurrentSession(null);
            setMessages([]);
            setIsChatOpen(false);
        } catch (error) {
            console.error('Lỗi khi đóng phiên chat:', error);
        }
    };

    // Mở/đóng cửa sổ chat
    const toggleChat = () => {
        const newState = !isChatOpen;
        setIsChatOpen(newState);

        // Nếu mở chat, đánh dấu tất cả tin nhắn là đã đọc
        if (newState && currentSession) {
            markMessagesAsRead(currentSession._id);
            loadMessages();
        }
    };

    // Load tin nhắn
    const loadMessages = async () => {
        try {
            // Đảm bảo có session
            const sessionId = await ensureSession();
            await fetchMessages(sessionId);
        } catch (error) {
            console.error('Lỗi khi tải tin nhắn:', error);
        }
    };

    const value: ChatContextType = {
        isChatOpen,
        toggleChat,
        currentSession,
        messages,
        sendMessage,
        loadMessages,
        closeChat,
        unreadCount,
        isLoading,
    };

    return (
        <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
    );
};

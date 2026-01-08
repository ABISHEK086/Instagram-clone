import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Messages() {
    const [conversations, setConversations] = useState([]);
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewMessageModal, setShowNewMessageModal] = useState(false);
    const currentUserId = 1;
    const navigate = useNavigate();

    useEffect(() => {
        fetchAllData();
        // Refresh every 3 seconds for new messages
        const interval = setInterval(fetchAllData, 3000);
        return () => clearInterval(interval);
    }, []);

    const fetchAllData = async () => {
        await Promise.all([
            fetchMessages(),
            fetchUsers()
        ]);
    };

    const fetchMessages = async () => {
        try {
            const response = await axios.get('http://localhost:3001/messages');
            setMessages(response.data);
        } catch (err) {
            console.log(err);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:3001/users');
            setUsers(response.data);
        } catch (err) {
            console.log(err);
        }
    };

    const getConversations = () => {
        const userMessages = messages.filter(
            msg => msg.senderId == currentUserId || msg.receiverId == currentUserId
        );

        const conversationMap = {};
        
        userMessages.forEach(msg => {
            const otherUserId = msg.senderId == currentUserId ? msg.receiverId : msg.senderId;
            
            if (!conversationMap[otherUserId] || 
                new Date(msg.createdAt) > new Date(conversationMap[otherUserId].lastMessage.createdAt)) {
                conversationMap[otherUserId] = {
                    userId: otherUserId,
                    lastMessage: msg,
                    unread: msg.receiverId == currentUserId && !msg.read
                };
            }
        });

        return Object.values(conversationMap).sort((a, b) => 
            new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
        );
    };

    const getUserById = (userId) => {
        return users.find(user => user.id == userId);
    };

    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
        return `${Math.floor(seconds / 604800)}w`;
    };

    const filteredUsers = users.filter(user => 
        user.id != currentUserId &&
        (user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
         user.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const conversationsList = getConversations();

    return (
        <div className="messages-container">
            <div className="messages-header">
                <i 
                    className="bi bi-arrow-left"
                    onClick={() => navigate('/')}
                    style={{ cursor: 'pointer', fontSize: '24px', marginRight: '20px' }}
                ></i>
                <h4 className="mb-0 fw-bold flex-grow-1">Messages</h4>
                <i 
                    className="bi bi-pencil-square"
                    onClick={() => setShowNewMessageModal(true)}
                    style={{ cursor: 'pointer', fontSize: '20px' }}
                    title="New message"
                ></i>
            </div>

            <div className="messages-content">
                {conversationsList.length > 0 ? (
                    <div className="conversations-list">
                        {conversationsList.map(conversation => {
                            const user = getUserById(conversation.userId);
                            const lastMsg = conversation.lastMessage;
                            const isFromMe = lastMsg.senderId == currentUserId;
                            
                            return (
                                <div 
                                    key={conversation.userId}
                                    className={`conversation-item ${conversation.unread ? 'unread' : ''}`}
                                    onClick={() => navigate(`/chat/${conversation.userId}`)}
                                >
                                    <img 
                                        src={user?.profilePic || './src/assets/user1.png'}
                                        alt={user?.username}
                                        className="conversation-avatar rounded-circle"
                                    />
                                    <div className="conversation-content">
                                        <div className="conversation-header">
                                            <span className="fw-bold">{user?.username || 'User'}</span>
                                            <span className="conversation-time">
                                                {getTimeAgo(lastMsg.createdAt)}
                                            </span>
                                        </div>
                                        <div className="conversation-preview">
                                            <span className={conversation.unread ? 'fw-bold' : ''}>
                                                {isFromMe && 'You: '}
                                                {lastMsg.text}
                                            </span>
                                        </div>
                                    </div>
                                    {conversation.unread && (
                                        <div className="unread-indicator"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-messages-state">
                        <i className="bi bi-chat-dots" style={{ fontSize: '80px', color: '#dbdbdb' }}></i>
                        <h5 className="mt-3">No Messages</h5>
                        <p className="text-muted">Send a message to start chatting</p>
                        <button 
                            className="btn btn-primary mt-3"
                            onClick={() => setShowNewMessageModal(true)}
                        >
                            Send Message
                        </button>
                    </div>
                )}
            </div>

            {/* New Message Modal */}
            {showNewMessageModal && (
                <div className="modal-overlay" onClick={() => setShowNewMessageModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h5 className="modal-title">New Message</h5>
                            <button className="close-btn" onClick={() => setShowNewMessageModal(false)}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <input
                                type="text"
                                className="form-control mb-3"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            <div className="users-list">
                                {filteredUsers.map(user => (
                                    <div 
                                        key={user.id}
                                        className="user-item"
                                        onClick={() => {
                                            navigate(`/chat/${user.id}`);
                                            setShowNewMessageModal(false);
                                        }}
                                    >
                                        <img 
                                            src={user.profilePic}
                                            alt={user.username}
                                            className="user-avatar rounded-circle"
                                        />
                                        <div>
                                            <div className="fw-bold">{user.username}</div>
                                            <small className="text-muted">{user.name}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Messages
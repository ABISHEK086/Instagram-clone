import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

function Chat() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [otherUser, setOtherUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const messagesEndRef = useRef(null);
    const { userId } = useParams();
    const currentUserId = 1;
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
        fetchMessages();
        markMessagesAsRead();
        
        // Auto-refresh every 2 seconds for real-time chat
        const interval = setInterval(fetchMessages, 2000);
        return () => clearInterval(interval);
    }, [userId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:3001/users');
            const other = response.data.find(user => user.id == userId);
            const current = response.data.find(user => user.id == currentUserId);
            setOtherUser(other);
            setCurrentUser(current);
        } catch (err) {
            console.log(err);
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await axios.get('http://localhost:3001/messages');
            const chatMessages = response.data.filter(msg =>
                (msg.senderId == currentUserId && msg.receiverId == userId) ||
                (msg.senderId == userId && msg.receiverId == currentUserId)
            ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            
            setMessages(chatMessages);
        } catch (err) {
            console.log(err);
        }
    };

    const markMessagesAsRead = async () => {
        try {
            const response = await axios.get('http://localhost:3001/messages');
            const unreadMessages = response.data.filter(msg =>
                msg.senderId == userId && 
                msg.receiverId == currentUserId && 
                !msg.read
            );
            
            for (const msg of unreadMessages) {
                await axios.patch(`http://localhost:3001/messages/${msg.id}`, {
                    read: true
                });
            }
        } catch (err) {
            console.log(err);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const messageData = {
                senderId: currentUserId,
                receiverId: parseInt(userId),
                text: newMessage,
                read: false,
                createdAt: new Date().toISOString()
            };

            await axios.post('http://localhost:3001/messages', messageData);
            setNewMessage('');
            fetchMessages();
        } catch (err) {
            console.log(err);
        }
    };

    const getMessageTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <i 
                    className="bi bi-arrow-left"
                    onClick={() => navigate('/messages')}
                    style={{ cursor: 'pointer', fontSize: '24px', marginRight: '15px' }}
                ></i>
                {otherUser && (
                    <>
                        <img 
                            src={otherUser.profilePic}
                            alt={otherUser.username}
                            className="chat-header-avatar rounded-circle"
                        />
                        <div>
                            <h6 className="mb-0 fw-bold">{otherUser.username}</h6>
                            <small className="text-muted">{otherUser.name}</small>
                        </div>
                    </>
                )}
            </div>

            <div className="chat-messages">
                {messages.length > 0 ? (
                    <>
                        {messages.map(msg => (
                            <div 
                                key={msg.id}
                                className={`message-bubble ${msg.senderId == currentUserId ? 'sent' : 'received'}`}
                            >
                                {msg.senderId != currentUserId && (
                                    <img 
                                        src={otherUser?.profilePic}
                                        alt="user"
                                        className="message-avatar rounded-circle"
                                    />
                                )}
                                <div className="message-content">
                                    <div className="message-text">{msg.text}</div>
                                    <div className="message-time">{getMessageTime(msg.createdAt)}</div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                ) : (
                    <div className="empty-chat-state">
                        <i className="bi bi-chat-heart" style={{ fontSize: '60px', color: '#dbdbdb' }}></i>
                        <p className="text-muted mt-3">No messages yet. Start the conversation!</p>
                    </div>
                )}
            </div>

            <div className="chat-input-container">
                <input
                    type="text"
                    className="chat-input"
                    placeholder="Message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleSendMessage();
                        }
                    }}
                />
                <button 
                    className={`send-btn ${newMessage.trim() ? 'active' : ''}`}
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                >
                    Send
                </button>
            </div>
        </div>
    );
}

export default Chat
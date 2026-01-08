import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const currentUserId = 1;
    const navigate = useNavigate(); 

    useEffect(() => {
        fetchAllData();
        markAllAsRead();
        
        // Auto-refresh every 5 seconds to show new notifications
        const interval = setInterval(() => {
            fetchAllData();
        }, 5000);
        
        return () => clearInterval(interval);
    }, []);

    const fetchAllData = async () => {
        await Promise.all([
            fetchNotifications(),
            fetchUsers(),
            fetchPosts()
        ]);
    };

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('http://localhost:3001/notifications');
            // Filter notifications for current user and sort by date
            const userNotifications = response.data
                .filter(notif => notif.recipientId == currentUserId)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setNotifications(userNotifications);
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

    const fetchPosts = async () => {
        try {
            const response = await axios.get('http://localhost:3001/posts');
            setPosts(response.data);
        } catch (err) {
            console.log(err);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await axios.get('http://localhost:3001/notifications');
            const unreadNotifications = response.data.filter(
                notif => notif.recipientId == currentUserId && !notif.read
            );
            
            for (const notif of unreadNotifications) {
                await axios.patch(`http://localhost:3001/notifications/${notif.id}`, {
                    read: true
                });
            }
        } catch (err) {
            console.log(err);
        }
    };

    const handleManualRefresh = async () => {
        setIsRefreshing(true);
        await fetchAllData();
        setTimeout(() => {
            setIsRefreshing(false);
        }, 500);
    };

    const getUserById = (userId) => {
        return users.find(user => user.id == userId);
    };

    const getPostById = (postId) => {
        return posts.find(post => post.id == postId);
    };

    const getNotificationMessage = (notification) => {
        const user = getUserById(notification.senderId);
        const username = user?.username || 'Someone';

        switch (notification.type) {
            case 'like':
                return `liked your post`;
            case 'comment':
                return `commented: "${notification.commentText}"`;
            case 'follow':
                return `started following you`;
            default:
                return 'interacted with your content';
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'like':
                return 'bi-heart-fill text-danger';
            case 'comment':
                return 'bi-chat-fill text-primary';
            case 'follow':
                return 'bi-person-fill text-success';
            default:
                return 'bi-bell-fill';
        }
    };

    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return `${Math.floor(seconds / 604800)}w ago`;
    };

    const deleteNotification = async (notifId) => {
        try {
            await axios.delete(`http://localhost:3001/notifications/${notifId}`);
            setNotifications(prev => prev.filter(n => n.id !== notifId));
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="notifications-container">
            <div className="notifications-header">
                <i 
                    className="bi bi-arrow-left"
                    onClick={() => navigate('/')}
                    style={{ cursor: 'pointer', fontSize: '24px', marginRight: '20px' }}
                ></i>
                <h4 className="mb-0 fw-bold">Notifications</h4>
                <i 
                    className={`bi bi-arrow-clockwise ms-auto ${isRefreshing ? 'rotating' : ''}`}
                    onClick={handleManualRefresh}
                    style={{ cursor: 'pointer', fontSize: '20px' }}
                    title="Refresh notifications"
                ></i>
            </div>

            <div className="notifications-content">
                {notifications.length > 0 ? (
                    <div className="notifications-list">
                        {notifications.map(notification => {
                            const user = getUserById(notification.senderId);
                            const post = notification.postId ? getPostById(notification.postId) : null;
                            
                            return (
                                <div key={notification.id} className="notification-item">
                                    <div className="notification-avatar">
                                        <img 
                                            src={user?.profilePic || './src/assets/user1.png'} 
                                            alt={user?.username}
                                            className="rounded-circle"
                                        />
                                        <div className={`notification-icon ${getNotificationIcon(notification.type)}`}>
                                            <i className={getNotificationIcon(notification.type)}></i>
                                        </div>
                                    </div>

                                    <div className="notification-content">
                                        <div className="notification-text">
                                            <span className="fw-bold">{user?.username || 'Someone'}</span>{' '}
                                            {getNotificationMessage(notification)}
                                        </div>
                                        <div className="notification-time">
                                            {getTimeAgo(notification.createdAt)}
                                        </div>
                                    </div>

                                    {post && (
                                        <div className="notification-post-preview">
                                            <img 
                                                src={post.image} 
                                                alt="post"
                                            />
                                        </div>
                                    )}

                                    <i 
                                        className="bi bi-x notification-delete"
                                        onClick={() => deleteNotification(notification.id)}
                                    ></i>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-notifications-state">
                        <i className="bi bi-bell" style={{ fontSize: '80px', color: '#dbdbdb' }}></i>
                        <h5 className="mt-3">No Notifications Yet</h5>
                        <p className="text-muted">When someone likes or comments on your posts, you'll see it here.</p>
                        <button 
                            className="btn btn-primary mt-3"
                            onClick={() => navigate('/')}
                        >
                            Browse Posts
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Notifications
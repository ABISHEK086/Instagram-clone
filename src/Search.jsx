import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Search() {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'posts'
    const [followingUsers, setFollowingUsers] = useState({});
    const currentUserId = 1;
    const navigate = useNavigate();

    // Check for dark mode
    const isDarkMode = document.body.classList.contains('dark-mode');

    useEffect(() => {
        fetchUsers();
        fetchPosts();
    }, []);

    useEffect(() => {
        handleSearch();
    }, [searchQuery, users, posts]);

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

    const handleSearch = () => {
        if (!searchQuery.trim()) {
            setFilteredUsers([]);
            setFilteredPosts([]);
            return;
        }

        const query = searchQuery.toLowerCase();

        // Filter users
        const matchedUsers = users.filter(user => 
            user.username.toLowerCase().includes(query) ||
            user.name.toLowerCase().includes(query) ||
            user.bio.toLowerCase().includes(query)
        );
        setFilteredUsers(matchedUsers);

        // Filter posts
        const matchedPosts = posts.filter(post =>
            post.username.toLowerCase().includes(query) ||
            post.caption.toLowerCase().includes(query)
        );
        setFilteredPosts(matchedPosts);
    };

    const handleFollow = async (userId) => {
        const isFollowing = followingUsers[userId];

        try {
            const currentUserRes = await axios.get(`http://localhost:3001/users/${currentUserId}`);
            const targetUserRes = await axios.get(`http://localhost:3001/users/${userId}`);

            const currentUser = currentUserRes.data;
            const targetUser = targetUserRes.data;

            if (isFollowing) {
                await axios.patch(`http://localhost:3001/users/${currentUserId}`, {
                    following: currentUser.following - 1
                });
                await axios.patch(`http://localhost:3001/users/${userId}`, {
                    followers: targetUser.followers - 1
                });
                setFollowingUsers(prev => {
                    const newFollowing = { ...prev };
                    delete newFollowing[userId];
                    return newFollowing;
                });
            } else {
                await axios.patch(`http://localhost:3001/users/${currentUserId}`, {
                    following: currentUser.following + 1
                });
                await axios.patch(`http://localhost:3001/users/${userId}`, {
                    followers: targetUser.followers + 1
                });
                setFollowingUsers(prev => ({
                    ...prev,
                    [userId]: true
                }));
            }
            fetchUsers();
        } catch (err) {
            console.log(err);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setFilteredUsers([]);
        setFilteredPosts([]);
    };

    return (
        <div className="search-container">
            {/* Search Header */}
            <div className="search-header">
                <div className="search-input-container">
                    <i className="bi bi-search"></i>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search users, posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                    />
                    {searchQuery && (
                        <i 
                            className="bi bi-x-circle-fill clear-icon"
                            onClick={clearSearch}
                        ></i>
                    )}
                </div>
            </div>

            {/* Tabs */}
            {searchQuery && (
                <div className="search-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <i className="bi bi-people-fill"></i> Users ({filteredUsers.length})
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
                        onClick={() => setActiveTab('posts')}
                    >
                        <i className="bi bi-grid-3x3"></i> Posts ({filteredPosts.length})
                    </button>
                </div>
            )}

            {/* Search Results */}
            <div className="search-results">
                {!searchQuery ? (
                    <div className="empty-state">
                        <i className="bi bi-search" style={{ fontSize: '60px', color: '#dbdbdb' }}></i>
                        <p className="text-muted mt-3">Search for users and posts</p>
                        <small className="text-muted">Try searching for usernames, names, or captions</small>
                    </div>
                ) : (
                    <>
                        {/* Users Tab */}
                        {activeTab === 'users' && (
                            <div className="results-list">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map(user => (
                                        <div key={user.id} className="search-result-item">
                                            <div className="d-flex align-items-center">
                                                <img 
                                                    src={user.profilePic} 
                                                    alt={user.username}
                                                    className="search-result-dp rounded-circle"
                                                />
                                                <div className="flex-grow-1">
                                                    <h6 className="mb-0 fw-bold">{user.username}</h6>
                                                    <small className="text-muted">{user.name}</small>
                                                    <p className="mb-0 text-muted" style={{ fontSize: '12px' }}>
                                                        {user.followers} followers
                                                    </p>
                                                </div>
                                                {user.id != currentUserId && (
                                                    <button 
                                                        className={`follow-button-small ${followingUsers[user.id] ? 'following' : ''}`}
                                                        onClick={() => handleFollow(user.id)}
                                                    >
                                                        {followingUsers[user.id] ? 'Following' : 'Follow'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <i className="bi bi-person-x" style={{ fontSize: '50px', color: '#dbdbdb' }}></i>
                                        <p className="text-muted mt-2">No users found</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Posts Tab */}
                        {activeTab === 'posts' && (
                            <div className="results-grid">
                                {filteredPosts.length > 0 ? (
                                    filteredPosts.map(post => (
                                        <div key={post.id} className="search-post-item">
                                            <img 
                                                src={post.image} 
                                                alt={post.caption}
                                                className="search-post-image"
                                            />
                                            <div className="search-post-overlay">
                                                <div className="search-post-stats">
                                                    <span>
                                                        <i className="bi bi-heart-fill"></i> {post.likes}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="search-post-caption">
                                                <small className="fw-bold">{post.username}</small>
                                                <small className="text-muted d-block text-truncate">
                                                    {post.caption}
                                                </small>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <i className="bi bi-image" style={{ fontSize: '50px', color: '#dbdbdb' }}></i>
                                        <p className="text-muted mt-2">No posts found</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Search
import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'

function Posts() {
    const [post, setPost] = useState([]);
    const [likedPosts, setLikedPosts] = useState({});
    const [savedPosts, setSavedPosts] = useState({});
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState({});
    const [showComments, setShowComments] = useState({});
    const [users, setUsers] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [showEditModal, setShowEditModal] = useState(null);
    const [editCaption, setEditCaption] = useState('');
    const [showPostMenu, setShowPostMenu] = useState(null);
    const currentUserId = 1; // Current logged-in user

    useEffect(() => {
        fetchPosts();
        fetchLikes();
        fetchSaved();
        fetchComments();
        fetchUsers();
    }, []);

    const fetchPosts = () => {
        fetch('http://localhost:3001/posts')
            .then(res => res.json())
            .then(data => {
                // Sort posts by date (newest first)
                const sortedPosts = data.sort((a, b) => {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });
                setPost(sortedPosts);
            })
            .catch(err => console.log(err))
    };

    const fetchLikes = () => {
        fetch('http://localhost:3001/likes')
            .then(res => res.json())
            .then(data => {
                const likesMap = {};
                data.forEach(like => {
                    if (like.userId === currentUserId) {
                        likesMap[like.postId] = like.id;
                    }
                });
                setLikedPosts(likesMap);
            })
            .catch(err => console.log(err))
    };

    const fetchSaved = () => {
        fetch('http://localhost:3001/saved')
            .then(res => res.json())
            .then(data => {
                const savedMap = {};
                data.forEach(save => {
                    if (save.userId === currentUserId) {
                        savedMap[save.postId] = save.id;
                    }
                });
                setSavedPosts(savedMap);
            })
            .catch(err => console.log(err))
    };

    const fetchComments = () => {
        fetch('http://localhost:3001/comments')
            .then(res => res.json())
            .then(data => setComments(data))
            .catch(err => console.log(err))
    };

    const fetchUsers = () => {
        fetch('http://localhost:3001/users')
            .then(res => res.json())
            .then(data => setUsers(data))
            .catch(err => console.log(err))
    };

    const handleLike = async (postId, currentLikes) => {
        const isLiked = likedPosts[postId];
        const postData = post.find(p => p.id === postId);

        if (isLiked) {
            try {
                await axios.delete(`http://localhost:3001/likes/${isLiked}`);
                await axios.patch(`http://localhost:3001/posts/${postId}`, {
                    likes: currentLikes - 1
                });

                setLikedPosts(prev => {
                    const newLikes = { ...prev };
                    delete newLikes[postId];
                    return newLikes;
                });

                setPost(prev => prev.map(p => 
                    p.id === postId ? { ...p, likes: currentLikes - 1 } : p
                ));
            } catch (err) {
                console.log(err);
            }
        } else {
            try {
                const likeResponse = await axios.post('http://localhost:3001/likes', {
                    postId: postId,
                    userId: currentUserId
                });

                await axios.patch(`http://localhost:3001/posts/${postId}`, {
                    likes: currentLikes + 1
                });

                setLikedPosts(prev => ({
                    ...prev,
                    [postId]: likeResponse.data.id
                }));

                setPost(prev => prev.map(p => 
                    p.id === postId ? { ...p, likes: currentLikes + 1 } : p
                ));

                // Create notification if liking someone else's post
                if (postData && postData.userId != currentUserId) {
                    await axios.post('http://localhost:3001/notifications', {
                        type: 'like',
                        senderId: currentUserId,
                        recipientId: postData.userId,
                        postId: postId,
                        read: false,
                        createdAt: new Date().toISOString()
                    });
                }
            } catch (err) {
                console.log(err);
            }
        }
    };

    const handleSave = async (postId) => {
        const isSaved = savedPosts[postId];

        if (isSaved) {
            // Unsave the post
            try {
                await axios.delete(`http://localhost:3001/saved/${isSaved}`);
                
                setSavedPosts(prev => {
                    const newSaved = { ...prev };
                    delete newSaved[postId];
                    return newSaved;
                });
            } catch (err) {
                console.log(err);
            }
        } else {
            // Save the post
            try {
                const saveResponse = await axios.post('http://localhost:3001/saved', {
                    postId: postId,
                    userId: currentUserId,
                    savedAt: new Date().toISOString()
                });

                setSavedPosts(prev => ({
                    ...prev,
                    [postId]: saveResponse.data.id
                }));
            } catch (err) {
                console.log(err);
            }
        }
    };

    const handleCommentChange = (postId, value) => {
        setNewComment(prev => ({
            ...prev,
            [postId]: value
        }));
    };

    const handleAddComment = async (postId) => {
        const commentText = newComment[postId];
        
        if (!commentText || commentText.trim() === '') {
            return;
        }

        try {
            const commentResponse = await axios.post('http://localhost:3001/comments', {
                postId: postId,
                userId: currentUserId,
                text: commentText
            });

            setComments(prev => [...prev, commentResponse.data]);
            
            setNewComment(prev => ({
                ...prev,
                [postId]: ''
            }));

            // Create notification if commenting on someone else's post
            const postData = post.find(p => p.id === postId);
            if (postData && postData.userId != currentUserId) {
                await axios.post('http://localhost:3001/notifications', {
                    type: 'comment',
                    senderId: currentUserId,
                    recipientId: postData.userId,
                    postId: postId,
                    commentText: commentText,
                    read: false,
                    createdAt: new Date().toISOString()
                });
            }
        } catch (err) {
            console.log(err);
        }
    };

    const toggleComments = (postId) => {
        setShowComments(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const openEditModal = (postId, currentCaption) => {
        setShowEditModal(postId);
        setEditCaption(currentCaption);
        setShowPostMenu(null);
    };

    const handleEditPost = async (postId) => {
        if (!editCaption.trim()) {
            alert('Caption cannot be empty!');
            return;
        }

        try {
            await axios.patch(`http://localhost:3001/posts/${postId}`, {
                caption: editCaption
            });

            // Update local state
            setPost(prev => prev.map(p => 
                p.id === postId ? { ...p, caption: editCaption } : p
            ));

            setShowEditModal(null);
            setEditCaption('');
            alert('Post updated successfully!');
        } catch (err) {
            console.log(err);
            alert('Failed to update post!');
        }
    };

    const handleDeletePost = async (postId, userId) => {
        try {
            // Delete the post
            await axios.delete(`http://localhost:3001/posts/${postId}`);

            // Delete all likes associated with the post
            const likesResponse = await axios.get('http://localhost:3001/likes');
            const postLikes = likesResponse.data.filter(like => like.postId == postId);
            for (const like of postLikes) {
                await axios.delete(`http://localhost:3001/likes/${like.id}`);
            }

            // Delete all comments associated with the post
            const commentsResponse = await axios.get('http://localhost:3001/comments');
            const postComments = commentsResponse.data.filter(comment => comment.postId == postId);
            for (const comment of postComments) {
                await axios.delete(`http://localhost:3001/comments/${comment.id}`);
            }

            // Delete all saved instances of the post
            const savedResponse = await axios.get('http://localhost:3001/saved');
            const postSaved = savedResponse.data.filter(save => save.postId == postId);
            for (const save of postSaved) {
                await axios.delete(`http://localhost:3001/saved/${save.id}`);
            }

            // Update user's post count
            const userResponse = await axios.get(`http://localhost:3001/users/${userId}`);
            const currentPostCount = userResponse.data.posts || 0;
            await axios.patch(`http://localhost:3001/users/${userId}`, {
                posts: Math.max(0, currentPostCount - 1)
            });

            // Remove from local state
            setPost(prev => prev.filter(p => p.id !== postId));
            setComments(prev => prev.filter(c => c.postId != postId));
            setShowDeleteConfirm(null);
            setShowPostMenu(null);

            alert('Post deleted successfully!');
        } catch (err) {
            console.log(err);
            alert('Failed to delete post!');
        }
    };

    const getPostComments = (postId) => {
        return comments.filter(comment => comment.postId == postId);
    };

    const getUserById = (userId) => {
        return users.find(user => user.id == userId);
    };

    return (
        <div className="post d-flex justify-content-center">
            {post.length > 0 ? (
                <div>
                    {post.map(posts => {
                        const postComments = getPostComments(posts.id);
                        const isOwnPost = posts.userId == currentUserId;
                        
                        return (
                            <div key={posts.id} className="post-container">
                                <div className="post d-flex align-items-center">
                                    <img className="dp rounded-circle" src={posts.profilePic} alt="profile"></img>
                                    <h5 className="username fw-bold">{posts.username}</h5>
                                    
                                    {isOwnPost && (
                                        <div className="ms-auto position-relative">
                                            <i 
                                                className="bi bi-three-dots"
                                                style={{ cursor: 'pointer', fontSize: '20px' }}
                                                onClick={() => setShowPostMenu(showPostMenu === posts.id ? null : posts.id)}
                                            ></i>
                                            
                                            {showPostMenu === posts.id && (
                                                <div className="post-menu">
                                                    <div 
                                                        className="post-menu-item"
                                                        onClick={() => openEditModal(posts.id, posts.caption)}
                                                    >
                                                        <i className="bi bi-pencil"></i> Edit
                                                    </div>
                                                    <div 
                                                        className="post-menu-item text-danger"
                                                        onClick={() => {
                                                            setShowDeleteConfirm(posts.id);
                                                            setShowPostMenu(null);
                                                        }}
                                                    >
                                                        <i className="bi bi-trash"></i> Delete
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                <img className="post-image" src={posts.image} alt="post"></img>
                                
                                <div className="post-content">
                                    <div className="post-actions d-flex justify-content-between">
                                        <div>
                                            <i 
                                                className={`bi ${likedPosts[posts.id] ? 'bi-heart-fill text-danger' : 'bi-heart'}`}
                                                onClick={() => handleLike(posts.id, posts.likes)}
                                                style={{ cursor: 'pointer', fontSize: '24px' }}
                                            ></i>
                                            <i 
                                                className="bi bi-chat" 
                                                onClick={() => toggleComments(posts.id)}
                                                style={{ cursor: 'pointer', fontSize: '24px' }}
                                            ></i>
                                            <i className="bi bi-send" style={{ cursor: 'pointer', fontSize: '24px' }}></i>
                                        </div>
                                        <div>
                                            <i 
                                                className={`bi ${savedPosts[posts.id] ? 'bi-bookmark-fill' : 'bi-bookmark'}`}
                                                onClick={() => handleSave(posts.id)}
                                                style={{ cursor: 'pointer', fontSize: '24px' }}
                                            ></i>
                                        </div>
                                    </div>
                                    
                                    <div className="likes-section">
                                        <b>{posts.likes} likes</b>
                                    </div>
                                    
                                    <div className="caption-section">
                                        <p><span className="fw-bold">{posts.username}</span> {posts.caption}</p>
                                    </div>

                                    {postComments.length > 0 && (
                                        <div 
                                            className="view-comments"
                                            onClick={() => toggleComments(posts.id)}
                                            style={{ cursor: 'pointer', color: '#8e8e8e' }}
                                        >
                                            View all {postComments.length} comments
                                        </div>
                                    )}

                                    {showComments[posts.id] && (
                                        <div className="comments-section">
                                            {postComments.map(comment => {
                                                const user = getUserById(comment.userId);
                                                return (
                                                    <div key={comment.id} className="comment-item d-flex align-items-start mb-2">
                                                        <img 
                                                            className="comment-dp rounded-circle" 
                                                            src={user?.profilePic || './src/assets/user1.png'} 
                                                            alt="user"
                                                        />
                                                        <div className="comment-content">
                                                            <span className="fw-bold">{user?.username || 'User'}</span>{' '}
                                                            <span>{comment.text}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <div className="add-comment d-flex align-items-center mt-2">
                                        <input
                                            type="text"
                                            className="form-control comment-input"
                                            placeholder="Add a comment..."
                                            value={newComment[posts.id] || ''}
                                            onChange={(e) => handleCommentChange(posts.id, e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleAddComment(posts.id);
                                                }
                                            }}
                                        />
                                        {newComment[posts.id] && (
                                            <button 
                                                className="btn btn-link text-primary fw-bold"
                                                onClick={() => handleAddComment(posts.id)}
                                            >
                                                Post
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Edit Post Modal */}
                                {showEditModal === posts.id && (
                                    <div className="delete-modal-overlay" onClick={() => setShowEditModal(null)}>
                                        <div className="delete-modal edit-modal" onClick={(e) => e.stopPropagation()}>
                                            <h6 className="fw-bold mb-3">Edit Post</h6>
                                            <textarea
                                                className="form-control mb-3"
                                                rows="4"
                                                value={editCaption}
                                                onChange={(e) => setEditCaption(e.target.value)}
                                                placeholder="Write a caption..."
                                                maxLength="200"
                                            />
                                            <small className="text-muted d-block mb-3">{editCaption.length}/200</small>
                                            <div className="d-flex gap-2">
                                                <button 
                                                    className="btn btn-primary flex-grow-1"
                                                    onClick={() => handleEditPost(posts.id)}
                                                >
                                                    Save Changes
                                                </button>
                                                <button 
                                                    className="btn btn-secondary flex-grow-1"
                                                    onClick={() => setShowEditModal(null)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Delete Confirmation Modal */}
                                {showDeleteConfirm === posts.id && (
                                    <div className="delete-modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
                                        <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
                                            <h6 className="fw-bold mb-3">Delete Post?</h6>
                                            <p className="text-muted mb-4">Are you sure you want to delete this post? This action cannot be undone.</p>
                                            <div className="d-flex gap-2">
                                                <button 
                                                    className="btn btn-danger flex-grow-1"
                                                    onClick={() => handleDeletePost(posts.id, posts.userId)}
                                                >
                                                    Delete
                                                </button>
                                                <button 
                                                    className="btn btn-secondary flex-grow-1"
                                                    onClick={() => setShowDeleteConfirm(null)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div>No posts</div>
            )}
        </div>
    )
}

export default Posts
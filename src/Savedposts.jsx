import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function SavedPosts() {
    const [savedPosts, setSavedPosts] = useState([]);
    const [posts, setPosts] = useState([]);
    const currentUserId = 1;
    const navigate = useNavigate();

    // Check for dark mode
    const isDarkMode = document.body.classList.contains('dark-mode');

    useEffect(() => {
        fetchSavedPosts();
    }, []);

    const fetchSavedPosts = async () => {
        try {
            // Get all saved posts for current user
            const savedResponse = await axios.get('http://localhost:3001/saved');
            const userSaved = savedResponse.data.filter(save => save.userId == currentUserId);

            // Get all posts
            const postsResponse = await axios.get('http://localhost:3001/posts');
            
            // Filter posts that are saved by user and sort by saved date
            const savedPostIds = userSaved.map(save => save.postId);
            const filteredPosts = postsResponse.data.filter(post => 
                savedPostIds.includes(post.id)
            );

            // Sort by saved date (newest first)
            const sortedSavedPosts = userSaved.sort((a, b) => 
                new Date(b.savedAt) - new Date(a.savedAt)
            );

            // Merge saved data with post data
            const postsWithSaveData = sortedSavedPosts.map(save => {
                const post = filteredPosts.find(p => p.id == save.postId);
                return { ...post, savedAt: save.savedAt, savedId: save.id };
            });

            setSavedPosts(postsWithSaveData);
        } catch (err) {
            console.log(err);
        }
    };

    const handleUnsave = async (savedId, postId) => {
        try {
            await axios.delete(`http://localhost:3001/saved/${savedId}`);
            setSavedPosts(prev => prev.filter(post => post.savedId !== savedId));
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="saved-posts-container">
            <div className="saved-header">
                <i 
                    className="bi bi-arrow-left"
                    onClick={() => navigate('/')}
                    style={{ cursor: 'pointer', fontSize: '24px', marginRight: '20px' }}
                ></i>
                <h4 className="mb-0 fw-bold">Saved Posts</h4>
            </div>

            <div className="saved-content">
                {savedPosts.length > 0 ? (
                    <div className="saved-posts-grid">
                        {savedPosts.map(post => (
                            <div key={post.savedId} className="saved-post-item">
                                <div className="saved-post-image-wrapper">
                                    <img 
                                        src={post.image} 
                                        alt={post.caption}
                                        className="saved-post-image"
                                    />
                                    <div className="saved-post-overlay">
                                        <div className="saved-post-info">
                                            <span>
                                                <i className="bi bi-heart-fill"></i> {post.likes}
                                            </span>
                                        </div>
                                        <button 
                                            className="unsave-btn"
                                            onClick={() => handleUnsave(post.savedId, post.id)}
                                        >
                                            <i className="bi bi-bookmark-fill"></i> Unsave
                                        </button>
                                    </div>
                                </div>
                                <div className="saved-post-details">
                                    <div className="d-flex align-items-center mb-2">
                                        <img 
                                            src={post.profilePic} 
                                            alt={post.username}
                                            className="saved-post-dp rounded-circle"
                                        />
                                        <span className="fw-bold ms-2">{post.username}</span>
                                    </div>
                                    <p className="saved-post-caption text-truncate mb-1">{post.caption}</p>
                                    <small className="text-muted">
                                        Saved on {new Date(post.savedAt).toLocaleDateString()}
                                    </small>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-saved-state">
                        <i className="bi bi-bookmark" style={{ fontSize: '80px', color: '#dbdbdb' }}></i>
                        <h5 className="mt-3">No Saved Posts</h5>
                        <p className="text-muted">Save posts to view them later</p>
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

export default SavedPosts
import React, { useState, useEffect } from 'react'
import axios from 'axios'

function CreatePost({ isOpen, onClose, onPostCreated }) {
    const [caption, setCaption] = useState('');
    const [selectedImage, setSelectedImage] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const currentUserId = 1; // Current logged-in user
 
    const availableImages = [   
        './src/assets/post-1.png',    
        './src/assets/post-2.png',    
        './src/assets/post-3.png',  
        './src/assets/story-1.png', 
        './src/assets/story-2.png',  
        './src/assets/story-3.png',
        './src/assets/story-4.png',
        './src/assets/story-5.png', 
        './src/assets/story-6.png',
        './src/assets/story-7.png'
    ];

    useEffect(() => {
        if (isOpen) {
            fetchCurrentUser();
        }
    }, [isOpen]);

    const fetchCurrentUser = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/users/${currentUserId}`);
            setCurrentUser(response.data);
        } catch (err) {
            console.log(err);
        }
    };

    const handleCreatePost = async () => {
        if (!selectedImage) {
            alert('Please select an image!');
            return;
        }

        if (!caption.trim()) {
            alert('Please add a caption!');
            return;
        }

        try {
            const newPost = {
                userId: currentUserId,
                username: currentUser.username,
                image: selectedImage,
                profilePic: currentUser.profilePic,
                caption: caption,
                likes: 0,
                createdAt: new Date().toISOString().split('T')[0]
            };

            const response = await axios.post('http://localhost:3001/posts', newPost);
            
            // Update user's post count
            const userResponse = await axios.get(`http://localhost:3001/users/${currentUserId}`);
            const currentPostCount = userResponse.data.posts || 0;
            
            await axios.patch(`http://localhost:3001/users/${currentUserId}`, {
                posts: currentPostCount + 1
            });

            alert('Post created successfully!');
            setCaption('');
            setSelectedImage('');
            onPostCreated();
            onClose();
        } catch (err) {
            console.log(err);
            alert('Failed to create post!');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h5 className="modal-title">Create New Post</h5>
                    <button className="close-btn" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="modal-body">
                    {currentUser && (
                        <div className="user-info d-flex align-items-center mb-3">
                            <img 
                                src={currentUser.profilePic} 
                                alt="profile" 
                                className="dp rounded-circle"
                            />
                            <span className="fw-bold ms-2">{currentUser.username}</span>
                        </div>
                    )}

                    <div className="form-group mb-3">
                        <label className="form-label fw-bold">Select Image</label>
                        <div className="image-grid">
                            {availableImages.map((img, index) => (
                                <div 
                                    key={index}
                                    className={`image-option ${selectedImage === img ? 'selected' : ''}`}
                                    onClick={() => setSelectedImage(img)}
                                >
                                    <img src={img} alt={`option ${index}`} />
                                    {selectedImage === img && (
                                        <div className="selected-overlay">
                                            <i className="bi bi-check-circle-fill"></i>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {selectedImage && (
                        <div className="form-group mb-3">
                            <label className="form-label fw-bold">Selected Image Preview</label>
                            <div className="selected-preview">
                                <img src={selectedImage} alt="preview" />
                            </div>
                        </div>
                    )}

                    <div className="form-group mb-3">
                        <label className="form-label fw-bold">Caption</label>
                        <textarea
                            className="form-control"
                            rows="3"
                            placeholder="Write a caption..."
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            maxLength="200"
                        ></textarea>
                        <small className="text-muted">{caption.length}/200</small>
                    </div>
                </div>

                <div className="modal-footer">
                    <button 
                        className="btn btn-secondary" 
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button 
                        className="btn btn-primary" 
                        onClick={handleCreatePost}
                    >
                        Share Post
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CreatePost

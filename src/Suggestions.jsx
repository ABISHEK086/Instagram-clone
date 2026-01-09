import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios' 
 
function Suggestions() {
     const [profile, setProfile] = useState(null);
     const [suggestion, setSuggestion] = useState([]);
     const [followingUsers, setFollowingUsers] = useState({}); 
     const currentUserId = 1; // Current logged-in   
 
     const navigate = useNavigate();

     useEffect(() => {
         fetchProfile();
         fetchSuggestions();
         fetchFollowing();
     }, []);

     const fetchProfile = () => {
         fetch('http://localhost:3001/profile')
             .then(res => res.json())
             .then(data => setProfile(data[0]))
             .catch(err => console.log(err))
     };

     const fetchSuggestions = () => {
         fetch('http://localhost:3001/suggestions')
             .then(res => res.json())
             .then(data => setSuggestion(data))
             .catch(err => console.log(err))
     };

     const fetchFollowing = () => {
         fetch('http://localhost:3001/users')
             .then(res => res.json())
             .then(data => {
                 const currentUser = data.find(user => user.id == currentUserId);
                 // In a real app, you'd have a separate "following" table
                 // For now, we'll use local state to track follows
                 setFollowingUsers({});
             })
             .catch(err => console.log(err))
     };

     const handleFollow = async (userId) => {
         const isFollowing = followingUsers[userId];

         if (isFollowing) {
             // Unfollow user
             try {
                 // Get current user data
                 const currentUserRes = await axios.get(`http://localhost:3001/users/${currentUserId}`);
                 const targetUserRes = await axios.get(`http://localhost:3001/users/${userId}`);

                 const currentUser = currentUserRes.data;
                 const targetUser = targetUserRes.data;

                 // Update following count for current user
                 await axios.patch(`http://localhost:3001/users/${currentUserId}`, {
                     following: currentUser.following - 1
                 });

                 // Update followers count for target user
                 await axios.patch(`http://localhost:3001/users/${userId}`, {
                     followers: targetUser.followers - 1
                 });

                 // Update local state
                 setFollowingUsers(prev => {
                     const newFollowing = { ...prev };
                     delete newFollowing[userId];
                     return newFollowing;
                 });

                 // Update suggestion display
                 setSuggestion(prev => prev.map(user => 
                     user.id == userId 
                         ? { ...user, followers: user.followers - 1 }
                         : user
                 ));

             } catch (err) {
                 console.log(err);
             }
         } else {
             // Follow user
             try {
                 // Get current user data
                 const currentUserRes = await axios.get(`http://localhost:3001/users/${currentUserId}`);
                 const targetUserRes = await axios.get(`http://localhost:3001/users/${userId}`);

                 const currentUser = currentUserRes.data;
                 const targetUser = targetUserRes.data;

                 // Update following count for current user
                 await axios.patch(`http://localhost:3001/users/${currentUserId}`, {
                     following: currentUser.following + 1
                 });

                 // Update followers count for target user
                 await axios.patch(`http://localhost:3001/users/${userId}`, {
                     followers: targetUser.followers + 1
                 });

                 // Update local state
                 setFollowingUsers(prev => ({
                     ...prev,
                     [userId]: true
                 }));

                 // Update suggestion display
                 setSuggestion(prev => prev.map(user => 
                     user.id == userId 
                         ? { ...user, followers: user.followers + 1 }
                         : user
                 ));

             } catch (err) {
                 console.log(err);
             }
         }
     };

     return (
         <div className="suggestions m-3">
             {profile ? (
                 <div className="post d-flex">
                     <img 
                         className="dp rounded-circle" 
                         onClick={() => { navigate('/profile') }} 
                         src={profile.profilePic} 
                         alt="profile"
                         style={{ cursor: 'pointer' }}
                     />
                     <h5 className="username fw-bold">{profile.username}</h5> 
                     <small className="ms-auto text-primary" style={{ cursor: 'pointer' }}>switch</small>
                 </div>
             ) : (
                 <p>Loading</p>
             )}

             <div className="d-flex mt-3">
                 <h5 className='one fw-bold'>Suggestions for you</h5>
                 <p className="fw-bold ms-auto" style={{ cursor: 'pointer', fontSize: '12px' }}>See All</p>
             </div>
        
             <div className="d-flex flex-column gap-3">
                 {suggestion.map(user => (
                     <div key={user.id} className="suggestion-item">
                         <div className="post d-flex align-items-center">
                             <img 
                                 className="dp rounded-circle" 
                                 src={user.profilePic} 
                                 alt="profile"
                             />
                             <div className="flex-grow-1">
                                 <h5 className="username fw-bold mb-0">{user.username}</h5>
                                 <p className="name text-muted mb-0" style={{ fontSize: '12px' }}>
                                     {user.name}
                                 </p>
                             </div>
                             <button 
                                 className={`follow-button ms-auto ${followingUsers[user.id] ? 'following' : ''}`}
                                 onClick={() => handleFollow(user.id)}
                             >
                                 {followingUsers[user.id] ? 'Following' : 'Follow'}
                             </button>
                         </div>
                     </div>
                 ))}
             </div>
         </div>
     )
}

export default Suggestions

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom' 
import axios from 'axios'

function Sidebar({ onCreateClick, darkMode, toggleDarkMode }) {
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const currentUserId = 1

  useEffect(() => {
    fetchUnreadCount()
    fetchUnreadMessages()
    // Poll for new notifications and messages every 3 seconds
    const interval = setInterval(() => {
      fetchUnreadCount()
      fetchUnreadMessages()
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('http://localhost:3001/notifications')
      const unread = response.data.filter(
        notif => notif.recipientId == currentUserId && !notif.read
      )
      setUnreadCount(unread.length)
    } catch (err) {
      console.log(err)
    }
  }

  const fetchUnreadMessages = async () => {
    try {
      const response = await axios.get('http://localhost:3001/messages')
      const unread = response.data.filter(
        msg => msg.receiverId == currentUserId && !msg.read
      )
      setUnreadMessages(unread.length)
    } catch (err) {
      console.log(err)
    }
  }
  
  return (
    <div className="m-3">
      <div className="d-flex flex-column gap-3 position-fixed">
        <img className="logo-text" src="src\assets\instagram-text.png" alt="Instagram"></img>
        <div 
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <i className="bi bi-house-door-fill"></i>Home
        </div>
        <div 
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/search')}
        >
          <i className="bi bi-search"></i>Search
        </div>
        <div 
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <i className="bi bi-compass"></i>Explore
        </div>
        <div className="reel" style={{ cursor: 'pointer' }}>
          <i className="bi bi-play-circle"></i>Reels
        </div>
        <div 
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/messages')}
          className="position-relative"
        >
          <i className="bi bi-chat"></i>Messages
          {unreadMessages > 0 && (
            <span className="notification-badge">{unreadMessages}</span>
          )}
        </div>
        <div 
          onClick={onCreateClick}
          style={{ cursor: 'pointer' }}
        >
          <i className="bi bi-plus-square"></i>Create
        </div>
        <div 
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/saved')}
        >
          <i className="bi bi-bookmark"></i>Saved
        </div>
        <div 
          className="notification position-relative" 
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/notifications')}
        >
          <i className="bi bi-bell-fill"></i>Notifications
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </div>
        <div 
          onClick={() => { navigate('/profile') }}
          style={{ cursor: 'pointer' }}
        >
          <i className="bi bi-person-circle"></i>Profile
        </div>
      </div>

      <div className="position-absolute bottom-0 d-flex flex-column gap-3 position-fixed">
        <div 
          onClick={toggleDarkMode}
          style={{ cursor: 'pointer' }}
          className="dark-mode-toggle"
        >
          <i className={`bi ${darkMode ? 'bi-sun-fill' : 'bi-moon-fill'}`}></i>
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </div>
        <div style={{ cursor: 'pointer' }}>
          <i className="bi bi-threads"></i>Threads
        </div>
        <div style={{ cursor: 'pointer' }}>
          <i className="bi bi-list"></i>More
        </div>
      </div> 
    </div>
  )
}

export default Sidebar
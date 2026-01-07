import React from 'react'
import { useNavigate } from 'react-router-dom' 

function Sidebar({ onCreateClick, darkMode, toggleDarkMode }) {
  const navigate = useNavigate()
  
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
        <div style={{ cursor: 'pointer' }}>
          <i className="bi bi-heart"></i>Messages
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
        <div className="notification" style={{ cursor: 'pointer' }}>
          <i className="bi bi-bell-fill"></i>Notifications
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
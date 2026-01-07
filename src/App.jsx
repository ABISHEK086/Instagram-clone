import React, { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Feed from './Feed'
import Suggestions from './Suggestions'
import CreatePost from './CreatePost'

function App() {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [refreshFeed, setRefreshFeed] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Load dark mode preference from localStorage
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
      setDarkMode(true);
      document.body.classList.add('dark-mode');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('darkMode', 'false');
    }
  };

  const handleCreateClick = () => {
    setIsCreatePostOpen(true);
  };

  const handleCloseCreatePost = () => {
    setIsCreatePostOpen(false);
  };

  const handlePostCreated = () => {
    // Refresh the feed by changing the key
    setRefreshFeed(prev => prev + 1);
  };

  return (
    <div className={darkMode ? 'dark-mode' : ''}>
      <div className={`d-flex vh-100 ${darkMode ? 'bg-dark-primary' : 'bg-white'}`}>
        <div className="w-20">
          <Sidebar 
            onCreateClick={handleCreateClick} 
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />
        </div>
        <div className='w-50'>
          <Feed key={refreshFeed} />
        </div>
        <div className="w-30">
          <Suggestions />
        </div>
      </div>
      
      <CreatePost 
        isOpen={isCreatePostOpen}
        onClose={handleCloseCreatePost}
        onPostCreated={handlePostCreated}
      />
    </div>
  )
}

export default App
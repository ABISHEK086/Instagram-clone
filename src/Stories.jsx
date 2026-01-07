import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Stories() {
  const [stories, setStories] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetch('http://localhost:3001/story')
      .then(res => res.json())
      .then(data => setStories(data))
      .catch(err => console.log(err))
  }, []);

  return (
    <div className="story my-3 bg-beige d-flex">
      {stories.length > 0 ? (
        stories.map((story) => (
          <div
            key={story.id}
            onClick={() => navigate(`/story/${story.id}/${stories.length}`)}
          >
            <img
              className="story story-gradient rounded-circle"
              src={story.image}
              alt="story"
            />
            <p className="username text-truncate" style={{ width: "70px" }}>
              {story.username}
            </p>
          </div>
        ))
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}

export default Stories

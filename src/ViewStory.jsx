import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
 
function ViewStory() {
  const { id, tot } = useParams()
  const [story, setStory] = useState(null)
  const navigate = useNavigate()
   
  useEffect(() => {  
    fetch(`http://localhost:3001/story/${id}`)    
      .then(res => res.json()) 
      .then(data => setStory(data))  
      .catch(err => console.log(err)) 
  }, [id])

  if (Number(id) > Number(tot) || Number(id) <= 0) {
    navigate('/')
    return null
  }

  return (
    <div className="d-flex justify-content-center">
      {story ? (
        <div>
          <p>{story.username}</p>

          <Link to={`/story/${Number(id) - 1}/${tot}`}> 
            <i className="bi bi-arrow-left-circle-fill"></i>
          </Link>

          <img src={story.image} alt="story" />     

          <Link to={`/story/${Number(id) + 1}/${tot}`}>
            <i className="bi bi-arrow-right-circle-fill"></i> 
          </Link>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}

export default ViewStory
 

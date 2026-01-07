import React from 'react'
import {useState} from 'react'
import {useEffect} from 'react'

function Comments() {


    const [comments, setComments]=useState([]);

   useEffect(() => {
              fetch('http://localhost:3001/comments')
              .then(res => res.json())
              .then(data => setComments(data)).catch(err => console.log(err))
          }, []);

  return (
    <div>
      {comments.map(comments => (
        <div key={comments.id}>
            <div>
                {comments.id}
                <p>Comment:{comments.text}</p>
            </div>
        </div>
      ))}

    </div>
  )
}

export default Comments
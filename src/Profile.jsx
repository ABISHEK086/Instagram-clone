import React, { useState } from 'react'
import axios from 'axios';

import { useEffect } from 'react';

import { useNavigate } from 'react-router-dom'

function Profile() {
  
  const [profile,setprofile]=useState(null);
  const navigate = useNavigate();




  
  useEffect(()=>{
    axios.get('http://localhost:3001/profile')
    // .then(data=>{setprofile(data.data); console.log(data)})
    .then(data=>setprofile(data.data[0]))
    .catch(err=>console.log(err));

  },[]);
   
  return (
    <div>


      {profile ?
      
      <div className="main">

        <div className="post d-flex">
          <h5 className="username fw-bold">{profile.username}</h5> 
        </div>

        <div className="post d-flex">
            <img className="profile-dp dp rounded-circle" src={profile.profilePic} alt="profile"></img>
           <div className="profile-details d-flex">
             <p className="profile-post">Posts <br></br> <center>{profile.posts}</center></p>
            <p className="followers">Followers <br></br> <center>{profile.followers}</center></p>
            <p className="following">Following <br></br><center> {profile.following}</center></p>
           </div>
            
            {/* <small className="ms-auto text-primary">switch</small> */}
        </div>
        <div className="profile-bioo">
            <p className="profile-name fw-bold">{profile.name}</p>
            <p className="profile-bio">{profile.bio}</p>
            <button className="btn btn-primary my-2" onClick={()=>{navigate('/updateprofile')}} >Edit</button>
        </div>

        
        
      </div>
      :(
        <p>Loading profile..</p>
      )
    }
    </div>
  )
}

export default Profile
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function UpdateProfile() {
  const [profile, setProfile] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    axios
      .get('http://localhost:3001/profile')
      .then(res => setProfile(res.data[0]))
      .catch(err => console.log(err))
  }, []);

  function handleOnChange(e) {
    const { name, value } = e.target
    setProfile(prev => ({
      ...prev,
      [name]: value
    }))
  }

  function handleSave() {
    axios
      .put(`http://localhost:3001/profile/${profile.id}`, profile)
      .then(() => {
        alert('Profile updated successfully')
        navigate('/profile')
      })
      .catch(err => console.log(err))
  }

  return (
    <div className="d-flex justify-content-center mt-4">
      {profile ? (
        <div className="main w-50">
          <div className="post d-flex mb-3">
            <h5 className="username fw-bold">{profile.username}</h5>
          </div>

          <div className="d-flex align-items-center mb-4">
            <img 
              className="profile-dp dp rounded-circle me-3"
              src={profile.profilePic}
              alt="profile"
            />
            <h5 className="username1 fw-bold">{profile.name}</h5>
            <small className="ms-auto text-primary">Switch</small>
          </div>

          <div className="update">
            <input
              type="text"
              name="username"
              value={profile.username}
              className="form-control my-3"
              placeholder="Username"
              onChange={handleOnChange}
            />

            <input
              type="text"
              name="name"
              value={profile.name}
              className="form-control my-3"
              placeholder="Name"
              onChange={handleOnChange}
            />


            <input
              type="link"
              name="website url"
              value={null}
              className="form-control my-3"
              placeholder="Website url1"
              onChange={handleOnChange}
            />
            <input
              type="link"
              name="website url"
              value={null}
              className="form-control my-3"
              placeholder="Website url2"
              onChange={handleOnChange}
            />

            <input
              type="textarea"
              name="bio"
              value={profile.bio}
              className="form-control my-3"
              placeholder="Bio"
              onChange={handleOnChange}
            />

            <button
              className="btn btn-primary my-3"
              onClick={handleSave}
            >
              Save
            </button>

            <button
              className="btn btn-secondary my-3 ms-2"
              onClick={() => navigate('/profile')}
            >
              Back
            </button>
          </div>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  )
}

export default UpdateProfile

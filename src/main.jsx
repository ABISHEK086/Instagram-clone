import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import ViewStory from './ViewStory.jsx'
import Profile from './Profile.jsx'
import UpdateProfile from './UpdateProfile.jsx'
import Comments from './Comments.jsx'
import Search from './Search.jsx'
import SavedPosts from './Savedposts.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />  
  },
  {
    path: "/search",
    element: <Search />
  },
  {
    path: "/saved",
    element: <SavedPosts />
  },
  {
    path: "/story/:id/:tot",
    element: <ViewStory />
  },
  {
    path: "/profile",
    element: <Profile />  
  },
  {
    path: "/updateprofile",
    element: <UpdateProfile />
  },
  {
    path: "/comments",
    element: <Comments />
  }
])

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)

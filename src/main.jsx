import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import ViewStory from './ViewStory.jsx'
import Profile from './Profile.jsx'
import UpdateProfile from './UpdateProfile.jsx'
import Comments from './Comments.jsx'
import Search from './Search.jsx'
import SavedPosts from './SavedPosts.jsx'
import Notifications from './Notifications.jsx'
import Messages from './Messages.jsx'
import Chat from './Chat.jsx'

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
    path: "/notifications",
    element: <Notifications />
  },
  {
    path: "/messages",
    element: <Messages />
  },
  {
    path: "/chat/:userId",
    element: <Chat />
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
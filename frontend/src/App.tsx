import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import UserProfile from './pages/UserProfile'
import JDAnalysis from './pages/JDAnalysis'
import ResumeList from './pages/ResumeList'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/jd-analysis" element={<JDAnalysis />} />
          <Route path="/resumes" element={<ResumeList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

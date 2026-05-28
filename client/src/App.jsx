import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Generate from './pages/Generate'
import WebsiteEditor from './pages/Editor'
import LiveSite from './pages/LiveSite'
import useGetCurrentUser from './hooks/useGetCurrentUser'
import Pricing from './pages/Pricing'

function RedirectToEditor() {
  const { id } = useParams()
  return <Navigate to={`/editor/${id}`} replace />
}

function AppContent() {
  const location = useLocation()
  useGetCurrentUser(location.pathname)
  const { userData } = useSelector(state => state.user)

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={userData ? <Dashboard /> : <Home />} />
      <Route path="/generate" element={userData ? <Generate /> : <Home />} />
      <Route path="/generate/:id" element={userData ? <RedirectToEditor /> : <Home />} />
      <Route path="/editor/:id" element={userData ? <WebsiteEditor /> : <Home />} />
      <Route path="/site/:id" element={<LiveSite />} />
      <Route path="/pricing" element={<Pricing />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App

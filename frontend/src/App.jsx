import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Editor from './pages/Editor'
import Settings from './pages/Settings'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        {/* Only show navbar on the home page */}
        <Routes>
          <Route path="/" element={
            <>
              <Navbar />
              <div className="content">
                <Home />
              </div>
            </>
          } />
          <Route path="/login" element={
            <div className="content no-navbar">
              <Login />
            </div>
          } />
          <Route path="/signup" element={
            <div className="content no-navbar">
              <Signup />
            </div>
          } />
          <Route path="/dashboard" element={
            <div className="content no-navbar">
              <Dashboard />
            </div>
          } />
          <Route path="/editor" element={
            <div className="content no-navbar">
              <Editor />
            </div>
          } />
          <Route path="/editor/:id" element={
            <div className="content no-navbar">
              <Editor />
            </div>
          } />
          <Route path="/settings" element={
            <div className="content no-navbar">
              <Settings />
            </div>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App

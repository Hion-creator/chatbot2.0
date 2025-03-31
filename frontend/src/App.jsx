import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import UploadPDF from './components/UploadPDF'
import Metrics from './components/Metrics'
import OnboardingBot from './components/OnboardingBot'
import ExamForm from './components/ExamForm'
import QueryBot from './components/QueryBot' // opcional

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<OnboardingBot />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<UploadPDF />} />
        <Route path="/metrics" element={<Metrics />} />
        <Route path="/onboarding" element={<OnboardingBot />} />
        <Route path="/exam" element={<ExamForm />} />
        <Route path="/query" element={<QueryBot />} />
      </Routes>
    </Router>
  )
}

export default App







import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './components/Login'
import Layout from './components/Layout'  // Nuevo componente que contiene sidebar
import UploadPDF from './components/UploadPDF'
import Metrics from './components/Metrics'
import OnboardingBot from './components/OnboardingBot'
import ExamForm from './components/ExamForm'
import QueryBot from './components/QueryBot'
import DashboardContent from './components/DashboardContent'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Rutas protegidas bajo el Layout con sidebar */}
        <Route path="/" element={<Layout />}>
        <Route path="dashboard" element={<DashboardContent />} />
          <Route path="upload" element={<UploadPDF />} />
          <Route path="metrics" element={<Metrics />} />
          <Route path="onboarding" element={<OnboardingBot />} />
          <Route path="exam" element={<ExamForm />} />
          <Route path="query" element={<QueryBot />} />
        </Route>

      </Routes>
    </Router>
  )
}

export default App








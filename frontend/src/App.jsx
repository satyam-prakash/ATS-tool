import { Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Results from './pages/Results'

function App() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/results/:resumeId" element={<Results />} />
      </Routes>
    </Box>
  )
}

export default App

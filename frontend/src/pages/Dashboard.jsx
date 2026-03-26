import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material'
import { motion } from 'framer-motion'
import HomeIcon from '@mui/icons-material/Home'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import ResumeUpload from '../components/ResumeUpload'
import JobDescriptionInput from '../components/JobDescriptionInput'
import { atsAPI } from '../services/api'

const steps = ['Upload Resume', 'Enter Job Description', 'Analyze']

const Dashboard = () => {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [resumeData, setResumeData] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState(null)

  const handleUploadSuccess = (data) => {
    setResumeData(data)
    setActiveStep(1)
    setError(null)
  }

  const handleAnalyze = async () => {
    if (!resumeData) {
      setError('Please upload a resume first')
      return
    }

    if (!jobDescription || jobDescription.trim().length < 100) {
      setError('Please enter a detailed job description (at least 100 characters)')
      return
    }

    setAnalyzing(true)
    setError(null)

    try {
      const result = await atsAPI.analyze(resumeData.resumeId, jobDescription)

      if (result.success) {
        // Navigate to results page
        navigate(`/results/${resumeData.resumeId}`, {
          state: {
            analysisData: result.data,
            resumeData,
            jobDescription,
          },
        })
      }
    } catch (err) {
      console.error('Analysis error:', err)
      setError(err.response?.data?.error || 'Failed to analyze resume. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleNext = () => {
    if (activeStep === 0 && !resumeData) {
      setError('Please upload your resume first')
      return
    }
    if (activeStep === 1 && jobDescription.trim().length < 100) {
      setError('Please enter a detailed job description (at least 100 characters)')
      return
    }

    if (activeStep === 2) {
      handleAnalyze()
    } else {
      setActiveStep((prev) => prev + 1)
      setError(null)
    }
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
    setError(null)
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* App Bar */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            ATS Resume Optimizer
          </Typography>
          <Button color="inherit" startIcon={<HomeIcon />} onClick={() => navigate('/')}>
            Home
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
            Resume ATS Analysis
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Upload your resume and paste the job description to get instant feedback
          </Typography>

          {/* Stepper */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Step Content */}
          <Box sx={{ minHeight: 400 }}>
            {activeStep === 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ResumeUpload onUploadSuccess={handleUploadSuccess} />
              </motion.div>
            )}

            {activeStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <JobDescriptionInput
                  value={jobDescription}
                  onChange={setJobDescription}
                />
              </motion.div>
            )}

            {activeStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <AnalyticsIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    Ready to Analyze!
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    We'll analyze your resume against the job description and provide:
                  </Typography>
                  <Box sx={{ textAlign: 'left', maxWidth: 500, mx: 'auto', mb: 3 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      ✓ ATS compatibility score (0-100)
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      ✓ Missing keywords identification
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      ✓ Formatting suggestions
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      ✓ Actionable improvement recommendations
                    </Typography>
                  </Box>
                  {resumeData && (
                    <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 2, mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Resume:</strong> {resumeData.fileName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Job Description:</strong> {jobDescription.length} characters
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </motion.div>
            )}
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0 || analyzing}
              onClick={handleBack}
              size="large"
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              size="large"
              disabled={analyzing || (activeStep === 0 && !resumeData)}
              sx={{ minWidth: 150 }}
            >
              {analyzing ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Analyzing...
                </>
              ) : activeStep === steps.length - 1 ? (
                'Analyze Resume'
              ) : (
                'Next'
              )}
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  )
}

export default Dashboard

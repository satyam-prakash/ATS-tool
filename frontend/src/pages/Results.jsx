import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Grid,
  Paper,
  Divider,
  Alert,
} from '@mui/material'
import { motion } from 'framer-motion'
import HomeIcon from '@mui/icons-material/Home'
import RefreshIcon from '@mui/icons-material/Refresh'
import DownloadIcon from '@mui/icons-material/Download'
import ATSScoreDisplay from '../components/ATSScoreDisplay'
import SuggestionsList from '../components/SuggestionsList'

const Results = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { resumeId } = useParams()

  const analysisData = location.state?.analysisData
  const resumeData = location.state?.resumeData
  const jobDescription = location.state?.jobDescription

  if (!analysisData) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              ATS Resume Optimizer
            </Typography>
            <Button color="inherit" onClick={() => navigate('/')}>
              Home
            </Button>
          </Toolbar>
        </AppBar>
        <Container sx={{ py: 8 }}>
          <Alert severity="error">
            No analysis data found. Please go back and analyze your resume.
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate('/dashboard')}
            sx={{ mt: 2 }}
          >
            Go to Dashboard
          </Button>
        </Container>
      </Box>
    )
  }

  const {
    atsScore,
    scoreBreakdown,
    missingKeywords,
    formattingIssues,
    suggestions,
    actionItems,
    overallFeedback,
  } = analysisData

  const handleNewAnalysis = () => {
    navigate('/dashboard')
  }

  const handleDownloadReport = () => {
    const report = {
      resumeId,
      fileName: resumeData?.fileName,
      analysisDate: new Date().toISOString(),
      atsScore,
      scoreBreakdown,
      missingKeywords,
      formattingIssues,
      suggestions,
      actionItems,
      overallFeedback,
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ats-analysis-${resumeId}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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

      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
              Analysis Results
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {resumeData?.fileName || 'Your Resume'} • Analyzed on{' '}
              {new Date().toLocaleDateString()}
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Left Column - Score */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ATSScoreDisplay score={atsScore} scoreBreakdown={scoreBreakdown} />

              {/* Overall Feedback */}
              {overallFeedback && (
                <Paper sx={{ p: 3, mt: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Overall Feedback
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {overallFeedback}
                  </Typography>
                </Paper>
              )}

              {/* Actions */}
              <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Actions
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={handleNewAnalysis}
                  sx={{ mb: 1 }}
                >
                  New Analysis
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadReport}
                >
                  Download Report
                </Button>
              </Paper>
            </motion.div>
          </Grid>

          {/* Right Column - Suggestions */}
          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <SuggestionsList
                suggestions={suggestions}
                missingKeywords={missingKeywords}
                formattingIssues={formattingIssues}
                actionItems={actionItems}
              />
            </motion.div>
          </Grid>
        </Grid>

        {/* Job Description Preview */}
        {jobDescription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Job Description Used
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  whiteSpace: 'pre-wrap',
                  maxHeight: 200,
                  overflow: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  bgcolor: 'grey.50',
                  p: 2,
                  borderRadius: 1,
                }}
              >
                {jobDescription}
              </Typography>
            </Paper>
          </motion.div>
        )}

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              💡 Pro Tips:
            </Typography>
            <Typography variant="body2">
              • Tailor your resume for each job application
              <br />
              • Use keywords naturally in context
              <br />
              • Quantify achievements with numbers and percentages
              <br />• Keep formatting simple and ATS-friendly (no tables, images, or
              complex layouts)
            </Typography>
          </Alert>
        </motion.div>
      </Container>
    </Box>
  )
}

export default Results

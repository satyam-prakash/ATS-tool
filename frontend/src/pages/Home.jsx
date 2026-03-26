import { Box, Container, Typography, Button, Grid, Card, CardContent, Paper } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import SpeedIcon from '@mui/icons-material/Speed'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import SmartToyIcon from '@mui/icons-material/SmartToy'

const Home = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <SpeedIcon sx={{ fontSize: 48 }} />,
      title: 'Instant ATS Score',
      description: 'Get your ATS compatibility score in seconds with AI-powered analysis',
    },
    {
      icon: <AutoFixHighIcon sx={{ fontSize: 48 }} />,
      title: 'Smart Suggestions',
      description: 'Receive actionable recommendations to improve your resume',
    },
    {
      icon: <CheckCircleIcon sx={{ fontSize: 48 }} />,
      title: 'Keyword Matching',
      description: 'Identify missing keywords from job descriptions',
    },
    {
      icon: <SmartToyIcon sx={{ fontSize: 48 }} />,
      title: 'AI-Powered',
      description: 'Powered by advanced AI for intelligent resume optimization',
    },
  ]

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                  Optimize Your Resume for ATS
                </Typography>
                <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                  Get your resume past Applicant Tracking Systems and land more interviews
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/dashboard')}
                  startIcon={<RocketLaunchIcon />}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': {
                      bgcolor: 'grey.100',
                    },
                  }}
                >
                  Start Optimizing
                </Button>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    bgcolor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
                    Why ATS Matters
                  </Typography>
                  <Typography sx={{ mb: 2 }}>
                    📊 <strong>75%</strong> of resumes never reach human eyes
                  </Typography>
                  <Typography sx={{ mb: 2 }}>
                    🤖 ATS software filters resumes before recruiters see them
                  </Typography>
                  <Typography>
                    ✨ Optimize your resume to increase interview chances by <strong>60%</strong>
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ fontWeight: 700, mb: 6 }}
        >
          How It Works
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
              Ready to Get Started?
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              Upload your resume and job description to get instant feedback
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/dashboard')}
              startIcon={<RocketLaunchIcon />}
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.2rem',
              }}
            >
              Analyze My Resume Now
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" align="center">
            © 2024 ATS Resume Optimizer. Powered by AI. Built with ❤️ for job seekers.
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}

export default Home

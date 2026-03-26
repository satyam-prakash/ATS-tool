import { Box, Paper, Typography, LinearProgress, Chip, Grid } from '@mui/material'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import RemoveIcon from '@mui/icons-material/Remove'

const ATSScoreDisplay = ({ score, scoreBreakdown }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return '#2e7d32' // Green
    if (score >= 60) return '#ed6c02' // Orange
    return '#d32f2f' // Red
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Improvement'
  }

  const getScoreIcon = (score) => {
    if (score >= 60) return <TrendingUpIcon />
    if (score >= 40) return <RemoveIcon />
    return <TrendingDownIcon />
  }

  // Data for pie chart
  const pieData = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ]

  const breakdownItems = scoreBreakdown
    ? [
        { label: 'Keyword Match', value: scoreBreakdown.keywordMatch, max: 40 },
        { label: 'Formatting', value: scoreBreakdown.formatting, max: 20 },
        { label: 'Completeness', value: scoreBreakdown.completeness, max: 20 },
        { label: 'Content Quality', value: scoreBreakdown.contentQuality, max: 20 },
      ]
    : []

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        ATS Score Analysis
        {getScoreIcon(score)}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 3 }}>
        {/* Circular gauge */}
        <Box sx={{ position: 'relative', width: 200, height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                startAngle={90}
                endAngle={-270}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={0}
                dataKey="value"
              >
                <Cell fill={getScoreColor(score)} />
                <Cell fill="#e0e0e0" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center text */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <Typography variant="h2" sx={{ fontWeight: 700, color: getScoreColor(score) }}>
              {score}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              out of 100
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Chip
          label={getScoreLabel(score)}
          sx={{
            bgcolor: getScoreColor(score),
            color: 'white',
            fontWeight: 600,
            fontSize: '1rem',
            px: 2,
            py: 2.5,
          }}
        />
      </Box>

      {scoreBreakdown && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Score Breakdown
          </Typography>

          <Grid container spacing={2}>
            {breakdownItems.map((item, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {item.label}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {Math.round((item.value / item.max) * 100)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(item.value / item.max) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getScoreColor((item.value / item.max) * 100),
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Paper>
  )
}

export default ATSScoreDisplay

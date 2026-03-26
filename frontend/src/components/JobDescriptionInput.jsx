import { useState } from 'react'
import { Box, TextField, Typography, Paper, Chip } from '@mui/material'
import WorkIcon from '@mui/icons-material/Work'

const JobDescriptionInput = ({ value, onChange, disabled }) => {
  const [charCount, setCharCount] = useState(value?.length || 0)

  const handleChange = (e) => {
    const text = e.target.value
    setCharCount(text.length)
    if (onChange) {
      onChange(text)
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <WorkIcon color="primary" />
        <Typography variant="h6">Job Description</Typography>
      </Box>

      <TextField
        fullWidth
        multiline
        rows={10}
        placeholder="Paste the job description here...

Example:
We are looking for a Senior Full Stack Developer with 5+ years of experience in React, Node.js, and cloud technologies. The ideal candidate will have:
- Strong proficiency in JavaScript/TypeScript
- Experience with AWS or Azure
- Knowledge of microservices architecture
- Excellent problem-solving skills
..."
        value={value}
        onChange={handleChange}
        disabled={disabled}
        variant="outlined"
        sx={{
          '& .MuiOutlinedInput-root': {
            fontFamily: 'monospace',
            fontSize: '0.9rem',
          },
        }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {charCount} characters
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {charCount === 0 && (
            <Chip label="Empty" size="small" color="default" />
          )}
          {charCount > 0 && charCount < 200 && (
            <Chip label="Too Short" size="small" color="warning" />
          )}
          {charCount >= 200 && charCount < 1000 && (
            <Chip label="Good Length" size="small" color="success" />
          )}
          {charCount >= 1000 && (
            <Chip label="Detailed" size="small" color="info" />
          )}
        </Box>
      </Box>

      {charCount > 0 && charCount < 200 && (
        <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
          ⚠️ For better results, provide a more detailed job description (at least 200 characters)
        </Typography>
      )}
    </Paper>
  )
}

export default JobDescriptionInput

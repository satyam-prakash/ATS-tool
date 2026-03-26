import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DescriptionIcon from '@mui/icons-material/Description'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { resumeAPI } from '../services/api'

const ResumeUpload = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      setError(null)
      setUploading(true)
      setUploadProgress(0)

      try {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + 10
          })
        }, 200)

        const result = await resumeAPI.upload(file)

        clearInterval(progressInterval)
        setUploadProgress(100)

        setUploadedFile({
          name: file.name,
          size: file.size,
          data: result.data,
        })

        if (onUploadSuccess) {
          onUploadSuccess(result.data)
        }

        setTimeout(() => {
          setUploading(false)
        }, 500)
      } catch (err) {
        console.error('Upload error:', err)
        setError(err.response?.data?.error || 'Failed to upload resume. Please try again.')
        setUploading(false)
        setUploadProgress(0)
      }
    },
    [onUploadSuccess]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <Box>
      {!uploadedFile ? (
        <Paper
          {...getRootProps()}
          sx={{
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            bgcolor: isDragActive ? 'primary.50' : 'background.paper',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'primary.50',
            },
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            or click to select a file
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Supports PDF, DOC, and DOCX files (Max 10MB)
          </Typography>

          {uploading && (
            <Box sx={{ mt: 3 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Uploading and parsing... {uploadProgress}%
              </Typography>
            </Box>
          )}
        </Paper>
      ) : (
        <Paper
          sx={{
            p: 3,
            border: '2px solid',
            borderColor: 'success.main',
            bgcolor: 'success.50',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 40 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" color="success.dark">
                Resume Uploaded Successfully!
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <DescriptionIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {uploadedFile.name} ({formatFileSize(uploadedFile.size)})
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setUploadedFile(null)
                setError(null)
              }}
            >
              Upload Another
            </Button>
          </Box>
        </Paper>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
    </Box>
  )
}

export default ResumeUpload

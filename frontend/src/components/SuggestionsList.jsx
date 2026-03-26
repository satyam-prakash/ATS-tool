import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import ErrorIcon from '@mui/icons-material/Error'
import WarningIcon from '@mui/icons-material/Warning'
import InfoIcon from '@mui/icons-material/Info'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import KeyIcon from '@mui/icons-material/Key'
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft'
import ArticleIcon from '@mui/icons-material/Article'
import AccountTreeIcon from '@mui/icons-material/AccountTree'

const SuggestionsList = ({ suggestions, missingKeywords, formattingIssues, actionItems }) => {
  const getCategoryIcon = (category) => {
    const icons = {
      keywords: <KeyIcon />,
      formatting: <FormatAlignLeftIcon />,
      content: <ArticleIcon />,
      structure: <AccountTreeIcon />,
    }
    return icons[category] || <LightbulbIcon />
  }

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'error',
      medium: 'warning',
      low: 'info',
    }
    return colors[priority] || 'default'
  }

  const getPriorityIcon = (priority) => {
    const icons = {
      high: <ErrorIcon />,
      medium: <WarningIcon />,
      low: <InfoIcon />,
    }
    return icons[priority] || <InfoIcon />
  }

  // Group suggestions by category
  const groupedSuggestions = suggestions?.reduce((acc, sugg) => {
    const category = sugg.category || 'general'
    if (!acc[category]) acc[category] = []
    acc[category].push(sugg)
    return acc
  }, {})

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Missing Keywords */}
      {missingKeywords && missingKeywords.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <KeyIcon color="error" />
            Missing Keywords ({missingKeywords.length})
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add these keywords from the job description to improve your ATS score:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {missingKeywords.slice(0, 20).map((keyword, index) => (
              <Chip
                key={index}
                label={keyword}
                size="small"
                sx={{ bgcolor: 'error.50', color: 'error.dark', border: '1px solid', borderColor: 'error.light' }}
              />
            ))}
          </Box>
          {missingKeywords.length > 20 && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              ... and {missingKeywords.length - 20} more keywords
            </Typography>
          )}
        </Paper>
      )}

      {/* Formatting Issues */}
      {formattingIssues && formattingIssues.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormatAlignLeftIcon color="warning" />
            Formatting Issues ({formattingIssues.length})
          </Typography>
          <List dense>
            {formattingIssues.map((issue, index) => (
              <ListItem key={index}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <WarningIcon color="warning" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={issue} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Improvement Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LightbulbIcon color="primary" />
            Improvement Suggestions ({suggestions.length})
          </Typography>

          {Object.entries(groupedSuggestions || {}).map(([category, items], catIndex) => (
            <Accordion key={catIndex} defaultExpanded={catIndex === 0}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getCategoryIcon(category)}
                  <Typography sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
                    {category}
                  </Typography>
                  <Chip label={items.length} size="small" />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {items.map((sugg, index) => (
                    <ListItem key={index} sx={{ alignItems: 'flex-start' }}>
                      <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                        {getPriorityIcon(sugg.priority)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">{sugg.suggestion}</Typography>
                            <Chip
                              label={sugg.priority}
                              size="small"
                              color={getPriorityColor(sugg.priority)}
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>
      )}

      {/* Action Items */}
      {actionItems && actionItems.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon color="success" />
            Action Items
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Quick wins to improve your resume:
          </Typography>
          <List dense>
            {actionItems.map((item, index) => (
              <ListItem key={index}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleIcon color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={item} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {(!suggestions || suggestions.length === 0) &&
        (!missingKeywords || missingKeywords.length === 0) &&
        (!actionItems || actionItems.length === 0) && (
          <Alert severity="success" icon={<CheckCircleIcon />}>
            <Typography variant="body2" fontWeight={600}>
              Great job! Your resume looks well-optimized for ATS.
            </Typography>
            <Typography variant="caption">
              Continue to tailor your resume for each specific job application.
            </Typography>
          </Alert>
        )}
    </Box>
  )
}

export default SuggestionsList

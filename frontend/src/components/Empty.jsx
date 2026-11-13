import { Box, Typography } from '@mui/material'

export default function Empty({ title, description }) {
  return (
    <Box
      sx={{
        maxWidth: 720,
        mx: 'auto',
        py: { xs: 8, md: 14 },
        px: { xs: 3, md: 5 },
        textAlign: 'center',
      }}
    >
      <Typography variant="mono" sx={{ color: 'primary.main', mb: 2 }}>
        Coming next
      </Typography>
      <Typography variant="h2" sx={{ fontSize: { xs: 40, md: 64 }, mb: 2 }}>
        {title}
      </Typography>
      {description && (
        <Typography sx={{ color: 'text.secondary', maxWidth: 520, mx: 'auto' }}>
          {description}
        </Typography>
      )}
    </Box>
  )
}
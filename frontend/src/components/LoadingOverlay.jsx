import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function LoadingOverlay({ open, message = "Loading..." }) {
  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(4px)',
      }}
    >
      <Box
        sx={{
          bgcolor: 'white',
          borderRadius: 3,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
      >
        <CircularProgress 
          size={48} 
          sx={{ 
            color: '#41644A',
          }} 
        />
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#0D4715',
            fontWeight: 600,
          }}
        >
          {message}
        </Typography>
      </Box>
    </Box>
  );
}


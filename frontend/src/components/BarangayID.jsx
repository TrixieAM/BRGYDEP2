import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Paper,
  Button,
  Stack,
  Typography,
  Avatar,
  Grid,
  Dialog,
  CircularProgress,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useAuth } from '../contexts/AuthContext';

export default function BarangayID() {
  const apiBase = 'http://localhost:5000';
  const { getToken } = useAuth();
  const printRef = useRef();

  const [selectedResidentId, setSelectedResidentId] = useState(null);
  const [residentData, setResidentData] = useState(null);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh || !selectedResidentId) return;

    const interval = setInterval(() => {
      fetchResidentData(selectedResidentId);
    }, 3000); // Refresh every 3 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, selectedResidentId]);

  // Load all residents on mount
  useEffect(() => {
    loadAllResidents();
  }, []);

  const getAuthHeaders = () => {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  async function loadAllResidents() {
    try {
      const response = await fetch(`${apiBase}/residents`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to load residents');
      const data = await response.json();
      setResidents(data);
      setError('');
    } catch (err) {
      setError('Failed to load residents');
      console.error(err);
    }
  }

  async function fetchResidentData(residentId) {
    try {
      setLoading(true);
      const response = await fetch(`${apiBase}/residents/${residentId}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch resident data');
      const data = await response.json();
      setResidentData(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch resident data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleSelectResident = (residentId) => {
    setSelectedResidentId(residentId);
    setOpenDialog(true);
    fetchResidentData(residentId);
  };

  const handleRefresh = () => {
    if (selectedResidentId) {
      fetchResidentData(selectedResidentId);
    }
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(printRef.current.innerHTML);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', bgcolor: 'transparent', p: 2 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 3,
              bgcolor: '#0D4715',
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: '#F1F0E9',
                  color: '#0D4715',
                  width: 46,
                  height: 46,
                }}
              >
                ID
              </Avatar>
              <Box>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  sx={{ lineHeight: 1.2, fontSize: { xs: 24, sm: 28, md: 32 } }}
                >
                  Barangay ID Card
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  View and print resident identification cards
                </Typography>
              </Box>
            </Box>
            <Chip
              label={`${residents.length} Residents`}
              sx={{
                bgcolor: '#E9762B',
                color: 'white',
                fontWeight: 700,
              }}
            />
          </Box>
          <Box
            sx={{
              height: '4px',
              background:
                'linear-gradient(90deg, #0D4715 0%, #1a5f2e 50%, #E9762B 100%)',
              width: '100%',
            }}
          />
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Residents Grid for Selection */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#0D4715' }}>
            Select a Resident
          </Typography>
          <Grid container spacing={2}>
            {residents.map((resident) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={resident.resident_id}>
                <Paper
                  onClick={() => handleSelectResident(resident.resident_id)}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    borderRadius: 2,
                    border: '2px solid rgba(13, 71, 21, 0.12)',
                    transition: 'all 0.3s',
                    '&:hover': {
                      borderColor: '#0D4715',
                      boxShadow: '0 8px 24px rgba(13, 71, 21, 0.15)',
                      transform: 'translateY(-4px)',
                      bgcolor: 'rgba(13, 71, 21, 0.04)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: '#0D4715',
                        color: '#F1F0E9',
                        width: 40,
                        height: 40,
                        fontWeight: 700,
                      }}
                    >
                      {resident.full_name.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {resident.full_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {resident.resident_id}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>

      {/* ID Card Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            bgcolor: '#0D4715',
            color: 'white',
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            Barangay ID Card
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<RefreshIcon />}
              size="small"
              onClick={handleRefresh}
              sx={{ color: 'white' }}
            >
              Refresh
            </Button>
            <Button
              startIcon={<CloseIcon />}
              size="small"
              onClick={() => setOpenDialog(false)}
              sx={{ color: 'white' }}
            >
              Close
            </Button>
          </Box>
        </Box>

        {loading && !residentData ? (
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : residentData ? (
          <Box sx={{ p: 0, bgcolor: '#FDFCF9' }}>
            {/* Printable ID Card */}
            <Box ref={printRef} sx={{ p: 3 }}>
              {/* Front of ID Card */}
              <Box
                sx={{
                  width: '100%',
                  maxWidth: '400px',
                  mx: 'auto',
                  bgcolor: 'linear-gradient(135deg, #F1F0E9 0%, #E9F5E0 100%)',
                  border: '3px solid #0D4715',
                  borderRadius: 3,
                  p: 3,
                  textAlign: 'center',
                  mb: 3,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                }}
              >
                {/* Header with Logo Area */}
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: '#0D4715', mb: 1 }}
                  >
                    Republic of the Philippines
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: '#0D4715', mb: 1 }}
                  >
                    Barangay 145 Bagong Barrio
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 800, color: '#0D4715' }}
                  >
                    CALOOCAN CITY
                  </Typography>
                </Box>

                <Divider sx={{ my: 2, borderColor: '#0D4715' }} />

                {/* ID Number and Date Issued */}
                <Grid container spacing={2} sx={{ my: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: '#0D4715', fontWeight: 700 }}>
                      ID No:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, color: '#0D4715', mt: 0.5 }}
                    >
                      {residentData.resident_id.toString().padStart(5, '0')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: '#0D4715', fontWeight: 700 }}>
                      Date Issue
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, color: '#0D4715', mt: 0.5 }}
                    >
                      {formatDate(new Date())}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Photo Placeholder */}
                <Box
                  sx={{
                    width: '100%',
                    height: '100px',
                    bgcolor: 'rgba(13, 71, 21, 0.1)',
                    border: '2px solid #0D4715',
                    borderRadius: 2,
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    [Photo]
                  </Typography>
                </Box>

                {/* Name */}
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, color: '#0D4715', mb: 3 }}
                >
                  {residentData.full_name}
                </Typography>

                {/* Address */}
                <Typography
                  variant="caption"
                  sx={{ color: '#0D4715', fontWeight: 700, display: 'block' }}
                >
                  Address
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: '#0D4715', mb: 3, display: 'block' }}
                >
                  {residentData.address}
                </Typography>

                <Divider sx={{ my: 2, borderColor: '#0D4715' }} />

                {/* Back of Card Info */}
                <Box sx={{ mt: 3, textAlign: 'left' }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: '#0D4715', mb: 1.5 }}
                  >
                    BARANGAY ID
                  </Typography>

                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#0D4715' }}>
                        Date of Birth
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#0D4715' }}>
                        {formatDate(residentData.dob)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#0D4715' }}>
                        Gender/Age
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#0D4715' }}>
                        {calculateAge(residentData.dob)} years old
                      </Typography>
                    </Grid>
                  </Grid>

                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#0D4715' }}>
                        Civil Status
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#0D4715' }}>
                        {residentData.civil_status || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#0D4715' }}>
                        Tel./CP. #
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#0D4715' }}>
                        {residentData.contact_no || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(13, 71, 21, 0.08)', borderRadius: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: '#0D4715', display: 'block', mb: 0.5 }}
                    >
                      In Case of Emergency
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#0D4715', fontSize: '0.7rem' }}>
                      Name: ________________________
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#0D4715', fontSize: '0.7rem', display: 'block' }}>
                      Address: ________________________
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#0D4715', fontSize: '0.7rem', display: 'block' }}>
                      Tel./CP#: ________________________
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      mt: 2,
                      p: 1.5,
                      bgcolor: '#E9762B',
                      color: 'white',
                      textAlign: 'center',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      Signature of Owner
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ p: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                sx={{
                  background: 'linear-gradient(135deg, #0D4715 0%, #1a5f2e 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1a5f2e 0%, #0D4715 100%)',
                  },
                }}
              >
                Print
              </Button>
              <Button
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                sx={{
                  color: '#0D4715',
                  borderColor: '#0D4715',
                  '&:hover': {
                    borderColor: '#0D4715',
                    bgcolor: 'rgba(13, 71, 21, 0.06)',
                  },
                }}
                onClick={() => alert('Download as PDF functionality coming soon!')}
              >
                Download PDF
              </Button>
            </Box>

            {/* Auto-refresh Toggle */}
            <Box sx={{ p: 2, bgcolor: '#F5F5F5', borderTop: '1px solid #e0e0e0' }}>
              <Stack spacing={1}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
                </Typography>
                <Button
                  size="small"
                  variant={autoRefresh ? 'contained' : 'outlined'}
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  sx={{
                    bgcolor: autoRefresh ? '#0D4715' : 'transparent',
                    color: autoRefresh ? 'white' : '#0D4715',
                  }}
                >
                  {autoRefresh ? 'Disable' : 'Enable'} Auto-refresh (3s)
                </Button>
              </Stack>
            </Box>
          </Box>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Alert severity="info">No resident data available</Alert>
          </Box>
        )}
      </Dialog>
    </Box>
  );
}

import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Autocomplete,
  Chip,
  Avatar,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import SearchIcon from '@mui/icons-material/Search';
import { Report, ReportSharp } from '@mui/icons-material';
import axios from 'axios';

const COLORS = [
  '#E9762B',
  '#41644A',
  '#0D4715',
  '#F1F0E9',
  '#FF6B6B',
  '#4ECDC4',
];

// Create a context for authentication
const AuthContext = React.createContext();

const Reports = ({ getToken }) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [certificates, setCertificates] = useState([]);
  const [residents, setResidents] = useState([]);
  const [selectedResident, setSelectedResident] = useState(null);
  const [monthFilter, setMonthFilter] = useState(currentMonth);
  const [yearFilter, setYearFilter] = useState(currentYear);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to get token from localStorage or sessionStorage
  const getAuthToken = () => {
    // Try multiple methods to get the token
    try {
      // First try the provided getToken function if it exists
      if (typeof getToken === 'function') {
        return getToken();
      }
      
      // Try to get token from localStorage
      const token = localStorage.getItem('token');
      if (token) return token;
      
      // Try to get token from sessionStorage
      const sessionToken = sessionStorage.getItem('token');
      if (sessionToken) return sessionToken;
      
      // Try to get from a cookie
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, 6) === 'token=') {
          return cookie.substring(6);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting authentication token:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchCertificates(), fetchResidents()]);
      } catch (err) {
        setError('Failed to load data. Please try again.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchCertificates = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const config = { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      };
      
      // Updated endpoint to match your backend route
      const response = await axios.get('http://localhost:5000/certificates', config);
      
      console.log('Certificates data:', response.data);
      
      // Transform the data to match the expected format
      const transformedData = response.data.map(cert => ({
        id: cert.certificate_id,
        certificate_type: cert.certificate_type,
        reason: cert.reason || 'Not specified',
        date_issued: cert.date_issued,
        resident_id: cert.resident_id,
        full_name: cert.full_name,
        validity_period: cert.validity_period,
      }));
      
      setCertificates(transformedData);
    } catch (error) {
      console.error('Error fetching certificate data:', error.response?.data || error.message);
      throw error;
    }
  };

  const fetchResidents = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const config = { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      };
      
      // Updated endpoint to match your backend route
      const response = await axios.get('http://localhost:5000/residents', config);
      
      console.log('Residents data:', response.data);
      
      setResidents(response.data);
    } catch (error) {
      console.error('Error fetching residents:', error.response?.data || error.message);
      throw error;
    }
  };

  const filterDataByDateAndResident = (data) => {
    let filteredData = data;

    if (monthFilter !== 'all') {
      filteredData = filteredData.filter((item) => {
        const itemMonth = new Date(item.date_issued).getMonth() + 1;
        return itemMonth === parseInt(monthFilter);
      });
    }

    if (yearFilter !== 'all') {
      filteredData = filteredData.filter((item) => {
        const itemYear = new Date(item.date_issued).getFullYear();
        return itemYear === parseInt(yearFilter);
      });
    }

    if (selectedResident) {
      filteredData = filteredData.filter(
        (item) => item.resident_id === selectedResident.resident_id
      );
    }

    return filteredData;
  };

  const generateReportData = (certificateType) => {
    const filteredCertificates = filterDataByDateAndResident(
      certificates
    ).filter((cert) => cert.certificate_type === certificateType);

    const counts = {};
    filteredCertificates.forEach((item) => {
      const reason = item.reason || 'Not specified';
      counts[reason] = (counts[reason] || 0) + 1;
    });

    return Object.keys(counts).map((reason) => ({
      name: reason,
      value: counts[reason],
    }));
  };

  const certificateTypes = [
    {
      title: 'Barangay Indigency',
      type: 'Barangay Indigency',
      chartType: 'pie',
      color: '#E9762B',
    },
    {
      title: 'Barangay Clearance',
      type: 'Barangay Clearance',
      chartType: 'bar',
      color: '#41644A',
    },
    {
      title: 'Business Clearance',
      type: 'Business Clearance',
      chartType: 'pie',
      color: '#0D4715',
    },
    {
      title: 'Certificate of Residency',
      type: 'Certificate of Residency',
      chartType: 'bar',
      color: '#E9762B',
    },
    {
      title: 'Permit to Travel',
      type: 'Permit to Travel',
      chartType: 'pie',
      color: '#41644A',
    },
    {
      title: 'Oath of Undertaking',
      type: 'Oath of Undertaking Job Seeker',
      chartType: 'bar',
      color: '#0D4715',
    },
    {
      title: 'Cash Assistance',
      type: 'Cash Assistance',
      chartType: 'area',
      color: '#E9762B',
    },
    {
      title: 'Financial Assistance',
      type: 'Financial Assistance',
      chartType: 'area',
      color: '#41644A',
    },
    {
      title: 'BHERT Positive',
      type: 'BHERT Certificate Positive',
      chartType: 'bar',
      color: '#0D4715',
    },
    {
      title: 'BHERT Normal',
      type: 'BHERT Certificate Normal',
      chartType: 'bar',
      color: '#E9762B',
    },
    {
      title: 'Certificate of Action',
      type: 'Certificate of Action',
      chartType: 'pie',
      color: '#41644A',
    },
    {
      title: 'Cohabitation',
      type: 'Cohabitation',
      chartType: 'bar',
      color: '#0D4715',
    },
    {
      title: 'Solo Parent',
      type: 'Solo Parent',
      chartType: 'area',
      color: '#E9762B',
    },
  ];

  const years = Array.from(
    new Set(
      certificates.map((item) => new Date(item.date_issued).getFullYear())
    )
  );
  if (!years.includes(currentYear)) years.push(currentYear);

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const renderChart = (chartType, data, color) => {
    if (data.length === 0) {
      return (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: 'text.secondary',
          }}
        >
          <Typography variant="h6" gutterBottom color="text.secondary">
            No Data Available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No requests found for this certificate type
          </Typography>
        </Box>
      );
    }

    switch (chartType) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill={color} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                fill={color}
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const hasAnyCertificates =
    selectedResident && filterDataByDateAndResident(certificates).length > 0;

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          Loading reports data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        minHeight: '100vh',
      }}
    >
      <Box
        sx={{
          p: { xs: 2, md: 3 },
          minHeight: '120px',
          background: 'linear-gradient(135deg, #41644A 0%, #0D4715 100%)',
          color: 'white',
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 4,
        }}
      >
        <Avatar
          sx={{
            bgcolor: '#F1F0E9',
            color: '#0D4715',
            width: 56,
            height: 56,
          }}
        >
          <ReportSharp sx={{ fontSize: 32 }} />
        </Avatar>

        <Box>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ lineHeight: 1.2, fontSize: { xs: 24, sm: 28, md: 32 } }}
          >
            Reports
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Overview of certificate requests and resident activity
          </Typography>
        </Box>
      </Box>

      {/* Filters Card */}
      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          mb: 3,
          borderRadius: 3,
          border: '1px solid #e0e0e0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background:
            'linear-gradient(135deg, #ffffff 0%, rgba(241,240,233,0.3) 100%)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            borderColor: '#41644A',
          },
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs="auto" sx={{ minWidth: 130 }}>
            <FormControl fullWidth sx={{ minHeight: 60 }}>
              <InputLabel>Month</InputLabel>
              <Select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                label="Month"
                sx={{
                  borderRadius: 2,
                  height: 56,
                  transition: 'all 0.3s ease',
                  width: '100%',
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    height: '100%',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(65,100,74,0.04)',
                    borderColor: '#41644A',
                    boxShadow: '0 0 0 2px rgba(65,100,74,0.2)',
                  },
                  '&.Mui-focused': {
                    borderColor: '#41644A',
                    boxShadow: '0 0 0 2px rgba(65,100,74,0.2)',
                  },
                }}
              >
                <MenuItem value="all">All Months</MenuItem>
                {months.map((month, i) => (
                  <MenuItem key={i + 1} value={i + 1}>
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs="auto" sx={{ minWidth: 110 }}>
            <FormControl fullWidth sx={{ minHeight: 60 }}>
              <InputLabel>Year</InputLabel>
              <Select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                label="Year"
                sx={{
                  borderRadius: 2,
                  height: 56,
                  transition: 'all 0.3s ease',
                  width: '100%',
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    height: '100%',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(65,100,74,0.04)',
                    borderColor: '#41644A',
                    boxShadow: '0 0 0 2px rgba(65,100,74,0.2)',
                  },
                  '&.Mui-focused': {
                    borderColor: '#41644A',
                    boxShadow: '0 0 0 2px rgba(65,100,74,0.2)',
                  },
                }}
              >
                <MenuItem value="all">All Years</MenuItem>
                {years
                  .sort((a, b) => b - a)
                  .map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs>
            <Autocomplete
              fullWidth
              options={residents}
              getOptionLabel={(option) => option.full_name}
              value={selectedResident}
              onChange={(event, newValue) => setSelectedResident(newValue)}
              sx={{ minHeight: 60, width: '100%' }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search by Resident Name"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      height: 56,
                      width: 250,
                      transition: 'all 0.3s ease',
                      '& .MuiAutocomplete-input': { padding: '12px 8px' },
                      '&:hover': {
                        backgroundColor: 'rgba(65,100,74,0.04)',
                        borderColor: '#41644A',
                        boxShadow: '0 0 0 2px rgba(65,100,74,0.2)',
                      },
                      '&.Mui-focused': {
                        borderColor: '#41644A',
                        boxShadow: '0 0 0 2px rgba(65,100,74,0.2)',
                      },
                    },
                  }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option.full_name}
                    {...getTagProps({ index })}
                    sx={{
                      backgroundColor: '#41644A',
                      color: 'white',
                      fontWeight: 'bold',
                      '& .MuiChip-deleteIcon': { color: 'white' },
                    }}
                  />
                ))
              }
            />
          </Grid>

          <Grid
            item
            xs="auto"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
            }}
          >
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                setMonthFilter('all');
                setYearFilter('all');
                setSelectedResident(null);
              }}
              sx={{
                height: 56,
                borderRadius: 2,
                fontWeight: 'bold',
                px: 3,
                textTransform: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Reset Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Certificate Cards Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 2,
        }}
      >
        {certificateTypes.map((cert, index) => {
          const data = generateReportData(cert.type);
          const total = data.reduce((sum, item) => sum + item.value, 0);
          const filteredData = filterDataByDateAndResident(certificates).filter(
            (c) => c.certificate_type === cert.type
          );

          if (selectedResident && filteredData.length === 0) return null;

          return (
            <Paper
              key={index}
              sx={{
                height: 380,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '1px solid #e0e0e0',
                width: '100%',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                },
              }}
            >
              <Box
                sx={{
                  p: 2,
                  backgroundColor: '#41644A',
                  color: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    lineHeight: 1.2,
                  }}
                >
                  {cert.title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.95,
                    fontSize: '0.75rem',
                  }}
                >
                  Total Requests
                </Typography>
              </Box>

              <Box
                sx={{
                  py: 2,
                  px: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #e0e0e0',
                }}
              >
                <Typography variant="body2" sx={{ color: '#41644A' }}>
                  {total} requests
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    color: '#41644A',
                    fontWeight: 'bold',
                  }}
                >
                  {total}
                </Typography>
              </Box>

              <Box sx={{ p: 2.5, flexGrow: 1 }}>
                {renderChart(cert.chartType, data, '#41644A')}
              </Box>
            </Paper>
          );
        })}
      </Box>

      {selectedResident && !hasAnyCertificates && (
        <Paper
          sx={{
            p: 4,
            mt: 3,
            textAlign: 'center',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background:
              'linear-gradient(135deg, #ffffff 0%, rgba(241,240,233,0.3) 100%)',
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: '#0D4715', fontWeight: 'bold' }}
          >
            No certificates found for {selectedResident.full_name} in selected
            period
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default Reports;
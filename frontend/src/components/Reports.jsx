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
import { Report, ReportSharp, PictureAsPdf } from '@mui/icons-material';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const pdfRef = React.useRef(null);

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
          'Content-Type': 'application/json',
        },
      };

      // Updated endpoint to match your backend route
      const response = await axios.get(
        'http://localhost:5000/certificates',
        config
      );

      console.log('Certificates data:', response.data);

      // Transform the data to match the expected format
      const transformedData = response.data.map((cert) => ({
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
      console.error(
        'Error fetching certificate data:',
        error.response?.data || error.message
      );
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
          'Content-Type': 'application/json',
        },
      };

      // Updated endpoint to match your backend route
      const response = await axios.get(
        'http://localhost:5000/residents',
        config
      );

      console.log('Residents data:', response.data);

      setResidents(response.data);
    } catch (error) {
      console.error(
        'Error fetching residents:',
        error.response?.data || error.message
      );
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

  // Generate yearly data for Solo Parent
  const generateYearlyData = (certificateType) => {
    // Apply filters first, then filter by certificate type
    const filteredCertificates = filterDataByDateAndResident(
      certificates
    ).filter((cert) => cert.certificate_type === certificateType);

    const yearlyCounts = {};
    filteredCertificates.forEach((item) => {
      const year = new Date(item.date_issued).getFullYear();
      yearlyCounts[year] = (yearlyCounts[year] || 0) + 1;
    });

    // Get all years and sort them
    const allYears = Object.keys(yearlyCounts)
      .map(Number)
      .sort((a, b) => a - b);

    return allYears.map((year) => ({
      name: year.toString(),
      value: yearlyCounts[year],
    }));
  };

  // Calculate today's certificates issued
  const getTodayCertificatesCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return certificates.filter((cert) => {
      if (!cert.date_issued) return false;
      const certDate = new Date(cert.date_issued);
      certDate.setHours(0, 0, 0, 0);
      return certDate.getTime() === today.getTime();
    }).length;
  };

  // Generate PDF with all reports - 4 per page in 2x2 grid
  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const spacing = 5; // Space between cards
      const cardWidth = (pdfWidth - 2 * margin - spacing) / 2;
      const cardHeight = (pdfHeight - 2 * margin - spacing - 40) / 2; // Reserve space for header

      let yPosition = margin;

      // Add header
      pdf.setFontSize(20);
      pdf.setTextColor(65, 100, 74);
      pdf.text('Reports - Certificate Statistics', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      const dateStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      pdf.text(`Generated on: ${dateStr}`, margin, yPosition);
      yPosition += 8;

      // Add filter information
      if (monthFilter !== 'all' || yearFilter !== 'all' || selectedResident) {
        pdf.setFontSize(10);
        pdf.setTextColor(50, 50, 50);
        let filterText = 'Filters: ';
        const filters = [];
        if (monthFilter !== 'all') {
          filters.push(`Month: ${months[monthFilter - 1]}`);
        }
        if (yearFilter !== 'all') {
          filters.push(`Year: ${yearFilter}`);
        }
        if (selectedResident) {
          filters.push(`Resident: ${selectedResident.full_name}`);
        }
        pdf.text(filterText + filters.join(', '), margin, yPosition);
        yPosition += 8;
      }

      // Add today's certificates count
      const todayCount = getTodayCertificatesCount();
      pdf.setFontSize(12);
      pdf.setTextColor(65, 100, 74);
      pdf.text(`Today's Certificates Issued: ${todayCount}`, margin, yPosition);
      yPosition += 12;

      // Capture each certificate card
      const certificateCards = document.querySelectorAll(
        '[data-certificate-card]'
      );

      let cardsPerPage = 0;
      let currentRow = 0;
      let currentCol = 0;
      let startY = yPosition;

      for (let i = 0; i < certificateCards.length; i++) {
        const card = certificateCards[i];

        // Check if we need a new page (after 4 cards)
        if (cardsPerPage >= 4) {
          pdf.addPage();
          cardsPerPage = 0;
          currentRow = 0;
          currentCol = 0;
          startY = margin;
        }

        // Calculate position for 2x2 grid
        const xPosition = margin + currentCol * (cardWidth + spacing);
        const yPos = startY + currentRow * (cardHeight + spacing);

        // Capture the card as image
        const canvas = await html2canvas(card, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
        });

        const imgData = canvas.toDataURL('image/png');

        // Calculate dimensions to fit in grid cell while maintaining aspect ratio
        const cardAspectRatio = canvas.width / canvas.height;
        let imgWidth = cardWidth;
        let imgHeight = cardWidth / cardAspectRatio;

        // If height exceeds cell height, scale down
        if (imgHeight > cardHeight) {
          imgHeight = cardHeight;
          imgWidth = cardHeight * cardAspectRatio;
        }

        pdf.addImage(imgData, 'PNG', xPosition, yPos, imgWidth, imgHeight);

        // Update grid position
        currentCol++;
        if (currentCol >= 2) {
          currentCol = 0;
          currentRow++;
        }
        cardsPerPage++;
      }

      // Save PDF
      const fileName = `Reports_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
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
      chartType: 'yearly',
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

      case 'yearly':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill={color} radius={[8, 8, 0, 0]} />
            </BarChart>
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
          gap: 2,
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
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
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
              <ReportSharp />
            </Avatar>
            <Box>
              <Typography
                variant="h5"
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
          <Button
            variant="contained"
            startIcon={<PictureAsPdf />}
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            sx={{
              bgcolor: '#E9762B',
              color: 'white',
              '&:hover': {
                bgcolor: '#d86620',
              },
              textTransform: 'none',
              px: 3,
              py: 1.5,
              fontWeight: 600,
            }}
          >
            {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
          </Button>
        </Box>
      </Paper>

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
        <Grid
          container
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          {/* Compact filter card for Month, Year, Name */}
          <Grid item xs={12} md="auto">
            <Paper
              elevation={1}
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: '1px solid #e0e0e0',
                backgroundColor: 'rgba(255,255,255,0.8)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Month</InputLabel>
                <Select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  label="Month"
                  sx={{
                    borderRadius: 2,
                    height: 56,
                    transition: 'all 0.3s ease',
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

              <FormControl sx={{ minWidth: 100 }}>
                <InputLabel>Year</InputLabel>
                <Select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  label="Year"
                  sx={{
                    borderRadius: 2,
                    height: 56,
                    transition: 'all 0.3s ease',
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

              <Autocomplete
                options={residents}
                getOptionLabel={(option) => option.full_name}
                value={selectedResident}
                onChange={(event, newValue) => setSelectedResident(newValue)}
                sx={{ width: 250 }}
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
                  ml: 1,
                }}
              >
                Reset Filters
              </Button>
            </Paper>
          </Grid>

          {/* Today's Certificates Counter */}
          <Grid
            item
            xs={12}
            md="auto"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                px: 2,
                borderLeft: '1px solid #e0e0e0',
                pl: 3,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                }}
              >
                Today's Certificates Issued
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  color: '#41644A',
                  fontWeight: 'bold',
                  lineHeight: 1.2,
                }}
              >
                {getTodayCertificatesCount()}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Certificate Cards Grid */}
      <Box ref={pdfRef}>
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
            // Use yearly data for Solo Parent, otherwise use regular report data
            const data =
              cert.chartType === 'yearly'
                ? generateYearlyData(cert.type)
                : generateReportData(cert.type);
            const total = data.reduce((sum, item) => sum + item.value, 0);
            const filteredData = filterDataByDateAndResident(
              certificates
            ).filter((c) => c.certificate_type === cert.type);

            if (selectedResident && filteredData.length === 0) return null;

            return (
              <Paper
                key={index}
                data-certificate-card
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

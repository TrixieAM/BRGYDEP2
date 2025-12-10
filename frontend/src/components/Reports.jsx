import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
  Chip
} from '@mui/material';
import axios from 'axios';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import SearchIcon from '@mui/icons-material/Search';

const COLORS = ['#E9762B', '#41644A', '#FFBB28', '#0088FE', '#A020F0', '#FF3366'];

const Reports = () => {
  const { getToken } = useAuth();
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Single state for all certificates from the database
  const [certificates, setCertificates] = useState([]);
  const [residents, setResidents] = useState([]);
  const [selectedResident, setSelectedResident] = useState(null);
  const [monthFilter, setMonthFilter] = useState(currentMonth);
  const [yearFilter, setYearFilter] = useState(currentYear);
  
  // Report data states for all certificate types
  const [indigencyReportData, setIndigencyReportData] = useState([]);
  const [barangayClearanceReportData, setBarangayClearanceReportData] = useState([]);
  const [businessClearanceReportData, setBusinessClearanceReportData] = useState([]);
  const [certificateOfResidencyReportData, setCertificateOfResidencyReportData] = useState([]);
  const [permitToTravelReportData, setPermitToTravelReportData] = useState([]);
  const [oathJobReportData, setOathJobReportData] = useState([]);
  const [cashAssistanceReportData, setCashAssistanceReportData] = useState([]);
  const [financialAssistanceReportData, setFinancialAssistanceReportData] = useState([]);
  const [bhertPositiveReportData, setBhertPositiveReportData] = useState([]);
  const [bhertNormalReportData, setBhertNormalReportData] = useState([]);
  const [certificateOfActionReportData, setCertificateOfActionReportData] = useState([]);
  const [certificateOfCohabitationReportData, setCertificateOfCohabitationReportData] = useState([]);
  const [soloParentReportData, setSoloParentReportData] = useState([]);

  useEffect(() => {
    fetchCertificates();
    fetchResidents();
  }, []);

  useEffect(() => {
    generateAllReports();
  }, [
    certificates,
    monthFilter, 
    yearFilter, 
    selectedResident
  ]);

  const fetchCertificates = async () => {
    try {
      const token = getToken();
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      // Fetch all certificates from a single endpoint
      const res = await axios.get('http://localhost:5000/certificates', config);
      console.log('Certificates data:', res.data); // Debug log to see what we're getting
      setCertificates(res.data);
    } catch (error) {
      console.error('Error fetching certificate data:', error);
    }
  };

  const fetchResidents = async () => {
    try {
      const token = getToken();
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await axios.get('http://localhost:5000/residents', config);
      setResidents(res.data);
    } catch (error) {
      console.error('Error fetching residents:', error);
    }
  };

  const filterDataByDateAndResident = (data) => {
    let filteredData = data;

    // Filter by month
    if (monthFilter !== 'all') {
      filteredData = filteredData.filter(item => {
        const itemMonth = new Date(item.date_issued).getMonth() + 1;
        return itemMonth === parseInt(monthFilter);
      });
    }

    // Filter by year
    if (yearFilter !== 'all') {
      filteredData = filteredData.filter(item => {
        const itemYear = new Date(item.date_issued).getFullYear();
        return itemYear === parseInt(yearFilter);
      });
    }

    // Filter by selected resident
    if (selectedResident) {
      filteredData = filteredData.filter(item => 
        item.resident_id === selectedResident.resident_id
      );
    }

    return filteredData;
  };

  const generateAllReports = () => {
    // Filter certificates by date and resident first
    const filteredCertificates = filterDataByDateAndResident(certificates);
    
    // Process indigency data - Note: Database has "Barangay Indigency" not just "Indigency"
    const indigencyCertificates = filteredCertificates.filter(cert => 
      cert.certificate_type === 'Barangay Indigency'
    );
    const indigencyCounts = {};
    indigencyCertificates.forEach(item => {
      const reason = item.reason || 'Not specified';
      indigencyCounts[reason] = (indigencyCounts[reason] || 0) + 1;
    });
    const indigencyChartData = Object.keys(indigencyCounts).map(reason => ({
      name: reason,
      value: indigencyCounts[reason]
    }));
    setIndigencyReportData(indigencyChartData);

    // Process barangay clearance data
    const barangayClearanceCertificates = filteredCertificates.filter(cert => 
      cert.certificate_type === 'Barangay Clearance'
    );
    const barangayClearanceCounts = {};
    barangayClearanceCertificates.forEach(item => {
      const reason = item.reason || 'Not specified';
      barangayClearanceCounts[reason] = (barangayClearanceCounts[reason] || 0) + 1;
    });
    const barangayClearanceChartData = Object.keys(barangayClearanceCounts).map(reason => ({
      name: reason,
      value: barangayClearanceCounts[reason]
    }));
    setBarangayClearanceReportData(barangayClearanceChartData);

    // Process business clearance data
    const businessClearanceCertificates = filteredCertificates.filter(cert => 
      cert.certificate_type === 'Business Clearance'
    );
    const businessClearanceCounts = {};
    businessClearanceCertificates.forEach(item => {
      const reason = item.reason || 'Not specified';
      businessClearanceCounts[reason] = (businessClearanceCounts[reason] || 0) + 1;
    });
    const businessClearanceChartData = Object.keys(businessClearanceCounts).map(reason => ({
      name: reason,
      value: businessClearanceCounts[reason]
    }));
    setBusinessClearanceReportData(businessClearanceChartData);

    // Process certificate of residency data
    const certificateOfResidencyCertificates = filteredCertificates.filter(cert => 
      cert.certificate_type === 'Certificate of Residency'
    );
    const certificateOfResidencyCounts = {};
    certificateOfResidencyCertificates.forEach(item => {
      const reason = item.reason || 'Not specified';
      certificateOfResidencyCounts[reason] = (certificateOfResidencyCounts[reason] || 0) + 1;
    });
    const certificateOfResidencyChartData = Object.keys(certificateOfResidencyCounts).map(reason => ({
      name: reason,
      value: certificateOfResidencyCounts[reason]
    }));
    setCertificateOfResidencyReportData(certificateOfResidencyChartData);

    // Process permit to travel data
    const permitToTravelCertificates = filteredCertificates.filter(cert => 
      cert.certificate_type === 'Permit to Travel'
    );
    const permitToTravelCounts = {};
    permitToTravelCertificates.forEach(item => {
      const reason = item.reason || 'Not specified';
      permitToTravelCounts[reason] = (permitToTravelCounts[reason] || 0) + 1;
    });
    const permitToTravelChartData = Object.keys(permitToTravelCounts).map(reason => ({
      name: reason,
      value: permitToTravelCounts[reason]
    }));
    setPermitToTravelReportData(permitToTravelChartData);
    
    // Process oath job data - Note: Database has "Oath of Undertaking Job Seeker"
    const oathJobCertificates = filteredCertificates.filter(cert => 
      cert.certificate_type === 'Oath of Undertaking Job Seeker'
    );
    const oathJobCounts = {};
    oathJobCertificates.forEach(item => {
      const reason = item.reason || 'Not specified';
      oathJobCounts[reason] = (oathJobCounts[reason] || 0) + 1;
    });
    const oathJobChartData = Object.keys(oathJobCounts).map(reason => ({
      name: reason,
      value: oathJobCounts[reason]
    }));
    setOathJobReportData(oathJobChartData);
    
    // Process cash assistance data
    const cashAssistanceCertificates = filteredCertificates.filter(cert => 
      cert.certificate_type === 'Cash Assistance'
    );
    const cashAssistanceCounts = {};
    cashAssistanceCertificates.forEach(item => {
      const reason = item.reason || 'Not specified';
      cashAssistanceCounts[reason] = (cashAssistanceCounts[reason] || 0) + 1;
    });
    const cashAssistanceChartData = Object.keys(cashAssistanceCounts).map(reason => ({
      name: reason,
      value: cashAssistanceCounts[reason]
    }));
    setCashAssistanceReportData(cashAssistanceChartData);
    
    // Process financial assistance data
    const financialAssistanceCertificates = filteredCertificates.filter(cert => 
      cert.certificate_type === 'Financial Assistance'
    );
    const financialAssistanceCounts = {};
    financialAssistanceCertificates.forEach(item => {
      const reason = item.reason || 'Not specified';
      financialAssistanceCounts[reason] = (financialAssistanceCounts[reason] || 0) + 1;
    });
    const financialAssistanceChartData = Object.keys(financialAssistanceCounts).map(reason => ({
      name: reason,
      value: financialAssistanceCounts[reason]
    }));
    setFinancialAssistanceReportData(financialAssistanceChartData);
    
    // Process BHERT positive data - Note: Database has "BHERT Certificate Positive"
    const bhertPositiveCertificates = filteredCertificates.filter(cert => 
      cert.certificate_type === 'BHERT Certificate Positive'
    );
    const bhertPositiveCounts = {};
    bhertPositiveCertificates.forEach(item => {
      const reason = item.reason || 'Not specified';
      bhertPositiveCounts[reason] = (bhertPositiveCounts[reason] || 0) + 1;
    });
    const bhertPositiveChartData = Object.keys(bhertPositiveCounts).map(reason => ({
      name: reason,
      value: bhertPositiveCounts[reason]
    }));
    setBhertPositiveReportData(bhertPositiveChartData);
    
    // Process BHERT normal data - Note: Database has "BHERT Certificate Normal"
    const bhertNormalCertificates = filteredCertificates.filter(cert => 
      cert.certificate_type === 'BHERT Certificate Normal'
    );
    const bhertNormalCounts = {};
    bhertNormalCertificates.forEach(item => {
      const reason = item.reason || 'Not specified';
      bhertNormalCounts[reason] = (bhertNormalCounts[reason] || 0) + 1;
    });
    const bhertNormalChartData = Object.keys(bhertNormalCounts).map(reason => ({
      name: reason,
      value: bhertNormalCounts[reason]
    }));
    setBhertNormalReportData(bhertNormalChartData);
    
    // Process certificate of action data
    const certificateOfActionCertificates = filteredCertificates.filter(cert => 
      cert.certificate_type === 'Certificate of Action'
    );
    const certificateOfActionCounts = {};
    certificateOfActionCertificates.forEach(item => {
      const reason = item.reason || 'Not specified';
      certificateOfActionCounts[reason] = (certificateOfActionCounts[reason] || 0) + 1;
    });
    const certificateOfActionChartData = Object.keys(certificateOfActionCounts).map(reason => ({
      name: reason,
      value: certificateOfActionCounts[reason]
    }));
    setCertificateOfActionReportData(certificateOfActionChartData);
    
    // Process certificate of cohabitation data - Note: Database has "Cohabitation"
    const certificateOfCohabitationCertificates = filteredCertificates.filter(cert => 
      cert.certificate_type === 'Cohabitation'
    );
    const certificateOfCohabitationCounts = {};
    certificateOfCohabitationCertificates.forEach(item => {
      const reason = item.reason || 'Not specified';
      certificateOfCohabitationCounts[reason] = (certificateOfCohabitationCounts[reason] || 0) + 1;
    });
    const certificateOfCohabitationChartData = Object.keys(certificateOfCohabitationCounts).map(reason => ({
      name: reason,
      value: certificateOfCohabitationCounts[reason]
    }));
    setCertificateOfCohabitationReportData(certificateOfCohabitationChartData);
    
    // Process solo parent data - Note: Database has "Solo Parent"
    const soloParentCertificates = filteredCertificates.filter(cert => 
      cert.certificate_type === 'Solo Parent'
    );
    const soloParentCounts = {};
    soloParentCertificates.forEach(item => {
      const reason = item.reason || 'Not specified';
      soloParentCounts[reason] = (soloParentCounts[reason] || 0) + 1;
    });
    const soloParentChartData = Object.keys(soloParentCounts).map(reason => ({
      name: reason,
      value: soloParentCounts[reason]
    }));
    setSoloParentReportData(soloParentChartData);
  };

  const years = Array.from(new Set(
    certificates.map(item => new Date(item.date_issued).getFullYear())
  ));
  
  if (!years.includes(currentYear)) years.push(currentYear);

  // Check if selected resident has any certificates at all
  const hasAnyCertificates = selectedResident && 
    filterDataByDateAndResident(certificates).length > 0;

  // Reusable component for certificate sections
  const CertificateSection = ({ title, certificateType, reportData }) => {
    const filteredData = filterDataByDateAndResident(certificates).filter(cert => 
      cert.certificate_type === certificateType
    );
    
    // Only render if there's data OR if no resident is selected
    if (filteredData.length === 0 && selectedResident) {
      return null; // Don't render box if no data for selected resident
    }
    
    return (
      <Grid item xs={12} sm={6} md={4}>
        <Paper 
          sx={{ 
            p: 3, 
            height: '500px', // Fixed height for all boxes
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: 2,
            boxShadow: 2,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 4,
            }
          }}
        >
          {/* Total Count Card at top */}
          <Card 
            sx={{ 
              p: 2, 
              textAlign: 'center', 
              backgroundColor: '#f8f9fa',
              mb: 2,
              borderRadius: 2,
              boxShadow: 1
            }}
          >
            <Typography variant="h4" sx={{ color: '#0D4715', fontWeight: 'bold' }}>
              {filteredData.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Request
            </Typography>
          </Card>

          {/* Title */}
          <Typography variant="h6" gutterBottom sx={{ color: '#0D4715', fontWeight: 'bold', mb: 2 }}>
            {title} Requests by Reason
          </Typography>
          
          {/* Chart Container */}
          <Box sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center'
          }}>
            {reportData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {reportData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexDirection: 'column',
                  color: 'text.secondary'
                }}
              >
                <Typography variant="h6" gutterBottom>
                  No Data Available
                </Typography>
                <Typography variant="body2">
                  {selectedResident 
                    ? `No ${title.toLowerCase()} requests found for ${selectedResident.full_name}`
                    : `No ${title.toLowerCase()} requests found`
                  }
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Grid>
    );
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#0D4715', fontWeight: 'bold', mb: 3 }}>
        Reports
      </Typography>

      {/* Filters and Search */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Month</InputLabel>
              <Select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                label="Month"
              >
                <MenuItem value="all">All</MenuItem>
                {[...Array(12)].map((_, i) => (
                  <MenuItem key={i+1} value={i+1}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Year</InputLabel>
              <Select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                label="Year"
              >
                <MenuItem value="all">All</MenuItem>
                {years.sort((a,b)=>b-a).map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={12} md={6}>
            <Autocomplete
              options={residents}
              getOptionLabel={(option) => option.full_name}
              value={selectedResident}
              onChange={(event, newValue) => {
                setSelectedResident(newValue);
              }}
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
                    '& .MuiInputBase-input': {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    },
                    '& .MuiAutocomplete-input': {
                      minWidth: '150px !important', // Ensure minimum width for text
                    }
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
                      maxWidth: '100%',
                      '& .MuiChip-label': {
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }
                    }}
                  />
                ))
              }
              ListboxProps={{
                sx: {
                  '& .MuiAutocomplete-option': {
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }
                }
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Certificate Reports - Only show if data exists or no resident selected */}
      <Grid container spacing={3}>
        {/* Original certificate types */}
        <CertificateSection 
          title="Barangay Indigency" 
          certificateType="Barangay Indigency"
          reportData={indigencyReportData} 
        />
        
        <CertificateSection 
          title="Barangay Clearance" 
          certificateType="Barangay Clearance"
          reportData={barangayClearanceReportData} 
        />
        
        <CertificateSection 
          title="Business Clearance" 
          certificateType="Business Clearance"
          reportData={businessClearanceReportData} 
        />
        
        <CertificateSection 
          title="Certificate of Residency" 
          certificateType="Certificate of Residency"
          reportData={certificateOfResidencyReportData} 
        />
        
        <CertificateSection 
          title="Permit to Travel" 
          certificateType="Permit to Travel"
          reportData={permitToTravelReportData} 
        />
        
        {/* Additional certificate types */}
        <CertificateSection 
          title="Oath of Undertaking Job Seeker" 
          certificateType="Oath of Undertaking Job Seeker"
          reportData={oathJobReportData} 
        />
        
        <CertificateSection 
          title="Cash Assistance" 
          certificateType="Cash Assistance"
          reportData={cashAssistanceReportData} 
        />
        
        <CertificateSection 
          title="Financial Assistance" 
          certificateType="Financial Assistance"
          reportData={financialAssistanceReportData} 
        />
        
        <CertificateSection 
          title="BHERT Certificate Positive" 
          certificateType="BHERT Certificate Positive"
          reportData={bhertPositiveReportData} 
        />
        
        <CertificateSection 
          title="BHERT Certificate Normal" 
          certificateType="BHERT Certificate Normal"
          reportData={bhertNormalReportData} 
        />
        
        <CertificateSection 
          title="Certificate of Action" 
          certificateType="Certificate of Action"
          reportData={certificateOfActionReportData} 
        />
        
        <CertificateSection 
          title="Cohabitation" 
          certificateType="Cohabitation"
          reportData={certificateOfCohabitationReportData} 
        />
        
        <CertificateSection 
          title="Solo Parent" 
          certificateType="Solo Parent"
          reportData={soloParentReportData} 
        />
      </Grid>

      {/* Show message only when no data for selected resident at all */}
      {selectedResident && !hasAnyCertificates && (
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 3, 
              textAlign: 'center', 
              borderRadius: 2,
              boxShadow: 2,
              backgroundColor: '#f8f9fa'
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No certificates found for {selectedResident.full_name} in selected period
            </Typography>
          </Paper>
        </Grid>
      )}
    </Box>
  );
};

export default Reports;
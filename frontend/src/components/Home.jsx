import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  IconButton,
  Badge,
  Avatar,
  Divider,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
  MobileStepper,
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Home as HomeIcon,
  Add as AddIcon,
  Notifications as NotificationsIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  LocalHospital as HealthIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Campaign as CampaignIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Person as PersonIcon,
  FilePresent as DocumentIcon,
  EventNote as EventIcon,
  Assessment as AssessmentIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Announcement as AnnouncementIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';

const BarangayDashboard = () => {
  const theme = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const open = Boolean(anchorEl);
  const autoPlayRef = useRef();

  // Dummy data
  const stats = {
    residents: 2847,
    households: 612,
    certificates: 534,
    healthCheckups: 186,
    pendingRequests: 23,
    announcements: 8,
    events: 5,
    complaints: 12,
  };

  const quickActions = [
    {
      id: 1,
      title: 'Add Resident',
      description: 'Register new resident',
      icon: <AddIcon />,
      color: '#41644A',
    },
    {
      id: 2,
      title: 'Issue Certificate',
      description: 'Create new certificate',
      icon: <AssignmentIcon />,
      color: '#E9762B',
    },
    {
      id: 3,
      title: 'Schedule Event',
      description: 'Plan community event',
      icon: <EventIcon />,
      color: '#41644A',
    },
    {
      id: 4,
      title: 'Send Announcement',
      description: 'Broadcast message',
      icon: <CampaignIcon />,
      color: '#E9762B',
    },
    {
      id: 5,
      title: 'Health Services',
      description: 'Manage health records',
      icon: <HealthIcon />,
      color: '#41644A',
    },
    {
      id: 6,
      title: 'Generate Reports',
      description: 'Create barangay reports',
      icon: <AssessmentIcon />,
      color: '#E9762B',
    },
  ];

  const announcements = [
    {
      id: 1,
      title: 'Water Interruption Notice',
      content:
        'Water supply will be interrupted on June 20 from 9 AM to 5 PM for maintenance in Zone 3.',
      date: 'June 15, 2023',
      type: 'Notice',
    },
    {
      id: 2,
      title: 'Community Clean-up Drive',
      content:
        'Join us for our monthly clean-up drive on June 25 at 7 AM. Meeting point at the Barangay Hall.',
      date: 'June 14, 2023',
      type: 'Event',
    },
    {
      id: 3,
      title: 'Vaccination Schedule',
      content:
        'Free COVID-19 vaccination will be available on June 22 at the Health Center. First come, first served.',
      date: 'June 13, 2023',
      type: 'Health',
    },
    {
      id: 4,
      title: 'Senior Citizens Meeting',
      content:
        'Monthly senior citizens meeting will be held on June 30 at 2 PM in the Barangay Hall.',
      date: 'June 12, 2023',
      type: 'Meeting',
    },
  ];

  const missionVision = {
    mission:
      'To provide quality public service and promote transparency, accountability, and good governance for the welfare of our constituents.',
    vision:
      'To be a model barangay with empowered citizens, sustainable development, and progressive community.',
  };

  const about = {
    description:
      'Barangay 145 is a vibrant community located in the heart of the city. With a population of over 2,800 residents, we are committed to providing excellent public services and fostering community development.',
    history:
      'Established in 1975, Barangay 145 has grown from a small residential area to a thriving community with various commercial establishments and public facilities.',
    officials: [
      { name: 'Juan Dela Cruz', position: 'Barangay Captain' },
      { name: 'Maria Santos', position: 'Barangay Secretary' },
      { name: 'Jose Reyes', position: 'Barangay Treasurer' },
      { name: 'Ana Garcia', position: 'Barangay Councilor' },
    ],
  };

  const upcomingEvents = [
    {
      id: 1,
      title: 'Community Clean-up Drive',
      date: 'June 20, 2023',
      time: '7:00 AM',
      type: 'Community',
    },
    {
      id: 2,
      title: 'Senior Citizens Meeting',
      date: 'June 22, 2023',
      time: '2:00 PM',
      type: 'Meeting',
    },
    {
      id: 3,
      title: 'Health Vaccination Program',
      date: 'June 25, 2023',
      time: '9:00 AM',
      type: 'Health',
    },
    {
      id: 4,
      title: 'Youth Sports Festival',
      date: 'July 1, 2023',
      time: '8:00 AM',
      type: 'Community',
    },
    {
      id: 5,
      title: 'Barangay Assembly',
      date: 'July 5, 2023',
      time: '3:00 PM',
      type: 'Meeting',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      action: 'New resident registered',
      detail: 'Maria Santos from Zone 3',
      time: '2 hours ago',
      icon: <PeopleIcon />,
      color: '#41644A',
    },
    {
      id: 2,
      action: 'Certificate issued',
      detail: 'Barangay Clearance for Juan Dela Cruz',
      time: '3 hours ago',
      icon: <AssignmentIcon />,
      color: '#0D4715',
    },
    {
      id: 3,
      action: 'Health checkup conducted',
      detail: '15 residents from Zone 2',
      time: '5 hours ago',
      icon: <HealthIcon />,
      color: '#E9762B',
    },
    {
      id: 4,
      action: 'Announcement posted',
      detail: 'Water interruption notice for Zone 1',
      time: '1 day ago',
      icon: <CampaignIcon />,
      color: '#41644A',
    },
    {
      id: 5,
      action: 'Event scheduled',
      detail: 'Community Clean-up Drive',
      time: '2 days ago',
      icon: <EventIcon />,
      color: '#0D4715',
    },
  ];

  const notifications = [
    {
      id: 1,
      title: 'Certificate Request',
      message: '5 pending certificate requests',
      time: 'Just now',
      type: 'request',
    },
    {
      id: 2,
      title: 'New Resident',
      message: '3 new resident registrations',
      time: '1 hour ago',
      type: 'info',
    },
    {
      id: 3,
      title: 'System Update',
      message: 'New features added to certificate processing',
      time: '3 hours ago',
      type: 'update',
    },
    {
      id: 4,
      title: 'Meeting Reminder',
      message: 'Senior Citizens Meeting tomorrow at 2:00 PM',
      time: '5 hours ago',
      type: 'reminder',
    },
  ];

  const demographics = {
    seniorCitizens: { count: 387, percentage: 13.6 },
    soloParents: { count: 124, percentage: 4.4 },
    personsWithDisability: { count: 67, percentage: 2.4 },
    jobSeekers: { count: 156, percentage: 5.5 },
    youth: { count: 842, percentage: 29.6 },
    children: { count: 534, percentage: 18.8 },
  };

  // Auto-play carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prevActiveStep) => (prevActiveStep + 1) % 3);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => (prevActiveStep + 1) % 3);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => (prevActiveStep - 1 + 3) % 3);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  // Calendar days generation
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <Box
          key={`empty-${i}`}
          sx={{
            minHeight: 40,
            borderRight: '1px solid rgba(0,0,0,0.1)',
            borderBottom: '1px solid rgba(0,0,0,0.1)',
            backgroundColor: '#fafafa',
            '&:nth-of-type(7n)': {
              borderRight: 'none',
            },
          }}
        />
      );
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const hasEvent = [5, 12, 15, 20, 22, 25].includes(day);
      const isToday =
        new Date().getDate() === day &&
        new Date().getMonth() === currentMonth.getMonth() &&
        new Date().getFullYear() === currentMonth.getFullYear();

      days.push(
        <Box
          key={day}
          sx={{
            minHeight: 40,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            p: 0.5,
            borderRight: '1px solid rgba(0,0,0,0.1)',
            borderBottom: '1px solid rgba(0,0,0,0.1)',
            backgroundColor: isToday ? alpha('#E9762B', 0.15) : '#FFFFFF',
            cursor: 'pointer',
            position: 'relative',
            '&:hover': {
              backgroundColor: isToday
                ? alpha('#E9762B', 0.25)
                : alpha('#41644A', 0.05),
            },
            '&:nth-of-type(7n)': {
              borderRight: 'none',
            },
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.75rem',
              fontWeight: isToday ? 'bold' : 'normal',
              color: isToday ? '#E9762B' : '#0D4715',
              lineHeight: 1.2,
            }}
          >
            {day}
          </Typography>
          {hasEvent && (
            <Box
              sx={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                backgroundColor: '#E9762B',
                position: 'absolute',
                bottom: 4,
                right: 4,
              }}
            />
          )}
        </Box>
      );
    }

    return days;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#F1F0E9',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          backgroundColor: '#FFFFFF',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          zIndex: 100,
          position: 'sticky',
          top: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                mr: 2,
                backgroundColor: '#41644A',
              }}
            >
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 'bold', color: '#0D4715' }}
              >
                Welcome back, Secretary
              </Typography>
              <Typography variant="body2" color="#41644A">
                Barangay 145 Management System
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton size="large" color="inherit">
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsIcon sx={{ color: '#41644A' }} />
              </Badge>
            </IconButton>
            <IconButton size="large" color="inherit">
              <RefreshIcon sx={{ color: '#41644A' }} />
            </IconButton>
            <IconButton
              size="large"
              aria-label="more"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuClick}
              color="inherit"
            >
              <MoreVertIcon sx={{ color: '#41644A' }} />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={open}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
              <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
              <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
            </Menu>
          </Box>
        </Box>
        <Box sx={{ px: 2, pb: 1 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Dashboard" />
            <Tab label="Residents" />
            <Tab label="Certificates" />
            <Tab label="Events" />
            <Tab label="Announcements" />
            <Tab label="Reports" />
          </Tabs>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 2, overflow: 'auto' }}>
        {activeTab === 0 && (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            {/* Left Content */}
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                minHeight: 0,
              }}
            >
              {/* Stats Cards */}
              <Grid container spacing={2} sx={{ flexShrink: 0, width: '100%' }}>
                <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                      overflow: 'hidden',
                      height: '100%',
                      width: '100%',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        background:
                          'linear-gradient(135deg, #41644A 0%, #0D4715 100%)',
                        color: '#FFFFFF',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography
                          variant="h4"
                          component="div"
                          sx={{ fontWeight: 'bold' }}
                        >
                          {stats.residents}
                        </Typography>
                        <Avatar
                          sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                        >
                          <PeopleIcon />
                        </Avatar>
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Total Residents
                      </Typography>
                    </Box>
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                      <TrendingUpIcon
                        sx={{ color: '#41644A', mr: 1, fontSize: '1rem' }}
                      />
                      <Typography variant="body2" color="#41644A">
                        5% increase from last month
                      </Typography>
                    </Box>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                      overflow: 'hidden',
                      height: '100%',
                      width: '100%',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        background:
                          'linear-gradient(135deg, #E9762B 0%, #d4681f 100%)',
                        color: '#FFFFFF',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography
                          variant="h4"
                          component="div"
                          sx={{ fontWeight: 'bold' }}
                        >
                          {stats.certificates}
                        </Typography>
                        <Avatar
                          sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                        >
                          <AssignmentIcon />
                        </Avatar>
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Certificates Issued
                      </Typography>
                    </Box>
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                      <TrendingUpIcon
                        sx={{ color: '#E9762B', mr: 1, fontSize: '1rem' }}
                      />
                      <Typography variant="body2" color="#E9762B">
                        12% increase from last month
                      </Typography>
                    </Box>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                      overflow: 'hidden',
                      height: '100%',
                      width: '100%',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        background:
                          'linear-gradient(135deg, #41644A 0%, #0D4715 100%)',
                        color: '#FFFFFF',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography
                          variant="h4"
                          component="div"
                          sx={{ fontWeight: 'bold' }}
                        >
                          {stats.households}
                        </Typography>
                        <Avatar
                          sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                        >
                          <HomeIcon />
                        </Avatar>
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Total Households
                      </Typography>
                    </Box>
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                      <TrendingUpIcon
                        sx={{ color: '#41644A', mr: 1, fontSize: '1rem' }}
                      />
                      <Typography variant="body2" color="#41644A">
                        3% increase from last month
                      </Typography>
                    </Box>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                      overflow: 'hidden',
                      height: '100%',
                      width: '100%',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        background:
                          'linear-gradient(135deg, #E9762B 0%, #d4681f 100%)',
                        color: '#FFFFFF',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography
                          variant="h4"
                          component="div"
                          sx={{ fontWeight: 'bold' }}
                        >
                          {stats.healthCheckups}
                        </Typography>
                        <Avatar
                          sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                        >
                          <HealthIcon />
                        </Avatar>
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Health Checkups
                      </Typography>
                    </Box>
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                      <TrendingUpIcon
                        sx={{ color: '#E9762B', mr: 1, fontSize: '1rem' }}
                      />
                      <Typography variant="body2" color="#E9762B">
                        8% increase from last month
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              </Grid>

              {/* Carousel for Announcements and About/Mission/Vision */}
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '320px',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexShrink: 0,
                    backgroundColor: 'rgba(65, 100, 74, 0.03)',
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      color: '#0D4715',
                      fontSize: '1rem',
                    }}
                  >
                    {activeStep === 0
                      ? 'Announcements'
                      : activeStep === 1
                      ? 'Mission & Vision'
                      : 'About Barangay 145'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={handleBack}
                      sx={{
                        color: '#41644A',
                        '&:hover': {
                          backgroundColor: 'rgba(65, 100, 74, 0.1)',
                        },
                      }}
                    >
                      <KeyboardArrowLeft />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={handleNext}
                      sx={{
                        color: '#41644A',
                        '&:hover': {
                          backgroundColor: 'rgba(65, 100, 74, 0.1)',
                        },
                      }}
                    >
                      <KeyboardArrowRight />
                    </IconButton>
                  </Box>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    flex: 1,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      overflow: 'hidden',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        transition:
                          'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: `translateX(-${activeStep * 100}%)`,
                        width: '100%',
                        height: '100%',
                      }}
                    >
                      {/* Announcements Slide */}
                      <Box
                        sx={{
                          minWidth: '100%',
                          px: 0.5,
                          height: '100%',
                          overflow: 'auto',
                        }}
                      >
                        <List dense sx={{ py: 0 }}>
                          {announcements.map((announcement) => (
                            <ListItem
                              key={announcement.id}
                              sx={{
                                mb: 0.75,
                                p: 1.25,
                                borderRadius: 1.5,
                                backgroundColor: 'rgba(65, 100, 74, 0.05)',
                                '&:last-child': { mb: 0 },
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 40 }}>
                                <Avatar sx={{ backgroundColor: '#41644A' }}>
                                  <AnnouncementIcon />
                                </Avatar>
                              </ListItemIcon>
                              <ListItemText
                                primary={announcement.title}
                                secondary={
                                  <Box>
                                    <Typography
                                      variant="body2"
                                      color="#41644A"
                                      sx={{ mb: 1 }}
                                    >
                                      {announcement.content}
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                      }}
                                    >
                                      <Chip
                                        label={announcement.type}
                                        size="small"
                                        sx={{
                                          backgroundColor: '#E9762B',
                                          color: '#FFFFFF',
                                        }}
                                      />
                                      <Typography
                                        variant="caption"
                                        color="#0D4715"
                                      >
                                        {announcement.date}
                                      </Typography>
                                    </Box>
                                  </Box>
                                }
                                primaryTypographyProps={{
                                  variant: 'h6',
                                  fontWeight: 'bold',
                                  color: '#0D4715',
                                }}
                                secondaryTypographyProps={{
                                  component: 'div',
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>

                      {/* Mission & Vision Slide */}
                      <Box
                        sx={{
                          minWidth: '100%',
                          px: 0.5,
                          height: '100%',
                          overflow: 'auto',
                        }}
                      >
                        <Grid container spacing={1.5} sx={{ height: '100%' }}>
                          <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
                            <Box
                              sx={{
                                p: 1.5,
                                borderRadius: 1.5,
                                backgroundColor: 'rgba(65, 100, 74, 0.05)',
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  fontWeight: 'bold',
                                  color: '#0D4715',
                                  mb: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  fontSize: '0.95rem',
                                }}
                              >
                                <Avatar
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    mr: 1,
                                    backgroundColor: '#41644A',
                                  }}
                                >
                                  <DescriptionIcon sx={{ fontSize: '1rem' }} />
                                </Avatar>
                                Our Mission
                              </Typography>
                              <Typography
                                variant="body2"
                                color="#41644A"
                                sx={{ lineHeight: 1.5, fontSize: '0.8rem' }}
                              >
                                {missionVision.mission}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
                            <Box
                              sx={{
                                p: 1.5,
                                borderRadius: 1.5,
                                backgroundColor: 'rgba(233, 118, 43, 0.05)',
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  fontWeight: 'bold',
                                  color: '#0D4715',
                                  mb: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  fontSize: '0.95rem',
                                }}
                              >
                                <Avatar
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    mr: 1,
                                    backgroundColor: '#E9762B',
                                  }}
                                >
                                  <InfoIcon sx={{ fontSize: '1rem' }} />
                                </Avatar>
                                Our Vision
                              </Typography>
                              <Typography
                                variant="body2"
                                color="#41644A"
                                sx={{ lineHeight: 1.5, fontSize: '0.8rem' }}
                              >
                                {missionVision.vision}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>

                      {/* About Slide */}
                      <Box sx={{ minWidth: '100%', px: 1 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Box
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                backgroundColor: 'rgba(65, 100, 74, 0.05)',
                                height: '100%',
                              }}
                            >
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 'bold',
                                  color: '#0D4715',
                                  mb: 2,
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    mr: 1,
                                    backgroundColor: '#41644A',
                                  }}
                                >
                                  <LocationIcon />
                                </Avatar>
                                About Barangay 145
                              </Typography>
                              <Typography
                                variant="body2"
                                color="#41644A"
                                sx={{ lineHeight: 1.6, mb: 2 }}
                              >
                                {about.description}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="#41644A"
                                sx={{ lineHeight: 1.6 }}
                              >
                                {about.history}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Box
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                backgroundColor: 'rgba(233, 118, 43, 0.05)',
                                height: '100%',
                              }}
                            >
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 'bold',
                                  color: '#0D4715',
                                  mb: 2,
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    mr: 1,
                                    backgroundColor: '#E9762B',
                                  }}
                                >
                                  <PeopleIcon />
                                </Avatar>
                                Barangay Officials
                              </Typography>
                              <List dense>
                                {about.officials.map((official, index) => (
                                  <ListItem key={index} sx={{ py: 0.5 }}>
                                    <ListItemText
                                      primary={official.name}
                                      secondary={official.position}
                                      primaryTypographyProps={{
                                        variant: 'body2',
                                        fontWeight: 'bold',
                                        color: '#0D4715',
                                      }}
                                      secondaryTypographyProps={{
                                        variant: 'caption',
                                        color: '#41644A',
                                      }}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  </Box>
                  <MobileStepper
                    steps={3}
                    position="static"
                    activeStep={activeStep}
                    sx={{ backgroundColor: 'transparent', mt: 1 }}
                    nextButton={
                      <IconButton
                        size="small"
                        onClick={handleNext}
                        disabled={activeStep === 2}
                      >
                        <KeyboardArrowRight />
                      </IconButton>
                    }
                    backButton={
                      <IconButton
                        size="small"
                        onClick={handleBack}
                        disabled={activeStep === 0}
                      >
                        <KeyboardArrowLeft />
                      </IconButton>
                    }
                  />
                </Box>
              </Card>

              {/* Compact Demographics */}
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  flexShrink: 0,
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 'bold', color: '#0D4715' }}
                  >
                    Community Demographics
                  </Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={4} md={2}>
                      <Box sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="body2" color="#41644A">
                            Senior Citizens
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {demographics.seniorCitizens.count} (
                            {demographics.seniorCitizens.percentage}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={demographics.seniorCitizens.percentage}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: 'rgba(65, 100, 74, 0.2)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: '#41644A',
                            },
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                      <Box sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="body2" color="#41644A">
                            Solo Parents
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {demographics.soloParents.count} (
                            {demographics.soloParents.percentage}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={demographics.soloParents.percentage}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: 'rgba(233, 118, 43, 0.2)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: '#E9762B',
                            },
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                      <Box sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="body2" color="#41644A">
                            PWD
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {demographics.personsWithDisability.count} (
                            {demographics.personsWithDisability.percentage}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={demographics.personsWithDisability.percentage}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: 'rgba(233, 118, 43, 0.2)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: '#E9762B',
                            },
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                      <Box sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="body2" color="#41644A">
                            Job Seekers
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {demographics.jobSeekers.count} (
                            {demographics.jobSeekers.percentage}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={demographics.jobSeekers.percentage}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: 'rgba(65, 100, 74, 0.2)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: '#41644A',
                            },
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                      <Box sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="body2" color="#41644A">
                            Youth
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {demographics.youth.count} (
                            {demographics.youth.percentage}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={demographics.youth.percentage}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: 'rgba(65, 100, 74, 0.2)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: '#41644A',
                            },
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                      <Box sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="body2" color="#41644A">
                            Children
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {demographics.children.count} (
                            {demographics.children.percentage}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={demographics.children.percentage}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: 'rgba(233, 118, 43, 0.2)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: '#E9762B',
                            },
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Card>

              {/* Recent Activities */}
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '280px',
                  mt: 'auto',
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 'bold', color: '#0D4715' }}
                  >
                    Recent Activities
                  </Typography>
                </Box>
                <Box sx={{ p: 2, flex: 1, overflow: 'auto', minHeight: 0 }}>
                  <List>
                    {recentActivities.map((activity) => (
                      <ListItem key={activity.id} sx={{ px: 0, py: 1 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              backgroundColor: activity.color,
                            }}
                          >
                            {activity.icon}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.action}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="#41644A">
                                {activity.detail}
                              </Typography>
                              <Typography variant="caption" color="#0D4715">
                                {activity.time}
                              </Typography>
                            </Box>
                          }
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontWeight: 'bold',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Card>
            </Box>

            {/* Right Sidebar */}
            <Box
              sx={{
                width: 380,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {/* Quick Actions - Regular Buttons */}
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                  flexShrink: 0,
                }}
              >
                <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 'bold', color: '#0D4715' }}
                  >
                    Quick Actions
                  </Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                  <Grid container spacing={2} justifyContent="center">
                    {quickActions.map((action) => (
                      <Grid item xs={12} sm={6} md={6} key={action.id}>
                        <Button
                          fullWidth
                          variant="outlined"
                          sx={{
                            p: 1.5,
                            flexDirection: 'column',
                            height: 90,
                            minHeight: 90,
                            maxHeight: 90,
                            minWidth: 160,
                            width: '100%',
                            borderColor: action.color,
                            color: action.color,
                            borderRadius: 2,
                            '&:hover': {
                              borderColor: action.color,
                              backgroundColor: alpha(action.color, 0.04),
                            },
                          }}
                        >
                          <Avatar
                            sx={{
                              mb: 0.75,
                              width: 32,
                              height: 32,
                              backgroundColor: alpha(action.color, 0.1),
                              color: action.color,
                            }}
                          >
                            {action.icon}
                          </Avatar>
                          <Typography
                            variant="caption"
                            sx={{
                              textAlign: 'center',
                              lineHeight: 1.2,
                              fontSize: '0.7rem',
                              fontWeight: 'medium',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '100%',
                            }}
                          >
                            {action.title}
                          </Typography>
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Card>

              {/* Calendar */}
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                  flexShrink: 0,
                  overflow: 'hidden',
                }}
              >
                {/* Calendar Header */}
                <Box
                  sx={{
                    p: 2,
                    borderBottom: '1px solid rgba(0,0,0,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#41644A',
                    color: '#FFFFFF',
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={handlePrevMonth}
                    sx={{
                      color: '#FFFFFF',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
                    }}
                  >
                    <ArrowBackIcon fontSize="small" />
                  </IconButton>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      textTransform: 'capitalize',
                    }}
                  >
                    {currentMonth.toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={handleNextMonth}
                    sx={{
                      color: '#FFFFFF',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
                    }}
                  >
                    <ArrowForwardIcon fontSize="small" />
                  </IconButton>
                </Box>

                {/* Calendar Body */}
                <Box sx={{ p: 1.5 }}>
                  {/* Day Headers */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, 1fr)',
                      gap: 0,
                      mb: 0.5,
                    }}
                  >
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                      <Box
                        key={index}
                        sx={{
                          textAlign: 'center',
                          py: 1,
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                          color: '#41644A',
                          backgroundColor: 'rgba(65, 100, 74, 0.05)',
                        }}
                      >
                        {day}
                      </Box>
                    ))}
                  </Box>

                  {/* Calendar Days */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, 1fr)',
                      gap: 0,
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderTop: 'none',
                    }}
                  >
                    {renderCalendarDays()}
                  </Box>
                </Box>
              </Card>

              {/* Upcoming Events - Separate Card */}
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '280px',
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 'bold', color: '#0D4715' }}
                  >
                    Upcoming Events
                  </Typography>
                </Box>
                <Box sx={{ p: 2, flex: 1, overflow: 'auto', minHeight: 0 }}>
                  <List dense sx={{ p: 0 }}>
                    {upcomingEvents.map((event) => (
                      <ListItem
                        key={event.id}
                        sx={{
                          py: 0.75,
                          px: 0,
                          borderRadius: 1,
                          mb: 0.5,
                          '&:hover': {
                            backgroundColor: 'rgba(65, 100, 74, 0.05)',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: '#E9762B',
                            mr: 1.5,
                            flexShrink: 0,
                          }}
                        />
                        <ListItemText
                          primary={event.title}
                          secondary={`${event.date.split(',')[0]} - ${
                            event.time
                          }`}
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontWeight: 'bold',
                            color: '#0D4715',
                            sx: { fontSize: '0.75rem' },
                          }}
                          secondaryTypographyProps={{
                            variant: 'caption',
                            color: '#41644A',
                            sx: { fontSize: '0.65rem' },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Card>
            </Box>
          </Box>
        )}

        {activeTab === 1 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 'bold', color: '#0D4715' }}
                  >
                    Residents Management
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{ backgroundColor: '#41644A' }}
                  >
                    Add New Resident
                  </Button>
                </Box>
                <Box sx={{ p: 2 }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Address</TableCell>
                          <TableCell>Contact</TableCell>
                          <TableCell>Age</TableCell>
                          <TableCell>Gender</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[1, 2, 3, 4, 5].map((id) => (
                          <TableRow key={id} hover>
                            <TableCell>{1000 + id}</TableCell>
                            <TableCell>Resident Name {id}</TableCell>
                            <TableCell>
                              Zone {id}, Street {id * 2}
                            </TableCell>
                            <TableCell>0912345678{id}</TableCell>
                            <TableCell>{20 + id * 5}</TableCell>
                            <TableCell>
                              {id % 2 === 0 ? 'Male' : 'Female'}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label="Active"
                                size="small"
                                color="success"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton size="small">
                                <ViewIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small">
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Card>
            </Grid>
          </Grid>
        )}

        {activeTab === 2 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 'bold', color: '#0D4715' }}
                  >
                    Certificates Management
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{ backgroundColor: '#E9762B' }}
                  >
                    Issue New Certificate
                  </Button>
                </Box>
                <Box sx={{ p: 2 }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Resident Name</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Request Date</TableCell>
                          <TableCell>Pickup Date</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[1, 2, 3, 4, 5].map((id) => (
                          <TableRow key={id} hover>
                            <TableCell>{2000 + id}</TableCell>
                            <TableCell>Resident Name {id}</TableCell>
                            <TableCell>
                              {id % 2 === 0
                                ? 'Barangay Clearance'
                                : 'Certificate of Residency'}
                            </TableCell>
                            <TableCell>2023-06-{10 + id}</TableCell>
                            <TableCell>
                              {id % 3 === 0 ? 'Pending' : `2023-06-${15 + id}`}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  id % 3 === 0 ? 'Processing' : 'Completed'
                                }
                                size="small"
                                color={id % 3 === 0 ? 'warning' : 'success'}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton size="small">
                                <ViewIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small">
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small">
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small">
                                <PrintIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Card>
            </Grid>
          </Grid>
        )}

        {activeTab === 3 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 'bold', color: '#0D4715' }}
                  >
                    Events Management
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{ backgroundColor: '#41644A' }}
                  >
                    Schedule New Event
                  </Button>
                </Box>
                <Box sx={{ p: 2 }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Event Name</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Time</TableCell>
                          <TableCell>Location</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {upcomingEvents.map((event) => (
                          <TableRow key={event.id} hover>
                            <TableCell>{3000 + event.id}</TableCell>
                            <TableCell>{event.title}</TableCell>
                            <TableCell>{event.date}</TableCell>
                            <TableCell>{event.time}</TableCell>
                            <TableCell>Barangay Hall</TableCell>
                            <TableCell>
                              <Chip label={event.type} size="small" />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label="Upcoming"
                                size="small"
                                color="info"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton size="small">
                                <ViewIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small">
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small">
                                <EmailIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Card>
            </Grid>
          </Grid>
        )}

        {activeTab === 4 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 'bold', color: '#0D4715' }}
                  >
                    Announcements Management
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{ backgroundColor: '#E9762B' }}
                  >
                    Create New Announcement
                  </Button>
                </Box>
                <Box sx={{ p: 2 }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Title</TableCell>
                          <TableCell>Content</TableCell>
                          <TableCell>Date Posted</TableCell>
                          <TableCell>Expiry Date</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {announcements.map((announcement) => (
                          <TableRow key={announcement.id} hover>
                            <TableCell>{4000 + announcement.id}</TableCell>
                            <TableCell>{announcement.title}</TableCell>
                            <TableCell>{announcement.content}</TableCell>
                            <TableCell>{announcement.date}</TableCell>
                            <TableCell>{announcement.date}</TableCell>
                            <TableCell>
                              <Chip
                                label="Active"
                                size="small"
                                color="success"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton size="small">
                                <ViewIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small">
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Card>
            </Grid>
          </Grid>
        )}

        {activeTab === 5 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 'bold', color: '#0D4715' }}
                  >
                    Reports
                  </Typography>
                  <Box>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      sx={{ mr: 1 }}
                    >
                      Export
                    </Button>
                    <Button variant="outlined" startIcon={<PrintIcon />}>
                      Print
                    </Button>
                  </Box>
                </Box>
                <Box sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Card sx={{ p: 2, textAlign: 'center' }}>
                        <AssessmentIcon
                          sx={{ fontSize: 48, color: '#41644A', mb: 1 }}
                        />
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 'bold', color: '#0D4715' }}
                        >
                          Monthly Report
                        </Typography>
                        <Typography
                          variant="body2"
                          color="#41644A"
                          sx={{ mb: 2 }}
                        >
                          Generate monthly barangay report
                        </Typography>
                        <Button
                          variant="contained"
                          sx={{ backgroundColor: '#41644A' }}
                        >
                          Generate
                        </Button>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card sx={{ p: 2, textAlign: 'center' }}>
                        <PeopleIcon
                          sx={{ fontSize: 48, color: '#E9762B', mb: 1 }}
                        />
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 'bold', color: '#0D4715' }}
                        >
                          Residents Report
                        </Typography>
                        <Typography
                          variant="body2"
                          color="#41644A"
                          sx={{ mb: 2 }}
                        >
                          Generate residents demographics report
                        </Typography>
                        <Button
                          variant="contained"
                          sx={{ backgroundColor: '#E9762B' }}
                        >
                          Generate
                        </Button>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card sx={{ p: 2, textAlign: 'center' }}>
                        <AssignmentIcon
                          sx={{ fontSize: 48, color: '#41644A', mb: 1 }}
                        />
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 'bold', color: '#0D4715' }}
                        >
                          Certificates Report
                        </Typography>
                        <Typography
                          variant="body2"
                          color="#41644A"
                          sx={{ mb: 2 }}
                        >
                          Generate certificates issued report
                        </Typography>
                        <Button
                          variant="contained"
                          sx={{ backgroundColor: '#41644A' }}
                        >
                          Generate
                        </Button>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default BarangayDashboard;

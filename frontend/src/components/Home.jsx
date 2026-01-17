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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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
  AccessibilityNew as AccessibilityNewIcon,
  Groups as GroupsIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Pause, PlayArrow } from '@mui/icons-material';

const BarangayDashboard = () => {
  const theme = useTheme();
  const { getToken, user } = useAuth();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const open = Boolean(anchorEl);
  const [demoStep, setDemoStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const apiBase = 'http://localhost:5000';
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  
  // Form states for different modals
  const [eventForm, setEventForm] = useState({
    event_name: '',
    event_description: '',
    event_date: '',
    event_time: '',
    event_location: 'Barangay Hall',
    event_type: 'Community',
  });
  
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    announcement_type: 'Notice',
    expiry_date: '',
    image: null,
  });
  
  const [officialForm, setOfficialForm] = useState({
    name: '',
    position: '',
    contact_number: '',
    email: '',
    image: null,
    imagePreview: null,
  });

  // State for dashboard data
  const [stats, setStats] = useState({
    residents: 0,
    households: 0,
    certificates: 0,
    healthCheckups: 0,
    pendingRequests: 0,
    announcements: 0,
    events: 0,
    complaints: 0,
  });
  
  const [announcements, setAnnouncements] = useState([]);
  const [missionVision, setMissionVision] = useState({
    mission: 'To provide quality public service and promote transparency, accountability, and good governance for the welfare of our constituents.',
    vision: 'To be a model barangay with empowered citizens, sustainable development, and progressive community.',
  });
  const [about, setAbout] = useState({
    description: 'Barangay 145 is a vibrant community located in the heart of the city. With a population of over 2,800 residents, we are committed to providing excellent public services and fostering community development.',
    history: 'Established in 1975, Barangay 145 has grown from a small residential area to a thriving community with various commercial establishments and public facilities.',
    officials: [],
    images: [],
  });
  const [aboutImageIndex, setAboutImageIndex] = useState(0);
  const [editingOfficial, setEditingOfficial] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [demographics, setDemographics] = useState({
    seniorCitizens: { count: 0 },
    soloParents: { count: 0 },
    personsWithDisability: { count: 0 },
    youth: { count: 0 },
  });

  const quickActions = [
    {
      id: 1,
      title: 'Add Resident',
      // description: 'Register new resident',
      icon: <AddIcon />,
      color: '#41644A',
      type: 'resident',
    },
    {
      id: 2,
      title: 'Issue Certificate',
      // description: 'Create new certificate',
      icon: <AssignmentIcon />,
      color: '#E9762B',
      type: 'certificate',
    },
    {
      id: 3,
      title: 'Schedule Event',
      // description: 'Plan community event',
      icon: <EventIcon />,
      color: '#41644A',
      type: 'event',
    },
    {
      id: 4,
      title: 'Announcement',
      // description: 'Create announcement',
      icon: <CampaignIcon />,
      color: '#E9762B',
      type: 'announcement',
    },
    {
      id: 5,
      title: 'Barangay Officials',
      // description: 'Manage barangay officials',
      icon: <HealthIcon />,
      color: '#41644A',
      type: 'official',
    },
    {
      id: 6,
      title: 'Generate Reports',
      // description: 'Create barangay reports',
      icon: <AssessmentIcon />,
      color: '#E9762B',
      type: 'report',
    },
  ];

  // Handle quick action click
  const handleQuickActionClick = (action) => {
    setSelectedAction(action);
    setModalOpen(true);
    
    // Reset forms
    setEventForm({
      event_name: '',
      event_description: '',
      event_date: '',
      event_time: '',
      event_location: 'Barangay Hall',
      event_type: 'Community',
    });
    setAnnouncementForm({
      title: '',
      content: '',
      announcement_type: 'Notice',
      expiry_date: '',
    });
    setOfficialForm({
      name: '',
      position: '',
      contact_number: '',
      email: '',
      image: null,
      imagePreview: null,
    });
  };

  // Handle modal close
  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedAction(null);
    setEditingOfficial(null);
  };

  // Handle form submission
  const handleFormSubmit = async () => {
    if (!selectedAction) return;

    try {
      const token = getToken();
      if (!token) {
        alert('Please login to continue');
        return;
      }

      const headers = getAuthHeaders();

      switch (selectedAction.type) {
        case 'resident':
          // Navigate to residents page
          navigate('/residents');
          handleModalClose();
          break;

        case 'certificate':
          // Navigate to transactions page
          navigate('/certification-action-transactions');
          handleModalClose();
          break;

        case 'event':
          // Create event
          const eventResponse = await fetch(`${apiBase}/dashboard/events`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              ...eventForm,
              event_date: eventForm.event_date || new Date().toISOString().split('T')[0],
            }),
          });
          if (eventResponse.ok) {
            alert('Event created successfully!');
            handleModalClose();
            // Refresh dashboard data
            window.location.reload();
          } else {
            const error = await eventResponse.json();
            alert(error.error || 'Failed to create event');
          }
          break;

        case 'announcement':
          // Create announcement (with optional image)
          const announcementData = new FormData();
          announcementData.append('title', announcementForm.title);
          announcementData.append('content', announcementForm.content);
          announcementData.append('announcement_type', announcementForm.announcement_type);
          if (announcementForm.expiry_date) {
            announcementData.append('expiry_date', announcementForm.expiry_date);
          }
          announcementData.append('date_posted', new Date().toISOString().split('T')[0]);
          if (announcementForm.image) {
            announcementData.append('image', announcementForm.image);
          }

          const announcementResponse = await fetch(`${apiBase}/dashboard/announcements`, {
            method: 'POST',
            headers: {
              Authorization: headers.Authorization,
            },
            body: announcementData,
          });
          if (announcementResponse.ok) {
            alert('Announcement created successfully!');
            handleModalClose();
            // Refresh dashboard data
            window.location.reload();
          } else {
            const error = await announcementResponse.json();
            alert(error.error || 'Failed to create announcement');
          }
          break;

        case 'official':
          // Create or update official with image upload
          const formData = new FormData();
          formData.append('name', officialForm.name);
          formData.append('position', officialForm.position);
          formData.append('contact_number', officialForm.contact_number || '');
          formData.append('email', officialForm.email || '');
          if (officialForm.image) {
            formData.append('image', officialForm.image);
          }

          const method = editingOfficial ? 'PUT' : 'POST';
          const url = editingOfficial 
            ? `${apiBase}/dashboard/officials/${editingOfficial.official_id || editingOfficial.id}`
            : `${apiBase}/dashboard/officials`;

          const officialResponse = await fetch(url, {
            method,
            headers: {
              Authorization: `Bearer ${token}`,
              // Don't set Content-Type for FormData - browser will set it with boundary
            },
            body: formData,
          });
          if (officialResponse.ok) {
            alert(editingOfficial ? 'Official updated successfully!' : 'Official added successfully!');
            handleModalClose();
            setEditingOfficial(null);
            // Refresh dashboard data
            window.location.reload();
          } else {
            const error = await officialResponse.json();
            alert(error.error || (editingOfficial ? 'Failed to update official' : 'Failed to add official'));
          }
          break;

        case 'report':
          // Navigate to reports page
          navigate('/reports');
          handleModalClose();
          break;

        default:
          handleModalClose();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
    }
  };

  // Render modal content based on selected action
  const renderModalContent = () => {
    if (!selectedAction) return null;

    switch (selectedAction.type) {
      case 'resident':
        return (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Go to Residents Management page where you can add a new resident?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click "GO" to navigate to Residents page.
            </Typography>
          </Box>
        );

      case 'certificate':
        return (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Go to Certificates page where you can issue a new certificate?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click "GO" to navigate to the Transactions/Certificates page.
            </Typography>
          </Box>
        );

      case 'event':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Event Name"
              fullWidth
              required
              value={eventForm.event_name}
              onChange={(e) => setEventForm({ ...eventForm, event_name: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={eventForm.event_description}
              onChange={(e) => setEventForm({ ...eventForm, event_description: e.target.value })}
            />
            <TextField
              label="Event Date"
              type="date"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              value={eventForm.event_date}
              onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
            />
            <TextField
              label="Event Time"
              type="time"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={eventForm.event_time}
              onChange={(e) => setEventForm({ ...eventForm, event_time: e.target.value })}
            />
            <TextField
              label="Location"
              fullWidth
              value={eventForm.event_location}
              onChange={(e) => setEventForm({ ...eventForm, event_location: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Event Type</InputLabel>
              <Select
                value={eventForm.event_type}
                label="Event Type"
                onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })}
              >
                <MenuItem value="Community">Community</MenuItem>
                <MenuItem value="Meeting">Meeting</MenuItem>
                <MenuItem value="Health">Health</MenuItem>
                <MenuItem value="Education">Education</MenuItem>
                <MenuItem value="Sports">Sports</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );

      case 'announcement':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              fullWidth
              required
              value={announcementForm.title}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
            />
            <TextField
              label="Content"
              fullWidth
              multiline
              rows={4}
              required
              value={announcementForm.content}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={announcementForm.announcement_type}
                label="Type"
                onChange={(e) => setAnnouncementForm({ ...announcementForm, announcement_type: e.target.value })}
              >
                <MenuItem value="Notice">Notice</MenuItem>
                <MenuItem value="Event">Event</MenuItem>
                <MenuItem value="Health">Health</MenuItem>
                <MenuItem value="Meeting">Meeting</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Expiry Date (Optional)"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={announcementForm.expiry_date}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, expiry_date: e.target.value })}
            />
          </Box>
        );

      case 'official':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Full Name"
              fullWidth
              required
              value={officialForm.name}
              onChange={(e) => setOfficialForm({ ...officialForm, name: e.target.value })}
            />
            <TextField
              label="Position"
              fullWidth
              required
              value={officialForm.position}
              onChange={(e) => setOfficialForm({ ...officialForm, position: e.target.value })}
            />
            <TextField
              label="Contact Number"
              fullWidth
              value={officialForm.contact_number}
              onChange={(e) => setOfficialForm({ ...officialForm, contact_number: e.target.value })}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={officialForm.email}
              onChange={(e) => setOfficialForm({ ...officialForm, email: e.target.value })}
            />
            
            {/* Image Upload */}
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Official Photo (Optional)
              </Typography>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="official-image-upload"
                type="file"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setOfficialForm({
                        ...officialForm,
                        image: file,
                        imagePreview: reader.result,
                      });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <label htmlFor="official-image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  sx={{
                    borderColor: '#41644A',
                    color: '#41644A',
                    '&:hover': {
                      borderColor: '#41644A',
                      backgroundColor: alpha('#41644A', 0.04),
                    },
                  }}
                >
                  {officialForm.imagePreview ? 'Change Image' : 'Upload Image'}
                </Button>
              </label>
              {officialForm.imagePreview && (
                <Box
                  sx={{
                    mt: 2,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <Avatar
                    src={officialForm.imagePreview}
                    sx={{
                      width: 120,
                      height: 120,
                      border: '3px solid #41644A',
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        );

      case 'report':
        return (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Go to Reports page where you can generate various reports?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click "GO" to navigate to the Reports page.
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = getToken();
        if (!token) {
          console.error('No authentication token');
          setLoading(false);
          return;
        }

        const headers = getAuthHeaders();

        // Fetch all dashboard data in parallel
        const [statsRes, announcementsRes, settingsRes, eventsRes, activitiesRes, officialsRes] = await Promise.all([
          fetch(`${apiBase}/dashboard/stats`, { headers }),
          fetch(`${apiBase}/dashboard/announcements`, { headers }),
          fetch(`${apiBase}/dashboard/settings`, { headers }),
          fetch(`${apiBase}/dashboard/events`, { headers }),
          fetch(`${apiBase}/dashboard/recent-activities`, { headers }),
          fetch(`${apiBase}/dashboard/officials`, { headers }),
        ]);

        // Parse responses
        const statsData = await statsRes.json();
        const announcementsData = await announcementsRes.json();
        const settingsData = await settingsRes.json();
        const eventsData = await eventsRes.json();
        const activitiesData = await activitiesRes.json();
        const officialsData = await officialsRes.json();

        // Update state
        setStats(statsData);
        setAnnouncements(announcementsData);
        setDemographics(statsData.demographics || demographics);

        // Parse mission & vision from content (assuming it's stored as JSON or separated)
        if (settingsData.missionVision?.content) {
          try {
            const mvContent = JSON.parse(settingsData.missionVision.content);
            setMissionVision(mvContent);
          } catch {
            // If not JSON, treat as plain text
            const lines = settingsData.missionVision.content.split('\n');
            setMissionVision({
              mission: lines[0] || missionVision.mission,
              vision: lines[1] || missionVision.vision,
            });
          }
        }

        // Parse about content
        if (settingsData.about?.content) {
          try {
            const aboutContent = JSON.parse(settingsData.about.content);
            setAbout({
              ...about,
              description: aboutContent.description || about.description,
              history: aboutContent.history || about.history,
              images: Array.isArray(aboutContent.images) ? aboutContent.images : [],
            });
          } catch (error) {
            console.error('Error parsing about content:', error);
            setAbout({
              ...about,
              description: settingsData.about.content || about.description,
              images: [],
            });
          }
        } else {
          // Ensure images array exists even if no content
          setAbout(prev => ({
            ...prev,
            images: prev.images || [],
          }));
        }

        // Update officials
        if (officialsData && officialsData.length > 0) {
          setAbout(prev => ({ ...prev, officials: officialsData }));
        }

        // Format events
        const formattedEvents = eventsData.map(event => ({
          id: event.event_id,
          title: event.event_name || event.title,
          date: new Date(event.event_date || event.date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }),
          time: event.event_time || event.time || 'All Day',
          type: event.event_type || event.type || 'Event',
        }));
        setUpcomingEvents(formattedEvents);

        // Format recent activities
        const formattedActivities = activitiesData.map((activity, index) => ({
          id: activity.id || index + 1,
          action: activity.action || 'Activity',
          detail: activity.detail || 'No details',
          time: formatTimeAgo(activity.time),
          icon: <AssignmentIcon />,
          color: index % 2 === 0 ? '#41644A' : '#0D4715',
        }));
        setRecentActivities(formattedActivities);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const notifications = [
    {
      id: 1,
      title: 'Certificate Request',
      message: `${stats.pendingRequests} pending certificate requests`,
      time: 'Just now',
      type: 'request',
    },
    {
      id: 2,
      title: 'New Resident',
      message: 'New resident registrations available',
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
      message: 'Upcoming events scheduled',
      time: '5 hours ago',
      type: 'reminder',
    },
  ];

  const demographicStats = [
    {
      label: 'Senior Citizens',
      value: demographics.seniorCitizens.count,
      icon: <PersonIcon />,
      color1: '#41644A',
      color2: '#0D4715',
    },
    {
      label: 'Solo Parents',
      value: demographics.soloParents.count,
      icon: <PeopleIcon />,
      color1: '#E9762B',
      color2: '#d4681f',
    },
    {
      label: 'PWD',
      value: demographics.personsWithDisability.count,
      icon: <AccessibilityNewIcon />,
      color1: '#41644A',
      color2: '#0D4715',
    },
    {
      label: 'Youth',
      value: demographics.youth.count,
      icon: <GroupsIcon />,
      color1: '#E9762B',
      color2: '#d4681f',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setDemoStep((prev) => (prev + 1) % demographicStats.length);
    }, 4000);

    return () => clearInterval(interval);
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

  const [calendarEvents, setCalendarEvents] = useState([]);

  // Fetch calendar events
  useEffect(() => {
    const fetchCalendarEvents = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const month = currentMonth.getMonth() + 1;
        const year = currentMonth.getFullYear();
        const headers = getAuthHeaders();

        const response = await fetch(`${apiBase}/dashboard/calendar-events?month=${month}&year=${year}`, { headers });
        const data = await response.json();

        setCalendarEvents(data);
      } catch (error) {
        console.error('Error fetching calendar events:', error);
      }
    };

    fetchCalendarEvents();
  }, [currentMonth]);

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

    // Get event days for current month
    const eventDays = calendarEvents.map(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate();
    });

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
      const hasEvent = eventDays.includes(day);
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
          // Enhanced shadow with a hint of your brand color for depth
          boxShadow: '0 4px 20px rgba(65, 100, 74, 0.15)',
          zIndex: 100,
          position: 'sticky',
          top: 0,
          // Added a subtle bottom border for a crisp finish
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            // Increased Padding: px (horizontal) and py (vertical)
            px: { xs: 3, md: 4 }, // Responsive padding
            py: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                backgroundColor: '#41644A',
                // Added a border to separate the avatar from the background
                border: '3px solid #F1F8E9',
                boxShadow: '0 2px 8px rgba(65, 100, 74, 0.2)',
              }}
            >
              <PersonIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: '#1B5E20', // Darker green for better contrast
                  letterSpacing: '-0.5px', // Tighter tracking for a modern look
                  lineHeight: 1.2,
                }}
              >
                Welcome back, {user?.name || 'User'}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#558B2F', // Slightly muted green for subtext
                  fontWeight: 500,
                  mt: 0.5,
                }}
              >
                Barangay 145 Management System
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 2, overflow: 'auto' }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
          </Box>
        )}
        {!loading && activeTab === 0 && (
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
              <Grid item xs={1} sx={{ display: 'flex', gap: 2 }}>
                {/* Card 1: Residents */}
                <Grid item xs={1} sx={{ display: 'flex' }}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                      overflow: 'hidden',
                      height: '100%',
                      width: '100%',
                      transition: 'transform 0.4s ease, box-shadow 0.4s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        // Orange Glow Effect
                        boxShadow: '0 15px 30px rgba(233, 118, 43, 0.4)',
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

                {/* Card 2: Certificates */}
                <Grid item xs={1} sx={{ display: 'flex' }}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                      overflow: 'hidden',
                      height: '100%',
                      width: '100%',
                      transition: 'transform 0.4s ease, box-shadow 0.4s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 15px 30px rgba(233, 118, 43, 0.4)',
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
                        sx={{ color: '#41644A', mr: 1, fontSize: '1rem' }}
                      />
                      <Typography variant="body2" color="#41644A">
                        12% increase from last month
                      </Typography>
                    </Box>
                  </Card>
                </Grid>

                {/* Card 3: Households */}
                <Grid item xs={1} sx={{ display: 'flex' }}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                      overflow: 'hidden',
                      height: '100%',
                      width: '100%',
                      transition: 'transform 0.4s ease, box-shadow 0.4s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 15px 30px rgba(233, 118, 43, 0.4)',
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

                {/* Card 4: Health Checkups */}
                <Grid item xs={1} sx={{ display: 'flex' }}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                      overflow: 'hidden',
                      height: '100%',
                      width: '100%',
                      transition: 'transform 0.4s ease, box-shadow 0.4s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 15px 30px rgba(233, 118, 43, 0.4)',
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
                        sx={{ color: '#41644A', mr: 1, fontSize: '1rem' }}
                      />
                      <Typography variant="body2" color="#41644A">
                        8% increase from last month
                      </Typography>
                    </Box>
                  </Card>
                </Grid>

                {/* Card 5: Demographic */}
                <Grid item xs={1} sx={{ display: 'flex' }}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                      overflow: 'hidden',
                      height: '100%',
                      width: '100%',
                      transition: 'transform 0.4s ease, box-shadow 0.4s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 15px 30px rgba(233, 118, 43, 0.4)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        background:
                          'linear-gradient(135deg, #41644A 0%, #0D4715 100%)',
                        color: '#fff',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="h4" fontWeight="bold">
                          {demographicStats[demoStep].value}
                        </Typography>
                        <Avatar
                          sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                        >
                          {demographicStats[demoStep].icon}
                        </Avatar>
                      </Box>

                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {demographicStats[demoStep].label}
                      </Typography>
                    </Box>

                    <Box sx={{ p: 2, pr: 6.4, display: 'flex', alignItems: 'center' }}>
                      <Typography
                        variant="body2"
                        sx={{ color: '#41644A'}}
                      >
                        Community Category
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              </Grid>

              {/* Carousel for Announcements and About/Mission/Vision */}
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: '0 10px 25px rgba(233, 118, 43, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '600px',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    p: 3,
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexShrink: 0,
                    // 1. Added Gradient Background
                    background:
                      'linear-gradient(135deg, #41644A 0%, #0D4715 100%)',
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      color: '#FFFFFF',
                      fontSize: '1.25rem',
                    }}
                  >
                    {activeStep === 0
                      ? 'Announcements'
                      : activeStep === 1
                      ? 'Mission & Vision'
                      : 'About Barangay 145'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                    <IconButton
                      size="small"
                      onClick={handleBack}
                      sx={{
                        color: '#FFFFFF',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        },
                      }}
                    >
                      <KeyboardArrowLeft />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={handleNext}
                      sx={{
                        color: '#FFFFFF',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
                          {announcements.length > 0 ? announcements.map((announcement) => (
                            <ListItem
                              key={announcement.announcement_id || announcement.id}
                              sx={{
                                mb: 0.75,
                                p: 1.25,
                                borderRadius: 1.5,
                                backgroundColor: 'rgba(65, 100, 74, 0.05)',
                                '&:last-child': { mb: 0 },
                                
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 40 }}>
                                <Avatar sx={{ backgroundColor: '#41644A', margin: 2 }}>
                                  <AnnouncementIcon />
                                </Avatar>
                              </ListItemIcon>
                              <ListItemText
                                primary={announcement.title || announcement.announcement_title}
                                secondary={
                                  <Box>
                                    <Typography
                                      variant="body2"
                                      color="#41644A"
                                      sx={{ mb: 1.5, pr: 2, textAlign: 'left' }}
                                    >
                                      {announcement.content || announcement.announcement_content || 'No content'}
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: 1,
                                        flexWrap: 'wrap',
                                        mt: 1,
                                      }}
                                    >
                                      <Chip
                                        label={announcement.type || announcement.announcement_type || 'Notice'}
                                        size="small"
                                        sx={{
                                          backgroundColor: '#E9762B',
                                          color: '#FFFFFF',
                                          fontSize: '0.7rem',
                                        }}
                                      />
                                      <Typography
                                        variant="caption"
                                        color="#0D4715"
                                        sx={{ 
                                          fontWeight: 500,
                                          ml: 'auto',
                                          flexShrink: 0,
                                        }}
                                      >
                                        {announcement.date_posted ? new Date(announcement.date_posted).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric',
                                        }) : announcement.date || 'Unknown date'}
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
                          )) : (
                            <ListItem>
                              <ListItemText
                                primary="No announcements available"
                                primaryTypographyProps={{
                                  color: 'text.secondary',
                                  fontStyle: 'italic',
                                }}
                              />
                            </ListItem>
                          )}
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
                        {/* SINGLE BOX SPLIT INTO 2 */}
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'row', // 🔴 THIS IS THE KEY
                            height: '100%',
                            borderRadius: 2,
                            overflow: 'hidden',
                            backgroundColor: 'rgba(65, 100, 74, 0.05)',
                          }}
                        >
                          {/* LEFT — MISSION */}
                          <Box
                            sx={{
                              flex: 1, // 50%
                              p: 2,
                              borderRight: '1px solid rgba(0,0,0,0.08)',
                              display: 'flex',
                              flexDirection: 'column',
                            }}
                          >
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 'bold',
                                color: '#0D4715',
                                mb: 1,
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
                                <DescriptionIcon />
                              </Avatar>
                              Mission
                            </Typography>

                            <Typography
                              variant="body1"
                              sx={{ 
                                color: '#41644A', 
                                lineHeight: 1.6,
                                fontSize: '1.25rem',
                                fontWeight: 500,
                              }}
                            >
                              {missionVision.mission}
                            </Typography>
                          </Box>

                          {/* RIGHT — VISION */}
                          <Box
                            sx={{
                              flex: 1, // 50%
                              p: 2,
                              display: 'flex',
                              flexDirection: 'column',
                              backgroundColor: 'rgba(233, 118, 43, 0.05)',
                            }}
                          >
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 'bold',
                                color: '#0D4715',
                                mb: 1,
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
                                <InfoIcon />
                              </Avatar>
                              Vision
                            </Typography>

                            <Typography
                              variant="body1"
                              sx={{ 
                                color: '#41644A', 
                                lineHeight: 1.6,
                                fontSize: '1.25rem',
                                fontWeight: 500,
                              }}
                            >
                              {missionVision.vision}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* About Slide */}
                      <Box sx={{ minWidth: '100%', px: 0.5, height: '100%', overflow: 'auto' }}>
                        {/* SINGLE BOX SPLIT INTO 2 */}
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'row', // 🔴 THIS IS THE KEY
                            height: '100%',
                            borderRadius: 2,
                            overflow: 'hidden',
                            backgroundColor: 'rgba(65, 100, 74, 0.05)',
                          }}
                        >
                          {/* LEFT — ABOUT */}
                          <Box
                            sx={{
                              flex: 1, // 50%
                              p: 2,
                              borderRight: '1px solid rgba(0,0,0,0.08)',
                              display: 'flex',
                              flexDirection: 'column',
                              overflow: 'hidden',
                              // Map-like background styling
                              backgroundImage: `
                                linear-gradient(90deg, rgba(65, 100, 74, 0.03) 1px, transparent 1px),
                                linear-gradient(rgba(65, 100, 74, 0.03) 1px, transparent 1px)
                              `,
                              backgroundSize: '20px 20px',
                              backgroundColor: 'rgba(65, 100, 74, 0.02)',
                              position: 'relative',
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'radial-gradient(circle at 30% 40%, rgba(233, 118, 43, 0.05) 0%, transparent 50%)',
                                pointerEvents: 'none',
                              },
                            }}
                          >
                            <Typography
                              variant="h4"
                              sx={{
                                fontFamily: '"Roboto", "Arial", sans-serif',
                                fontWeight: 700,
                                fontSize: '1.75rem',
                                color: '#0D4715',
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                position: 'relative',
                                zIndex: 1,
                              }}
                            >
                              <Avatar
                                sx={{
                                  width: 40,
                                  height: 40,
                                  mr: 1.5,
                                  backgroundColor: '#41644A',
                                }}
                              >
                                <LocationIcon />
                              </Avatar>
                              About Barangay 145
                            </Typography>

                            <Box
                              sx={{
                                flex: 1,
                                overflowY: 'auto',
                                overflowX: 'hidden',
                                pr: 1,
                                position: 'relative',
                                zIndex: 1,
                                // Custom Scrollbar Styling
                                '&::-webkit-scrollbar': { width: 6 },
                                '&::-webkit-scrollbar-track': {
                                  backgroundColor: 'rgba(0,0,0,0.05)',
                                  borderRadius: 10,
                                },
                                '&::-webkit-scrollbar-thumb': {
                                  backgroundColor: '#41644A',
                                  borderRadius: 10,
                                },
                                '&::-webkit-scrollbar-thumb:hover': {
                                  backgroundColor: '#0D4715',
                                },
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ color: '#41644A', lineHeight: 1.6, mb: 2 }}
                              >
                                {about.description}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: '#41644A', lineHeight: 1.6, mb: 2 }}
                              >
                                {about.history}
                              </Typography>

                              {/* Image Carousel */}
                              {about.images && Array.isArray(about.images) && about.images.length > 0 && (
                                <Box sx={{ mt: 2, mb: 2 }}>
                                  <Box
                                    sx={{
                                      position: 'relative',
                                      width: '100%',
                                      height: '200px',
                                      borderRadius: 2,
                                      overflow: 'hidden',
                                      border: '2px solid rgba(65, 100, 74, 0.2)',
                                      backgroundColor: '#f5f5f5',
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        transition: 'transform 0.5s ease-in-out',
                                        transform: `translateX(-${aboutImageIndex * 100}%)`,
                                        height: '100%',
                                        width: `${about.images.length * 100}%`,
                                      }}
                                    >
                                      {about.images.map((image, idx) => {
                                        // Use EXACT same logic as Barangay Officials
                                        const imageUrl = image
                                          ? image.startsWith('http')
                                            ? image
                                            : `${apiBase}${image}`
                                          : null;
                                        
                                        return (
                                          <Box
                                            key={`about-img-${idx}`}
                                            sx={{
                                              minWidth: `${100 / about.images.length}%`,
                                              width: `${100 / about.images.length}%`,
                                              height: '100%',
                                              position: 'relative',
                                              flexShrink: 0,
                                            }}
                                          >
                                            <img
                                              src={imageUrl || ''}
                                              alt={`About Barangay 145 - Image ${idx + 1}`}
                                              style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                objectPosition: 'center',
                                                display: 'block',
                                              }}
                                              onError={(e) => {
                                                console.error('Image failed to load:', imageUrl, 'Original path:', image);
                                                e.target.style.display = 'none';
                                              }}
                                            />
                                            <IconButton
                                              onClick={async (e) => {
                                                e.stopPropagation();
                                                if (window.confirm('Are you sure you want to delete this image?')) {
                                                  try {
                                                    const token = getToken();
                                                    if (!token) {
                                                      alert('Please login to delete images');
                                                      return;
                                                    }
                                                    const response = await fetch(`${apiBase}/dashboard/about/images`, {
                                                      method: 'DELETE',
                                                      headers: {
                                                        'Authorization': `Bearer ${token}`,
                                                        'Content-Type': 'application/json',
                                                      },
                                                      body: JSON.stringify({ image_path: image }),
                                                    });
                                                    if (response.ok) {
                                                      const data = await response.json();
                                                      const newImages = about.images.filter((img) => img !== image);
                                                      setAbout(prev => ({
                                                        ...prev,
                                                        images: newImages,
                                                      }));
                                                      // Reset carousel index if needed
                                                      if (aboutImageIndex >= newImages.length && newImages.length > 0) {
                                                        setAboutImageIndex(newImages.length - 1);
                                                      } else if (newImages.length === 0) {
                                                        setAboutImageIndex(0);
                                                      }
                                                      alert('Image deleted successfully!');
                                                    } else {
                                                      const error = await response.json();
                                                      alert(error.error || 'Failed to delete image');
                                                    }
                                                  } catch (error) {
                                                    console.error('Error deleting image:', error);
                                                    alert('Error deleting image. Please try again.');
                                                  }
                                                }
                                              }}
                                              sx={{
                                                position: 'absolute',
                                                bottom: 8,
                                                right: 8,
                                                backgroundColor: 'rgba(255, 0, 0, 0.8)',
                                                color: 'white',
                                                '&:hover': { 
                                                  backgroundColor: 'rgba(255, 0, 0, 1)',
                                                },
                                                width: 32,
                                                height: 32,
                                              }}
                                            >
                                              <DeleteIcon />
                                            </IconButton>
                                          </Box>
                                        );
                                      })}
                                    </Box>
                                    {about.images.length > 1 && (
                                      <>
                                        <IconButton
                                          onClick={() => setAboutImageIndex((prev) => (prev === 0 ? about.images.length - 1 : prev - 1))}
                                          sx={{
                                            position: 'absolute',
                                            left: 8,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
                                          }}
                                        >
                                          <KeyboardArrowLeft />
                                        </IconButton>
                                        <IconButton
                                          onClick={() => setAboutImageIndex((prev) => (prev === about.images.length - 1 ? 0 : prev + 1))}
                                          sx={{
                                            position: 'absolute',
                                            right: 8,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
                                          }}
                                        >
                                          <KeyboardArrowRight />
                                        </IconButton>
                                        <Box
                                          sx={{
                                            position: 'absolute',
                                            bottom: 8,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            display: 'flex',
                                            gap: 0.5,
                                          }}
                                        >
                                          {about.images.map((_, idx) => (
                                            <Box
                                              key={idx}
                                              sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                backgroundColor: idx === aboutImageIndex ? '#41644A' : 'rgba(255, 255, 255, 0.5)',
                                              }}
                                            />
                                          ))}
                                        </Box>
                                      </>
                                    )}
                                  </Box>
                                </Box>
                              )}

                            </Box>
                          </Box>

                          {/* RIGHT — BARANGAY OFFICIALS */}
                          <Box
                            sx={{
                              flex: 1, // 50%
                              p: 2,
                              display: 'flex',
                              flexDirection: 'column',
                              backgroundColor: 'rgba(233, 118, 43, 0.05)',
                              overflow: 'hidden',
                            }}
                          >
                            <Typography
                              variant="h4"
                              sx={{
                                fontFamily: '"Roboto", "Arial", sans-serif',
                                fontWeight: 700,
                                fontSize: '1.75rem',
                                color: '#0D4715',
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                position: 'relative',
                                zIndex: 1,
                              }}
                            >
                              <Avatar
                                sx={{
                                  width: 40,
                                  height: 40,
                                  mr: 1.5,
                                  backgroundColor: '#E9762B',
                                }}
                              >
                                <PeopleIcon />
                              </Avatar>
                              Barangay Officials
                            </Typography>

                            {/* 3x3 Grid Scroll Container */}
                            <Box
                              sx={{
                                flex: 1,
                                minHeight: 0,
                                minWidth: 0,
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: 1.5,
                                overflowY: 'auto',
                                overflowX: 'hidden',
                                pr: 1,
                                // Custom Scrollbar Styling
                                '&::-webkit-scrollbar': { width: 6 },
                                '&::-webkit-scrollbar-track': {
                                  backgroundColor: 'rgba(0,0,0,0.05)',
                                  borderRadius: 10,
                                },
                                '&::-webkit-scrollbar-thumb': {
                                  backgroundColor: '#E9762B',
                                  borderRadius: 10,
                                },
                                '&::-webkit-scrollbar-thumb:hover': {
                                  backgroundColor: '#d6681f',
                                },
                              }}
                            >
                              {about.officials.map((official, index) => (
                                <Box
                                  key={official.official_id || index}
                                  sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    p: 1.5,
                                    borderRadius: 2,
                                    backgroundColor: 'rgba(255,255,255, 0.4)',
                                    border:
                                      '1px solid rgba(233, 118, 43, 0.2)',
                                  }}
                                >
                                  <Avatar
                                    src={
                                      official.image_path
                                        ? official.image_path.startsWith('http')
                                          ? official.image_path
                                          : `${apiBase}${official.image_path}`
                                        : official.image
                                          ? `${apiBase}${official.image}`
                                          : null
                                    }
                                    sx={{
                                      width: 60,
                                      height: 60,
                                      mb: 1,
                                      bgcolor: '#E9762B',
                                      color: 'white',
                                      border: '2px solid rgba(233, 118, 43, 0.3)',
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                      fontSize: '1.2rem',
                                    }}
                                  >
                                    {!official.image_path && !official.image && official.name.charAt(0)}
                                  </Avatar>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 'bold',
                                      color: '#0D4715',
                                      fontSize: '0.85rem',
                                      mb: 0.25,
                                    }}
                                  >
                                    {official.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: '#41644A',
                                      fontSize: '0.75rem',
                                      fontWeight: 500,
                                    }}
                                  >
                                    {official.position}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        </Box>
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

              {/* Recent Activities */}
              <Card
                sx={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 3,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column', // Ensures the footer sits at the bottom
                  height: '280px',
                  mt: 'auto',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  mb: 2, // Added margin bottom to ensure shadow isn't clipped
                  '&:active': {
                    boxShadow: '0 8px 24px rgba(255, 140, 0, 0.4)',
                    transform: 'scale(0.99)',
                  },
                }}
              >
                <Box
                  sx={{
                    p: 2.5,
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    flexShrink: 0,
                    background:
                      'linear-gradient(135deg, #41644A 0%, #0D4715 100%)',
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: '700',
                      color: '#ffffff',
                      fontSize: '1.1rem',
                    }}
                  >
                    Recent Activities
                  </Typography>
                </Box>

                {/* Scrollable Content Area */}
                <Box
                  sx={{
                    p: 2,
                    flex: 1, // Takes up remaining space
                    overflow: 'auto',
                    minHeight: 0, // Critical for flex scrolling
                    '&::-webkit-scrollbar': { width: '6px' },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: '#E0E0E0',
                      borderRadius: '10px',
                    },
                  }}
                >
                  <List>
                    {recentActivities.map((activity) => (
                      <ListItem
                        key={activity.id}
                        sx={{
                          px: 0,
                          py: 1.5,
                          borderBottom: '1px dashed rgba(0,0,0,0.05)',
                          '&:last-child': { borderBottom: 'none' },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              backgroundColor: activity.color,
                              fontSize: '1rem',
                              mr: 2,
                            }}
                          >
                            {activity.icon}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.action}
                          secondary={
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ color: '#37474F', fontWeight: 500 }}
                              >
                                {activity.detail}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: '#78909C',
                                  display: 'block',
                                  mt: 0.3,
                                }}
                              >
                                {activity.time}
                              </Typography>
                            </Box>
                          }
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontWeight: 'bold',
                            color: '#1B5E20',
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
                <Box
                  sx={{
                    p: 2,
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    background:
                      'linear-gradient(135deg, #41644A 0%, #0D4715 100%)',
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 'bold', color: '#ffffff' }}
                  >
                    Quick Actions
                  </Typography>
                </Box>
                <Box sx={{ p: 2.2 }}>
                  <Grid container spacing={2} justifyContent="center">
                    {quickActions.map((action) => (
                      <Grid item xs={12} sm={6} md={6} key={action.id}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => handleQuickActionClick(action)}
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
                  height: '370px', // Fixed height to match layout
                  display: 'flex',
                  flexDirection: 'column',
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
                    background:
                      'linear-gradient(135deg, #41644A 0%, #0D4715 100%)',
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 'bold', color: '#ffffff' }}
                  >
                    Upcoming Events
                  </Typography>
                </Box>
                <Box sx={{ p: 2, flex: 1, overflow: 'auto', minHeight: 0 }}>
                  <List dense sx={{ p: 0 }}>
                    {upcomingEvents.length > 0 ? upcomingEvents.map((event) => (
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
                    )) : (
                      <ListItem>
                        <ListItemText
                          primary="No upcoming events"
                          primaryTypographyProps={{
                            color: 'text.secondary',
                            fontStyle: 'italic',
                            sx: { fontSize: '0.75rem' },
                          }}
                        />
                      </ListItem>
                    )}
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
                      <Card sx={{ p: 2, textAlign: 'center', }}>
                        <AssessmentIcon
                          sx={{ fontSize: 48, color: '#41644A', mb: 1,  }}
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

      {/* Quick Actions Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleModalClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: selectedAction
              ? `linear-gradient(135deg, ${selectedAction.color} 0%, ${alpha(selectedAction.color, 0.8)} 100%)`
              : 'linear-gradient(135deg, #41644A 0%, #0D4715 100%)',
            color: '#FFFFFF',
            pb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedAction?.icon && (
              <Avatar
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  width: 32,
                  height: 32,
                }}
              >
                {selectedAction.icon}
              </Avatar>
            )}
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {editingOfficial && selectedAction?.type === 'official' 
                ? 'Edit Official' 
                : selectedAction?.title || 'Quick Action'}
            </Typography>
          </Box>
          <IconButton
            onClick={handleModalClose}
            sx={{
              color: '#FFFFFF',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          {selectedAction && (
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3, fontStyle: 'italic' }}
              >
                {selectedAction.description}
              </Typography>
              {renderModalContent()}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={handleModalClose}
            variant="outlined"
            sx={{
              borderColor: '#41644A',
              color: '#41644A',
              '&:hover': {
                borderColor: '#41644A',
                backgroundColor: alpha('#41644A', 0.04),
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleFormSubmit}
            variant="contained"
            sx={{
              backgroundColor: selectedAction?.color || '#41644A',
              '&:hover': {
                backgroundColor: selectedAction
                  ? alpha(selectedAction.color, 0.8)
                  : alpha('#41644A', 0.8),
              },
            }}
            disabled={
              (selectedAction?.type === 'event' && !eventForm.event_name) ||
              (selectedAction?.type === 'announcement' && (!announcementForm.title || !announcementForm.content)) ||
              (selectedAction?.type === 'official' && (!officialForm.name || !officialForm.position))
            }
          >
            {selectedAction?.type === 'resident' ||
            selectedAction?.type === 'certificate' ||
            selectedAction?.type === 'report'
              ? 'Go'
              : editingOfficial && selectedAction?.type === 'official'
              ? 'Update'
              : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BarangayDashboard;

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Box,
  Card,
  CardContent,
  CardHeader,
  InputAdornment,
  IconButton,
  Chip,
  Stack,
  Modal,
  Avatar,
  Fab,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  CardActions,
  Badge,
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as FileTextIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  Favorite as HeartIcon,
  CalendarToday as CalendarIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Add as AddIcon,
} from '@mui/icons-material';

export default function Residents() {
  const apiBase = 'http://localhost:5000';
  const { getToken } = useAuth();

  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCivilStatus, setFilterCivilStatus] = useState('all');
  const [filterHasContact, setFilterHasContact] = useState('all');

  const [formData, setFormData] = useState({
    full_name: '',
    address: '',
    provincial_address: '',
    dob: '',
    age: '',
    civil_status: 'Single',
    contact_no: '',
    created_at: new Date().toISOString().split('T')[0],
  });

  const civilStatusOptions = [
    'Single',
    'Married',
    'Widowed',
    'Divorced',
    'Separated',
  ];

  // Helper to include auth headers
  const getAuthHeaders = () => {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
    try {
      const res = await fetch(`${apiBase}/residents`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      setRecords(
        Array.isArray(data)
          ? data.map((r) => ({
              resident_id: r.resident_id,
              full_name: r.full_name,
              address: r.address,
              provincial_address: r.provincial_address,
              dob: r.dob?.slice(0, 10) || '',
              age: String(r.age ?? ''),
              civil_status: r.civil_status,
              contact_no: r.contact_no || '',
              created_at: r.created_at?.slice(0, 10) || '',
            }))
          : []
      );
    } catch (e) {
      console.error(e);
    }
  }

  function handleDobChange(dob) {
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      const age = Math.floor(
        (today - birthDate) / (365.25 * 24 * 60 * 60 * 1000)
      );
      setFormData({ ...formData, dob, age: String(age) });
    } else {
      setFormData({ ...formData, dob: '', age: '' });
    }
  }

  function toServerPayload(data) {
    return {
      full_name: data.full_name.trim(),
      address: data.address.trim(),
      provincial_address: data.provincial_address.trim(),
      dob: data.dob || null,
      age: data.age ? Number(data.age) : null,
      civil_status: data.civil_status,
      contact_no: data.contact_no.trim() || null,
      created_at: data.created_at || new Date().toISOString().split('T')[0],
    };
  }

  function validateForm() {
    const requiredFields = ['full_name', 'address', 'dob', 'civil_status'];
    for (let field of requiredFields) {
      if (!formData[field].trim()) {
        alert('Please fill all required fields.');
        return false;
      }
    }

    // Check for duplicate resident
    const isDuplicate = records.some(
      (r) =>
        r.full_name.trim().toLowerCase() ===
          formData.full_name.trim().toLowerCase() &&
        r.dob === formData.dob &&
        r.resident_id !== editingId
    );

    if (isDuplicate) {
      alert('Resident already exists (same name and date of birth).');
      return false;
    }

    return true;
  }

  async function handleCreate() {
    if (!validateForm()) return;
    try {
      const res = await fetch(`${apiBase}/residents`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(toServerPayload(formData)),
      });
      if (!res.ok) throw new Error('Create failed');
      const created = await res.json();
      const newRec = { ...formData, resident_id: created.resident_id };
      setRecords([newRec, ...records]);
      resetForm();
      alert('Resident added successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to create record');
    }
  }

  async function handleUpdate() {
    if (!validateForm()) return;
    try {
      const res = await fetch(`${apiBase}/residents/${editingId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(toServerPayload(formData)),
      });
      if (!res.ok) throw new Error('Update failed');
      const updated = { ...formData, resident_id: editingId };
      setRecords(
        records.map((r) => (r.resident_id === editingId ? updated : r))
      );
      resetForm();
      alert('Resident updated successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to update record');
    }
  }

  function handleEdit(record) {
    setFormData({ ...record });
    setEditingId(record.resident_id);
    setIsModalOpen(true);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this resident?')) return;
    try {
      const res = await fetch(`${apiBase}/residents/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Delete failed');
      setRecords(records.filter((r) => r.resident_id !== id));
      alert('Resident deleted successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to delete resident');
    }
  }

  function resetForm() {
    setFormData({
      full_name: '',
      address: '',
      provincial_address: '',
      dob: '',
      age: '',
      civil_status: 'Single',
      contact_no: '',
      created_at: new Date().toISOString().split('T')[0],
    });
    setEditingId(null);
    setIsModalOpen(false);
  }

  function handleSubmit() {
    if (editingId) handleUpdate();
    else handleCreate();
  }

  const filteredRecords = useMemo(
    () =>
      records.filter((r) => {
        const matchesSearch =
          r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.contact_no || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCivilStatus =
          filterCivilStatus === 'all' ||
          (r.civil_status || '').toLowerCase() === filterCivilStatus.toLowerCase();

        const matchesContact =
          filterHasContact === 'all' ||
          (filterHasContact === 'with' ? !!r.contact_no : !r.contact_no);

        return matchesSearch && matchesCivilStatus && matchesContact;
      }),
    [records, searchTerm, filterCivilStatus, filterHasContact]
  );

  function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function getInitials(name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        bgcolor: 'transparent',
        p: 2,
      }}
    >
      <Container maxWidth="xl">
        {/* Header - mirrored styling */}
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
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  sx={{ lineHeight: 1.2, fontSize: { xs: 24, sm: 28, md: 32 } }}
                >
                  Residents Information
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Manage and monitor resident records and profiles
                </Typography>
              </Box>
            </Box>
            <Badge
              badgeContent={records.length}
              color="secondary"
              sx={{
                '& .MuiBadge-badge': {
                  bgcolor: '#E9762B',
                  color: '#FFFFFF',
                  fontWeight: 700,
                },
              }}
            >
              <Chip
                icon={<PersonIcon />}
                label="Total Residents"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    color: '#FFFFFF',
                  },
                }}
              />
            </Badge>
          </Box>
          <Box
            sx={{
              height: '4px',
              background: 'linear-gradient(90deg, #0D4715 0%, #1a5f2e 50%, #E9762B 100%)',
              width: '100%',
            }}
          />
        </Paper>

        {/* Search and View Controls */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
          }}
        >
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <TextField
                sx={{ flex: 1 }}
                size="small"
                placeholder="Search by name, address, or contact number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'grey.400' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {filteredRecords.length} of {records.length}
                </Typography>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, newMode) => newMode && setViewMode(newMode)}
                  aria-label="view mode"
                  size="small"
                >
                  <ToggleButton value="grid" aria-label="grid view">
                    <ViewModuleIcon fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="list" aria-label="list view">
                    <ViewListIcon fontSize="small" />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Civil Status</InputLabel>
                <Select
                  value={filterCivilStatus}
                  label="Civil Status"
                  onChange={(e) => setFilterCivilStatus(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  {civilStatusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Contact</InputLabel>
                <Select
                  value={filterHasContact}
                  label="Contact"
                  onChange={(e) => setFilterHasContact(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="with">With contact</MenuItem>
                  <MenuItem value="without">Without contact</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack>
        </Paper>

        {/* Records Display */}
        {filteredRecords.length === 0 ? (
          <Paper
            sx={{
              p: 5,
              textAlign: 'center',
              borderRadius: 3,
              bgcolor: 'white',
            }}
          >
            <Typography variant="h6" color="textSecondary">
              {searchTerm ? 'No residents found' : 'No records yet'}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Click the + button to add a new resident
            </Typography>
          </Paper>
        ) : viewMode === 'grid' ? (
          <Grid container spacing={3.5}>
            {filteredRecords.map((record) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={record.resident_id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    p: 1.5,
                    borderRadius: 3,
                    border: '1px solid rgba(13, 71, 21, 0.12)',
                    boxShadow: '0 10px 28px rgba(13, 71, 21, 0.12)',
                    backgroundColor: '#FFFFFF',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 14px 34px rgba(13, 71, 21, 0.18)',
                    },
                  }}
                >
                  <CardHeader
                    avatar={
                      <Avatar
                        sx={{
                          bgcolor: '#0D4715',
                          color: '#F1F0E9',
                          fontWeight: 700,
                        }}
                      >
                        <PersonIcon />
                      </Avatar>
                    }
                    title={record.full_name}
                    subheader={`Age: ${record.age}`}
                    titleTypographyProps={{ fontWeight: 700, color: '#0D4715' }}
                    subheaderTypographyProps={{ color: '#41644A', fontWeight: 500 }}
                  />
                  <Divider />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack spacing={1.25}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          backgroundColor: 'rgba(65, 100, 74, 0.06)',
                          borderRadius: 2,
                          p: 1,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 34,
                            height: 34,
                            bgcolor: '#F1F0E9',
                            color: '#0D4715',
                            fontSize: 18,
                          }}
                        >
                          <HomeIcon fontSize="inherit" />
                        </Avatar>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#0D4715' }}>
                            Address
                          </Typography>
                          <Typography variant="body2">{record.address}</Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: '#F1F0E9',
                            color: '#0D4715',
                            fontSize: 18,
                          }}
                        >
                          <CakeIcon fontSize="inherit" />
                        </Avatar>
                        <Typography variant="body2">
                          {formatDate(record.dob)} ({record.age} years old)
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: '#E9762B22',
                            color: '#E9762B',
                            fontSize: 18,
                          }}
                        >
                          <HeartIcon fontSize="inherit" />
                        </Avatar>
                        <Typography variant="body2">{record.civil_status}</Typography>
                      </Box>

                      {record.contact_no && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: '#F1F0E9',
                              color: '#0D4715',
                              fontSize: 18,
                            }}
                          >
                            <PhoneIcon fontSize="inherit" />
                          </Avatar>
                          <Typography variant="body2">{record.contact_no}</Typography>
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: '#F1F0E9',
                            color: '#0D4715',
                            fontSize: 18,
                          }}
                        >
                          <CalendarIcon fontSize="inherit" />
                        </Avatar>
                        <Typography variant="body2">
                          Added: {formatDate(record.created_at)}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(record)}
                      sx={{ color: '#0D4715' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(record.resident_id)}
                      sx={{ color: '#E9762B' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper
            elevation={3}
            sx={{
              borderRadius: 3,
              border: '1px solid rgba(13, 71, 21, 0.12)',
              boxShadow: '0 10px 28px rgba(13, 71, 21, 0.12)',
              p: 1.5,
            }}
          >
            <List sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              {filteredRecords.map((record) => (
                <ListItem
                  key={record.resident_id}
                  alignItems="flex-start"
                  sx={{
                    border: '1px solid rgba(13, 71, 21, 0.12)',
                    borderRadius: 2,
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 6px 16px rgba(13, 71, 21, 0.08)',
                    p: 1.5,
                    gap: 2,
                    alignItems: 'center',
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: '#0D4715',
                        color: '#F1F0E9',
                        fontWeight: 700,
                      }}
                    >
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#0D4715' }}>
                        {record.full_name}
                      </Typography>
                    }
                    secondary={
                      <Stack spacing={0.9} sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            sx={{
                              width: 30,
                              height: 30,
                              bgcolor: '#F1F0E9',
                              color: '#0D4715',
                              fontSize: 16,
                            }}
                          >
                            <HomeIcon fontSize="inherit" />
                          </Avatar>
                          <Typography variant="body2">{record.address}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            sx={{
                              width: 30,
                              height: 30,
                              bgcolor: '#F1F0E9',
                              color: '#0D4715',
                              fontSize: 16,
                            }}
                          >
                            <CakeIcon fontSize="inherit" />
                          </Avatar>
                          <Typography variant="body2">
                            {formatDate(record.dob)} ({record.age} years old)
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            sx={{
                              width: 30,
                              height: 30,
                              bgcolor: '#E9762B22',
                              color: '#E9762B',
                              fontSize: 16,
                            }}
                          >
                            <HeartIcon fontSize="inherit" />
                          </Avatar>
                          <Typography variant="body2">{record.civil_status}</Typography>
                        </Box>
                        {record.contact_no && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                              sx={{
                                width: 30,
                                height: 30,
                                bgcolor: '#F1F0E9',
                                color: '#0D4715',
                                fontSize: 16,
                              }}
                            >
                              <PhoneIcon fontSize="inherit" />
                            </Avatar>
                            <Typography variant="body2">{record.contact_no}</Typography>
                          </Box>
                        )}
                      </Stack>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                    <IconButton
                      edge="end"
                      onClick={() => handleEdit(record)}
                      sx={{ color: '#0D4715' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(record.resident_id)}
                      sx={{ color: '#E9762B' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 16,
            bgcolor: '#445C3C',
            '&:hover': {
              bgcolor: '#2e3d28',
            },
          }}
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          <AddIcon />
        </Fab>

        {/* Modal for Form */}
        <Modal
          open={isModalOpen}
          onClose={resetForm}
          aria-labelledby="resident-form-modal"
          aria-describedby="form-to-add-or-edit-resident"
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '92%', sm: '75%', md: '55%' },
              maxHeight: '90vh',
              overflow: 'auto',
              bgcolor: '#FDFCF9',
              boxShadow: '0 18px 44px rgba(13, 71, 21, 0.25)',
              borderRadius: 3,
              border: '1px solid rgba(13, 71, 21, 0.12)',
              p: 0,
            }}
          >
            <Box
              sx={{
                p: 3,
                background: 'linear-gradient(180deg, #0D4715 0%, #1a5f2e 40%, #0D2818 100%)',
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                color: '#F1F0E9',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: '#F1F0E9',
                  color: '#0D4715',
                  width: 46,
                  height: 46,
                }}
              >
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {editingId ? 'Edit Resident Record' : 'New Resident Record'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Please fill in the resident details below
                </Typography>
              </Box>
            </Box>

            <Box sx={{ p: { xs: 3, sm: 4 } }}>
              <Stack spacing={2}>
                <TextField
                  label="Full Name *"
                  size="small"
                  fullWidth
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Address *"
                  size="small"
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Date of Birth *"
                      type="date"
                      size="small"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={formData.dob}
                      onChange={(e) => handleDobChange(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CakeIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Age"
                      size="small"
                      fullWidth
                      value={formData.age}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </Grid>
                <TextField
                  label="Provincial Address"
                  size="small"
                  fullWidth
                  value={formData.provincial_address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      provincial_address: e.target.value,
                    })
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Contact Number"
                  size="small"
                  fullWidth
                  value={formData.contact_no}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_no: e.target.value })
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                <FormControl fullWidth size="small">
                  <InputLabel>Civil Status *</InputLabel>
                  <Select
                    value={formData.civil_status}
                    label="Civil Status *"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        civil_status: e.target.value,
                      })
                    }
                    startAdornment={
                      <InputAdornment position="start">
                        <HeartIcon fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    {civilStatusOptions.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    fullWidth
                    sx={{
                      background: 'linear-gradient(135deg, #0D4715 0%, #1a5f2e 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1a5f2e 0%, #0D4715 100%)',
                      },
                    }}
                    onClick={handleSubmit}
                  >
                    {editingId ? 'Update' : 'Save'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CloseIcon />}
                    sx={{
                      color: '#0D4715',
                      borderColor: 'rgba(13, 71, 21, 0.4)',
                      '&:hover': {
                        borderColor: '#0D4715',
                        backgroundColor: 'rgba(13, 71, 21, 0.06)',
                      },
                    }}
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                </Box>
              </Stack>
            </Box>
          </Box>
        </Modal>
      </Container>
    </Box>
  );
}

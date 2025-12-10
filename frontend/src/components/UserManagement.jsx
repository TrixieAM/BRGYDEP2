import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Draw as DrawIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  getSignatures, 
  uploadSignature, 
  updateSignature, 
  deleteSignature,
  getSignatureImageUrl 
} from '../services/signatureService';
import { Tabs, Tab, Grid, Avatar } from '@mui/material';

const UserManagement = () => {
  const { user, hasPermission, hasRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    password: '',
    role: 'staff'
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Signature management state
  const [activeTab, setActiveTab] = useState(0);
  const [signatures, setSignatures] = useState([]);
  const [loadingSignatures, setLoadingSignatures] = useState(false);
  const [openSignatureDialog, setOpenSignatureDialog] = useState(false);
  const [editingSignature, setEditingSignature] = useState(null);
  const [signatureFormData, setSignatureFormData] = useState({
    official_name: '',
    designation: '',
    signature_file: null,
    preview: null
  });

  useEffect(() => {
    if (hasPermission('manage_users')) {
      fetchUsers();
    }
    if (hasRole(['admin', 'chairman'])) {
      fetchSignatures();
    }
  }, [hasPermission, hasRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      showSnackbar('Error fetching users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = (userToEdit = null) => {
    if (userToEdit) {
      setEditingUser(userToEdit);
      setFormData({
        username: userToEdit.username,
        name: userToEdit.name,
        password: '',
        role: userToEdit.role
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        name: '',
        password: '',
        role: 'staff'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({
      username: '',
      name: '',
      password: '',
      role: 'staff'
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.name || (!editingUser && !formData.password)) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    try {
      if (editingUser) {
        // Update user
        const updateData = {
          username: formData.username,
          name: formData.name,
          role: formData.role
        };
        
        if (formData.password) {
          updateData.password = formData.password;
        }

        await axios.put(`http://localhost:5000/users/${editingUser.user_id}`, updateData);
        showSnackbar('User updated successfully');
      } else {
        // Create new user
        await axios.post('http://localhost:5000/users', formData);
        showSnackbar('User created successfully');
      }
      
      fetchUsers();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving user:', error);
      showSnackbar('Error saving user', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === user.id) {
      showSnackbar('You cannot delete your own account', 'error');
      return;
    }

    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:5000/users/${userId}`);
        showSnackbar('User deleted successfully');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        showSnackbar('Error deleting user', 'error');
      }
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'chairman': return 'primary';
      case 'staff': return 'success';
      default: return 'default';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <AdminIcon />;
      case 'chairman': return <PersonIcon />;
      case 'staff': return <PersonIcon />;
      default: return <PersonIcon />;
    }
  };

  // Signature management functions
  const fetchSignatures = async () => {
    setLoadingSignatures(true);
    try {
      const data = await getSignatures();
      setSignatures(data);
    } catch (error) {
      console.error('Error fetching signatures:', error);
      showSnackbar('Error fetching signatures', 'error');
    } finally {
      setLoadingSignatures(false);
    }
  };

  const handleOpenSignatureDialog = (signatureToEdit = null) => {
    if (signatureToEdit) {
      setEditingSignature(signatureToEdit);
      setSignatureFormData({
        official_name: signatureToEdit.official_name,
        designation: signatureToEdit.designation,
        signature_file: null,
        preview: getSignatureImageUrl(signatureToEdit.signature_path)
      });
    } else {
      setEditingSignature(null);
      setSignatureFormData({
        official_name: '',
        designation: '',
        signature_file: null,
        preview: null
      });
    }
    setOpenSignatureDialog(true);
  };

  const handleCloseSignatureDialog = () => {
    setOpenSignatureDialog(false);
    setEditingSignature(null);
    setSignatureFormData({
      official_name: '',
      designation: '',
      signature_file: null,
      preview: null
    });
  };

  const handleSignatureFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignatureFormData({
          ...signatureFormData,
          signature_file: file,
          preview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureSubmit = async (e) => {
    e.preventDefault();
    
    if (!signatureFormData.official_name || !signatureFormData.designation) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    if (!editingSignature && !signatureFormData.signature_file) {
      showSnackbar('Please select a signature image', 'error');
      return;
    }

    try {
      if (editingSignature) {
        await updateSignature(
          editingSignature.signature_id,
          signatureFormData.signature_file,
          signatureFormData.official_name,
          signatureFormData.designation
        );
        showSnackbar('Signature updated successfully');
      } else {
        await uploadSignature(
          signatureFormData.signature_file,
          signatureFormData.official_name,
          signatureFormData.designation
        );
        showSnackbar('Signature uploaded successfully');
      }
      
      fetchSignatures();
      handleCloseSignatureDialog();
    } catch (error) {
      console.error('Error saving signature:', error);
      showSnackbar(error.message || 'Error saving signature', 'error');
    }
  };

  const handleDeleteSignature = async (signatureId) => {
    if (window.confirm('Are you sure you want to delete this signature?')) {
      try {
        await deleteSignature(signatureId);
        showSnackbar('Signature deleted successfully');
        fetchSignatures();
      } catch (error) {
        console.error('Error deleting signature:', error);
        showSnackbar('Error deleting signature', 'error');
      }
    }
  };

  if (!hasPermission('manage_users')) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error">
          Access Denied
        </Typography>
        <Typography variant="body1">
          You don't have permission to manage users.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ color: '#0D4715', fontWeight: 'bold' }}>
          {activeTab === 0 ? 'User Management' : 'E-Signature Management'}
        </Typography>
        {activeTab === 0 && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ backgroundColor: '#0D4715', '&:hover': { backgroundColor: '#0a3a10' } }}
          >
            Add User
          </Button>
        )}
        {activeTab === 1 && hasRole(['admin', 'chairman']) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenSignatureDialog()}
            sx={{ backgroundColor: '#0D4715', '&:hover': { backgroundColor: '#0a3a10' } }}
          >
            Upload Signature
          </Button>
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Users" icon={<PersonIcon />} iconPosition="start" />
          {hasRole(['admin', 'chairman']) && (
            <Tab label="E-Signatures" icon={<DrawIcon />} iconPosition="start" />
          )}
        </Tabs>
      </Box>

      {/* User Management Tab */}
      {activeTab === 0 && (
        <Card>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Username</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((userData) => (
                      <TableRow key={userData.user_id}>
                        <TableCell>{userData.username}</TableCell>
                        <TableCell>{userData.name}</TableCell>
                        <TableCell>
                          <Chip
                            icon={getRoleIcon(userData.role)}
                            label={userData.role.toUpperCase()}
                            color={getRoleColor(userData.role)}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(userData.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleOpenDialog(userData)}
                            color="primary"
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          {userData.user_id !== user.id && (
                            <IconButton
                              onClick={() => handleDeleteUser(userData.user_id)}
                              color="error"
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="username"
              label="Username"
              fullWidth
              variant="outlined"
              value={formData.username}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="name"
              label="Full Name"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="password"
              label={editingUser ? "New Password (leave blank to keep current)" : "Password"}
              type="password"
              fullWidth
              variant="outlined"
              value={formData.password}
              onChange={handleInputChange}
              required={!editingUser}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                label="Role"
              >
                <MenuItem value="staff">Staff</MenuItem>
                <MenuItem value="chairman">Chairman</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ backgroundColor: '#0D4715' }}>
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Signature Management Tab */}
      {activeTab === 1 && hasRole(['admin', 'chairman']) && (
        <Box>
          {loadingSignatures ? (
            <Typography>Loading signatures...</Typography>
          ) : signatures.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <DrawIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No signatures uploaded
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Upload an official signature to use in certificates
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenSignatureDialog()}
                  sx={{ backgroundColor: '#0D4715', '&:hover': { backgroundColor: '#0a3a10' } }}
                >
                  Upload Signature
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={2}>
              {signatures.map((signature) => (
                <Grid item xs={12} sm={6} md={4} key={signature.signature_id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          src={getSignatureImageUrl(signature.signature_path)}
                          alt={signature.official_name}
                          sx={{ width: 150, height: 80, mb: 2, bgcolor: '#f5f5f5' }}
                          variant="rounded"
                        />
                        <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                          {signature.official_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                          {signature.designation}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <IconButton
                          onClick={() => handleOpenSignatureDialog(signature)}
                          color="primary"
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteSignature(signature.signature_id)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Add/Edit Signature Dialog */}
          <Dialog open={openSignatureDialog} onClose={handleCloseSignatureDialog} maxWidth="sm" fullWidth>
            <DialogTitle>
              {editingSignature ? 'Edit Signature' : 'Upload New Signature'}
            </DialogTitle>
            <form onSubmit={handleSignatureSubmit}>
              <DialogContent>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Official Name"
                  fullWidth
                  variant="outlined"
                  value={signatureFormData.official_name}
                  onChange={(e) => setSignatureFormData({ ...signatureFormData, official_name: e.target.value })}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="dense"
                  label="Designation"
                  fullWidth
                  variant="outlined"
                  value={signatureFormData.designation}
                  onChange={(e) => setSignatureFormData({ ...signatureFormData, designation: e.target.value })}
                  required
                  sx={{ mb: 2 }}
                  placeholder="e.g., Barangay Captain, Secretary"
                />
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<ImageIcon />}
                    sx={{ mb: 1 }}
                  >
                    {editingSignature && !signatureFormData.signature_file 
                      ? 'Change Signature Image' 
                      : 'Select Signature Image'}
                    <input
                      type="file"
                      hidden
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleSignatureFileChange}
                    />
                  </Button>
                  {signatureFormData.preview && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <Avatar
                        src={signatureFormData.preview}
                        alt="Preview"
                        sx={{ width: 200, height: 100, mx: 'auto', bgcolor: '#f5f5f5' }}
                        variant="rounded"
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Preview (PNG with transparent background recommended)
                      </Typography>
                    </Box>
                  )}
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseSignatureDialog}>Cancel</Button>
                <Button type="submit" variant="contained" sx={{ backgroundColor: '#0D4715' }}>
                  {editingSignature ? 'Update' : 'Upload'}
                </Button>
              </DialogActions>
            </form>
          </Dialog>
        </Box>
      )}
    </Box>
  );
};

export default UserManagement;

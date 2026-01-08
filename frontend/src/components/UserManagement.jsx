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
  Image as ImageIcon,
  Groups as GroupsIcon,
  Settings as SettingsIcon
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
import { Tabs, Tab, Grid, Avatar, Checkbox, FormControlLabel, Divider, Switch, Collapse } from '@mui/material';

const apiBase = 'http://localhost:5000';

const UserManagement = () => {
  const { user, hasPermission, hasRole, getToken, logout, refreshPermissions } = useAuth();
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

  // Access management state
  const [accessLoading, setAccessLoading] = useState(false);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [accessDirty, setAccessDirty] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    mainPages: true,
    requestForms: true,
  });

  // Define all page permissions
  const pagePermissions = [
    // Main Pages
    { permission: 'access_residents', label: 'Residents', category: 'mainPages' },
    { permission: 'access_reports', label: 'Reports', category: 'mainPages' },
    { permission: 'access_transaction', label: 'Transaction Log', category: 'mainPages' },
    // Request Forms
    { permission: 'access_indigency', label: 'Indigency', category: 'requestForms' },
    { permission: 'access_certification_action', label: 'Certification of Action', category: 'requestForms' },
    { permission: 'access_solo_parent', label: 'Solo Parent', category: 'requestForms' },
    { permission: 'access_business_clearance', label: 'Business Clearance', category: 'requestForms' },
    { permission: 'access_barangay_clearance', label: 'Barangay Clearance', category: 'requestForms' },
    { permission: 'access_barangay_clearance_crud', label: 'Barangay Clearance (CRUD)', category: 'requestForms' },
    { permission: 'access_certificate_residency', label: 'Certificate of Residency', category: 'requestForms' },
    { permission: 'access_permit_travel', label: 'Permit to Travel', category: 'requestForms' },
    { permission: 'access_oath_job_seeker', label: 'Oath of Undertaking (Job Seeker)', category: 'requestForms' },
    { permission: 'access_cash_assistance', label: 'Cash Assistance', category: 'requestForms' },
    { permission: 'access_financial_assistance', label: 'Financial Assistance', category: 'requestForms' },
    { permission: 'access_cohabitation', label: 'Cohabitation', category: 'requestForms' },
    { permission: 'access_verify_cohabitation', label: 'Verify Cohabitation', category: 'requestForms' },
    { permission: 'access_bhert_normal', label: 'BHERT Certificate (Normal)', category: 'requestForms' },
    { permission: 'access_bhert_positive', label: 'BHERT Certificate (Positive)', category: 'requestForms' },
  ];

  // Audit logs state
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [auditFilters, setAuditFilters] = useState({
    user_id: '',
    action: '',
    entity_type: '',
  });
  // System settings state (mission & vision & about)
  const [missionInput, setMissionInput] = useState('');
  const [visionInput, setVisionInput] = useState('');
  const [aboutInput, setAboutInput] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Reset password modal state
  const [resetDialog, setResetDialog] = useState({ open: false, user: null, tempPassword: '' });

  // Barangay Officials management state
  const [officials, setOfficials] = useState([]);
  const [loadingOfficials, setLoadingOfficials] = useState(false);
  const [openOfficialDialog, setOpenOfficialDialog] = useState(false);
  const [editingOfficial, setEditingOfficial] = useState(null);
  const [officialFormData, setOfficialFormData] = useState({
    name: '',
    position: '',
    contact_number: '',
    email: '',
    position_order: 0,
    image: null,
    imagePreview: null,
  });

  useEffect(() => {
    if (hasPermission('manage_users')) {
      fetchUsers();
    }
    if (hasRole(['admin', 'chairman'])) {
      fetchSignatures();
      fetchRolePermissions();
      fetchAuditLogs(1, auditFilters);
    }
    if (hasRole(['admin'])) {
      loadMissionVision();
      fetchOfficials();
    }
  }, [hasPermission, hasRole]);

  // Global-ish 401 handler via axios interceptor (component-scoped)
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401) {
          showSnackbar('Session expired. Please log in again.', 'error');
          logout();
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const getAuthHeaders = () => {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  const loadMissionVision = async () => {
    try {
      setSettingsLoading(true);
      const res = await axios.get(`${apiBase}/dashboard/settings`, {
        headers: getAuthHeaders(),
      });
      const data = res.data || {};
      if (data.missionVision?.content) {
        try {
          const mv = JSON.parse(data.missionVision.content);
          setMissionInput(mv.mission || '');
          setVisionInput(mv.vision || '');
        } catch {
          // fall through to line-based parsing
          const lines = data.missionVision.content.split('\n');
          setMissionInput(lines[0] || '');
          setVisionInput(lines[1] || '');
        }
      }
      if (data.about?.content) {
        try {
          const aboutContent = JSON.parse(data.about.content);
          setAboutInput(aboutContent.description || aboutContent.about || '');
        } catch {
          setAboutInput(data.about.content || '');
        }
      }
    } catch (error) {
      handleAxiosError(error, 'Error loading Mission & Vision');
    } finally {
      setSettingsLoading(false);
    }
  };

  const saveMissionVision = async () => {
    try {
      setSettingsLoading(true);
      // Save Mission & Vision
      await axios.put(
        `${apiBase}/dashboard/settings/mission-vision`,
        { mission: missionInput, vision: visionInput },
        { headers: getAuthHeaders() }
      );
      // Save About
      await axios.put(
        `${apiBase}/dashboard/settings/about`,
        { about: aboutInput },
        { headers: getAuthHeaders() }
      );
      showSnackbar('Mission, Vision & About updated successfully', 'success');
    } catch (error) {
      handleAxiosError(error, 'Error saving settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleAxiosError = (error, fallbackMessage) => {
    if (error?.response?.status === 401) {
      showSnackbar('Session expired. Please log in again.', 'error');
      logout();
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      return;
    }
    console.error(fallbackMessage, error);
    showSnackbar(fallbackMessage, 'error');
  };

  // Access management handlers
  const fetchRolePermissions = async () => {
    setAccessLoading(true);
    try {
      const res = await axios.get(`${apiBase}/role-permissions`, {
        headers: getAuthHeaders(),
      });
      const fetchedPermissions = res.data || [];
      
      // Ensure all page permissions exist in the state
      const allPermissions = [...fetchedPermissions];
      const roles = ['admin', 'chairman', 'staff'];
      
      // Add missing page permissions with default value (false) if they don't exist
      pagePermissions.forEach((page) => {
        roles.forEach((role) => {
          const exists = fetchedPermissions.some(
            (p) => p.role === role && p.permission === page.permission
          );
          if (!exists) {
            allPermissions.push({
              role,
              permission: page.permission,
              allowed: false,
            });
          }
        });
      });
      
      setRolePermissions(allPermissions);
      setAccessDirty(false);
    } catch (error) {
      handleAxiosError(error, 'Error fetching permissions');
    } finally {
      setAccessLoading(false);
    }
  };

  const initializePagePermissions = async () => {
    try {
      await axios.post(`${apiBase}/role-permissions/initialize`, {}, {
        headers: getAuthHeaders(),
      });
      showSnackbar('Page permissions initialized successfully', 'success');
      await fetchRolePermissions();
      // Refresh permissions in AuthContext so sidebar updates immediately
      await refreshPermissions();
    } catch (error) {
      handleAxiosError(error, 'Error initializing permissions');
    }
  };

  const togglePermission = (role, permission) => {
    setRolePermissions((prev) => {
      const existing = prev.find((p) => p.role === role && p.permission === permission);
      if (existing) {
        return prev.map((p) =>
          p.role === role && p.permission === permission
            ? { ...p, allowed: !p.allowed }
            : p
        );
      } else {
        return [...prev, { role, permission, allowed: true }];
      }
    });
    setAccessDirty(true);
  };

  const getPermissionValue = (role, permission) => {
    const entry = rolePermissions.find(
      (p) => p.role === role && p.permission === permission
    );
    return entry ? !!entry.allowed : false;
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const saveRolePermissions = async () => {
    try {
      // Only send permissions that have been modified or explicitly set
      const permissionsToSave = rolePermissions.filter((p) => {
        // Include all page permissions
        const isPagePermission = pagePermissions.some((pp) => pp.permission === p.permission);
        if (isPagePermission) return true;
        // Include other existing permissions
        return p.role_permission_id || p.allowed !== undefined;
      });

      await axios.post(
        `${apiBase}/role-permissions/bulk`,
        { permissions: permissionsToSave },
        { headers: getAuthHeaders() }
      );
      showSnackbar('Permissions updated successfully', 'success');
      setAccessDirty(false);
      await logAuditLocal('ROLE_PERMISSIONS_UPDATE');
      await fetchRolePermissions(); // Refresh to get latest state
      // Refresh permissions in AuthContext so sidebar updates immediately
      await refreshPermissions();
    } catch (error) {
      handleAxiosError(error, 'Error saving permissions');
    }
  };

  // Audit log handlers
  const fetchAuditLogs = async (page = 1, filters = auditFilters) => {
    setAuditLoading(true);
    try {
      const params = { page, limit: 25, ...filters };
      const res = await axios.get(`${apiBase}/audit-logs`, {
        headers: getAuthHeaders(),
        params,
      });
      setAuditLogs(res.data.data || []);
      setAuditTotal(res.data.total || 0);
      setAuditPage(page);
    } catch (error) {
      handleAxiosError(error, 'Error fetching audit logs');
    } finally {
      setAuditLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiBase}/users`, {
        headers: getAuthHeaders(),
      });
      setUsers(response.data);
    } catch (error) {
      handleAxiosError(error, 'Error fetching users');
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

        await axios.put(`${apiBase}/users/${editingUser.user_id}`, updateData, {
          headers: getAuthHeaders(),
        });
        showSnackbar('User updated successfully');
      } else {
        // Create new user
        await axios.post(`${apiBase}/users`, formData, {
          headers: getAuthHeaders(),
        });
        showSnackbar('User created successfully');
      }
      
      fetchUsers();
      handleCloseDialog();
    } catch (error) {
      handleAxiosError(error, 'Error saving user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === user.id) {
      showSnackbar('You cannot delete your own account', 'error');
      return;
    }

    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${apiBase}/users/${userId}`, {
          headers: getAuthHeaders(),
        });
        showSnackbar('User deleted successfully');
        fetchUsers();
      } catch (error) {
        handleAxiosError(error, 'Error deleting user');
      }
    }
  };

  const handleResetPassword = async (userData) => {
    try {
      const res = await axios.post(
        `${apiBase}/auth/users/${userData.user_id}/reset-password`,
        {},
        { headers: getAuthHeaders() }
      );
      setResetDialog({ open: true, user: userData, tempPassword: res.data.tempPassword });
      await fetchAuditLogs(auditPage, auditFilters);
    } catch (error) {
      handleAxiosError(error, 'Error resetting password');
    }
  };

  const handleCloseResetDialog = () => {
    setResetDialog({ open: false, user: null, tempPassword: '' });
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

  // Local audit for permission change action
  const logAuditLocal = async (action) => {
    try {
      await axios.get(`${apiBase}/audit-logs`, { headers: getAuthHeaders(), params: { page: 1, limit: 1 } });
    } catch (_) {
      // ignore
    }
  };

  // Barangay Officials management functions
  const fetchOfficials = async () => {
    setLoadingOfficials(true);
    try {
      const res = await axios.get(`${apiBase}/dashboard/officials`, {
        headers: getAuthHeaders(),
      });
      setOfficials(res.data || []);
    } catch (error) {
      handleAxiosError(error, 'Error fetching officials');
    } finally {
      setLoadingOfficials(false);
    }
  };

  const handleOpenOfficialDialog = (officialToEdit = null) => {
    if (officialToEdit) {
      setEditingOfficial(officialToEdit);
      setOfficialFormData({
        name: officialToEdit.name,
        position: officialToEdit.position,
        contact_number: officialToEdit.contact_number || '',
        email: officialToEdit.email || '',
        position_order: officialToEdit.position_order || 0,
        image: null,
        imagePreview: officialToEdit.image_path ? `${apiBase}${officialToEdit.image_path}` : null,
      });
    } else {
      setEditingOfficial(null);
      setOfficialFormData({
        name: '',
        position: '',
        contact_number: '',
        email: '',
        position_order: 0,
        image: null,
        imagePreview: null,
      });
    }
    setOpenOfficialDialog(true);
  };

  const handleCloseOfficialDialog = () => {
    setOpenOfficialDialog(false);
    setEditingOfficial(null);
    setOfficialFormData({
      name: '',
      position: '',
      contact_number: '',
      email: '',
      position_order: 0,
      image: null,
      imagePreview: null,
    });
  };

  const handleOfficialFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOfficialFormData({
          ...officialFormData,
          image: file,
          imagePreview: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOfficialSubmit = async (e) => {
    e.preventDefault();
    
    if (!officialFormData.name || !officialFormData.position) {
      showSnackbar('Name and position are required', 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', officialFormData.name);
      formData.append('position', officialFormData.position);
      formData.append('contact_number', officialFormData.contact_number || '');
      formData.append('email', officialFormData.email || '');
      formData.append('position_order', officialFormData.position_order || 0);
      if (officialFormData.image) {
        formData.append('image', officialFormData.image);
      }

      const token = getToken();
      const method = editingOfficial ? 'PUT' : 'POST';
      const url = editingOfficial 
        ? `${apiBase}/dashboard/officials/${editingOfficial.official_id || editingOfficial.id}`
        : `${apiBase}/dashboard/officials`;

      await axios({
        method,
        url,
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - browser will set it with boundary
        },
      });

      showSnackbar(editingOfficial ? 'Official updated successfully' : 'Official added successfully');
      fetchOfficials();
      handleCloseOfficialDialog();
    } catch (error) {
      handleAxiosError(error, editingOfficial ? 'Error updating official' : 'Error adding official');
    }
  };

  const handleDeleteOfficial = async (officialId) => {
    if (window.confirm('Are you sure you want to delete this official?')) {
      try {
        await axios.delete(`${apiBase}/dashboard/officials/${officialId}`, {
          headers: getAuthHeaders(),
        });
        showSnackbar('Official deleted successfully');
        fetchOfficials();
      } catch (error) {
        handleAxiosError(error, 'Error deleting official');
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

  // Get title and description based on active tab
  const getHeaderInfo = () => {
    switch (activeTab) {
      case 0:
        return {
          title: 'User Management',
          description: 'Manage system users, roles, and permissions'
        };
      case 1:
        return {
          title: 'E-Signature Management',
          description: 'Upload and manage official signatures for certificates'
        };
      case 2:
        return {
          title: 'Access Management',
          description: 'Configure role-based permissions and access controls'
        };
      case 3:
        return {
          title: 'Audit Logs',
          description: 'View system activity and transaction history'
        };
      case 4:
        return {
          title: 'System Settings',
          description: 'Configure mission, vision, and system information'
        };
      case 5:
        return {
          title: 'Barangay Officials',
          description: 'Manage barangay official profiles and information'
        };
      default:
        return {
          title: 'Settings',
          description: 'System configuration and management'
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <Box sx={{ p: 3 }}>
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
              <SettingsIcon />
            </Avatar>
            <Box>
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ lineHeight: 1.2, fontSize: { xs: 24, sm: 28, md: 32 } }}
              >
                {headerInfo.title}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {headerInfo.description}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {activeTab === 0 && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
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
                Add User
              </Button>
            )}
            {activeTab === 1 && hasRole(['admin', 'chairman']) && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenSignatureDialog()}
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
                Upload Signature
              </Button>
            )}
            {activeTab === 5 && hasRole(['admin']) && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenOfficialDialog()}
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
                Add Official
              </Button>
            )}
            {activeTab === 2 && hasRole(['admin']) && (
              <>
                <Button
                  variant="outlined"
                  onClick={initializePagePermissions}
                  sx={{
                    borderColor: '#F1F0E9',
                    color: '#F1F0E9',
                    '&:hover': {
                      borderColor: '#F1F0E9',
                      backgroundColor: 'rgba(241, 240, 233, 0.1)',
                    },
                    textTransform: 'none',
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                  }}
                >
                  Initialize Permissions
                </Button>
                <Button
                  variant="contained"
                  disabled={!accessDirty}
                  onClick={saveRolePermissions}
                  sx={{
                    bgcolor: '#E9762B',
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#d86620',
                    },
                    '&:disabled': {
                      bgcolor: 'rgba(233, 118, 43, 0.5)',
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    textTransform: 'none',
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                  }}
                >
                  Save Changes
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Users" icon={<PersonIcon />} iconPosition="start" />
          {hasRole(['admin', 'chairman']) && (
            <Tab label="E-Signatures" icon={<DrawIcon />} iconPosition="start" />
          )}
          {hasRole(['admin']) && (
            <Tab label="Access Management" icon={<AdminIcon />} iconPosition="start" />
          )}
          {hasRole(['admin', 'chairman']) && (
            <Tab label="Audit Logs" icon={<DrawIcon />} iconPosition="start" />
          )}
          {hasRole(['admin']) && (
            <Tab label="System Settings" icon={<AdminIcon />} iconPosition="start" />
          )}
          {hasRole(['admin']) && (
            <Tab label="Barangay Officials" icon={<GroupsIcon />} iconPosition="start" />
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
                          {hasRole(['admin']) && userData.user_id !== user.id && (
                            <IconButton
                              onClick={() => handleResetPassword(userData)}
                              color="secondary"
                              size="small"
                              title="Reset Password"
                            >
                              <DrawIcon />
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

      {/* Reset Password Dialog */}
      <Dialog open={resetDialog.open} onClose={handleCloseResetDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Temporary Password</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>
            User: {resetDialog.user?.username} ({resetDialog.user?.name})
          </Typography>
          <TextField
            label="Temporary Password"
            value={resetDialog.tempPassword}
            fullWidth
            InputProps={{ readOnly: true }}
            sx={{ mb: 2 }}
          />
          <Typography variant="caption" color="text.secondary">
            Share this with the user and ask them to change it after logging in.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResetDialog}>Close</Button>
        </DialogActions>
      </Dialog>

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

      {/* Access Management Tab */}
      {activeTab === 2 && hasRole(['admin']) && (
        <Card>
          <CardContent>
            {accessLoading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography>Loading permissions...</Typography>
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#0D4715' }}>
                  Page Access Management
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Control which pages each role can access. Toggle switches to enable or disable access.
                </Typography>

                {/* Main Pages Section */}
                <Paper elevation={1} sx={{ mb: 3, borderRadius: 2 }}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: '#f5f5f5',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                    onClick={() => toggleSection('mainPages')}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#0D4715' }}>
                      Main Pages
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {expandedSections.mainPages ? 'Hide' : 'Show'}
                    </Typography>
                  </Box>
                  <Collapse in={expandedSections.mainPages}>
                    <Box sx={{ p: 2 }}>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600, width: '40%' }}>Page</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 600 }}>Admin</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 600 }}>Chairman</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 600 }}>Staff</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {pagePermissions
                              .filter((p) => p.category === 'mainPages')
                              .map((page) => (
                                <TableRow key={page.permission}>
                                  <TableCell>{page.label}</TableCell>
                                  {['admin', 'chairman', 'staff'].map((roleKey) => (
                                    <TableCell align="center" key={`${page.permission}-${roleKey}`}>
                                      <Switch
                                        checked={getPermissionValue(roleKey, page.permission)}
                                        onChange={() => togglePermission(roleKey, page.permission)}
                                        color="success"
                                        size="small"
                                      />
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Collapse>
                </Paper>

                {/* Request Forms Section */}
                <Paper elevation={1} sx={{ mb: 3, borderRadius: 2 }}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: '#f5f5f5',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                    onClick={() => toggleSection('requestForms')}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#0D4715' }}>
                      Request Forms
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {expandedSections.requestForms ? 'Hide' : 'Show'}
                    </Typography>
                  </Box>
                  <Collapse in={expandedSections.requestForms}>
                    <Box sx={{ p: 2 }}>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600, width: '40%' }}>Page</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 600 }}>Admin</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 600 }}>Chairman</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 600 }}>Staff</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {pagePermissions
                              .filter((p) => p.category === 'requestForms')
                              .map((page) => (
                                <TableRow key={page.permission}>
                                  <TableCell>{page.label}</TableCell>
                                  {['admin', 'chairman', 'staff'].map((roleKey) => (
                                    <TableCell align="center" key={`${page.permission}-${roleKey}`}>
                                      <Switch
                                        checked={getPermissionValue(roleKey, page.permission)}
                                        onChange={() => togglePermission(roleKey, page.permission)}
                                        color="success"
                                        size="small"
                                      />
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Collapse>
                </Paper>

                {/* Legacy Permissions (System Permissions) */}
                <Paper elevation={1} sx={{ mb: 3, borderRadius: 2 }}>
                  <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#0D4715', mb: 2 }}>
                      System Permissions
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, width: '40%' }}>Permission</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>Admin</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>Chairman</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>Staff</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Array.from(new Set(rolePermissions.map((p) => p.permission)))
                            .filter(
                              (perm) =>
                                !pagePermissions.some((pp) => pp.permission === perm) &&
                                !perm.startsWith('access_')
                            )
                            .map((perm) => (
                              <TableRow key={perm}>
                                <TableCell>{perm.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</TableCell>
                                {['admin', 'chairman', 'staff'].map((roleKey) => (
                                  <TableCell align="center" key={`${perm}-${roleKey}`}>
                                    <Switch
                                      checked={getPermissionValue(roleKey, perm)}
                                      onChange={() => togglePermission(roleKey, perm)}
                                      color="success"
                                      size="small"
                                    />
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Paper>

                {accessDirty && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    You have unsaved changes. Click "Save Changes" button to apply.
                  </Alert>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 3 && hasRole(['admin', 'chairman']) && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
              <TextField
                label="User ID"
                size="small"
                value={auditFilters.user_id}
                onChange={(e) => setAuditFilters({ ...auditFilters, user_id: e.target.value })}
                sx={{ width: 150 }}
              />
              <TextField
                label="Action"
                size="small"
                value={auditFilters.action}
                onChange={(e) => setAuditFilters({ ...auditFilters, action: e.target.value })}
                sx={{ width: 180 }}
              />
              <TextField
                label="Entity Type"
                size="small"
                value={auditFilters.entity_type}
                onChange={(e) => setAuditFilters({ ...auditFilters, entity_type: e.target.value })}
                sx={{ width: 180 }}
              />
              <Button
                variant="outlined"
                onClick={() => fetchAuditLogs(1, auditFilters)}
                sx={{ height: 40 }}
              >
                Apply Filters
              </Button>
            </Box>
            {auditLoading ? (
              <Typography>Loading audit logs...</Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>User ID</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Entity</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {auditLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No audit logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      auditLogs.map((log) => (
                        <TableRow key={log.audit_id}>
                          <TableCell>
                            {new Date(log.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>{log.user_id ?? 'N/A'}</TableCell>
                          <TableCell>{log.action}</TableCell>
                          <TableCell>
                            {log.entity_type || '—'} {log.entity_id || ''}
                          </TableCell>
                          <TableCell>
                            {log.metadata ? (() => {
                              try {
                                const meta = JSON.parse(log.metadata);
                                return meta.details || log.metadata;
                              } catch {
                                return log.metadata;
                              }
                            })() : '—'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* System Settings Tab */}
      {activeTab === 4 && hasRole(['admin']) && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#0D4715' }}>
              Mission, Vision & About
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Update the Mission, Vision, and About sections displayed on the home dashboard.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Mission
                </Typography>
                <TextField
                  multiline
                  minRows={4}
                  fullWidth
                  value={missionInput}
                  onChange={(e) => setMissionInput(e.target.value)}
                  placeholder="Enter mission statement..."
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Vision
                </Typography>
                <TextField
                  multiline
                  minRows={4}
                  fullWidth
                  value={visionInput}
                  onChange={(e) => setVisionInput(e.target.value)}
                  placeholder="Enter vision statement..."
                />
              </Box>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                About
              </Typography>
              <TextField
                multiline
                minRows={6}
                fullWidth
                value={aboutInput}
                onChange={(e) => setAboutInput(e.target.value)}
                placeholder="Enter about section content..."
              />
            </Box>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={loadMissionVision}
                disabled={settingsLoading}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                onClick={saveMissionVision}
                disabled={settingsLoading || !missionInput || !visionInput}
                sx={{ backgroundColor: '#0D4715', '&:hover': { backgroundColor: '#0a3a10' } }}
              >
                Save Changes
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Barangay Officials Tab */}
      {activeTab === 5 && hasRole(['admin']) && (
        <Card>
          <CardContent>
            {loadingOfficials ? (
              <Typography>Loading officials...</Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell>Photo</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Position</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Order</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {officials.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Box sx={{ py: 4, textAlign: 'center' }}>
                            <GroupsIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                              No officials added yet
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              Add barangay officials to display them on the dashboard
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      officials
                        .sort((a, b) => (a.position_order || 0) - (b.position_order || 0))
                        .map((official) => (
                          <TableRow key={official.official_id || official.id} hover>
                            <TableCell>
                              {official.image_path ? (
                                <Avatar
                                  src={`${apiBase}${official.image_path}`}
                                  sx={{ width: 50, height: 50 }}
                                />
                              ) : (
                                <Avatar sx={{ width: 50, height: 50, bgcolor: '#41644A' }}>
                                  <PersonIcon />
                                </Avatar>
                              )}
                            </TableCell>
                            <TableCell>{official.name}</TableCell>
                            <TableCell>{official.position}</TableCell>
                            <TableCell>{official.contact_number || '-'}</TableCell>
                            <TableCell>{official.email || '-'}</TableCell>
                            <TableCell>{official.position_order || 0}</TableCell>
                            <TableCell>
                              <IconButton
                                onClick={() => handleOpenOfficialDialog(official)}
                                color="primary"
                                size="small"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDeleteOfficial(official.official_id || official.id)}
                                color="error"
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Add/Edit Official Dialog */}
            <Dialog open={openOfficialDialog} onClose={handleCloseOfficialDialog} maxWidth="sm" fullWidth>
              <DialogTitle>
                {editingOfficial ? 'Edit Official' : 'Add New Official'}
              </DialogTitle>
              <form onSubmit={handleOfficialSubmit}>
                <DialogContent>
                  <TextField
                    autoFocus
                    margin="dense"
                    label="Full Name"
                    fullWidth
                    variant="outlined"
                    value={officialFormData.name}
                    onChange={(e) => setOfficialFormData({ ...officialFormData, name: e.target.value })}
                    required
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    margin="dense"
                    label="Position"
                    fullWidth
                    variant="outlined"
                    value={officialFormData.position}
                    onChange={(e) => setOfficialFormData({ ...officialFormData, position: e.target.value })}
                    required
                    sx={{ mb: 2 }}
                    placeholder="e.g., Barangay Captain, Secretary, Treasurer"
                  />
                  <TextField
                    margin="dense"
                    label="Contact Number"
                    fullWidth
                    variant="outlined"
                    value={officialFormData.contact_number}
                    onChange={(e) => setOfficialFormData({ ...officialFormData, contact_number: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    margin="dense"
                    label="Email"
                    type="email"
                    fullWidth
                    variant="outlined"
                    value={officialFormData.email}
                    onChange={(e) => setOfficialFormData({ ...officialFormData, email: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    margin="dense"
                    label="Display Order"
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={officialFormData.position_order}
                    onChange={(e) => setOfficialFormData({ ...officialFormData, position_order: parseInt(e.target.value) || 0 })}
                    sx={{ mb: 2 }}
                    helperText="Lower numbers appear first"
                  />
                  <Box sx={{ mb: 2 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      startIcon={<ImageIcon />}
                    >
                      {officialFormData.imagePreview ? 'Change Photo' : 'Upload Photo'}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleOfficialFileChange}
                      />
                    </Button>
                    {officialFormData.imagePreview && (
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                        <Avatar
                          src={officialFormData.imagePreview}
                          sx={{ width: 120, height: 120, border: '3px solid #41644A' }}
                        />
                      </Box>
                    )}
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCloseOfficialDialog}>Cancel</Button>
                  <Button type="submit" variant="contained" sx={{ backgroundColor: '#0D4715' }}>
                    {editingOfficial ? 'Update' : 'Create'}
                  </Button>
                </DialogActions>
              </form>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default UserManagement;

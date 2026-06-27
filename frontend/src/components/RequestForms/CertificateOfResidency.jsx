import React, { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import CaloocanLogo from '../../assets/CaloocanLogo.png';
import Logo145 from '../../assets/Logo145.png';
import BagongPilipinas from '../../assets/BagongPilipinas.png';
import WordName from '../../assets/WordName.png';
import Monumento from '../../assets/Monumento.png';
import { useCertificateManager } from '../../hooks/useCertificateManager';
import { getSignatures, getSignatureImageUrl } from '../../services/signatureService';

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
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  createTheme,
  ThemeProvider,
  Avatar,
  Badge,
  Tooltip,
  Fab,
  AppBar,
  Toolbar,
  Checkbox,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Visibility as EyeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as FileTextIcon,
  QrCodeScanner as QrCodeIcon,
  Receipt as ReceiptIcon,
  Print as PrintIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RestartAlt as ResetIcon,
  Folder as FolderIcon,
  Dashboard as DashboardIcon,
  Article as ArticleIcon,
  CheckCircle as CheckCircleIcon,
  PhotoCamera as PhotoCameraIcon,
  ContentPaste as ContentPasteIcon,
} from '@mui/icons-material';
import { useMediaQuery } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#41644A',
      light: '#A0B2A6',
      dark: '#0D4715',
    },
    secondary: {
      main: '#E9762B',
    },
    success: {
      main: '#41644A',
      light: '#A0B2A6',
      dark: '#0D4715',
    },
    background: {
      default: '#F1F0E9',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000000',
      secondary: '#41644A',
    },
    error: {
      main: '#E9762B',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #41644A 30%, #527D60 90%)',
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #E9762B 30%, #F4944D 90%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          minHeight: 48,
          color: '#000000',
          '&.Mui-selected': {
            color: '#41644A',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          color: '#000000',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#000000',
          '&.Mui-focused': {
            color: '#41644A',
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          color: '#000000',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#000000',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#41644A',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#41644A',
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#000000',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#41644A',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#41644A',
            },
          },
        },
      },
    },
  },
});

function hasValidCertificate(residentId, records) {
  if (!residentId || !records || records.length === 0) return false;
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return records.some((record) => {
    if (record.resident_id !== residentId) return false;
    const issueDate = new Date(record.date_issued);
    return issueDate >= sixMonthsAgo;
  });
}

export default function CertificateOfResidency() {
  const apiBase = 'http://localhost:5000';
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const getAuthHeaders = () => {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('form');
  const [searchTerm, setSearchTerm] = useState('');
  const [residents, setResidents] = useState([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0.75);
  const [signatures, setSignatures] = useState([]);
  const [selectedSignature, setSelectedSignature] = useState(null);
  const [showValidCertDialog, setShowValidCertDialog] = useState(false);
  const [validCertInfo, setValidCertInfo] = useState(null);

  // ── Camera state ────────────────────────────────────────────────────────────
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [cameraDevices, setCameraDevices] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [capturedPreview, setCapturedPreview] = useState('');

  // ── Paste state ─────────────────────────────────────────────────────────────
  const [isPasteZoneActive, setIsPasteZoneActive] = useState(false);

  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const applicantPhotoInputRef = useRef(null);

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { saveCertificate, getValidityPeriod, calculateExpirationDate } =
    useCertificateManager('Certificate of Residency');

  const civilStatusOptions = ['Single', 'Married', 'Widowed', 'Divorced', 'Separated'];

  const [formData, setFormData] = useState({
    resident_id: '',
    full_name: '',
    address: '',
    dob: '',
    age: '',
    provincial_address: '',
    contact_no: '',
    civil_status: 'Single',
    remarks:
      'Residence in this Barangay and certifies that he/she is a resident of good moral character.',
    request_reason: '',
    date_issued: new Date().toISOString().split('T')[0],
    transaction_number: '',
    control_no: generateControlNumber(),
    prepared_by_name: '',
    prepared_by_position: '',
    use_signature: false,
    signature_id: null,
    applicant_photo: '',
  });

  // ── Date helpers ────────────────────────────────────────────────────────────
  function formatDateDisplay(dateString) {
    if (!dateString) return '';
    const dateOnly = dateString.includes('T') ? dateString.split('T')[0] : dateString;
    const [year, month, day] = dateOnly.split('-');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
  }

  function formatDateTimeDisplay(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
  }

  function calculateAge(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  }

  function generateTransactionNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = (Math.floor(Math.random() * 900) + 100).toString().padStart(3, '0');
    return `COR-${year}${month}${day}-${random}`;
  }

  function generateControlNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `${year}145-R${random}`;
  }

  function getIssuedParts(dateStr) {
    if (!dateStr) return { day: '___', month: '________', year: '____' };
    const d = new Date(dateStr + 'T00:00:00');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return { day: d.getDate(), month: monthNames[d.getMonth()], year: d.getFullYear() };
  }

  function storeCertificateData(certificateData) {
    if (!certificateData.certificate_of_residency_id) return;
    const existingCertificates = JSON.parse(localStorage.getItem('certificates') || '{}');
    existingCertificates[certificateData.certificate_of_residency_id] = certificateData;
    localStorage.setItem('certificates', JSON.stringify(existingCertificates));
  }

  // ── Camera helpers ──────────────────────────────────────────────────────────
  function stopCameraStream() {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  async function loadCameraDevices() {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((device) => device.kind === 'videoinput');
    setCameraDevices(videoDevices);
    if (!selectedCameraId && videoDevices[0]?.deviceId) {
      setSelectedCameraId(videoDevices[0].deviceId);
    }
  }

  async function startCamera(deviceId = selectedCameraId) {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('This browser does not support camera capture.');
      return;
    }
    try {
      setCameraError('');
      stopCameraStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: false,
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      await loadCameraDevices();
    } catch (error) {
      console.error(error);
      setCameraError('Unable to access the camera. Allow camera permission or choose another device.');
    }
  }

  function openCameraCapture() {
    setCapturedPreview('');
    setIsCameraOpen(true);
  }

  useEffect(() => {
    if (isCameraOpen) {
      startCamera(selectedCameraId);
      return undefined;
    }
    stopCameraStream();
    return undefined;
  }, [isCameraOpen]);

  function closeCameraCapture() {
    stopCameraStream();
    setCapturedPreview('');
    setIsCameraOpen(false);
    setCameraError('');
  }

  function captureApplicantPhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const capturedPhoto = canvas.toDataURL('image/jpeg', 0.92);
    stopCameraStream();
    setCapturedPreview(capturedPhoto);
  }

  function confirmApplicantPhoto() {
    setFormData((prev) => ({ ...prev, applicant_photo: capturedPreview }));
    setCapturedPreview('');
    setIsCameraOpen(false);
  }

  function retakePhoto() {
    setCapturedPreview('');
    startCamera(selectedCameraId);
  }

  function handleApplicantPhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, etc).');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setCapturedPreview('');
      setFormData((prev) => ({ ...prev, applicant_photo: reader.result }));
      setIsCameraOpen(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  // ── Paste handler ────────────────────────────────────────────────────────────
  function handlePasteImage(e) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (!file) continue;
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({ ...prev, applicant_photo: reader.result }));
          setIsPasteZoneActive(false);
        };
        reader.readAsDataURL(file);
        e.preventDefault();
        return;
      }
    }
    alert('No image found in clipboard. Copy an image first, then paste.');
  }

  // ── Global Ctrl+V listener (only when paste zone is active) ──────────────────
  useEffect(() => {
    if (!isPasteZoneActive) return;
    const handler = (e) => handlePasteImage(e);
    window.addEventListener('paste', handler);
    return () => window.removeEventListener('paste', handler);
  }, [isPasteZoneActive]);

  // ── Data loading ────────────────────────────────────────────────────────────
  async function loadResidents() {
    try {
      const res = await fetch(`${apiBase}/residents`, { headers: getAuthHeaders() });
      const data = await res.json();
      const formattedResidents = data.map((resident) => ({
        ...resident,
        dob: resident.dob ? resident.dob.split('T')[0] : '',
      }));
      setResidents(formattedResidents);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadSignatures() {
    try {
      const data = await getSignatures();
      setSignatures(data);
    } catch (err) {
      console.warn('Could not load signatures:', err);
    }
  }

  useEffect(() => {
    loadResidents();
    loadRecords();
    loadSignatures();
  }, []);

  async function loadRecords() {
    try {
      const res = await fetch(`${apiBase}/certificate-of-residency`, { headers: getAuthHeaders() });
      const data = await res.json();
      setRecords(
        Array.isArray(data)
          ? data.map((r) => {
              const storedCertificates = JSON.parse(localStorage.getItem('certificates') || '{}');
              const storedCertificate = storedCertificates[r.certificate_of_residency_id] || {};
              return {
                certificate_of_residency_id: r.certificate_of_residency_id,
                resident_id: r.resident_id,
                full_name: r.full_name,
                address: r.address,
                dob: r.dob?.split('T')[0] || '',
                age: String(r.age ?? ''),
                provincial_address: r.provincial_address || '',
                contact_no: r.contact_no || '',
                civil_status: r.civil_status,
                remarks: r.remarks,
                request_reason: r.request_reason,
                date_issued: r.date_issued?.split('T')[0] || '',
                date_created: r.date_created,
                transaction_number: r.transaction_number || generateTransactionNumber(),
                use_signature: Boolean(r.use_signature),
                signature_id: r.signature_id || null,
                official_name: r.official_name || null,
                designation: r.designation || null,
                signature_path: r.signature_path || null,
                applicant_photo: storedCertificate.applicant_photo || '',
              };
            })
          : [],
      );
    } catch (e) {
      console.error(e);
    }
  }

  function handleBirthdayChange(dob) {
    if (dob) {
      const age = calculateAge(dob);
      setFormData({ ...formData, dob, age });
    } else {
      setFormData({ ...formData, dob: '', age: '' });
    }
  }

  const display = useMemo(() => {
    let data = editingId || isFormOpen ? formData : selectedRecord || formData;
    if (data && data.use_signature && data.signature_id && !data.signature_path) {
      const sig = signatures.find((s) => s.signature_id === data.signature_id);
      if (sig) {
        return {
          ...data,
          official_name: sig.official_name,
          designation: sig.designation,
          signature_path: sig.signature_path,
        };
      }
    }
    return data;
  }, [editingId, isFormOpen, selectedRecord, formData, signatures]);

  useEffect(() => {
    const generateQRCode = async () => {
      if (display.certificate_of_residency_id || display.full_name) {
        storeCertificateData(display);
        const qrContent = `CERTIFICATE VERIFICATION:
        Transaction No: ${display.transaction_number || 'N/A'}
        Name: ${display.full_name}
        Date Issued: ${display.date_created ? formatDateTimeDisplay(display.date_created) : new Date().toLocaleString()}
        Document Type: Certificate of Residency
        Ⓒ BRRMS | BARANGAY 145
        CALOOCAN CITY
        ALL RIGHTS RESERVED`;
        try {
          const qrUrl = await QRCode.toDataURL(qrContent, {
            width: 140,
            margin: 1,
            color: { dark: '#000000', light: '#FFFFFF' },
            errorCorrectionLevel: 'L',
          });
          setQrCodeUrl(qrUrl);
        } catch (err) {
          console.error('Failed to generate QR code:', err);
        }
      } else {
        setQrCodeUrl('');
      }
    };
    generateQRCode();
  }, [display]);

  function toServerPayload(data) {
    return {
      resident_id: data.resident_id || null,
      full_name: data.full_name,
      address: data.address,
      dob: data.dob || null,
      age: data.age ? Number(data.age) : null,
      provincial_address: data.provincial_address || null,
      contact_no: data.contact_no || null,
      civil_status: data.civil_status,
      remarks: data.remarks,
      request_reason: data.request_reason,
      date_issued: data.date_issued,
      transaction_number: data.transaction_number,
      control_no: data.control_no || '',
      prepared_by_name: data.prepared_by_name || '',
      prepared_by_position: data.prepared_by_position || '',
      use_signature: data.use_signature ? 1 : 0,
      signature_id: data.use_signature && data.signature_id ? data.signature_id : null,
    };
  }

  async function handleCreate() {
    try {
      const transactionNumber = generateTransactionNumber();
      const validityPeriod = getValidityPeriod('Certificate of Residency');
      const updatedFormData = {
        ...formData,
        transaction_number: transactionNumber,
        date_created: new Date().toISOString(),
        validity_period: validityPeriod,
      };
      const res = await fetch(`${apiBase}/certificate-of-residency`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(toServerPayload(updatedFormData)),
      });
      if (!res.ok) throw new Error('Create failed');
      const created = await res.json();
      const newRec = {
        ...updatedFormData,
        certificate_of_residency_id: created.certificate_of_residency_id,
      };
      setRecords([newRec, ...records]);
      setSelectedRecord(newRec);
      await saveCertificate(newRec, true);
      storeCertificateData(newRec);
      resetForm();
      setActiveTab('records');
    } catch (e) {
      console.error(e);
      alert('Failed to create record');
    }
  }

  async function handleUpdate() {
    try {
      const validityPeriod = getValidityPeriod('Certificate of Residency');
      const updatedFormData = { ...formData, validity_period: validityPeriod };
      const res = await fetch(`${apiBase}/certificate-of-residency/${editingId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(toServerPayload(updatedFormData)),
      });
      if (!res.ok) throw new Error('Update failed');
      const updatedData = await res.json();
      const updated = {
        ...updatedData,
        certificate_of_residency_id: updatedData.certificate_of_residency_id,
        full_name: updatedData.full_name,
        address: updatedData.address,
        provincial_address: updatedData.provincial_address || '',
        dob: updatedData.dob?.split('T')[0] || '',
        age: String(updatedData.age ?? ''),
        civil_status: updatedData.civil_status,
        contact_no: updatedData.contact_no || '',
        remarks: updatedData.remarks || '',
        request_reason: updatedData.request_reason || '',
        date_issued: updatedData.date_issued?.split('T')[0] || '',
        date_created: updatedData.date_created,
        transaction_number: updatedData.transaction_number,
        validity_period: validityPeriod,
        use_signature: Boolean(updatedData.use_signature),
        signature_id: updatedData.signature_id || null,
        official_name: updatedData.official_name || null,
        designation: updatedData.designation || null,
        signature_path: updatedData.signature_path || null,
        applicant_photo: formData.applicant_photo || '',
      };
      setRecords([updated, ...records.filter((r) => r.certificate_of_residency_id !== editingId)]);
      setSelectedRecord(updated);
      await saveCertificate(updated, false);
      storeCertificateData(updated);
      resetForm();
      setActiveTab('records');
    } catch (e) {
      console.error(e);
      alert('Failed to update record');
    }
  }

  function handleEdit(record) {
    setFormData({
      ...record,
      use_signature: Boolean(record.use_signature),
      signature_id: record.signature_id || null,
    });
    setEditingId(record.certificate_of_residency_id);
    setIsFormOpen(true);
    setActiveTab('form');
    if (record.signature_id) {
      setSelectedSignature(signatures.find((s) => s.signature_id === record.signature_id) || null);
    } else {
      setSelectedSignature(null);
    }
  }

  function handleView(record) {
    setSelectedRecord(record);
    setFormData({
      ...record,
      use_signature: Boolean(record.use_signature),
      signature_id: record.signature_id || null,
    });
    setEditingId(record.certificate_of_residency_id);
    setIsFormOpen(true);
    setActiveTab('form');
    if (record.signature_id) {
      setSelectedSignature(signatures.find((s) => s.signature_id === record.signature_id) || null);
    } else {
      setSelectedSignature(null);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this record?')) return;
    try {
      const res = await fetch(`${apiBase}/certificate-of-residency/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Delete failed');
      setRecords(records.filter((r) => r.certificate_of_residency_id !== id));
      if (selectedRecord?.certificate_of_residency_id === id) setSelectedRecord(null);
      const existingCertificates = JSON.parse(localStorage.getItem('certificates') || '{}');
      delete existingCertificates[id];
      localStorage.setItem('certificates', JSON.stringify(existingCertificates));
    } catch (e) {
      console.error(e);
      alert('Failed to delete record');
    }
  }

  function resetForm() {
    setFormData({
      resident_id: '',
      full_name: '',
      address: '',
      dob: '',
      age: '',
      provincial_address: '',
      contact_no: '',
      civil_status: 'Single',
      remarks:
        'Residence in this Barangay and certifies that he/she is a resident of good moral character.',
      request_reason: '',
      date_issued: new Date().toISOString().split('T')[0],
      transaction_number: '',
      control_no: generateControlNumber(),
      prepared_by_name: '',
      prepared_by_position: '',
      use_signature: false,
      signature_id: null,
      applicant_photo: '',
    });
    setEditingId(null);
    setIsFormOpen(false);
    setSelectedRecord(null);
    setSelectedSignature(null);
  }

  function handleSubmit() {
    if (!formData.full_name || !formData.address || !formData.request_reason) {
      alert('Please fill in all required fields');
      return;
    }
    if (!formData.date_issued) {
      alert('Please select the issued date');
      return;
    }
    if (formData.use_signature && !formData.signature_id) {
      alert('Please select a signature when e-signature is enabled');
      return;
    }
    if (!editingId && formData.resident_id) {
      const validCert = records.find((record) => {
        if (record.resident_id !== formData.resident_id) return false;
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const issueDate = new Date(record.date_issued);
        return issueDate >= sixMonthsAgo;
      });
      if (validCert) {
        setValidCertInfo(validCert);
        setShowValidCertDialog(true);
        return;
      }
    }
    if (editingId) handleUpdate();
    else handleCreate();
  }

  function confirmSaveWithValidCert() {
    setShowValidCertDialog(false);
    handleCreate();
  }

  const filteredRecords = useMemo(
    () =>
      records.filter(
        (r) =>
          r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.contact_no || '').includes(searchTerm),
      ),
    [records, searchTerm],
  );

  async function generatePDF() {
    if (!display.certificate_of_residency_id) {
      alert('Please save the record first before downloading PDF');
      return;
    }
    setIsGeneratingPDF(true);
    try {
      const certificateElement = document.getElementById('certificate-preview');
      const parentOfPreview = certificateElement.parentNode;
      const prevTransform = parentOfPreview.style.transform;
      const prevTransformOrigin = parentOfPreview.style.transformOrigin;
      parentOfPreview.style.transform = 'scale(1)';
      parentOfPreview.style.transformOrigin = 'top center';
      await new Promise((resolve) => setTimeout(resolve, 150));
      const canvas = await html2canvas(certificateElement, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      parentOfPreview.style.transform = prevTransform;
      parentOfPreview.style.transformOrigin = prevTransformOrigin;
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'in', format: [8.5, 11] });
      pdf.addImage(imgData, 'PNG', 0, 0, 8.5, 11);
      pdf.save(
        `Certificate_of_Residency_${display.certificate_of_residency_id}_${display.full_name.replace(/\s+/g, '_')}.pdf`,
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  }

  function handlePrint() {
    if (!display.certificate_of_residency_id) {
      alert('Please save the record first before printing');
      return;
    }
    const certificateElement = document.getElementById('certificate-preview');
    if (!certificateElement) {
      alert('Certificate not found for printing.');
      return;
    }
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:absolute;left:-9999px;top:0;width:0;height:0;';
    document.body.appendChild(iframe);
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.write(`<!DOCTYPE html><html><head><title>Print Certificate</title>
      <style>
        @page { size: 8.5in 11in; margin: 0; }
        body { margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        #certificate-preview { width: 8.5in; height: 11in; position: relative; overflow: hidden; background: white; box-sizing: border-box; }
        #certificate-preview * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      </style></head><body>${certificateElement.outerHTML}</body></html>`);
    iframeDoc.close();
    setTimeout(() => {
      const iframeWindow = iframe.contentWindow || iframe;
      iframeWindow.focus();
      iframeWindow.print();
      window.onafterprint = () => { document.body.removeChild(iframe); };
      setTimeout(() => {
        if (document.body.contains(iframe)) document.body.removeChild(iframe);
      }, 1000);
    }, 250);
  }

  const handleQrCodeClick = () => {
    if (display.certificate_of_residency_id) {
      const verificationUrl = `${window.location.origin}/verify-certificate?id=${display.certificate_of_residency_id}`;
      window.open(verificationUrl, '_blank');
    } else {
      setQrDialogOpen(true);
    }
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.1, 0.3));
  const handleResetZoom = () => setZoomLevel(0.75);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') { e.preventDefault(); handleZoomIn(); }
        else if (e.key === '-') { e.preventDefault(); handleZoomOut(); }
        else if (e.key === '0') { e.preventDefault(); handleResetZoom(); }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [zoomLevel]);

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
          bgcolor: 'background.default',
        }}
      >
        {/* ── TOP HEADER ── */}
        <Paper elevation={2} sx={{ zIndex: 10, borderRadius: 0 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              bgcolor: 'primary.main',
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src={Logo145} sx={{ width: 48, height: 48 }} />
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Certificate of Residency
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Manage all records of the Certificate of Residency
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Badge badgeContent={records.length} color="secondary">
                <Chip
                  icon={<FolderIcon />}
                  label="Total Records"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                />
              </Badge>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<AddIcon />}
                onClick={() => { resetForm(); setIsFormOpen(true); setActiveTab('form'); }}
                sx={{ borderRadius: 20, px: 3 }}
              >
                New Certificate
              </Button>
            </Box>
          </Box>

          {/* NAVIGATION TABS */}
          <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
              <Tabs
                value={activeTab}
                onChange={(e, nv) => setActiveTab(nv)}
                variant="fullWidth"
                sx={{
                  '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
                  minHeight: 48,
                }}
              >
                <Tab icon={<ArticleIcon />} label="Form" value="form" iconPosition="start" />
                <Tab
                  icon={<FolderIcon />}
                  label={`Records (${records.length})`}
                  value="records"
                  iconPosition="start"
                />
              </Tabs>
            </Box>
          </Box>
        </Paper>

        {/* ── MAIN CONTENT ── */}
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* ── LEFT: Certificate Preview ── */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.default',
              p: 2,
              [theme.breakpoints.down('lg')]: {
                display: activeTab === 'form' ? 'none' : 'flex',
              },
            }}
          >
            {/* ZOOM CONTROLS */}
            <Paper elevation={1} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Tooltip title="Zoom Out">
                    <IconButton onClick={handleZoomOut} color="primary" size="small">
                      <ZoomOutIcon />
                    </IconButton>
                  </Tooltip>
                  <Typography
                    variant="body2"
                    sx={{
                      minWidth: 60,
                      textAlign: 'center',
                      fontWeight: 600,
                      px: 1,
                      py: 0.5,
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      color: '#000000',
                    }}
                  >
                    {Math.round(zoomLevel * 100)}%
                  </Typography>
                  <Tooltip title="Zoom In">
                    <IconButton onClick={handleZoomIn} color="primary" size="small">
                      <ZoomInIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reset Zoom">
                    <IconButton onClick={handleResetZoom} color="primary" size="small">
                      <ResetIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Download PDF">
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={generatePDF}
                      disabled={!display.certificate_of_residency_id || isGeneratingPDF}
                      startIcon={<FileTextIcon />}
                      size="small"
                    >
                      {isGeneratingPDF ? 'Generating...' : 'Download'}
                    </Button>
                  </Tooltip>
                  <Tooltip title="Print">
                    <Button
                      variant="outlined"
                      onClick={handlePrint}
                      disabled={!display.certificate_of_residency_id}
                      startIcon={<PrintIcon />}
                      size="small"
                    >
                      Print
                    </Button>
                  </Tooltip>
                </Box>
              </Box>
            </Paper>

            {/* CERTIFICATE PREVIEW */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                flex: 1,
                overflow: 'auto',
                p: 1,
              }}
            >
              <Box sx={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}>
                <div
                  id="certificate-preview"
                  style={{
                    position: 'relative',
                    width: '8.5in',
                    height: '13in',
                    boxShadow: '0 0 8px rgba(0,0,0,0.2)',
                    background: '#fff',
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact',
                    colorAdjust: 'exact',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                    fontFamily: '"Times New Roman", serif',
                  }}
                >
                  {/* Monumento Background */}
                  <img
                    src={Monumento}
                    alt="Monumento Background"
                    style={{
                      position: 'absolute',
                      left: 125,
                      top: 250,
                      height: '100%',
                      width: '120%',
                      objectFit: 'cover',
                      objectPosition: 'center top',
                      opacity: 0.5,
                      zIndex: 0,
                      transform: 'scale(0.8)',
                      transformOrigin: 'top right',
                    }}
                  />

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* ── HEADER ── */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '30px 50px 10px 50px',
                      }}
                    >
                      <img
                        src={CaloocanLogo}
                        alt="Caloocan Logo"
                        style={{ width: '120px', height: '120px', objectFit: 'contain' }}
                      />
                      <div style={{ textAlign: 'center', flex: 1, padding: '0 20px' }}>
                        <div style={{ fontFamily: 'Old English Text MT', fontSize: '16pt' }}>
                          Republic of the Philippines
                        </div>
                        <div style={{ fontFamily: '"Times New Roman"', fontSize: '16pt', marginTop: '2px' }}>
                          City of Caloocan
                        </div>
                        <div style={{ fontFamily: '"Times New Roman"', fontSize: '16pt', marginTop: '2px' }}>
                          Barangay 145, Zone 13, District 1
                        </div>
                        <div style={{ fontFamily: '"Times New Roman"', fontSize: '12pt', marginTop: '2px' }}>
                          Reparo St. Cor. Gen. Tirona St. Bagong Barrio, Caloocan City
                        </div>
                      </div>
                      <img
                        src={Logo145}
                        alt="Barangay 145 Logo"
                        style={{ width: '120px', height: '120px', objectFit: 'contain' }}
                      />
                    </div>

                    {/* Office Title */}
                    <div
                      style={{
                        textAlign: 'center',
                        fontFamily: '"Times New Roman"',
                        fontSize: '16pt',
                        fontWeight: 'bold',
                        marginTop: '10px',
                        letterSpacing: '0.5px',
                      }}
                    >
                      OFFICE OF THE SANGGUNIANG BARANGAY
                    </div>

                    {/* Certificate Title */}
                    <div
                      style={{
                        textAlign: 'center',
                        fontFamily: '"Times New Roman"',
                        fontSize: '16pt',
                        fontWeight: 'bold',
                        margin: '40px 0 40px 0',
                      }}
                    >
                      CERTIFICATE OF RESIDENCY
                    </div>

                    {/* ── BODY ── */}
                    <div
                      style={{
                        padding: '0 70px',
                        fontFamily: '"Times New Roman", Times, serif',
                        fontSize: '12pt',
                        lineHeight: '1.8',
                        color: '#000',
                        textAlign: 'justify',
                      }}
                    >
                      <p style={{ fontWeight: 'bold', margin: '0 0 10px 0' }}>
                        TO WHOM IT MAY CONCERN:
                      </p>

                      <p style={{ margin: '0 0 10px 0', textIndent: '50px' }}>
                        This is to certify that{' '}
                        <strong>{display.full_name || '____________________________'}</strong>, of
                        legal age, <strong>{display.civil_status || 'single'}</strong>, Filipino
                        citizen, is a resident of{' '}
                        <strong>{display.address || '(present address)'}</strong>, Barangay 145
                        District 1 Caloocan City.
                      </p>

                      <p style={{ margin: '0 0 10px 0', textIndent: '50px' }}>
                        This certification is issued upon the request of the above-mentioned
                        individual for{' '}
                        <strong>
                          {display.request_reason || '(state the purpose of the Certificate)'}
                        </strong>
                        .
                      </p>

                      {(() => {
                        const { day, month, year } = getIssuedParts(display.date_issued);
                        return (
                          <p style={{ margin: '0 0 10px 0', textIndent: '50px' }}>
                            Issued this <strong>{day}</strong> of <strong>{month}</strong>,{' '}
                            <strong>{year}</strong>, at Barangay <strong>145</strong>, Caloocan
                            City.
                          </p>
                        );
                      })()}
                    </div>

                    {/* ── Photo & Thumbmark ── */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '40px',
                        padding: '14px 70px',
                        alignItems: 'flex-end',
                      }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            width: '150px',
                            height: '150px',
                            border: '1.5px solid #000',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#fff',
                          }}
                        >
                          {display.applicant_photo ? (
                            <img
                              src={display.applicant_photo}
                              alt="Applicant Photo"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : null}
                        </div>
                        <div style={{ fontSize: '10pt', marginTop: '6px', fontWeight: 'bold' }}>
                          Applicant Photo
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div
                          style={{ width: '150px', height: '150px', border: '1.5px solid #000' }}
                        />
                        <div style={{ fontSize: '10pt', marginTop: '6px', fontWeight: 'bold' }}>
                          Applicant Thumbmark
                        </div>
                      </div>
                    </div>

                    {/* Punong Barangay Signature */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        padding: '0 70px',
                        marginTop: '10px',
                      }}
                    >
                      <div style={{ textAlign: 'center', width: '300px', marginTop: '10px' }}>
                        {display.use_signature && display.signature_path ? (
                          <div
                            style={{
                              height: '70px',
                              display: 'flex',
                              alignItems: 'flex-end',
                              justifyContent: 'center',
                              marginBottom: '-10px',
                            }}
                          >
                            <img
                              src={getSignatureImageUrl(display.signature_path)}
                              alt="Signature"
                              style={{ maxWidth: '200px', maxHeight: '65px', objectFit: 'contain' }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </div>
                        ) : null}
                        <div
                          style={{
                            height: '55px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <img
                            src={WordName}
                            alt="Arnold Dondonayos"
                            style={{
                              width: '240px',
                              height: 'auto',
                              maxHeight: '55px',
                              objectFit: 'contain',
                            }}
                          />
                        </div>
                        <div
                          style={{
                            borderTop: '2px solid #000',
                            width: '90%',
                            margin: '0 auto 4px auto',
                          }}
                        />
                        <div
                          style={{
                            fontFamily: '"Times New Roman"',
                            fontSize: '11pt',
                            fontWeight: 'bold',
                          }}
                        >
                          [Punong Barangay / Authorized Official]
                        </div>
                      </div>
                    </div>

                    {/* Barangay Seal & Control No. */}
                    <div style={{ padding: '30px 70px 0 70px', fontSize: '11pt' }}>
                      <div>Barangay Seal</div>
                      <div style={{ marginTop: '4px' }}>
                        Control No.{' '}
                        <span style={{ minWidth: '120px', display: 'inline-block' }}>
                          {display.control_no || '145-0001'}
                        </span>
                      </div>
                      <ul
                        style={{
                          marginTop: '8px',
                          paddingLeft: '20px',
                          fontSize: '9pt',
                          lineHeight: '1.6',
                          listStyleType: 'disc',
                        }}
                      >
                        <li>
                          This certification is not valid without the Official Barangay Dry Seal
                          and the Barangay Chairman's Signature/Stamp.
                        </li>
                        <li>
                          Officials and applicants who submit false certifications or documents
                          shall be held liable for administrative/criminal liabilities.
                        </li>
                      </ul>
                      <div
                        style={{
                          fontSize: '10pt',
                          marginTop: '50px',
                          fontFamily: '"Times New Roman"',
                        }}
                      >
                        <div>
                          Prepared by:{' '}
                          <strong>{display.prepared_by_name || 'Roselyn Anore'}</strong>
                        </div>
                        <div style={{ marginLeft: '80px' }}>
                          <strong>
                            {display.prepared_by_position || 'Barangay Secretary'}
                          </strong>
                        </div>
                      </div>
                      <div
                        style={{
                          textAlign: 'center',
                          fontFamily: '"Times New Roman"',
                          fontSize: '13pt',
                          marginTop: '60px',
                          fontStyle: 'italic',
                        }}
                      >
                        This certification is{' '}
                        <strong>valid for six (6) months from the date of issuance.</strong>
                      </div>
                      <div
                        style={{
                          marginTop: '12px',
                          textAlign: 'right',
                          paddingRight: '10px',
                          height: '110px',
                          visibility: qrCodeUrl && display.use_signature ? 'visible' : 'hidden',
                        }}
                      >
                        <img
                          src={
                            qrCodeUrl ||
                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3C/svg%3E'
                          }
                          alt="QR Code"
                          style={{
                            width: '80px',
                            height: '80px',
                            display: 'inline-block',
                            border: '2px solid #000',
                            padding: '3px',
                          }}
                        />
                        <div
                          style={{
                            fontSize: '7pt',
                            color: '#666',
                            marginTop: '3px',
                            fontWeight: 'normal',
                            textAlign: 'right',
                          }}
                        >
                          {display.date_created
                            ? formatDateTimeDisplay(display.date_created)
                            : new Date().toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Box>
            </Box>

            <style>{`
              @media print {
                body * { visibility: hidden; }
                #certificate-preview, #certificate-preview * { visibility: visible; }
                #certificate-preview { position: absolute; left: 0; top: 0; width: 8.5in; height: 13in; transform: none !important; }
                @page { size: portrait; margin: 0; }
                #certificate-preview * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
              }
            `}</style>
          </Box>

          {/* ── RIGHT: FORM / RECORDS PANEL ── */}
          <Box
            sx={{
              width: { xs: '100%', md: '50%', lg: '40%' },
              bgcolor: 'background.paper',
              borderLeft: { xs: 0, md: 1 },
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* ── FORM ── */}
            {activeTab === 'form' && (
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Paper elevation={0} sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <ArticleIcon color="primary" />
                    {editingId ? 'Edit Certificate' : 'New Certificate of Residency'}
                  </Typography>
                  {selectedRecord && !editingId && (
                    <Typography variant="body2" color="text.secondary">
                      Viewing: {selectedRecord.full_name}
                    </Typography>
                  )}
                </Paper>

                <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                  <Stack spacing={3}>
                    {/* Full Name */}
                    <Autocomplete
                      options={residents}
                      getOptionLabel={(option) => option.full_name || ''}
                      value={residents.find((r) => r.full_name === formData.full_name) || null}
                      onChange={(e, nv) => {
                        if (nv) {
                          const dobFormatted = nv.dob ? nv.dob.slice(0, 10) : '';
                          setFormData({
                            ...formData,
                            resident_id: nv.resident_id,
                            full_name: nv.full_name,
                            address: nv.address || '',
                            provincial_address: nv.provincial_address || '',
                            dob: dobFormatted,
                            age: nv.age ? String(nv.age) : '',
                            civil_status: nv.civil_status || 'Single',
                            contact_no: nv.contact_no || '',
                          });
                        } else {
                          setFormData({ ...formData, full_name: '' });
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Full Name"
                          variant="outlined"
                          fullWidth
                          size="small"
                          required
                        />
                      )}
                    />

                    {/* Address */}
                    <TextField
                      label="Address"
                      variant="outlined"
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />

                    {/* Birthday & Age */}
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Birthday"
                          type="date"
                          variant="outlined"
                          fullWidth
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          value={formData.dob}
                          onChange={(e) => handleBirthdayChange(e.target.value)}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Age"
                          variant="outlined"
                          fullWidth
                          size="small"
                          value={formData.age}
                          InputProps={{ readOnly: true }}
                          sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'grey.100' } }}
                        />
                      </Grid>
                    </Grid>

                    {/* Provincial Address */}
                    <TextField
                      label="Provincial Address"
                      variant="outlined"
                      fullWidth
                      size="small"
                      value={formData.provincial_address}
                      onChange={(e) =>
                        setFormData({ ...formData, provincial_address: e.target.value })
                      }
                    />

                    {/* Contact Number */}
                    <TextField
                      label="Contact Number"
                      variant="outlined"
                      fullWidth
                      size="small"
                      placeholder="09XXXXXXXXX"
                      value={formData.contact_no}
                      onChange={(e) => setFormData({ ...formData, contact_no: e.target.value })}
                    />

                    {/* Civil Status */}
                    <FormControl fullWidth size="small">
                      <InputLabel>Civil Status</InputLabel>
                      <Select
                        value={formData.civil_status}
                        label="Civil Status"
                        onChange={(e) =>
                          setFormData({ ...formData, civil_status: e.target.value })
                        }
                      >
                        {civilStatusOptions.map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Remarks */}
                    <TextField
                      label="Remarks"
                      variant="outlined"
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      required
                    />

                    {/* Request Reason */}
                    <TextField
                      label="Request Reason"
                      variant="outlined"
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                      placeholder="School enrollment, Employment, etc."
                      value={formData.request_reason}
                      onChange={(e) =>
                        setFormData({ ...formData, request_reason: e.target.value })
                      }
                      required
                    />

                    {/* Date Issued */}
                    <TextField
                      label="Date Issued"
                      type="date"
                      variant="outlined"
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      value={formData.date_issued}
                      onChange={(e) => setFormData({ ...formData, date_issued: e.target.value })}
                      required
                    />

                    {/* ── Applicant Photo ── */}
                    <Box
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        p: 2,
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        Applicant Photo
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        Capture from camera, upload a file, or paste an image from your clipboard.
                      </Typography>

                      {/* Buttons row */}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                        <Button
                          variant="outlined"
                          startIcon={<PhotoCameraIcon />}
                          onClick={openCameraCapture}
                          size="small"
                        >
                          Open Camera
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          size="small"
                          onClick={() => applicantPhotoInputRef.current?.click()}
                        >
                          Upload Photo
                        </Button>
                        <Button
                          variant="outlined"
                          color={isPasteZoneActive ? 'success' : 'primary'}
                          startIcon={<ContentPasteIcon />}
                          size="small"
                          onClick={() => setIsPasteZoneActive((prev) => !prev)}
                        >
                          {isPasteZoneActive ? 'Waiting for paste…' : 'Paste Photo'}
                        </Button>
                      </Box>

                      {/* Paste zone — shown when active */}
                      {isPasteZoneActive && (
                        <Box
                          onPaste={handlePasteImage}
                          tabIndex={0}
                          sx={{
                            border: '2px dashed',
                            borderColor: 'success.main',
                            borderRadius: 2,
                            p: 3,
                            mb: 1.5,
                            textAlign: 'center',
                            bgcolor: 'rgba(65,100,74,0.06)',
                            cursor: 'pointer',
                            outline: 'none',
                            '&:focus': { boxShadow: '0 0 0 3px rgba(65,100,74,0.25)' },
                          }}
                          // auto-focus so keyboard paste works immediately
                          ref={(el) => el && el.focus()}
                        >
                          <ContentPasteIcon sx={{ fontSize: 36, color: 'success.main', mb: 1 }} />
                          <Typography variant="body2" color="success.main" fontWeight={600}>
                            Press <strong>Ctrl+V</strong> (or <strong>⌘V</strong>) to paste
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Copy any image first, then paste it here
                          </Typography>
                        </Box>
                      )}

                      <input
                        ref={applicantPhotoInputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleApplicantPhotoUpload}
                      />

                      {formData.applicant_photo ? (
                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            component="img"
                            src={formData.applicant_photo}
                            alt="Applicant preview"
                            sx={{
                              width: 144,
                              height: 144,
                              objectFit: 'cover',
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                          />
                          <Button
                            variant="text"
                            color="error"
                            onClick={() => {
                              setFormData({ ...formData, applicant_photo: '' });
                              setIsPasteZoneActive(false);
                            }}
                          >
                            Remove Photo
                          </Button>
                        </Box>
                      ) : null}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* E-Signature */}
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.use_signature || false}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormData({
                              ...formData,
                              use_signature: checked,
                              signature_id:
                                checked && selectedSignature
                                  ? selectedSignature.signature_id
                                  : null,
                            });
                            if (!checked) setSelectedSignature(null);
                          }}
                          color="primary"
                        />
                      }
                      label="Add E-Signature"
                    />

                    {formData.use_signature && (
                      <Autocomplete
                        options={signatures}
                        getOptionLabel={(opt) => `${opt.official_name} - ${opt.designation}`}
                        value={selectedSignature}
                        onChange={(e, newValue) => {
                          setSelectedSignature(newValue);
                          setFormData({
                            ...formData,
                            signature_id: newValue ? newValue.signature_id : null,
                          });
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Select Signature"
                            variant="outlined"
                            fullWidth
                            size="small"
                            required
                          />
                        )}
                      />
                    )}

                    <Divider sx={{ my: 2 }} />

                    {/* Control Number */}
                    <TextField
                      label="Control Number"
                      variant="outlined"
                      fullWidth
                      size="small"
                      value={formData.control_no}
                      onChange={(e) => setFormData({ ...formData, control_no: e.target.value })}
                      helperText="Format: YYYY145-R000000 (auto-generated)"
                    />

                    {/* Prepared By */}
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Prepared By (Name)"
                          variant="outlined"
                          fullWidth
                          size="small"
                          value={formData.prepared_by_name}
                          onChange={(e) =>
                            setFormData({ ...formData, prepared_by_name: e.target.value })
                          }
                          placeholder="e.g., Roselyn Anore"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Prepared By (Position)"
                          variant="outlined"
                          fullWidth
                          size="small"
                          value={formData.prepared_by_position}
                          onChange={(e) =>
                            setFormData({ ...formData, prepared_by_position: e.target.value })
                          }
                          placeholder="e.g., Barangay Secretary"
                        />
                      </Grid>
                    </Grid>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
                      <Button
                        onClick={handleSubmit}
                        variant="contained"
                        startIcon={<SaveIcon />}
                        fullWidth
                        color="primary"
                        size="large"
                      >
                        {editingId ? 'Update' : 'Save'}
                      </Button>
                      {(editingId || isFormOpen) && (
                        <Button
                          onClick={resetForm}
                          variant="outlined"
                          startIcon={<CloseIcon />}
                          color="primary"
                          size="large"
                        >
                          Cancel
                        </Button>
                      )}
                    </Box>
                  </Stack>
                </Box>
              </Box>
            )}

            {/* ── RECORDS ── */}
            {activeTab === 'records' && (
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Paper elevation={0} sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <FolderIcon color="primary" /> Certificate Records
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by name, address, or contact no."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Paper>

                <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                  {filteredRecords.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                      <FolderIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                      <Typography variant="h6" gutterBottom>
                        {searchTerm ? 'No records found' : 'No records yet'}
                      </Typography>
                      <Typography variant="body2">
                        {searchTerm
                          ? 'Try a different search term'
                          : 'Create your first certificate to get started'}
                      </Typography>
                    </Paper>
                  ) : (
                    <Stack spacing={2}>
                      {filteredRecords.map((record) => (
                        <Card
                          key={record.certificate_of_residency_id}
                          sx={{
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            borderLeft: 4,
                            borderColor: 'primary.main',
                          }}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                              }}
                            >
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="subtitle1"
                                  sx={{ fontWeight: 600, mb: 0.5, color: '#000000' }}
                                >
                                  {record.full_name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mb: 1 }}
                                >
                                  {record.address}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                                  <Chip
                                    label={record.civil_status}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                  {record.contact_no && (
                                    <Typography variant="caption" color="text.secondary">
                                      {record.contact_no}
                                    </Typography>
                                  )}
                                  <Typography variant="caption" color="text.secondary">
                                    Issued: {formatDateDisplay(record.date_issued)}
                                  </Typography>
                                </Box>
                                {record.use_signature && (
                                  <Chip
                                    label="E-Signed"
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                    icon={<CheckCircleIcon />}
                                  />
                                )}
                              </Box>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Tooltip title="View">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleView(record)}
                                    color="primary"
                                  >
                                    <EyeIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEdit(record)}
                                    color="success"
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDelete(record.certificate_of_residency_id)}
                                    color="error"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* MOBILE FAB */}
        {isMobile && activeTab !== 'form' && (
          <Fab
            color="primary"
            aria-label="add"
            sx={{ position: 'absolute', bottom: 16, right: 16 }}
            onClick={() => { resetForm(); setIsFormOpen(true); setActiveTab('form'); }}
          >
            <AddIcon />
          </Fab>
        )}
      </Box>

      {/* ── CAMERA CAPTURE DIALOG ── */}
      <Dialog
        open={isCameraOpen}
        onClose={closeCameraCapture}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        <DialogTitle
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            py: 2,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhotoCameraIcon />
            <Typography variant="h6" fontWeight={700}>
              {capturedPreview ? 'Use this photo?' : 'Capture Applicant Photo'}
            </Typography>
          </Box>
          <IconButton size="small" onClick={closeCameraCapture} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* Live feed or captured preview */}
        <DialogContent sx={{ p: 0, bgcolor: '#000', position: 'relative', lineHeight: 0 }}>
          <Box sx={{ display: capturedPreview ? 'none' : 'block' }}>
            {cameraError ? (
              <Box
                sx={{
                  p: 4,
                  textAlign: 'center',
                  bgcolor: '#1a1a1a',
                  minHeight: 280,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                }}
              >
                <PhotoCameraIcon sx={{ fontSize: 48, color: '#555' }} />
                <Typography color="error" variant="body2" sx={{ maxWidth: 320 }}>
                  {cameraError}
                </Typography>
              </Box>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  display: 'block',
                  maxHeight: '420px',
                  objectFit: 'cover',
                }}
              />
            )}
          </Box>

          {capturedPreview && (
            <Box
              component="img"
              src={capturedPreview}
              alt="Captured photo preview"
              sx={{
                width: '100%',
                display: 'block',
                maxHeight: '420px',
                objectFit: 'cover',
              }}
            />
          )}
        </DialogContent>

        {/* Camera selector (only when live and multiple cameras) */}
        {!capturedPreview && cameraDevices.length > 1 && (
          <Box sx={{ px: 2, pt: 2, pb: 1, bgcolor: 'background.paper' }}>
            <FormControl fullWidth size="small">
              <InputLabel>Camera</InputLabel>
              <Select
                value={selectedCameraId}
                label="Camera"
                onChange={(e) => {
                  const nextId = e.target.value;
                  setSelectedCameraId(nextId);
                  startCamera(nextId);
                }}
              >
                {cameraDevices.map((device, index) => (
                  <MenuItem key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${index + 1}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        <DialogActions sx={{ p: 2, gap: 1, bgcolor: 'background.paper' }}>
          {capturedPreview ? (
            <>
              <Button
                onClick={retakePhoto}
                variant="outlined"
                color="primary"
                startIcon={<ResetIcon />}
                sx={{ flex: 1 }}
              >
                Retake
              </Button>
              <Button
                onClick={confirmApplicantPhoto}
                variant="contained"
                color="primary"
                startIcon={<CheckCircleIcon />}
                sx={{ flex: 1 }}
              >
                Use Photo
              </Button>
            </>
          ) : (
            <>
              <Button onClick={closeCameraCapture} variant="outlined" color="primary">
                Cancel
              </Button>
              {cameraError && (
                <Button
                  onClick={() => startCamera(selectedCameraId)}
                  variant="outlined"
                  color="primary"
                >
                  Retry Camera
                </Button>
              )}
              <Button
                onClick={captureApplicantPhoto}
                variant="contained"
                color="primary"
                startIcon={<PhotoCameraIcon />}
                disabled={!!cameraError}
                sx={{ flex: 1 }}
              >
                Capture
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* ── QR Code Details Dialog ── */}
      <Dialog open={qrDialogOpen} onClose={() => setQrDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          Certificate Details
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>Certificate ID:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {display.certificate_of_residency_id || 'Draft (Not yet saved)'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>Transaction Number:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {display.transaction_number || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>Full Name:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {display.full_name}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>Address:</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>{display.address}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>Date of Birth:</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {display.dob ? formatDateDisplay(display.dob) : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>Age:</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>{display.age}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>Civil Status:</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>{display.civil_status}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>Remarks:</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>{display.remarks}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>Request Reason:</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {display.request_reason}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>Date Issued:</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {formatDateDisplay(display.date_issued)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>Date Created:</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {display.date_created ? formatDateTimeDisplay(display.date_created) : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>E-Signature:</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {display.use_signature ? 'Yes' : 'No'}
              </Typography>
            </Grid>
            {display.use_signature && (
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: 'grey.600' }}>Signed By:</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {display.official_name} - {display.designation}
                </Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)} color="primary">Close</Button>
          {display.certificate_of_residency_id && (
            <Button
              onClick={() => {
                const verificationUrl = `${window.location.origin}/verify-certificate?id=${display.certificate_of_residency_id}`;
                window.open(verificationUrl, '_blank');
                setQrDialogOpen(false);
              }}
              variant="contained"
              color="primary"
            >
              Go to Verification Page
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* ── Valid Certificate Warning Dialog ── */}
      <Dialog
        open={showValidCertDialog}
        onClose={() => setShowValidCertDialog(false)}
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ bgcolor: '#41644A', color: 'white', py: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Resident Has Valid Certificate
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography>
            This resident already has a valid Certificate of Residency issued on{' '}
            {validCertInfo && formatDateDisplay(validCertInfo.date_issued)}. Certificates are valid
            for 6 months.
          </Typography>
          <Typography sx={{ mt: 2 }}>
            Are you sure you want to create a new certificate for this resident?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #F1F0E9' }}>
          <Button
            onClick={() => setShowValidCertDialog(false)}
            variant="outlined"
            sx={{ borderColor: '#41644A', color: '#41644A' }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmSaveWithValidCert}
            variant="contained"
            sx={{ bgcolor: '#E9762B', '&:hover': { bgcolor: '#d8651f' } }}
          >
            Create Anyway
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';
import CaloocanLogo from '../../assets/CaloocanLogo.png';
import Logo145 from '../../assets/Logo145.png';
import BagongPilipinas from '../../assets/BagongPilipinas.png';
import WordName from '../../assets/WordName.png';
import Monumento from '../../assets/Monumento.png';
import { useCertificateManager } from '../../hooks/useCertificateManager';
import { useAuth } from '../../contexts/AuthContext';
import {
  getSignatures,
  getSignatureImageUrl,
} from '../../services/signatureService';

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
  Print as PrintIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RestartAlt as ResetIcon,
  Folder as FolderIcon,
  Article as ArticleIcon,
  CheckCircle as CheckCircleIcon,
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
          '&:hover': { boxShadow: '0 4px 8px rgba(0,0,0,0.15)' },
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
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          minHeight: 48,
          color: '#000000',
          '&.Mui-selected': { color: '#41644A' },
        },
      },
    },
    MuiInputBase: { styleOverrides: { input: { color: '#000000' } } },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#000000',
          '&.Mui-focused': { color: '#41644A' },
        },
      },
    },
    MuiFormHelperText: { styleOverrides: { root: { color: '#000000' } } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#000000' },
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
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#000000' },
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

export default function Indigency() {
  const apiBase = 'http://localhost:5000';
  const navigate = useNavigate();

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

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { saveCertificate, getValidityPeriod } =
    useCertificateManager('Barangay Indigency');
  const { getToken } = useAuth();

  const getAuthHeaders = () => {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  const [formData, setFormData] = useState({
    resident_id: '',
    full_name: '',
    address: '',
    barangay: '',
    provincial_address: '',
    dob: '',
    age: '',
    civil_status: 'Single',
    contact_no: '',
    source_of_income: '',
    monthly_income: '',
    request_reason: '',
    remarks: '',
    date_issued: new Date().toISOString().split('T')[0],
    transaction_number: '',
    control_no: generateControlNumber(),
    prepared_by_name: '',
    prepared_by_position: '',
    use_signature: false,
    signature_id: null,
  });

  const civilStatusOptions = [
    'Single',
    'Married',
    'Widowed',
    'Divorced',
    'Separated',
  ];

  function formatDateDisplay(dateString) {
    if (!dateString) return '';
    const dateOnly = dateString.includes('T')
      ? dateString.split('T')[0]
      : dateString;
    const [year, month, day] = dateOnly.split('-');
    const monthNames = [
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
    return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
  }

  function formatDateTimeDisplay(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const monthNames = [
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
    const birthDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
    );
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age.toString();
  }

  function generateTransactionNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = (Math.floor(Math.random() * 900) + 100).toString();
    return `IND-${year}${month}${day}-${random}`;
  }

  function generateControlNumber() {
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `2026145-${random}`;
  }

  function storeCertificateData(certificateData) {
    if (!certificateData.indigency_id) return;
    const existingCertificates = JSON.parse(
      localStorage.getItem('certificates') || '{}',
    );
    existingCertificates[certificateData.indigency_id] = certificateData;
    localStorage.setItem('certificates', JSON.stringify(existingCertificates));
  }

  async function loadResidents() {
    try {
      const res = await fetch(`${apiBase}/residents`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      setResidents(
        data.map((r) => ({ ...r, dob: r.dob ? r.dob.split('T')[0] : '' })),
      );
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
      const res = await fetch(`${apiBase}/indigency`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      setRecords(
        Array.isArray(data)
          ? data.map((r) => ({
              indigency_id: r.indigency_id,
              resident_id: r.resident_id,
              full_name: r.full_name,
              address: r.address,
              barangay: r.barangay || '',
              provincial_address: r.provincial_address || '',
              dob: r.dob?.split('T')[0] || '',
              age: String(r.age ?? ''),
              civil_status: r.civil_status,
              contact_no: r.contact_no || '',
              source_of_income: r.source_of_income || '',
              monthly_income: r.monthly_income || '',
              request_reason: r.request_reason,
              remarks: r.remarks || '',
              date_issued: r.date_issued?.split('T')[0] || '',
              date_created: r.date_created,
              transaction_number:
                r.transaction_number || generateTransactionNumber(),
              control_no: r.control_no || '',
              prepared_by_name: r.prepared_by_name || '',
              prepared_by_position: r.prepared_by_position || '',
              use_signature: Boolean(r.use_signature),
              signature_id: r.signature_id || null,
              official_name: r.official_name || null,
              designation: r.designation || null,
              signature_path: r.signature_path || null,
            }))
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
    if (
      data &&
      data.use_signature &&
      data.signature_id &&
      !data.signature_path
    ) {
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
      if (display.indigency_id || display.full_name) {
        storeCertificateData(display);
        const qrContent = `CERTIFICATE VERIFICATION:
                Transaction No: ${display.transaction_number || 'N/A'}
                Name: ${display.full_name}
                Date Issued: ${display.date_created ? formatDateTimeDisplay(display.date_created) : new Date().toLocaleString()}
                Document Type: Indigency
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
      barangay: data.barangay || null,
      provincial_address: data.provincial_address || null,
      dob: data.dob || null,
      age: data.age ? Number(data.age) : null,
      civil_status: data.civil_status,
      contact_no: data.contact_no || null,
      source_of_income: data.source_of_income || null,
      monthly_income: data.monthly_income || null,
      request_reason: data.request_reason,
      remarks: data.remarks || null,
      date_issued: data.date_issued,
      transaction_number: data.transaction_number,
      control_no: data.control_no || null,
      prepared_by_name: data.prepared_by_name || null,
      prepared_by_position: data.prepared_by_position || null,
      use_signature: data.use_signature ? 1 : 0,
      signature_id:
        data.use_signature && data.signature_id ? data.signature_id : null,
    };
  }

  async function handleCreate() {
    try {
      const transactionNumber = generateTransactionNumber();
      const validityPeriod = getValidityPeriod('Barangay Indigency');
      const updatedFormData = {
        ...formData,
        transaction_number: transactionNumber,
        date_created: new Date().toISOString(),
        validity_period: validityPeriod,
      };
      const res = await fetch(`${apiBase}/indigency`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(toServerPayload(updatedFormData)),
      });
      if (!res.ok) throw new Error('Create failed');
      const created = await res.json();
      const newRec = { ...updatedFormData, indigency_id: created.indigency_id };
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
      const validityPeriod = getValidityPeriod('Barangay Indigency');
      const updatedFormData = { ...formData, validity_period: validityPeriod };
      const res = await fetch(`${apiBase}/indigency/${editingId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(toServerPayload(updatedFormData)),
      });
      if (!res.ok) throw new Error('Update failed');
      const updatedData = await res.json();
      const updatedRec = { ...updatedData, validity_period: validityPeriod };
      setRecords([
        updatedRec,
        ...records.filter((r) => r.indigency_id !== editingId),
      ]);
      setSelectedRecord(updatedRec);
      await saveCertificate(updatedRec, false);
      storeCertificateData(updatedRec);
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
    setEditingId(record.indigency_id);
    setIsFormOpen(true);
    setActiveTab('form');
    if (record.signature_id) {
      setSelectedSignature(
        signatures.find((s) => s.signature_id === record.signature_id) || null,
      );
    } else {
      setSelectedSignature(null);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this record?')) return;
    try {
      const res = await fetch(`${apiBase}/indigency/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Delete failed');
      setRecords(records.filter((r) => r.indigency_id !== id));
      if (selectedRecord?.indigency_id === id) setSelectedRecord(null);
      const existingCertificates = JSON.parse(
        localStorage.getItem('certificates') || '{}',
      );
      delete existingCertificates[id];
      localStorage.setItem(
        'certificates',
        JSON.stringify(existingCertificates),
      );
    } catch (e) {
      console.error(e);
      alert('Failed to delete record');
    }
  }

  function handleView(record) {
    setSelectedRecord(record);
    setFormData({
      ...record,
      use_signature: Boolean(record.use_signature),
      signature_id: record.signature_id || null,
    });
    setEditingId(record.indigency_id);
    setIsFormOpen(true);
    setActiveTab('form');
    if (record.signature_id) {
      setSelectedSignature(
        signatures.find((s) => s.signature_id === record.signature_id) || null,
      );
    } else {
      setSelectedSignature(null);
    }
  }

  function resetForm() {
    setFormData({
      resident_id: '',
      full_name: '',
      address: '',
      barangay: '',
      provincial_address: '',
      dob: '',
      age: '',
      civil_status: 'Single',
      contact_no: '',
      source_of_income: '',
      monthly_income: '',
      request_reason: '',
      remarks: '',
      date_issued: new Date().toISOString().split('T')[0],
      transaction_number: '',
      control_no: generateControlNumber(),
      prepared_by_name: '',
      prepared_by_position: '',
      use_signature: false,
      signature_id: null,
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
        return new Date(record.date_issued) >= sixMonthsAgo;
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
    if (!display.indigency_id) {
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
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: [8.5, 11],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, 8.5, 11);
      pdf.save(
        `Indigency_Certificate_${display.indigency_id}_${display.full_name.replace(/\s+/g, '_')}.pdf`,
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  }

  function handlePrint() {
    if (!display.indigency_id) {
      alert('Please save the record first before printing');
      return;
    }
    const certificateElement = document.getElementById('certificate-preview');
    if (!certificateElement) {
      alert('Certificate not found for printing.');
      return;
    }
    const iframe = document.createElement('iframe');
    iframe.style.cssText =
      'position:absolute;left:-9999px;top:0;width:0;height:0;';
    document.body.appendChild(iframe);
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.write(`<!DOCTYPE html><html><head><title>Print Certificate</title>
      <style>
        @page { size: 8.5in 13in; margin: 0; }
        body { margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        #certificate-preview { width: 8.5in; height: 13in; position: relative; overflow: hidden; background: white; box-sizing: border-box; }
        #certificate-preview * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      </style></head><body>${certificateElement.outerHTML}</body></html>`);
    iframeDoc.close();
    setTimeout(() => {
      const iframeWindow = iframe.contentWindow || iframe;
      iframeWindow.focus();
      iframeWindow.print();
      window.onafterprint = () => {
        document.body.removeChild(iframe);
      };
      setTimeout(() => {
        if (document.body.contains(iframe)) document.body.removeChild(iframe);
      }, 1000);
    }, 250);
  }

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.1, 0.3));
  const handleResetZoom = () => setZoomLevel(0.75);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          handleZoomIn();
        } else if (e.key === '-') {
          e.preventDefault();
          handleZoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          handleResetZoom();
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [zoomLevel]);

  // ── Helper: parse date_issued into day / month / year ──────────────────────
  function getIssuedParts(dateStr) {
    if (!dateStr) return { day: '___', month: '________', year: '____' };
    const d = new Date(dateStr + 'T00:00:00');
    const monthNames = [
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
    return {
      day: d.getDate(),
      month: monthNames[d.getMonth()],
      year: d.getFullYear(),
    };
  }

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
                  Certificate of Indigency
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Manage all records of the Certificate of Indigency
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Badge badgeContent={records.length} color="secondary">
                <Chip
                  icon={<FolderIcon />}
                  label="Total Records"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              </Badge>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<AddIcon />}
                onClick={() => {
                  resetForm();
                  setIsFormOpen(true);
                  setActiveTab('form');
                }}
                sx={{ borderRadius: 20, px: 3 }}
              >
                New Certificate
              </Button>
            </Box>
          </Box>

          {/* NAVIGATION TABS */}
          <Box
            sx={{
              bgcolor: 'background.paper',
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
              <Tabs
                value={activeTab}
                onChange={(e, nv) => setActiveTab(nv)}
                variant="fullWidth"
                sx={{
                  '& .MuiTabs-indicator': {
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                  },
                  minHeight: 48,
                }}
              >
                <Tab
                  icon={<ArticleIcon />}
                  label="Form"
                  value="form"
                  iconPosition="start"
                />
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
                    <IconButton
                      onClick={handleZoomOut}
                      color="primary"
                      size="small"
                    >
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
                    <IconButton
                      onClick={handleZoomIn}
                      color="primary"
                      size="small"
                    >
                      <ZoomInIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reset Zoom">
                    <IconButton
                      onClick={handleResetZoom}
                      color="primary"
                      size="small"
                    >
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
                      disabled={!display.indigency_id || isGeneratingPDF}
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
                      disabled={!display.indigency_id}
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
              <Box
                sx={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'top center',
                }}
              >
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
                        style={{
                          width: '120px',
                          height: '120px',
                          objectFit: 'contain',
                        }}
                      />
                      <div
                        style={{
                          textAlign: 'center',
                          flex: 1,
                          padding: '0 20px',
                        }}
                      >
                        <div
                          style={{
                            fontFamily: 'Old English Text MT',
                            fontSize: '16pt',
                          }}
                        >
                          Republic of the Philippines
                        </div>
                        <div
                          style={{
                            fontFamily: '"Times New Roman"',
                            fontSize: '16pt',
                            marginTop: '2px',
                          }}
                        >
                          City of Caloocan
                        </div>
                        <div
                          style={{
                            fontFamily: '"Times New Roman"',
                            fontSize: '16pt',
                            marginTop: '2px',
                          }}
                        >
                          Barangay 145, Zone 13, District 1
                        </div>
                        <div
                          style={{
                            fontFamily: '"Times New Roman"',
                            fontSize: '12pt',
                            marginTop: '2px',
                          }}
                        >
                          Reparo St. Cor. Gen. Tirona St. Bagong Barrio,
                          Caloocan City
                        </div>
                      </div>
                      <img
                        src={Logo145}
                        alt="Barangay 145 Logo"
                        style={{
                          width: '120px',
                          height: '120px',
                          objectFit: 'contain',
                        }}
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
                      CERTIFICATE OF INDIGENCY
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

                      {/* Paragraph 1 */}
                      <p style={{ margin: '0 0 10px 0', textIndent: '50px' }}>
                        This is to certify that{' '}
                        <strong>
                          {display.full_name || '_______________'}
                        </strong>
                        , <strong>{display.age || '__'}</strong> years old,{' '}
                        <strong>{display.civil_status || '______'}</strong>, and
                        a resident of{' '}
                        <strong>{display.address || '_______________'}</strong>,
                        Caloocan City, belongs to the indigent family's barangay
                        of{' '}
                        <strong>{display.barangay || '_______________'}</strong>
                        .
                      </p>

                      {/* Paragraph 2 - HIDDEN */}
                      <p
                        style={{
                          margin: '0 0 10px 0',
                          textIndent: '50px',
                          display: 'none',
                        }}
                      >
                        This certification is issued upon the request of the
                        above-mentioned individual is currently working as a{' '}
                        <strong>
                          {display.source_of_income || '_______________'}
                        </strong>{' '}
                        and is only earning{' '}
                        <strong>
                          {display.monthly_income || '_______________'}
                        </strong>{' '}
                        per month.
                      </p>

                      {/* Paragraph 3 */}
                      <p style={{ margin: '0 0 10px 0', textIndent: '50px' }}>
                        This certification is issued upon the request of the
                        above-mentioned individual for{' '}
                        <strong>
                          {display.request_reason || '_______________'}
                        </strong>{' '}
                        and is valid for six (6) months from the date of its
                        issuance.
                      </p>

                      {/* Issued line */}
                      {(() => {
                        const { day, month, year } = getIssuedParts(
                          display.date_issued,
                        );
                        return (
                          <p
                            style={{ margin: '0 0 6px 0', textIndent: '50px' }}
                          >
                            Issued this <strong>{day}</strong> day of{' '}
                            <strong>{month}</strong>, <strong>{year}</strong>,
                            at Barangay{' '}
                            <strong>{display.barangay || '_______'}</strong>,
                            Caloocan City.
                          </p>
                        );
                      })()}
                    </div>

                    {/* Photo & Thumbmark */}
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
                          }}
                        />
                        <div style={{ fontSize: '10pt', marginTop: '6px' }}>
                          Applicant Photo
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            width: '150px',
                            height: '150px',
                            border: '1.5px solid #000',
                          }}
                        />
                        <div style={{ fontSize: '10pt', marginTop: '6px' }}>
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
                      <div
                        style={{
                          textAlign: 'center',
                          width: '300px',
                          marginTop: '50px',
                        }}
                      >
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
                              style={{
                                maxWidth: '200px',
                                maxHeight: '65px',
                                objectFit: 'contain',
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
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
                    <div
                      style={{ padding: '30px 70px 0 70px', fontSize: '11pt' }}
                    >
                      <div>Barangay Seal</div>
                      <div style={{ marginTop: '4px' }}>
                        Control No.{' '}
                        <span
                          style={{ minWidth: '120px', display: 'inline-block' }}
                        >
                          {display.control_no ||
                            '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}
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
                          This certification is not valid without the Official
                          Barangay Dry Seal and the Barangay Chairman's
                          Signature/Stamp.
                        </li>
                        <li>
                          Officials and applicants who submit false
                          certifications or documents shall be held liable for
                          administrative/criminal liabilities.
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
                          <strong>
                            {display.prepared_by_name || 'Roselyn Anore'}
                          </strong>
                        </div>
                        <div style={{ marginLeft: '80px' }}>
                          <strong>
                            {display.prepared_by_position ||
                              'Barangay Secretary'}
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
                        <strong>
                          valid for six (6) months from the date of issuance.
                        </strong>
                      </div>
                      <div
                        style={{
                          marginTop: '12px',
                          textAlign: 'right',
                          paddingRight: '10px',
                          height: '110px',
                          visibility:
                            qrCodeUrl && display.use_signature
                              ? 'visible'
                              : 'hidden',
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
                  {/* end zIndex wrapper */}
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
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                <Paper
                  elevation={0}
                  sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <ArticleIcon color="primary" />
                    {editingId
                      ? 'Edit Certificate'
                      : 'New Certificate of Indigency'}
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
                      value={
                        residents.find(
                          (r) => r.full_name === formData.full_name,
                        ) || null
                      }
                      onChange={(e, nv) => {
                        if (nv) {
                          setFormData({
                            ...formData,
                            resident_id: nv.resident_id,
                            full_name: nv.full_name,
                            address: nv.address || '',
                            provincial_address: nv.provincial_address || '',
                            dob: nv.dob ? nv.dob.slice(0, 10) : '',
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
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      required
                    />

                    {/* Barangay */}
                    <TextField
                      label="Barangay"
                      variant="outlined"
                      fullWidth
                      size="small"
                      placeholder="e.g. 145"
                      value={formData.barangay}
                      onChange={(e) =>
                        setFormData({ ...formData, barangay: e.target.value })
                      }
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
                          sx={{
                            '& .MuiOutlinedInput-root': { bgcolor: 'grey.100' },
                          }}
                        />
                      </Grid>
                    </Grid>

                    {/* Civil Status */}
                    <FormControl fullWidth size="small">
                      <InputLabel>Civil Status</InputLabel>
                      <Select
                        value={formData.civil_status}
                        label="Civil Status"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            civil_status: e.target.value,
                          })
                        }
                      >
                        {civilStatusOptions.map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Contact Number */}
                    <TextField
                      label="Contact Number"
                      variant="outlined"
                      fullWidth
                      size="small"
                      placeholder="09XXXXXXXXX"
                      value={formData.contact_no}
                      onChange={(e) =>
                        setFormData({ ...formData, contact_no: e.target.value })
                      }
                    />

                    {/* Provincial Address */}
                    <TextField
                      label="Provincial Address"
                      variant="outlined"
                      fullWidth
                      size="small"
                      value={formData.provincial_address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          provincial_address: e.target.value,
                        })
                      }
                    />

                    {/* Source of Income & Monthly Income - HIDDEN */}
                    <Grid container spacing={2} sx={{ display: 'none' }}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Source of Income"
                          variant="outlined"
                          fullWidth
                          size="small"
                          placeholder="e.g. Vendor, Driver"
                          value={formData.source_of_income}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              source_of_income: e.target.value,
                            })
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Monthly Income"
                          variant="outlined"
                          fullWidth
                          size="small"
                          placeholder="e.g. ₱5,000"
                          value={formData.monthly_income}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              monthly_income: e.target.value,
                            })
                          }
                        />
                      </Grid>
                    </Grid>

                    {/* Purpose / Request Reason */}
                    <TextField
                      label="Purpose of Certificate"
                      variant="outlined"
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                      placeholder="Job application, School enrollment, etc."
                      value={formData.request_reason}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          request_reason: e.target.value,
                        })
                      }
                      required
                    />

                    {/* Remarks */}
                    <TextField
                      label="Remarks"
                      variant="outlined"
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                      value={formData.remarks}
                      onChange={(e) =>
                        setFormData({ ...formData, remarks: e.target.value })
                      }
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
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          date_issued: e.target.value,
                        })
                      }
                      required
                    />

                    {/* Control No. */}
                    <TextField
                      label="Control No."
                      variant="outlined"
                      fullWidth
                      size="small"
                      value={formData.control_no}
                      InputProps={{ readOnly: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': { bgcolor: 'grey.100' },
                      }}
                    />

                    {/* Prepared By */}
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Prepared By (Name)"
                          variant="outlined"
                          fullWidth
                          size="small"
                          placeholder="e.g. Roselyn Anore"
                          value={formData.prepared_by_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              prepared_by_name: e.target.value,
                            })
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Prepared By (Position)"
                          variant="outlined"
                          fullWidth
                          size="small"
                          placeholder="e.g. Barangay Secretary"
                          value={formData.prepared_by_position}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              prepared_by_position: e.target.value,
                            })
                          }
                        />
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 1 }} />

                    {/* E-Signature */}
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.use_signature || false}
                          color="primary"
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
                        />
                      }
                      label="Add E-Signature"
                    />

                    {formData.use_signature && (
                      <Autocomplete
                        options={signatures}
                        getOptionLabel={(opt) =>
                          `${opt.official_name} - ${opt.designation}`
                        }
                        value={selectedSignature}
                        onChange={(e, newValue) => {
                          setSelectedSignature(newValue);
                          setFormData({
                            ...formData,
                            signature_id: newValue
                              ? newValue.signature_id
                              : null,
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
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                <Paper
                  elevation={0}
                  sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
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
                    <Paper
                      sx={{
                        p: 4,
                        textAlign: 'center',
                        color: 'text.secondary',
                      }}
                    >
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
                          key={record.indigency_id}
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
                                  sx={{
                                    fontWeight: 600,
                                    mb: 0.5,
                                    color: '#000000',
                                  }}
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
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 1,
                                    gap: 1,
                                  }}
                                >
                                  <Chip
                                    label={record.civil_status}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                  {record.contact_no && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {record.contact_no}
                                    </Typography>
                                  )}
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Issued:{' '}
                                    {formatDateDisplay(record.date_issued)}
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
                                    onClick={() =>
                                      handleDelete(record.indigency_id)
                                    }
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
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
              setActiveTab('form');
            }}
          >
            <AddIcon />
          </Fab>
        )}
      </Box>

      {/* QR Code Details Dialog */}
      <Dialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          Certificate Details
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Certificate ID:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {display.indigency_id || 'Draft'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Transaction Number:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {display.transaction_number || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Full Name:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {display.full_name}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Address:
              </Typography>
              <Typography variant="body1">{display.address}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Barangay:
              </Typography>
              <Typography variant="body1">
                {display.barangay || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Date of Birth:
              </Typography>
              <Typography variant="body1">
                {display.dob ? formatDateDisplay(display.dob) : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Age:
              </Typography>
              <Typography variant="body1">{display.age}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Civil Status:
              </Typography>
              <Typography variant="body1">{display.civil_status}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Source of Income:
              </Typography>
              <Typography variant="body1">
                {display.source_of_income || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Monthly Income:
              </Typography>
              <Typography variant="body1">
                {display.monthly_income || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Request Reason:
              </Typography>
              <Typography variant="body1">{display.request_reason}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Control No.:
              </Typography>
              <Typography variant="body1">
                {display.control_no || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Date Issued:
              </Typography>
              <Typography variant="body1">
                {formatDateDisplay(display.date_issued)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Date Created:
              </Typography>
              <Typography variant="body1">
                {display.date_created
                  ? formatDateTimeDisplay(display.date_created)
                  : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Prepared By:
              </Typography>
              <Typography variant="body1">
                {display.prepared_by_name || 'N/A'} —{' '}
                {display.prepared_by_position || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                E-Signature:
              </Typography>
              <Typography variant="body1">
                {display.use_signature ? 'Yes' : 'No'}
              </Typography>
            </Grid>
            {display.use_signature && (
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: 'grey.600' }}>
                  Signed By:
                </Typography>
                <Typography variant="body1">
                  {display.official_name} — {display.designation}
                </Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Valid Certificate Warning Dialog */}
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
            This resident already has a valid Certificate of Indigency issued on{' '}
            {validCertInfo && formatDateDisplay(validCertInfo.date_issued)}.
            Certificates are valid for 6 months.
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

// ── CERTIFICATE VERIFICATION PAGE ────────────────────────────────────────────
function CertificateVerification() {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0.75);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const certificateId = urlParams.get('id');
    if (certificateId) {
      const certificates = JSON.parse(
        localStorage.getItem('certificates') || '{}',
      );
      const cert = certificates[certificateId];
      if (cert) setCertificate(cert);
      else setError('Certificate not found');
    } else {
      setError('No certificate ID provided');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const generateQRCode = async () => {
      if (certificate && certificate.indigency_id) {
        const qrContent = `CERTIFICATE VERIFICATION:
      Transaction No: ${certificate.transaction_number || 'N/A'}
      Name: ${certificate.full_name}
      Date Issued: ${certificate.date_created ? formatDateTimeDisplay(certificate.date_created) : new Date().toLocaleString()}
      Document Type: Indigency
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
      }
    };
    generateQRCode();
  }, [certificate]);

  function formatDateDisplay(dateString) {
    if (!dateString) return '';
    const dateOnly = dateString.includes('T')
      ? dateString.split('T')[0]
      : dateString;
    const [year, month, day] = dateOnly.split('-');
    const monthNames = [
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
    return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
  }

  function formatDateTimeDisplay(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const monthNames = [
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
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
  }

  function getIssuedParts(dateStr) {
    if (!dateStr) return { day: '___', month: '________', year: '____' };
    const d = new Date(dateStr + 'T00:00:00');
    const monthNames = [
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
    return {
      day: d.getDate(),
      month: monthNames[d.getMonth()],
      year: d.getFullYear(),
    };
  }

  async function generatePDF() {
    if (!certificate) return;
    setIsGeneratingPDF(true);
    try {
      const certificateElement = document.getElementById('certificate-preview');
      const canvas = await html2canvas(certificateElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: [8.5, 11],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, 8.5, 11);
      pdf.save(
        `Indigency_Certificate_${certificate.indigency_id}_${certificate.full_name.replace(/\s+/g, '_')}.pdf`,
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  }

  function handlePrint() {
    if (!certificate) return;
    window.print();
  }

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.1, 0.3));
  const handleResetZoom = () => setZoomLevel(0.75);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          handleZoomIn();
        } else if (e.key === '-') {
          e.preventDefault();
          handleZoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          handleResetZoom();
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [zoomLevel]);

  if (loading)
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Typography>Loading certificate...</Typography>
      </Box>
    );

  if (error)
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 2 }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 3,
              boxShadow: 1,
            }}
          >
            <Typography
              variant="h4"
              sx={{ fontWeight: 600, color: 'primary.main' }}
            >
              Certificate Verification
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handlePrint}
                startIcon={<PrintIcon />}
                sx={{ fontWeight: 600, px: 3 }}
              >
                Print
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                startIcon={<FileTextIcon />}
                sx={{ fontWeight: 600, px: 3 }}
              >
                {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
              </Button>
            </Box>
          </Box>

          {/* Certificate Details Panel */}
          <Paper sx={{ p: 4, mb: 2, borderRadius: 3, boxShadow: 1 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Certificate Details
            </Typography>
            <Grid container spacing={2}>
              {[
                { label: 'Certificate ID', value: certificate.indigency_id },
                {
                  label: 'Transaction Number',
                  value: certificate.transaction_number,
                },
                { label: 'Full Name', value: certificate.full_name },
                { label: 'Address', value: certificate.address },
                { label: 'Barangay', value: certificate.barangay || 'N/A' },
                {
                  label: 'Date of Birth',
                  value: formatDateDisplay(certificate.dob),
                },
                { label: 'Age', value: certificate.age },
                { label: 'Civil Status', value: certificate.civil_status },
                {
                  label: 'Source of Income',
                  value: certificate.source_of_income || 'N/A',
                },
                {
                  label: 'Monthly Income',
                  value: certificate.monthly_income || 'N/A',
                },
                { label: 'Request Reason', value: certificate.request_reason },
                {
                  label: 'Control No.',
                  value: certificate.control_no || 'N/A',
                },
                {
                  label: 'Date Issued',
                  value: formatDateDisplay(certificate.date_issued),
                },
                {
                  label: 'Date Created',
                  value: certificate.date_created
                    ? formatDateTimeDisplay(certificate.date_created)
                    : 'N/A',
                },
                {
                  label: 'Prepared By',
                  value: `${certificate.prepared_by_name || 'N/A'} — ${certificate.prepared_by_position || 'N/A'}`,
                },
                {
                  label: 'E-Signature',
                  value: certificate.use_signature ? 'Yes' : 'No',
                },
              ].map(({ label, value }) => (
                <Grid item xs={12} md={6} key={label}>
                  <Typography variant="body2" sx={{ color: 'grey.600' }}>
                    {label}:
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.primary' }}>
                    {value}
                  </Typography>
                </Grid>
              ))}
              {certificate.use_signature && (
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ color: 'grey.600' }}>
                    Signed By:
                  </Typography>
                  <Typography variant="body1">
                    {certificate.official_name} — {certificate.designation}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Zoom Controls */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 2,
              gap: 1,
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 3,
              boxShadow: 1,
            }}
          >
            <IconButton
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.3}
              color="primary"
              sx={{ border: '1px solid', borderColor: 'grey.300' }}
            >
              <ZoomOutIcon />
            </IconButton>
            <Typography
              variant="body2"
              sx={{ minWidth: '60px', textAlign: 'center', fontWeight: 600 }}
            >
              {Math.round(zoomLevel * 100)}%
            </Typography>
            <IconButton
              onClick={handleZoomIn}
              disabled={zoomLevel >= 2}
              color="primary"
              sx={{ border: '1px solid', borderColor: 'grey.300' }}
            >
              <ZoomInIcon />
            </IconButton>
            <IconButton
              onClick={handleResetZoom}
              color="primary"
              size="small"
              sx={{ border: '1px solid', borderColor: 'grey.300' }}
            >
              <ResetIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Certificate Preview */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              overflow: 'auto',
              padding: '20px 0',
            }}
          >
            <div
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top center',
              }}
            >
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
                <img
                  src={Monumento}
                  alt="Monumento Background"
                  style={{
                    position: 'absolute',
                    left: 220,
                    top: 220,
                    height: '100%',
                    width: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center top',
                    opacity: 0.5,
                    zIndex: 0,
                    transform: 'scale(0.8)',
                    transformOrigin: 'top right',
                  }}
                />

                <div style={{ position: 'relative', zIndex: 1 }}>
                  {/* Header */}
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
                      style={{
                        width: '90px',
                        height: '90px',
                        objectFit: 'contain',
                      }}
                    />
                    <div
                      style={{
                        textAlign: 'center',
                        flex: 1,
                        padding: '0 20px',
                      }}
                    >
                      <div
                        style={{
                          fontFamily:
                            ' "Old English Text MT", ',
                          fontSize: '15pt',
                        }}
                      >
                        Republic of the Philippines
                      </div>
                      <div
                        style={{
                          fontFamily: '"Times New Roman"',
                          fontSize: '14pt',
                          marginTop: '2px',
                        }}
                      >
                        City of Caloocan
                      </div>
                      <div
                        style={{
                          fontFamily: '"Times New Roman"',
                          fontSize: '13pt',
                          fontWeight: 'bold',
                          marginTop: '2px',
                        }}
                      >
                        Barangay 145, Zone 13, District 1
                      </div>
                      <div
                        style={{
                          fontFamily: '"Times New Roman"',
                          fontSize: '10pt',
                          marginTop: '2px',
                        }}
                      >
                        Reparo St. Cor. Gen. Tirona St. Bagong Barrio, Caloocan
                        City
                      </div>
                    </div>
                    <img
                      src={Logo145}
                      alt="Barangay 145 Logo"
                      style={{
                        width: '90px',
                        height: '90px',
                        objectFit: 'contain',
                      }}
                    />
                  </div>

                  <div
                    style={{ borderTop: '3px solid #000', margin: '0 50px' }}
                  />
                  <div
                    style={{
                      borderTop: '1px solid #000',
                      margin: '3px 50px 0 50px',
                    }}
                  />
                  <div
                    style={{
                      textAlign: 'center',
                      fontFamily: '"Times New Roman"',
                      fontSize: '13pt',
                      fontWeight: 'bold',
                      marginTop: '10px',
                    }}
                  >
                    OFFICE OF THE SANGGUNIANG BARANGAY
                  </div>
                  <div
                    style={{
                      borderTop: '1px solid #000',
                      margin: '8px 50px 0 50px',
                    }}
                  />
                  <div
                    style={{
                      borderTop: '3px solid #000',
                      margin: '3px 50px 0 50px',
                    }}
                  />
                  <div
                    style={{
                      textAlign: 'center',
                      fontFamily: '"Times New Roman"',
                      fontSize: '16pt',
                      fontWeight: 'bold',
                      margin: '16px 0 14px 0',
                      textDecoration: 'underline',
                    }}
                  >
                    CERTIFICATE OF INDIGENCY
                  </div>

                  {/* Body */}
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
                      <strong>
                        {certificate.full_name || '_______________'}
                      </strong>
                      , <strong>{certificate.age || '__'}</strong> years old,{' '}
                      <strong>{certificate.civil_status || '______'}</strong>,
                      and a resident of{' '}
                      <strong>
                        {certificate.address || '_______________'}
                      </strong>
                      , Caloocan City, belongs to the indigent family's barangay
                      of{' '}
                      <strong>
                        {certificate.barangay || '_______________'}
                      </strong>
                      .
                    </p>
                    <p style={{ margin: '0 0 10px 0', textIndent: '50px' }}>
                      The above-mentioned individual is currently working as a{' '}
                      <strong>
                        {certificate.source_of_income || '_______________'}
                      </strong>{' '}
                      and is only earning{' '}
                      <strong>
                        {certificate.monthly_income || '_______________'}
                      </strong>{' '}
                      per month.
                    </p>
                    <p style={{ margin: '0 0 10px 0', textIndent: '50px' }}>
                      This certification is issued upon the request of the
                      above-mentioned individual for{' '}
                      <strong>
                        {certificate.request_reason || '_______________'}
                      </strong>{' '}
                      and is valid for six (6) months from the date of its
                      issuance.
                    </p>
                    {(() => {
                      const { day, month, year } = getIssuedParts(
                        certificate.date_issued,
                      );
                      return (
                        <p style={{ margin: '0 0 6px 0', textIndent: '50px' }}>
                          Issued this <strong>{day}</strong> day of{' '}
                          <strong>{month}</strong>, <strong>{year}</strong>, at
                          Barangay{' '}
                          <strong>{certificate.barangay || '_______'}</strong>,
                          Caloocan City.
                        </p>
                      );
                    })()}
                  </div>

                  {/* Signed */}
                  <div
                    style={{
                      textAlign: 'right',
                      padding: '10px 120px 0 0',
                      fontFamily: '"Times New Roman"',
                      fontSize: '12pt',
                      fontWeight: 'bold',
                    }}
                  >
                    Signed:
                  </div>

                  {/* Photo & Thumbmark */}
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
                          width: '120px',
                          height: '140px',
                          border: '1.5px solid #000',
                        }}
                      />
                      <div style={{ fontSize: '10pt', marginTop: '6px' }}>
                        Applicant Photo
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          width: '120px',
                          height: '140px',
                          border: '1.5px solid #000',
                        }}
                      />
                      <div style={{ fontSize: '10pt', marginTop: '6px' }}>
                        Applicant Thumbmark
                      </div>
                    </div>
                  </div>

                  {/* Punong Barangay */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      padding: '0 70px',
                      marginTop: '10px',
                    }}
                  >
                    <div style={{ textAlign: 'center', width: '300px' }}>
                      {certificate.use_signature &&
                      certificate.signature_path ? (
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
                            src={getSignatureImageUrl(
                              certificate.signature_path,
                            )}
                            alt="Signature"
                            style={{
                              maxWidth: '200px',
                              maxHeight: '65px',
                              objectFit: 'contain',
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
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
                      {qrCodeUrl && (
                        <div style={{ marginTop: '8px' }}>
                          <img
                            src={qrCodeUrl}
                            alt="QR Code"
                            style={{
                              width: '90px',
                              height: '90px',
                              display: 'block',
                              margin: '0 auto',
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
                            }}
                          >
                            {certificate.date_created
                              ? formatDateTimeDisplay(certificate.date_created)
                              : new Date().toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div
                    style={{ padding: '10px 70px 0 70px', fontSize: '11pt' }}
                  >
                    <div style={{ fontWeight: 'bold' }}>Barangay Seal</div>
                    <div style={{ fontWeight: 'bold', marginTop: '4px' }}>
                      Control No.{' '}
                      <span
                        style={{ minWidth: '120px', display: 'inline-block' }}
                      >
                        {certificate.control_no ||
                          '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}
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
                        This certification is not valid without the Official
                        Barangay Dry Seal and the Barangay Chairman's
                        Signature/Stamp.
                      </li>
                      <li>
                        Officials and applicants who submit false certifications
                        or documents shall be held liable for
                        administrative/criminal liabilities.
                      </li>
                    </ul>
                    <div
                      style={{
                        fontSize: '10pt',
                        marginTop: '8px',
                        fontFamily: '"Times New Roman"',
                      }}
                    >
                      <div>
                        Prepared by:{' '}
                        <strong>
                          {certificate.prepared_by_name || 'Roselyn Anore'}
                        </strong>
                      </div>
                      <div style={{ marginLeft: '80px' }}>
                        <strong>
                          {certificate.prepared_by_position ||
                            'Barangay Secretary'}
                        </strong>
                      </div>
                    </div>
                    <div
                      style={{
                        textAlign: 'center',
                        fontFamily: '"Times New Roman"',
                        fontSize: '11pt',
                        marginTop: '10px',
                        fontStyle: 'italic',
                      }}
                    >
                      This certification is valid for six (6) months from the
                      date of issuance.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <style>{`
            @media print {
              body * { visibility: hidden; }
              #certificate-preview, #certificate-preview * { visibility: visible; }
              #certificate-preview { position: absolute; left: 0; top: 0; width: 8.5in; height: 13in; }
              @page { size: portrait; margin: 0; }
              #certificate-preview * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
            }
          `}</style>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export { CertificateVerification };

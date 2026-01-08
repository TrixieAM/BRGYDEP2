import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import CaloocanLogo from '../../assets/CaloocanLogo.png';
import Logo145 from '../../assets/Logo145.png';
import BagongPilipinas from '../../assets/BagongPilipinas.png';
import WordName from '../../assets/WordName.png';
import { useCertificateManager } from '../../hooks/useCertificateManager';
import { getSignatures, getSignatureImageUrl } from '../../services/signatureService';

// Import Material UI components
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
} from '@mui/icons-material';
import { useMediaQuery } from '@mui/material';

// Define the custom theme matching other certificates
const theme = createTheme({
  palette: {
    primary: {
      main: '#41644A', // Darker green from palette
      light: '#A0B2A6', // Lighter shade for hover/focus
      dark: '#0D4715', // Even darker green for strong accents
    },
    secondary: {
      main: '#E9762B', // Orange from palette for highlighting
    },
    success: {
      main: '#41644A', // Darker green from palette
      light: '#A0B2A6',
      dark: '#0D4715',
    },
    background: {
      default: '#F1F0E9', // Off-white/light beige
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000000', // Black for main text
      secondary: '#41644A', // Another shade for secondary text
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

export default function CashAssistance() {
  const apiBase = 'http://localhost:5000';
  const navigate = useNavigate?.() || (() => {});
  const { getToken } = useAuth();

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
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
  const [selectedSecretarySignature, setSelectedSecretarySignature] = useState(null);
  const [selectedCaptainSignature, setSelectedCaptainSignature] = useState(null);

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { 
    saveCertificate, 
    getValidityPeriod,
    calculateExpirationDate 
  } = useCertificateManager('Cash Assistance');

  const [formData, setFormData] = useState({
    cash_assistance_id: '',
    resident_id: '',
    full_name: '',
    sinceYear: '',
    address: '',
    request_reason: '',
    date_issued: new Date().toISOString().split('T')[0],
    transaction_number: '',
    is_active: 1,
    date_created: '',
    use_signature: false, // Added for e-signature
    secretary_signature_id: null, // Added for secretary e-signature
    captain_signature_id: null, // Added for captain e-signature
  });

  // helper: format date without timezone issues
  function formatDateDisplay(dateString) {
    if (!dateString) return '';
    const dateOnly = dateString.includes('T') ? dateString.split('T')[0] : dateString;
    const [year, month, day] = dateOnly.split('-');
    const monthNames = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December'
    ];
    return `${monthNames[parseInt(month,10)-1]} ${parseInt(day,10)}, ${year}`;
  }

  // helper: format date/time for created date
  function formatDateTimeDisplay(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const monthNames = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December'
    ];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
  }

  // generate transaction number (CA-YYMMDD-######)
  function generateTransactionNumber() {
    const date = new Date();
    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `CA-${yy}${mm}${dd}-${rand}`;
  }

  // store certificate in localStorage for verification (same approach as other certificates)
  function storeCertificateData(certificateData) {
    if (!certificateData?.cash_assistance_id) return;
    const existing = JSON.parse(localStorage.getItem('certificates') || '{}');
    existing[certificateData.cash_assistance_id] = certificateData;
    localStorage.setItem('certificates', JSON.stringify(existing));
  }

  // load residents for autocomplete
  async function loadResidents() {
    try {
      const res = await fetch(`${apiBase}/residents`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      const formatted = Array.isArray(data)
        ? data.map((r) => ({ ...r, dob: r.dob ? r.dob.split('T')[0] : '', created_at: r.created_at || r.createdAt || null }))
        : [];
      setResidents(formatted);
    } catch (err) {
      console.error('Failed to load residents', err);
    }
  }

  // load signatures
  async function loadSignatures() {
    try {
      const data = await getSignatures();
      setSignatures(data);
    } catch (err) {
      console.warn('Could not load signatures:', err);
    }
  }

  // load cash assistance records
  async function loadRecords() {
    try {
      const res = await fetch(`${apiBase}/cash-assistance`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setRecords(
        Array.isArray(data)
          ? data.map((r) => ({
              cash_assistance_id: r.cash_assistance_id,
              resident_id: r.resident_id,
              full_name: r.full_name,
              sinceYear: r.since_year || r.sinceYear || '',
              address: r.address || '',
              request_reason: r.request_reason || '',
              date_issued: r.date_issued?.split('T')[0] || '',
              transaction_number: r.transaction_number || generateTransactionNumber(),
              is_active: r.is_active ?? 1,
              date_created: r.date_created,
              use_signature: Boolean(r.use_signature), // Added for e-signature
              secretary_signature_id: r.secretary_signature_id || null, // Added for secretary e-signature
              captain_signature_id: r.captain_signature_id || null, // Added for captain e-signature
              sec_official_name: r.sec_official_name || null, // Added for secretary e-signature
              sec_designation: r.sec_designation || null, // Added for secretary e-signature
              sec_signature_path: r.sec_signature_path || null, // Added for secretary e-signature
              cap_official_name: r.cap_official_name || null, // Added for captain e-signature
              cap_designation: r.cap_designation || null, // Added for captain e-signature
              cap_signature_path: r.cap_signature_path || null, // Added for captain e-signature
            }))
          : []
      );
    } catch (e) {
      console.error('Failed to load cash assistance records', e);
    }
  }

  useEffect(() => {
    loadResidents();
    loadRecords();
    loadSignatures();
  }, []);

  // when display changes or form changes, generate QR (and store certificate)
  const display = useMemo(() => {
    let data = null;
    if (editingId || isFormOpen) {
      data = formData;
    } else if (selectedRecord) {
      data = selectedRecord;
    } else {
      data = formData;
    }

    // If signature is enabled, ensure signature data is available
    if (
      data &&
      data.use_signature &&
      data.secretary_signature_id &&
      !data.sec_signature_path
    ) {
      const secSig = signatures.find((s) => s.signature_id === data.secretary_signature_id);
      if (secSig) {
        data = {
          ...data,
          sec_official_name: secSig.official_name,
          sec_designation: secSig.designation,
          sec_signature_path: secSig.signature_path,
        };
      }
    }

    if (
      data &&
      data.use_signature &&
      data.captain_signature_id &&
      !data.cap_signature_path
    ) {
      const capSig = signatures.find((s) => s.signature_id === data.captain_signature_id);
      if (capSig) {
        data = {
          ...data,
          cap_official_name: capSig.official_name,
          cap_designation: capSig.designation,
          cap_signature_path: capSig.signature_path,
        };
      }
    }

    return data;
  }, [editingId, isFormOpen, selectedRecord, formData, signatures]);

  useEffect(() => {
    const generateQRCode = async () => {
      if (!display) return setQrCodeUrl('');
      // store for verification
      storeCertificateData(display);
      const verificationUrl = `${window.location.origin}/verify-certificate?id=${display.cash_assistance_id || 'draft'}`;
      const qrContent = `CERTIFICATE VERIFICATION:
        𝗧𝗿𝗮𝗻𝘀𝗮𝗰𝘁𝗶𝗼𝗻 𝗡𝗼: ${display.transaction_number || 'N/A'}
        Name: ${display.full_name || ''}
        Date Issued: ${
        display.date_created
        ? formatDateTimeDisplay(display.date_created)
        : new Date().toLocaleString()
        }
        Document Type: Cash Assistance
       
        Ⓒ RRMS | BARANGAY 145
        CALOOCAN CITY
        ALL RIGHTS RESERVED
        `;
      try {
        const qr = await QRCode.toDataURL(qrContent, { 
          width: 140, 
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'L',
        });
        setQrCodeUrl(qr);
      } catch (err) {
        console.error('QR error', err);
      }
    };
    generateQRCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [display]);

  function toServerPayload(data) {
    return {
      resident_id: data.resident_id || null,
      full_name: data.full_name,
      since_year: data.sinceYear || null,
      address: data.address || null,
      request_reason: data.request_reason,
      date_issued: data.date_issued || data.dateIssued || null,
      transaction_number: data.transaction_number,
      is_active: data.is_active ?? 1,
      use_signature: data.use_signature ? 1 : 0, // Added for e-signature
      secretary_signature_id: data.use_signature && data.secretary_signature_id ? data.secretary_signature_id : null, // Added for secretary e-signature
      captain_signature_id: data.use_signature && data.captain_signature_id ? data.captain_signature_id : null, // Added for captain e-signature
    };
  }

  async function handleCreate() {
    try {
      // Generate a transaction number for new certificates
      const transactionNumber = generateTransactionNumber();
      const validityPeriod = getValidityPeriod('Cash Assistance');
      const updatedFormData = {
        ...formData,
        transaction_number: transactionNumber,
        date_created: new Date().toISOString(), // Add current timestamp
        validity_period: validityPeriod, // Add validity period
      };

      const res = await fetch(`${apiBase}/cash-assistance`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(toServerPayload(updatedFormData)),
      });
      if (!res.ok) throw new Error('Create failed');
      const created = await res.json();
      const newRec = { 
        ...updatedFormData, 
        cash_assistance_id: created.cash_assistance_id,
        sec_official_name: created.sec_official_name,
        sec_designation: created.sec_designation,
        sec_signature_path: created.sec_signature_path,
        cap_official_name: created.cap_official_name,
        cap_designation: created.cap_designation,
        cap_signature_path: created.cap_signature_path,
      };

      setRecords([newRec, ...records]);
      setSelectedRecord(newRec);

      // Save to certificates table
      await saveCertificate(newRec, true);

      // Store the new certificate data
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
      const validityPeriod = getValidityPeriod('Cash Assistance');
      const updatedFormData = {
        ...formData,
        validity_period: validityPeriod, // Add validity period
      };

      const res = await fetch(`${apiBase}/cash-assistance/${editingId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(toServerPayload(updatedFormData)),
      });
      if (!res.ok) throw new Error('Update failed');
      const updatedData = await res.json();
      // The backend creates a NEW record, so we need to add it to records and remove/replace the old one
      const updated = { 
        ...updatedData,
        cash_assistance_id: updatedData.cash_assistance_id,
        full_name: updatedData.full_name,
        sinceYear: updatedData.since_year || '',
        address: updatedData.address || '',
        request_reason: updatedData.request_reason || '',
        date_issued: updatedData.date_issued?.split('T')[0] || '',
        date_created: updatedData.date_created,
        transaction_number: updatedData.transaction_number,
        validity_period: validityPeriod,
        use_signature: Boolean(updatedData.use_signature),
        secretary_signature_id: updatedData.secretary_signature_id || null,
        captain_signature_id: updatedData.captain_signature_id || null,
        sec_official_name: updatedData.sec_official_name || null,
        sec_designation: updatedData.sec_designation || null,
        sec_signature_path: updatedData.sec_signature_path || null,
        cap_official_name: updatedData.cap_official_name || null,
        cap_designation: updatedData.cap_designation || null,
        cap_signature_path: updatedData.cap_signature_path || null,
      };
      // Remove old record and add new one
      setRecords([updated, ...records.filter((r) => r.cash_assistance_id !== editingId)]);
      setSelectedRecord(updated);

      // Save to certificates table
      await saveCertificate(updated, false);

      // Store the updated certificate data
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
      date_issued: record.date_issued || record.dateIssued || '',
      use_signature: Boolean(record.use_signature),
      secretary_signature_id: record.secretary_signature_id || null,
      captain_signature_id: record.captain_signature_id || null,
    });
    setEditingId(record.cash_assistance_id);
    setIsFormOpen(true);
    setActiveTab('form');
    
    // Set selected signatures if available
    if (record.secretary_signature_id) {
      const secSig = signatures.find((s) => s.signature_id === record.secretary_signature_id);
      setSelectedSecretarySignature(secSig || null);
    } else {
      setSelectedSecretarySignature(null);
    }
    
    if (record.captain_signature_id) {
      const capSig = signatures.find((s) => s.signature_id === record.captain_signature_id);
      setSelectedCaptainSignature(capSig || null);
    } else {
      setSelectedCaptainSignature(null);
    }
  }

  function handleView(record) {
    setSelectedRecord(record); // Set selected record for display
    setFormData({ 
      ...record, 
      date_issued: record.date_issued || record.dateIssued || '',
      use_signature: Boolean(record.use_signature),
      secretary_signature_id: record.secretary_signature_id || null,
      captain_signature_id: record.captain_signature_id || null,
    }); // Also populate form data for QR generation/dialog
    setEditingId(record.cash_assistance_id); // To indicate viewing a specific record
    setIsFormOpen(true); // Keep the form open with the record details
    setActiveTab('form');
    
    // Set selected signatures if available
    if (record.secretary_signature_id) {
      const secSig = signatures.find((s) => s.signature_id === record.secretary_signature_id);
      setSelectedSecretarySignature(secSig || null);
    } else {
      setSelectedSecretarySignature(null);
    }
    
    if (record.captain_signature_id) {
      const capSig = signatures.find((s) => s.signature_id === record.captain_signature_id);
      setSelectedCaptainSignature(capSig || null);
    } else {
      setSelectedCaptainSignature(null);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this record?')) return;
    try {
      const res = await fetch(`${apiBase}/cash-assistance/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Delete failed');
      setRecords(records.filter((r) => r.cash_assistance_id !== id));
      if (selectedRecord?.cash_assistance_id === id) setSelectedRecord(null);
      // remove from localStorage
      const existing = JSON.parse(localStorage.getItem('certificates') || '{}');
      delete existing[id];
      localStorage.setItem('certificates', JSON.stringify(existing));
    } catch (e) {
      console.error(e);
      alert('Failed to delete record');
    }
  }

  function resetForm() {
    setFormData({
      cash_assistance_id: '',
      resident_id: '',
      full_name: '',
      sinceYear: '',
      address: '',
      request_reason: '',
      date_issued: new Date().toISOString().split('T')[0],
      transaction_number: '',
      is_active: 1,
      date_created: '',
      use_signature: false, // Added for e-signature
      secretary_signature_id: null, // Added for secretary e-signature
      captain_signature_id: null, // Added for captain e-signature
    });
    setEditingId(null);
    setIsFormOpen(false);
    setSelectedRecord(null);
    setSelectedSecretarySignature(null);
    setSelectedCaptainSignature(null);
  }

  function handleSubmit() {
    if (editingId) handleUpdate();
    else handleCreate();
  }

  const filteredRecords = useMemo(
    () =>
      records.filter(
        (r) =>
          (r.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.request_reason || '').toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [records, searchTerm]
  );

  async function generatePDF() {
    if (!display.cash_assistance_id) {
      alert('Please save record first before downloading PDF');
      return;
    }
    setIsGeneratingPDF(true);
    try {
      const el = document.getElementById('certificate-preview');
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'in', format: [8.5, 11] });
      pdf.addImage(imgData, 'PNG', 0, 0, 8.5, 11);

      // add metadata page similar to other certificates
      pdf.addPage();
      pdf.setFontSize(18);
      pdf.setFont(undefined, 'bold');
      pdf.text('Certificate Verification Information', 0.5, 0.75);
      pdf.setLineWidth(0.02);
      pdf.line(0.5, 0.85, 8, 0.85);
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');

      const createdDate = display.date_created ? formatDateTimeDisplay(display.date_created) : new Date().toLocaleString();
      let yPos = 1.2;
      const lineHeight = 0.25;
      const details = [
        `Certificate Type: Cash Assistance`,
        `Certificate ID: ${display.cash_assistance_id}`,
        `Transaction Number: ${display.transaction_number}`,
        ``,
        `Full Name: ${display.full_name}`,
        `Since Year: ${display.sinceYear}`,
        `Address: ${display.address}`,
        `Request Reason: ${display.request_reason}`,
        ``,
        `Date Issued: ${formatDateDisplay(display.date_issued)}`,
        `Date Created (E-Signature Applied): ${createdDate}`,
        ``,
        `E-Signature: ${display.use_signature ? 'Yes' : 'No'}`,
        display.use_signature && display.sec_official_name ? `Secretary: ${display.sec_official_name} - ${display.sec_designation}` : '',
        display.use_signature && display.cap_official_name ? `Captain: ${display.cap_official_name} - ${display.cap_designation}` : '',
        ``,
        `Issued by: Punong Barangay Arnold Dondonayos`,
        `Barangay: Barangay 145 Zone 13 Dist. 1, Caloocan City`,
        ``,
        `QR Code URL: ${window.location.origin}/verify-certificate?id=${display.cash_assistance_id}`,
      ];
      details.forEach((line) => {
        pdf.text(line, 0.5, yPos);
        yPos += lineHeight;
      });

      const filename = `Cash_Assistance_${display.cash_assistance_id}_${(display.full_name||'').replace(/\s+/g,'_')}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  }

  function handlePrint() {
    if (!display.cash_assistance_id) { alert('Please save first'); return; }
    
    // 1. Get the certificate element
    const certificateElement = document.getElementById('certificate-preview');
    if (!certificateElement) {
      alert('Certificate not found for printing.');
      return;
    }

    // 2. Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px'; // Move it way off-screen
    iframe.style.top = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    document.body.appendChild(iframe);

    // 3. Write the certificate content and styles into the iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Certificate</title>
          <style>
            @page {
              size: 8.5in 11in;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            #certificate-preview {
              width: 8.5in;
              height: 11in;
              position: relative;
              overflow: hidden;
              background: white;
              box-sizing: border-box;
            }
            #certificate-preview * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
          </style>
        </head>
        <body>
          ${certificateElement.outerHTML}
        </body>
      </html>
    `);
    iframeDoc.close();

    // 4. Trigger the print dialog once the iframe content is loaded
    setTimeout(() => {
      const iframeWindow = iframe.contentWindow || iframe;
      iframeWindow.focus(); // Required for some browsers
      iframeWindow.print();

      // 5. Clean up by removing the iframe after the print dialog
      window.onafterprint = () => {
        document.body.removeChild(iframe);
      };
      // Fallback cleanup in case onafterprint doesn't fire
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 250); // A short delay to render
  }

  const handleZoomIn = () => setZoomLevel((p) => Math.min(p + 0.1, 2));
  const handleZoomOut = () => setZoomLevel((p) => Math.max(p - 0.1, 0.3));
  const handleResetZoom = () => setZoomLevel(0.75);

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '+' || e.key === '=') { e.preventDefault(); handleZoomIn(); }
        if (e.key === '-') { e.preventDefault(); handleZoomOut(); }
        if (e.key === '0') { e.preventDefault(); handleResetZoom(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // QR dialog click handler
  const handleQrCodeClick = () => {
    if (display.cash_assistance_id) {
      const verificationUrl = `${window.location.origin}/verify-certificate?id=${display.cash_assistance_id}`;
      window.open(verificationUrl, '_blank');
    } else {
      setQrDialogOpen(true);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
        {/* TOP HEADER */}
        <Paper elevation={2} sx={{ zIndex: 10, borderRadius: 0 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 2,
            bgcolor: 'primary.main',
            color: 'white'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src={Logo145} sx={{ width: 48, height: 48 }} />
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Cash Assistance
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Manage all records of Cash Assistance
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Badge badgeContent={records.length} color="secondary">
                <Chip 
                  icon={<FolderIcon />}
                  label="Total Records" 
                  sx={{ 
                    bgcolor: "rgba(255,255,255,0.2)", 
                    color: "white",
                    fontWeight: 600
                  }} 
                />
              </Badge>
              
              <Button 
                variant="contained" 
                color="secondary" 
                startIcon={<AddIcon />} 
                onClick={() => { resetForm(); setIsFormOpen(true); setActiveTab("form"); }}
                sx={{ borderRadius: 20, px: 3 }}
              >
                New Certificate
              </Button>
            </Box>
          </Box>

          {/* NAVIGATION TABS */}
          <Box sx={{ bgcolor: "background.paper", borderBottom: 1, borderColor: "divider" }}>
            <Box sx={{ maxWidth: 1200, mx: "auto" }}>
              <Tabs 
                value={activeTab} 
                onChange={(e, nv) => setActiveTab(nv)} 
                variant="fullWidth"
                sx={{ 
                  "& .MuiTabs-indicator": { height: 3, borderRadius: "3px 3px 0 0" },
                  minHeight: 48
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

        {/* MAIN CONTENT AREA */}
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* LEFT: Certificate preview */}
          <Box sx={{ 
            flex: 1, 
            overflow: 'auto', 
            display: 'flex', 
            flexDirection: 'column', 
            bgcolor: 'background.default',
            p: 2,
            [theme.breakpoints.down('lg')]: { display: activeTab === "form" ? 'none' : 'flex' }
          }}>
            {/* ZOOM CONTROLS */}
            <Paper elevation={1} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Box sx={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1
              }}>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Tooltip title="Zoom Out">
                    <IconButton onClick={handleZoomOut} color="primary" size="small">
                      <ZoomOutIcon />
                    </IconButton>
                  </Tooltip>
                  <Typography variant="body2" sx={{ 
                    minWidth: 60, 
                    textAlign: "center", 
                    fontWeight: 600,
                    px: 1,
                    py: 0.5,
                    bgcolor: "background.paper",
                    borderRadius: 1,
                    color: "#000000"
                  }}>
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

                <Box sx={{ display: "flex", gap: 1 }}>
                  <Tooltip title="Download PDF">
                    <Button 
                      variant="contained" 
                      color="secondary" 
                      onClick={generatePDF} 
                      disabled={!display.cash_assistance_id || isGeneratingPDF} 
                      startIcon={<FileTextIcon />}
                      size="small"
                    >
                      {isGeneratingPDF ? "Generating..." : "Download"}
                    </Button>
                  </Tooltip>
                  <Tooltip title="Print">
                    <Button 
                      variant="outlined" 
                      onClick={handlePrint} 
                      disabled={!display.cash_assistance_id}
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
            <Box sx={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "flex-start", 
              flex: 1, 
              overflow: "auto",
              p: 1
            }}>
              <Box sx={{ transform: `scale(${zoomLevel})`, transformOrigin: "top center" }}>
                <div
                  id="certificate-preview"
                  style={{
                    position: 'relative',
                    width: '8.5in',
                    height: '11in',
                    boxShadow: '0 0 8px rgba(0,0,0,0.2)',
                    background: '#fff',
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact',
                    colorAdjust: 'exact',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                  }}
                >
                  {/* Logos & watermark */}
                  <img
                    style={{
                      position: 'absolute',
                      width: '80px',
                      height: '80px',
                      top: '60px',
                      left: '40px',
                    }}
                    src={CaloocanLogo}
                    alt="Logo 1"
                  />
                  <img
                    style={{
                      position: 'absolute',
                      width: '80px',
                      height: '80px',
                      top: '60px',
                      left: '130px',
                    }}
                    src={BagongPilipinas}
                    alt="Logo 2"
                  />
                  <img
                    style={{
                      position: 'absolute',
                      width: '100px',
                      height: '100px',
                      top: '50px',
                      right: '40px',
                    }}
                    src={Logo145}
                    alt="Logo 3"
                  />
                  <img
                    style={{
                      position: 'absolute',
                      opacity: 0.1,
                      width: '550px',
                      left: '50%',
                      top: '270px',
                      transform: 'translateX(-50%)',
                    }}
                    src={Logo145}
                    alt="Watermark"
                  />

                  {/* Header */}
                  <div
                    style={{
                      position: "absolute",
                      whiteSpace: "pre",
                      textAlign: "center",
                      width: "100%",
                      fontSize: "20px",
                      fontWeight: "bold",
                      fontFamily: '"Lucida Calligraphy", cursive',
                      top: "50px",
                    }}
                  >
                    Republic of the Philippines
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      whiteSpace: "pre",
                      textAlign: "center",
                      width: "100%",
                      fontSize: "13pt",
                      fontWeight: "bold",
                      fontFamily: "Arial, sans-serif",
                      top: "84px",
                    }}
                  >
                    CITY OF CALOOCAN
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      whiteSpace: "pre",
                      textAlign: "center",
                      width: "100%",
                      fontSize: "15pt",
                      fontWeight: "bold",
                      fontFamily: '"Arial Black", sans-serif',
                      top: "110px",
                    }}
                  >
                    BARANGAY 145 ZONES 13 DIST. 1
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      whiteSpace: "pre",
                      textAlign: "center",
                      width: "100%",
                      fontSize: "15pt",
                      fontWeight: "bold",
                      fontFamily: '"Arial Black", sans-serif',
                      top: "138px",
                    }}
                  >
                    Tel. No. 8711 - 7134
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      whiteSpace: "pre",
                      textAlign: "center",
                      width: "100%",
                      fontSize: "12pt",
                      fontWeight: "bold",
                      fontFamily: '"Arial Black", sans-serif',
                      top: "166px",
                    }}
                  >
                    OFFICE OF THE BARANGAY CHAIRMAN
                  </div>
                  <div style={{ position: 'absolute', top: '200px', width: '100%', textAlign: 'center' }}>
                  <span style={{ fontFamily: 'Times New Roman', fontSize: '20pt', fontWeight: 'bold', display: 'inline-block', color: '#0b7030', padding: '4px 70px', fontStyle: 'italic', textDecoration: 'underline' }}>CERTIFICATION</span>
                </div>

                  {/* Body */}
                  <div
                    style={{
                      position: 'absolute',
                      whiteSpace: 'pre-wrap',
                      top: '330px',
                      left: '80px',
                      width: '640px',
                      textAlign: 'justify',
                      fontFamily: '"Times New Roman", serif',
                      fontSize: '12pt',
                      fontWeight: 'bold',
                      color: 'black',
                    }}
                  >
                    TO WHOM IT MAY CONCERN:
                    <p style={{ textIndent: '50px' }}>
                      This is to certify that <span style={{ textDecoration: 'underline' }}>{display.full_name || '____________________'}</span> is a bona fide resident of Barangay 145, Caloocan City since <span style={{ textDecoration: 'underline' }}>{display.sinceYear || '________'}</span>, residing at <span style={{ textDecoration: 'underline' }}>{display.address || '____________________'}</span>.
                    </p>
                    <p style={{ textIndent: '50px' }}>
                      This certification is issued upon the request of <span style={{ textDecoration: 'underline' }}>{display.full_name || '____________________'}</span> for <span style={{ textDecoration: 'underline' }}>{display.request_reason || '____________________'}</span> Cash Assistance.
                    </p>
                    <p style={{ textIndent: '50px' }}>
                      Issued this <span style={{ textDecoration: 'underline' }}>{display.date_issued ? (() => { 
                        const date = new Date(display.date_issued); 
                        const day = date.getDate(); 
                        const month = date.toLocaleString('default', { month: 'long' }); 
                        const year = date.getFullYear(); 
                        const suffix = day % 10 === 1 && day !== 11 ? 'st' : day % 10 === 2 && day !== 12 ? 'nd' : day % 10 === 3 && day !== 13 ? 'rd' : 'th'; 
                        return `${day}${suffix} day of ${month}, ${year}`; 
                      })() : '________'}</span>, at Barangay 145, Zone 13, Dist. 1, Caloocan City.
                    </p>
                  </div>

                  {/* Secretary Signature */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '580px',
                      left: '80px',
                      width: '250px',
                      textAlign: 'left',
                      fontFamily: '"Times New Roman", serif',
                      fontSize: '12pt',
                      fontWeight: 'bold',
                    }}
                  >
                    <div style={{ color: 'black', fontFamily: 'inherit' }}>Certified Correct:</div>
                    <br />
                    
                    {/* Secretary Signature */}
                    {display.use_signature && display.sec_signature_path ? (
                      <>
                        <div
                          style={{
                            marginBottom: '-15px',
                            marginRight: '100px',
                            height: '60px',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                          }}
                        >
                          <img
                            src={getSignatureImageUrl(display.sec_signature_path)}
                            alt="Secretary Signature"
                            style={{
                              maxWidth: '180px',
                              maxHeight: '60px',
                              objectFit: 'contain',
                              display: 'block',
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                        <div style={{ color: "black" }}>
                         Roselyn Anore
                        </div>
                        <div style={{ color: "black" }}>
                         Barangay Secretary
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ color: "black" }}>Roselyn Anore</div>
                        <div style={{ color: "black" }}>Barangay Secretary</div>
                      </>
                    )}
                  </div>

                  {/* Punong Barangay with E-Signature */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '700px',
                      right: '100px',
                      width: '300px',
                      textAlign: 'center',
                    }}
                  >
                    {/* E-Signature positioned to overlap with the name */}
                    {display.use_signature && display.cap_signature_path ? (
                      <div
                        style={{
                          position: 'relative',
                          marginTop: '-10px', // Pull the signature up to overlap
                          height: '70px',
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'center',
                          zIndex: 2, // Ensure signature is on top
                        }}
                      >
                        <img
                          src={getSignatureImageUrl(display.cap_signature_path)}
                          alt="Captain Signature"
                          style={{
                            maxWidth: '200px',
                            maxHeight: '70px',
                            objectFit: 'contain',
                            display: 'block',
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : null}

                    {/* WordName image positioned to overlap with signature */}
                    <div
                      style={{
                        position: 'relative',
                        marginTop: display.use_signature && display.cap_signature_path ? '-35px' : '-5px', // Adjust overlap based on whether signature is present
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1, // Ensure name is below signature but above other elements
                      }}
                    >
                      <img
                        src={WordName}
                        alt="Arnold Dondonayos"
                        style={{
                          width: '250px',
                          height: 'auto',
                          maxHeight: '60px',
                          objectFit: 'contain',
                        }}
                      />
                    </div>

                    {/* Line positioned at the bottom of the name */}
                    <div
                      style={{
                        borderTop: '2.5px solid #000',
                        width: '90%',
                        margin: 'auto',
                        marginTop: display.use_signature && display.cap_signature_path ? '5px' : '-2px', // Adjust spacing based on signature presence
                      }}
                    ></div>

                    <div
                      style={{
                        fontFamily: '"Brush Script MT", cursive',
                        fontSize: '20pt',
                        color: '#000',
                        marginTop: '5px',
                      }}
                    >
                      Punong Barangay
                    </div>
                  </div>

                  {/* QR and signature area */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '780px',
                      left: '50px',
                      width: '250px',
                      textAlign: 'center',
                      fontFamily: '"Times New Roman", serif',
                      fontSize: '12pt',
                      fontWeight: 'bold',
                    }}
                  >
                    <div style={{ borderTop: '2px solid #000', width: '65%', margin: 'auto' }}></div>
                    <div style={{ color: 'black', fontFamily: 'inherit' }}>Applicant's Signature</div>

                    {qrCodeUrl && (
                      <div style={{ marginTop: '12px' }}>
                        <div
                          style={{
                            display: 'inline-block',
                          }}
                        >
                          <img
                            src={qrCodeUrl}
                            alt="QR Code"
                            style={{
                              width: '150px',
                              height: '150px',
                              border: '2px solid #000',
                              padding: '5px',
                              background: '#fff',
                            }}
                          />
                        </div>
                        <div
                          style={{
                            fontSize: '8pt',
                            color: '#666',
                            marginTop: '6px',
                            fontWeight: 'normal',
                          }}
                        >
                          {display.date_created
                            ? formatDateTimeDisplay(display.date_created)
                            : new Date().toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Box>
            </Box>

            <style>
              {`
        @media print {
          body * {
            visibility: hidden;
          }
          #certificate-preview, #certificate-preview * {
            visibility: visible;
          }
          #certificate-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 8.5in;
            height: 11in;
            transform: none !important; /* Remove any transforms */
          }
          @page {
            size: portrait;
            margin: 0;
          }
          /* Ensure colors are preserved when printing */
          #certificate-preview * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `}
            </style>
          </Box>

          {/* RIGHT: FORM/RECORDS PANEL */}
          <Box sx={{ 
            width: { xs: '100%', md: '50%', lg: '40%' }, 
            bgcolor: "background.paper", 
            borderLeft: { xs: 0, md: 1 }, 
            borderColor: "divider",
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* FORM */}
            {activeTab === "form" && (
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <Paper elevation={0} sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                    <ArticleIcon color="primary" />
                    {editingId ? "Edit Certificate" : "New Cash Assistance"}
                  </Typography>
                  {selectedRecord && !editingId && (
                    <Typography variant="body2" color="text.secondary">
                      Viewing: {selectedRecord.full_name}
                    </Typography>
                  )}
                </Paper>

                <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
                  <Stack spacing={3}>
                    <Autocomplete
                      options={residents}
                      getOptionLabel={(option) => option.full_name || ''}
                      value={residents.find((r) => r.resident_id === formData.resident_id) || null}
                      onChange={(event, newValue) => {
                        if (newValue) {
                          // try to derive sinceYear from created_at if available
                          let sinceYear = formData.sinceYear;
                          if (newValue.created_at) {
                            const y = new Date(newValue.created_at).getFullYear();
                            sinceYear = String(y);
                          }
                          setFormData({
                            ...formData,
                            resident_id: newValue.resident_id,
                            full_name: newValue.full_name || '',
                            address: newValue.address || '',
                            sinceYear: sinceYear || formData.sinceYear,
                          });
                        } else {
                          setFormData({ ...formData, resident_id: '', full_name: '' });
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Full Name *"
                          variant="outlined"
                          size="small"
                          fullWidth
                          required
                        />
                      )}
                    />

                    <TextField
                      label="Year (Since Resident) *"
                      type="number"
                      variant="outlined"
                      size="small"
                      fullWidth
                      placeholder="e.g. 2015"
                      value={formData.sinceYear || ''}
                      onChange={(e) => setFormData({ ...formData, sinceYear: e.target.value })}
                      required
                    />

                    <TextField
                      label="Address *"
                      variant="outlined"
                      size="small"
                      fullWidth
                      multiline
                      rows={2}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />

                    <TextField
                      label="Request Reason *"
                      variant="outlined"
                      size="small"
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Medical emergencies, Financial hardship, etc."
                      value={formData.request_reason}
                      onChange={(e) => setFormData({ ...formData, request_reason: e.target.value })}
                      required
                    />

                    <TextField
                      label="Date Issued *"
                      type="date"
                      variant="outlined"
                      size="small"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={formData.date_issued}
                      onChange={(e) => setFormData({ ...formData, date_issued: e.target.value })}
                      helperText={formData.date_issued ? (()=>{
                        const date=new Date(formData.date_issued);
                        const day=date.getDate();
                        const month = date.toLocaleString('default',{month:'long'});
                        const year = date.getFullYear();
                        const suffix = day%10===1&&day!==11? 'st' : day%10===2&&day!==12? 'nd' : day%10===3&&day!==13? 'rd' : 'th';
                        return `Formatted: ${day}${suffix} day of ${month}, ${year}`;
                      })() : 'Select date'}
                      required
                    />

                    <Divider sx={{ my: 2 }} />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.use_signature || false}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormData({
                              ...formData,
                              use_signature: checked,
                              secretary_signature_id:
                                checked && selectedSecretarySignature
                                  ? selectedSecretarySignature.signature_id
                                  : null,
                              captain_signature_id:
                                checked && selectedCaptainSignature
                                  ? selectedCaptainSignature.signature_id
                                  : null,
                            });
                            if (!checked) {
                              setSelectedSecretarySignature(null);
                              setSelectedCaptainSignature(null);
                            }
                          }}
                          color="primary"
                        />
                      }
                      label="Add E-Signatures"
                    />

                    {formData.use_signature && (
                      <>
                        <Autocomplete
                          options={signatures}
                          getOptionLabel={(opt) =>
                            `${opt.official_name} - ${opt.designation}`
                          }
                          value={selectedSecretarySignature}
                          onChange={(e, newValue) => {
                            setSelectedSecretarySignature(newValue);
                            setFormData({
                              ...formData,
                              secretary_signature_id: newValue
                                ? newValue.signature_id
                                : null,
                            });
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Select Secretary Signature"
                              variant="outlined"
                              fullWidth
                              size="small"
                              required
                            />
                          )}
                        />

                        <Autocomplete
                          options={signatures}
                          getOptionLabel={(opt) =>
                            `${opt.official_name} - ${opt.designation}`
                          }
                          value={selectedCaptainSignature}
                          onChange={(e, newValue) => {
                            setSelectedCaptainSignature(newValue);
                            setFormData({
                              ...formData,
                              captain_signature_id: newValue
                                ? newValue.signature_id
                                : null,
                            });
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Select Captain Signature"
                              variant="outlined"
                              fullWidth
                              size="small"
                              required
                            />
                          )}
                        />
                      </>
                    )}

                    <Box sx={{ display: "flex", gap: 1, pt: 1 }}>
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

            {/* RECORDS */}
            {activeTab === "records" && (
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <Paper elevation={0} sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    <FolderIcon color="primary" />
                    Certificate Records
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by name, address, or request reason"
                    value={searchTerm}
                    onChange={(e)=>setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Paper>

                <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
                  {filteredRecords.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
                      <FolderIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                      <Typography variant="h6" gutterBottom>
                        {searchTerm ? "No records found" : "No records yet"}
                      </Typography>
                      <Typography variant="body2">
                        {searchTerm ? "Try a different search term" : "Create your first certificate to get started"}
                      </Typography>
                    </Paper>
                  ) : (
                    <Stack spacing={2}>
                      {filteredRecords.map((record) => (
                        <Card key={record.cash_assistance_id} sx={{
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          borderLeft: 4,
                          borderColor: "primary.main",
                        }}>
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, color: "#000000" }}>
                                  {record.full_name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  {record.address}
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
                                  <Chip
                                    label={`Since: ${record.sinceYear}`}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                  <Typography variant="caption" color="text.secondary">
                                    Issued: {formatDateDisplay(record.date_issued)}
                                  </Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                  {record.request_reason}
                                </Typography>
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
                              <Box sx={{ display: "flex", gap: 0.5 }}>
                                <Tooltip title="View">
                                  <IconButton
                                    size="small"
                                    onClick={()=>handleView(record)}
                                    color="primary"
                                  >
                                    <EyeIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    onClick={()=>handleEdit(record)}
                                    color="success"
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    onClick={()=>handleDelete(record.cash_assistance_id)}
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

        {/* FLOATING ACTION BUTTON FOR MOBILE */}
        {isMobile && activeTab !== "form" && (
          <Fab
            color="primary"
            aria-label="add"
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
            }}
            onClick={() => { resetForm(); setIsFormOpen(true); setActiveTab("form"); }}
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
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, color: 'text.primary' }}
              >
                {display.cash_assistance_id || 'Draft (Not yet saved)'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Transaction Number:
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, color: 'text.primary' }}
              >
                {display.transaction_number || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Full Name:
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, color: 'text.primary' }}
              >
                {display.full_name}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Address:
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {display.address}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Since Year:
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {display.sinceYear}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Date Issued:
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {formatDateDisplay(display.date_issued)}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Request Reason:
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {display.request_reason}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Date Created:
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {display.date_created
                  ? formatDateTimeDisplay(display.date_created)
                  : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                E-Signature:
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {display.use_signature ? 'Yes' : 'No'}
              </Typography>
            </Grid>
            {display.use_signature && (
              <>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ color: 'grey.600' }}>
                    Secretary:
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    {display.sec_official_name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ color: 'grey.600' }}>
                    Captain:
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    {display.cap_official_name || 'N/A'}
                  </Typography>
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)} color="primary">
            Close
          </Button>
          {display.cash_assistance_id && (
            <Button
              onClick={() => {
                const verificationUrl = `${window.location.origin}/verify-certificate?id=${display.cash_assistance_id}`;
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
    </ThemeProvider>
  );
}
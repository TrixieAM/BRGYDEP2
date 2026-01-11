import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getSignatures, getSignatureImageUrl } from '../../services/signatureService';
import CaloocanLogo from '../../assets/CaloocanLogo.png';
import Logo145 from '../../assets/Logo145.png';
import BagongPilipinas from '../../assets/BagongPilipinas.png';
import WordName from '../../assets/WordName.png';
import { useCertificateManager } from '../../hooks/useCertificateManager';

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
  FormControlLabel,
  Checkbox,
  Divider,
  Alert,
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
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useMediaQuery } from '@mui/material';

// Define the custom theme (same as Permit to Travel)
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

export default function BhertCertificatePositive() {
  const apiBase = 'http://localhost:5000';
  const navigate = useNavigate();
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
  const [zoomLevel, setZoomLevel] = useState(0.75); // Default zoom level
  const [signatures, setSignatures] = useState([]);
  const [selectedSecretarySignature, setSelectedSecretarySignature] = useState(null);
  const [selectedCaptainSignature, setSelectedCaptainSignature] = useState(null);
  const [showValidCertDialog, setShowValidCertDialog] = useState(false);
  const [validCertInfo, setValidCertInfo] = useState(null);

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Add the certificate manager hook
  const { 
    saveCertificate, 
    getValidityPeriod,
    calculateExpirationDate 
  } = useCertificateManager('BHERT Certificate Positive');

  const [formData, setFormData] = useState({
    resident_id: '',
    full_name: '',
    address: '',
    request_reason: '',
    date_issued: new Date().toISOString().split('T')[0],
    transaction_number: '', // New field for transaction number
    is_active: 1,
    date_created: '',
    use_signature: false, // Add e-signature field
    secretary_signature_id: null, // Add secretary signature ID field
    captain_signature_id: null, // Add captain signature ID field
  });

  // Helper function to format date consistently without timezone issues
  function formatDateDisplay(dateString) {
    if (!dateString) return '';

    // Extract just the date part if it's a datetime string
    const dateOnly = dateString.includes('T')
      ? dateString.split('T')[0]
      : dateString;

    // Parse the date components
    const [year, month, day] = dateOnly.split('-');

    // Format as month name, day, year
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

  // Helper function to format date and time
  function formatDateTimeDisplay(dateString) {
    if (!dateString) return '';

    // Create a new Date object from the string
    const date = new Date(dateString);

    // Format as month name, day, year, time
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

    // Format time with AM/PM
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
  }

  // Generate a unique transaction number
  function generateTransactionNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random =
      Math.floor(Math.random() * 900) +
      (100) // 3-digit random number
        .toString()
        .padStart(3, '0');
    return `BHERT-${year}${month}${day}-${random}`;
  }

  // Store certificate data in localStorage for QR code verification
  function storeCertificateData(certificateData) {
    if (!certificateData.bhert_certificate_positive_id) return;

    // Get existing certificates from localStorage
    const existingCertificates = JSON.parse(
      localStorage.getItem('certificates') || '{}'
    );

    // Add or update the certificate
    existingCertificates[certificateData.bhert_certificate_positive_id] = certificateData;

    // Store back to localStorage
    localStorage.setItem('certificates', JSON.stringify(existingCertificates));
  }

  // Check if resident has a valid certificate (within the last year)
  async function checkForValidCertificate(residentId) {
    if (!residentId) return null;
    
    try {
      // Calculate date one year ago from today
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];
      
      // Check if resident has a certificate issued within the last year
      const res = await fetch(`${apiBase}/bhert-certificate-positive/resident/${residentId}/valid?date=${oneYearAgoStr}`, {
        headers: getAuthHeaders()
      });
      
      if (res.ok) {
        const data = await res.json();
        return data.length > 0 ? data[0] : null;
      }
      return null;
    } catch (e) {
      console.error('Error checking for valid certificate:', e);
      return null;
    }
  }

  async function loadResidents() {
    try {
      const res = await fetch(`${apiBase}/residents`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      // Format dates properly when loading residents - extract only YYYY-MM-DD
      const formattedResidents = data.map((resident) => ({
        ...resident,
        dob: resident.dob ? resident.dob.split('T')[0] : '',
      }));
      setResidents(formattedResidents);
    } catch (e) {
      console.error(e);
    }
  }

  // ---------- LOAD SIGNATURES ----------
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
      const res = await fetch(`${apiBase}/bhert-certificate-positive`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setRecords(
        Array.isArray(data)
          ? data.map((r) => ({
              bhert_certificate_positive_id: r.bhert_certificate_positive_id,
              resident_id: r.resident_id,
              full_name: r.full_name,
              address: r.address || '',
              request_reason: r.request_reason || '',
              date_issued: r.date_issued?.split('T')[0] || '',
              date_created: r.date_created,
              transaction_number:
                r.transaction_number || generateTransactionNumber(), // Generate if missing
              is_active: r.is_active ?? 1,
              use_signature: Boolean(r.use_signature),
              secretary_signature_id: r.secretary_signature_id || null,
              captain_signature_id: r.captain_signature_id || null,
              sec_official_name: r.sec_official_name || null,
              sec_designation: r.sec_designation || null,
              sec_signature_path: r.sec_signature_path || null,
              cap_official_name: r.cap_official_name || null,
              cap_designation: r.cap_designation || null,
              cap_signature_path: r.cap_signature_path || null,
            }))
          : []
      );
    } catch (e) {
      console.error(e);
    }
  }

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

  // Generate QR code with URL for PDF download
  useEffect(() => {
    const generateQRCode = async () => {
      if (display.bhert_certificate_positive_id || display.full_name) {
        // Store the certificate data in localStorage
        storeCertificateData(display);

        // Create a URL that points to a verification page
        // Using window.location.origin to get the current domain
        const verificationUrl = `${
          window.location.origin
        }/verify-certificate?id=${display.bhert_certificate_positive_id || 'draft'}`;

        const qrContent = `CERTIFICATE VERIFICATION:
        𝗧𝗿𝗮𝗻𝘀𝗮𝗰𝘁𝗶𝗼𝗻 𝗡𝗼: ${display.transaction_number || 'N/A'}
        Name: ${display.full_name}
        Date Issued: ${
        display.date_created
        ? formatDateTimeDisplay(display.date_created)
        : new Date().toLocaleString()
        }
        Document Type: BHERT Certificate (Positive)
       
        Ⓒ RRMS | BARANGAY 145
        CALOOCAN CITY
        ALL RIGHTS RESERVED
        `;

        try {
          const qrUrl = await QRCode.toDataURL(qrContent, {
            width: 140,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
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
      address: data.address || null,
      request_reason: data.request_reason || null,
      date_issued: data.date_issued,
      transaction_number: data.transaction_number, // Include transaction number
      is_active: data.is_active ?? 1,
      use_signature: data.use_signature ? 1 : 0,
      secretary_signature_id: data.use_signature && data.secretary_signature_id ? data.secretary_signature_id : null,
      captain_signature_id: data.use_signature && data.captain_signature_id ? data.captain_signature_id : null,
    };
  }

  async function handleCreate() {
    try {
      // Generate a transaction number for new certificates
      const transactionNumber = generateTransactionNumber();
      const validityPeriod = getValidityPeriod('BHERT Certificate Positive');
      const updatedFormData = {
        ...formData,
        transaction_number: transactionNumber,
        date_created: new Date().toISOString(), // Add current timestamp
        validity_period: validityPeriod, // Add validity period
      };

      const res = await fetch(`${apiBase}/bhert-certificate-positive`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(toServerPayload(updatedFormData)),
      });
      if (!res.ok) throw new Error('Create failed');
      const created = await res.json();
      const newRec = { 
        ...updatedFormData, 
        bhert_certificate_positive_id: created.bhert_certificate_positive_id,
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
      const validityPeriod = getValidityPeriod('BHERT Certificate Positive');
      const updatedFormData = {
        ...formData,
        validity_period: validityPeriod, // Add validity period
      };

      const res = await fetch(`${apiBase}/bhert-certificate-positive/${editingId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(toServerPayload(updatedFormData)),
      });
      if (!res.ok) throw new Error('Update failed');
      const updatedData = await res.json();
      const updated = {
        ...updatedData,
        bhert_certificate_positive_id: updatedData.bhert_certificate_positive_id,
        resident_id: updatedData.resident_id,
        full_name: updatedData.full_name,
        address: updatedData.address || '',
        request_reason: updatedData.request_reason || '',
        date_issued: updatedData.date_issued ? updatedData.date_issued.split('T')[0] : '',
        transaction_number: updatedData.transaction_number,
        is_active: updatedData.is_active ?? 1,
        date_created: updatedData.date_created,
        validity_period: validityPeriod,
        use_signature: Boolean(updatedData.use_signature),
        secretary_signature_id: updatedData.secretary_signature_id,
        captain_signature_id: updatedData.captain_signature_id,
        sec_official_name: updatedData.sec_official_name,
        sec_designation: updatedData.sec_designation,
        sec_signature_path: updatedData.sec_signature_path,
        cap_official_name: updatedData.cap_official_name,
        cap_designation: updatedData.cap_designation,
        cap_signature_path: updatedData.cap_signature_path,
      };
      setRecords([updated, ...records.filter((r) => r.bhert_certificate_positive_id !== editingId)]);
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
      use_signature: Boolean(record.use_signature),
      secretary_signature_id: record.secretary_signature_id || null,
      captain_signature_id: record.captain_signature_id || null,
    });
    setEditingId(record.bhert_certificate_positive_id);
    setIsFormOpen(true);
    setActiveTab('form');
    
    // Set selected signatures if they exist
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
      const res = await fetch(`${apiBase}/bhert-certificate-positive/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Delete failed');
      setRecords(records.filter((r) => r.bhert_certificate_positive_id !== id));
      if (selectedRecord?.bhert_certificate_positive_id === id) setSelectedRecord(null);

      // Remove from localStorage
      const existingCertificates = JSON.parse(
        localStorage.getItem('certificates') || '{}'
      );
      delete existingCertificates[id];
      localStorage.setItem(
        'certificates',
        JSON.stringify(existingCertificates)
      );
    } catch (e) {
      console.error(e);
      alert('Failed to delete record');
    }
  }

  function handleView(record) {
    setSelectedRecord(record); // Set selected record for display
    setFormData({ ...record }); // Also populate form data for QR generation/dialog
    setEditingId(record.bhert_certificate_positive_id); // To indicate viewing a specific record
    setIsFormOpen(true); // Keep the form open with the record details
    setActiveTab('form');
    
    // Set selected signatures if they exist
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

  function resetForm() {
    setFormData({
      resident_id: '',
      full_name: '',
      address: '',
      request_reason: '',
      date_issued: new Date().toISOString().split('T')[0],
      transaction_number: '',
      is_active: 1,
      date_created: '',
      use_signature: false,
      secretary_signature_id: null,
      captain_signature_id: null,
    });
    setEditingId(null);
    setIsFormOpen(false);
    setSelectedRecord(null); // Clear selected record
    setSelectedSecretarySignature(null);
    setSelectedCaptainSignature(null);
  }

  async function handleSubmit() {
    // If creating a new record, check for valid certificate
    if (!editingId && formData.resident_id) {
      const validCert = await checkForValidCertificate(formData.resident_id);
      if (validCert) {
        setValidCertInfo(validCert);
        setShowValidCertDialog(true);
        return;
      }
    }
    
    // If editing or no valid certificate found, proceed with save/update
    if (editingId) handleUpdate();
    else handleCreate();
  }

  // Function to handle creating a certificate even if a valid one exists
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
          (r.request_reason || '').toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [records, searchTerm]
  );

  // Generate PDF function
  async function generatePDF() {
    if (!display.bhert_certificate_positive_id) {
      alert('Please save the record first before downloading PDF');
      return;
    }

    setIsGeneratingPDF(true);

    try {
      const certificateElement = document.getElementById('certificate-preview');

      // --- 1. Remove the zoom (scale) from the preview's parent while exporting ---
      const parentOfPreview = certificateElement.parentNode;
      const prevTransform = parentOfPreview.style.transform;
      const prevTransformOrigin = parentOfPreview.style.transformOrigin;

      parentOfPreview.style.transform = 'scale(1)';
      parentOfPreview.style.transformOrigin = 'top center';

      // --- 2. Wait a short moment for layout to apply ---
      await new Promise((resolve) => setTimeout(resolve, 150));

      // --- 3. Capture crisp certificate at high scale ---
      const canvas = await html2canvas(certificateElement, {
        scale: 3, // High scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // --- 4. Restore zoom to preview ---
      parentOfPreview.style.transform = prevTransform;
      parentOfPreview.style.transformOrigin = prevTransformOrigin;

      // --- 5. Output the PDF at 8.5x11 inches (US Letter) ---
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: [8.5, 11],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, 8.5, 11);

      const fileName = `BHERT_Positive_${display.bhert_certificate_positive_id}_${display.full_name.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  }

  function handlePrint() {
    // Check if there's a certificate to print
    if (!display.bhert_certificate_positive_id) {
      alert('Please save the record first before printing');
      return;
    }

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

  // Function to handle QR code click
  const handleQrCodeClick = () => {
    if (display.bhert_certificate_positive_id) {
      // Open the verification URL in a new tab
      const verificationUrl = `${window.location.origin}/verify-certificate?id=${display.bhert_certificate_positive_id}`;
      window.open(verificationUrl, '_blank');
    } else {
      // Show a dialog with the certificate details (for unsaved draft)
      setQrDialogOpen(true);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2)); // Max zoom: 2x (200%)
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.3)); // Min zoom: 0.3x (30%)
  };

  const handleResetZoom = () => {
    setZoomLevel(0.75); // Reset to default
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Check if Ctrl/Cmd is pressed
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
                  BHERT Certificate (Positive)
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Manage all records of BHERT Certificate (Positive)
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
                      disabled={!display.bhert_certificate_positive_id || isGeneratingPDF} 
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
                      disabled={!display.bhert_certificate_positive_id}
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
                  {/* Certificate content */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '20px',
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '30px',
                    }}
                  >
                    <img
                      style={{ width: '80px', height: '80px' }}
                      src={CaloocanLogo}
                      alt="Caloocan"
                    />
                    <img
                      style={{ width: '80px', height: '80px' }}
                      src={BagongPilipinas}
                      alt="Bagong Pilipinas"
                    />
                    <img
                      style={{ width: '80px', height: '80px' }}
                      src={Logo145}
                      alt="Barangay 145"
                    />
                  </div>

                  <img
                    style={{
                      position: 'absolute',
                      opacity: 0.12,
                      width: '550px',
                      left: '50%',
                      top: '270px',
                      transform: 'translateX(-50%)',
                    }}
                    src={Logo145}
                    alt="Watermark"
                  />

                  {/* Header */}
                  <div style={{ position: 'absolute', top: '120px', width: '100%', fontWeight: 'bold' }}>
                    <div
                      style={{
                        textAlign: 'center',
                        fontSize: '12pt',
                      }}
                    >
                      Republic of the Philippines
                    </div>
                    <div
                      style={{
                        textAlign: 'center',
                        fontSize: '12pt',
                      }}
                    >
                      City of Caloocan
                    </div>
                    <div
                      style={{
                        textAlign: 'center',
                        fontSize: '12pt',
                      }}
                    >
                      BARANGAY 145 ZONE 13 DISTRICT 1
                    </div>
                    <div
                      style={{
                        textAlign: 'center',
                        fontSize: '16pt',
                        marginTop: '4px',
                      }}
                    >
                      OFFICE OF THE BARANGAY CAPTAIN
                    </div>
                    <div
                      style={{
                        textAlign: 'center',
                        fontSize: '20pt',
                        letterSpacing: '6px',
                        marginTop: '30px',
                      }}
                    >
                      B H E R T &nbsp; C E R T I F I C A T I O N
                    </div>
                  </div>

                  {/* Body */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '300px',
                      fontSize: '14pt',
                      textAlign: 'justify',
                      margin: '0 80px',
                      width: '640px',
                      fontWeight: 'bold'
                    }}
                  >
                    To Whom It May Concern: <br />
                    <p style={{ textIndent: '40px' }}>
                      This is to certify that{' '}
                      <span style={{ textDecoration: 'underline' }}>
                        {display.full_name || '____________________'}
                      </span>
                      , a Filipino citizen and resident of{' '}
                      <span style={{ textDecoration: 'underline' }}>
                        {display.address || '____________________'}
                      </span>{' '}
                      Bagong Barrio Caloocan City. He/She is INCLUDED in the list of
                      household in this barangay, who is being monitored with COVID-19
                      and He/She is INCLUDED in the list of persons who is being
                      monitored in this barangay to the PUI or CONFIRMED with
                      COVID-19. She completed One Wk. Quarantine period, and monitored
                      by our BHERT officer.
                    </p>
                    <p style={{ textIndent: '40px' }}>
                      This Certification is issued upon request of the above-mentioned
                      name for{' '}
                      <span style={{ textDecoration: 'underline' }}>
                        {display.request_reason || '___________'}
                      </span>
                      .
                    </p>
                    <p style={{ textIndent: '40px' }}>
                      Done in the Office of the Punong Barangay 145, Zone 13, District
                      1, City of Caloocan this{' '}
                      {display.date_issued ? formatDateDisplay(display.date_issued) : ''}.
                    </p>
                  </div>

                  {/* Signature Section */}
                  <div style={{ position: 'absolute', left: '80px', top: '700px', fontWeight: 'bold' }}>
                    Certified by: <br />
                    <br />
                    
                    {/* Secretary Signature */}
                    {display.use_signature && display.sec_signature_path ? (
                      <>
                        <div
                          style={{
                            marginBottom: '-20px',
                            margiinTop: '10px',
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
                        <div style={{ marginTop: '5px' }}>
                          ROSALINA P. ANORE
                        </div>
                        <div style={{ marginTop: '5px', fontSize: '14pt' }}>
                         Brgy. Secretary
                        </div>
                      </>
                    ) : (
                      <>
                        ROSALINA P. ANORE
                        <br />
                        <span style={{ fontSize: '14pt' }}>Brgy. Secretary</span>
                      </>
                    )}
                  </div>

                  <div style={{ position: 'absolute', left: '80px', top: '850px', fontWeight: 'bold' }}>
                    Noted by: <br />
                    <br />
                    
                    {/* Captain Signature - positioned to overlap with the name */}
                    {display.use_signature && display.cap_signature_path ? (
                      <>
                        <div
                          style={{
                            marginBottom: '-20px',
                            height: '60px',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                          }}
                        >
                          <img
                            src={getSignatureImageUrl(display.cap_signature_path)}
                            alt="Captain Signature"
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
                        <div style={{ marginTop: '5px', fontSize: '16pt' }}>
                          ARNOLD DONDONAYOS
                        </div>
                        <div style={{ marginTop: '5px', fontSize: '14pt' }}>
                        Punong Barangay
                        </div>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: '16pt' }}>ARNOLD DONDONAYOS</span>
                        <br />
                        <span style={{ fontSize: '14pt' }}>Punong Barangay</span>
                      </>
                    )}
                  </div>

                  {/* QR Code */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '100px',
                      right: '100px',
                      textAlign: 'center',
                      fontFamily: '"Times New Roman", serif',
                      fontSize: '10pt',
                      fontWeight: 'bold',
                    }}
                  >
                    {qrCodeUrl && (
                      <div style={{ marginTop: 12 }}>
                        <div
                          style={{
                            display: 'inline-block',
                          }}
                        >
                          <img
                            src={qrCodeUrl}
                            alt="Verification QR Code"
                            style={{
                              width: '130px',
                              height: '130px',
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
                            marginTop: '5px',
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
                    {editingId ? "Edit Certificate" : "New BHERT Certificate (Positive)"}
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
                      getOptionLabel={(option) => option.full_name || ""}
                      value={residents.find((r) => r.full_name === formData.full_name) || null}
                      onChange={(e, nv) => {
                        if (nv) {
                          // Ensure date is properly formatted without timezone issues
                          setFormData({
                            ...formData,
                            resident_id: nv.resident_id,
                            full_name: nv.full_name,
                            address: nv.address || '',
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

                    <TextField 
                      label="Request Reason" 
                      variant="outlined" 
                      fullWidth 
                      size="small"
                      multiline 
                      rows={2}
                      placeholder="Monitoring, Return to Work, etc."
                      value={formData.request_reason} 
                      onChange={(e) => setFormData({ ...formData, request_reason: e.target.value })} 
                      required
                    />

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

                    <Box sx={{ display: "flex", gap: 2, pt: 2 }}>
                      <Button 
                        onClick={handleSubmit} 
                        variant="contained" 
                        startIcon={<SaveIcon />} 
                        fullWidth 
                        color="primary"
                        size="large"
                      >
                        {editingId ? "Update" : "Save"}
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
                    onChange={(e) => setSearchTerm(e.target.value)} 
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
                        <Card key={record.bhert_certificate_positive_id} sx={{ 
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
                                  {record.request_reason && (
                                    <Chip 
                                      label={record.request_reason} 
                                      size="small" 
                                      color="primary" 
                                      variant="outlined" 
                                    />
                                  )}
                                  <Typography variant="caption" color="text.secondary">
                                    Issued: {formatDateDisplay(record.date_issued)}
                                  </Typography>
                                  {record.use_signature && (
                                    <Chip 
                                      icon={<ArticleIcon />}
                                      label="E-Signed" 
                                      size="small" 
                                      color="success" 
                                      variant="outlined" 
                                    />
                                  )}
                                </Box>
                              </Box>
                              <Box sx={{ display: "flex", gap: 0.5 }}>
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
                                    onClick={() => handleDelete(record.bhert_certificate_positive_id)} 
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

      {/* VALID CERTIFICATE DIALOG */}
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
            This resident already has a valid BHERT Certificate (Positive) issued on{' '}
            {validCertInfo && formatDateDisplay(validCertInfo.date_issued)}.
            Certificates are valid for 1 year.
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
                {display.bhert_certificate_positive_id || 'Draft (Not yet saved)'}
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
                Request Reason:
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {display.request_reason}
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
                {display.use_signature ? 'Enabled' : 'Disabled'}
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
          {display.bhert_certificate_positive_id && (
            <Button
              onClick={() => {
                const verificationUrl = `${window.location.origin}/verify-certificate?id=${display.bhert_certificate_positive_id}`;
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


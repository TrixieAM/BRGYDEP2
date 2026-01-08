import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CaloocanLogo from '../../assets/CaloocanLogo.png';
import Logo145 from '../../assets/Logo145.png';
import BagongPilipinas from '../../assets/BagongPilipinas.png';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { useCertificateManager } from '../../hooks/useCertificateManager';
import { getSignatures, getSignatureImageUrl } from '../../services/signatureService';

// Import Material UI components at the top of your file
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Autocomplete,
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
} from '@mui/icons-material';
import { useMediaQuery } from '@mui/material';

// Define the custom theme matching Permit to Travel
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

export default function OathJobSeeker() {
  const apiBase = 'http://localhost:5000';
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
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  const [zoomLevel, setZoomLevel] = useState(0.75);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [residents, setResidents] = useState([]);
  const [signatures, setSignatures] = useState([]);
  const [selectedSignature, setSelectedSignature] = useState(null);

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Add this after the imports and before the component function
  const { 
    saveCertificate, 
    getValidityPeriod,
    calculateExpirationDate 
  } = useCertificateManager('Oath of Undertaking Job Seeker');

  const [formData, setFormData] = useState({
    resident_id: null,  // Add this field
    name: '',
    address: '',
    dob: '',
    age: '',
    dateIssued: new Date().toISOString().split('T')[0],
    use_signature: false, // Add e-signature field
    signature_id: null,   // Add signature ID field
  });

  // ---------- HELPERS ----------
  function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    const getOrdinal = (n) => {
      if (n > 3 && n < 21) return 'th';
      switch (n % 10) {
        case 1:
          return 'st';
        case 2:
          return 'nd';
        case 3:
          return 'rd';
        default:
          return 'th';
      }
    };
    return `${day}${getOrdinal(day)} day of ${month}, ${year}`;
  }

  function formatDateDisplay(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
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

  function calculateAge(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age.toString();
  }

  function numberToWords(num) {
    if (!num) return '';
    const ones = [
      '',
      'One',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
      'Ten',
      'Eleven',
      'Twelve',
      'Thirteen',
      'Fourteen',
      'Fifteen',
      'Sixteen',
      'Seventeen',
      'Eighteen',
      'Nineteen',
    ];
    const tens = [
      '',
      '',
      'Twenty',
      'Thirty',
      'Forty',
      'Fifty',
      'Sixty',
      'Seventy',
      'Eighty',
      'Ninety',
    ];

    if (num < 20) return ones[num];
    if (num < 100)
      return (
        tens[Math.floor(num / 10)] + (num % 10 ? ` ${ones[num % 10]}` : '')
      );
    if (num < 1000)
      return (
        ones[Math.floor(num / 100)] +
        ' Hundred' +
        (num % 100 ? ` ${numberToWords(num % 100)}` : '')
      );
    return num.toString();
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
    return `OJS-${year}${month}${day}-${random}`;
  }

  // Store certificate data in localStorage for QR code verification
  function storeCertificateData(certificateData) {
    if (!certificateData.id) return;

    // Get existing certificates from localStorage
    const existingCertificates = JSON.parse(
      localStorage.getItem('certificates') || '{}'
    );

    // Add or update the certificate
    existingCertificates[certificateData.id] = certificateData;

    // Store back to localStorage
    localStorage.setItem('certificates', JSON.stringify(existingCertificates));
  }

  // ---------- API / CRUD ----------
  // ---------- LOAD RESIDENT RECORDS ----------
  async function loadResidents() {
    try {
      const res = await fetch(`${apiBase}/residents`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setResidents(data);
      } else {
        setResidents([]);
      }
    } catch (err) {
      console.error('Failed to fetch residents:', err);
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
    loadSignatures();
  }, []);
  
  async function loadRecords() {
    try {
      const res = await fetch(`${apiBase}/oath-job`, { headers: getAuthHeaders() });
      const data = await res.json();
      setRecords(
        Array.isArray(data)
          ? data.map((r) => ({
              id: r.id,
              // Make sure to include resident_id from the API response
              resident_id: r.resident_id || null,
              name: r.full_name,
              address: r.address,
              dob: r.dob?.slice(0, 10) || '',
              age: r.age || calculateAge(r.dob?.slice(0, 10)), // Calculate age if not provided
              dateIssued: r.date_issued?.slice(0, 10) || '',
              dateCreated: r.date_created || null,
              transaction_number: r.transaction_number || generateTransactionNumber(),
              use_signature: Boolean(r.use_signature),
              signature_id: r.signature_id || null,
              official_name: r.official_name || null,
              designation: r.designation || null,
              signature_path: r.signature_path || null,
            }))
          : []
      );
    } catch (e) {
      console.error('loadRecords error', e);
    }
  }

  useEffect(() => {
    loadRecords();
  }, []);

  function toServerPayload(data) {
    return {
      resident_id: data.resident_id || null,
      full_name: data.name,
      age: data.age ? Number(data.age) : null,
      address: data.address || null,
      date_issued: data.dateIssued,
      transaction_number: data.transaction_number,
      use_signature: data.use_signature ? 1 : 0,
      signature_id: data.use_signature && data.signature_id ? data.signature_id : null,
    };
  }

  // Update the handleCreate function
  async function handleCreate() {
    try {
      // Generate a transaction number for new certificates
      const transactionNumber = generateTransactionNumber();
      const validityPeriod = getValidityPeriod('Oath of Undertaking Job Seeker');
      const updatedFormData = {
        ...formData,
        transaction_number: transactionNumber,
        dateCreated: new Date().toISOString(), // Add current timestamp
        validity_period: validityPeriod, // Add validity period
      };

      const res = await fetch(`${apiBase}/oath-job`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(toServerPayload(updatedFormData)),
      });
      if (!res.ok) throw new Error('Create failed');
      const created = await res.json();
      const newRec = {
        ...updatedFormData,
        id: created.id,
        official_name: created.official_name,
        designation: created.designation,
        signature_path: created.signature_path,
      };
      setRecords([newRec, ...records]);
      setSelectedRecord(newRec);
      storeCertificateData(newRec);
      
      // Save to certificates table using the hook
      await saveCertificate({
        resident_id: newRec.resident_id,
        full_name: newRec.name,
        certificate_type: 'Oath of Undertaking Job Seeker',
        request_reason: 'Job Application', // Explicitly set the reason
        validity_period: newRec.validity_period,
        date_issued: newRec.dateIssued,
        reference_id: created.id, // Add reference to the oath record
      }, true);
      
      resetForm();
      setActiveTab('records');
    } catch (e) {
      console.error(e);
      alert('Failed to create record');
    }
  }

  // Update the handleUpdate function
  async function handleUpdate() {
    try {
      const validityPeriod = getValidityPeriod('Oath of Undertaking Job Seeker');
      const updatedFormData = {
        ...formData,
        validity_period: validityPeriod, // Add validity period
      };
      
      const res = await fetch(`${apiBase}/oath-job/${editingId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(toServerPayload(updatedFormData)),
      });
      if (!res.ok) throw new Error('Update failed');
      const updatedData = await res.json();
      // The backend creates a NEW record, so we need to add it to records and remove/replace the old one
      const updatedRec = { 
        ...updatedData,
        name: updatedData.full_name,
        dateIssued: updatedData.date_issued?.split('T')[0] || '',
        validity_period: validityPeriod,
        use_signature: Boolean(updatedData.use_signature),
        signature_id: updatedData.signature_id,
        official_name: updatedData.official_name,
        designation: updatedData.designation,
        signature_path: updatedData.signature_path,
      };
      // Remove old record and add new one
      setRecords([updatedRec, ...records.filter((r) => r.id !== editingId)]);
      setSelectedRecord(updatedRec);
      storeCertificateData(updatedRec);
      
      // Save to certificates table using the hook
      await saveCertificate({
        resident_id: updatedRec.resident_id,
        full_name: updatedRec.name,
        certificate_type: 'Oath of Undertaking Job Seeker',
        request_reason: 'Job Application', // Explicitly set the reason
        validity_period: updatedRec.validity_period,
        date_issued: updatedRec.dateIssued,
        reference_id: editingId, // Add reference to the oath record
      }, false);
      
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
      // Make sure we're preserving the resident_id
      resident_id: record.resident_id || null,
      // Ensure date fields are properly formatted
      dob: record.dob || '',
      age: record.age || calculateAge(record.dob), // Calculate age from DOB if not provided
      dateIssued: record.dateIssued || new Date().toISOString().split('T')[0],
      use_signature: Boolean(record.use_signature),
      signature_id: record.signature_id || null,
    });
    setEditingId(record.id);
    setIsFormOpen(true);
    setActiveTab('form');
    
    // Set selected signature if exists
    if (record.signature_id) {
      const sig = signatures.find((s) => s.signature_id === record.signature_id);
      setSelectedSignature(sig || null);
    } else {
      setSelectedSignature(null);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this record?')) return;
    try {
      const res = await fetch(`${apiBase}/oath-job/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Delete failed');
      setRecords(records.filter((r) => r.id !== id));
      if (selectedRecord?.id === id) setSelectedRecord(null);
      const existingCertificates = JSON.parse(
        localStorage.getItem('certificates') || '{}'
      );
      delete existingCertificates[id];
      localStorage.setItem(
        'certificates',
        JSON.stringify(existingCertificates)
      );
    } catch (e) {
      console.error('handleDelete error', e);
      alert('Failed to delete record');
    }
  }

  function handleView(record) {
    setSelectedRecord(record);
    setFormData({ ...record });
    setEditingId(record.id);
    setIsFormOpen(true);
    setActiveTab('form');
    
    // Set selected signature if exists
    if (record.signature_id) {
      const sig = signatures.find((s) => s.signature_id === record.signature_id);
      setSelectedSignature(sig || null);
    } else {
      setSelectedSignature(null);
    }
  }

  function resetForm() {
    setFormData({
      resident_id: null,
      name: '',
      address: '',
      dob: '',
      age: '',
      dateIssued: new Date().toISOString().split('T')[0],
      use_signature: false,
      signature_id: null,
    });
    setEditingId(null);
    setIsFormOpen(false);
    setSelectedRecord(null);
    setSelectedSignature(null);
  }

  function handleSubmit() {
    if (editingId) handleUpdate();
    else handleCreate();
  }

  // ---------- QR STORAGE & GENERATION ----------
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
      if (display.id || display.name) {
        // Store the certificate data in localStorage
        storeCertificateData(display);

        // Create a URL that points to a verification page
        // Using window.location.origin to get the current domain
        const verificationUrl = `${
          window.location.origin
        }/verify-oath-job-seeker?id=${display.id || 'draft'}`;

        const qrContent = `CERTIFICATE VERIFICATION:
        𝗧𝗿𝗮𝗻𝘀𝗮𝗰𝘁𝗶𝗼𝗻 𝗡𝗼: ${display.transaction_number || 'N/A'}
        Name: ${display.name}
        Date Issued: ${
        display.dateCreated
        ? formatDateTimeDisplay(display.dateCreated)
        : new Date().toLocaleString()
        }
        Document Type: Oath of Undertaking Job Seeker
       
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

  const handleQrCodeClick = () => {
    if (display.id) {
      // Open the verification URL in a new tab
      const verificationUrl = `${window.location.origin}/verify-oath-job-seeker?id=${display.id}`;
      window.open(verificationUrl, '_blank');
    } else {
      // Show a dialog with the certificate details (for unsaved draft)
      setQrDialogOpen(true);
    }
  };

  // ---------- PDF + Print ----------
  async function generatePDF() {
    if (!display.id) {
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
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
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
      // Metadata / verification page
      pdf.addPage();
      pdf.setFontSize(18);
      pdf.setFont(undefined, 'bold');
      pdf.text('Certificate Verification Information', 0.5, 0.75);
      pdf.setLineWidth(0.02);
      pdf.line(0.5, 0.85, 8, 0.85);
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      const details = [
        `Certificate Type: Oath of Undertaking Job Seeker`,
        `Certificate ID: ${display.id || 'Draft'}`,
        `Transaction Number: ${display.transaction_number || 'N/A'}`,
        `Full Name: ${display.name || ''}`,
        `Address: ${display.address || ''}`,
        `Birthday: ${display.dob ? formatDateDisplay(display.dob) : 'N/A'}`,
        `Age: ${display.age || ''}`,
        `Date Issued: ${display.dateIssued || ''}`,
        `Date Created (E-Signature Applied): ${display.dateCreated ? formatDateTimeDisplay(display.dateCreated) : new Date().toLocaleString()}`,
        ``,
        `VERIFICATION:`,
        `Scan the QR code on the certificate or visit: ${window.location.origin}/verify-oath-job-seeker?id=${display.id || 'Draft'}`,
      ];
      let yPos = 1.2;
      const lineHeight = 0.25;
      details.forEach((line) => {
        pdf.text(line, 0.5, yPos);
        yPos += lineHeight;
      });
      const fileName = `OathUndertaking_${(display.name || 'record').replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('generatePDF error', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  }

  function handlePrint() {
    if (!display.id) {
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

  // ---------- Zoom Controls ----------
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

  // ---------- Filters ----------
  const filteredRecords = useMemo(
    () =>
      records.filter(
        (r) =>
          r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.contactNo || '').includes(searchTerm)
      ),
    [records, searchTerm]
  );

  // ---------- JSX ----------
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
                  Oath of Undertaking Job Seeker
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Manage all records of the Oath of Undertaking Job Seeker
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
                      disabled={!display.id || isGeneratingPDF} 
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
                      disabled={!display.id}
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
                  {/* Logos */}
                  <img
                    src={CaloocanLogo}
                    alt="City Logo"
                    style={{
                      position: 'absolute',
                      width: '90px',
                      top: '28px',
                      left: '32px',
                    }}
                  />
                  <img
                    src={Logo145}
                    alt="Barangay Logo"
                    style={{
                      position: 'absolute',
                      width: '110px',
                      top: '26px',
                      right: '32px',
                    }}
                  />

                  {/* Watermark */}
                  <img src={Logo145} alt="Watermark" style={styles.watermarkImg} />

                  {/* Title */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50px',
                      width: '100%',
                      textAlign: 'center',
                      fontFamily: '"Times New Roman", sans-serif',
                      fontSize: '15pt',
                      letterSpacing: '2px',
                      fontWeight: 'bold',
                    }}
                  >
                    OATH OF
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      top: '80px',
                      width: '100%',
                      textAlign: 'center',
                      fontFamily: '"Times New Roman", sans-serif',
                      fontSize: '19pt',
                      letterSpacing: '2px',
                      fontWeight: 'bold',
                    }}
                  >
                    UNDERTAKING
                  </div>

                  {/* Body Intro */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '160px',
                      left: '80px',
                      width: '640px',
                      fontFamily: '"Times New Roman", serif',
                      fontSize: '12pt',
                      lineHeight: 1.6,
                      textAlign: 'justify',
                    }}
                  >
                    I,{' '}
                    <span
                      style={{
                        display: 'inline-block',
                        minWidth: '180px',
                        borderBottom: '1px solid black',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        fontStyle: 'italic',
                      }}
                    >
                      {display.name || '\u00A0'}
                    </span>
                    ,{' '}
                    <b>
                      <span
                        style={{
                          display: 'inline-block',
                          minWidth: '180px',
                          borderBottom: '1px solid black',
                          textAlign: 'center',
                          fontStyle: 'italic',
                        }}
                      >
                        {display.age
                          ? `${numberToWords(display.age)} (${display.age}) yrs old`
                          : '\u00A0'}
                      </span>
                    </b>
                    , is Bonafide resident of{' '}
                    <b>
                      <span
                        style={{
                          display: 'inline-block',
                          minWidth: '250px',
                          borderBottom: '1px solid black',
                          textAlign: 'center',
                        }}
                      >
                        {display.address || '\u00A0'}
                      </span>
                    </b>{' '}
                    <b> Brgy. 145, Zone 13, </b>
                    District 1, Bagong Barrio Caloocan City for One year, availing
                    the benefits of{' '}
                    <b>
                      <i> Republic Act 11261,</i>
                    </b>{' '}
                    otherwise known as the{' '}
                    <b>
                      <i> First Time Jobseeker Act of 2019, </i>
                    </b>{' '}
                    do hereby declare, agree and undertake to abide and be bound by
                    the following:
                  </div>

                  {/* List */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '300px',
                      left: '100px',
                      width: '610px',
                      fontFamily: '"Times New Roman", serif',
                      fontSize: '12pt',
                      lineHeight: 1.2,
                      textAlign: 'justify',
                    }}
                  >
                    <p>
                      1. That this is the first time that I will actively look for a
                      job, and therefore requesting that a Barangay Certification be
                      issued in my favor to avail the benefits of the law;
                    </p>
                    <p>
                      2. That I am aware that the benefit and privilege/s under the
                      said law shall be valid only for one (1) year from the date
                      that the Barangay Certificate is issued;
                    </p>
                    <p>3. That I can avail the benefits of the law only once;</p>
                    <p>
                      4. That I understand that my personal information shall be
                      included in the Roster/List of First Time Jobseekers and will
                      not be used for any unlawful purposes;
                    </p>
                    <p>
                      5. That I will inform and/or report to the Barangay
                      personally, through text or other means, or through my
                      family/relatives once I get employed; and
                    </p>
                    <p>
                      6. That I am not a beneficiary of the Job Start Program under
                      R.A. No. 10869 and other laws that give similar exemption for
                      the documents of transaction exempted under R.A. No. 11261.
                    </p>
                    <p>
                      7. That if issued the requested Certification, I will not use
                      the same in any fraud, neither falsify nor help and/or assist
                      in the fabrication of the said certification.
                    </p>
                    <p>
                      8. That this undertaking is made solely for the purpose of
                      obtaining a Barangay Certification consistent with the
                      objective of R.A. No. 11261 and not for any other purpose.
                    </p>
                    <p>
                      9. That I consent to the use of my personal information
                      pursuant to the Data Privacy Act and other applicable laws,
                      rules, and regulations.
                    </p>
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      bottom: '230px',
                      left: '95px',
                      width: '610px',
                      fontFamily: '"Times New Roman", serif',
                      fontSize: '12pt',
                      lineHeight: 1.5,
                      textAlign: 'justify',
                    }}
                  >
                    <p>
                      Signed this{' '}
                      <span style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                        {display.dateIssued
                          ? formatDate(display.dateIssued)
                          : '__________________'}
                      </span>{' '}
                      in Barangay 145 Zone 13 District 1 at the City of Caloocan.
                    </p>
                  </div>

                  {/* Bottom Signatures and QR */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '140px',
                      left: '50px',
                      width: '260px',
                      textAlign: 'center',
                      fontFamily: '"Times New Roman", serif',
                      fontSize: '12pt',
                    }}
                  >
                    {/* QR Code */}
                    {qrCodeUrl && (
                      <div style={{ marginBottom: '-100px' }}>
                        <div
                          style={{
                            display: 'inline-block',
                          }}
                        >
                          <img
                            src={qrCodeUrl}
                            alt="QR Code"
                            style={{
                              width: '120px',
                              height: '120px',
                              border: '2px solid #000',
                              padding: '6px',
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
                          {display.dateCreated
                            ? formatDateTimeDisplay(display.dateCreated)
                            : new Date().toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      bottom: '150px',
                      right: '30px',
                      width: '320px',
                      textAlign: 'center',
                      fontFamily: '"Times New Roman", serif',
                      fontSize: '12pt',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 'bold',
                        fontStyle: 'italic',
                        marginBottom: '3px',
                      }}
                    >
                      {display.name || ''}
                    </div>
                    <div
                      style={{
                        borderTop: '1px solid #000',
                        width: '80%',
                        margin: '0 auto 6px auto',
                      }}
                    />
                    <div>First Time Job Seeker</div>
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      bottom: '50px',
                      right: '28px',
                      width: '320px',
                      textAlign: 'center',
                      fontFamily: '"Times New Roman", serif',
                      fontSize: '12pt',
                      fontWeight: 'bold',
                    }}
                  >
                    {/* E-Signature Section */}
                    {display.use_signature && display.signature_path ? (
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
                            src={getSignatureImageUrl(display.signature_path)}
                            alt="Signature"
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
                        <div
                          style={{
                            fontWeight: 'bold',
                            fontStyle: 'italic',
                            marginBottom: '3px',
                          }}
                        >
                          Roselyn Pestilos Anore
                        </div>
                        <div
                          style={{
                            borderTop: '1px solid #000',
                            width: '80%',
                            margin: '0 auto 6px auto',
                          }}
                        />
                        <div
                          style={{
                            marginTop: '-4px',
                            textAlign: 'center',
                            fontFamily: '"Times New Roman", serif',
                            fontSize: '12pt',
                          }}
                        >
                          <div>Barangay Secretary</div>
                          <div>(Barangay Official/Designation/Position)</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          style={{
                            fontWeight: 'bold',
                            fontStyle: 'italic',
                            marginBottom: '3px',
                          }}
                        >
                          Roselyn Pestilos Anore
                        </div>
                        <div
                          style={{
                            borderTop: '1px solid #000',
                            width: '80%',
                            margin: '0 auto 6px auto',
                          }}
                        />
                        <div
                          style={{
                            marginTop: '-4px',
                            textAlign: 'center',
                            fontFamily: '"Times New Roman", serif',
                            fontSize: '12pt',
                          }}
                        >
                          <div>Barangay Secretary</div>
                          <div>(Barangay Official/Designation/Position)</div>
                        </div>
                      </>
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
                    {editingId ? "Edit Certificate" : "New Oath of Undertaking"}
                  </Typography>
                  {selectedRecord && !editingId && (
                    <Typography variant="body2" color="text.secondary">
                      Viewing: {selectedRecord.name}
                    </Typography>
                  )}
                </Paper>

                <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
                  <Stack spacing={3}>
                    <Autocomplete
                      options={residents}
                      getOptionLabel={(option) => option.full_name || ''}
                      // Use resident_id instead of name for the value
                      value={residents.find((r) => r.resident_id === formData.resident_id) || null}
                      onChange={(e, value) => {
                        console.log('Selected resident object:', value);
                        if (value) {
                          setFormData({
                            ...formData,
                            resident_id: value.resident_id, // Use resident_id instead of id
                            name: value.full_name,
                            address: value.address || '',
                            dob: value.dob?.slice(0, 10) || '',
                            age: calculateAge(value.dob?.slice(0, 10)),
                          });
                        } else {
                          setFormData({
                            ...formData,
                            resident_id: null,
                            name: '',
                            address: '',
                            dob: '',
                            age: '',
                          });
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
                      label="Address *"
                      variant="outlined"
                      size="small"
                      fullWidth
                      multiline
                      rows={2}
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      required
                    />

                    <Grid container spacing={1.5}>
                      <Grid item xs={6}>
                        <TextField
                          label="Birthday *"
                          type="date"
                          variant="outlined"
                          size="small"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          value={formData.dob}
                          onChange={(e) => {
                            const dob = e.target.value;
                            const age = calculateAge(dob);
                            setFormData({ ...formData, dob: dob, age });
                          }}
                          required
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="Age"
                          variant="outlined"
                          size="small"
                          fullWidth
                          value={formData.age}
                          InputProps={{ readOnly: true }}
                          sx={{
                            '& .MuiOutlinedInput-root': { bgcolor: 'grey.100' },
                          }}
                        />
                      </Grid>
                    </Grid>

                    <TextField
                      label="Date Issued *"
                      type="date"
                      variant="outlined"
                      size="small"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={formData.dateIssued}
                      onChange={(e) =>
                        setFormData({ ...formData, dateIssued: e.target.value })
                      }
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
                              signature_id:
                                checked && selectedSignature
                                  ? selectedSignature.signature_id
                                  : null,
                            });
                            if (!checked) {
                              setSelectedSignature(null);
                            }
                          }}
                          color="primary"
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

                    <Box sx={{ display: 'flex', gap: 1, pt: 1 }}>
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
                    placeholder="Search by name, address, or contact no." 
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
                        <Card key={record.id} sx={{ 
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          borderLeft: 4,
                          borderColor: "primary.main",
                        }}>
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, color: "#000000" }}>
                                  {record.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  {record.address}
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
                                  <Chip 
                                    label={record.transaction_number || 'N/A'} 
                                    size="small" 
                                    color="primary" 
                                    variant="outlined" 
                                  />
                                  <Typography variant="caption" color="text.secondary">
                                    Issued: {formatDateDisplay(record.dateIssued)}
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
                                    onClick={() => handleDelete(record.id)} 
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
                {display.id || 'Draft (Not yet saved)'}
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
                {display.name}
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
                Date of Birth:
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {display.dob ? formatDateDisplay(display.dob) : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Age:
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {display.age}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Date Issued:
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {formatDateDisplay(display.dateIssued)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Date Created:
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {display.dateCreated
                  ? formatDateTimeDisplay(display.dateCreated)
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
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: 'grey.600' }}>
                  Signed By:
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {display.official_name || 'N/A'}
                </Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)} color="primary">
            Close
          </Button>
          {display.id && (
            <Button
              onClick={() => {
                const verificationUrl = `${window.location.origin}/verify-oath-job-seeker?id=${display.id}`;
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

const styles = {
  watermarkImg: {
    position: 'absolute',
    top: '200px',
    left: '50%',
    transform: 'translateX(-50%)',
    opacity: 0.12,
    width: '650px',
    pointerEvents: 'none',
    zIndex: 0,
  },
};

// ================= FULL VERIFICATION VIEW ==================
function OathJobVerification() {
  const [record, setRecord] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [qrCodeUrl, setQrCodeUrl] = React.useState(null);
  const zoomLevel = 1;

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
      setError('No certificate ID provided.');
      setLoading(false);
      return;
    }

    // Retrieve from localStorage first
    const certificates = JSON.parse(
      localStorage.getItem('certificates') || '{}'
    );
    const cert = certificates[id];
    if (cert) {
      setRecord(cert);
      setLoading(false);
      return;
    }

    // Otherwise fetch from backend
    fetch(`http://localhost:5000/oath-job/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.id) {
          setRecord({
            id: data.id,
            name: data.full_name,
            address: data.address,
            age: data.age,
            dateIssued: data.date_issued,
            dateCreated: data.date_created,
            transaction_number: data.transaction_number,
            use_signature: Boolean(data.use_signature),
            signature_id: data.signature_id,
            official_name: data.official_name,
            designation: data.designation,
            signature_path: data.signature_path,
          });
        } else {
          setError('Certificate not found.');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch certificate data.');
        setLoading(false);
      });
  }, []);

  React.useEffect(() => {
    if (record) {
      const verificationUrl = `${window.location.origin}/verify-oath-job-seeker?id=${record.id}`;
      const qrData = `OATH JOB SEEKER CERTIFICATE\nTransaction Number: ${record.transaction_number || 'N/A'}\nName: ${record.name}\nDate Issued: ${record.dateIssued}\nURL: ${verificationUrl}`;
      import('qrcode').then((QR) => {
        QR.toDataURL(qrData).then(setQrCodeUrl);
      });
    }
  }, [record]);

  if (loading)
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        Loading certificate...
      </div>
    );
  if (error)
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', color: 'red' }}>
        {error}
      </div>
    );

  const numberToWords = (n) =>
    new Intl.NumberFormat('en-US', { style: 'decimal' }).format(n);

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleQrCodeClick = () => {
    if (record?.id) {
      const url = `${window.location.origin}/verify-oath-job-seeker?id=${record.id}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        flex: 1,
        overflow: 'auto',
        padding: '20px 0',
        background: '#f0f0f0',
        minHeight: '100vh',
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
            height: '11in',
            boxShadow: '0 0 8px rgba(0,0,0,0.2)',
            background: '#fff',
            overflow: 'hidden',
          }}
        >
          {/* Logos */}
          <img
            src={CaloocanLogo}
            alt="City-Logo"
            style={{
              position: 'absolute',
              width: '90px',
              top: '28px',
              left: '32px',
            }}
          />
          <img
            src={Logo145}
            alt="Barangay Logo"
            style={{
              position: 'absolute',
              width: '110px',
              top: '26px',
              right: '32px',
            }}
          />

          {/* Watermark */}
          <img
            src={Logo145}
            alt="Watermark"
            style={{
              position: 'absolute',
              opacity: 0.1,
              width: '550px',
              left: '50%',
              top: '250px',
              transform: 'translateX(-50%)',
            }}
          />

          {/* Title */}
          <div
            style={{
              position: 'absolute',
              top: '50px',
              width: '100%',
              textAlign: 'center',
              fontFamily: '"Times New Roman", sans-serif',
              fontSize: '15pt',
              letterSpacing: '2px',
              fontWeight: 'bold',
            }}
          >
            OATH OF
          </div>
          <div
            style={{
              position: 'absolute',
              top: '80px',
              width: '100%',
              textAlign: 'center',
              fontFamily: '"Times New Roman", sans-serif',
              fontSize: '19pt',
              letterSpacing: '2px',
              fontWeight: 'bold',
            }}
          >
            UNDERTAKING
          </div>

          {/* Body Intro */}
          <div
            style={{
              position: 'absolute',
              top: '160px',
              left: '80px',
              width: '640px',
              fontFamily: '"Times New Roman", serif',
              fontSize: '10pt',
              lineHeight: 1.6,
              textAlign: 'justify',
            }}
          >
            I,{' '}
            <span
              style={{
                display: 'inline-block',
                minWidth: '180px',
                borderBottom: '1px solid black',
                fontWeight: 'bold',
                textAlign: 'center',
                fontStyle: 'italic',
               
              }}
            >
              {record.name}
            </span>
            ,{' '}
            <b>
              <span
                style={{
                  display: 'inline-block',
                  minWidth: '180px',
                  borderBottom: '1px solid black',
                  textAlign: 'center',
                  fontStyle: 'italic',
                }}
              >
                {record.age ? `${record.age} yrs old` : '\u00A0'}
              </span>
            </b>
            , is Bonafide resident of{' '}
            <b>
              <span
                style={{
                  display: 'inline-block',
                  minWidth: '250px',
                  borderBottom: '1px solid black',
                  textAlign: 'center',
                }}
              >
                {record.address}
              </span>
            </b>{' '}
            <b> Brgy. 145, Zone 13, </b>
            District 1, Bagong Barrio Caloocan City for One year, availing the
            benefits of{' '}
            <b>
              <i>Republic Act 11261</i>
            </b>
            , otherwise known as the{' '}
            <b>
              <i>First Time Jobseeker Act of 2019</i>
            </b>
            , do hereby declare, agree and undertake to abide and be bound by
            the following:
          </div>

          {/* List */}
          <div
            style={{
              position: 'absolute',
              top: '300px',
              left: '100px',
              width: '610px',
              fontFamily: '"Times New Roman", serif',
              fontSize: '10pt',
              lineHeight: 1.2,
              textAlign: 'justify',
            }}
          >
            <p>
              1. That this is the first time that I will actively look for a
              job, and therefore requesting that a Barangay Certification be
              issued in my favor to avail the benefits of the law;
            </p>
            <p>
              2. That I am aware that the benefit and privilege/s under the said
              law shall be valid only for one (1) year from the date that the
              Barangay Certificate is issued;
            </p>
            <p>3. That I can avail the benefits of the law only once;</p>
            <p>
              4. That I understand that my personal information shall be
              included in the Roster/List of First Time Jobseekers and will not
              be used for any unlawful purposes;
            </p>
            <p>
              5. That I will inform and/or report to the Barangay personally,
              through text or other means, or through my family/relatives once I
              get employed; and
            </p>
            <p>
              6. That I am not a beneficiary of the Job Start Program under R.A.
              No. 10869 and other laws that give similar exemption for the
              documents of transaction exempted under R.A. No. 11261.
            </p>
            <p>
              7. That if issued the requested Certification, I will not use the
              same in any fraud, neither falsify nor help and/or assist in the
              fabrication of the said certification.
            </p>
            <p>
              8. That this undertaking is made solely for the purpose of
              obtaining a Barangay Certification consistent with the objective
              of R.A. No. 11261 and not for any other purpose.
            </p>
            <p>
              9. That I consent to the use of my personal information pursuant
              to the Data Privacy Act and other applicable laws, rules, and
              regulations.
            </p>
          </div>

          {/* Footer section */}
          <div
            style={{
              position: 'absolute',
              bottom: '200px',
              left: '95px',
              width: '610px',
              fontFamily: '"Times New Roman", serif',
              fontSize: '12pt',
              lineHeight: 1.5,
              textAlign: 'justify',
            }}
          >
            <p>
              Signed this{' '}
              <span style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                {record.dateIssued
                  ? formatDate(record.dateIssued)
                  : '__________________'}
              </span>{' '}
              in Barangay 145 Zone 13 District 1 at the City of Caloocan.
            </p>
          </div>

          {/* QR and signatures */}
          <div
            style={{
              position: 'absolute',
              bottom: '130px',
              left: '50px',
              width: '260px',
              textAlign: 'center',
              fontFamily: '"Times New Roman", serif',
              fontSize: '12pt',
            }}
          >
            {qrCodeUrl && (
              <div style={{ marginBottom: '-100px' }}>
                <div
                  style={{
                    display: 'inline-block',
                  }}
                >
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    style={{
                      width: '140px',
                      height: '140px',
                      border: '2px solid #000',
                      padding: '6px',
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
                  {record.dateCreated
                    ? new Date(record.dateCreated).toLocaleString()
                    : new Date().toLocaleString()}
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: '130px',
              right: '30px',
              width: '320px',
              textAlign: 'center',
              fontFamily: '"Times New Roman", serif',
              fontSize: '12pt',
            }}
          >
            <div
              style={{
                fontWeight: 'bold',
                fontStyle: 'italic',
                marginBottom: '3px',
              }}
            >
              {record.name}
            </div>
            <div
              style={{
                borderTop: '1px solid #000',
                width: '80%',
                margin: '0 auto 6px auto',
              }}
            />
            <div>First Time Job Seeker</div>
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '28px',
              width: '320px',
              textAlign: 'center',
              fontFamily: '"Times New Roman", serif',
              fontSize: '12pt',
              fontWeight: 'bold',
            }}
          >
            {/* E-Signature Section */}
            {record.use_signature && record.signature_path ? (
              <>
                <div
                  style={{
                    marginBottom: '5px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={getSignatureImageUrl(record.signature_path)}
                    alt="Signature"
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
                <div
                  style={{
                    fontWeight: 'bold',
                    fontStyle: 'italic',
                    marginBottom: '3px',
                  }}
                >
                   Roselyn Pestilos Anore
                </div>
                <div
                  style={{
                    borderTop: '1px solid #000',
                    width: '80%',
                    margin: '0 auto 6px auto',
                  }}
                />
                <div
                  style={{
                    marginTop: '-4px',
                    textAlign: 'center',
                    fontFamily: '"Times New Roman", serif',
                    fontSize: '12pt',
                  }}
                >
                  <div>Barangay Secretary</div>
                  <div>(Barangay Official/Designation/Position)</div>
                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    fontWeight: 'bold',
                    fontStyle: 'italic',
                    marginBottom: '3px',
                  }}
                >
                  Roselyn Pestilos Anore
                </div>
                <div
                  style={{
                    borderTop: '1px solid #000',
                    width: '80%',
                    margin: '0 auto 6px auto',
                  }}
                />
                <div>Barangay Secretary</div>
                <div>(Barangay Official/Designation/Position)</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { OathJobVerification };
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
import {
  getSignatures,
  getSignatureImageUrl,
} from '../../services/signatureService';

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

// Define the custom theme (mirrored from BarangayClearance)
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

export default function BusinessClearance() {
  const apiBase = 'http://localhost:5000';
  const navigate = useNavigate();
  const { getToken } = useAuth();

  // Helper function to get auth headers
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
  const [zoomLevel, setZoomLevel] = useState(0.75); // Default zoom level
  const [signatures, setSignatures] = useState([]);
  const [selectedSignature, setSelectedSignature] = useState(null);

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { saveCertificate, getValidityPeriod, calculateExpirationDate } =
    useCertificateManager('Business Clearance');

  const [formData, setFormData] = useState({
    resident_id: '',
    full_name: '',
    address: '',
    nature_of_business: '', // New field
    date_issued: new Date().toISOString().split('T')[0],
    date_expired: '', // New field - will be calculated automatically
    remarks:
      'They are operating under the jurisdiction of our Brgy. 145, being issued under the requirement of the New Local Code under Republic Act 7160 for securing their permit.', // Default remarks
    request_reason: '',
    transaction_number: '', // Transaction number field
    use_signature: false, // Added for e-signature
    signature_id: null, // Added for e-signature
  });

  // Calculate expiration date when date_issued changes
  useEffect(() => {
    if (formData.date_issued) {
      const issuedDate = new Date(formData.date_issued);
      const expiredDate = new Date(issuedDate);
      expiredDate.setFullYear(expiredDate.getFullYear() + 1);

      // Format as YYYY-MM-DD
      const formattedDate = expiredDate.toISOString().split('T')[0];

      // Only update if the date has actually changed to avoid infinite loops
      if (formattedDate !== formData.date_expired) {
        setFormData((prev) => ({
          ...prev,
          date_expired: formattedDate,
        }));
      }
    }
  }, [formData.date_issued]);

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
    return `BUS-${year}${month}${day}-${random}`;
  }

  // Store certificate data in localStorage for QR code verification
  function storeCertificateData(certificateData) {
    if (!certificateData.business_clearance_id) return;

    // Get existing certificates from localStorage
    const existingCertificates = JSON.parse(
      localStorage.getItem('certificates') || '{}'
    );

    // Add or update the certificate
    existingCertificates[certificateData.business_clearance_id] =
      certificateData;

    // Store back to localStorage
    localStorage.setItem('certificates', JSON.stringify(existingCertificates));
  }

  async function loadResidents() {
    try {
      const res = await fetch(`${apiBase}/residents`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      setResidents(data);
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
      const res = await fetch(`${apiBase}/business-clearance`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      setRecords(
        Array.isArray(data)
          ? data.map((r) => ({
              business_clearance_id: r.business_clearance_id,
              resident_id: r.resident_id,
              full_name: r.full_name,
              address: r.address,
              nature_of_business: r.nature_of_business || '',
              date_issued: r.date_issued?.split('T')[0] || '',
              date_expired: r.date_expired?.split('T')[0] || '',
              remarks: r.remarks || '',
              request_reason: r.request_reason || '',
              date_created: r.date_created,
              transaction_number:
                r.transaction_number || generateTransactionNumber(), // Generate if missing
              use_signature: Boolean(r.use_signature), // Added for e-signature
              signature_id: r.signature_id || null, // Added for e-signature
              official_name: r.official_name || null, // Added for e-signature
              designation: r.designation || null, // Added for e-signature
              signature_path: r.signature_path || null, // Added for e-signature
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

  // Generate QR code with URL for PDF download
  useEffect(() => {
    const generateQRCode = async () => {
      if (display.business_clearance_id || display.full_name) {
        // Store the certificate data in localStorage
        storeCertificateData(display);

        // Create a URL that points to a verification page
        const verificationUrl = `${
          window.location.origin
        }/verify-certificate?id=${display.business_clearance_id || 'draft'}`;

        const qrContent = `CERTIFICATE VERIFICATION:
        𝗧𝗿𝗮𝗻𝘀𝗮𝗰𝘁𝗶𝗼𝗻 𝗡𝗼: ${display.transaction_number || 'N/A'}
        Name: ${display.full_name}
        Date Issued: ${
          display.date_created
            ? formatDateTimeDisplay(display.date_created)
            : new Date().toLocaleString()
        }
        Document Type: Business Clearance
       
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
      address: data.address,
      nature_of_business: data.nature_of_business,
      date_issued: data.date_issued,
      date_expired: data.date_expired,
      remarks: data.remarks,
      request_reason: data.request_reason,
      transaction_number: data.transaction_number, // Include transaction number
      use_signature: data.use_signature ? 1 : 0, // Added for e-signature
      signature_id:
        data.use_signature && data.signature_id ? data.signature_id : null, // Added for e-signature
    };
  }

  function validateFormData(data) {
    const required = [
      'full_name',
      'address',
      'nature_of_business',
      'date_issued',
      'date_expired',
      'request_reason',
    ];
    const missing = required.filter((k) => {
      const v = data[k];
      return (
        v === null ||
        v === undefined ||
        (typeof v === 'string' && v.trim() === '')
      );
    });
    return { valid: missing.length === 0, missing };
  }

  async function handleCreate() {
    try {
      // Client-side validation to avoid 400 Bad Request from the server
      const validation = validateFormData(formData);
      if (!validation.valid) {
        alert(`Missing required fields: ${validation.missing.join(', ')}`);
        return;
      }

      // Generate a transaction number for new certificates
      const transactionNumber = generateTransactionNumber();
      const validityPeriod = getValidityPeriod('Business Clearance');
      const updatedFormData = {
        ...formData,
        transaction_number: transactionNumber,
        date_created: new Date().toISOString(), // Add current timestamp
        validity_period: validityPeriod, // Add validity period
      };

      const res = await fetch(`${apiBase}/business-clearance`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(toServerPayload(updatedFormData)),
      });

      if (!res.ok) {
        // Try to get server error message to show to user
        let errMsg = `Create failed (status ${res.status})`;
        try {
          const body = await res.json();
          if (body && body.error) errMsg = body.error;
        } catch (err) {
          // ignore JSON parse errors
        }
        throw new Error(errMsg);
      }

      const created = await res.json();
      const newRec = {
        ...updatedFormData,
        business_clearance_id: created.business_clearance_id,
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
      alert(`Failed to create record: ${e.message}`);
    }
  }

  async function handleUpdate() {
    try {
      const validityPeriod = getValidityPeriod('Business Clearance');
      const updatedFormData = {
        ...formData,
        validity_period: validityPeriod, // Add validity period
      };

      const res = await fetch(`${apiBase}/business-clearance/${editingId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(toServerPayload(updatedFormData)),
      });
      if (!res.ok) throw new Error('Update failed');
      const updatedData = await res.json();
      // The backend creates a NEW record, so we need to add it to records and remove/replace the old one
      const updated = {
        ...updatedData,
        business_clearance_id: updatedData.business_clearance_id,
        full_name: updatedData.full_name,
        address: updatedData.address,
        nature_of_business: updatedData.nature_of_business,
        date_issued: updatedData.date_issued?.split('T')[0] || '',
        date_expired: updatedData.date_expired?.split('T')[0] || '',
        remarks: updatedData.remarks || '',
        request_reason: updatedData.request_reason || '',
        date_created: updatedData.date_created,
        transaction_number: updatedData.transaction_number,
        validity_period: validityPeriod,
        use_signature: Boolean(updatedData.use_signature),
        signature_id: updatedData.signature_id || null,
        official_name: updatedData.official_name || null,
        designation: updatedData.designation || null,
        signature_path: updatedData.signature_path || null,
      };
      // Remove old record and add new one
      setRecords([
        updated,
        ...records.filter((r) => r.business_clearance_id !== editingId),
      ]);
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
      signature_id: record.signature_id || null,
    });
    setEditingId(record.business_clearance_id);
    setIsFormOpen(true);
    setActiveTab('form');

    // Set selected signature if available
    if (record.signature_id) {
      const sig = signatures.find(
        (s) => s.signature_id === record.signature_id
      );
      setSelectedSignature(sig || null);
    } else {
      setSelectedSignature(null);
    }
  }

  function handleView(record) {
    setSelectedRecord(record); // Set selected record for display
    setFormData({
      ...record,
      use_signature: Boolean(record.use_signature),
      signature_id: record.signature_id || null,
    }); // Also populate form data for QR generation/dialog
    setEditingId(record.business_clearance_id); // To indicate viewing a specific record
    setIsFormOpen(true); // Keep the form open with the record details
    setActiveTab('form');

    // Set selected signature if available
    if (record.signature_id) {
      const sig = signatures.find(
        (s) => s.signature_id === record.signature_id
      );
      setSelectedSignature(sig || null);
    } else {
      setSelectedSignature(null);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this record?')) return;
    try {
      const res = await fetch(`${apiBase}/business-clearance/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Delete failed');
      setRecords(records.filter((r) => r.business_clearance_id !== id));
      if (selectedRecord?.business_clearance_id === id) setSelectedRecord(null);

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

  function resetForm() {
    const currentDate = new Date().toISOString().split('T')[0];
    const issuedDate = new Date(currentDate);
    const expiredDate = new Date(issuedDate);
    expiredDate.setFullYear(expiredDate.getFullYear() + 1);
    const formattedExpiredDate = expiredDate.toISOString().split('T')[0];

    setFormData({
      resident_id: '',
      full_name: '',
      address: '',
      nature_of_business: '',
      date_issued: currentDate,
      date_expired: formattedExpiredDate,
      remarks:
        'They are operating under the jurisdiction of our Brgy. 145, being issued under the requirement of the New Local Code under Republic Act 7160 for securing their permit.',
      request_reason: '',
      transaction_number: '',
      use_signature: false, // Added for e-signature
      signature_id: null, // Added for e-signature
    });
    setEditingId(null);
    setIsFormOpen(false);
    setSelectedRecord(null); // Clear selected record
    setSelectedSignature(null); // Clear selected signature
  }

  function handleSubmit() {
    if (editingId) handleUpdate();
    else handleCreate();
  }

  const filteredRecords = useMemo(
    () =>
      records.filter(
        (r) =>
          r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.nature_of_business.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [records, searchTerm]
  );

  // Generate PDF function
  async function generatePDF() {
    if (!display.business_clearance_id) {
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

      const fileName = `Business_Clearance_${
        display.business_clearance_id
      }_${display.full_name.replace(/\s+/g, '_')}.pdf`;
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
    if (!display.business_clearance_id) {
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
    if (display.business_clearance_id) {
      const verificationUrl = `${window.location.origin}/verify-certificate?id=${display.business_clearance_id}`;
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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
          bgcolor: 'background.default',
        }}
      >
        {/* TOP HEADER */}
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
                  Business Clearance
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Manage all records of the Business Clearance
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

        {/* MAIN CONTENT AREA */}
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* LEFT: Certificate preview */}
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
                      disabled={
                        !display.business_clearance_id || isGeneratingPDF
                      }
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
                      disabled={!display.business_clearance_id}
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
                  {/* Certificate content remains the same */}
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

                  {/* Watermark */}
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
                  {/* Header Text */}
                  <div
                    style={{
                      position: 'absolute',
                      whiteSpace: 'pre',
                      textAlign: 'center',
                      width: '100%',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      fontFamily: '"Lucida Calligraphy", cursive',
                      top: '50px',
                    }}
                  >
                    Republic of the Philippines
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      whiteSpace: 'pre',
                      textAlign: 'center',
                      width: '100%',
                      fontSize: '13pt',
                      fontWeight: 'bold',
                      fontFamily: 'Arial, sans-serif',
                      top: '84px',
                    }}
                  >
                    CITY OF CALOOCAN
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      whiteSpace: 'pre',
                      textAlign: 'center',
                      width: '100%',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      fontFamily: '"Arial Black", sans-serif',
                      top: '110px',
                    }}
                  >
                    BARANGAY 145 ZONES 13 DIST. 1
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      whiteSpace: 'pre',
                      textAlign: 'center',
                      width: '100%',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      fontFamily: '"Arial Black", sans-serif',
                      top: '138px',
                    }}
                  >
                    Tel. No. 8711 - 7134
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      whiteSpace: 'pre',
                      textAlign: 'center',
                      width: '100%',
                      fontSize: '19px',
                      fontWeight: 'bold',
                      fontFamily: '"Arial Black", sans-serif',
                      top: '166px',
                    }}
                  >
                    OFFICE OF THE BARANGAY CHAIRMAN
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      top: '220px',
                      width: '100%',
                      textAlign: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: '"Brush Script MT", cursive',
                        fontSize: '28pt',
                        fontWeight: 'normal',
                        display: 'inline-block',
                        background: theme.palette.success.main, // Using theme color
                        color: '#fff',
                        padding: '4px 70px',
                        borderRadius: '8px',
                        position: 'relative',
                        boxShadow: '5px 5px 0 #d8d5d5ff', // white diagonal bottom shadow
                        WebkitPrintColorAdjust: 'exact',
                        printColorAdjust: 'exact',
                        colorAdjust: 'exact',
                      }}
                    >
                      Business Clearance
                    </span>
                  </div>

                  {/* Date */}
                  <div
                    style={{
                      position: 'absolute',
                      whiteSpace: 'pre',
                      top: '320px',
                      right: '80px',
                      fontFamily: '"Times New Roman", serif',
                      fontSize: '12pt',
                      fontWeight: 'bold',
                      color: 'red', // Using theme orange
                    }}
                  >
                    Date:{' '}
                    {display.date_issued
                      ? formatDateDisplay(display.date_issued)
                      : ''}
                  </div>

                  {/* Body */}
                  <div
                    style={{
                      width: '640px',
                      textAlign: 'justify',
                      fontFamily: '"Times New Roman", serif',
                      fontSize: '12pt',
                      fontWeight: 'bold',
                      color: 'black',
                      whiteSpace: 'normal',
                      marginBottom: '50px',
                      paddingTop: '330px',
                      float: 'right',
                      marginRight: '80px',
                      lineHeight: '1.5',
                    }}
                  >
                    <p style={{ margin: 0, marginBottom: '1em' }}>
                      To whom it may concern:
                    </p>
                    <p style={{ margin: 0, textIndent: '50px' }}>
                      This is to certify that this Business Clearance for
                      Business Permit is issued to:
                    </p>
                  </div>

                  {/* Info */}
                  <div
                    style={{
                      position: 'absolute',
                      whiteSpace: 'pre',
                      top: '420px',
                      left: '95px',
                      width: '640px',
                      lineHeight: '1.8',
                      fontFamily: '"Times New Roman", serif',
                      fontSize: '12pt',
                      fontWeight: 'bold',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          color: 'red', // Using theme orange
                          fontWeight: 'bold',
                          fontFamily: '"Times New Roman", serif',
                        }}
                      >
                        Name:
                      </span>{' '}
                      <span style={{ color: 'black', marginLeft: '10px' }}>
                        {display.full_name || ''}
                      </span>
                      <br />
                      <span
                        style={{
                          color: 'red', // Using theme orange
                          fontWeight: 'bold',
                          fontFamily: '"Times New Roman", serif',
                        }}
                      >
                        Nature of Business:
                      </span>{' '}
                      <span style={{ color: 'black', marginLeft: '10px' }}>
                        {display.nature_of_business || ''}
                      </span>
                      <br />
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          width: '640px',
                        }}
                      ></div>
                      <span
                        style={{
                          color: 'red', // Using theme orange
                          fontWeight: 'bold',
                          fontFamily: '"Times New Roman", serif',
                        }}
                      >
                        Address:
                      </span>{' '}
                      <span style={{ color: 'black', marginLeft: '10px' }}>
                        {display.address || ''}
                      </span>
                      <br />
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          width: '640px',
                        }}
                      ></div>
                      <span
                        style={{
                          color: 'red', // Using theme orange
                          fontWeight: 'bold',
                          fontFamily: '"Times New Roman", serif',
                        }}
                      >
                        Date Issued:
                      </span>{' '}
                      <span style={{ color: 'black', marginLeft: '10px' }}>
                        {display.date_issued
                          ? formatDateDisplay(display.date_issued)
                          : ''}
                      </span>
                      <br />
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          width: '640px',
                        }}
                      ></div>
                      <span
                        style={{
                          color: 'red', // Using theme orange
                          fontWeight: 'bold',
                          fontFamily: '"Times New Roman", serif',
                        }}
                      >
                        Date Expired:
                      </span>{' '}
                      <span style={{ color: 'black', marginLeft: '10px' }}>
                        {display.date_expired
                          ? formatDateDisplay(display.date_expired)
                          : ''}
                      </span>
                      <br />
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          width: '640px',
                        }}
                      ></div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          fontFamily: '"Times New Roman", serif',
                        }}
                      >
                        <span
                          style={{
                            color: 'red',
                            fontWeight: 'bold',
                            marginRight: '6px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Remarks:
                        </span>

                        <span
                          style={{
                            color: 'black',
                            fontWeight: 'bold',
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            flex: 1,
                          }}
                        >
                          {display.remarks}
                        </span>
                      </div>
                      <span
                        style={{
                          color: 'red', // Using theme orange
                          fontWeight: 'bold',
                          fontFamily: '"Times New Roman", serif',
                        }}
                      >
                        This Business Clearance is issued for:
                      </span>{' '}
                      Barangay Permit for{' '}
                      <span style={{ color: 'black' }}>
                        {display.full_name || ''}
                      </span>
                      <br />
                      <span
                        style={{
                          color: 'red', // Using theme orange
                          fontWeight: 'bold',
                          fontFamily: '"Times New Roman", serif',
                        }}
                      >
                        This certification is issued for:
                      </span>{' '}
                      <span style={{ color: 'black' }}>
                        {display.request_reason || ''}
                      </span>
                    </div>
                  </div>

                  {/* Applicant Signature with QR Code */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '730px',
                      left: '50px',
                      width: '250px',
                      textAlign: 'center',
                      fontFamily: '"Times New Roman", serif',
                      fontSize: '12pt',
                      fontWeight: 'bold',
                    }}
                  >
                    <div
                      style={{
                        borderTop: '2px solid #000',
                        width: '65%',
                        margin: 'auto',
                      }}
                    ></div>
                    <div style={{ color: 'black', fontFamily: 'inherit' }}>
                      Applicant's Signature
                    </div>
                    <div
                      style={{
                        margin: '15px auto 0 auto',
                        width: '150px',
                        height: '75px',
                        border: '1px solid #000',
                      }}
                    ></div>

                    {/* QR Code */}
                    {qrCodeUrl && (
                      <div style={{ marginTop: '15px' }}>
                        <div
                          style={{
                            display: 'inline-block',
                          }}
                        >
                          <img
                            src={qrCodeUrl}
                            alt="Verification QR Code"
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

                  {/* Punong Barangay */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '850px',
                      right: '100px',
                      width: '300px',
                      textAlign: 'center',
                    }}
                  >
                    {/* E-Signature positioned to overlap with the name */}
                    {display.use_signature && display.signature_path ? (
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
                          src={getSignatureImageUrl(display.signature_path)}
                          alt="Signature"
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
                        marginTop:
                          display.use_signature && display.signature_path
                            ? '-35px'
                            : '-5px', // Adjust overlap based on whether signature is present
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
                        marginTop:
                          display.use_signature && display.signature_path
                            ? '5px'
                            : '-2px', // Adjust spacing based on signature presence
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
            {/* FORM */}
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
                    {editingId ? 'Edit Certificate' : 'New Business Clearance'}
                  </Typography>
                  {selectedRecord && !editingId && (
                    <Typography variant="body2" color="text.secondary">
                      Viewing: {selectedRecord.full_name}
                    </Typography>
                  )}
                </Paper>

                <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                  <Stack spacing={3}>
                    <Autocomplete
                      options={residents}
                      getOptionLabel={(option) => option.full_name || ''}
                      value={
                        residents.find(
                          (r) => r.full_name === formData.full_name
                        ) || null
                      }
                      onChange={(e, nv) => {
                        if (nv) {
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
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      required
                    />

                    <TextField
                      label="Nature of Business"
                      variant="outlined"
                      fullWidth
                      size="small"
                      value={formData.nature_of_business}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nature_of_business: e.target.value,
                        })
                      }
                      required
                    />

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
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
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Date Expired"
                          type="date"
                          variant="outlined"
                          fullWidth
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          value={formData.date_expired}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              date_expired: e.target.value,
                            })
                          }
                          required
                          InputProps={{
                            readOnly: true,
                            style: { backgroundColor: '#f5f5f5' },
                          }}
                          helperText="Automatically set to 1 year from issue date"
                        />
                      </Grid>
                    </Grid>

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
                      required
                    />

                    <TextField
                      label="Request Reason"
                      variant="outlined"
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                      placeholder="Business registration, License application, etc."
                      value={formData.request_reason}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          request_reason: e.target.value,
                        })
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

            {/* RECORDS */}
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
                    <FolderIcon color="primary" />
                    Certificate Records
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by name, address, or nature of business"
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
                          key={record.business_clearance_id}
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
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mb: 1 }}
                                >
                                  Nature of Business:{' '}
                                  {record.nature_of_business}
                                </Typography>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 1,
                                    gap: 1,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Issued:{' '}
                                    {formatDateDisplay(record.date_issued)}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Expires:{' '}
                                    {formatDateDisplay(record.date_expired)}
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
                                      handleDelete(record.business_clearance_id)
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

        {/* FLOATING ACTION BUTTON FOR MOBILE */}
        {isMobile && activeTab !== 'form' && (
          <Fab
            color="primary"
            aria-label="add"
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
            }}
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
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, color: 'text.primary' }}
              >
                {display.business_clearance_id || 'Draft (Not yet saved)'}
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
                Nature of Business:
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {display.nature_of_business}
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
                Date Expired:
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {formatDateDisplay(display.date_expired)}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Remarks:
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {display.remarks}
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
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: 'grey.600' }}>
                  Signed By:
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {display.official_name} - {display.designation}
                </Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)} color="primary">
            Close
          </Button>
          {display.business_clearance_id && (
            <Button
              onClick={() => {
                const verificationUrl = `${window.location.origin}/verify-certificate?id=${display.business_clearance_id}`;
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

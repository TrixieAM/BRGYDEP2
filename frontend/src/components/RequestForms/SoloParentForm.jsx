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
  Autocomplete,
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
  PersonAdd as PersonAddIcon,
  Remove as RemoveIcon,
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

export default function SoloParentForm() {
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

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Add this after the imports and before the component function
const { 
  saveCertificate, 
  getValidityPeriod,
  calculateExpirationDate 
} = useCertificateManager('Solo Parent');

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    address: '',
    residentsSinceYear: '',
    unwedSinceYear: '',
    employmentStatus: '',
    employmentRemarks: '',
    dateIssued: new Date().toISOString().split('T')[0],
    transaction_number: '', // New field for transaction number
  });

  const [children, setChildren] = useState([]);

  const employmentOptions = ['Employed', 'Unemployed', 'Self-Employed', 'Business Owner', 'Freelancer', 'Contract Worker', 'Others'];
  const educationOptions = ['Nursery', 'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'College 1st Year', 'College 2nd Year', 'College 3rd Year', 'College 4th Year', 'College 5th Year', 'Graduate School', 'Others'];
  const genderOptions = ['Male', 'Female', 'Others'];
  const relationshipOptions = ['Son', 'Daughter', 'Others'];

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

  // Helper function to calculate age from date string
  function calculateAge(dateString) {
    if (!dateString) return '';

    const [year, month, day] = dateString.split('-');
    const birthDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day)
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
    return `SP-${year}${month}${day}-${random}`;
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

  useEffect(() => {
    loadResidents();
    loadRecords();
  }, []);

  async function loadRecords() {
    try {
      const res = await fetch(`${apiBase}/solo-parent-records`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setRecords(
        Array.isArray(data)
          ? data.map((r) => ({
              id: r.solo_parent_id,
              name: r.full_name,
              address: r.address,
              birthday: r.dob?.slice(0, 10) || '',
              age: String(r.age ?? ''),
              contactNo: r.contact_no || '',
              residentsSinceYear: r.residents_since_year || '',
              unwedSinceYear: r.unwed_since_year || '',
              employmentStatus: r.employment_status || '',
              employmentRemarks: r.employment_remarks || '',
              dateIssued: r.date_issued?.slice(0, 10) || '',
              dateCreated: r.date_created,
              transaction_number:
                r.transaction_number || generateTransactionNumber(), // Generate if missing
            }))
          : []
      );
    } catch (e) {
      console.error(e);
    }
  }

  async function loadChildren(soloParentId) {
    try {
      const res = await fetch(`${apiBase}/solo-parent-records/${soloParentId}/children`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setChildren(
        Array.isArray(data)
          ? data.map((c) => ({
              id: c.child_id,
              name: c.child_name,
              age: c.child_age,
              birthday: c.child_birthday?.slice(0, 10) || '',
              level: c.child_level,
              levelRemarks: c.child_level_remarks || '',
              gender: c.child_gender || '',
              relationship: c.child_relationship || '',
              relationshipRemarks: c.child_relationship_remarks || '',
            }))
          : []
      );
    } catch (e) {
      console.error('loadChildren error', e);
    }
  }

  const display = useMemo(() => {
    if (editingId || isFormOpen) return formData;
    if (selectedRecord) return selectedRecord;
    return formData;
  }, [editingId, isFormOpen, selectedRecord, formData]);

  // Generate QR code with URL for PDF download
  useEffect(() => {
    const generateQRCode = async () => {
      if (display.id || display.name) {
        // Store the certificate data in localStorage
        storeCertificateData(display);

        // Create a URL that points to a verification page
        // Using window.location.origin to get the current domain
        const verificationUrl = `${
          window.location.origin
        }/verify-solo-parent?id=${display.id || 'draft'}`;

        const qrContent = `CERTIFICATE VERIFICATION:
        𝗧𝗿𝗮𝗻𝘀𝗮𝗰𝘁𝗶𝗼𝗻 𝗡𝗼: ${display.transaction_number || 'N/A'}
        Name: ${display.name}
        Date Issued: ${
        display.dateCreated
        ? formatDateTimeDisplay(display.dateCreated)
        : new Date().toLocaleString()
        }
        Document Type: Solo Parent Certification
       
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
  const payload = {
    full_name: data.name,
    age: data.age ? Number(data.age) : null,
    address: data.address || null,
    dob: data.birthday || null,
    contact_no: data.contactNo || null,
    residents_since_year: data.residentsSinceYear || null,
    unwed_since_year: data.unwedSinceYear || null,
    employment_status: data.employmentStatus || null,
    employment_remarks: data.employmentRemarks || null,
    date_issued: data.dateIssued,
    transaction_number: data.transaction_number,
  };
  
  // Only add resident_id if it's a valid value
  if (data.resident_id && data.resident_id !== '' && data.resident_id !== null) {
    payload.resident_id = data.resident_id;
  }
  
  return payload;
}

  function childrenToServerPayload() {
    return children.map((child) => ({
      child_name: child.name,
      child_age: child.age,
      child_birthday: child.birthday || null,
      child_level: child.level,
      child_level_remarks: child.levelRemarks || null,
      child_gender: child.gender || null,
      child_relationship: child.relationship || null,
      child_relationship_remarks: child.relationshipRemarks || null,
    }));
  }

 async function handleCreate() {
  try {
    // Generate a transaction number for new certificates
    const transactionNumber = generateTransactionNumber();
    const validityPeriod = getValidityPeriod('Solo Parent');
    const updatedFormData = {
      ...formData,
      transaction_number: transactionNumber,
      dateCreated: new Date().toISOString(), // Add current timestamp
      validity_period: validityPeriod, // Add validity period
    };

    const res = await fetch(`${apiBase}/solo-parent-records`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(toServerPayload(updatedFormData)),
    });
    if (!res.ok) throw new Error('Create failed');
    const created = await res.json();
    const soloParentId = created.solo_parent_id;

    // Save children
    if (children.length > 0) {
      await fetch(`${apiBase}/solo-parent-records/${soloParentId}/children`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(childrenToServerPayload()),
      });
    }

    const newRec = {
      ...updatedFormData,
      id: soloParentId,
    };

    setRecords([newRec, ...records]);
    setSelectedRecord(newRec);

    // --- START: FIX ---
    // Save to certificates table using saveCertificate hook
    await saveCertificate({
      resident_id: newRec.resident_id,
      full_name: newRec.name,
      certificate_type: 'Solo Parent',
      request_reason: 'Solo Parent', // Use request_reason field
      reason: 'Solo Parent', // Also set reason field as backup
      validity_period: newRec.validity_period,
      date_issued: newRec.dateIssued,
      reference_id: soloParentId, // Add reference to solo parent record
    }, true);
    // --- END: FIX ---

    // Store the new certificate data (can still use newRec for local storage/QR)
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
    // Get the current record to preserve resident_id if needed
    const currentRecord = records.find(r => r.id === editingId);
    
    if (currentRecord && currentRecord.name === formData.name && !formData.resident_id) {
      formData.resident_id = currentRecord.resident_id;
    }
    
    const validityPeriod = getValidityPeriod('Solo Parent');
    const updatedFormData = {
      ...formData,
      validity_period: validityPeriod, // Add validity period
    };
    
    const res = await fetch(`${apiBase}/solo-parent-records/${editingId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(toServerPayload(updatedFormData)),
    });
    if (!res.ok) throw new Error('Update failed');
    const updatedData = await res.json();
    
    // The backend creates a NEW record, so we need to add it to records and remove/replace the old one
    const newSoloParentId = updatedData.solo_parent_id;
    
    // Update children for the new record
    await fetch(`${apiBase}/solo-parent-records/${newSoloParentId}/children`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(childrenToServerPayload()),
    });

    const updated = { 
      ...updatedData,
      id: newSoloParentId,
      name: updatedData.full_name,
      address: updatedData.address,
      birthday: updatedData.dob?.slice(0, 10) || '',
      age: String(updatedData.age ?? ''),
      contactNo: updatedData.contact_no || '',
      residentsSinceYear: updatedData.residents_since_year || '',
      unwedSinceYear: updatedData.unwed_since_year || '',
      employmentStatus: updatedData.employment_status || '',
      employmentRemarks: updatedData.employment_remarks || '',
      dateIssued: updatedData.date_issued?.slice(0, 10) || '',
      dateCreated: updatedData.date_created,
      transaction_number: updatedData.transaction_number,
      validity_period: validityPeriod
    };
    
    // Remove old record and add new one
    setRecords([updated, ...records.filter((r) => r.id !== editingId)]);
    setSelectedRecord(updated);

    // --- START: FIX ---
    // Save to certificates table using saveCertificate hook
    await saveCertificate({
      resident_id: updated.resident_id,
      full_name: updated.name,
      certificate_type: 'Solo Parent',
      request_reason: 'Solo Parent', // Use request_reason field
      reason: 'Solo Parent', // Also set reason field as backup
      validity_period: updated.validity_period,
      date_issued: updated.dateIssued,
      reference_id: editingId, // Add reference to solo parent record
    }, false);
    // --- END: FIX ---

    // Store the updated certificate data (can still use updated for local storage/QR)
    storeCertificateData(updated);

    await loadChildren(editingId);
    
    resetForm();
    setActiveTab('records');
  } catch (e) {
    console.error(e);
    alert('Failed to update record');
  }
}

  function handleEdit(record) {
  // Find the resident from the residents list to get the resident_id
  const resident = residents.find((r) => r.full_name === record.name);
  
  setFormData({
    ...record,
    resident_id: resident ? resident.resident_id : record.resident_id
  });
  setEditingId(record.id);
  setIsFormOpen(true);
  setActiveTab('form');
  loadChildren(record.id);
}

  async function handleDelete(id) {
    if (!window.confirm('Delete this record?')) return;
    try {
      const res = await fetch(`${apiBase}/solo-parent-records/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Delete failed');
      setRecords(records.filter((r) => r.id !== id));
      if (selectedRecord?.id === id) setSelectedRecord(null);

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
    setEditingId(record.id); // To indicate viewing a specific record
    setIsFormOpen(true); // Keep the form open with the record details
    setActiveTab('form');
    loadChildren(record.id);
  }

  function resetForm() {
    setFormData({
      name: '',
      age: '',
      address: '',
      residentsSinceYear: '',
      unwedSinceYear: '',
      employmentStatus: '',
      employmentRemarks: '',
      dateIssued: new Date().toISOString().split('T')[0],
      transaction_number: '',
    });
    setChildren([]);
    setEditingId(null);
    setIsFormOpen(false);
    setSelectedRecord(null); // Clear selected record
  }

  function handleSubmit() {
    if (editingId) handleUpdate();
    else handleCreate();
  }

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


  // Generate PDF function
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

      const fileName = `Solo_Parent_${display.id}_${display.name.replace(/\s+/g, '_')}.pdf`;
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

  // Function to handle QR code click
  const handleQrCodeClick = () => {
    if (display.id) {
      // Open the verification URL in a new tab
      const verificationUrl = `${window.location.origin}/verify-solo-parent?id=${display.id}`;
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

  // Children Management
  const addChild = () => {
    setChildren([
      ...children,
      {
        id: `temp-${Date.now()}`,
        name: '',
        age: '',
        birthday: '',
        level: '',
        levelRemarks: '',
        gender: '',
        relationship: '',
        relationshipRemarks: '',
      },
    ]);
  };

  const removeChild = (index) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  const updateChild = (index, field, value) => {
    const updatedChildren = [...children];
    updatedChildren[index] = { ...updatedChildren[index], [field]: value };
    
    // If birthday is updated, calculate the age
    if (field === 'birthday' && value) {
      updatedChildren[index].age = calculateAge(value);
    }
    
    setChildren(updatedChildren);
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
                  Solo Parent Certification
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Manage all records of Solo Parent Certification
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
                  <Tooltip title="Verify Certificate">
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      onClick={handleQrCodeClick} 
                      startIcon={<QrCodeIcon />} 
                      disabled={!display.id}
                      size="small"
                    >
                      Verify
                    </Button>
                  </Tooltip>
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
                  {/* Certificate content */}
                  <img
                    style={{
                      position: 'absolute',
                      width: '90px',
                      top: '28px',
                      left: '32px',
                    }}
                    src={CaloocanLogo}
                    alt="City Logo"
                  />
                  <img
                    style={{
                      position: 'absolute',
                      width: '110px',
                      top: '26px',
                      right: '32px',
                    }}
                    src={Logo145}
                    alt="Barangay Logo"
                  />

                  {/* Watermark */}
                  <img
                    style={{
                      position: 'absolute',
                      top: '200px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      opacity: 0.1,
                      width: '500px',
                      height: '500px',
                      border: '2px dashed #ccc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      pointerEvents: 'none',
                      zIndex: 0,
                    }}
                    src={Logo145}
                    alt="Watermark"
                  />

                  {/* Header */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '70px',
                      width: '100%',
                      textAlign: 'center',
                      fontSize: '14pt',
                      fontWeight: 'bold',
                      lineHeight: 1.5,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'Lucida Calligraphy, "Times New Roman", serif',
                      }}
                    >
                      Republic Of the Philippines
                    </div>
                    <div style={{ fontSize: '13pt' }}>City of Caloocan</div>
                    <div
                      style={{
                        fontSize: '12pt',
                        marginTop: '4px',
                        fontFamily: 'Bodoni MT Black',
                      }}
                    >
                      BARANGAY 145 ZONE 13 DISTRICT 1
                    </div>
                    <div
                      style={{
                        fontSize: '11pt',
                        marginTop: '8px',
                        fontFamily: 'Bodoni MT Black',
                      }}
                    >
                      OFFICE OF THE BARANGAY CAPTAIN
                    </div>
                  </div>

                  {/* Title */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '190px',
                      width: '100%',
                      textAlign: 'center',
                      fontFamily: 'Bodoni MT Black, "Times New Roman", serif',
                      fontSize: '18pt',
                      fontWeight: 'bold',
                      textDecoration: 'underline',
                      letterSpacing: '1px',
                    }}
                  >
                    BARANGAY CERTIFICATION
                  </div>

                  {/* Main Content */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '270px',
                      left: '60px',
                      width: '680px',
                      fontFamily: '"Times New Roman", serif',
                      fontSize: '12pt',
                      lineHeight: 1.8,
                      textAlign: 'justify',
                      zIndex: 1,
                    }}
                  >
                    <p style={{ marginBottom: '20px' }}>
                      <strong>
                        This is to certify that,{' '}
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
                          {display.name || 'Name'}
                        </span>
                        ,{' '}
                        <span
                          style={{
                            display: 'inline-block',
                            minWidth: '40px',
                            borderBottom: '1px solid black',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            fontStyle: 'italic',
                          }}
                        >
                          {display.age || 'Age'}
                        </span>{' '}
                        y/o is a Bonafide resident of{' '}
                        <span
                          style={{
                            display: 'inline-block',
                            minWidth: '250px',
                            borderBottom: '1px solid black',
                            fontWeight: 'bold',
                            textAlign: 'center',
                          }}
                        >
                          {display.address || 'Address'}
                        </span>{' '}
                        Barangay 145 of this city, since{' '}
                        <span
                          style={{
                            display: 'inline-block',
                            minWidth: '80px',
                            borderBottom: '1px solid black',
                            fontWeight: 'bold',
                            textAlign: 'center',
                          }}
                        >
                          {display.residentsSinceYear || 'Year'}
                        </span>
                        .
                      </strong>
                    </p>

                    <p style={{ marginBottom: '20px' }}>
                      <strong>
                        Upon verification, she is currently not in any form of
                        relationship and is qualified to apply for a Solo Parent ID
                        based on the classification set forth by RA 8972, otherwise
                        known as the Solo Parents Welfare Act 2000.
                      </strong>
                    </p>

                    <p style={{ marginBottom: '20px' }}>
                      <strong>
                        Ms.{' '}
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
                          {display.name || 'Name'}
                        </span>
                        , is UNWED, since,{' '}
                        <span
                          style={{
                            display: 'inline-block',
                            minWidth: '80px',
                            borderBottom: '1px solid black',
                            fontWeight: 'bold',
                            textAlign: 'center',
                          }}
                        >
                          {display.unwedSinceYear || 'Year'}
                        </span>
                        .
                      </strong>
                    </p>

                    <p style={{ marginBottom: '20px' }}>
                      <strong>
                        Moreover{' '}
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
                          {display.name || 'Name'}
                        </span>{' '}
                        has{' '}
                        <span
                          style={{
                            display: 'inline-block',
                            minWidth: '30px',
                            borderBottom: '1px solid black',
                            fontWeight: 'bold',
                            textAlign: 'center',
                          }}
                        >
                          {children.length || '___'}
                        </span>{' '}
                        qualified dependent living with her
                        {children.length > 0 && (
                          <>
                            :{' '}
                            {children.map((child, index) => (
                              <span key={child.id || index}>
                                {index > 0 && ', '}
                                her{' '}
                                <span
                                  style={{
                                    display: 'inline-block',
                                    minWidth: '120px',
                                    borderBottom: '1px solid black',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    fontStyle: 'italic',
                                  }}
                                >
                                  {child.name || 'Child Name'}
                                </span>
                                ,{' '}
                                <span
                                  style={{
                                    display: 'inline-block',
                                    minWidth: '30px',
                                    borderBottom: '1px solid black',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                  }}
                                >
                                  {child.age || 'Age'}
                                </span>{' '}
                                y/o, birthday-
                                <span
                                  style={{
                                    display: 'inline-block',
                                    minWidth: '100px',
                                    borderBottom: '1px solid black',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                  }}
                                >
                                  {child.birthday || 'Birthday'}
                                </span>
                                {child.level && (
                                  <>
                                    ,{' '}
                                    <span
                                      style={{
                                        display: 'inline-block',
                                        minWidth: '100px',
                                        borderBottom: '1px solid black',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                      }}
                                    >
                                      {child.level}
                                    </span>
                                  </>
                                )}
                              </span>
                            ))}
                          </>
                        )}
                        .
                      </strong>
                    </p>

                    <p style={{ marginBottom: '20px' }}>
                      <strong>
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
                          {display.name || 'Name'}
                        </span>{' '}
                        is{' '}
                        <span
                          style={{
                            display: 'inline-block',
                            minWidth: '120px',
                            borderBottom: '1px solid black',
                            fontWeight: 'bold',
                            textAlign: 'center',
                          }}
                        >
                          {display.employmentStatus === 'Others' 
                            ? display.employmentRemarks || 'Employment Status'
                            : display.employmentStatus || 'Employment Status'
                          }
                        </span>
                        .
                      </strong>
                    </p>

                    <p style={{ marginBottom: '30px' }}>
                      <strong>
                        This certification is issued solely for the purpose of
                        authentication of Ms.{' '}
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
                          {display.name || 'Name'}
                        </span>
                        , qualification to apply for a Solo Parent ID and receive all
                        benefits that go with it.
                      </strong>
                    </p>

                    <p style={{ marginBottom: '40px' }}>
                      <strong>
                        Issued this{' '}
                        <span
                          style={{
                            display: 'inline-block',
                            minWidth: '150px',
                            borderBottom: '1px solid black',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            fontStyle: 'italic',
                          }}
                        >
                          {display.dateIssued
                            ? (() => {
                                const date = new Date(display.dateIssued);
                                const day = date.getDate();
                                const month = date.toLocaleString('default', { month: 'long' });
                                const year = date.getFullYear();
                                const suffix = day % 10 === 1 && day !== 11 ? 'st' : day % 10 === 2 && day !== 12 ? 'nd' : day % 10 === 3 && day !== 13 ? 'rd' : 'th';
                                return `${day}${suffix} day of ${month}, ${year}`;
                              })()
                            : '__________________'}
                        </span>
                        .
                      </strong>
                    </p>
                  </div>

                  {/* Bottom Section */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '80px',
                      left: '60px',
                      width: '680px',
                      fontFamily: '"Times New Roman", serif',
                      fontSize: '12pt',
                      fontWeight: 'bold',
                    }}
                  >
                    <div style={{ marginBottom: '50px' }}>
                      Brgy. SOLO PARENT Focal Person/Barangay Officials
                    </div>

                    {/* Signatures */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '50px',
                      }}
                    >
                      <div style={{ textAlign: 'center', width: '300px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>
                          ROSALINA P. ANORE
                        </div>
                        <div
                          style={{
                            borderTop: '1px solid #000',
                            width: '80%',
                            margin: '0 auto 8px auto',
                          }}
                        ></div>
                        <div style={{ fontWeight: 'bold' }}>Brgy. Secretary</div>
                      </div>

                      <div style={{ textAlign: 'center', width: '300px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>
                          ARNOLD DONDONAYOS
                        </div>
                        <div
                          style={{
                            borderTop: '1px solid #000',
                            width: '80%',
                            margin: '0 auto 8px auto',
                          }}
                        ></div>
                        <div style={{ fontWeight: 'bold' }}>Barangay Captain</div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '150px',
                      right: '60px',
                      textAlign: 'center',
                      fontFamily: '"Times New Roman", serif',
                      fontSize: '10pt',
                      fontWeight: 'bold',
                    }}
                  >
                    {qrCodeUrl && (
                      <div style={{ marginTop: 12 }}>
                        <div
                          onClick={handleQrCodeClick}
                          style={{
                            cursor: 'pointer',
                            position: 'relative',
                            display: 'inline-block',
                          }}
                          title="Click to view certificate details"
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
                          <div
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: 'rgba(255,255,255,0)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: 0,
                              transition: 'opacity 0.3s',
                              borderRadius: '4px',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = '0.7';
                              e.currentTarget.style.backgroundColor =
                                'rgba(255,255,255,0.8)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = '0';
                              e.currentTarget.style.backgroundColor =
                                'rgba(255,255,255,0)';
                            }}
                          >
                            <QrCodeIcon
                              sx={{
                                fontSize: 40,
                                color: theme.palette.success.main,
                              }}
                            />
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: '8pt',
                            color: '#666',
                            marginTop: '5px',
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
                    {editingId ? "Edit Certificate" : "New Solo Parent Certification"}
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
  getOptionLabel={(option) => option.full_name || ""}
  value={residents.find((r) => r.full_name === formData.name) || null}
  onChange={(e, nv) => {
    if (nv) {
      setFormData({
        ...formData,
        resident_id: nv.resident_id,
        name: nv.full_name,
        address: nv.address || '',
        birthday: nv.dob?.slice(0, 10) || '',
        age: calculateAge(nv.dob?.slice(0, 10)),
      });
    } else {
      // If no resident is selected, keep the current resident_id if it exists
      setFormData({ 
        ...formData, 
        name: '',
        // Don't reset resident_id to null if it already exists
      });
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

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField 
                          label="Birthday" 
                          type="date" 
                          variant="outlined" 
                          fullWidth 
                          size="small"
                          InputLabelProps={{ shrink: true }} 
                          value={formData.birthday} 
                          onChange={(e) => {
                            const dob = e.target.value;
                            const age = calculateAge(dob);
                            setFormData({ ...formData, birthday: dob, age });
                          }} 
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
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'grey.100',
                            },
                          }}
                        />
                      </Grid>
                    </Grid>

                    <TextField 
                      label="Resident Since Year" 
                      variant="outlined" 
                      fullWidth 
                      size="small"
                      value={formData.residentsSinceYear} 
                      onChange={(e) => setFormData({ ...formData, residentsSinceYear: e.target.value })} 
                    />

                    <TextField 
                      label="Unwed Since Year" 
                      variant="outlined" 
                      fullWidth 
                      size="small"
                      value={formData.unwedSinceYear} 
                      onChange={(e) => setFormData({ ...formData, unwedSinceYear: e.target.value })} 
                    />

                    {/* Employment Section */}
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Employment Information
                      </Typography>
                      <FormControl fullWidth size="small" variant="outlined">
                        <InputLabel>Employment Status</InputLabel>
                        <Select
                          value={formData.employmentStatus}
                          label="Employment Status"
                          onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                        >
                          {employmentOptions.map((status) => (
                            <MenuItem key={status} value={status}>{status}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {formData.employmentStatus === 'Others' && (
                        <TextField
                          label="Employment Remarks"
                          variant="outlined"
                          size="small"
                          fullWidth
                          multiline
                          rows={2}
                          value={formData.employmentRemarks}
                          onChange={(e) => setFormData({ ...formData, employmentRemarks: e.target.value })}
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>

                    {/* Children Section */}
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          Children Information
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<PersonAddIcon />}
                          onClick={addChild}
                        >
                          Add Child
                        </Button>
                      </Box>

                      {children.length === 0 ? (
                        <Typography variant="body2" sx={{ color: 'grey.500', fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                          No children added yet
                        </Typography>
                      ) : (
                        <Stack spacing={2}>
                          {children.map((child, index) => (
                            <Card key={child.id || index} sx={{ p: 2, bgcolor: 'grey.50' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2">Child {index + 1}</Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => removeChild(index)}
                                  sx={{ color: 'error.main' }}
                                >
                                  <RemoveIcon />
                                </IconButton>
                              </Box>
                              <Grid container spacing={1.5}>
                                <Grid item xs={12}>
                                  <TextField
                                    label="Child Name"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    value={child.name}
                                    onChange={(e) => updateChild(index, 'name', e.target.value)}
                                  />
                                </Grid>
                                <Grid item xs={6}>
                                  <TextField
                                    label="Birthday"
                                    type="date"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    value={child.birthday}
                                    onChange={(e) => updateChild(index, 'birthday', e.target.value)}
                                  />
                                </Grid>
                                <Grid item xs={6}>
                                  <TextField
                                    label="Age"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    value={child.age}
                                    InputProps={{ readOnly: true }}
                                    sx={{
                                      '& .MuiOutlinedInput-root': { bgcolor: 'grey.100' },
                                    }}
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <FormControl fullWidth size="small" variant="outlined">
                                    <InputLabel>Education Level</InputLabel>
                                    <Select
                                      value={child.level}
                                      label="Education Level"
                                      onChange={(e) => updateChild(index, 'level', e.target.value)}
                                    >
                                      {educationOptions.map((level) => (
                                        <MenuItem key={level} value={level}>{level}</MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Grid>
                                {child.level === 'Others' && (
                                  <Grid item xs={12}>
                                    <TextField
                                      label="Education Level Remarks"
                                      variant="outlined"
                                      size="small"
                                      fullWidth
                                      value={child.levelRemarks}
                                      onChange={(e) => updateChild(index, 'levelRemarks', e.target.value)}
                                    />
                                  </Grid>
                                )}
                                <Grid item xs={6}>
                                  <FormControl fullWidth size="small" variant="outlined">
                                    <InputLabel>Gender</InputLabel>
                                    <Select
                                      value={child.gender}
                                      label="Gender"
                                      onChange={(e) => updateChild(index, 'gender', e.target.value)}
                                    >
                                      {genderOptions.map((gender) => (
                                        <MenuItem key={gender} value={gender}>{gender}</MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Grid>
                                <Grid item xs={6}>
                                  <FormControl fullWidth size="small" variant="outlined">
                                    <InputLabel>Relationship</InputLabel>
                                    <Select
                                      value={child.relationship}
                                      label="Relationship"
                                      onChange={(e) => updateChild(index, 'relationship', e.target.value)}
                                    >
                                      {relationshipOptions.map((relationship) => (
                                        <MenuItem key={relationship} value={relationship}>{relationship}</MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Grid>
                                {child.relationship === 'Others' && (
                                  <Grid item xs={12}>
                                    <TextField
                                      label="Relationship Remarks"
                                      variant="outlined"
                                      size="small"
                                      fullWidth
                                      value={child.relationshipRemarks}
                                      onChange={(e) => updateChild(index, 'relationshipRemarks', e.target.value)}
                                    />
                                  </Grid>
                                )}
                              </Grid>
                            </Card>
                          ))}
                        </Stack>
                      )}
                    </Box>

                    <TextField 
                      label="Date Issued" 
                      type="date" 
                      variant="outlined" 
                      fullWidth 
                      size="small"
                      InputLabelProps={{ shrink: true }} 
                      value={formData.dateIssued} 
                      onChange={(e) => setFormData({ ...formData, dateIssued: e.target.value })} 
                      required
                    />

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
                    placeholder="Search by name, address, or contact number" 
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
                                  {record.contactNo && (
                                    <Typography variant="caption" color="text.secondary">
                                      {record.contactNo}
                                    </Typography>
                                  )}
                                  <Typography variant="caption" color="text.secondary">
                                    Issued: {formatDateDisplay(record.dateIssued)}
                                  </Typography>
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
                Age:
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {display.age}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Resident Since:
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {display.residentsSinceYear}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Unwed Since:
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {display.unwedSinceYear}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Employment Status:
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {display.employmentStatus === 'Others' 
                  ? display.employmentRemarks || 'N/A'
                  : display.employmentStatus || 'N/A'
                }
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
            {children.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: 'grey.600', mb: 1 }}>
                  Children:
                </Typography>
                <Stack spacing={1}>
                  {children.map((child, index) => (
                    <Box key={child.id || index} sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {child.name} - {child.age} years old
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {child.level} | {child.gender} | {child.relationship}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
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
                const verificationUrl = `${window.location.origin}/verify-solo-parent?id=${display.id}`;
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

// ================= FULL VERIFICATION VIEW ==================
function SoloParentVerification() {
  const [record, setRecord] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [children, setChildren] = React.useState([]);
  const zoomLevel = 1;

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
      setError('No certificate ID provided.');
      setLoading(false);
      return;
    }

    // Otherwise fetch from backend
    fetch(`http://localhost:5000/solo-parent-records/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.solo_parent_id) {
          setRecord({
            id: data.solo_parent_id,
            name: data.full_name,
            address: data.address,
            age: data.age,
            residentsSinceYear: data.residents_since_year,
            unwedSinceYear: data.unwed_since_year,
            employmentStatus: data.employment_status,
            employmentRemarks: data.employment_remarks,
            dateIssued: data.date_issued,
            dateCreated: data.date_created,
          });

          // Fetch children data
          fetch(`http://localhost:5000/solo-parent-children/${id}`)
            .then((res) => res.json())
            .then((childrenData) => {
              if (Array.isArray(childrenData)) {
                setChildren(
                  childrenData.map((c) => ({
                    id: c.child_id,
                    name: c.child_name,
                    age: c.child_age,
                    birthday: c.child_birthday?.slice(0, 10) || '',
                    level: c.child_level,
                    levelRemarks: c.child_level_remarks,
                    gender: c.child_gender,
                    relationship: c.child_relationship,
                    relationshipRemarks: c.child_relationship_remarks,
                  }))
                );
              }
            })
            .catch((err) => console.error('Failed to fetch children:', err));
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
              top: '200px',
              left: '50%',
              transform: 'translateX(-50%)',
              opacity: 0.1,
              width: '500px',
              height: '500px',
              border: '2px dashed #ccc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          {/* Header */}
          <div
            style={{
              position: 'absolute',
              top: '70px',
              width: '100%',
              textAlign: 'center',
              fontSize: '14pt',
              fontWeight: 'bold',
              lineHeight: 1.5,
            }}
          >
            <div
              style={{
                fontFamily: 'Lucida Calligraphy, "Times New Roman", serif',
              }}
            >
              Republic Of the Philippines
            </div>
            <div style={{ fontSize: '13pt' }}>City of Caloocan</div>
            <div
              style={{
                fontSize: '12pt',
                marginTop: '4px',
                fontFamily: 'Bodoni MT Black',
              }}
            >
              BARANGAY 145 ZONE 13 DISTRICT 1
            </div>
            <div
              style={{
                fontSize: '11pt',
                marginTop: '8px',
                fontFamily: 'Bodoni MT Black',
              }}
            >
              OFFICE OF THE BARANGAY CAPTAIN
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              position: 'absolute',
              top: '190px',
              width: '100%',
              textAlign: 'center',
              fontFamily: 'Bodoni MT Black, "Times New Roman", serif',
              fontSize: '18pt',
              fontWeight: 'bold',
              textDecoration: 'underline',
              letterSpacing: '1px',
            }}
          >
            BARANGAY CERTIFICATION
          </div>

          {/* Main Content */}
          <div
            style={{
              position: 'absolute',
              top: '270px',
              left: '60px',
              width: '680px',
              fontFamily: '"Times New Roman", serif',
              fontSize: '12pt',
              lineHeight: 1.8,
              textAlign: 'justify',
              zIndex: 1,
            }}
          >
            <p style={{ marginBottom: '20px' }}>
              <strong>
                This is to certify that,{' '}
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
                  {record.name || 'Name'}
                </span>
                ,{' '}
                <span
                  style={{
                    display: 'inline-block',
                    minWidth: '40px',
                    borderBottom: '1px solid black',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontStyle: 'italic',
                  }}
                >
                  {record.age || 'Age'}
                </span>{' '}
                y/o is a Bonafide resident of{' '}
                <span
                  style={{
                    display: 'inline-block',
                    minWidth: '250px',
                    borderBottom: '1px solid black',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  {record.address || 'Address'}
                </span>{' '}
                Barangay 145 of this city, since{' '}
                <span
                  style={{
                    display: 'inline-block',
                    minWidth: '80px',
                    borderBottom: '1px solid black',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  {record.residentsSinceYear || 'Year'}
                </span>
                .
              </strong>
            </p>

            <p style={{ marginBottom: '20px' }}>
              <strong>
                Upon verification, she is currently not in any form of
                relationship and is qualified to apply for a Solo Parent ID
                based on the classification set forth by RA 8972, otherwise
                known as the Solo Parents Welfare Act 2000.
              </strong>
            </p>

            <p style={{ marginBottom: '20px' }}>
              <strong>
                Ms.{' '}
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
                  {record.name || 'Name'}
                </span>
                , is UNWED, since,{' '}
                <span
                  style={{
                    display: 'inline-block',
                    minWidth: '80px',
                    borderBottom: '1px solid black',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  {record.unwedSinceYear || 'Year'}
                </span>
                .
              </strong>
            </p>

            <p style={{ marginBottom: '20px' }}>
              <strong>
                Moreover{' '}
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
                  {record.name || 'Name'}
                </span>{' '}
                has{' '}
                <span
                  style={{
                    display: 'inline-block',
                    minWidth: '30px',
                    borderBottom: '1px solid black',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  {children.length || '___'}
                </span>{' '}
                qualified dependent living with her
                {children.length > 0 && (
                  <>
                    :{' '}
                    {children.map((child, index) => (
                      <span key={child.id || index}>
                        {index > 0 && ', '}
                        her{' '}
                        <span
                          style={{
                            display: 'inline-block',
                            minWidth: '120px',
                            borderBottom: '1px solid black',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            fontStyle: 'italic',
                          }}
                        >
                          {child.name || 'Child Name'}
                        </span>
                        ,{' '}
                        <span
                          style={{
                            display: 'inline-block',
                            minWidth: '30px',
                            borderBottom: '1px solid black',
                            fontWeight: 'bold',
                            textAlign: 'center',
                          }}
                        >
                          {child.age || 'Age'}
                        </span>{' '}
                        y/o, birthday-
                        <span
                          style={{
                            display: 'inline-block',
                            minWidth: '100px',
                            borderBottom: '1px solid black',
                            fontWeight: 'bold',
                            textAlign: 'center',
                          }}
                        >
                          {child.birthday || 'Birthday'}
                        </span>
                        {child.level && (
                          <>
                            ,{' '}
                            <span
                              style={{
                                display: 'inline-block',
                                minWidth: '100px',
                                borderBottom: '1px solid black',
                                fontWeight: 'bold',
                                textAlign: 'center',
                              }}
                            >
                              {child.level}
                            </span>
                          </>
                        )}
                      </span>
                    ))}
                  </>
                )}
                .
              </strong>
            </p>

            <p style={{ marginBottom: '20px' }}>
              <strong>
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
                  {record.name || 'Name'}
                </span>{' '}
                is{' '}
                <span
                  style={{
                    display: 'inline-block',
                    minWidth: '120px',
                    borderBottom: '1px solid black',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  {record.employmentStatus === 'Others' 
                    ? record.employmentRemarks || 'Employment Status'
                    : record.employmentStatus || 'Employment Status'
                  }
                </span>
                .
              </strong>
            </p>

            <p style={{ marginBottom: '30px' }}>
              <strong>
                This certification is issued solely for the purpose of
                authentication of Ms.{' '}
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
                  {record.name || 'Name'}
                </span>
                , qualification to apply for a Solo Parent ID and receive all
                benefits that go with it.
              </strong>
            </p>

            <p style={{ marginBottom: '40px' }}>
              <strong>
                Issued this{' '}
                <span
                  style={{
                    display: 'inline-block',
                    minWidth: '150px',
                    borderBottom: '1px solid black',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontStyle: 'italic',
                  }}
                >
                  {record.dateIssued ? formatDate(record.dateIssued) : '__________________'}
                </span>
                .
              </strong>
            </p>
          </div>

          {/* Bottom Section */}
          <div
            style={{
              position: 'absolute',
              bottom: '80px',
              left: '60px',
              width: '680px',
              fontFamily: '"Times New Roman", serif',
              fontSize: '12pt',
              fontWeight: 'bold',
            }}
          >
            <div style={{ marginBottom: '50px' }}>
              Brgy. SOLO PARENT Focal Person/Barangay Officials
            </div>

            {/* Signatures */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '50px',
              }}
            >
              <div style={{ textAlign: 'center', width: '300px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>
                  ROSALINA P. ANORE
                </div>
                <div
                  style={{
                    borderTop: '1px solid #000',
                    width: '80%',
                    margin: '0 auto 8px auto',
                  }}
                ></div>
                <div style={{ fontWeight: 'bold' }}>Brgy. Secretary</div>
              </div>

              <div style={{ textAlign: 'center', width: '300px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>
                  ARNOLD DONDONAYOS
                </div>
                <div
                  style={{
                    borderTop: '1px solid #000',
                    width: '80%',
                    margin: '0 auto 8px auto',
                  }}
                ></div>
                <div style={{ fontWeight: 'bold' }}>Barangay Captain</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { SoloParentVerification };
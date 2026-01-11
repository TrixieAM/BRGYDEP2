import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useAuth } from '../../contexts/AuthContext';
import { getSignatures, getSignatureImageUrl } from '../../services/signatureService';

import CaloocanLogo from "../../assets/CaloocanLogo.png";
import Logo145 from "../../assets/Logo145.png";
import BagongPilipinas from "../../assets/BagongPilipinas.png";
import { useCertificateManager } from '../../hooks/useCertificateManager';

// MUI
import {
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Box,
  Card,
  CardContent,
  CardHeader,
  InputAdornment,
  IconButton,
  Stack,
  Autocomplete,
  Tabs,
  Tab,
  Grid,
  createTheme,
  ThemeProvider,
  Avatar,
  Badge,
  Tooltip,
  Fab,
  AppBar,
  Toolbar,
  Chip,
  FormControlLabel,
  Checkbox,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
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
} from "@mui/icons-material";
import { useMediaQuery } from "@mui/material";

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

export default function Cohabitation() {
  // Change apiBase to include /api if your backend routes are under /api
  const apiBase = "http://localhost:5000";
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
  const [residents, setResidents] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("form");
  const [searchTerm, setSearchTerm] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [zoomLevel, setZoomLevel] = useState(0.75);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [signatures, setSignatures] = useState([]);
  const [selectedSecretarySignature, setSelectedSecretarySignature] = useState(null);
  const [selectedCaptainSignature, setSelectedCaptainSignature] = useState(null);
  
  // New state for valid certificate dialog
  const [showValidCertDialog, setShowValidCertDialog] = useState(false);
  const [validCertInfo, setValidCertInfo] = useState(null);
  const [pendingSave, setPendingSave] = useState(null);

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Add this after the imports and before the component function
const { 
  saveCertificate, 
  getValidityPeriod,
  calculateExpirationDate 
} = useCertificateManager('Cohabitation');

  const [formData, setFormData] = useState({
    certificate_of_cohabitation_id: "",
    resident1_id: "",
    resident2_id: "",
    full_name1: "",
    dob1: "",
    full_name2: "",
    dob2: "",
    address: "",
    date_started: new Date().getFullYear(), // year
    date_issued: new Date().toISOString().split("T")[0],
    witness1_name: "",
    witness2_name: "",
    transaction_number: "",
    is_active: 1,
    date_created: "",
    use_signature: false, // Add e-signature field
    secretary_signature_id: null, // Add secretary signature ID field
    captain_signature_id: null, // Add captain signature ID field
  });

  // Helpers
  function generateTransactionNumber() {
    const date = new Date();
    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `COH-${yy}${mm}${dd}-${rand}`;
  }

  function formatDateDisplay(dateString) {
    if (!dateString) return "";
    const dateOnly = dateString.includes("T") ? dateString.split("T")[0] : dateString;
    const [year, month, day] = dateOnly.split("-");
    const monthNames = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];
    return `${monthNames[parseInt(month,10)-1]} ${parseInt(day,10)}, ${year}`;
  }

  function formatDateTimeDisplay(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const monthNames = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
  }

  function storeLocalDraft(cert) {
    if (!cert) return;
    const existing = JSON.parse(localStorage.getItem("certificates") || "{}");
    const key = cert.certificate_of_cohabitation_id || `draft-${cert.transaction_number || "no-txn"}`;
    existing[key] = cert;
    localStorage.setItem("certificates", JSON.stringify(existing));
  }

  function getVerifyUrl(cert) {
    const origin = window.location.origin;
    const id = (cert && cert.certificate_of_cohabitation_id) || `draft-${(cert && cert.transaction_number) || "no-txn"}`;
    return `${origin}/verify-cohabitation?id=${encodeURIComponent(id)}`;
  }

  // Fixed-length underline renderer with optional italics (no underscore placeholder)
  function UnderlinedValue({ value, width = 180, italic = false, align = "center" }) {
    const displayText = value && String(value).trim() ? String(value) : "\u00A0"; // non-breaking space to keep line height
    return (
      <span
        style={{
          display: "inline-block",
          minWidth: width,
          borderBottom: "1px solid #000",
          padding: "0 6px 2px 6px",
          fontStyle: italic ? "italic" : "normal",
          textAlign: align,
          lineHeight: 1.2,
        }}
      >
        {displayText}
      </span>
    );
  }

  // Load residents and records
  useEffect(() => {
    loadResidents();
    loadRecords();
    loadSignatures();
  }, []);

  async function loadResidents() {
    try {
      const res = await fetch(`${apiBase}/residents`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setResidents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Failed to load residents", err);
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

  async function loadRecords() {
    try {
      const res = await fetch(`${apiBase}/certificate-of-cohabitation`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setRecords(
        Array.isArray(data)
          ? data.map((r) => ({
              certificate_of_cohabitation_id: r.certificate_of_cohabitation_id,
              resident1_id: r.resident1_id,
              resident2_id: r.resident2_id,
              full_name1: r.full_name1,
              dob1: r.dob1 ? r.dob1.split("T")[0] : "",
              full_name2: r.full_name2,
              dob2: r.dob2 ? r.dob2.split("T")[0] : "",
              address: r.address,
              date_started: r.date_started,
              date_issued: r.date_issued ? r.date_issued.split("T")[0] : "",
              witness1_name: r.witness1_name,
              witness2_name: r.witness2_name,
              transaction_number: r.transaction_number || generateTransactionNumber(),
              is_active: r.is_active ?? 1,
              date_created: r.date_created,
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
      console.error("Failed to load certificate_of_cohabitation records", e);
    }
  }

  // Check if resident has valid certificate
  function checkValidCertificate(residentId) {
    if (!residentId) return null;
    
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const validCert = records.find(record => {
      if (!record.date_issued) return false;
      const issueDate = new Date(record.date_issued);
      return (
        (record.resident1_id === residentId || record.resident2_id === residentId) &&
        issueDate >= oneYearAgo
      );
    });
    
    return validCert;
  }

  // display chooses between editing/form mode and view mode
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

  // QR generation: visible for drafts too when at least full_name1 exists
  useEffect(() => {
    const makeQr = async () => {
      if (!display || !display.full_name1) {
        setQrCodeUrl("");
        return;
      }
      const verifyUrl = getVerifyUrl(display);
      const content = `CERTIFICATE VERIFICATION:
        𝗧𝗿𝗮𝗻𝘀𝗮𝘁𝗶𝗼𝗻 𝗡𝗼: ${display.transaction_number || 'N/A'}
        Name 1: ${display.full_name1}
        Name 2: ${display.full_name2}
        Date Started: ${display.date_started || ''}
        Date Issued: ${
        display.date_created
        ? formatDateTimeDisplay(display.date_created)
        : new Date().toLocaleString()
        }
        Document Type: Certificate of Cohabitation
       
        Ⓒ RRMS | BARANGAY 145
        CALOOCAN CITY
        ALL RIGHTS RESERVED
        `;
      try {
        const url = await QRCode.toDataURL(content, { 
          width: 140, 
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'L',
        });
        setQrCodeUrl(url);
        storeLocalDraft(display);
      } catch (err) {
        console.error("QR error", err);
      }
    };
    makeQr();
  }, [display.full_name1, display.full_name2, display.transaction_number, display.date_started, display.date_issued, display.certificate_of_cohabitation_id]);

  function toServerPayload(data) {
    return {
      resident1_id: data.resident1_id || null,
      resident2_id: data.resident2_id || null,
      full_name1: data.full_name1,
      dob1: data.dob1 || null,
      full_name2: data.full_name2,
      dob2: data.dob2 || null,
      address: data.address,
      date_started: data.date_started || null,
      date_issued: data.date_issued || null,
      witness1_name: data.witness1_name,
      witness2_name: data.witness2_name,
      transaction_number: data.transaction_number,
      is_active: data.is_active ?? 1,
      use_signature: data.use_signature ? 1 : 0,
      secretary_signature_id: data.use_signature && data.secretary_signature_id ? data.secretary_signature_id : null,
      captain_signature_id: data.use_signature && data.captain_signature_id ? data.captain_signature_id : null,
    };
  }

  // Function to handle confirmation when creating with valid certificate
  const confirmSaveWithValidCert = () => {
    setShowValidCertDialog(false);
    if (pendingSave) {
      // Execute the pending save operation
      if (editingId) {
        handleUpdate();
      } else {
        handleCreateDirect();
      }
      setPendingSave(null);
    }
  };

  // Direct create function that bypasses the check
  async function handleCreateDirect() {
    try {
      const tx = generateTransactionNumber();
      const validityPeriod = getValidityPeriod('Cohabitation');
      const updated = { 
        ...formData, 
        transaction_number: tx, 
        date_created: new Date().toISOString(),
        validity_period: validityPeriod,
      };
      const res = await fetch(`${apiBase}/certificate-of-cohabitation`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(toServerPayload(updated)),
      });
      if (!res.ok) throw new Error("Create failed");
      const created = await res.json();
      const newRec = { 
        ...updated, 
        certificate_of_cohabitation_id: created.certificate_of_cohabitation_id,
        sec_official_name: created.sec_official_name,
        sec_designation: created.sec_designation,
        sec_signature_path: created.sec_signature_path,
        cap_official_name: created.cap_official_name,
        cap_designation: created.cap_designation,
        cap_signature_path: created.cap_signature_path,
      };
      setRecords([newRec, ...records]);
      setSelectedRecord(newRec);

      // --- Save to certificates table ---
      const combinedFullName = `${newRec.full_name1} & ${newRec.full_name2}`;
      const reason = newRec.request_reason || "Cohabitation";

      // Save just ONE certificate record with the first person's resident ID
      await saveCertificate({
        full_name: combinedFullName,
        resident_id: newRec.resident1_id, // Just use the first person's ID
        request_reason: reason,
        validity_period: validityPeriod,
        date_issued: newRec.date_issued,
      }, true);

      storeLocalDraft(newRec);
      resetForm();
      setActiveTab("records");
    } catch (e) {
      console.error(e);
      alert("Failed to create record");
    }
  }

  // Update the handleCreate function in Cohabitation.jsx
  async function handleCreate() {
    // Check if either resident has a valid certificate
    const validCert1 = checkValidCertificate(formData.resident1_id);
    const validCert2 = checkValidCertificate(formData.resident2_id);
    
    if (validCert1 || validCert2) {
      // Show confirmation dialog
      setValidCertInfo(validCert1 || validCert2);
      setPendingSave('create');
      setShowValidCertDialog(true);
      return;
    }
    
    // No valid certificate, proceed with normal creation
    handleCreateDirect();
  }

  // Update the handleUpdate function in Cohabitation.jsx
  async function handleUpdate() {
    try {
      const validityPeriod = getValidityPeriod('Cohabitation');
      const updated = { 
        ...formData, 
        validity_period: validityPeriod,
      };
      const res = await fetch(`${apiBase}/certificate-of-cohabitation/${editingId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(toServerPayload(updated)),
      });
      if (!res.ok) throw new Error("Update failed");
      const updatedData = await res.json();
      // The backend creates a NEW record, so we need to add it to records and remove/replace the old one
      const updatedRec = { 
        ...updatedData,
        certificate_of_cohabitation_id: updatedData.certificate_of_cohabitation_id,
        full_name1: updatedData.full_name1,
        dob1: updatedData.dob1 ? updatedData.dob1.split("T")[0] : "",
        full_name2: updatedData.full_name2,
        dob2: updatedData.dob2 ? updatedData.dob2.split("T")[0] : "",
        address: updatedData.address,
        date_started: updatedData.date_started,
        date_issued: updatedData.date_issued ? updatedData.date_issued.split("T")[0] : "",
        witness1_name: updatedData.witness1_name,
        witness2_name: updatedData.witness2_name,
        date_created: updatedData.date_created,
        transaction_number: updatedData.transaction_number,
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
      // Remove old record and add new one
      setRecords([updatedRec, ...records.filter((r) => r.certificate_of_cohabitation_id !== editingId)]);
      setSelectedRecord(updatedRec);

      // --- Save to certificates table ---
      const combinedFullName = `${updatedRec.full_name1} & ${updatedRec.full_name2}`;
      const reason = updatedRec.request_reason || "Cohabitation";

      // Update just ONE certificate record with the first person's resident ID
      await saveCertificate({
        full_name: combinedFullName,
        resident_id: updatedRec.resident1_id, // Just use the first person's ID
        request_reason: reason,
        validity_period: validityPeriod,
        date_issued: updatedRec.date_issued,
      }, false);

      storeLocalDraft(updatedRec);
      resetForm();
      setActiveTab("records");
    } catch (e) {
      console.error(e);
      alert("Failed to update record");
    }
  }

  function handleEdit(record) {
    setFormData({
      ...record,
      date_issued: record.date_issued || record.dateIssued || "",
      dob1: record.dob1 || "",
      dob2: record.dob2 || "",
      date_started: record.date_started || record.dateStarted || new Date().getFullYear(),
      use_signature: Boolean(record.use_signature),
      secretary_signature_id: record.secretary_signature_id || null,
      captain_signature_id: record.captain_signature_id || null,
    });
    setEditingId(record.certificate_of_cohabitation_id);
    setIsFormOpen(true);
    setActiveTab("form");
    
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
    if (!window.confirm("Delete this record?")) return;
    try {
      const res = await fetch(`${apiBase}/certificate-of-cohabitation/${id}`, { 
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error("Delete failed");
      setRecords(records.filter((r) => r.certificate_of_cohabitation_id !== id));
      if (selectedRecord?.certificate_of_cohabitation_id === id) setSelectedRecord(null);
      const existing = JSON.parse(localStorage.getItem("certificates") || "{}");
      delete existing[id];
      localStorage.setItem("certificates", JSON.stringify(existing));
    } catch (e) {
      console.error(e);
      alert("Failed to delete record");
    }
  }

  function handleView(record) {
    setSelectedRecord(record);
    setFormData({ ...record });
    setEditingId(record.certificate_of_cohabitation_id);
    setIsFormOpen(true);
    setActiveTab("form");
    
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
      certificate_of_cohabitation_id: "",
      resident1_id: "",
      resident2_id: "",
      full_name1: "",
      dob1: "",
      full_name2: "",
      dob2: "",
      address: "",
      date_started: new Date().getFullYear(),
      date_issued: new Date().toISOString().split("T")[0],
      witness1_name: "",
      witness2_name: "",
      transaction_number: "",
      is_active: 1,
      date_created: "",
      use_signature: false,
      secretary_signature_id: null,
      captain_signature_id: null,
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
          (r.full_name1 || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.full_name2 || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.address || "").toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [records, searchTerm]
  );


  async function generatePDF() {
    if (!display.certificate_of_cohabitation_id) {
      alert("Please save the record first before downloading PDF");
      return;
    }
    setIsGeneratingPDF(true);
    try {
      const el = document.getElementById("certificate-preview");
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "in", format: [8.5, 11] });
      pdf.addImage(imgData, "PNG", 0, 0, 8.5, 11);

      const createdDate = display.date_created ? formatDateTimeDisplay(display.date_created) : new Date().toLocaleString();
      pdf.addPage();
      pdf.setFontSize(18);
      pdf.setFont(undefined, "bold");
      pdf.text("Certificate Verification Information", 0.5, 0.6);
      pdf.setLineWidth(0.02);
      pdf.line(0.5, 0.85, 8, 0.85);
      pdf.setFontSize(12);
      pdf.setFont(undefined, "normal");

      let yPos = 1.1;
      const lineHeight = 0.25;
      const details = [
        `Certificate Type: Certificate of Cohabitation`,
        `Certificate ID: ${display.certificate_of_cohabitation_id}`,
        `Transaction Number: ${display.transaction_number}`,
        ``,
        `Name 1: ${display.full_name1}`,
        `Name 2: ${display.full_name2}`,
        `Address: ${display.address}`,
        `Date Started: ${display.date_started}`,
        `Date Issued: ${formatDateDisplay(display.date_issued)}`,
        `Date Created (E-Signature Applied): ${createdDate}`,
        ``,
        `Issued by: ${display.use_signature && display.cap_official_name ? display.cap_official_name : 'Punong Barangay Arnold Dondonayos'}`,
        `Barangay: Barangay 145 Zone 13 Dist. 1, Caloocan City`,
        ``,
        `QR Code URL: ${window.location.origin}/verify-cohabitation?id=${display.certificate_of_cohabitation_id}`,
      ];
      details.forEach((line) => {
        pdf.text(line, 0.5, yPos);
        yPos += lineHeight;
      });

      const filename = `Cohabitation_${display.certificate_of_cohabitation_id || "draft"}_${(display.full_name1||'').replace(/\s+/g,'_')}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  }

  function handlePrint() {
    if (!display.certificate_of_cohabitation_id) { 
      alert("Please save the record first before printing"); 
      return; 
    }
    
    // 1. Get the certificate element
    const certificateElement = document.getElementById("certificate-preview");
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
        if (e.key === "+" || e.key === "=") { e.preventDefault(); handleZoomIn(); }
        if (e.key === "-") { e.preventDefault(); handleZoomOut(); }
        if (e.key === "0") { e.preventDefault(); handleResetZoom(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function openVerifyPage() {
    if (!display.certificate_of_cohabitation_id) {
      const key = `draft-${display.transaction_number || "no-txn"}`;
      storeLocalDraft({ ...display, certificate_of_cohabitation_id: key });
    }
    window.open(getVerifyUrl(display), "_blank");
  }

  // resident select autofill helpers
  function onResident1Select(option) {
    if (option) {
      setFormData((prev) => ({
        ...prev,
        resident1_id: option.resident_id,
        full_name1: option.full_name || prev.full_name1,
        dob1: option.dob ? option.dob.split("T")[0] : prev.dob1,
        address: option.address || prev.address,
      }));
    } else {
      setFormData((prev) => ({ ...prev, resident1_id: "", full_name1: "", dob1: "" }));
    }
  }
  function onResident2Select(option) {
    if (option) {
      setFormData((prev) => ({
        ...prev,
        resident2_id: option.resident_id,
        full_name2: option.full_name || prev.full_name2,
        dob2: option.dob ? option.dob.split("T")[0] : prev.dob2,
        address: option.address || prev.address,
      }));
    } else {
      setFormData((prev) => ({ ...prev, resident2_id: "", full_name2: "", dob2: "" }));
    }
  }

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
                  Certificate of Cohabitation
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Manage all records of the Certificate of Cohabitation
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
                      disabled={!display.certificate_of_cohabitation_id || isGeneratingPDF} 
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
                      disabled={!display.certificate_of_cohabitation_id}
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
                      width: '100px',
                      height: '100px',
                      top: '60px',
                      left: '60px',
                    }}
                    src={CaloocanLogo}
                    alt="Logo 1"
                  />
                  <img
                    style={{
                      position: 'absolute',
                      width: '110px',
                      height: '110px',
                      top: '60px',
                      right: '40px',
                    }}
                    src={Logo145}
                    alt="Logo 3"
                  />
                  <img
                    style={{
                      position: 'absolute',
                      opacity: 0.2,
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
                      top: '280px',
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
                      This is to certify that <UnderlinedValue value={display.full_name1} italic width={220} />, born on <UnderlinedValue value={display.dob1 ? new Date(display.dob1).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : ""} width={160} /> and <UnderlinedValue value={display.full_name2} italic width={220} />, born on <UnderlinedValue value={display.dob2 ? new Date(display.dob2).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : ""} width={160} />, are cohabiting at <UnderlinedValue value={display.address} width={380} align="left" />, Barangay 145, Bagong Barrio, Caloocan City.
                    </p>

                    <p style={{ textIndent: '50px' }}>
                      Upon the request of the subject residents and to the best knowledge of the Barangay, we certify that they have been living together at the aforementioned address since <UnderlinedValue value={display.date_started} width={100} />.
                    </p>

                    <p style={{ textIndent: '50px' }}>
                      This shall serve as CERTIFICATE OF COHABITATION for whatever legal purpose it may serve.
                    </p>

                    <p style={{ textIndent: '50px' }}>
                      Issued this <UnderlinedValue value={display.date_issued ? (() => { 
                        const date = new Date(display.date_issued); 
                        const day = date.getDate(); 
                        const month = date.toLocaleString("default", { month: "short" }); 
                        const year = date.getFullYear(); 
                        const suffix = day % 10 === 1 && day !== 11 ? "st" : day % 10 === 2 && day !== 12 ? "nd" : day % 10 === 3 && day !== 13 ? "rd" : "th"; 
                        return `${day}${suffix} day of ${month}, ${year}`; 
                      })() : ""} width={260} /> at Barangay 145 office, Bagong Barrio, Caloocan City.
                    </p>

                    <div style={{ textAlign: "center", fontWeight: "bold", marginTop: "40px", textDecoration: "underline" }}>
                      WITNESS
                    </div>

                    <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between", paddingLeft: "60px", paddingRight: "60px", fontFamily: '"Times New Roman", serif', fontSize: "12pt", fontWeight: "bold" }}>
                      <UnderlinedValue value={display.witness1_name} width={220} />
                      <UnderlinedValue value={display.witness2_name} width={220} />
                    </div>
                  </div>

                  {/* Signatures */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '800px',
                      left: '250px',
                      width: '300px',
                      textAlign: 'left',
                      fontFamily: '"Times New Roman", serif',
                      fontWeight: 'bold',
                    }}
                  >
                    <div style={{ color: 'black', fontFamily: 'inherit' }}>Certified Correct:</div> <br />
                    
                    {/* Secretary Signature */}
                    {display.use_signature && display.sec_signature_path ? (
                      <>
                        <div
                          style={{
                            marginBottom: '-10px',
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
                        <div style={{ color: 'black', fontFamily: 'inherit', fontSize: '16pt', fontStyle: 'italic' }}>
                          Roselyn Anore
                        </div>
                        <div style={{ color: 'black', fontFamily: 'inherit', fontStyle: 'italic' }}>
                          Barangay Secretary
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ color: 'black', fontFamily: 'inherit', fontSize: '16pt', fontStyle: 'italic'  }}>Roselyn Anore</div>
                        <div style={{ color: 'black', fontFamily: 'inherit', fontStyle: 'italic' }}>Barangay Secretary</div>
                      </>
                    )}
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      top: '800px',
                      right: '20px',
                      width: '300px',
                      textAlign: 'left',
                      fontFamily: '"Times New Roman", serif',
                      fontWeight: 'bold',
                    }}
                  >
                    <div style={{ color: 'black', fontFamily: 'inherit', fontSize: '12pt' }}>Attested: </div> <br />
                    
                    {/* Captain Signature */}
                    {display.use_signature && display.cap_signature_path ? (
                      <>
                        <div
                          style={{
                            marginBottom: '-10px',
                            marginRight: '100px',
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
                        <div style={{ color: 'black', fontFamily: 'inherit', fontSize: '16pt', fontStyle: 'italic' }}>
                          ARNOLD DONDONAYOS
                        </div>
                        <div style={{ color: 'black', fontFamily: 'inherit', fontSize: '12pt', fontStyle: 'italic' }}>
                          Barangay Chairman
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ color: 'black', fontFamily: 'inherit', fontSize: '16pt', fontStyle: 'italic' }}>ARNOLD DONDONAYOS</div>
                        <div style={{ color: 'black', fontFamily: 'inherit', fontSize: '12pt', fontStyle: 'italic' }}>Barangay Chairman</div>
                      </>
                    )}
                  </div>

                  {/* QR and signature area */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '780px',
                      left: '50px',
                      width: '200px',
                      textAlign: 'center',
                      fontFamily: '"Times New Roman", serif',
                      fontSize: '12pt',
                      fontWeight: 'bold',
                    }}
                  >
                    

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
                    {editingId ? "Edit Certificate" : "New Certificate of Cohabitation"}
                  </Typography>
                  {selectedRecord && !editingId && (
                    <Typography variant="body2" color="text.secondary">
                      Viewing: {selectedRecord.full_name1} & {selectedRecord.full_name2}
                    </Typography>
                  )}
                </Paper>

                <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
                  <Stack spacing={3}>
                    <Autocomplete
                      options={residents}
                      getOptionLabel={(opt) => opt.full_name || ''}
                      value={residents.find((r) => r.resident_id === formData.resident1_id) || null}
                      onChange={(e, nv) => { onResident1Select(nv); }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Full Name 1 *"
                          variant="outlined"
                          size="small"
                          fullWidth
                          required
                        />
                      )}
                    />

                    <TextField
                      label="Birthday (Full Name 1) *"
                      type="date"
                      variant="outlined"
                      size="small"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={formData.dob1}
                      onChange={(e) => setFormData({ ...formData, dob1: e.target.value })}
                      required
                    />

                    <Autocomplete
                      options={residents}
                      getOptionLabel={(opt) => opt.full_name || ''}
                      value={residents.find((r) => r.resident_id === formData.resident2_id) || null}
                      onChange={(e, nv) => { onResident2Select(nv); }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Full Name 2 *"
                          variant="outlined"
                          size="small"
                          fullWidth
                          required
                        />
                      )}
                    />
                     
                    <TextField
                      label="Birthday (Full Name 2) *"
                      type="date"
                      variant="outlined"
                      size="small"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={formData.dob2}
                      onChange={(e) => setFormData({ ...formData, dob2: e.target.value })}
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
                      label="Date Started (Year) *"
                      type="number"
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={formData.date_started}
                      onChange={(e) => setFormData({ ...formData, date_started: e.target.value })}
                      placeholder="e.g. 2015"
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

                    <Grid container spacing={1.5}>
                      <Grid item xs={6}>
                        <TextField
                          label="Witness 1"
                          variant="outlined"
                          size="small"
                          fullWidth
                          value={formData.witness1_name}
                          onChange={(e) => setFormData({ ...formData, witness1_name: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="Witness 2"
                          variant="outlined"
                          size="small"
                          fullWidth
                          value={formData.witness2_name}
                          onChange={(e) => setFormData({ ...formData, witness2_name: e.target.value })}
                        />
                      </Grid>
                    </Grid>

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
                    placeholder="Search by name, address, or date started"
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
                        <Card key={record.certificate_of_cohabitation_id} sx={{
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          borderLeft: 4,
                          borderColor: "primary.main",
                        }}>
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, color: "#000000" }}>
                                  {record.full_name1} & {record.full_name2}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  {record.address}
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
                                  <Chip
                                    label={`Since: ${record.date_started}`}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
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
                                <Typography variant="caption" color="text.secondary">
                                  {record.witness1_name && record.witness2_name ? `Witnesses: ${record.witness1_name}, ${record.witness2_name}` : ''}
                                </Typography>
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
                                    onClick={()=>handleDelete(record.certificate_of_cohabitation_id)}
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

      {/* Add the dialog at the end of the component, before the closing tags */}
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
            This resident already has a valid Certificate of Cohabitation issued on{' '}
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
    </ThemeProvider>
  );
}
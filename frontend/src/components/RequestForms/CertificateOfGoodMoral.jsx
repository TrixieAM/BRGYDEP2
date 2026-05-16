import React, { useState, useEffect, useMemo } from 'react';
import {
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
import { useAuth } from '../../contexts/AuthContext';
import { getSignatures, getSignatureImageUrl } from '../../services/signatureService';
import { useCertificateManager } from '../../hooks/useCertificateManager';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import Monumento from '../../assets/monumento.png';
import CaloocanLogo from '../../assets/CaloocanLogo.png';
import Logo145 from '../../assets/Logo145.png';
import WordName from '../../assets/WordName.png';

// ── THEME (identical to Business Clearance) ──────────────────────────────────
const theme = createTheme({
  palette: {
    primary: { main: '#41644A', light: '#A0B2A6', dark: '#0D4715' },
    secondary: { main: '#E9762B' },
    success: { main: '#41644A', light: '#A0B2A6', dark: '#0D4715' },
    background: { default: '#F1F0E9', paper: '#FFFFFF' },
    text: { primary: '#000000', secondary: '#41644A' },
    error: { main: '#E9762B' },
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
        containedPrimary: { background: 'linear-gradient(45deg, #41644A 30%, #527D60 90%)' },
        containedSecondary: { background: 'linear-gradient(45deg, #E9762B 30%, #F4944D 90%)' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 16px rgba(0,0,0,0.12)' },
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
        root: { color: '#000000', '&.Mui-focused': { color: '#41644A' } },
      },
    },
    MuiFormHelperText: { styleOverrides: { root: { color: '#000000' } } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#000000' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#41644A' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#41644A' },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#000000' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#41644A' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#41644A' },
          },
        },
      },
    },
  },
});

// ── HELPERS ───────────────────────────────────────────────────────────────────
function generateControlNumber() {
  const year = new Date().getFullYear();
  const random = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
  return `${year}145-G${random}`;
}

function generateTransactionNumber() {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `GCM-${year}${month}${day}-${rand}`;
}

function getIssuedParts(dateStr) {
  if (!dateStr) return { day: '___', month: '________', year: '____' };
  const d = new Date(dateStr + 'T00:00:00');
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];
  return { day: d.getDate(), month: months[d.getMonth()], year: d.getFullYear() };
}

function formatDateDisplay(dateString) {
  if (!dateString) return '';
  const dateOnly = dateString.includes('T') ? dateString.split('T')[0] : dateString;
  const [year, month, day] = dateOnly.split('-');
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];
  return `${months[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
}

function formatDateTimeDisplay(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} ${hours}:${minutes} ${ampm}`;
}

const INITIAL_FORM = () => {
  const today = new Date().toISOString().split('T')[0];
  const exp = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  return {
    resident_id: null,
    full_name: '',
    address: '',
    civil_status: 'Single',
    date_issued: today,
    date_expired: exp,
    remarks: '',
    request_reason: '',
    control_no: generateControlNumber(),
    prepared_by_name: 'Roselyn Anore',
    prepared_by_position: 'Barangay Secretary',
    use_signature: false,
    signature_id: null,
  };
};

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function CertificateOfGoodMoral() {
  const apiBase = 'http://localhost:5000';
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
  const [zoomLevel, setZoomLevel] = useState(0.75);
  const [signatures, setSignatures] = useState([]);
  const [selectedSignature, setSelectedSignature] = useState(null);
  const [showValidCertDialog, setShowValidCertDialog] = useState(false);
  const [validCertInfo, setValidCertInfo] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM());

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { saveCertificate, getValidityPeriod } = useCertificateManager('Certificate of Good Moral');

  // ── Data loading ─────────────────────────────────────────────────────────
  async function loadRecords() {
    try {
      const res = await fetch(`${apiBase}/certificate-of-good-moral`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setRecords(
          Array.isArray(data)
            ? data.map((r) => ({
                ...r,
                date_issued: r.date_issued?.split('T')[0] || '',
                date_expired: r.date_expired?.split('T')[0] || '',
                use_signature: Boolean(r.use_signature),
                signature_id: r.signature_id || null,
                official_name: r.official_name || null,
                designation: r.designation || null,
                signature_path: r.signature_path || null,
              }))
            : [],
        );
      }
    } catch (e) { console.error(e); }
  }

  async function loadResidents() {
    try {
      const res = await fetch(`${apiBase}/residents`, { headers: getAuthHeaders() });
      if (res.ok) setResidents(await res.json());
    } catch (e) { console.error(e); }
  }

  async function loadSignatures() {
    try {
      const sigs = await getSignatures();
      setSignatures(sigs || []);
    } catch (e) { console.warn(e); }
  }

  useEffect(() => {
    loadRecords();
    loadResidents();
    loadSignatures();
  }, []);

  // ── Auto-set expiry when issue date changes ───────────────────────────────
  useEffect(() => {
    if (formData.date_issued) {
      const exp = new Date(new Date(formData.date_issued).getTime() + 180 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];
      if (exp !== formData.date_expired) {
        setFormData((prev) => ({ ...prev, date_expired: exp }));
      }
    }
  }, [formData.date_issued]);

  // ── Display data (live preview) ───────────────────────────────────────────
  const display = useMemo(() => {
    let data = editingId || isFormOpen ? formData : selectedRecord || formData;
    if (data && data.use_signature && data.signature_id && !data.signature_path) {
      const sig = signatures.find((s) => s.signature_id === data.signature_id);
      if (sig) return { ...data, official_name: sig.official_name, designation: sig.designation, signature_path: sig.signature_path };
    }
    return data;
  }, [editingId, isFormOpen, selectedRecord, formData, signatures]);

  // ── QR code ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const gen = async () => {
      if (display?.full_name) {
        const qrContent = `CERTIFICATE VERIFICATION:
        𝗧𝗿𝗮𝗻𝘀𝗮𝗰𝘁𝗶𝗼𝗻 𝗡𝗼: ${display.transaction_number || 'N/A'}
        Name: ${display.full_name}
        Date Issued: ${display.date_created ? formatDateTimeDisplay(display.date_created) : new Date().toLocaleString()}
        Document Type: Certificate of Good Moral Character
       
        Ⓒ BRRMS | BARANGAY 145
        CALOOCAN CITY
        ALL RIGHTS RESERVED`;
        try {
          setQrCodeUrl(await QRCode.toDataURL(qrContent, { width: 140, margin: 1, errorCorrectionLevel: 'L' }));
        } catch (e) { console.error(e); }
      } else {
        setQrCodeUrl('');
      }
    };
    gen();
  }, [display]);

  // ── Keyboard zoom ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') { e.preventDefault(); setZoomLevel((p) => Math.min(p + 0.1, 2)); }
        else if (e.key === '-') { e.preventDefault(); setZoomLevel((p) => Math.max(p - 0.1, 0.3)); }
        else if (e.key === '0') { e.preventDefault(); setZoomLevel(0.75); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── CRUD ─────────────────────────────────────────────────────────────────
  function toServerPayload(data) {
    return {
      resident_id: data.resident_id || null,
      full_name: data.full_name,
      address: data.address,
      civil_status: data.civil_status,
      date_issued: data.date_issued,
      date_expired: data.date_expired,
      remarks: data.remarks,
      request_reason: data.request_reason,
      control_no: data.control_no || '',
      prepared_by_name: data.prepared_by_name || '',
      prepared_by_position: data.prepared_by_position || '',
      use_signature: data.use_signature ? 1 : 0,
      signature_id: data.use_signature && data.signature_id ? data.signature_id : null,
    };
  }

  function validateFormData(data) {
    const required = ['full_name', 'address', 'date_issued', 'date_expired', 'request_reason'];
    const missing = required.filter((k) => !data[k] || data[k].toString().trim() === '');
    return { valid: missing.length === 0, missing };
  }

  async function handleCreate() {
    try {
      const validation = validateFormData(formData);
      if (!validation.valid) { alert(`Missing required fields: ${validation.missing.join(', ')}`); return; }

      const transactionNumber = generateTransactionNumber();
      const updatedFormData = { ...formData, transaction_number: transactionNumber, date_created: new Date().toISOString() };

      const res = await fetch(`${apiBase}/certificate-of-good-moral`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(toServerPayload(updatedFormData)),
      });
      if (!res.ok) throw new Error(`Create failed (${res.status})`);
      const created = await res.json();
      const newRec = { ...updatedFormData, certificate_of_good_moral_id: created.certificate_of_good_moral_id };
      setRecords([newRec, ...records]);
      setSelectedRecord(newRec);
      await saveCertificate(newRec, true);
      resetForm();
      setActiveTab('records');
    } catch (e) { console.error(e); alert(`Failed to create record: ${e.message}`); }
  }

  async function handleUpdate() {
    try {
      const res = await fetch(`${apiBase}/certificate-of-good-moral/${editingId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(toServerPayload(formData)),
      });
      if (!res.ok) throw new Error('Update failed');
      const updatedData = await res.json();
      const updated = {
        ...updatedData,
        date_issued: updatedData.date_issued?.split('T')[0] || '',
        date_expired: updatedData.date_expired?.split('T')[0] || '',
        use_signature: Boolean(updatedData.use_signature),
        signature_id: updatedData.signature_id || null,
        official_name: updatedData.official_name || null,
        designation: updatedData.designation || null,
        signature_path: updatedData.signature_path || null,
      };
      setRecords([updated, ...records.filter((r) => r.certificate_of_good_moral_id !== editingId)]);
      setSelectedRecord(updated);
      await saveCertificate(updated, false);
      resetForm();
      setActiveTab('records');
    } catch (e) { console.error(e); alert('Failed to update record'); }
  }

  function handleEdit(record) {
    setFormData({ ...record, use_signature: Boolean(record.use_signature), signature_id: record.signature_id || null });
    setEditingId(record.certificate_of_good_moral_id);
    setIsFormOpen(true);
    setActiveTab('form');
    setSelectedSignature(record.signature_id ? signatures.find((s) => s.signature_id === record.signature_id) || null : null);
  }

  function handleView(record) {
    setSelectedRecord(record);
    setFormData({ ...record, use_signature: Boolean(record.use_signature), signature_id: record.signature_id || null });
    setEditingId(record.certificate_of_good_moral_id);
    setIsFormOpen(true);
    setActiveTab('form');
    setSelectedSignature(record.signature_id ? signatures.find((s) => s.signature_id === record.signature_id) || null : null);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this record?')) return;
    try {
      const res = await fetch(`${apiBase}/certificate-of-good-moral/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Delete failed');
      setRecords(records.filter((r) => r.certificate_of_good_moral_id !== id));
      if (selectedRecord?.certificate_of_good_moral_id === id) setSelectedRecord(null);
    } catch (e) { console.error(e); alert('Failed to delete record'); }
  }

  function resetForm() {
    setFormData(INITIAL_FORM());
    setEditingId(null);
    setIsFormOpen(false);
    setSelectedRecord(null);
    setSelectedSignature(null);
  }

  function handleSubmit() {
    if (!formData.full_name || !formData.address) { alert('Please fill in all required fields'); return; }
    if (!formData.date_issued) { alert('Please select the issued date'); return; }
    if (formData.use_signature && !formData.signature_id) { alert('Please select a signature when e-signature is enabled'); return; }

    if (!editingId && formData.resident_id) {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const validCert = records.find((r) => r.resident_id === formData.resident_id && new Date(r.date_issued) >= sixMonthsAgo);
      if (validCert) { setValidCertInfo(validCert); setShowValidCertDialog(true); return; }
    }

    if (editingId) handleUpdate(); else handleCreate();
  }

  // ── PDF / Print ───────────────────────────────────────────────────────────
  async function generatePDF() {
    if (!display.certificate_of_good_moral_id) { alert('Please save the record first before downloading PDF'); return; }
    setIsGeneratingPDF(true);
    try {
      const el = document.getElementById('certificate-preview');
      const parent = el.parentNode;
      const prevT = parent.style.transform;
      const prevO = parent.style.transformOrigin;
      parent.style.transform = 'scale(1)';
      parent.style.transformOrigin = 'top center';
      await new Promise((r) => setTimeout(r, 150));
      const canvas = await html2canvas(el, { scale: 3, useCORS: true, logging: false, backgroundColor: '#ffffff' });
      parent.style.transform = prevT;
      parent.style.transformOrigin = prevO;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'in', format: [8.5, 11] });
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 8.5, 11);
      pdf.save(`Good_Moral_${display.certificate_of_good_moral_id}_${display.full_name.replace(/\s+/g, '_')}.pdf`);
    } catch (e) { console.error(e); alert('Failed to generate PDF. Please try again.'); }
    finally { setIsGeneratingPDF(false); }
  }

  function handlePrint() {
    if (!display.certificate_of_good_moral_id) { alert('Please save the record first before printing'); return; }
    const el = document.getElementById('certificate-preview');
    if (!el) { alert('Certificate not found for printing.'); return; }
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:absolute;left:-9999px;top:0;width:0;height:0;';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.write(`<!DOCTYPE html><html><head><title>Print</title><style>@page{size:8.5in 11in;margin:0;}body{margin:0;padding:0;-webkit-print-color-adjust:exact!important;}#certificate-preview{width:8.5in;height:11in;position:relative;overflow:hidden;background:white;box-sizing:border-box;}#certificate-preview *{-webkit-print-color-adjust:exact!important;}</style></head><body>${el.outerHTML}</body></html>`);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      window.onafterprint = () => document.body.removeChild(iframe);
      setTimeout(() => { if (document.body.contains(iframe)) document.body.removeChild(iframe); }, 1000);
    }, 250);
  }

  // ── Filtered records ──────────────────────────────────────────────────────
  const filteredRecords = useMemo(
    () => records.filter((r) =>
      r.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.control_no?.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
    [records, searchTerm],
  );

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>

        {/* ── TOP HEADER ── */}
        <Paper elevation={2} sx={{ zIndex: 10, borderRadius: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: 'primary.main', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src={Logo145} sx={{ width: 48, height: 48 }} />
              <Box>
                <Typography variant="h5" fontWeight="bold">Certificate of Good Moral Character</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Manage all records of the Certificate of Good Moral Character</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Badge badgeContent={records.length} color="secondary">
                <Chip icon={<FolderIcon />} label="Total Records" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }} />
              </Badge>
              <Button
                variant="contained" color="secondary" startIcon={<AddIcon />}
                onClick={() => { resetForm(); setIsFormOpen(true); setActiveTab('form'); }}
                sx={{ borderRadius: 20, px: 3 }}
              >
                New Certificate
              </Button>
            </Box>
          </Box>

          {/* ── NAVIGATION TABS ── */}
          <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
              <Tabs
                value={activeTab} onChange={(e, nv) => setActiveTab(nv)} variant="fullWidth"
                sx={{ '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' }, minHeight: 48 }}
              >
                <Tab icon={<ArticleIcon />} label="Form" value="form" iconPosition="start" />
                <Tab icon={<FolderIcon />} label={`Records (${records.length})`} value="records" iconPosition="start" />
              </Tabs>
            </Box>
          </Box>
        </Paper>

        {/* ── MAIN CONTENT ── */}
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* LEFT: Certificate preview */}
          <Box
            sx={{
              flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column',
              bgcolor: 'background.default', p: 2,
              [theme.breakpoints.down('lg')]: { display: activeTab === 'form' ? 'none' : 'flex' },
            }}
          >
            {/* Zoom controls + actions */}
            <Paper elevation={1} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Tooltip title="Zoom Out"><IconButton onClick={() => setZoomLevel((p) => Math.max(p - 0.1, 0.3))} color="primary" size="small"><ZoomOutIcon /></IconButton></Tooltip>
                  <Typography variant="body2" sx={{ minWidth: 60, textAlign: 'center', fontWeight: 600, px: 1, py: 0.5, bgcolor: 'background.paper', borderRadius: 1, color: '#000' }}>
                    {Math.round(zoomLevel * 100)}%
                  </Typography>
                  <Tooltip title="Zoom In"><IconButton onClick={() => setZoomLevel((p) => Math.min(p + 0.1, 2))} color="primary" size="small"><ZoomInIcon /></IconButton></Tooltip>
                  <Tooltip title="Reset Zoom"><IconButton onClick={() => setZoomLevel(0.75)} color="primary" size="small"><ResetIcon /></IconButton></Tooltip>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Download PDF">
                    <Button variant="contained" color="secondary" onClick={generatePDF} disabled={!display.certificate_of_good_moral_id || isGeneratingPDF} startIcon={<FileTextIcon />} size="small">
                      {isGeneratingPDF ? 'Generating...' : 'Download'}
                    </Button>
                  </Tooltip>
                  <Tooltip title="Print">
                    <Button variant="outlined" onClick={handlePrint} disabled={!display.certificate_of_good_moral_id} startIcon={<PrintIcon />} size="small">Print</Button>
                  </Tooltip>
                </Box>
              </Box>
            </Paper>

            {/* Certificate preview */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', flex: 1, overflow: 'auto', p: 1 }}>
              <Box sx={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}>
                <div
                  id="certificate-preview"
                  style={{
                    position: 'relative', width: '8.5in', height: '13in',
                    boxShadow: '0 0 8px rgba(0,0,0,0.2)', background: '#fff',
                    WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', colorAdjust: 'exact',
                    boxSizing: 'border-box', overflow: 'hidden', fontFamily: '"Times New Roman", serif',
                  }}
                >
                  <img src={Monumento} alt="Monumento Background" style={{ position: 'absolute', left: 125, top: 250, height: '100%', width: '120%', objectFit: 'cover', objectPosition: 'center top', opacity: 0.5, zIndex: 0, transform: 'scale(0.8)', transformOrigin: 'top right' }} />

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '30px 50px 10px 50px' }}>
                      <img src={CaloocanLogo} alt="Caloocan Logo" style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
                      <div style={{ textAlign: 'center', flex: 1, padding: '0 20px' }}>
                        <div style={{ fontFamily: 'Old English Text MT', fontSize: '16pt' }}>Republic of the Philippines</div>
                        <div style={{ fontFamily: '"Times New Roman"', fontSize: '16pt', marginTop: '2px' }}>City of Caloocan</div>
                        <div style={{ fontFamily: '"Times New Roman"', fontSize: '16pt', marginTop: '2px' }}>Barangay 145, Zone 13, District 1</div>
                        <div style={{ fontFamily: '"Times New Roman"', fontSize: '12pt', marginTop: '2px' }}>Reparo St. Cor. Gen. Tirona St. Bagong Barrio, Caloocan City</div>
                      </div>
                      <img src={Logo145} alt="Barangay 145 Logo" style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
                    </div>

                    <div style={{ textAlign: 'center', fontFamily: '"Times New Roman"', fontSize: '16pt', fontWeight: 'bold', marginTop: '10px', letterSpacing: '0.5px' }}>
                      OFFICE OF THE BARANGAY CHAIRMAN
                    </div>
                    <div style={{ textAlign: 'center', fontFamily: '"Times New Roman"', fontSize: '16pt', fontWeight: 'bold', margin: '40px 0 40px 0' }}>
                      CERTIFICATE OF GOOD MORAL CHARACTER
                    </div>

                    {/* Body */}
                    <div style={{ padding: '0 70px', fontFamily: '"Times New Roman", Times, serif', fontSize: '12pt', lineHeight: '1.8', color: '#000', textAlign: 'justify' }}>
                      <p style={{ fontWeight: 'bold', margin: '0 0 10px 0' }}>TO WHOM IT MAY CONCERN:</p>
                      <p style={{ margin: '0 0 10px 0', textIndent: '50px' }}>
                        This is to certify that <strong>{display.full_name || '____________________________'}</strong>, of legal age, <strong>{display.civil_status || 'Single'}</strong>, Filipino citizen, is a resident of <strong>{display.address || '(present address)'}</strong>, Barangay 145, District 1, Caloocan City.
                      </p>
                      <p style={{ margin: '0 0 10px 0', textIndent: '50px' }}>
                        It is further certified that he/she possesses good moral character, is a peaceful and law-abiding citizen, and has not committed any misconduct or misdemeanor that is contrary to laws, rules, and regulations.
                      </p>
                      <p style={{ margin: '0 0 10px 0', textIndent: '50px' }}>
                        This certification is issued upon the request of the above-mentioned individual for <strong>{display.request_reason || '(state the purpose of the Certificate)'}</strong>.
                      </p>
                      {(() => {
                        const { day, month, year } = getIssuedParts(display.date_issued);
                        return (
                          <p style={{ margin: '0 0 10px 0', textIndent: '50px' }}>
                            Issued this <strong>{day}</strong> of <strong>{month}</strong>, <strong>{year}</strong>, at Barangay <strong>145</strong>, Caloocan City.
                          </p>
                        );
                      })()}
                    </div>

                    {/* Photo & Thumbmark */}
                    <div style={{ display: 'flex', gap: '40px', padding: '14px 70px', alignItems: 'flex-end' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '150px', height: '150px', border: '1.5px solid #000' }} />
                        <div style={{ fontSize: '10pt', marginTop: '6px' }}>Applicant Photo</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '150px', height: '150px', border: '1.5px solid #000' }} />
                        <div style={{ fontSize: '10pt', marginTop: '6px' }}>Applicant Thumbmark</div>
                      </div>
                    </div>

                    {/* Signature block */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 70px', marginTop: '10px' }}>
                      <div style={{ textAlign: 'center', width: '300px', marginTop: '-40px' }}>
                        {display.use_signature && display.signature_path ? (
                          <div style={{ height: '70px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '-10px' }}>
                            <img src={getSignatureImageUrl(display.signature_path)} alt="Signature" style={{ maxWidth: '200px', maxHeight: '65px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
                          </div>
                        ) : null}
                        <div style={{ height: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img src={WordName} alt="Arnold Dondonayos" style={{ width: '240px', height: 'auto', maxHeight: '55px', objectFit: 'contain' }} />
                        </div>
                        <div style={{ borderTop: '2px solid #000', width: '90%', margin: '0 auto 4px auto' }} />
                        <div style={{ fontFamily: '"Times New Roman"', fontSize: '11pt', fontWeight: 'bold' }}>[Punong Barangay / Authorized Official]</div>
                      </div>
                    </div>

                    {/* Seal / footer */}
                    <div style={{ padding: '30px 70px 0 70px', fontSize: '11pt' }}>
                      <div>Barangay Seal</div>
                      <div style={{ marginTop: '4px' }}>Control No. <span style={{ minWidth: '120px', display: 'inline-block' }}>{display.control_no || '145-0001'}</span></div>
                      <ul style={{ marginTop: '8px', paddingLeft: '20px', fontSize: '9pt', lineHeight: '1.6', listStyleType: 'disc' }}>
                        <li>This certification is not valid without the Official Barangay Dry Seal and the Barangay Chairman's Signature/Stamp.</li>
                        <li>Officials and applicants who submit false certifications or documents shall be held liable for administrative/criminal liabilities.</li>
                      </ul>
                      <div style={{ fontSize: '10pt', marginTop: '50px', fontFamily: '"Times New Roman"' }}>
                        <div>Prepared by: <strong>{display.prepared_by_name || 'Roselyn Anore'}</strong></div>
                        <div style={{ marginLeft: '80px' }}><strong>{display.prepared_by_position || 'Barangay Secretary'}</strong></div>
                      </div>
                      <div style={{ textAlign: 'center', fontFamily: '"Times New Roman"', fontSize: '13pt', marginTop: '60px', fontStyle: 'italic' }}>
                        This certification is <strong>valid for six (6) months from the date of issuance.</strong>
                      </div>
                      <div style={{ marginTop: '12px', textAlign: 'right', paddingRight: '10px', height: '110px', visibility: qrCodeUrl && display.use_signature ? 'visible' : 'hidden' }}>
                        <img
                          src={qrCodeUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3C/svg%3E'}
                          alt="QR Code"
                          style={{ width: '80px', height: '80px', display: 'inline-block', border: '2px solid #000', padding: '3px' }}
                        />
                        <div style={{ fontSize: '7pt', color: '#666', marginTop: '3px', fontWeight: 'normal', textAlign: 'right' }}>
                          {display.date_created ? formatDateTimeDisplay(display.date_created) : new Date().toLocaleString()}
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
            {/* FORM TAB */}
            {activeTab === 'form' && (
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Paper elevation={0} sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ArticleIcon color="primary" />
                    {editingId ? 'Edit Certificate' : 'New Certificate of Good Moral Character'}
                  </Typography>
                  {selectedRecord && !editingId && (
                    <Typography variant="body2" color="text.secondary">Viewing: {selectedRecord.full_name}</Typography>
                  )}
                </Paper>

                <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                  <Stack spacing={3}>
                    <Autocomplete
                      options={residents}
                      getOptionLabel={(opt) => opt.full_name || `${opt.first_name || ''} ${opt.last_name || ''}`.trim()}
                      value={residents.find((r) => r.full_name === formData.full_name) || null}
                      onChange={(e, nv) => {
                        if (nv) {
                          const fullName = nv.full_name || `${nv.first_name || ''} ${nv.middle_name || ''} ${nv.last_name || ''}`.trim();
                          setFormData({ ...formData, resident_id: nv.resident_id, full_name: fullName, address: nv.address || '' });
                        } else {
                          setFormData({ ...formData, full_name: '' });
                        }
                      }}
                      renderInput={(params) => <TextField {...params} label="Full Name" variant="outlined" fullWidth size="small" required />}
                    />

                    <TextField label="Address" variant="outlined" fullWidth size="small" multiline rows={2} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required />

                    <FormControl fullWidth size="small">
                      <InputLabel>Civil Status</InputLabel>
                      <Select value={formData.civil_status} label="Civil Status" onChange={(e) => setFormData({ ...formData, civil_status: e.target.value })}>
                        <MenuItem value="Single">Single</MenuItem>
                        <MenuItem value="Married">Married</MenuItem>
                        <MenuItem value="Widowed">Widowed</MenuItem>
                        <MenuItem value="Separated">Separated</MenuItem>
                      </Select>
                    </FormControl>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField label="Date Issued" type="date" variant="outlined" fullWidth size="small" InputLabelProps={{ shrink: true }} value={formData.date_issued} onChange={(e) => setFormData({ ...formData, date_issued: e.target.value })} required />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField label="Date Expired" type="date" variant="outlined" fullWidth size="small" InputLabelProps={{ shrink: true }} value={formData.date_expired} required InputProps={{ readOnly: true, style: { backgroundColor: '#f5f5f5' } }} helperText="Automatically set to 6 months from issue date" />
                      </Grid>
                    </Grid>

                    <TextField label="Request Reason / Purpose" variant="outlined" fullWidth size="small" multiline rows={2} placeholder="Employment, Scholarship, etc." value={formData.request_reason} onChange={(e) => setFormData({ ...formData, request_reason: e.target.value })} required />

                    <TextField label="Remarks" variant="outlined" fullWidth size="small" multiline rows={2} value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} />

                    <Divider sx={{ my: 2 }} />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.use_signature || false}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormData({ ...formData, use_signature: checked, signature_id: checked && selectedSignature ? selectedSignature.signature_id : null });
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
                        onChange={(e, nv) => { setSelectedSignature(nv); setFormData({ ...formData, signature_id: nv ? nv.signature_id : null }); }}
                        renderInput={(params) => <TextField {...params} label="Select Signature" variant="outlined" fullWidth size="small" required />}
                      />
                    )}

                    <Divider sx={{ my: 2 }} />

                    <TextField label="Control Number" variant="outlined" fullWidth size="small" value={formData.control_no} onChange={(e) => setFormData({ ...formData, control_no: e.target.value })} helperText="Format: YYYY145-G000000 (auto-generated)" />

                    <TextField label="Prepared By (Name)" variant="outlined" fullWidth size="small" value={formData.prepared_by_name} onChange={(e) => setFormData({ ...formData, prepared_by_name: e.target.value })} placeholder="e.g., Roselyn Anore" />

                    <TextField label="Prepared By (Position)" variant="outlined" fullWidth size="small" value={formData.prepared_by_position} onChange={(e) => setFormData({ ...formData, prepared_by_position: e.target.value })} placeholder="e.g., Barangay Secretary" />

                    <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
                      <Button onClick={handleSubmit} variant="contained" startIcon={<SaveIcon />} fullWidth color="primary" size="large">
                        {editingId ? 'Update' : 'Save'}
                      </Button>
                      {(editingId || isFormOpen) && (
                        <Button onClick={resetForm} variant="outlined" startIcon={<CloseIcon />} color="primary" size="large">Cancel</Button>
                      )}
                    </Box>
                  </Stack>
                </Box>
              </Box>
            )}

            {/* RECORDS TAB */}
            {activeTab === 'records' && (
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Paper elevation={0} sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FolderIcon color="primary" />
                    Certificate Records
                  </Typography>
                  <TextField
                    fullWidth size="small" placeholder="Search by name, address, or control number"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                  />
                </Paper>

                <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                  {filteredRecords.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                      <FolderIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                      <Typography variant="h6" gutterBottom>{searchTerm ? 'No records found' : 'No records yet'}</Typography>
                      <Typography variant="body2">{searchTerm ? 'Try a different search term' : 'Create your first certificate to get started'}</Typography>
                    </Paper>
                  ) : (
                    <Stack spacing={2}>
                      {filteredRecords.map((record) => (
                        <Card key={record.certificate_of_good_moral_id} sx={{ cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: 4, borderColor: 'primary.main' }}>
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, color: '#000000' }}>{record.full_name}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{record.address}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Civil Status: {record.civil_status}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                                  <Typography variant="caption" color="text.secondary">Issued: {formatDateDisplay(record.date_issued)}</Typography>
                                  <Typography variant="caption" color="text.secondary">Expires: {formatDateDisplay(record.date_expired)}</Typography>
                                </Box>
                                {record.use_signature && (
                                  <Chip label="E-Signed" size="small" color="success" variant="outlined" icon={<CheckCircleIcon />} />
                                )}
                              </Box>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Tooltip title="View">
                                  <IconButton size="small" onClick={() => handleView(record)} color="primary"><EyeIcon /></IconButton>
                                </Tooltip>
                                <Tooltip title="Edit">
                                  <IconButton size="small" onClick={() => handleEdit(record)} color="success"><EditIcon /></IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton size="small" onClick={() => handleDelete(record.certificate_of_good_moral_id)} color="error"><DeleteIcon /></IconButton>
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

        {/* Mobile FAB */}
        {isMobile && activeTab !== 'form' && (
          <Fab color="primary" aria-label="add" sx={{ position: 'absolute', bottom: 16, right: 16 }}
            onClick={() => { resetForm(); setIsFormOpen(true); setActiveTab('form'); }}>
            <AddIcon />
          </Fab>
        )}
      </Box>

      {/* Valid Certificate Dialog */}
      <Dialog open={showValidCertDialog} onClose={() => setShowValidCertDialog(false)} PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ bgcolor: '#41644A', color: 'white', py: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Resident Has Valid Certificate</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography>
            This resident already has a valid Certificate of Good Moral Character issued on{' '}
            {validCertInfo && formatDateDisplay(validCertInfo.date_issued)}. Certificates are valid for 6 months.
          </Typography>
          <Typography sx={{ mt: 2 }}>Are you sure you want to create a new certificate for this resident?</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #F1F0E9' }}>
          <Button onClick={() => setShowValidCertDialog(false)} variant="outlined" sx={{ borderColor: '#41644A', color: '#41644A' }}>Cancel</Button>
          <Button onClick={() => { setShowValidCertDialog(false); handleCreate(); }} variant="contained" sx={{ bgcolor: '#E9762B', '&:hover': { bgcolor: '#d8651f' } }}>Create Anyway</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
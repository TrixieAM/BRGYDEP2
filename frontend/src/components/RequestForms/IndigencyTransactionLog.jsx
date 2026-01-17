import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import CaloocanLogo from '../../assets/CaloocanLogo.png';
import Logo145 from '../../assets/Logo145.png';
import BagongPilipinas from '../../assets/BagongPilipinas.png';
import WordName from '../../assets/WordName.png';
import { useAuth } from '../../contexts/AuthContext';

// Import Material UI components
import {
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Box,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  Chip,
  Stack,
  createTheme,
  ThemeProvider,
  Avatar,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as EyeIcon,
  Description as FileTextIcon,
  QrCodeScanner as QrCodeIcon,
  Receipt as ReceiptIcon,
  Print as PrintIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RestartAlt as ResetIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';

// Define the custom theme
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
  },
});

export default function IndigencyTransactionLog() {
  const apiBase = 'http://localhost:5000';
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [transactionSearch, setTransactionSearch] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0.75);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const { getToken } = useAuth();

  const getAuthHeaders = () => {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // formatting helpers
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

  function generateTransactionNumber() {
    const date = new Date();
    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `IND-${yy}${mm}${dd}-${rand}`;
  }

  function storeCertificateData(cert) {
    if (!cert) return;
    const existing = JSON.parse(localStorage.getItem("certificates") || "{}");
    const key = cert.indigency_id || `draft-${cert.transaction_number || "no-txn"}`;
    existing[key] = cert;
    localStorage.setItem("certificates", JSON.stringify(existing));
  }

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
    try {
      // Load all records including historical ones for complete transaction log
      const res = await fetch(`${apiBase}/indigency/transactions/all`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setRecords(
        Array.isArray(data)
          ? data.map((r) => ({
              indigency_id: r.indigency_id,
              resident_id: r.resident_id,
              full_name: r.full_name,
              address: r.address,
              dob: r.dob ? r.dob.split("T")[0] : "",
              age: String(r.age ?? ""),
              provincial_address: r.provincial_address || "",
              contact_no: r.contact_no || "",
              civil_status: r.civil_status,
              remarks: r.remarks,
              request_reason: r.request_reason,
              date_issued: r.date_issued ? r.date_issued.split("T")[0] : "",
              transaction_number: r.transaction_number || generateTransactionNumber(),
              is_active: r.is_active ?? 1,
              date_created: r.date_created,
            }))
          : []
      );
    } catch (e) {
      console.error("Failed to load indigency records", e);
    }
  }

  const display = useMemo(() => {
    return selectedRecord || null;
  }, [selectedRecord]);

  // Generate QR code
  useEffect(() => {
    const generateQRCode = async () => {
      if (display && (display.indigency_id || display.full_name)) {
        storeCertificateData(display);
        const verificationUrl = `${window.location.origin}/verify-certificate?id=${display.indigency_id || 'draft'}`;
        const qrContent = `CERTIFICATE VERIFICATION:
                𝗧𝗿𝗮𝗻𝘀𝗮𝗰𝘁𝗶𝗼𝗻 𝗡𝗼: ${display.transaction_number || 'N/A'}
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

  // Filter records by transaction number
  const transactionFilteredRecords = useMemo(
    () =>
      records.filter((r) =>
        r.transaction_number
          .toLowerCase()
          .includes(transactionSearch.toLowerCase())
      ),
    [records, transactionSearch]
  );

  function handleView(record) {
    setSelectedRecord(record);
    setViewDialogOpen(true);
  }

  // Generate PDF function
  async function generatePDF() {
    if (!display || !display.indigency_id) {
      alert('Please select a record first before downloading PDF');
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

      const fileName = `Indigency_Certificate_${display.indigency_id}_${display.full_name.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  }

  function handlePrint() {
    if (!display || !display.indigency_id) {
      alert('Please select a record first before printing');
      return;
    }

    const certificateElement = document.getElementById('certificate-preview');
    if (!certificateElement) {
      alert('Certificate not found for printing.');
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.top = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Certificate</title>
          <style>
            @page { size: 8.5in 11in; margin: 0; }
            body { margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
            #certificate-preview { width: 8.5in; height: 11in; position: relative; overflow: hidden; background: white; box-sizing: border-box; }
            #certificate-preview * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
          </style>
        </head>
        <body>
          ${certificateElement.outerHTML}
        </body>
      </html>
    `);
    iframeDoc.close();

    setTimeout(() => {
      const iframeWindow = iframe.contentWindow || iframe;
      iframeWindow.focus();
      iframeWindow.print();

      window.onafterprint = () => {
        document.body.removeChild(iframe);
      };
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 250);
  }

  const handleQrCodeClick = () => {
    if (display && display.indigency_id) {
      const verificationUrl = `${window.location.origin}/verify-certificate?id=${display.indigency_id}`;
      window.open(verificationUrl, '_blank');
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.3));
  };

  const handleResetZoom = () => {
    setZoomLevel(0.75);
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
                  Indigency Transaction Log
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  View all transaction history for Certificate of Indigency
                </Typography>
              </Box>
            </Box>
            
            <Badge badgeContent={records.length} color="secondary">
              <Chip 
                icon={<FolderIcon />}
                label="Total Transactions" 
                sx={{ 
                  bgcolor: "rgba(255,255,255,0.2)", 
                  color: "white",
                  fontWeight: 600
                }} 
              />
            </Badge>
          </Box>
        </Paper>

        {/* MAIN CONTENT AREA */}
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* LEFT: Transaction List */}
          <Box sx={{ 
            width: { xs: '100%', md: '40%' }, 
            bgcolor: "background.paper", 
            borderRight: { xs: 0, md: 1 }, 
            borderColor: "divider",
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <Paper elevation={0} sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <ReceiptIcon color="primary" />
                Transaction Search
              </Typography>
              <TextField 
                fullWidth 
                size="small" 
                placeholder="Enter transaction number" 
                value={transactionSearch} 
                onChange={(e) => setTransactionSearch(e.target.value)} 
                InputProps={{ 
                  startAdornment: (
                    <InputAdornment position="start">
                      <ReceiptIcon />
                    </InputAdornment>
                  ) 
                }} 
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                Format: IND-YYMMDD-XXX
              </Typography>
            </Paper>

            <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
              {transactionFilteredRecords.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
                  <ReceiptIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                  <Typography variant="h6" gutterBottom>
                    No transactions found
                  </Typography>
                  <Typography variant="body2">
                    {transactionSearch ? "Try a different transaction number" : "Enter a transaction number to search"}
                  </Typography>
                </Paper>
              ) : (
                <Stack spacing={2}>
                  {transactionFilteredRecords.map((r) => (
                    <Card key={r.indigency_id} sx={{ 
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      borderLeft: 4,
                      borderColor: selectedRecord?.indigency_id === r.indigency_id ? "primary.main" : "secondary.main",
                      bgcolor: selectedRecord?.indigency_id === r.indigency_id ? "action.selected" : "background.paper",
                    }}
                    onClick={() => handleView(r)}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, color: "#000000" }}>
                              {r.full_name}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
                              <Chip 
                                label={r.transaction_number} 
                                size="small" 
                                color="secondary" 
                                variant="outlined" 
                              />
                              {r.is_active === 0 && (
                                <Chip 
                                  label="Inactive" 
                                  size="small" 
                                  color="error" 
                                  variant="outlined" 
                                />
                              )}
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              {r.address}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Issued: {formatDateDisplay(r.date_issued)}
                            </Typography>
                            {r.date_created && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                                Created: {formatDateTimeDisplay(r.date_created)}
                              </Typography>
                            )}
                          </Box>
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            <Tooltip title="View">
                              <span>
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => { e.stopPropagation(); handleView(r); }} 
                                  color="primary"
                                >
                                  <EyeIcon />
                                </IconButton>
                              </span>
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

          {/* RIGHT: Certificate Preview */}
          {selectedRecord && (
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto', 
              display: 'flex', 
              flexDirection: 'column', 
              bgcolor: 'background.default',
              p: 2,
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
                        disabled={!display?.indigency_id || isGeneratingPDF} 
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
                        disabled={!display?.indigency_id}
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
                    {/* Certificate content - same as Indigency.jsx */}
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
                          background: theme.palette.success.main,
                          color: '#fff',
                          padding: '4px 70px',
                          borderRadius: '8px',
                          position: 'relative',
                          boxShadow: '5px 5px 0 #d8d5d5ff',
                          WebkitPrintColorAdjust: 'exact',
                          printColorAdjust: 'exact',
                          colorAdjust: 'exact',
                        }}
                      >
                        Barangay Indigency
                      </span>
                    </div>

                    <div
                      style={{
                        position: 'absolute',
                        whiteSpace: 'pre',
                        top: '320px',
                        right: '80px',
                        fontFamily: '"Times New Roman", serif',
                        fontSize: '12pt',
                        fontWeight: 'bold',
                        color: 'red',
                      }}
                    >
                      Date:{' '}
                      {display?.date_issued
                        ? formatDateDisplay(display.date_issued)
                        : ''}
                    </div>

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
                        This is to certify that the person whose name and thumb
                        print appear hereon has requested a{' '}
                        <i> Barangay Indigency</i> from this office and the result/s
                        is/are listed below and valid for six (6) months only.
                      </p>
                    </div>

                    <div
                      style={{
                        position: 'absolute',
                        whiteSpace: 'pre',
                        top: '470px',
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
                            color: 'red',
                            fontWeight: 'bold',
                            fontFamily: '"Times New Roman", serif',
                          }}
                        >
                          Name:
                        </span>{' '}
                        <span style={{ color: 'black', marginLeft: '10px' }}>
                          {display?.full_name || ''}
                        </span>
                        <br />
                        <span
                          style={{
                            color: 'red',
                            fontWeight: 'bold',
                            fontFamily: '"Times New Roman", serif',
                          }}
                        >
                          Address:
                        </span>{' '}
                        <span style={{ color: 'black', marginLeft: '10px' }}>
                          {display?.address || ''}
                        </span>
                        <br />
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '640px',
                          }}
                        >
                          <div style={{ width: '420px' }}>
                            <span
                              style={{
                                color: 'red',
                                fontWeight: 'bold',
                                fontFamily: '"Times New Roman", serif',
                              }}
                            >
                              Birthday:
                            </span>{' '}
                            <span style={{ color: 'black', marginLeft: '10px' }}>
                              {display?.dob ? formatDateDisplay(display.dob) : ''}
                            </span>
                          </div>
                          <div style={{ width: '500px', textAlign: 'left' }}>
                            <span
                              style={{
                                color: 'red',
                                fontWeight: 'bold',
                                fontFamily: '"Times New Roman", serif',
                              }}
                            >
                              Age:
                            </span>{' '}
                            <span style={{ color: 'black', marginLeft: '10px' }}>
                              {display?.age || ''}
                            </span>
                          </div>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            width: '640px',
                          }}
                        >
                          <div
                            style={{
                              width: '420px',
                              overflowWrap: 'break-word',
                              wordBreak: 'break-word',
                              whiteSpace: 'normal',
                            }}
                          >
                            <span
                              style={{
                                color: 'red',
                                fontWeight: 'bold',
                                fontFamily: '"Times New Roman", serif',
                              }}
                            >
                              Provincial Address:
                            </span>{' '}
                            <span
                              style={{
                                color: 'black',
                                marginLeft: '10px',
                              }}
                            >
                              {display?.provincial_address || ''}
                            </span>
                          </div>

                          <div
                            style={{
                              width: '400px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              marginRight: '95px',
                            }}
                          >
                            <span
                              style={{
                                color: 'red',
                                fontWeight: 'bold',
                                fontFamily: '"Times New Roman", serif',
                              }}
                            >
                              Contact No.
                            </span>{' '}
                            <span style={{ color: 'black', marginLeft: '10px' }}>
                              {display?.contact_no || ''}
                            </span>
                          </div>
                        </div>
                        <span
                          style={{
                            color: 'red',
                            fontWeight: 'bold',
                            fontFamily: '"Times New Roman", serif',
                          }}
                        >
                          Civil Status:
                        </span>{' '}
                        <span style={{ color: 'black', marginLeft: '10px' }}>
                          {display?.civil_status || ''}
                        </span>
                        <br />
                        <span
                          style={{
                            color: 'red',
                            fontWeight: 'bold',
                            fontFamily: '"Times New Roman", serif',
                          }}
                        >
                          Remarks:
                        </span>{' '}
                        <span
                          style={{
                            color: 'black',
                            fontWeight: 'bold',
                            fontFamily: '"Times New Roman", serif',
                          }}
                        >
                          {display?.remarks || ''}
                        </span>{' '}
                        <br />
                        <span
                          style={{
                            color: 'red',
                            fontWeight: 'bold',
                            fontFamily: '"Times New Roman", serif',
                          }}
                        >
                          This certification is being issued upon request for
                        </span>{' '}
                        <span style={{ color: 'black' }}>
                          {display?.request_reason || ''}
                        </span>
                      </div>
                    </div>

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
                            {display?.date_created
                              ? formatDateTimeDisplay(display.date_created)
                              : new Date().toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        position: 'absolute',
                        top: '900px',
                        right: '100px',
                        width: '300px',
                        textAlign: 'center',
                      }}
                    >
                      <div
                        style={{
                          borderTop: '2.5px solid #000',
                          width: '90%',
                          margin: 'auto',
                        }}
                      ></div>
                      <img
                        src={WordName}
                        alt="Arnold Dondonayos"
                        style={{
                          position: 'absolute',
                          right: '20px',
                          width: '250px',
                          bottom: '33px',
                        }}
                      />

                      <div
                        style={{
                          fontFamily: '"Brush Script MT", cursive',
                          fontSize: '20pt',
                          color: '#000',
                          marginTop: '-2px',
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
                      transform: none !important;
                    }
                    @page {
                      size: portrait;
                      margin: 0;
                    }
                    #certificate-preview * {
                      -webkit-print-color-adjust: exact !important;
                      print-color-adjust: exact !important;
                      color-adjust: exact !important;
                    }
                  }
                `}
              </style>
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}


import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
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
  Modal,
  Avatar,
  Fab,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  CardActions,
  Badge,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import {
  Save as SaveIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as FileTextIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  Favorite as HeartIcon,
  CalendarToday as CalendarIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Add as AddIcon,
  Favorite,
  Badge as BadgeIcon,
  Print as PrintIcon,
  CameraAlt as CameraIcon,
} from "@mui/icons-material";
import Logo145 from "../assets/Logo145.png";
import { EyeIcon } from "lucide-react";

export default function Residents() {
  const apiBase = "http://localhost:5000";
  const { getToken } = useAuth();

  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCivilStatus, setFilterCivilStatus] = useState("all");
  const [filterHasContact, setFilterHasContact] = useState("all");
  const [isPrinting, setIsPrinting] = useState(false);

  const [selectedResidentForID, setSelectedResidentForID] = useState(null);

  const [formData, setFormData] = useState({
    full_name: "",
    address: "",
    provincial_address: "",
    dob: "",
    age: "",
    civil_status: "Single",
    contact_no: "",
    gender: "Male",
    sss_no: "",
    tin_no: "",
    expiration_date: "01/20/2027",
    emergency_name: "",
    emergency_address: "",
    emergency_phone: "",
    id_no: "",
    date_issued: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString().split("T")[0],
    photo: null,
  });

  const civilStatusOptions = [
    "Single",
    "Married",
    "Widowed",
    "Divorced",
    "Separated",
  ];

  const getAuthHeaders = () => {
    const token = getToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
    try {
      const res = await fetch(`${apiBase}/residents`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      setRecords(
        Array.isArray(data)
          ? data.map((r) => ({
              resident_id: r.resident_id,
              full_name: r.full_name,
              address: r.address,
              provincial_address: r.provincial_address,
              dob: r.dob?.slice(0, 10) || "",
              age: String(r.age ?? ""),
              civil_status: r.civil_status,
              contact_no: r.contact_no || "",
              gender: r.gender || "Male",
              sss_no: r.sss_no || "",
              tin_no: r.tin_no || "",
              expiration_date: r.expiration_date || "01/20/2027",
              emergency_name: r.emergency_name || "",
              emergency_address: r.emergency_address || "",
              emergency_phone: r.emergency_phone || "",
              id_no: r.id_no || "",
              date_issued:
                r.date_issued || new Date().toISOString().split("T")[0],
              created_at: r.created_at?.slice(0, 10) || "",
              photo: r.photo || null,
            }))
          : [],
      );
    } catch (e) {
      console.error(e);
    }
  }

  function handleDobChange(dob) {
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      const age = Math.floor(
        (today - birthDate) / (365.25 * 24 * 60 * 60 * 1000),
      );
      setFormData({ ...formData, dob, age: String(age) });
    } else {
      setFormData({ ...formData, dob: "", age: "" });
    }
  }

  function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, etc).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, photo: reader.result }));
    };
    reader.readAsDataURL(file);
  }

  function toServerPayload(data) {
    return {
      full_name: data.full_name.trim(),
      address: data.address.trim(),
      provincial_address: data.provincial_address.trim(),
      dob: data.dob || null,
      age: data.age ? Number(data.age) : null,
      civil_status: data.civil_status,
      contact_no: data.contact_no.trim() || null,
      gender: data.gender,
      sss_no: data.sss_no.trim(),
      tin_no: data.tin_no.trim(),
      expiration_date: data.expiration_date,
      emergency_name: data.emergency_name.trim(),
      emergency_address: data.emergency_address.trim(),
      emergency_phone: data.emergency_phone.trim(),
      id_no: data.id_no.trim(),
      date_issued: data.date_issued,
      created_at: data.created_at || new Date().toISOString().split("T")[0],
      photo: data.photo,
    };
  }

  function validateForm() {
    const requiredFields = ["full_name", "address", "dob", "civil_status"];
    for (let field of requiredFields) {
      if (!formData[field].trim()) {
        alert("Please fill all required fields.");
        return false;
      }
    }
    const isDuplicate = records.some(
      (r) =>
        r.full_name.trim().toLowerCase() ===
          formData.full_name.trim().toLowerCase() &&
        r.dob === formData.dob &&
        r.resident_id !== editingId,
    );
    if (isDuplicate) {
      alert("Resident already exists (same name and date of birth).");
      return false;
    }
    return true;
  }

  async function handleCreate() {
    if (!validateForm()) return;
    try {
      const res = await fetch(`${apiBase}/residents`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(toServerPayload(formData)),
      });
      if (!res.ok) throw new Error("Create failed");
      const created = await res.json();
      const newRec = { ...formData, resident_id: created.resident_id };
      setRecords([newRec, ...records]);
      resetForm();
      alert("Resident added successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to create record");
    }
  }

  async function handleUpdate() {
    if (!validateForm()) return;
    try {
      const res = await fetch(`${apiBase}/residents/${editingId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(toServerPayload(formData)),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = { ...formData, resident_id: editingId };
      setRecords(
        records.map((r) => (r.resident_id === editingId ? updated : r)),
      );
      resetForm();
      alert("Resident updated successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to update record");
    }
  }

  function handleEdit(record) {
    setFormData({
      ...record,
      gender: record.gender || "Male",
      sss_no: record.sss_no || "",
      tin_no: record.tin_no || "",
      expiration_date: record.expiration_date || "01/20/2027",
      emergency_name: record.emergency_name || "",
      emergency_address: record.emergency_address || "",
      emergency_phone: record.emergency_phone || "",
      id_no: record.id_no || "",
      date_issued: record.date_issued || new Date().toISOString().split("T")[0],
    });
    setEditingId(record.resident_id);
    setIsModalOpen(true);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this resident?")) return;
    try {
      const res = await fetch(`${apiBase}/residents/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Delete failed");
      setRecords(records.filter((r) => r.resident_id !== id));
      alert("Resident deleted successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to delete resident");
    }
  }

  function resetForm() {
    setFormData({
      full_name: "",
      address: "",
      provincial_address: "",
      dob: "",
      age: "",
      civil_status: "Single",
      contact_no: "",
      gender: "Male",
      sss_no: "",
      tin_no: "",
      expiration_date: "01/20/2027",
      emergency_name: "",
      emergency_address: "",
      emergency_phone: "",
      id_no: "",
      date_issued: new Date().toISOString().split("T")[0],
      created_at: new Date().toISOString().split("T")[0],
      photo: null,
    });
    setEditingId(null);
    setIsModalOpen(false);
  }

  function handleSubmit() {
    if (editingId) handleUpdate();
    else handleCreate();
  }

  const filteredRecords = useMemo(
    () =>
      records.filter((r) => {
        const matchesSearch =
          r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.contact_no || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCivilStatus =
          filterCivilStatus === "all" ||
          (r.civil_status || "").toLowerCase() ===
            filterCivilStatus.toLowerCase();
        const matchesContact =
          filterHasContact === "all" ||
          (filterHasContact === "with" ? !!r.contact_no : !r.contact_no);
        return matchesSearch && matchesCivilStatus && matchesContact;
      }),
    [records, searchTerm, filterCivilStatus, filterHasContact],
  );

  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatDateShort(dateString) {
    if (!dateString) return "MM/DD/YYYY";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  }

  return (
    <>
      <style>{`
  @page {
    size: auto;
    margin: 0;
  }

  @media print {
    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden !important;
      background: white;
    }

    /* Hide everything */
    body * {
      visibility: hidden;
    }

    /* Show only printable area */
    .printable-area, 
    .printable-area * {
      visibility: visible;
    }

   .printable-area {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw !important;
  height: 100vh !important;

  display: flex !important;
  flex-direction: row !important;
  justify-content: center !important;
  align-items: center !important;

  gap: 0 !important;   /* 🔥 no space */
  overflow: hidden !important;

  page-break-after: avoid !important;
  break-after: avoid !important;
}


.printable-area > div {
  margin: 0 !important;
  padding: 0 !important;
  page-break-inside: avoid !important;
  break-inside: avoid !important;
}


    .no-print {
      display: none !important;
    }

    /* Print colors exactly */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
`}</style>

      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          bgcolor: "transparent",
          p: 2,
        }}
      >
        <Container maxWidth="xl" className="no-print">
          <Paper
            elevation={2}
            sx={{ borderRadius: 3, overflow: "hidden", mb: 3 }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 3,
                bgcolor: "#0D4715",
                color: "white",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "#F1F0E9",
                    color: "#0D4715",
                    width: 46,
                    height: 46,
                  }}
                >
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    sx={{
                      lineHeight: 1.2,
                      fontSize: { xs: 24, sm: 28, md: 32 },
                    }}
                  >
                    Residents Information
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Manage and monitor resident records and profiles
                  </Typography>
                </Box>
              </Box>
              <Badge
                badgeContent={records.length}
                color="secondary"
                sx={{
                  "& .MuiBadge-badge": {
                    bgcolor: "#E9762B",
                    color: "#FFFFFF",
                    fontWeight: 700,
                  },
                }}
              >
                <Chip
                  icon={<PersonIcon />}
                  label="Total Residents"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    fontWeight: 600,
                    "& .MuiChip-icon": {
                      color: "#FFFFFF",
                    },
                  }}
                />
              </Badge>
            </Box>
            <Box
              sx={{
                height: "4px",
                background:
                  "linear-gradient(90deg, #0D4715 0%, #1a5f2e 50%, #E9762B 100%)",
                width: "100%",
              }}
            />
          </Paper>

          <Paper
            elevation={2}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
            }}
          >
            <Stack spacing={2}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: 2,
                }}
              >
                <TextField
                  sx={{ flex: 1 }}
                  size="small"
                  placeholder="Search by name, address, or contact number"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "grey.400" }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Showing {filteredRecords.length} of {records.length}
                  </Typography>
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(e, newMode) => newMode && setViewMode(newMode)}
                    aria-label="view mode"
                    size="small"
                  >
                    <ToggleButton value="grid" aria-label="grid view">
                      <ViewModuleIcon fontSize="small" />
                    </ToggleButton>
                    <ToggleButton value="list" aria-label="list view">
                      <ViewListIcon fontSize="small" />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: 2,
                }}
              >
                <FormControl fullWidth size="small">
                  <InputLabel>Civil Status</InputLabel>
                  <Select
                    value={filterCivilStatus}
                    label="Civil Status"
                    onChange={(e) => setFilterCivilStatus(e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    {civilStatusOptions.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel>Contact</InputLabel>
                  <Select
                    value={filterHasContact}
                    label="Contact"
                    onChange={(e) => setFilterHasContact(e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="with">With contact</MenuItem>
                    <MenuItem value="without">Without contact</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Stack>
          </Paper>

          {filteredRecords.length === 0 ? (
            <Paper
              sx={{
                p: 5,
                textAlign: "center",
                borderRadius: 3,
                bgcolor: "white",
              }}
            >
              <Typography variant="h6" color="textSecondary">
                {searchTerm ? "No residents found" : "No records yet"}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Click the + button to add a new resident
              </Typography>
            </Paper>
          ) : viewMode === "grid" ? (
            <Grid container spacing={3.5}>
              {filteredRecords.map((record) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={record.resident_id}
                >
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      p: 1.5,
                      width: "100%",
                      borderRadius: 3,
                      border: "1px solid rgba(13, 71, 21, 0.12)",
                      boxShadow: "0 10px 28px rgba(13, 71, 21, 0.12)",
                      backgroundColor: "#FFFFFF",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 14px 34px rgba(13, 71, 21, 0.18)",
                      },
                    }}
                  >
                    <CardHeader
                      avatar={
                        <Avatar
                          src={record.photo}
                          sx={{
                            bgcolor: "#0D4715",
                            color: "#F1F0E9",
                            fontWeight: 700,
                          }}
                        >
                          <PersonIcon />
                        </Avatar>
                      }
                      title={record.full_name}
                      subheader={`Age: ${record.age}`}
                      titleTypographyProps={{
                        fontWeight: 700,
                        color: "#0D4715",
                      }}
                      subheaderTypographyProps={{
                        color: "#41644A",
                        fontWeight: 500,
                      }}
                    />
                    <Divider />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Stack spacing={1.25}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            backgroundColor: "rgba(65, 100, 74, 0.06)",
                            borderRadius: 2,
                            p: 1,
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 34,
                              height: 34,
                              bgcolor: "#F1F0E9",
                              color: "#0D4715",
                              fontSize: 18,
                            }}
                          >
                            <HomeIcon fontSize="inherit" />
                          </Avatar>
                          <Box sx={{ maxWidth: "200px" }}>
                            <Typography
                              variant="caption"
                              sx={{ color: "#0D4715" }}
                            >
                              Address
                            </Typography>
                            <Typography variant="body2">
                              {record.address}
                            </Typography>
                          </Box>
                        </Box>

                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: "#F1F0E9",
                              color: "#0D4715",
                              fontSize: 18,
                            }}
                          >
                            <CakeIcon fontSize="inherit" />
                          </Avatar>
                          <Typography variant="body2">
                            {formatDate(record.dob)} ({record.age} years old)
                          </Typography>
                        </Box>

                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: "#E9762B22",
                              color: "#E9762B",
                              fontSize: 18,
                            }}
                          >
                            <HeartIcon fontSize="inherit" />
                          </Avatar>
                          <Typography variant="body2">
                            {record.civil_status}
                          </Typography>
                        </Box>

                        {record.contact_no && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: "#F1F0E9",
                                color: "#0D4715",
                                fontSize: 18,
                              }}
                            >
                              <PhoneIcon fontSize="inherit" />
                            </Avatar>
                            <Typography variant="body2">
                              {record.contact_no}
                            </Typography>
                          </Box>
                        )}

                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: "#F1F0E9",
                              color: "#0D4715",
                              fontSize: 18,
                            }}
                          >
                            <CalendarIcon fontSize="inherit" />
                          </Avatar>
                          <Typography variant="body2">
                            Added: {formatDate(record.created_at)}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                    <CardActions
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        px: 1,
                      }}
                    >
                      {/* LEFT — ID CARD */}
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<BadgeIcon />}
                        onClick={() => setSelectedResidentForID(record)}
                        sx={{
                          bgcolor: "#0D4715",
                          fontSize: "11px",
                          px: 1.5,
                          py: 0.5,
                          minWidth: "auto",
                          "&:hover": { bgcolor: "#042108" },
                        }}
                      >
                        ID CARD
                      </Button>

                      {/* RIGHT — Edit & Delete */}
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(record)}
                          title="Edit Information"
                          sx={{ color: "#0D4715" }}
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          size="small"
                          onClick={() => handleDelete(record.resident_id)}
                          title="Remove Information"
                          sx={{ color: "#E9762B" }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Stack direction="column" spacing={2.5} sx={{ width: "100%" }}>
              {filteredRecords.map((record) => (
                <Paper
                  key={record.resident_id}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: "1px solid rgba(0,0,0,0.08)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    cursor: "pointer",
                    "&:hover": {
                      boxShadow: "0 10px 30px rgba(233, 118, 43, 0.4)",
                      borderColor: "rgba(233, 118, 43, 0.4)",
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <ListItem
                    alignItems="flex-start"
                    sx={{ p: 0 }}
                    secondaryAction={
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          edge="end"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedResidentForID(record);
                          }}
                          title="View ID Card"
                          sx={{ color: "#1976D2" }}
                        >
                          <BadgeIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(record);
                          }}
                          sx={{ color: "#0D4715" }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(record.resident_id);
                          }}
                          sx={{ color: "#E9762B" }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    }
                    disablePadding
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={record.photo}
                        sx={{
                          bgcolor: "#0D4715",
                          color: "#F1F0E9",
                          width: 48,
                          height: 48,
                          fontWeight: 700,
                        }}
                      >
                        {record.full_name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>

                    <ListItemText
                      primary={
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, color: "#0D4715" }}
                        >
                          {record.full_name}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Stack direction="row" spacing={3} flexWrap="wrap">
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <HomeIcon
                                sx={{ fontSize: 16, color: "#41644A" }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {record.address}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <CakeIcon
                                sx={{ fontSize: 16, color: "#41644A" }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {record.age} years old
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <HeartIcon
                                sx={{ fontSize: 16, color: "#E9762B" }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {record.civil_status}
                              </Typography>
                            </Box>

                            {record.contact_no && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <PhoneIcon
                                  sx={{ fontSize: 16, color: "#41644A" }}
                                />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {record.contact_no}
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </Box>
                      }
                    />
                  </ListItem>
                </Paper>
              ))}
            </Stack>
          )}

          <Fab
            color="primary"
            aria-label="add"
            sx={{
              position: "fixed",
              bottom: 100,
              right: 16,
              bgcolor: "#445C3C",
              "&:hover": {
                bgcolor: "#2e3d28",
              },
            }}
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
          >
            <AddIcon />
          </Fab>

          {/* Modal for Form */}
          <Modal
            open={isModalOpen}
            onClose={() => {}}
            aria-labelledby="resident-form-modal"
            aria-describedby="form-to-add-or-edit-resident"
            disableBackdropClick
          >
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: { xs: "92%", sm: "75%", md: "60%" },
                maxHeight: "90vh",
                overflow: "auto",
                bgcolor: "#FDFCF9",
                boxShadow: "0 18px 44px rgba(13, 71, 21, 0.25)",
                borderRadius: 3,
                border: "1px solid rgba(13, 71, 21, 0.12)",
                p: 0,
              }}
            >
              <Box
                sx={{
                  p: 3,
                  background:
                    "linear-gradient(180deg, #0D4715 0%, #1a5f2e 40%, #0D2818 100%)",
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                  color: "#F1F0E9",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: "#F1F0E9",
                    color: "#0D4715",
                    width: 46,
                    height: 46,
                  }}
                >
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{ fontWeight: 700, lineHeight: 1.2 }}
                  >
                    {editingId ? "Edit Resident Record" : "New Resident Record"}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Please fill in resident details below
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ p: { xs: 3, sm: 4 } }}>
                <Stack spacing={2}>
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mb: 1 }}
                  >
                    <input
                      accept="image/*"
                      style={{ display: "none" }}
                      id="icon-button-file"
                      type="file"
                      onChange={handlePhotoUpload}
                    />
                    <label htmlFor="icon-button-file">
                      <Avatar
                        src={formData.photo}
                        sx={{
                          width: 80,
                          height: 80,
                          cursor: "pointer",
                          bgcolor: "#e0e0e0",
                          border: "2px dashed #0D4715",
                          "&:hover": { bgcolor: "#d5d5d5" },
                        }}
                      >
                        <CameraIcon sx={{ fontSize: 40, color: "#757575" }} />
                      </Avatar>
                    </label>
                  </Box>
                  <Typography
                    variant="caption"
                    align="center"
                    display="block"
                    color="textSecondary"
                    sx={{ mb: 2 }}
                  >
                    Click avatar to upload photo
                  </Typography>

                  <TextField
                    label="Full Name *"
                    size="small"
                    fullWidth
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Address *"
                    size="small"
                    fullWidth
                    multiline
                    rows={2}
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <HomeIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Date of Birth *"
                        type="date"
                        size="small"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={formData.dob}
                        onChange={(e) => handleDobChange(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CakeIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        label="Age"
                        size="small"
                        fullWidth
                        value={formData.age}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Gender</InputLabel>
                        <Select
                          value={formData.gender}
                          label="Gender"
                          onChange={(e) =>
                            setFormData({ ...formData, gender: e.target.value })
                          }
                        >
                          <MenuItem value="Male">Male</MenuItem>
                          <MenuItem value="Female">Female</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  <FormControl fullWidth size="small">
                    <InputLabel>Civil Status *</InputLabel>
                    <Select
                      value={formData.civil_status}
                      label="Civil Status *"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          civil_status: e.target.value,
                        })
                      }
                      startAdornment={
                        <InputAdornment position="start">
                          <HeartIcon fontSize="small" />
                        </InputAdornment>
                      }
                    >
                      {civilStatusOptions.map((status) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Contact Number"
                    size="small"
                    fullWidth
                    value={formData.contact_no}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_no: e.target.value })
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Provincial Address"
                    size="small"
                    fullWidth
                    value={formData.provincial_address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        provincial_address: e.target.value,
                      })
                    }
                  />

                  <Divider sx={{ my: 1 }}>ID Card Information</Divider>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="ID No."
                        size="small"
                        fullWidth
                        value={formData.id_no}
                        onChange={(e) =>
                          setFormData({ ...formData, id_no: e.target.value })
                        }
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Date Issued"
                        type="date"
                        size="small"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={formData.date_issued}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            date_issued: e.target.value,
                          })
                        }
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="SSS No"
                        size="small"
                        fullWidth
                        value={formData.sss_no}
                        onChange={(e) =>
                          setFormData({ ...formData, sss_no: e.target.value })
                        }
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="TIN No"
                        size="small"
                        fullWidth
                        value={formData.tin_no}
                        onChange={(e) =>
                          setFormData({ ...formData, tin_no: e.target.value })
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Expiration Date"
                        type="date"
                        size="small"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={formData.expiration_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            expiration_date: e.target.value,
                          })
                        }
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 1 }}>Emergency Contact</Divider>

                  <TextField
                    label="Contact Name"
                    size="small"
                    fullWidth
                    value={formData.emergency_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergency_name: e.target.value,
                      })
                    }
                  />
                  <TextField
                    label="Contact Address"
                    size="small"
                    fullWidth
                    multiline
                    rows={2}
                    value={formData.emergency_address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergency_address: e.target.value,
                      })
                    }
                  />
                  <TextField
                    label="Contact Phone"
                    size="small"
                    fullWidth
                    value={formData.emergency_phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergency_phone: e.target.value,
                      })
                    }
                  />

                  <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      fullWidth
                      sx={{
                        background:
                          "linear-gradient(135deg, #0D4715 0%, #1a5f2e 100%)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #1a5f2e 0%, #0D4715 100%)",
                        },
                      }}
                      onClick={handleSubmit}
                    >
                      {editingId ? "Update" : "Save"}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CloseIcon />}
                      sx={{
                        color: "#0D4715",
                        borderColor: "rgba(13, 71, 21, 0.4)",
                        "&:hover": {
                          borderColor: "#0D4715",
                          backgroundColor: "rgba(13, 71, 21, 0.06)",
                        },
                      }}
                      onClick={resetForm}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Stack>
              </Box>
            </Box>
          </Modal>

          {/* ID CARD PREVIEW MODAL */}
          {selectedResidentForID && (
            <Dialog
              open={true}
              onClose={() => setSelectedResidentForID(null)}
              maxWidth="xl"
              fullWidth
              scroll="body"
              PaperProps={{
                sx: {
                  bgcolor: "transparent",
                  boxShadow: "none",
                  overflow: "visible",
                },
              }}
            >
              <DialogContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  py: 5,
                  p: 0,
                  position: "relative",
                }}
              >
                {/* ID Cards Container - Centered */}
                <Box
                  className="printable-area"
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 2,
                    flex: 1,
                  }}
                >
                  {/* FRONT SIDE */}
                  <Box
                    sx={{
                      width: "207px",
                      height: "340px",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        width: "240px",
                        height: "360px",
                        transform: "scale(0.85)",
                        transformOrigin: "top left",
                        bgcolor: "#9ACD32",
                        background:
                          "linear-gradient(180deg, #ffffff 0%, #a8e063 100%)",
                        border: "2px solid #000",
                        borderRadius: 0,
                        overflow: "hidden",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        flexShrink: 0,
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          top: "8px",
                          left: "8px",
                          right: "8px",
                          bottom: "8px",
                          border: "2px solid #000",
                          pointerEvents: "none",
                          zIndex: 10,
                        }}
                      />

                      <Box
                        sx={{
                          height: "85px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          px: 1,
                          pt: 2,
                          position: "relative",
                        }}
                      >
                        {/* Left Seal - Logo145 */}
                        <Box
                          sx={{
                            position: "absolute",
                            top: 15,
                            left: 10,
                            width: "45px",
                            height: "45px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            p: 0.5,
                          }}
                        >
                          <img
                            src={Logo145}
                            alt="Logo145"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                            }}
                          />
                        </Box>

                        {/* Right Seal - Caloocan Logo */}
                        <Box
                          sx={{
                            position: "absolute",
                            top: 15,
                            right: 10,
                            width: "45px",
                            height: "45px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            p: 0.5,
                          }}
                        >
                          <img
                            src="/CaloocanLogo.png"
                            alt="Caloocan"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                            }}
                          />
                        </Box>

                        <Typography
                          sx={{
                            fontSize: "10px",
                            fontWeight: 700,
                            color: "#000",
                            mt: 0.5,
                            fontFamily: "TimesNewRomans",
                          }}
                        >
                          Republic of the Philippines
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "10px",
                            fontWeight: 700,
                            lineHeight: 1.1,
                            color: "#000",
                            textAlign: "center",
                            letterSpacing: "-.8px",
                          }}
                        >
                          Barangay 145 Bagong Barrio
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "9px",
                            fontWeight: 900,
                            color: "#000",
                            letterSpacing: "-1.1px",
                          }}
                        >
                          CALOOCAN CITY
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          width: "100%",
                          height: "120px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Box
                          sx={{
                            width: "100px",
                            height: "100px",
                            border: "2px solid #000",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            bgcolor: "#fff",
                          }}
                        >
                          {selectedResidentForID?.photo ? (
                            <img
                              src={selectedResidentForID.photo}
                              alt="Resident"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <PersonIcon sx={{ fontSize: 60, color: "#ccc" }} />
                          )}
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          px: 2,
                          py: 1,
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              sx={{
                                fontSize: "8px",
                                fontWeight: 700,
                                color: "#000",
                              }}
                            >
                              ID No:
                            </Typography>
                            <Box
                              sx={{
                                width: "60px",
                                borderBottom: "1px solid #000",
                                mt: 0.3,
                              }}
                            >
                              <Typography
                                sx={{ fontSize: "10px", fontWeight: 600 }}
                              >
                                {selectedResidentForID?.id_no || ""}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ flex: 1, textAlign: "right" }}>
                            <Typography
                              sx={{
                                fontSize: "8px",
                                fontWeight: 700,
                                color: "#000",
                              }}
                            >
                              Date Issue
                            </Typography>
                            <Box
                              sx={{
                                width: "60px",
                                borderBottom: "1px solid #000",
                                mt: 0.3,
                                ml: "auto",
                              }}
                            >
                              <Typography
                                sx={{ fontSize: "10px", fontWeight: 600 }}
                              >
                                {formatDateShort(
                                  selectedResidentForID?.date_issued,
                                )}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        <Box sx={{ mt: 1 }}>
                          <Box
                            sx={{
                              width: "100%",
                              borderBottom: "1px solid #000",
                              pb: 0.3,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: "11px",
                                fontWeight: 800,
                                textAlign: "center",
                                color: "#000",
                              }}
                            >
                              {selectedResidentForID?.full_name?.toUpperCase() ||
                                "JUAN DELA CRUZ"}
                            </Typography>
                          </Box>
                          <Typography
                            sx={{
                              fontSize: "9px",
                              fontWeight: 700,
                              textAlign: "center",
                              color: "#000",
                            }}
                          >
                            Name
                          </Typography>
                        </Box>

                        <Box sx={{ mt: 0.5 }}>
                          <Box
                            sx={{
                              width: "100%",
                              borderBottom: "1px solid #000",
                              pb: 0.3,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: "9.5px",
                                textAlign: "center",
                                color: "#000",
                                fontWeight: 700,
                              }}
                            >
                              {selectedResidentForID?.address ||
                                "Bagong Barrio, Caloocan City"}
                            </Typography>
                          </Box>
                          <Typography
                            sx={{
                              fontSize: "9px",
                              fontWeight: 700,
                              textAlign: "center",
                              color: "#000",
                            }}
                          >
                            Address
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          height: "55px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          pb: 2,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#000",
                            textTransform: "uppercase",
                            lineHeight: 1.1,
                          }}
                        >
                          ARNOLD L. DONDONAYOS
                        </Typography>
                        <Box
                          sx={{
                            width: "152px",
                            borderBottom: "1px solid #000",
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: "9px",
                            fontWeight: 600,
                            color: "#000",
                          }}
                        >
                          Barangay Captain
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* BACK SIDE */}
                  <Box
                    sx={{
                      width: "207px",
                      height: "340px",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        width: "240px",
                        height: "360px",
                        transform: "scale(0.85)",
                        transformOrigin: "top left",
                        background:
                          "linear-gradient(180deg, #a8e063 0%, #FF8C00 100%)",
                        border: "2px solid #000",
                        borderRadius: 0,
                        overflow: "hidden",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        flexShrink: 0,
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          top: "8px",
                          left: "8px",
                          right: "8px",
                          bottom: "8px",
                          border: "2px solid #000",
                          pointerEvents: "none",
                          zIndex: 10,
                        }}
                      />

                      <Box
                        sx={{
                          height: "50px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "18px",
                            fontWeight: 800,
                            color: "#FFFFFF",
                            letterSpacing: 1,
                            WebkitTextStroke: "1px black",
                          }}
                        >
                          BARANGAY ID
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          p: 1.5,
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <table
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            marginBottom: "4px",
                            fontSize: "8px",
                          }}
                        >
                          <thead>
                            <tr style={{ fontFamily: "Poppins, sans-serif" }}>
                              <th
                                style={{
                                  border: "1px solid #000",
                                  padding: "2px",
                                  fontSize: "7px",
                                  fontWeight: 700,
                                  textAlign: "center",
                                  background: "#FFFFFF",
                                }}
                              >
                                Date of Birth
                              </th>
                              <th
                                style={{
                                  border: "1px solid #000",
                                  padding: "2px",
                                  fontSize: "7px",
                                  fontWeight: 700,
                                  textAlign: "center",
                                  background: "#FFFFFF",
                                }}
                              >
                                Gender/ Age
                              </th>
                              <th
                                style={{
                                  border: "1px solid #000",
                                  padding: "2px",
                                  fontSize: "7px",
                                  fontWeight: 700,
                                  textAlign: "center",
                                  background: "#FFFFFF",
                                }}
                              >
                                Civil Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={{ fontFamily: "Poppins, sans-serif" }}>
                              <td
                                style={{
                                  background: "#FFFFFF",
                                  border: "1px solid #000",
                                  padding: "1px",
                                  fontSize: "8px",
                                  fontWeight: 600,
                                  textAlign: "center",
                                }}
                              >
                                {formatDateShort(selectedResidentForID?.dob)}
                              </td>
                              <td
                                style={{
                                  background: "#FFFFFF",
                                  border: "1px solid #000",
                                  padding: "1px",
                                  fontSize: "8px",
                                  fontWeight: 600,
                                  textAlign: "center",
                                }}
                              >
                                {selectedResidentForID?.gender?.charAt(0) ||
                                  "M"}{" "}
                                / {selectedResidentForID?.age || "30"}
                              </td>
                              <td
                                style={{
                                  background: "#FFFFFF",
                                  border: "1px solid #000",
                                  padding: "1px",
                                  fontSize: "8px",
                                  fontWeight: 600,
                                  textAlign: "center",
                                }}
                              >
                                {selectedResidentForID?.civil_status}
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <table
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            marginBottom: "4px",
                            fontSize: "8px",
                          }}
                        >
                          <thead>
                            <tr style={{ fontFamily: "Poppins, sans-serif" }}>
                              <th
                                style={{
                                  border: "1px solid #000",
                                  padding: "2px",
                                  fontSize: "7px",
                                  fontWeight: 700,
                                  textAlign: "center",
                                  background: "#FFFFFF",
                                }}
                              >
                                Place of Birth
                              </th>
                              <th
                                style={{
                                  border: "1px solid #000",
                                  padding: "2px",
                                  fontSize: "7px",
                                  fontWeight: 700,
                                  textAlign: "center",
                                  background: "#FFFFFF",
                                }}
                              >
                                Tel./ CP. #
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={{ fontFamily: "Poppins, sans-serif" }}>
                              <td
                                style={{
                                  background: "#FFFFFF",
                                  border: "1px solid #000",
                                  padding: "1px",
                                  fontSize: "8px",
                                  fontWeight: 600,
                                  textAlign: "center",
                                }}
                              >
                                {selectedResidentForID?.provincial_address ||
                                  "Manila"}
                              </td>
                              <td
                                style={{
                                  background: "#FFFFFF",
                                  border: "1px solid #000",
                                  padding: "1px",
                                  fontSize: "8px",
                                  fontWeight: 600,
                                  textAlign: "center",
                                }}
                              >
                                {selectedResidentForID?.contact_no ||
                                  "09171234567"}
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <Box
                          sx={{
                            background: "#FFFFFF",
                            display: "flex",
                            alignItems: "center",
                            border: "1px solid #000",
                            padding: "2px",
                            marginBottom: "3px",
                            minHeight: "20px",
                          }}
                        >
                          <Typography
                            sx={{ fontSize: "7px", fontWeight: 700, mr: 0.5 }}
                          >
                            SSS NO:
                          </Typography>
                          <Typography sx={{ fontSize: "8px", fontWeight: 600 }}>
                            {selectedResidentForID?.sss_no || ""}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            background: "#FFFFFF",
                            display: "flex",
                            alignItems: "center",
                            border: "1px solid #000",
                            padding: "2px",
                            marginBottom: "3px",
                            minHeight: "20px",
                          }}
                        >
                          <Typography
                            sx={{ fontSize: "7px", fontWeight: 700, mr: 0.5 }}
                          >
                            TIN NO:
                          </Typography>
                          <Typography sx={{ fontSize: "8px", fontWeight: 600 }}>
                            {selectedResidentForID?.tin_no || ""}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "3px",
                          }}
                        >
                          <Typography
                            sx={{ fontSize: "8px", fontWeight: 700, mr: 0.5 }}
                          >
                            Expiration Date:
                          </Typography>
                          <Box
                            sx={{
                              flex: 1,
                              borderBottom: "1px solid #000",
                              paddingBottom: "1px",
                            }}
                          >
                            <Typography
                              sx={{ fontSize: "9px", fontWeight: 600 }}
                            >
                              {formatDateShort(
                                selectedResidentForID?.expiration_date,
                              )}
                            </Typography>
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            border: "1px solid #000",
                            background: "#FFFFFF",
                            mt: 0.5,
                            mb: "50px",
                          }}
                        >
                          <Box
                            sx={{
                              padding: "2px",
                              textAlign: "center",
                              borderBottom: "1px solid #000",
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: "8px",
                                fontWeight: 800,
                                margin: 0,
                              }}
                            >
                              In Case of Emergency Contact Person
                            </Typography>
                          </Box>
                          <Box sx={{ padding: "4px" }}>
                            <Box sx={{ display: "flex", marginBottom: "2px" }}>
                              <Typography
                                sx={{
                                  fontSize: "7px",
                                  fontWeight: 700,
                                  minWidth: "35px",
                                }}
                              >
                                Name
                              </Typography>
                              <Box
                                sx={{
                                  flex: 1,
                                  borderBottom: "1px solid #000",
                                  paddingBottom: "0px",
                                }}
                              >
                                <Typography
                                  sx={{ fontSize: "7px", fontWeight: 600 }}
                                >
                                  {selectedResidentForID?.emergency_name ||
                                    "Same as above"}
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{ display: "flex", marginBottom: "2px" }}>
                              <Typography
                                sx={{
                                  fontSize: "7px",
                                  fontWeight: 700,
                                  minWidth: "35px",
                                }}
                              >
                                Address
                              </Typography>
                              <Box
                                sx={{
                                  flex: 1,
                                  borderBottom: "1px solid #000",
                                  paddingBottom: "0px",
                                }}
                              >
                                <Typography
                                  sx={{ fontSize: "7px", fontWeight: 600 }}
                                >
                                  {selectedResidentForID?.emergency_address ||
                                    selectedResidentForID?.address}
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{ display: "flex" }}>
                              <Typography
                                sx={{
                                  fontSize: "7px",
                                  fontWeight: 700,
                                  minWidth: "35px",
                                }}
                              >
                                Tel./CP#
                              </Typography>
                              <Box
                                sx={{
                                  flex: 1,
                                  borderBottom: "1px solid #000",
                                  paddingBottom: "0px",
                                }}
                              >
                                <Typography
                                  sx={{ fontSize: "7px", fontWeight: 600 }}
                                >
                                  {selectedResidentForID?.emergency_phone ||
                                    selectedResidentForID?.contact_no}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          width: "100%",
                          height: "60px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          paddingBottom: "10px",
                          borderBottomLeftRadius: 0,
                          borderBottomRightRadius: 0,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "10px",
                            fontWeight: 700,
                            color: "#000",
                            textTransform: "uppercase",
                            lineHeight: 1.1,
                          }}
                        >
                          {selectedResidentForID?.full_name?.toUpperCase() ||
                            " "}
                        </Typography>
                        <Box
                          sx={{
                            width: "150px",
                            borderBottom: "1px solid #000",
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: "10px",
                            fontWeight: 700,
                            marginBottom: "8px",
                            color: "#000",
                          }}
                        >
                          Name & Signature of Owner
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Buttons at Bottom Center */}
                <Box
                  className="no-print"
                  sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: "center",
                    alignItems: "center",
                    pb: 3,
                    pt: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    startIcon={<PrintIcon />}
                    size="large"
                    sx={{
                      bgcolor: "#E9762B",
                      "&:hover": { bgcolor: "#c56223" },
                      px: 4,
                    }}
                    onClick={() => {
                      setIsPrinting(true);
                      setTimeout(() => {
                        window.print();
                        setTimeout(() => setIsPrinting(false), 100);
                      }, 100);
                    }}
                  >
                    Print ID
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<CloseIcon />}
                    size="large"
                    sx={{
                      color: "#0D4715",
                      bgcolor: "#F1F0E9",
                      "&:hover": {
                        bgcolor: "rgb(143, 167, 147)",
                      },
                      px: 4,
                    }}
                    onClick={() => setSelectedResidentForID(null)}
                  >
                    Close
                  </Button>
                </Box>
              </DialogContent>
            </Dialog>
          )}
        </Container>
      </Box>
    </>
  );
}

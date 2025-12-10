import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

// MUI
import {
  Paper,
  Typography,
  Button,
  TextField,
  Box,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  Stack,
  createTheme,
  ThemeProvider,
  Chip,
  Badge,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Menu,
  MenuItem,
  Avatar,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";

import {
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  History as HistoryIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from "@mui/icons-material";

const theme = createTheme({
  palette: {
    primary: { main: "#41644A", light: "#A0B2A6", dark: "#0D4715" },
    secondary: { main: "#E9762B" },
    success: { main: "#41644A" },
    background: { default: "#F1F0E9", paper: "#FFFFFF" },
    text: { primary: "#000000", secondary: "#41644A" },
    error: { main: "#E9762B" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { 
          textTransform: "none", 
          fontWeight: 600, 
          borderRadius: 8,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          "&:hover": {
            boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
          }
        },
        containedPrimary: {
          background: "linear-gradient(45deg, #41644A 30%, #527D60 90%)",
        },
        containedSecondary: {
          background: "linear-gradient(45deg, #E9762B 30%, #F4944D 90%)",
        }
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 8px 16px rgba(0,0,0,0.12)",
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none"
        }
      }
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          color: "#000000",
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#000000",
          "&.Mui-focused": {
            color: "#41644A"
          }
        }
      }
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          color: "#000000"
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#000000"
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#41644A"
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#41644A"
          }
        }
      }
    },
  },
});

export default function Transaction() {
  const apiBase = "http://localhost:5000";
  const { getToken } = useAuth();

  const [activeTab, setActiveTab] = useState("certification-action");
  const [coaRecords, setCoaRecords] = useState([]);
  const [indigencyRecords, setIndigencyRecords] = useState([]);
  const [barangayClearanceRecords, setBarangayClearanceRecords] = useState([]);
  const [oathJobRecords, setOathJobRecords] = useState([]);
  const [soloParentRecords, setSoloParentRecords] = useState([]);
  const [businessClearanceRecords, setBusinessClearanceRecords] = useState([]);
  const [certificateOfResidencyRecords, setCertificateOfResidencyRecords] = useState([]);
  const [permitToTravelRecords, setPermitToTravelRecords] = useState([]);
  const [cashAssistanceRecords, setCashAssistanceRecords] = useState([]);
  const [cohabitationRecords, setCohabitationRecords] = useState([]);
  const [bhertNormalRecords, setBhertNormalRecords] = useState([]);
  const [bhertPositiveRecords, setBhertPositiveRecords] = useState([]);
  const [financialAssistanceRecords, setFinancialAssistanceRecords] = useState([]);
  const [transactionSearch, setTransactionSearch] = useState("");
  const [dropdownAnchor, setDropdownAnchor] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Helper function to get auth headers
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

  function generateTransactionNumber(type = "COA") {
    const date = new Date();
    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `${type}-${yy}${mm}${dd}-${rand}`;
  }

  async function loadCoaRecords() {
    try {
      const res = await fetch(`${apiBase}/certificate-of-action/transactions/all`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setCoaRecords(
        Array.isArray(data)
          ? data.map((r) => ({
              certificate_of_action_id: r.certificate_of_action_id,
              resident_id: r.resident_id,
              complainant_name: r.complainant_name,
              respondent_name: r.respondent_name,
              barangay_case_no: r.barangay_case_no,
              request_reason: r.request_reason,
              filed_date: r.filed_date ? r.filed_date.split("T")[0] : "",
              date_issued: r.date_issued ? r.date_issued.split("T")[0] : "",
              transaction_number: r.transaction_number || generateTransactionNumber("COA"),
              is_active: r.is_active ?? 1,
              date_created: r.date_created,
              type: "certification-action",
            }))
          : []
      );
    } catch (e) {
      console.error("Failed to load certificate_of_action records", e);
    }
  }

  async function loadIndigencyRecords() {
    try {
      const res = await fetch(`${apiBase}/indigency/transactions/all`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setIndigencyRecords(
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
              transaction_number: r.transaction_number || generateTransactionNumber("IND"),
              is_active: r.is_active ?? 1,
              date_created: r.date_created,
              type: "indigency",
            }))
          : []
      );
    } catch (e) {
      console.error("Failed to load indigency records", e);
    }
  }

  async function loadBarangayClearanceRecords() {
    try {
      const res = await fetch(`${apiBase}/barangay-clearance/transactions/all`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setBarangayClearanceRecords(
        Array.isArray(data)
          ? data.map((r) => ({
              barangay_clearance_id: r.barangay_clearance_id,
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
              transaction_number: r.transaction_number || generateTransactionNumber("BC"),
              is_active: r.is_active ?? 1,
              date_created: r.date_created,
              type: "barangay-clearance",
            }))
          : []
      );
    } catch (e) {
      console.error("Failed to load barangay clearance records", e);
    }
  }

  async function loadOathJobRecords() {
    try {
      const res = await fetch(`${apiBase}/oath-job/transactions/all`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setOathJobRecords(
        Array.isArray(data)
          ? data.map((r) => ({
              id: r.id,
              resident_id: r.resident_id,
              full_name: r.full_name,
              address: r.address,
              age: String(r.age ?? ""),
              date_issued: r.date_issued ? (r.date_issued.includes("T") ? r.date_issued.split("T")[0] : r.date_issued) : "",
              transaction_number: r.transaction_number || generateTransactionNumber("OJS"),
              is_active: r.is_active !== undefined ? r.is_active : 1,
              date_created: r.date_created,
              type: "oath-job",
            }))
          : []
      );
    } catch (e) {
      console.error("Failed to load oath job records", e);
    }
  }

  async function loadSoloParentRecords() {
    try {
      const res = await fetch(`${apiBase}/solo-parent-records/transactions/all`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setSoloParentRecords(
        Array.isArray(data)
          ? data.map((r) => ({
              solo_parent_id: r.solo_parent_id,
              resident_id: r.resident_id,
              full_name: r.full_name,
              address: r.address,
              age: String(r.age ?? ""),
              contact_no: r.contact_no || "",
              residents_since_year: r.residents_since_year || "",
              unwed_since_year: r.unwed_since_year || "",
              employment_status: r.employment_status || "",
              date_issued: r.date_issued ? (r.date_issued.includes("T") ? r.date_issued.split("T")[0] : r.date_issued) : "",
              transaction_number: r.transaction_number || generateTransactionNumber("SP"),
              is_active: r.is_active !== undefined ? r.is_active : 1,
              date_created: r.date_created,
              type: "solo-parent",
            }))
          : []
      );
    } catch (e) {
      console.error("Failed to load solo parent records", e);
    }
  }

  async function loadBusinessClearanceRecords() {
    try {
      const res = await fetch(`${apiBase}/business-clearance/transactions/all`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setBusinessClearanceRecords(
        Array.isArray(data)
          ? data.map((r) => ({
              business_clearance_id: r.business_clearance_id,
              resident_id: r.resident_id,
              full_name: r.full_name,
              address: r.address,
              nature_of_business: r.nature_of_business || "",
              date_issued: r.date_issued ? (r.date_issued.includes("T") ? r.date_issued.split("T")[0] : r.date_issued) : "",
              date_expired: r.date_expired ? (r.date_expired.includes("T") ? r.date_expired.split("T")[0] : r.date_expired) : "",
              remarks: r.remarks || "",
              request_reason: r.request_reason || "",
              transaction_number: r.transaction_number || generateTransactionNumber("BUS"),
              is_active: r.is_active !== undefined ? r.is_active : 1,
              date_created: r.date_created,
              type: "business-clearance",
            }))
          : []
      );
    } catch (e) {
      console.error("Failed to load business clearance records", e);
    }
  }

  async function loadCertificateOfResidencyRecords() {
    try {
      const res = await fetch(`${apiBase}/certificate-of-residency/transactions/all`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setCertificateOfResidencyRecords(
        Array.isArray(data)
          ? data.map((r) => ({
              certificate_of_residency_id: r.certificate_of_residency_id,
              resident_id: r.resident_id,
              full_name: r.full_name,
              address: r.address,
              provincial_address: r.provincial_address || "",
              dob: r.dob ? (r.dob.includes("T") ? r.dob.split("T")[0] : r.dob) : "",
              age: String(r.age ?? ""),
              civil_status: r.civil_status || "",
              contact_no: r.contact_no || "",
              remarks: r.remarks || "",
              request_reason: r.request_reason || "",
              date_issued: r.date_issued ? (r.date_issued.includes("T") ? r.date_issued.split("T")[0] : r.date_issued) : "",
              transaction_number: r.transaction_number || generateTransactionNumber("RES"),
              is_active: r.is_active !== undefined ? r.is_active : 1,
              date_created: r.date_created,
              type: "certificate-of-residency",
            }))
          : []
      );
    } catch (e) {
      console.error("Failed to load certificate of residency records", e);
    }
  }

  async function loadPermitToTravelRecords() {
    try {
      const res = await fetch(`${apiBase}/permit-to-travel/transactions/all`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setPermitToTravelRecords(
        Array.isArray(data)
          ? data.map((r) => ({
              permit_to_travel_id: r.permit_to_travel_id,
              resident_id: r.resident_id,
              full_name: r.full_name,
              address: r.address,
              provincial_address: r.provincial_address || "",
              dob: r.dob ? (r.dob.includes("T") ? r.dob.split("T")[0] : r.dob) : "",
              age: String(r.age ?? ""),
              civil_status: r.civil_status || "",
              contact_no: r.contact_no || "",
              remarks: r.remarks || "",
              request_reason: r.request_reason || "",
              date_issued: r.date_issued ? (r.date_issued.includes("T") ? r.date_issued.split("T")[0] : r.date_issued) : "",
              transaction_number: r.transaction_number || generateTransactionNumber("TRV"),
              is_active: r.is_active !== undefined ? r.is_active : 1,
              date_created: r.date_created,
              type: "permit-to-travel",
            }))
          : []
      );
    } catch (e) {
      console.error("Failed to load permit to travel records", e);
    }
  }

  async function loadCashAssistanceRecords() {
    try {
      const res = await fetch(`${apiBase}/cash-assistance/transactions/all`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setCashAssistanceRecords(
        Array.isArray(data)
          ? data.map((r) => ({
              cash_assistance_id: r.cash_assistance_id,
              resident_id: r.resident_id,
              full_name: r.full_name,
              sinceYear: r.since_year || "",
              address: r.address || "",
              request_reason: r.request_reason || "",
              date_issued: r.date_issued ? (r.date_issued.includes("T") ? r.date_issued.split("T")[0] : r.date_issued) : "",
              transaction_number: r.transaction_number || generateTransactionNumber("CA"),
              is_active: r.is_active !== undefined ? r.is_active : 1,
              date_created: r.date_created,
              type: "cash-assistance",
            }))
          : []
      );
    } catch (e) {
      console.error("Failed to load cash assistance records", e);
    }
  }

  async function loadCohabitationRecords() {
    try {
      const res = await fetch(`${apiBase}/certificate-of-cohabitation/transactions/all`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setCohabitationRecords(
        Array.isArray(data)
          ? data.map((r) => ({
              certificate_of_cohabitation_id: r.certificate_of_cohabitation_id,
              resident1_id: r.resident1_id,
              resident2_id: r.resident2_id,
              full_name1: r.full_name1 || "",
              full_name2: r.full_name2 || "",
              address: r.address || "",
              date_started: r.date_started || "",
              date_issued: r.date_issued ? (r.date_issued.includes("T") ? r.date_issued.split("T")[0] : r.date_issued) : "",
              transaction_number: r.transaction_number || generateTransactionNumber("COH"),
              is_active: r.is_active !== undefined ? r.is_active : 1,
              date_created: r.date_created,
              type: "cohabitation",
            }))
          : []
      );
    } catch (e) {
      console.error("Failed to load cohabitation records", e);
    }
  }

  async function loadFinancialAssistanceRecords() {
    try {
      const res = await fetch(`${apiBase}/financial-assistance/transactions/all`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setFinancialAssistanceRecords(
        Array.isArray(data)
          ? data.map((r) => ({
              financial_assistance_id: r.financial_assistance_id,
              resident_id: r.resident_id,
              full_name: r.full_name || "",
              address: r.address || "",
              dob: r.dob ? (r.dob.includes("T") ? r.dob.split("T")[0] : r.dob) : "",
              age: String(r.age ?? ""),
              occupation: r.occupation || "",
              purpose: r.purpose || "",
              monthly_income: r.monthly_income || "",
              date_issued: r.date_issued ? (r.date_issued.includes("T") ? r.date_issued.split("T")[0] : r.date_issued) : "",
              transaction_number: r.transaction_number || generateTransactionNumber("FIN"),
              is_active: r.is_active !== undefined ? r.is_active : 1,
              date_created: r.date_created,
              type: "financial-assistance",
            }))
          : []
      );
    } catch (e) {
      console.error("Failed to load financial assistance records", e);
    }
  }

  async function loadBhertNormalRecords() {
    try {
      const res = await fetch(`${apiBase}/bhert-certificate-normal/transactions/all`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setBhertNormalRecords(
        Array.isArray(data)
          ? data.map((r) => ({
              bhert_certificate_normal_id: r.bhert_certificate_normal_id,
              resident_id: r.resident_id,
              full_name: r.full_name || "",
              address: r.address || "",
              requestor: r.requestor || "",
              purpose: r.purpose || "",
              date_issued: r.date_issued ? (r.date_issued.includes("T") ? r.date_issued.split("T")[0] : r.date_issued) : "",
              transaction_number: r.transaction_number || generateTransactionNumber("BHERT"),
              is_active: r.is_active !== undefined ? r.is_active : 1,
              date_created: r.date_created,
              type: "bhert-normal",
            }))
          : []
      );
    } catch (e) {
      console.error("Failed to load BHERT normal records", e);
    }
  }

  async function loadBhertPositiveRecords() {
    try {
      const res = await fetch(`${apiBase}/bhert-certificate-positive/transactions/all`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setBhertPositiveRecords(
        Array.isArray(data)
          ? data.map((r) => ({
              bhert_certificate_positive_id: r.bhert_certificate_positive_id,
              resident_id: r.resident_id,
              full_name: r.full_name || "",
              address: r.address || "",
              request_reason: r.request_reason || "",
              date_issued: r.date_issued ? (r.date_issued.includes("T") ? r.date_issued.split("T")[0] : r.date_issued) : "",
              transaction_number: r.transaction_number || generateTransactionNumber("BHP"),
              is_active: r.is_active !== undefined ? r.is_active : 1,
              date_created: r.date_created,
              type: "bhert-positive",
            }))
          : []
      );
    } catch (e) {
      console.error("Failed to load BHERT positive records", e);
    }
  }

  useEffect(() => {
    loadCoaRecords();
    loadIndigencyRecords();
    loadBarangayClearanceRecords();
    loadOathJobRecords();
    loadSoloParentRecords();
    loadBusinessClearanceRecords();
    loadCertificateOfResidencyRecords();
    loadPermitToTravelRecords();
    loadCashAssistanceRecords();
    loadCohabitationRecords();
    loadFinancialAssistanceRecords();
    loadBhertNormalRecords();
    loadBhertPositiveRecords();
  }, []);

  const currentRecords = useMemo(() => {
    if (activeTab === "certification-action") return coaRecords;
    if (activeTab === "indigency") return indigencyRecords;
    if (activeTab === "barangay-clearance") return barangayClearanceRecords;
    if (activeTab === "oath-job") return oathJobRecords;
    if (activeTab === "solo-parent") return soloParentRecords;
    if (activeTab === "business-clearance") return businessClearanceRecords;
    if (activeTab === "certificate-of-residency") return certificateOfResidencyRecords;
    if (activeTab === "permit-to-travel") return permitToTravelRecords;
    if (activeTab === "cash-assistance") return cashAssistanceRecords;
    if (activeTab === "cohabitation") return cohabitationRecords;
    if (activeTab === "financial-assistance") return financialAssistanceRecords;
    if (activeTab === "bhert-normal") return bhertNormalRecords;
    if (activeTab === "bhert-positive") return bhertPositiveRecords;
    return [];
  }, [activeTab, coaRecords, indigencyRecords, barangayClearanceRecords, oathJobRecords, soloParentRecords, businessClearanceRecords, certificateOfResidencyRecords, permitToTravelRecords, cashAssistanceRecords, cohabitationRecords, financialAssistanceRecords, bhertNormalRecords, bhertPositiveRecords]);

  const transactionFilteredRecords = useMemo(
    () => {
      const search = transactionSearch.toLowerCase();

      const matchesSearch = (r) => {
        if (activeTab === "certification-action") {
          return (
            (r.transaction_number || "").toLowerCase().includes(search) ||
            (r.complainant_name || "").toLowerCase().includes(search) ||
            (r.respondent_name || "").toLowerCase().includes(search) ||
            (r.barangay_case_no || "").toLowerCase().includes(search)
          );
        }
        if (activeTab === "indigency") {
          return (
            (r.transaction_number || "").toLowerCase().includes(search) ||
            (r.full_name || "").toLowerCase().includes(search) ||
            (r.address || "").toLowerCase().includes(search)
          );
        }
        if (activeTab === "barangay-clearance") {
          return (
            (r.transaction_number || "").toLowerCase().includes(search) ||
            (r.full_name || "").toLowerCase().includes(search) ||
            (r.address || "").toLowerCase().includes(search)
          );
        }
        if (activeTab === "oath-job") {
          return (
            (r.transaction_number || "").toLowerCase().includes(search) ||
            (r.full_name || "").toLowerCase().includes(search) ||
            (r.address || "").toLowerCase().includes(search)
          );
        }
        if (activeTab === "solo-parent") {
          return (
            (r.transaction_number || "").toLowerCase().includes(search) ||
            (r.full_name || "").toLowerCase().includes(search) ||
            (r.address || "").toLowerCase().includes(search)
          );
        }
        if (activeTab === "business-clearance") {
          return (
            (r.transaction_number || "").toLowerCase().includes(search) ||
            (r.full_name || "").toLowerCase().includes(search) ||
            (r.address || "").toLowerCase().includes(search) ||
            (r.nature_of_business || "").toLowerCase().includes(search)
          );
        }
        if (activeTab === "certificate-of-residency") {
          return (
            (r.transaction_number || "").toLowerCase().includes(search) ||
            (r.full_name || "").toLowerCase().includes(search) ||
            (r.address || "").toLowerCase().includes(search) ||
            (r.contact_no || "").toLowerCase().includes(search)
          );
        }
        if (activeTab === "permit-to-travel") {
          return (
            (r.transaction_number || "").toLowerCase().includes(search) ||
            (r.full_name || "").toLowerCase().includes(search) ||
            (r.address || "").toLowerCase().includes(search) ||
            (r.contact_no || "").toLowerCase().includes(search)
          );
        }
        if (activeTab === "cash-assistance") {
          return (
            (r.transaction_number || "").toLowerCase().includes(search) ||
            (r.full_name || "").toLowerCase().includes(search) ||
            (r.address || "").toLowerCase().includes(search) ||
            (r.request_reason || "").toLowerCase().includes(search)
          );
        }
        if (activeTab === "cohabitation") {
          return (
            (r.transaction_number || "").toLowerCase().includes(search) ||
            (r.full_name1 || "").toLowerCase().includes(search) ||
            (r.full_name2 || "").toLowerCase().includes(search) ||
            (r.address || "").toLowerCase().includes(search)
          );
        }
        if (activeTab === "financial-assistance") {
          return (
            (r.transaction_number || "").toLowerCase().includes(search) ||
            (r.full_name || "").toLowerCase().includes(search) ||
            (r.address || "").toLowerCase().includes(search) ||
            (r.purpose || "").toLowerCase().includes(search)
          );
        }
        if (activeTab === "bhert-normal") {
          return (
            (r.transaction_number || "").toLowerCase().includes(search) ||
            (r.full_name || "").toLowerCase().includes(search) ||
            (r.address || "").toLowerCase().includes(search) ||
            (r.requestor || "").toLowerCase().includes(search) ||
            (r.purpose || "").toLowerCase().includes(search)
          );
        }
        if (activeTab === "bhert-positive") {
          return (
            (r.transaction_number || "").toLowerCase().includes(search) ||
            (r.full_name || "").toLowerCase().includes(search) ||
            (r.address || "").toLowerCase().includes(search) ||
            (r.request_reason || "").toLowerCase().includes(search)
          );
        }
        return false;
      };

      const getIssuedDate = (r) => {
        if (activeTab === "certification-action") {
          return r.date_issued || r.filed_date || r.date_created || "";
        }
        return r.date_issued || r.date_created || "";
      };

      const isWithinDateRange = (r) => {
        if (!filterDateFrom && !filterDateTo) return true;
        const rawDate = getIssuedDate(r);
        if (!rawDate) return false;
        const dateOnly = rawDate.includes("T") ? rawDate.split("T")[0] : rawDate;
        const recordDate = new Date(dateOnly);
        if (filterDateFrom && recordDate < new Date(filterDateFrom)) return false;
        if (filterDateTo && recordDate > new Date(filterDateTo)) return false;
        return true;
      };

      const matchesStatus = (r) => {
        if (filterStatus === "all") return true;
        const isActive = !(r.is_active === 0 || r.is_active === false);
        return filterStatus === "active" ? isActive : !isActive;
      };

      const source =
        activeTab === "certification-action"
          ? coaRecords
          : activeTab === "indigency"
          ? indigencyRecords
          : activeTab === "barangay-clearance"
          ? barangayClearanceRecords
          : activeTab === "oath-job"
          ? oathJobRecords
          : activeTab === "solo-parent"
          ? soloParentRecords
          : activeTab === "business-clearance"
          ? businessClearanceRecords
          : activeTab === "certificate-of-residency"
          ? certificateOfResidencyRecords
          : activeTab === "permit-to-travel"
          ? permitToTravelRecords
          : activeTab === "cash-assistance"
          ? cashAssistanceRecords
          : activeTab === "cohabitation"
          ? cohabitationRecords
          : activeTab === "financial-assistance"
          ? financialAssistanceRecords
          : activeTab === "bhert-normal"
          ? bhertNormalRecords
          : activeTab === "bhert-positive"
          ? bhertPositiveRecords
          : [];

      return source.filter(
        (r) => matchesSearch(r) && matchesStatus(r) && isWithinDateRange(r)
      );
    },
    [
      activeTab,
      transactionSearch,
      filterStatus,
      filterDateFrom,
      filterDateTo,
      coaRecords,
      indigencyRecords,
      barangayClearanceRecords,
      oathJobRecords,
      soloParentRecords,
      businessClearanceRecords,
      certificateOfResidencyRecords,
      permitToTravelRecords,
      cashAssistanceRecords,
      cohabitationRecords,
      financialAssistanceRecords,
      bhertNormalRecords,
      bhertPositiveRecords,
    ]
  );

  const handleDropdownOpen = (event) => {
    setDropdownAnchor(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setDropdownAnchor(null);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    handleDropdownClose();
    setTransactionSearch("");
    setFilterStatus("all");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  const getTabLabel = () => {
    if (activeTab === "certification-action") {
      return `Certificate of Action (${coaRecords.length})`;
    }
    if (activeTab === "indigency") {
      return `Indigency (${indigencyRecords.length})`;
    }
    if (activeTab === "barangay-clearance") {
      return `Barangay Clearance (${barangayClearanceRecords.length})`;
    }
    if (activeTab === "oath-job") {
      return `Oath Job Seeker (${oathJobRecords.length})`;
    }
    if (activeTab === "solo-parent") {
      return `Solo Parent (${soloParentRecords.length})`;
    }
    if (activeTab === "business-clearance") {
      return `Business Clearance (${businessClearanceRecords.length})`;
    }
    if (activeTab === "certificate-of-residency") {
      return `Certificate of Residency (${certificateOfResidencyRecords.length})`;
    }
    if (activeTab === "permit-to-travel") {
      return `Permit to Travel (${permitToTravelRecords.length})`;
    }
    if (activeTab === "cash-assistance") {
      return `Cash Assistance (${cashAssistanceRecords.length})`;
    }
    if (activeTab === "cohabitation") {
      return `Cohabitation (${cohabitationRecords.length})`;
    }
    if (activeTab === "financial-assistance") {
      return `Financial Assistance (${financialAssistanceRecords.length})`;
    }
    if (activeTab === "bhert-normal") {
      return `BHERT (Normal) (${bhertNormalRecords.length})`;
    }
    if (activeTab === "bhert-positive") {
      return `BHERT (Positive) (${bhertPositiveRecords.length})`;
    }
    return "Select Certificate Type";
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", bgcolor: "background.default" }}>
        {/* TOP HEADER - mirrored styling */}
        <Paper elevation={2} sx={{ borderRadius: 3, overflow: "hidden", mb: 2 }}>
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
                <HistoryIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                  Transaction Log
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  View transaction history for all certificates (Read-only Audit Log)
                </Typography>
              </Box>
            </Box>
            <Badge
              badgeContent={
                coaRecords.length +
                indigencyRecords.length +
                barangayClearanceRecords.length +
                oathJobRecords.length +
                soloParentRecords.length +
                businessClearanceRecords.length +
                certificateOfResidencyRecords.length +
                permitToTravelRecords.length +
                cashAssistanceRecords.length +
                cohabitationRecords.length +
                financialAssistanceRecords.length +
                bhertNormalRecords.length +
                bhertPositiveRecords.length
              }
              color="secondary"
            >
              <Chip
                icon={<HistoryIcon />}
                label="Total Transactions"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: 600,
                }}
              />
            </Badge>
          </Box>
          <Box
            sx={{
              height: "4px",
              background: "linear-gradient(90deg, #0D4715 0%, #1a5f2e 50%, #E9762B 100%)",
              width: "100%",
            }}
          />
        </Paper>

        {/* MAIN CONTENT AREA */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* DROPDOWN BUTTON */}
          <Paper elevation={0} sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, color: "text.primary" }}>
                Certificate Type:
              </Typography>
              <Button
                variant="outlined"
                onClick={handleDropdownOpen}
                endIcon={<ArrowDropDownIcon />}
                sx={{
                  minWidth: 300,
                  justifyContent: "space-between",
                  textTransform: "none",
                  fontWeight: 600,
                  borderColor: "primary.main",
                  color: "text.primary",
                  "&:hover": {
                    borderColor: "primary.dark",
                    bgcolor: "action.hover",
                  },
                }}
              >
                {getTabLabel()}
              </Button>
              <Menu
                anchorEl={dropdownAnchor}
                open={Boolean(dropdownAnchor)}
                onClose={handleDropdownClose}
                PaperProps={{
                  sx: {
                    minWidth: 300,
                    mt: 1,
                  },
                }}
              >
                <MenuItem
                  onClick={() => handleTabChange("certification-action")}
                  selected={activeTab === "certification-action"}
                  sx={{
                    fontWeight: activeTab === "certification-action" ? 600 : 400,
                    bgcolor: activeTab === "certification-action" ? "action.selected" : "transparent",
                  }}
                >
                  Certificate of Action ({coaRecords.length})
                </MenuItem>
                <MenuItem
                  onClick={() => handleTabChange("indigency")}
                  selected={activeTab === "indigency"}
                  sx={{
                    fontWeight: activeTab === "indigency" ? 600 : 400,
                    bgcolor: activeTab === "indigency" ? "action.selected" : "transparent",
                  }}
                >
                  Indigency ({indigencyRecords.length})
                </MenuItem>
                <MenuItem
                  onClick={() => handleTabChange("barangay-clearance")}
                  selected={activeTab === "barangay-clearance"}
                  sx={{
                    fontWeight: activeTab === "barangay-clearance" ? 600 : 400,
                    bgcolor: activeTab === "barangay-clearance" ? "action.selected" : "transparent",
                  }}
                >
                  Barangay Clearance ({barangayClearanceRecords.length})
                </MenuItem>
                <MenuItem
                  onClick={() => handleTabChange("oath-job")}
                  selected={activeTab === "oath-job"}
                  sx={{
                    fontWeight: activeTab === "oath-job" ? 600 : 400,
                    bgcolor: activeTab === "oath-job" ? "action.selected" : "transparent",
                  }}
                >
                  Oath Job Seeker ({oathJobRecords.length})
                </MenuItem>
                <MenuItem
                  onClick={() => handleTabChange("solo-parent")}
                  selected={activeTab === "solo-parent"}
                  sx={{
                    fontWeight: activeTab === "solo-parent" ? 600 : 400,
                    bgcolor: activeTab === "solo-parent" ? "action.selected" : "transparent",
                  }}
                >
                  Solo Parent ({soloParentRecords.length})
                </MenuItem>
                <MenuItem
                  onClick={() => handleTabChange("business-clearance")}
                  selected={activeTab === "business-clearance"}
                  sx={{
                    fontWeight: activeTab === "business-clearance" ? 600 : 400,
                    bgcolor: activeTab === "business-clearance" ? "action.selected" : "transparent",
                  }}
                >
                  Business Clearance ({businessClearanceRecords.length})
                </MenuItem>
                <MenuItem
                  onClick={() => handleTabChange("certificate-of-residency")}
                  selected={activeTab === "certificate-of-residency"}
                  sx={{
                    fontWeight: activeTab === "certificate-of-residency" ? 600 : 400,
                    bgcolor: activeTab === "certificate-of-residency" ? "action.selected" : "transparent",
                  }}
                >
                  Certificate of Residency ({certificateOfResidencyRecords.length})
                </MenuItem>
                <MenuItem
                  onClick={() => handleTabChange("permit-to-travel")}
                  selected={activeTab === "permit-to-travel"}
                  sx={{
                    fontWeight: activeTab === "permit-to-travel" ? 600 : 400,
                    bgcolor: activeTab === "permit-to-travel" ? "action.selected" : "transparent",
                  }}
                >
                  Permit to Travel ({permitToTravelRecords.length})
                </MenuItem>
                <MenuItem
                  onClick={() => handleTabChange("cash-assistance")}
                  selected={activeTab === "cash-assistance"}
                  sx={{
                    fontWeight: activeTab === "cash-assistance" ? 600 : 400,
                    bgcolor: activeTab === "cash-assistance" ? "action.selected" : "transparent",
                  }}
                >
                  Cash Assistance ({cashAssistanceRecords.length})
                </MenuItem>
                <MenuItem
                  onClick={() => handleTabChange("cohabitation")}
                  selected={activeTab === "cohabitation"}
                  sx={{
                    fontWeight: activeTab === "cohabitation" ? 600 : 400,
                    bgcolor: activeTab === "cohabitation" ? "action.selected" : "transparent",
                  }}
                >
                  Cohabitation ({cohabitationRecords.length})
                </MenuItem>
                <MenuItem
                  onClick={() => handleTabChange("financial-assistance")}
                  selected={activeTab === "financial-assistance"}
                  sx={{
                    fontWeight: activeTab === "financial-assistance" ? 600 : 400,
                    bgcolor: activeTab === "financial-assistance" ? "action.selected" : "transparent",
                  }}
                >
                  Financial Assistance ({financialAssistanceRecords.length})
                </MenuItem>
                <MenuItem
                  onClick={() => handleTabChange("bhert-normal")}
                  selected={activeTab === "bhert-normal"}
                  sx={{
                    fontWeight: activeTab === "bhert-normal" ? 600 : 400,
                    bgcolor: activeTab === "bhert-normal" ? "action.selected" : "transparent",
                  }}
                >
                  BHERT (Normal) ({bhertNormalRecords.length})
                </MenuItem>
                <MenuItem
                  onClick={() => handleTabChange("bhert-positive")}
                  selected={activeTab === "bhert-positive"}
                  sx={{
                    fontWeight: activeTab === "bhert-positive" ? 600 : 400,
                    bgcolor: activeTab === "bhert-positive" ? "action.selected" : "transparent",
                  }}
                >
                  BHERT (Positive) ({bhertPositiveRecords.length})
                </MenuItem>
              </Menu>
            </Box>
          </Paper>

          {/* SEARCH BAR */}
          <Paper elevation={0} sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <ReceiptIcon color="primary" />
              Transaction Search
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 1.5 }}>
                <TextField 
                  fullWidth 
                  size="small" 
                  placeholder={
                    activeTab === "certification-action" 
                      ? "Search by transaction number, complainant, respondent, or case number" 
                      : "Search by transaction number, name, or address"
                  } 
                  value={transactionSearch} 
                  onChange={(e) => setTransactionSearch(e.target.value)} 
                  InputProps={{ 
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ) 
                  }} 
                />
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: { md: 220 } }}>
                  Showing {transactionFilteredRecords.length} of {currentRecords.length}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 1.5 }}>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    label="Status"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  type="date"
                  size="small"
                  label="Date from"
                  InputLabelProps={{ shrink: true }}
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                />
                <TextField
                  type="date"
                  size="small"
                  label="Date to"
                  InputLabelProps={{ shrink: true }}
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                />
              </Box>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
              {activeTab === "certification-action" 
                ? `Format: COA-YYMMDD-###### | Showing ${transactionFilteredRecords.length} of ${coaRecords.length} transactions`
                : activeTab === "indigency"
                ? `Format: IND-YYMMDD-###### | Showing ${transactionFilteredRecords.length} of ${indigencyRecords.length} transactions`
                : activeTab === "barangay-clearance"
                ? `Format: CLR-YYMMDD-###### | Showing ${transactionFilteredRecords.length} of ${barangayClearanceRecords.length} transactions`
                : activeTab === "oath-job"
                ? `Format: OJS-YYMMDD-###### | Showing ${transactionFilteredRecords.length} of ${oathJobRecords.length} transactions`
                : activeTab === "solo-parent"
                ? `Format: SP-YYMMDD-###### | Showing ${transactionFilteredRecords.length} of ${soloParentRecords.length} transactions`
                : activeTab === "business-clearance"
                ? `Format: BUS-YYMMDD-###### | Showing ${transactionFilteredRecords.length} of ${businessClearanceRecords.length} transactions`
                : activeTab === "certificate-of-residency"
                ? `Format: RES-YYMMDD-###### | Showing ${transactionFilteredRecords.length} of ${certificateOfResidencyRecords.length} transactions`
                : activeTab === "permit-to-travel"
                ? `Format: TRV-YYMMDD-###### | Showing ${transactionFilteredRecords.length} of ${permitToTravelRecords.length} transactions`
                : activeTab === "cash-assistance"
                ? `Format: CA-YYMMDD-###### | Showing ${transactionFilteredRecords.length} of ${cashAssistanceRecords.length} transactions`
                : activeTab === "cohabitation"
                ? `Format: COH-YYMMDD-###### | Showing ${transactionFilteredRecords.length} of ${cohabitationRecords.length} transactions`
                : activeTab === "financial-assistance"
                ? `Format: FIN-YYMMDD-###### | Showing ${transactionFilteredRecords.length} of ${financialAssistanceRecords.length} transactions`
                : activeTab === "bhert-normal"
                ? `Format: BHERT-YYMMDD-###### | Showing ${transactionFilteredRecords.length} of ${bhertNormalRecords.length} transactions`
                : `Format: BHP-YYMMDD-###### | Showing ${transactionFilteredRecords.length} of ${bhertPositiveRecords.length} transactions`}
            </Typography>
          </Paper>

          {/* TRANSACTION TABLE */}
          <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
            {transactionFilteredRecords.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
                <ReceiptIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                <Typography variant="h6" gutterBottom>
                  No transactions found
                </Typography>
                <Typography variant="body2">
                  {transactionSearch ? "Try a different search term" : "No transactions available"}
                </Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper} elevation={1}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "primary.main" }}>
                      <TableCell sx={{ color: "white", fontWeight: 600 }}>Transaction #</TableCell>
                      {activeTab === "certification-action" ? (
                        <>
                          <TableCell sx={{ color: "white", fontWeight: 600 }}>Complainant</TableCell>
                          <TableCell sx={{ color: "white", fontWeight: 600 }}>Respondent</TableCell>
                          <TableCell sx={{ color: "white", fontWeight: 600 }}>Case No.</TableCell>
                          <TableCell sx={{ color: "white", fontWeight: 600 }}>Request Reason</TableCell>
                          <TableCell sx={{ color: "white", fontWeight: 600 }}>Filed Date</TableCell>
                          <TableCell sx={{ color: "white", fontWeight: 600 }}>Date Issued</TableCell>
                        </>
                      ) : (
                        <>
                          {activeTab === "cohabitation" ? (
                            <TableCell sx={{ color: "white", fontWeight: 600 }}>Name 1</TableCell>
                          ) : (
                            <TableCell sx={{ color: "white", fontWeight: 600 }}>Full Name</TableCell>
                          )}
                          <TableCell sx={{ color: "white", fontWeight: 600 }}>Address</TableCell>
                          {activeTab === "business-clearance" && (
                            <TableCell sx={{ color: "white", fontWeight: 600 }}>Nature of Business</TableCell>
                          )}
                          {activeTab !== "oath-job" && activeTab !== "solo-parent" && activeTab !== "business-clearance" && activeTab !== "certificate-of-residency" && activeTab !== "permit-to-travel" && activeTab !== "cash-assistance" && activeTab !== "cohabitation" && activeTab !== "financial-assistance" && (
                            <TableCell sx={{ color: "white", fontWeight: 600 }}>Request Reason</TableCell>
                          )}
                          {activeTab === "cash-assistance" && (
                            <TableCell sx={{ color: "white", fontWeight: 600 }}>Since Year</TableCell>
                          )}
                          {activeTab === "cash-assistance" && (
                            <TableCell sx={{ color: "white", fontWeight: 600 }}>Request Reason</TableCell>
                          )}
                          {activeTab === "cohabitation" && (
                            <TableCell sx={{ color: "white", fontWeight: 600 }}>Name 2</TableCell>
                          )}
                          {activeTab === "cohabitation" && (
                            <TableCell sx={{ color: "white", fontWeight: 600 }}>Date Started</TableCell>
                          )}
                          {activeTab === "bhert-normal" && (
                            <TableCell sx={{ color: "white", fontWeight: 600 }}>Requestor</TableCell>
                          )}
                          {activeTab === "bhert-normal" && (
                            <TableCell sx={{ color: "white", fontWeight: 600 }}>Purpose</TableCell>
                          )}
                          {activeTab === "financial-assistance" && (
                            <TableCell sx={{ color: "white", fontWeight: 600 }}>Purpose</TableCell>
                          )}
                          <TableCell sx={{ color: "white", fontWeight: 600 }}>Date Issued</TableCell>
                          {activeTab === "business-clearance" && (
                            <TableCell sx={{ color: "white", fontWeight: 600 }}>Date Expired</TableCell>
                          )}
                        </>
                      )}
                      <TableCell sx={{ color: "white", fontWeight: 600 }}>Date Created</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: 600 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactionFilteredRecords.map((r) => {
                      const recordId = activeTab === "certification-action" 
                        ? r.certificate_of_action_id 
                        : activeTab === "indigency"
                        ? r.indigency_id
                        : activeTab === "barangay-clearance"
                        ? r.barangay_clearance_id
                        : activeTab === "solo-parent"
                        ? r.solo_parent_id
                        : activeTab === "business-clearance"
                        ? r.business_clearance_id
                        : activeTab === "certificate-of-residency"
                        ? r.certificate_of_residency_id
                        : activeTab === "permit-to-travel"
                        ? r.permit_to_travel_id
                        : activeTab === "cash-assistance"
                        ? r.cash_assistance_id
                        : activeTab === "cohabitation"
                        ? r.certificate_of_cohabitation_id
                        : activeTab === "financial-assistance"
                        ? r.financial_assistance_id
                        : activeTab === "bhert-normal"
                        ? r.bhert_certificate_normal_id
                        : activeTab === "bhert-positive"
                        ? r.bhert_certificate_positive_id
                        : r.id;
                      
                      return (
                        <TableRow 
                          key={recordId}
                          sx={{ 
                            "&:hover": { bgcolor: "action.hover" },
                            cursor: "pointer"
                          }}
                        >
                          <TableCell>
                            <Chip 
                              label={r.transaction_number} 
                              size="small" 
                              color="secondary" 
                              variant="outlined" 
                            />
                          </TableCell>
                          {activeTab === "certification-action" ? (
                            <>
                              <TableCell sx={{ fontWeight: 500 }}>{r.complainant_name || "N/A"}</TableCell>
                              <TableCell>{r.respondent_name || "N/A"}</TableCell>
                              <TableCell>{r.barangay_case_no || "N/A"}</TableCell>
                              <TableCell>{r.request_reason || "N/A"}</TableCell>
                              <TableCell>{r.filed_date ? formatDateDisplay(r.filed_date) : "N/A"}</TableCell>
                              <TableCell>{r.date_issued ? formatDateDisplay(r.date_issued) : "N/A"}</TableCell>
                            </>
                          ) : (
                            <>
                              {activeTab === "cohabitation" ? (
                                <TableCell sx={{ fontWeight: 500 }}>{r.full_name1 || "N/A"}</TableCell>
                              ) : (
                                <TableCell sx={{ fontWeight: 500 }}>{r.full_name || "N/A"}</TableCell>
                              )}
                              <TableCell>{r.address || "N/A"}</TableCell>
                              {activeTab === "business-clearance" && (
                                <TableCell>{r.nature_of_business || "N/A"}</TableCell>
                              )}
                              {activeTab !== "oath-job" && activeTab !== "solo-parent" && activeTab !== "business-clearance" && activeTab !== "certificate-of-residency" && activeTab !== "permit-to-travel" && activeTab !== "cash-assistance" && activeTab !== "cohabitation" && activeTab !== "financial-assistance" && (
                                <TableCell>{r.request_reason || "N/A"}</TableCell>
                              )}
                              {activeTab === "cash-assistance" && (
                                <TableCell>{r.sinceYear || "N/A"}</TableCell>
                              )}
                              {activeTab === "cash-assistance" && (
                                <TableCell>{r.request_reason || "N/A"}</TableCell>
                              )}
                              {activeTab === "cohabitation" && (
                                <TableCell>{r.full_name2 || "N/A"}</TableCell>
                              )}
                              {activeTab === "cohabitation" && (
                                <TableCell>{r.date_started || "N/A"}</TableCell>
                              )}
                              {activeTab === "bhert-normal" && (
                                <TableCell>{r.requestor || "N/A"}</TableCell>
                              )}
                              {activeTab === "bhert-normal" && (
                                <TableCell>{r.purpose || "N/A"}</TableCell>
                              )}
                              {activeTab === "financial-assistance" && (
                                <TableCell>{r.purpose || "N/A"}</TableCell>
                              )}
                              <TableCell>{r.date_issued ? formatDateDisplay(r.date_issued) : "N/A"}</TableCell>
                              {activeTab === "business-clearance" && (
                                <TableCell>{r.date_expired ? formatDateDisplay(r.date_expired) : "N/A"}</TableCell>
                              )}
                            </>
                          )}
                          <TableCell>{r.date_created ? formatDateTimeDisplay(r.date_created) : "N/A"}</TableCell>
                          <TableCell>
                            <Chip 
                              label={r.is_active === 0 || r.is_active === false ? "Inactive" : "Active"} 
                              size="small" 
                              color={r.is_active === 0 || r.is_active === false ? "error" : "success"} 
                              variant="outlined" 
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}


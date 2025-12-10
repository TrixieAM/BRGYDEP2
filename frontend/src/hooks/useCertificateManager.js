// src/hooks/useCertificateManager.js
import { useState, useEffect } from 'react';

export function useCertificateManager(certificateType, apiBase = 'http://localhost:5000') {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // Function to calculate validity period based on certificate type
  const getValidityPeriod = (type) => {
    const validityPeriods = {
      'Barangay Clearance': '6 months',
      'Barangay Indigency': '6 months',
      'Business Clearance': '1 year',
      'Certificate of Residency': '6 months',
      'Certificate of Action': '6 months',
      'Oath of Undertaking Job Seeker': '1 year',
      'Solo Parent': '6 months',
      'Permot to Travel': '6 months',
      'Cash Assistance': '6 months',
      'Cohabitation': '1 year',
      'Financial Assistance': '6 months',
      'BHERT Certificate Positve': '1 year',
      'BHERT Certificate Normal': '1 year',
    };
    
    return validityPeriods[type] || '6 months'; // Default to 6 months if not specified
  };

  // Function to calculate expiration date (for display purposes only)
  const calculateExpirationDate = (dateIssued, validityPeriod) => {
    if (!dateIssued || validityPeriod.toLowerCase() === 'permanent') {
      return null;
    }

    const issuedDate = new Date(dateIssued);
    let expirationDate = new Date(issuedDate);

    if (validityPeriod.includes('month')) {
      const months = parseInt(validityPeriod);
      expirationDate.setMonth(issuedDate.getMonth() + months);
    } else if (validityPeriod.includes('year')) {
      const years = parseInt(validityPeriod);
      expirationDate.setFullYear(issuedDate.getFullYear() + years);
    }

    return expirationDate.toISOString().split('T')[0];
  };

  // Load certificates for a specific type
  const loadCertificates = async (type = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const query = type ? `?certificate_type=${type}` : '';
      const res = await fetch(`${apiBase}/certificates${query}`, {
        headers: getAuthHeaders()
      });
      
      if (!res.ok) throw new Error('Failed to fetch certificates');
      
      const data = await res.json();
      setCertificates(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // In src/hooks/useCertificateManager.js

// Save certificate data to the centralized table
const saveCertificate = async (certificateData, isNew = true, certificateId = null) => {
  setLoading(true);
  setError(null);
  
  try {
    const validityPeriod = certificateData.validity_period || getValidityPeriod(certificateType);
    
    const certificatePayload = {
      resident_id: certificateData.resident_id,
      full_name: certificateData.full_name,
      certificate_type: certificateType,
      reason: certificateData.request_reason || certificateData.purpose || '',
      validity_period: validityPeriod,
      date_issued: certificateData.date_issued
    };

    let res;
    if (isNew) {
      // If certificateId is provided, use it for the new record
      if (certificateId) {
        certificatePayload.certificate_id = certificateId;
      }
      
      res = await fetch(`${apiBase}/certificates`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(certificatePayload),
      });
    } else {
      // Find existing certificate by matching criteria
      const existingCertificate = certificates.find(
        (c) => c.certificate_type === certificateType && 
               c.resident_id === certificatePayload.resident_id &&
               c.date_issued === certificatePayload.date_issued
      );

      if (existingCertificate) {
        res = await fetch(`${apiBase}/certificates/${existingCertificate.certificate_id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(certificatePayload),
        });
      } else {
        // Create a new certificate record if none exists
        res = await fetch(`${apiBase}/certificates`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(certificatePayload),
        });
      }
    }

    if (!res.ok) throw new Error('Failed to save certificate');
    
    // Refresh certificates list
    await loadCertificates(certificateType);
    
    return await res.json();
  } catch (e) {
    console.error(e);
    setError(e.message);
    throw e;
  } finally {
    setLoading(false);
  }
};

  // Load certificates on component mount
  useEffect(() => {
    loadCertificates(certificateType);
  }, [certificateType]);

  return {
    certificates,
    loading,
    error,
    saveCertificate,
    loadCertificates,
    getValidityPeriod,
    calculateExpirationDate
  };
}
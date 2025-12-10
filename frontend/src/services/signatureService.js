// services/signatureService.js
const API_BASE = 'http://localhost:5000';

// Helper function to get auth headers
const getAuthHeaders = (token) => {
  return {
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Get all signatures
export const getSignatures = async () => {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE}/api/signature`, {
      headers: getAuthHeaders(token)
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch signatures');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching signatures:', error);
    throw error;
  }
};

// Get single signature by ID
export const getSignature = async (id) => {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE}/api/signature/${id}`, {
      headers: getAuthHeaders(token)
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch signature');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching signature:', error);
    throw error;
  }
};

// Upload new signature
export const uploadSignature = async (file, officialName, designation) => {
  try {
    const token = getToken();
    const formData = new FormData();
    formData.append('signature', file);
    formData.append('official_name', officialName);
    formData.append('designation', designation);
    
    const response = await fetch(`${API_BASE}/api/signature/upload`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload signature');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading signature:', error);
    throw error;
  }
};

// Update signature
export const updateSignature = async (id, file, officialName, designation) => {
  try {
    const token = getToken();
    const formData = new FormData();
    
    if (file) {
      formData.append('signature', file);
    }
    if (officialName) {
      formData.append('official_name', officialName);
    }
    if (designation) {
      formData.append('designation', designation);
    }
    
    const response = await fetch(`${API_BASE}/api/signature/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update signature');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating signature:', error);
    throw error;
  }
};

// Delete signature
export const deleteSignature = async (id) => {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE}/api/signature/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete signature');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting signature:', error);
    throw error;
  }
};

// Get signature image URL
export const getSignatureImageUrl = (signaturePath) => {
  if (!signaturePath) return null;
  // Remove leading slash if present and construct full URL
  const cleanPath = signaturePath.startsWith('/') ? signaturePath.slice(1) : signaturePath;
  return `${API_BASE}/${cleanPath}`;
};


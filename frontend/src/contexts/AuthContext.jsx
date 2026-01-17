import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissionsLoading, setPermissionsLoading] = useState(false);

  const fetchRolePermissions = useCallback(async (token) => {
    try {
      setPermissionsLoading(true);
      const res = await axios.get(`${apiBase}/role-permissions/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const permissions = res.data?.permissions || [];
      setUser((prev) => (prev ? { ...prev, permissions } : prev));
      // Persist latest permissions with the user object
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem('user', JSON.stringify({ ...parsed, permissions }));
      }
    } catch (error) {
      console.error('Error fetching role permissions:', error);
    } finally {
      setPermissionsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check if user is logged in on app start
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        if (token) {
          fetchRolePermissions(token);
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('token', token);
      fetchRolePermissions(token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const hasRole = (requiredRoles) => {
    if (!user) return false;
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(user.role);
    }
    return user.role === requiredRoles;
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    // Prefer dynamic permissions coming from the backend
    if (user.permissions && Array.isArray(user.permissions)) {
      if (user.permissions.includes(permission)) return true;
      // Ensure critical admin capabilities remain available even if not stored
      if (permission === 'manage_users' && user.role === 'admin') return true;
      if (permission === 'view_dashboard' && user.role === 'admin') return true;
      if (permission === 'access_residents' && user.role === 'admin') return true;
      if (permission === 'access_certification_action' && user.role === 'admin') return true;
      return false;
    }
    // Fallback legacy static map
    const rolePermissions = {
      admin: ['view_dashboard', 'manage_users', 'manage_residents', 'access_residents', 'manage_certificates', 'access_certification_action', 'view_reports'],
      chairman: ['view_dashboard', 'manage_residents', 'access_residents', 'manage_certificates', 'view_reports'],
      staff: ['view_dashboard', 'manage_residents', 'access_residents', 'manage_certificates', 'view_reports'],
    };
    return rolePermissions[user.role]?.includes(permission) || false;
  };

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const refreshPermissions = useCallback(async () => {
    const token = getToken();
    if (token) {
      await fetchRolePermissions(token);
    }
  }, [fetchRolePermissions]);

  const value = {
    user,
    login,
    logout,
    hasRole,
    hasPermission,
    loading: loading || permissionsLoading,
    getToken,
    refreshPermissions
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

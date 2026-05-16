import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  Collapse,
  IconButton,
  Divider,
  Tooltip,
  Backdrop,
  Button,
} from '@mui/material';
import {
  Home as HomeIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Settings as SettingsIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Menu as MenuIcon,
  AccountCircle as AccountCircleIcon,
  Receipt as ReceiptIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { ChartBarIcon, ChartPieIcon, PieChartIcon } from 'lucide-react';

const drawerWidth = 250;

export default function Sidebar() {
  const { user, hasPermission, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [certOpen, setCertOpen] = useState(
    location.pathname.startsWith('/certificates')
  );
  const [shadowPosition, setShadowPosition] = useState({ x: 0, y: 0 });
  const [isMouseDown, setIsMouseDown] = useState(false);
  const sidebarRef = useRef(null);

  const toggleMobile = () => setMobileOpen(!mobileOpen);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isMouseDown && sidebarRef.current) {
        const rect = sidebarRef.current.getBoundingClientRect();
        setShadowPosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    const handleMouseDown = (e) => {
      if (sidebarRef.current && sidebarRef.current.contains(e.target)) {
        setIsMouseDown(true);
        const rect = sidebarRef.current.getBoundingClientRect();
        setShadowPosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    const handleMouseUp = () => {
      setIsMouseDown(false);
    };

    if (isMouseDown) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isMouseDown]);

  const navItems = [
    {
      path: '/home',
      label: 'Home',
      icon: <HomeIcon />,
      permission: 'view_dashboard',
    },
    {
      path: '/residents',
      label: 'Residents',
      icon: <PeopleIcon />,
      permission: 'access_residents',
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: <ChartBarIcon />,
      permission: 'access_reports',
    },
    {
      path: '/certification-action-transactions',
      label: 'Transactions',
      icon: <ReceiptIcon />,
      permission: 'access_transaction',
    },
    {
      path: '/certificates',
      label: 'Certificates',
      icon: <AssignmentIcon />,
      permission: 'access_certification_action',
      children: [
        {
          path: '/certification-action',
          label: 'Certificate of Action',
          icon: <AssignmentIcon />,
          permission: 'access_certification_action',
        },
        { 
          path: '/indigency', 
          label: 'Indigency', 
          icon: <AssignmentIcon />,
          permission: 'access_indigency',
        },
        {
          path: '/barangay-clearance',
          label: 'Barangay Clearance',
          icon: <AssignmentIcon />,
          permission: 'access_barangay_clearance',
        },
        {
          path: '/oath-job-seeker',
          label: 'Oath Job Seeker',
          icon: <AssignmentIcon />,
          permission: 'access_oath_job_seeker',
        },
        {
          path: '/solo-parent-form',
          label: 'Solo Parent',
          icon: <AssignmentIcon />,
          permission: 'access_solo_parent',
        },
        {
          path: '/business-clearance',
          label: 'Business Clearance',
          icon: <AssignmentIcon />,
          permission: 'access_business_clearance',
        },
        {
          path: '/certificate-residency',
          label: 'Certificate of Residency',
          icon: <AssignmentIcon />,
          permission: 'access_certificate_residency',
        },
        {
          path: '/certificate-low-income',
          label: 'Certificate of Low Income',
          icon: <AssignmentIcon />,
          permission: 'access_certificate_low_income',
        },
        {
          path: '/certificate-good-moral',
          label: 'Certificate of Good Moral',
          icon: <AssignmentIcon />,
          permission: 'access_certificate_good_moral',
        },
        {
          path: '/permit-to-travel',
          label: 'Permit To Travel',
          icon: <AssignmentIcon />,
          permission: 'access_permit_travel',
        },
        {
          path: '/cash-assistance',
          label: 'Cash Assistance',
          icon: <AssignmentIcon />,
          permission: 'access_cash_assistance',
        },
        {
          path: '/cohabitation',
          label: 'Cohabitation',
          icon: <AssignmentIcon />,
          permission: 'access_cohabitation',
        },
        {
          path: '/financial-assistance',
          label: 'Financial Assistance',
          icon: <AssignmentIcon />,
          permission: 'access_financial_assistance',
        },
        {
          path: '/bhert-cert-positive',
          label: 'Bhert Certificate Positive',
          icon: <AssignmentIcon />,
          permission: 'access_bhert_positive',
        },
        {
          path: '/bhert-cert-normal',
          label: 'Bhert Certificate Normal',
          icon: <AssignmentIcon />,
          permission: 'access_bhert_normal',
        },
      ],
    },
    {
      path: '/users',
      label: 'Settings',
      icon: <SettingsIcon />,
      permission: 'manage_users',
    },
  ].filter((item) => {
    if (!hasPermission(item.permission)) return false;
    // Filter children if they exist and have permissions
    if (item.children) {
      item.children = item.children.filter((child) => 
        !child.permission || hasPermission(child.permission)
      );
      // Only show parent if it has at least one visible child
      return item.children.length > 0;
    }
    return true;
  });

  const drawerContent = (
    <Box
      ref={sidebarRef}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: `'Inter', 'Roboto', 'Segoe UI', 'system-ui', Arial, sans-serif`,
        background: '#0D4715',
        color: '#F1F0E9',
        pt: 3,
        borderRadius: '16px',
        boxShadow:
          '0 20px 60px rgba(13, 71, 21, 0.4), 0 0 0 1px rgba(241, 240, 233, 0.1)',
        overflow: 'hidden',
        position: 'relative',
        cursor: isMouseDown ? 'default' : 'default',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background:
            'linear-gradient(90deg, transparent, rgba(233, 118, 43, 0.6), transparent)',
          boxShadow: '0 0 20px rgba(233, 118, 43, 0.3)',
        },
      }}
    >
      {/* Moving shadow box */}
      {isMouseDown && (
        <Box
          sx={{
            position: 'absolute',
            left: `${shadowPosition.x}px`,
            top: `${shadowPosition.y}px`,
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(233, 118, 43, 0.4) 0%, rgba(233, 118, 43, 0.1) 50%, transparent 100%)',
            boxShadow: '0 0 40px rgba(233, 118, 43, 0.6), 0 0 80px rgba(233, 118, 43, 0.4)',
            pointerEvents: 'none',
            transform: 'translate(-50%, -50%)',
            transition: 'none',
            zIndex: 1000,
          }}
        />
      )}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {/* Profile Section */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            p: 2,
            pb: 1,
            position: 'relative',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 20,
              right: 20,
              height: '1px',
              background:
                'linear-gradient(90deg, transparent, rgba(241, 240, 233, 0.2), transparent)',
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              right: -26,
              top: -18,
              width: 120,
              height: 120,
              background:
                'linear-gradient(135deg, rgba(233, 118, 43, 0.25), rgba(13, 71, 21, 0.65))',
              boxShadow: '0 18px 48px rgba(233, 118, 43, 0.25)',
              opacity: 0.85,
              transform: 'rotate(-10deg)',
              pointerEvents: 'none',
            },
          }}
        >
          <Avatar
            sx={{
              bgcolor: 'rgba(65, 100, 74, 0.8)',
              color: '#F1F0E9',
              width: 54,
              height: 54,
              border: '2px solid rgba(233, 118, 43, 0.3)',
              boxShadow:
                '0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              position: 'relative',
              zIndex: 1,
              cursor: 'default',
            }}
          >
            <AccountCircleIcon sx={{ fontSize: 38 }} />
          </Avatar>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{
                opacity: 0.7,
                color: '#F1F0E9',
                letterSpacing: 1.5,
                fontSize: 12,
                fontFamily: `'Inter', 'Roboto', 'Segoe UI', 'system-ui', Arial, sans-serif`,
                textTransform: 'uppercase',
                fontWeight: 500,
              }}
            >
              BRRMS
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#F1F0E9',
                fontSize: 18,
                fontFamily: `'Inter', 'Roboto', 'Segoe UI', 'system-ui', Arial, sans-serif`,
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                cursor: 'default'

              }}
            >
              {user?.name || 'Guest'}
            </Typography>
          </Box>
        </Box>

        <List sx={{ p: 0, mt: 1.5 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path && !item.children;
            return (
              <Box key={item.path}>
                <Tooltip title={item.label} placement="right" arrow>
                  <ListItemButton
                    component={item.children ? 'button' : Link}
                    to={item.children ? undefined : item.path}
                    onClick={() => {
                      if (item.children) setCertOpen(!certOpen);
                      if (!item.children) setMobileOpen(false);
                    }}
                    sx={{
                      color: '#F1F0E9',
                      mx: 2,
                      my: 0.5,
                      fontWeight: 500,
                      fontFamily: `'Inter', 'Roboto', 'Segoe UI', 'system-ui', Arial, sans-serif`,
                      fontSize: 15,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      background: isActive
                        ? 'linear-gradient(90deg, rgba(65, 100, 74, 0.6) 0%, rgba(65, 100, 74, 0.3) 100%)'
                        : 'transparent',
                      '&:hover': {
                        background: isActive
                          ? 'linear-gradient(90deg, rgba(65, 100, 74, 0.7) 0%, rgba(65, 100, 74, 0.4) 100%)'
                          : 'linear-gradient(90deg, rgba(65, 100, 74, 0.2) 0%, rgba(65, 100, 74, 0.1) 100%)',
                        transform: 'translateX(3px)',
                        '& .sidebar-icon': {
                          background:
                            'linear-gradient(135deg, #E9762B 0%, #d4681f 100%)',
                          color: '#F1F0E9',
                          boxShadow: '0 4px 12px rgba(233, 118, 43, 0.4)',
                        },
                      },
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 4,
                        height: isActive ? '70%' : 0,
                        bgcolor: '#E9762B',
                        transition: 'all 0.3s ease',
                        boxShadow: isActive
                          ? '0 0 10px rgba(233, 118, 43, 0.5)'
                          : 'none',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: 'inherit',
                        minWidth: 42,
                        position: 'relative',
                      }}
                    >
                      <Box
                        className="sidebar-icon"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isActive
                            ? 'linear-gradient(135deg, #E9762B 0%, #d4681f 100%)'
                            : 'rgba(241, 240, 233, 0.1)',
                          color: isActive ? '#F1F0E9' : '#F1F0E9',
                          width: 38,
                          height: 38,
                          transition: 'all 0.3s ease',
                          boxShadow: isActive
                            ? '0 4px 12px rgba(233, 118, 43, 0.4)'
                            : '0 2px 8px rgba(0, 0, 0, 0.2)',
                          border: isActive
                            ? '1px solid rgba(233, 118, 43, 0.3)'
                            : '1px solid transparent',
                        }}
                      >
                        {item.icon}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontWeight: isActive ? 600 : 500,
                          fontSize: 15,
                          fontFamily: `'Inter', 'Roboto', 'Segoe UI', 'system-ui', Arial, sans-serif`,
                          color: isActive
                            ? '#F1F0E9'
                            : 'rgba(241, 240, 233, 0.9)',
                        },
                      }}
                    />
                    {item.children ? (
                      certOpen ? (
                        <ExpandLessIcon
                          sx={{ color: 'rgba(241, 240, 233, 0.7)' }}
                        />
                      ) : (
                        <ExpandMoreIcon
                          sx={{ color: 'rgba(241, 240, 233, 0.7)' }}
                        />
                      )
                    ) : null}
                  </ListItemButton>
                </Tooltip>
                {item.children && (
                  <Collapse in={certOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.children.map((child) => {
                        const childActive = location.pathname === child.path;
                        return (
                          <Tooltip
                            title={child.label}
                            placement="right"
                            arrow
                            key={child.path}
                          >
                            <ListItemButton
                              component={Link}
                              to={child.path}
                              onClick={() => setMobileOpen(false)}
                              sx={{
                                pl: 7,
                                color: '#F1F0E9',
                                mx: 2.5,
                                my: 0.25,
                                fontWeight: 400,
                                fontSize: 14,
                                fontFamily: `'Inter', 'Roboto', 'Segoe UI', 'system-ui', Arial, sans-serif`,
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                background: childActive
                                  ? 'linear-gradient(90deg, rgba(65, 100, 74, 0.4) 0%, rgba(65, 100, 74, 0.2) 100%)'
                                  : 'transparent',
                                '&:hover': {
                                  background: childActive
                                    ? 'linear-gradient(90deg, rgba(65, 100, 74, 0.5) 0%, rgba(65, 100, 74, 0.3) 100%)'
                                    : 'linear-gradient(90deg, rgba(65, 100, 74, 0.15) 0%, rgba(65, 100, 74, 0.05) 100%)',
                                  transform: 'translateX(2px)',
                                  '& .sidebar-icon': {
                                    background:
                                      'linear-gradient(135deg, #E9762B 0%, #d4681f 100%)',
                                    color: '#F1F0E9',
                                  },
                                },
                                '&:before': {
                                  content: '""',
                                  position: 'absolute',
                                  left: 0,
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  width: 3,
                                  height: childActive ? '60%' : 0,
                                  bgcolor: '#E9762B',
                                  transition: 'all 0.3s ease',
                                },
                              }}
                            >
                              <ListItemIcon
                                sx={{
                                  color: 'inherit',
                                  minWidth: 36,
                                  position: 'relative',
                                }}
                              >
                                <Box
                                  className="sidebar-icon"
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: childActive
                                      ? 'linear-gradient(135deg, #E9762B 0%, #d4681f 100%)'
                                      : 'rgba(241, 240, 233, 0.08)',
                                    color: childActive
                                      ? '#F1F0E9'
                                      : 'rgba(241, 240, 233, 0.8)',
                                    width: 32,
                                    height: 32,
                                    transition: 'all 0.3s ease',
                                    boxShadow: childActive
                                      ? '0 3px 10px rgba(233, 118, 43, 0.3)'
                                      : '0 2px 6px rgba(0, 0, 0, 0.15)',
                                  }}
                                >
                                  {child.icon}
                                </Box>
                              </ListItemIcon>
                              <ListItemText
                                primary={child.label}
                                sx={{
                                  '& .MuiListItemText-primary': {
                                    fontWeight: childActive ? 500 : 400,
                                    fontSize: 14,
                                    fontFamily: `'Inter', 'Roboto', 'Segoe UI', 'system-ui', Arial, sans-serif`,
                                    color: childActive
                                      ? '#F1F0E9'
                                      : 'rgba(241, 240, 233, 0.8)',
                                  },
                                }}
                              />
                            </ListItemButton>
                          </Tooltip>
                        );
                      })}
                    </List>
                  </Collapse>
                )}
              </Box>
            );
          })}
        </List>
      </Box>

      {/* Bottom pinned logout */}
      <Box
        sx={{
          mt: 'auto',
          p: 3,
          pt: 1.25,
          position: 'sticky',
          bottom: 25,
          background:
            'linear-gradient(180deg, rgba(13, 71, 21, 0.92) 0%, rgba(13, 40, 24, 0.96) 100%)',
          backdropFilter: 'blur(6px)',
          borderTop: '1px solid rgba(241, 240, 233, 0.08)',
          boxShadow: '0 -6px 18px rgba(0, 0, 0, 0.35)',
          zIndex: 2,
        }}
      >
        <Button
          onClick={handleLogout}
          variant="contained"
          fullWidth
          startIcon={<LogoutIcon />}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            letterSpacing: 0.4,
            py: 1.1,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #0D4715 0%, #1a5f2e 100%)',
            boxShadow: '0 12px 26px rgba(233, 118, 43, 0.45)',
            border: '1px solid rgba(233, 118, 43, 0.2)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1a5f2e 0%, #0D4715 100%)',
              boxShadow: '0 14px 30px rgba(233, 118, 43, 0.55)',
            },
          }}
        >
          Logout
        </Button>
        <Box
          sx={{
            mt: 2.5,
            display: 'flex',
            justifyContent: 'center',
            opacity: 0.7,
          }}
        >
            <Box
              sx={{
                width: '70%',
                height: 3,
                background:
                  'linear-gradient(90deg, transparent, rgba(233, 118, 43, 0.5), transparent)',
              boxShadow: '0 0 10px rgba(233, 118, 43, 0.3)',
            }}
          />
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Mobile toggle button */}
      <IconButton
        onClick={toggleMobile}
        sx={{
          position: 'fixed',
          top: 12,
          left: 12,
          zIndex: (theme) => theme.zIndex.drawer + 2,
          display: { xs: 'inline-flex', md: 'none' },
          background: 'linear-gradient(135deg, #0D4715 0%, #1a5f2e 100%)',
          color: '#F1F0E9',
          boxShadow: '0 4px 16px rgba(13, 71, 21, 0.4)',
          border: '1px solid rgba(241, 240, 233, 0.1)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1a5f2e 0%, #0D4715 100%)',
            transform: 'scale(1.05)',
            boxShadow: '0 6px 20px rgba(13, 71, 21, 0.5)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Backdrop for mobile */}
      <Backdrop
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          display: { xs: 'block', md: 'none' },
          bgcolor: 'rgba(13, 71, 21, 0.7)',
          backdropFilter: 'blur(4px)',
        }}
        open={mobileOpen}
        onClick={toggleMobile}
      />

      {/* Temporary drawer for mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={toggleMobile}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: '#0D4715',
            boxShadow: '0 20px 60px rgba(13, 71, 21, 0.6)',
            mt: '64px',
            height: 'calc(100% - 64px)',
            borderRadius: '0 16px 16px 0',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Permanent drawer for desktop */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: '#0D4715',
            boxShadow: '0 20px 60px rgba(13, 71, 21, 0.4)',
            mt: '64px',
            height: 'calc(100% - 64px)',
            borderRadius: '0 16px 16px 0',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}

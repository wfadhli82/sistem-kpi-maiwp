import React from 'react';
import { Box, CssBaseline, Drawer, Toolbar, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const drawerWidth = 220;

function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();
  
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const menu = [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { label: 'Admin Utama', icon: <AssessmentIcon />, path: '/admin-utama' },
    { label: 'Admin Bahagian', icon: <NotificationsIcon />, path: '/admin-bahagian' },
    { label: 'Log Keluar', icon: <LogoutIcon />, path: null, action: handleLogout },
  ];
  return (
    <Box sx={{ display: 'flex', bgcolor: '#f4f6f8', minHeight: '100vh' }}>
      <CssBaseline />
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', bgcolor: '#212b36', color: '#fff' },
        }}
      >
        <Toolbar>
          <span style={{ fontWeight: 700, fontSize: 20 }}>Sistem KPI</span>
        </Toolbar>
        {user && (
          <div style={{ padding: '16px', borderBottom: '1px solid #374151' }}>
            <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '4px' }}>Pengguna</div>
            <div style={{ fontSize: '16px', color: '#fff', fontWeight: 600 }}>{user.email}</div>
          </div>
        )}
        <List>
          {menu.map((item, idx) => (
            <ListItem
              key={item.label}
              button
              onClick={() => {
                if (item.action) {
                  item.action();
                } else if (item.path) {
                  navigate(item.path);
                }
              }}
              sx={{
                cursor: 'pointer',
                '& *': { cursor: 'pointer !important' },
                bgcolor: item.path && location.pathname === item.path ? '#1565c0' : 'inherit',
                color: item.path && location.pathname === item.path ? '#fff' : 'inherit',
                fontWeight: item.path && location.pathname === item.path ? 700 : 400,
                borderRadius: 2,
                mb: 0.5,
                transition: 'background 0.2s',
                '&:hover': {
                  bgcolor: item.path ? '#1976d2' : 'inherit',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#fff', cursor: 'pointer !important' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} sx={{ cursor: 'pointer !important' }} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
}

export default MainLayout; 
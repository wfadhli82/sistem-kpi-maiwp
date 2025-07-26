import React from 'react';
import { Box, CssBaseline, Drawer, Toolbar, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const drawerWidth = 220;

function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user, userRole } = useAuth();
  
  console.log('MainLayout - Current user:', user?.email);
  console.log('MainLayout - Current userRole:', userRole);
  console.log('MainLayout - Current location:', location.pathname);
  
  // Debug role changes
  React.useEffect(() => {
    console.log('MainLayout - Role changed to:', userRole);
    console.log('MainLayout - Location changed to:', location.pathname);
    
    // Special debug for Dashboard navigation
    if (location.pathname === '/') {
      console.log('=== DASHBOARD NAVIGATION DEBUG ===');
      console.log('Current userRole:', userRole);
      console.log('Current user:', user?.email);
      console.log('Menu items should include Pengurusan Pengguna:', userRole === 'admin');
    }
  }, [userRole, location.pathname]);
  
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Filter menu based on user role
  const getFilteredMenu = () => {
    const allMenu = [
      { label: 'Dashboard', icon: <DashboardIcon />, path: '/', roles: ['admin', 'admin_bahagian', 'user'] },
      { label: 'Admin Utama', icon: <AssessmentIcon />, path: '/admin-utama', roles: ['admin'] },
      { label: 'Admin Bahagian', icon: <NotificationsIcon />, path: '/admin-bahagian', roles: ['admin', 'admin_bahagian'] },
      { label: 'Pengurusan Pengguna', icon: <PeopleIcon />, path: '/user-management', roles: ['admin'] },
      { label: 'Log Keluar', icon: <LogoutIcon />, path: null, action: handleLogout, roles: ['admin', 'admin_bahagian', 'user'] },
    ];

      console.log('User role in MainLayout:', userRole);
  console.log('All menu items:', allMenu);
  const filteredMenu = allMenu.filter(item => {
    const hasAccess = item.roles.includes(userRole);
    console.log(`Menu "${item.label}": ${hasAccess ? 'SHOW' : 'HIDE'} (roles: ${item.roles}, userRole: ${userRole})`);
    
    // Special debug for Pengurusan Pengguna
    if (item.label === 'Pengurusan Pengguna') {
      console.log('=== PENGURUSAN PENGGUNA DEBUG ===');
      console.log('Item roles:', item.roles);
      console.log('User role:', userRole);
      console.log('Has access:', hasAccess);
      console.log('Roles includes userRole:', item.roles.includes(userRole));
    }
    
    return hasAccess;
  });
  console.log('Filtered menu:', filteredMenu);
  return filteredMenu;
  };

  const menu = getFilteredMenu();
  
  // Force re-render when userRole or location changes
  const menuKey = `${userRole}-${location.pathname}-${Date.now()}`;
  console.log('Final menu array length:', menu.length);
  console.log('Final menu items:', menu.map(item => item.label));
  
  // Check if Pengurusan Pengguna is in the menu
  const hasPengurusanPengguna = menu.some(item => item.label === 'Pengurusan Pengguna');
  console.log('Menu contains Pengurusan Pengguna:', hasPengurusanPengguna);
  
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
        <List key={menuKey}>
          {menu.map((item, idx) => (
            <ListItem
              key={item.label}
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
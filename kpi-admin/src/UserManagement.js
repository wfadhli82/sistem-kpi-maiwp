import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Box,
  Alert
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';

// Available departments
const departments = [
  "BKP", "MCP", "BWP", "UI", "UUU", "BPA", "MCL", "UAD", "BPPH", "UKK", "BPSM", "BAZ", "BTM", 
  "BPI - Dar Assaadah", "BPI - Darul Ilmi", "BPI - Darul Kifayah", "BPI - HQ", "BPI - IKB", "BPI - PMA", 
  "BPI - SMA-MAIWP", "BPI - SMISTA"
];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    department: ''
  });
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });

  // Load users from localStorage on component mount
  useEffect(() => {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
  }, []);

  // Save users to localStorage whenever users state changes
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'user',
        department: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'user',
      department: ''
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.role) {
      setAlert({
        show: true,
        message: 'Sila isi semua medan yang diperlukan',
        severity: 'error'
      });
      return;
    }

    // Check if department is required for admin_bahagian
    if (formData.role === 'admin_bahagian' && !formData.department) {
      setAlert({
        show: true,
        message: 'Bahagian diperlukan untuk Admin Bahagian',
        severity: 'error'
      });
      return;
    }

    if (editingUser) {
      // Update existing user
      const updatedUsers = users.map(user =>
        user.id === editingUser.id
          ? { ...user, ...formData }
          : user
      );
      setUsers(updatedUsers);
      setAlert({
        show: true,
        message: 'Pengguna berjaya dikemaskini',
        severity: 'success'
      });
    } else {
      // Add new user
      const newUser = {
        id: uuidv4(),
        ...formData
      };
      setUsers([...users, newUser]);
      setAlert({
        show: true,
        message: 'Pengguna berjaya ditambah',
        severity: 'success'
      });
    }
    handleCloseDialog();
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Adakah anda pasti mahu memadamkan pengguna ini?')) {
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      setAlert({
        show: true,
        message: 'Pengguna berjaya dipadamkan',
        severity: 'success'
      });
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin':
        return 'Admin Utama (Semua Akses)';
      case 'admin_bahagian':
        return 'Admin Bahagian (Dashboard + Admin Bahagian)';
      case 'user':
        return 'Pengguna (Dashboard Sahaja)';
      default:
        return role;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Pengurusan Pengguna
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Tambah Pengguna
        </Button>
      </Box>

      {alert.show && (
        <Alert
          severity={alert.severity}
          onClose={() => setAlert({ ...alert, show: false })}
          sx={{ mb: 2 }}
        >
          {alert.message}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nama</TableCell>
              <TableCell>Emel</TableCell>
              <TableCell>Peranan</TableCell>
              <TableCell>Bahagian</TableCell>
              <TableCell align="center">Tindakan</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getRoleDisplayName(user.role)}</TableCell>
                <TableCell>{user.department}</TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(user)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={user.role === 'admin' && users.filter(u => u.role === 'admin').length === 1}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Kemaskini Pengguna' : 'Tambah Pengguna Baru'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Nama Penuh"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="email"
            label="Emel"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Peranan</InputLabel>
            <Select
              name="role"
              value={formData.role}
              label="Peranan"
              onChange={handleInputChange}
            >
              <MenuItem value="admin">Admin Utama (Semua Akses)</MenuItem>
              <MenuItem value="admin_bahagian">Admin Bahagian (Dashboard + Admin Bahagian)</MenuItem>
              <MenuItem value="user">Pengguna (Dashboard Sahaja)</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Bahagian</InputLabel>
            <Select
              name="department"
              value={formData.department}
              label="Bahagian"
              onChange={handleInputChange}
              required={formData.role === 'admin_bahagian'}
              error={formData.role === 'admin_bahagian' && !formData.department}
            >
              <MenuItem value="">
                <em>-- Pilih Bahagian --</em>
              </MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
              ))}
            </Select>
            {formData.role === 'admin_bahagian' && !formData.department && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                Bahagian diperlukan untuk Admin Bahagian
              </Typography>
            )}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Batal</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingUser ? 'Kemaskini' : 'Tambah'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement; 
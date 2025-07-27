import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Box, CssBaseline, Grid, Paper, IconButton } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 220;

// Tambah fungsi peratusMinimum jika belum ada
function peratusMinimum(peruntukan, belanja, targetPercent) {
  if (!peruntukan || !belanja || !targetPercent) return null;
  const actualPercent = (belanja / peruntukan) * 100;
  if (actualPercent <= targetPercent) {
    return 100;
  } else {
    const margin = 100 - targetPercent;
    const excess = actualPercent - targetPercent;
    const penaltyRatio = excess / margin;
    const markah = (1 - penaltyRatio) * 100;
    return Math.max(0, Math.round(markah * 100) / 100);
  }
}

function kiraPeratusPencapaian(kpi) {
  // Sama seperti fungsi dalam App.js/UserInterface.js
  if (kpi.kategori === "Bilangan") {
    const sasaran = parseFloat(kpi.target);
    const capai = parseFloat(kpi.bilangan?.pencapaian);
    if (!isNaN(sasaran) && sasaran > 0 && !isNaN(capai)) {
      let percent = (capai / sasaran) * 100;
      if (percent > 100) percent = 100;
      return percent;
    }
    return null;
  }
  if (kpi.kategori === "Peratus") {
    const y = parseFloat(kpi.peratus?.y);
    const x = parseFloat(kpi.peratus?.x);
    const target = parseFloat(kpi.target);
    if (!isNaN(y) && y > 0 && !isNaN(x)) {
      let peratus = (x / y) * 100;
      if (!isNaN(target) && target > 0) {
        let percent = (peratus >= target ? 100 : (peratus / target) * 100);
        if (percent > 100) percent = 100;
        return percent;
      }
      if (peratus > 100) peratus = 100;
      return peratus;
    }
    return null;
  }
  if (kpi.kategori === "Peratus Minimum") {
    const y = parseFloat(kpi.peratus?.y);
    const x = parseFloat(kpi.peratus?.x);
    const target = parseFloat(kpi.target);
    if (!isNaN(y) && y > 0 && !isNaN(x) && !isNaN(target)) {
      return peratusMinimum(y, x, target);
    }
    return null;
  }
  if (kpi.kategori === "Masa") {
    const sasaran = kpi.target;
    const capai = kpi.masa?.tarikhCapai;
    if (sasaran && capai) {
      const sasaranDate = new Date(sasaran);
      const capaiDate = new Date(capai);
      if (capaiDate <= sasaranDate) return 100;
      const msPerDay = 24 * 60 * 60 * 1000;
      const hariLewat = Math.ceil((capaiDate - sasaranDate) / msPerDay);
      let peratus = 100 - (hariLewat * 0.27);
      if (peratus < 0) peratus = 0;
      if (peratus > 100) peratus = 100;
      return peratus;
    }
    return null;
  }
  if (kpi.kategori === "Tahap Kemajuan") {
    if (typeof kpi.tahapSelected !== 'undefined' && kpi.tahapSelected !== null) {
      const row = kpi.tahap[kpi.tahapSelected];
      if (row && row.percent !== "" && !isNaN(parseFloat(row.percent))) {
        let percent = parseFloat(row.percent);
        if (percent > 100) percent = 100;
        return percent;
      }
    }
    return null;
  }
  return null;
}

function Dashboard({ kpiList = [] }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'kpi', 'sku'

  // Tapis data ikut tab
  const filteredList = activeTab === 'all'
    ? kpiList
    : kpiList.filter(item => (item.kategoriUtama || '').toLowerCase() === activeTab);

  // Kira statistik summary
  const peratusList = filteredList.map(kiraPeratusPencapaian).filter(val => val !== null && !isNaN(val));
  const purataPencapaian = peratusList.length > 0 ? (peratusList.reduce((a, b) => a + b, 0) / peratusList.length).toFixed(2) : '0.00';
  const jumlahSKU = filteredList.length;
  const capaiSasaran = peratusList.filter(p => p === 100).length;
  const tidakCapaiSasaran = peratusList.filter(p => p < 100).length;

  // Data summary cards
  let summaryLabel = 'Jumlah SKU & KPI';
  if (activeTab === 'kpi') summaryLabel = 'Bilangan Keseluruhan KPI';
  if (activeTab === 'sku') summaryLabel = 'Bilangan Keseluruhan SKU';
  const summaryData = [
    { 
      label: 'Peratus Pencapaian', 
      value: purataPencapaian + '%', 
      icon: <TrendingUpIcon />,
      iconColor: '#1976d2',
      borderColor: '#e3f2fd'
    },
    { 
      label: summaryLabel, 
      value: jumlahSKU, 
      icon: <AssessmentIcon />,
      iconColor: '#424242',
      borderColor: '#f5f5f5'
    },
    { 
      label: 'Capai Sasaran', 
      value: capaiSasaran, 
      icon: <CheckCircleIcon />,
      iconColor: '#2e7d32',
      borderColor: '#e8f5e8'
    },
    { 
      label: 'Tidak Capai Sasaran', 
      value: tidakCapaiSasaran, 
      icon: <CancelIcon />,
      iconColor: '#d32f2f',
      borderColor: '#ffebee'
    },
  ];

  // Carta 1: Prestasi Bahagian (purata peratus setiap bahagian)
  const bahagianMap = {};
  filteredList.forEach(kpi => {
    let namaBahagian = kpi.department || '-';
    
    // Kumpulkan semua bahagian BPI di bawah satu nama "BPI"
    if (namaBahagian.startsWith('BPI-') || namaBahagian.startsWith('BPI - ')) {
      namaBahagian = 'BPI';
    }
    
    const percent = kiraPeratusPencapaian(kpi);
    if (percent !== null && !isNaN(percent)) {
      if (!bahagianMap[namaBahagian]) {
        bahagianMap[namaBahagian] = { name: namaBahagian, total: 0, jumlah: 0 };
      }
      bahagianMap[namaBahagian].total += 1;
      bahagianMap[namaBahagian].jumlah += percent;
    }
  });
  const dataBahagian = Object.values(bahagianMap).map(b => ({
    name: b.name,
    value: b.total > 0 ? Number((b.jumlah / b.total).toFixed(2)) : 0
  })).sort((a, b) => b.value - a.value);

  // Function untuk tentukan warna berdasarkan peratus pencapaian
  const getBarColor = (value) => {
    if (value >= 100) return '#1565c0'; // Biru gelap untuk 100%
    if (value >= 90) return '#1976d2'; // Biru untuk 90-99%
    if (value >= 80) return '#42a5f5'; // Biru cerah untuk 80-89%
    if (value >= 70) return '#90caf9'; // Biru sangat cerah untuk 70-79%
    if (value >= 60) return '#bbdefb'; // Biru sangat terang untuk 60-69%
    return '#e3f2fd'; // Biru paling terang untuk <60%
  };

  // Carta 2: Taburan Pencapaian SKU
  const taburan = [
    { label: '100%', min: 100, max: 100, color: '#2e7d32' }, // Hijau - Excellent
    { label: '90-99.99%', min: 90, max: 99.9999, color: '#ffb300' }, // Amber - Good
    { label: '80-89.99%', min: 80, max: 89.9999, color: '#ff9800' }, // Orange - Fair
    { label: '70-79.99%', min: 70, max: 79.9999, color: '#f57c00' }, // Dark Orange - Poor
    { label: '69% ke bawah', min: 0, max: 69.9999, color: '#d32f2f' }, // Merah - Very Poor
  ];
  const dataTaburan = taburan.map(range => ({
    name: range.label,
    value: peratusList.filter(p => p >= range.min && p <= range.max).length,
    color: range.color
  }));

  return (
    <Box sx={{ bgcolor: '#f4f6f8', minHeight: '100vh' }}>
      <CssBaseline />
      {/* Main Content */}
      <Box component="main" sx={{ p: 3 }}>
        {/* Submenu/tab */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 3, 
          p: 2, 
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: 3,
          border: '1px solid #e3eafc'
        }}>
          <button 
            onClick={() => setActiveTab('all')} 
            style={{ 
              padding: '12px 28px', 
              background: activeTab === 'all' ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)' : 'transparent', 
              color: activeTab === 'all' ? '#fff' : '#1976d2', 
              border: activeTab === 'all' ? 'none' : '2px solid #1976d2', 
              borderRadius: 12, 
              fontWeight: 700, 
              fontSize: 15, 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === 'all' ? '0 4px 12px rgba(25, 118, 210, 0.3)' : 'none'
            }}
          >
            Pencapaian Keseluruhan
          </button>
          <button 
            onClick={() => setActiveTab('kpi')} 
            style={{ 
              padding: '12px 28px', 
              background: activeTab === 'kpi' ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)' : 'transparent', 
              color: activeTab === 'kpi' ? '#fff' : '#1976d2', 
              border: activeTab === 'kpi' ? 'none' : '2px solid #1976d2', 
              borderRadius: 12, 
              fontWeight: 700, 
              fontSize: 15, 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === 'kpi' ? '0 4px 12px rgba(25, 118, 210, 0.3)' : 'none'
            }}
          >
            Pencapaian KPI
          </button>
          <button 
            onClick={() => setActiveTab('sku')} 
            style={{ 
              padding: '12px 28px', 
              background: activeTab === 'sku' ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)' : 'transparent', 
              color: activeTab === 'sku' ? '#fff' : '#1976d2', 
              border: activeTab === 'sku' ? 'none' : '2px solid #1976d2', 
              borderRadius: 12, 
              fontWeight: 700, 
              fontSize: 15, 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === 'sku' ? '0 4px 12px rgba(25, 118, 210, 0.3)' : 'none'
            }}
          >
            Pencapaian SKU
          </button>
        </Box>
        {/* Header */}
        <AppBar position="static" elevation={0} sx={{ bgcolor: '#fff', color: '#212b36', mb: 3 }}>
          <Toolbar>
            <Typography variant="h5" sx={{ flexGrow: 1 }}>
              Dashboard
            </Typography>
            <IconButton color="inherit">
              <NotificationsIcon />
            </IconButton>
            <Typography variant="subtitle1" sx={{ ml: 2 }}>
              Wan Fadhli
            </Typography>
          </Toolbar>
        </AppBar>
        {/* Summary Cards */}
        <Grid container spacing={3} mb={3} sx={{ display: 'flex', flexWrap: 'nowrap' }}>
          {summaryData.map((item, idx) => (
            <Grid item key={idx} sx={{ flex: '1 1 25%', minWidth: 0 }}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  borderRadius: 4,
                  background: '#ffffff',
                  border: '1px solid #f0f0f0',
                  transition: 'all 0.3s ease',
                  height: '140px',
                  display: 'flex',
                  alignItems: 'center',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                    border: '1px solid #e0e0e0'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Box sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '50%', 
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                    border: `2px solid ${item.borderColor}`,
                    flexShrink: 0
                  }}>
                    <Box sx={{ 
                      color: item.iconColor,
                      fontSize: 20
                    }}>
                      {item.icon}
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 800, 
                        color: '#111827', 
                        mb: 0.5,
                        fontSize: '1.75rem',
                        lineHeight: 1.2,
                        height: '2.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        width: '100%'
                      }}
                    >
                      {item.value}
                    </Typography>
                    <Typography 
                      sx={{ 
                        fontSize: 12, 
                        fontWeight: 500,
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        height: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        width: '100%'
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
        {/* Carta Prestasi Bahagian */}
        <Paper elevation={2} sx={{ p: 4, minHeight: 250, borderRadius: 2, mb: 3, background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#1a237e', mb: 3 }}>
            Carta Prestasi Bahagian (Purata % Pencapaian)
          </Typography>
          {dataBahagian.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dataBahagian} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3eafc" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 14, fill: '#333', fontWeight: 600 }}
                  axisLabel={{ value: 'Bahagian', position: 'insideBottom', offset: -10, fontSize: 16, fontWeight: 700, fill: '#1a237e' }}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fontSize: 14, fill: '#333', fontWeight: 600 }}
                  axisLabel={{ value: 'Purata % Pencapaian', angle: -90, position: 'insideLeft', offset: 10, fontSize: 16, fontWeight: 700, fill: '#1a237e' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e3eafc', 
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[8, 8, 0, 0]}
                >
                  <LabelList 
                    dataKey="value" 
                    position="top" 
                    style={{ fontSize: 16, fontWeight: 700, fill: '#1976d2' }}
                  />
                  {dataBahagian.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
              Tiada data untuk dipaparkan.
            </Box>
          )}
        </Paper>
        {/* Carta Taburan Pencapaian */}
        <Paper elevation={2} sx={{ p: 4, minHeight: 250, borderRadius: 2, mb: 3, background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#1a237e', mb: 3 }}>
            {activeTab === 'kpi' ? 'Taburan Pencapaian KPI' : activeTab === 'sku' ? 'Taburan Pencapaian SKU' : 'Taburan Pencapaian SKU dan KPI'}
          </Typography>
          {dataTaburan.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dataTaburan} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3eafc" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 14, fill: '#333', fontWeight: 600 }}
                  axisLabel={{ value: 'Range Pencapaian', position: 'insideBottom', offset: -10, fontSize: 16, fontWeight: 700, fill: '#1a237e' }}
                />
                <YAxis 
                  allowDecimals={false} 
                  tick={{ fontSize: 14, fill: '#333', fontWeight: 600 }}
                  axisLabel={{ value: 'Bilangan SKU', angle: -90, position: 'insideLeft', offset: 10, fontSize: 16, fontWeight: 700, fill: '#1a237e' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e3eafc', 
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[8, 8, 0, 0]}
                >
                  <LabelList 
                    dataKey="value" 
                    position="top" 
                    style={{ fontSize: 16, fontWeight: 700, fill: '#333' }}
                  />
                  {dataTaburan.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
              Tiada data untuk dipaparkan.
            </Box>
          )}
        </Paper>
        {/* Carta Bilangan Mengikut Bahagian */}
        <Paper elevation={2} sx={{ p: 4, minHeight: 250, borderRadius: 2, mb: 3, background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#1a237e', mb: 3 }}>
            {activeTab === 'kpi' ? 'Bilangan KPI Mengikut Bahagian' : activeTab === 'sku' ? 'Bilangan SKU Mengikut Bahagian' : 'Bilangan SKU dan KPI Mengikut Bahagian'}
          </Typography>
          {(() => {
            // Kira bilangan mengikut bahagian
            const bahagianCountMap = {};
            filteredList.forEach(kpi => {
              let namaBahagian = kpi.department || '-';
              
              // Kumpulkan semua bahagian BPI di bawah satu nama "BPI"
              if (namaBahagian.startsWith('BPI-') || namaBahagian.startsWith('BPI - ')) {
                namaBahagian = 'BPI';
              }
              
              if (!bahagianCountMap[namaBahagian]) {
                bahagianCountMap[namaBahagian] = 0;
              }
              bahagianCountMap[namaBahagian]++;
            });
            
            const dataBilangan = Object.entries(bahagianCountMap).map(([name, value]) => ({
              name,
              value
            })).sort((a, b) => b.value - a.value);
            
            return dataBilangan.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dataBilangan} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3eafc" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 14, fill: '#333', fontWeight: 600 }}
                    axisLabel={{ value: 'Bahagian', position: 'insideBottom', offset: -10, fontSize: 16, fontWeight: 700, fill: '#1a237e' }}
                  />
                  <YAxis 
                    allowDecimals={false} 
                    tick={{ fontSize: 14, fill: '#333', fontWeight: 600 }}
                    axisLabel={{ value: 'Bilangan', angle: -90, position: 'insideLeft', offset: 10, fontSize: 16, fontWeight: 700, fill: '#1a237e' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e3eafc', 
                      borderRadius: 8,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[8, 8, 0, 0]}
                    fill="url(#gradient3)"
                  >
                    <LabelList 
                      dataKey="value" 
                      position="top" 
                      style={{ fontSize: 16, fontWeight: 700, fill: '#333' }}
                    />
                  </Bar>
                  <defs>
                    <linearGradient id="gradient3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9c27b0" />
                      <stop offset="100%" stopColor="#7b1fa2" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                Tiada data untuk dipaparkan.
              </Box>
            );
          })()}
        </Paper>
      </Box>
    </Box>
  );
}

export default Dashboard; 
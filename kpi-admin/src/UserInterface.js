import React, { useState } from "react";
import { useAuth } from './AuthContext';

const departments = [
  "BKP", "MCP", "BWP", "UI", "UUU", "BPA", "MCL", "UAD", "BPPH", "UKK", "BPSM", "BAZ", "BTM", "BPI - Dar Assaadah", "BPI - Darul Ilmi", "BPI - Darul Kifayah", "BPI - HQ", "BPI - IKB", "BPI - PMA", "BPI - SMA-MAIWP", "BPI - SMISTA"
];

function UserInterface({ kpiList, onUpdateKPI }) {
  const { userRole, userDepartment } = useAuth();
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredKPIs, setFilteredKPIs] = useState([]);

  // Get filtered departments based on user role
  const getFilteredDepartments = () => {
    if (userRole === 'admin_bahagian' && userDepartment) {
      return [userDepartment]; // Only show assigned department
    }
    return departments; // Show all departments for admin
  };

  // Filter KPI berdasarkan bahagian dan kategori
  const filterKPIs = () => {
    if (!selectedDepartment || !selectedCategory) {
      setFilteredKPIs([]);
      return;
    }

    const filtered = kpiList.filter(kpi => 
      kpi.department === selectedDepartment && 
      kpi.kategoriUtama === selectedCategory
    );
    setFilteredKPIs(filtered);
  };

  // Handle perubahan dropdown
  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
    setSelectedCategory("");
    setFilteredKPIs([]);
  };

  // Auto-select department for admin_bahagian
  React.useEffect(() => {
    if (userRole === 'admin_bahagian' && userDepartment) {
      setSelectedDepartment(userDepartment);
    }
  }, [userRole, userDepartment]);

  // Ubah handleCategoryChange supaya jika 'Keseluruhan', tapis semua kategori
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    if (selectedDepartment) {
      let filtered;
      if (e.target.value === 'Keseluruhan') {
        filtered = kpiList.filter(kpi => kpi.department === selectedDepartment);
      } else {
        filtered = kpiList.filter(kpi => kpi.department === selectedDepartment && kpi.kategoriUtama === e.target.value);
      }
      setFilteredKPIs(filtered);
    }
  };

  // Handle update data KPI
  const handleUpdateKPI = (kpiIndex, field, value) => {
    const updatedKPI = { ...filteredKPIs[kpiIndex] };
    
    if (field === 'pencapaian') {
      updatedKPI.bilangan.pencapaian = value;
    } else if (field === 'tarikhCapai') {
      updatedKPI.masa.tarikhCapai = value;
    } else if (field === 'peratusX') {
      updatedKPI.peratus.x = value;
    } else if (field === 'peratusY') {
      updatedKPI.peratus.y = value;
    } else if (field === 'tahapSelected') {
      updatedKPI.tahapSelected = parseInt(value);
    } else {
      updatedKPI[field] = value;
    }

    // Kira % Perbelanjaan
    const peruntukan = parseFloat(updatedKPI.peruntukan);
    const perbelanjaan = parseFloat(updatedKPI.perbelanjaan);
    let percentBelanja = "-";
    if (!isNaN(peruntukan) && peruntukan > 0 && !isNaN(perbelanjaan)) {
      let percent = (perbelanjaan / peruntukan) * 100;
      if (percent > 100) percent = 100;
      percentBelanja = percent.toFixed(2) + "%";
    }
    updatedKPI.percentBelanja = percentBelanja;

    // Update dalam filteredKPIs
    const newFilteredKPIs = [...filteredKPIs];
    newFilteredKPIs[kpiIndex] = updatedKPI;
    setFilteredKPIs(newFilteredKPIs);

    // Update dalam kpiList asal
    const originalIndex = kpiList.findIndex(kpi => 
      kpi.department === updatedKPI.department && 
      kpi.kpi === updatedKPI.kpi &&
      kpi.kategoriUtama === updatedKPI.kategoriUtama
    );
    
    if (originalIndex !== -1) {
      onUpdateKPI(originalIndex, updatedKPI);
    }
  };

  // Tambah helper untuk format RM
  function formatRM(val) {
    if (val === null || val === undefined || val === "") return "";
    const num = Number(val);
    if (isNaN(num)) return val;
    return num.toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Render input field berdasarkan kategori
  const renderInputField = (kpi, index) => {
    switch (kpi.kategori) {
      case "Bilangan":
        return (
          <input
            type="number"
            value={kpi.bilangan.pencapaian || ""}
            onChange={(e) => handleUpdateKPI(index, 'pencapaian', e.target.value)}
            style={{ width: '84px', padding: 8, borderRadius: 6, border: '1px solid #1976d2', fontSize: 14 }}
            placeholder="Masukkan pencapaian"
          />
        );
      case "Peratus":
        return (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ minWidth: 60, fontWeight: 600, color: '#1976d2' }}>{kpi.peratus.labelY || 'y'}:</span>
            <input
              type="number"
              value={kpi.peratus.y || ""}
              onChange={(e) => handleUpdateKPI(index, 'peratusY', e.target.value)}
              style={{ width: '70px', padding: 8, borderRadius: 6, border: '1px solid #1976d2', fontSize: 14 }}
              placeholder="y"
            />
            <span style={{ minWidth: 60, fontWeight: 600, color: '#1976d2' }}>{kpi.peratus.labelX || 'x'}:</span>
            <input
              type="number"
              value={kpi.peratus.x || ""}
              onChange={(e) => handleUpdateKPI(index, 'peratusX', e.target.value)}
              style={{ width: '70px', padding: 8, borderRadius: 6, border: '1px solid #1976d2', fontSize: 14 }}
              placeholder="x"
            />
          </div>
        );
      case "Masa":
        return (
          <input
            type="date"
            value={kpi.masa.tarikhCapai || ""}
            onChange={(e) => handleUpdateKPI(index, 'tarikhCapai', e.target.value)}
            style={{ width: "100%", padding: 8, borderRadius: 6, border: '1px solid #1976d2', fontSize: 14 }}
          />
        );
      case "Tahap Kemajuan":
        return (
          <select
            value={kpi.tahapSelected || ""}
            onChange={(e) => handleUpdateKPI(index, 'tahapSelected', e.target.value)}
            style={{ width: "100%", padding: 8, borderRadius: 6, border: '1px solid #1976d2', fontSize: 14 }}
          >
            <option value="">-- Pilih Tahap --</option>
            {kpi.tahap.map((tahap, idx) => (
              <option key={idx} value={idx}>
                {tahap.statement} ({tahap.percent}%)
              </option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  // Fungsi untuk kira peratus pencapaian
  const kiraPeratusPencapaian = (kpi) => {
    if (kpi.kategori === "Bilangan") {
      const sasaran = parseFloat(kpi.target);
      const capai = parseFloat(kpi.bilangan.pencapaian);
      if (!isNaN(sasaran) && sasaran > 0 && !isNaN(capai)) {
        let percent = (capai / sasaran) * 100;
        if (percent > 100) percent = 100;
        return percent.toFixed(2) + "%";
      }
      return "-";
    }
    if (kpi.kategori === "Peratus") {
      const y = parseFloat(kpi.peratus.y);
      const x = parseFloat(kpi.peratus.x);
      const target = parseFloat(kpi.target);
      if (!isNaN(y) && y > 0 && !isNaN(x)) {
        let peratus = (x / y) * 100;
        if (!isNaN(target) && target > 0) {
          let percent = (peratus >= target ? 100 : (peratus / target) * 100);
          if (percent > 100) percent = 100;
          return percent.toFixed(2) + "%";
        }
        if (peratus > 100) peratus = 100;
        return peratus.toFixed(2) + "%";
      }
      return "-";
    }
    if (kpi.kategori === "Masa") {
      const sasaran = kpi.target;
      const capai = kpi.masa.tarikhCapai;
      if (sasaran && capai) {
        const sasaranDate = new Date(sasaran);
        const capaiDate = new Date(capai);
        if (capaiDate <= sasaranDate) return "100%";
        const msPerDay = 24 * 60 * 60 * 1000;
        const hariLewat = Math.ceil((capaiDate - sasaranDate) / msPerDay);
        let peratus = 100 - (hariLewat * 0.27);
        if (peratus < 0) peratus = 0;
        if (peratus > 100) peratus = 100;
        return peratus.toFixed(2) + "%";
      }
      return "-";
    }
    if (kpi.kategori === "Tahap Kemajuan") {
      if (typeof kpi.tahapSelected !== 'undefined' && kpi.tahapSelected !== null) {
        const row = kpi.tahap[kpi.tahapSelected];
        if (row && row.percent !== "" && !isNaN(parseFloat(row.percent))) {
          let percent = parseFloat(row.percent);
          if (percent > 100) percent = 100;
          return percent.toFixed(2) + "%";
        }
      }
      return "-";
    }
    return "-";
  };

  return (
    <div style={{ width: "100%", maxWidth: 1200, margin: "24px auto", padding: "2vw", background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px #dbeafe", fontFamily: 'Poppins, Arial, sans-serif' }}>
      <h2 style={{ fontWeight: 700, color: '#1976d2', letterSpacing: 1, marginBottom: 28, textAlign: 'center' }}>Sistem KPI/SKU - User Interface</h2>
      
      {/* Filter Section */}
      <div style={{ background: '#f8fafc', padding: 24, borderRadius: 12, marginBottom: 32, border: '2px solid #e3eafc' }}>
        <h3 style={{ fontWeight: 600, color: '#222', marginBottom: 20 }}>Pilih Bahagian dan Kategori</h3>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontWeight: 600, marginBottom: 8, display: 'block', color: '#222' }}>Bahagian:</label>
            <select 
              value={selectedDepartment} 
              onChange={handleDepartmentChange}
              disabled={userRole === 'admin_bahagian'}
              style={{ 
                width: '100%', 
                padding: 12, 
                borderRadius: 8, 
                border: '1.5px solid #1976d2', 
                fontSize: 16, 
                outline: 'none',
                opacity: userRole === 'admin_bahagian' ? 0.6 : 1,
                backgroundColor: userRole === 'admin_bahagian' ? '#f5f5f5' : '#fff'
              }}
            >
              <option value="">-- Pilih Bahagian --</option>
              {getFilteredDepartments().map((dept, i) => (
                <option key={i} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontWeight: 600, marginBottom: 8, display: 'block', color: '#222' }}>Kategori:</label>
            <select 
              value={selectedCategory} 
              onChange={handleCategoryChange}
              disabled={!selectedDepartment}
              style={{ width: '100%', padding: 12, borderRadius: 8, border: '1.5px solid #1976d2', fontSize: 16, outline: 'none', opacity: selectedDepartment ? 1 : 0.6 }}
            >
              <option value="">-- Pilih Kategori --</option>
              <option value="Keseluruhan">Keseluruhan</option>
              <option value="KPI">KPI</option>
              <option value="SKU">SKU</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI List */}
      {filteredKPIs.length > 0 && (
        <div style={{ background: '#f8fafc', padding: 24, borderRadius: 12, border: '2px solid #e3eafc' }}>
          <h3 style={{ fontWeight: 600, color: '#222', marginBottom: 20 }}>Senarai KPI/SKU untuk {selectedDepartment} - {selectedCategory === 'Keseluruhan' ? 'Semua Kategori' : selectedCategory}</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px #e3eafc' }}>
              <thead>
                <tr style={{ background: '#1565c0', color: '#fff' }}>
                  <th style={{ padding: 12, fontWeight: 700, textAlign: 'left', fontSize: 14 }}>Pernyataan</th>
                  <th style={{ padding: 12, fontWeight: 700, textAlign: 'left', fontSize: 14 }}>Kaedah Pengukuran</th>
                  <th style={{ padding: 12, fontWeight: 700, textAlign: 'left', fontSize: 14 }}>Target</th>
                  <th style={{ padding: 12, fontWeight: 700, textAlign: 'left', fontSize: 14 }}>Pencapaian</th>
                  <th style={{ padding: 12, fontWeight: 700, textAlign: 'center', fontSize: 14 }}>% Pencapaian</th>
                  <th style={{ padding: 12, fontWeight: 700, textAlign: 'right', fontSize: 14 }}>Peruntukan (RM)</th>
                  <th style={{ padding: 12, fontWeight: 700, textAlign: 'right', fontSize: 14 }}>Perbelanjaan (RM)</th>
                  <th style={{ padding: 12, fontWeight: 700, textAlign: 'right', fontSize: 14 }}>% Perbelanjaan</th>
                </tr>
              </thead>
              <tbody>
                {filteredKPIs.map((kpi, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #e3eafc', background: index % 2 === 0 ? '#f8fafc' : '#fff' }}>
                    <td style={{ padding: 12, fontSize: 14, fontWeight: 500 }}>{kpi.kpi}</td>
                    <td style={{ padding: 12, fontSize: 14 }}>{kpi.kategori}</td>
                    <td style={{ padding: 12, fontSize: 14 }}>{kpi.target}</td>
                    <td style={{ padding: 12, fontSize: 14 }}>
                      {renderInputField(kpi, index)}
                    </td>
                    <td style={{ padding: 12, fontSize: 14, textAlign: 'center', fontWeight: 700, color: '#1976d2' }}>
                      {kiraPeratusPencapaian(kpi)}
                    </td>
                    <td style={{ padding: 12, fontSize: 14, textAlign: 'right' }}>
                      <input
                        type="text"
                        value={typeof kpi.peruntukan === 'number' || (kpi.peruntukan && kpi.peruntukan !== "") ? formatRM(kpi.peruntukan) : ""}
                        onChange={e => {
                          // Buang semua selain nombor dan titik
                          const raw = e.target.value.replace(/[^\d.]/g, "");
                          handleUpdateKPI(index, 'peruntukan', raw);
                        }}
                        onBlur={e => {
                          // Formatkan bila keluar fokus
                          handleUpdateKPI(index, 'peruntukan', formatRM(e.target.value.replace(/[^\d.]/g, "")));
                        }}
                        style={{ width: 120, padding: 8, borderRadius: 6, border: '1px solid #1976d2', fontSize: 14, textAlign: 'right' }}
                        placeholder="0.00"
                      />
                    </td>
                    <td style={{ padding: 12, fontSize: 14, textAlign: 'right' }}>
                      <input
                        type="text"
                        value={typeof kpi.perbelanjaan === 'number' || (kpi.perbelanjaan && kpi.perbelanjaan !== "") ? formatRM(kpi.perbelanjaan) : ""}
                        onChange={e => {
                          const raw = e.target.value.replace(/[^\d.]/g, "");
                          handleUpdateKPI(index, 'perbelanjaan', raw);
                        }}
                        onBlur={e => {
                          handleUpdateKPI(index, 'perbelanjaan', formatRM(e.target.value.replace(/[^\d.]/g, "")));
                        }}
                        style={{ width: 120, padding: 8, borderRadius: 6, border: '1px solid #1976d2', fontSize: 14, textAlign: 'right' }}
                        placeholder="0.00"
                      />
                    </td>
                    <td style={{ padding: 12, fontSize: 14, textAlign: 'right', fontWeight: 700, color: '#1976d2' }}>
                      {kpi.percentBelanja || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedDepartment && selectedCategory && filteredKPIs.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, background: '#f8fafc', borderRadius: 12, border: '2px solid #e3eafc' }}>
          <p style={{ fontSize: 16, color: '#666' }}>Tiada KPI/SKU dijumpai untuk {selectedDepartment} - {selectedCategory === 'Keseluruhan' ? 'Semua Kategori' : selectedCategory}</p>
        </div>
      )}
    </div>
  );
}

export default UserInterface; 
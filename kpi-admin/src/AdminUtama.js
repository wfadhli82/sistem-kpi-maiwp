import React, { useState } from 'react';
import { NumericFormat } from 'react-number-format';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from './AuthContext';

const departments = [
  "BKP", "MCP", "BWP", "UI", "UUU", "BPA", "MCL", "UAD", "BPPH", "UKK", "BPSM", "BAZ", "BTM", "BPI - Dar Assaadah", "BPI - Darul Ilmi", "BPI - Darul Kifayah", "BPI - HQ", "BPI - IKB", "BPI - PMA", "BPI - SMA-MAIWP", "BPI - SMISTA"
];

const kategoriOptions = [
  "Bilangan",
  "Peratus",
  "Masa",
  "Tahap Kemajuan",
  "Peratus Minimum" // Tambah pilihan baru
];

const initialForm = {
  department: "",
  kategoriUtama: "",
  kpi: "",
  target: "",
  kategori: "",
  bilangan: { sasaran: "", pencapaian: "" },
  peratus: { x: "", y: "", labelX: "", labelY: "" },
  peratusMinimum: { x: "", y: "", labelX: "", labelY: "" },
  masa: { sasaranTarikh: "", tarikhCapai: "" },
  tahap: [
    { statement: "", percent: "" },
    { statement: "", percent: "" },
    { statement: "", percent: "" },
    { statement: "", percent: "" }
  ],
  peruntukan: "",
  perbelanjaan: "",
};

function AdminUtama({ kpiList, setKpiList, handleDownloadExcel, handleExcelUpload }) {
  const { userRole, userDepartment } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [editIdx, setEditIdx] = useState(null);
  const [tahapSelected, setTahapSelected] = useState(null);
  const [filterBahagian, setFilterBahagian] = useState('Keseluruhan');
  const [filterKategoriUtama, setFilterKategoriUtama] = useState('Keseluruhan');

  // Dapatkan senarai bahagian unik dari data
  const bahagianList = Array.from(new Set(kpiList.map(item => item.department))).filter(Boolean);

  // Tapis data ikut filter dan user role
  const filteredKpiList = kpiList.filter(item => {
    // Role-based filtering
    if (userRole === 'admin_bahagian' && userDepartment) {
      // Admin bahagian hanya boleh tengok bahagian mereka
      if (item.department !== userDepartment) {
        return false;
      }
    }
    
    // Regular filtering
    const matchBahagian = filterBahagian === 'Keseluruhan' || item.department === filterBahagian;
    const matchKategori = filterKategoriUtama === 'Keseluruhan' || (item.kategoriUtama || '').toUpperCase() === filterKategoriUtama.toUpperCase();
    return matchBahagian && matchKategori;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleKategoriChange = (e) => {
    setForm((prev) => ({
      ...prev,
      kategori: e.target.value
    }));
  };

  const handleBilanganChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      bilangan: {
        ...prev.bilangan,
        [name]: value
      }
    }));
  };

  const handlePeratusChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      peratus: {
        ...prev.peratus,
        [name]: value
      }
    }));
  };

  const handleMasaChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      masa: {
        ...prev.masa,
        [name]: value
      }
    }));
  };

  const handleTahapChange = (idx, field, value) => {
    setForm((prev) => {
      const tahap = [...prev.tahap];
      tahap[idx][field] = value;
      return { ...prev, tahap };
    });
  };

  const handleTahapSelect = (idx) => {
    setTahapSelected(idx);
  };

  const handleSave = (e) => {
    e.preventDefault();
    let dataToSave = { ...form };
    if (form.kategori === "Tahap Kemajuan") {
      dataToSave.tahapSelected = tahapSelected;
    }
    // Tambah logic untuk Peratus Minimum
    if (form.kategori === "Peratus Minimum") {
      dataToSave.peratusMinimum = { ...form.peratusMinimum };
    }
    // Kira % Perbelanjaan
    const peruntukan = parseFloat(form.peruntukan);
    const perbelanjaan = parseFloat(form.perbelanjaan);
    let percentBelanja = "-";
    if (!isNaN(peruntukan) && peruntukan > 0 && !isNaN(perbelanjaan)) {
      let percent = (perbelanjaan / peruntukan) * 100;
      if (percent > 100) percent = 100;
      percentBelanja = percent.toFixed(2) + "%";
    }
    dataToSave.percentBelanja = percentBelanja;
    if (editIdx !== null) {
      setKpiList((prev) => prev.map((item, idx) => idx === editIdx ? dataToSave : item));
      setEditIdx(null);
    } else {
      setKpiList((prev) => [...prev, dataToSave]);
    }
    setForm(initialForm);
    setTahapSelected(null);
  };

  const handleEdit = (idx) => {
    setForm(kpiList[idx]);
    setEditIdx(idx);
    if (kpiList[idx].kategori === "Tahap Kemajuan") {
      setTahapSelected(kpiList[idx].tahapSelected ?? null);
    } else {
      setTahapSelected(null);
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
        if (capaiDate <= sasaranDate) return "100.00%";
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
    if (kpi.kategori === "Peratus Minimum") {
      const y = parseFloat(kpi.peratusMinimum?.y);
      const x = parseFloat(kpi.peratusMinimum?.x);
      const target = parseFloat(kpi.target);
      if (!isNaN(y) && y > 0 && !isNaN(x) && !isNaN(target)) {
        return peratusMinimum(y, x, target) + "%";
      }
      return "-";
    }
    return "-";
  };

  // Tambah fungsi peratusMinimum
  function peratusMinimum(peruntukan, belanja, targetPercent) {
    if (!peruntukan || !belanja || !targetPercent) return "Data tidak lengkap";
    const actualPercent = (belanja / peruntukan) * 100;
    if (actualPercent <= targetPercent) {
      return "100.00";
    } else {
      const margin = 100 - targetPercent;
      const excess = actualPercent - targetPercent;
      const penaltyRatio = excess / margin;
      const markah = (1 - penaltyRatio) * 100;
      return Math.max(0, Math.round(markah * 100) / 100).toFixed(2);
    }
  }

  // Tambah handler delete
  const handleDelete = (idx) => {
    if (window.confirm('Anda pasti mahu padam data ini?')) {
      setKpiList(prev => prev.filter((_, i) => i !== idx));
    }
  };

  // Tambah helper untuk format nombor
  function formatNumber(val) {
    console.log('formatNumber input:', val, typeof val);
    if (val === null || val === undefined || val === "") return "";
    const num = Number(val);
    if (isNaN(num)) return val;
    // Format dengan koma untuk nombor yang lebih besar
    const formatted = num.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
    console.log('formatNumber output:', formatted);
    return formatted;
  }

  // Tambah handler untuk peratusMinimum
  const handlePeratusMinimumChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      peratusMinimum: {
        ...prev.peratusMinimum,
        [name]: value
      }
    }));
  };

  return (
    <div style={{ width: "100%", maxWidth: 1200, margin: "24px auto", padding: "2vw", background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px #dbeafe", fontFamily: 'Poppins, Arial, sans-serif' }}>
      <h2 style={{ fontWeight: 700, color: '#222', marginBottom: 18 }}>Senarai KPI/ SKU</h2>
      
      {/* Borang Data Entry */}
      <div style={{ flex: 1, minWidth: 320, maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ fontWeight: 700, color: '#1976d2', letterSpacing: 1, marginBottom: 28 }}>Maklumat Untuk Diisi oleh Admin</h2>
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontWeight: 600, marginBottom: 6, display: 'block', color: '#222' }}>Bahagian:</label>
            <select name="department" value={form.department} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid #1976d2', fontSize: 16, outline: 'none', wordBreak: 'break-word', whiteSpace: 'pre-line' }}>
              <option value="">-- Pilih --</option>
              {departments.map((d, i) => (
                <option key={i} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontWeight: 600, marginBottom: 6, display: 'block', color: '#222' }}>Kategori:</label>
            <select name="kategoriUtama" value={form.kategoriUtama || ''} onChange={e => setForm(prev => ({ ...prev, kategoriUtama: e.target.value }))} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid #1976d2', fontSize: 16, outline: 'none', wordBreak: 'break-word', whiteSpace: 'pre-line' }}>
              <option value="">-- Pilih --</option>
              <option value="KPI">KPI</option>
              <option value="SKU">SKU</option>
            </select>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontWeight: 600, marginBottom: 6, display: 'block', color: '#222' }}>Kaedah Pengukuran:</label>
            <select name="kategori" value={form.kategori} onChange={handleKategoriChange} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid #1976d2', fontSize: 16, outline: 'none', wordBreak: 'break-word', whiteSpace: 'pre-line' }}>
              <option value="">-- Pilih --</option>
              {kategoriOptions.map((k, i) => (
                <option key={i} value={k}>{k}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontWeight: 600, marginBottom: 6, display: 'block', color: '#222' }}>Pernyataan:</label>
            <input type="text" name="kpi" value={form.kpi} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 8, border: '1.5px solid #1976d2', fontSize: 16, outline: 'none', wordBreak: 'break-word', whiteSpace: 'pre-line' }} required />
          </div>
          {(form.kategori === "Bilangan" || form.kategori === "Peratus") ? (
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontWeight: 600, marginBottom: 6, display: 'block', color: '#222' }}>Sasaran{form.kategori === "Peratus" ? " (%)" : ""}:</label>
              {form.kategori === "Bilangan" ? (
                <NumericFormat
                  thousandSeparator="," 
                  decimalSeparator="."
                  allowNegative={false}
                  decimalScale={0}
                  fixedDecimalScale={false}
                  name="target"
                  value={form.target}
                  onValueChange={({ value }) => setForm(prev => ({ ...prev, target: value }))}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: '1.5px solid #1976d2', fontSize: 16, outline: 'none', wordBreak: 'break-word', whiteSpace: 'pre-line' }}
                  required
                />
              ) : (
                <input type="number" name="target" value={form.target} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 8, border: '1.5px solid #1976d2', fontSize: 16, outline: 'none', wordBreak: 'break-word', whiteSpace: 'pre-line' }} required />
              )}
              {form.kategori === "Bilangan" && (
                <>
                  <label style={{ fontWeight: 600, margin: '16px 0 6px 0', display: 'block', color: '#222' }}>Pencapaian:</label>
                  <NumericFormat
                    thousandSeparator="," 
                    decimalSeparator="."
                    allowNegative={false}
                    decimalScale={0}
                    fixedDecimalScale={false}
                    name="pencapaian"
                    value={form.bilangan.pencapaian}
                    onValueChange={({ value }) => handleBilanganChange({ target: { name: 'pencapaian', value } })}
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: '1.5px solid #1976d2', fontSize: 16, outline: 'none', wordBreak: 'break-word', whiteSpace: 'pre-line' }}
                  />
                </>
              )}
            </div>
          ) : null}
          {form.kategori === "Masa" && (
            <div style={{ marginBottom: 20, display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 600, marginBottom: 6, display: 'block', color: '#222' }}>Sasaran:</label>
                <input type="date" name="target" value={form.target} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 8, border: '1.5px solid #1976d2', fontSize: 16, outline: 'none', wordBreak: 'break-word', whiteSpace: 'pre-line' }} required />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 600, marginBottom: 6, display: 'block', color: '#222' }}>Tarikh Berjaya Dicapai:</label>
                <input type="date" name="tarikhCapai" value={form.masa.tarikhCapai} onChange={handleMasaChange} style={{ width: "100%", padding: 10, borderRadius: 8, border: '1.5px solid #1976d2', fontSize: 16, outline: 'none', wordBreak: 'break-word', whiteSpace: 'pre-line' }} />
              </div>
            </div>
          )}
          {form.kategori === "Peratus" && (
            <div style={{ marginBottom: 20, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Label y:</label>
                <input type="text" name="labelY" value={form.peratus.labelY} onChange={handlePeratusChange} placeholder="Contoh: Jumlah Peruntukan (RM)" style={{ width: "100%", padding: 8, borderRadius: 8, border: '1.5px solid #bdbdbd', fontSize: 15, outline: 'none', wordBreak: 'break-word', whiteSpace: 'pre-line' }} />
                <label style={{ fontWeight: 500, margin: '8px 0 4px 0', display: 'block' }}>y:</label>
                <NumericFormat
                  thousandSeparator="," 
                  decimalSeparator="."
                  allowNegative={false}
                  decimalScale={0}
                  fixedDecimalScale={false}
                  name="y"
                  value={form.peratus.y}
                  onValueChange={({ value }) => handlePeratusChange({ target: { name: 'y', value } })}
                  style={{ width: "100%", padding: 8, borderRadius: 8, border: '1.5px solid #bdbdbd', fontSize: 15, outline: 'none', wordBreak: 'break-word', whiteSpace: 'pre-line' }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Label x:</label>
                <input type="text" name="labelX" value={form.peratus.labelX} onChange={handlePeratusChange} placeholder="Contoh: Jumlah Belanja (RM)" style={{ width: "100%", padding: 8, borderRadius: 8, border: '1.5px solid #bdbdbd', fontSize: 15, outline: 'none', wordBreak: 'break-word', whiteSpace: 'pre-line' }} />
                <label style={{ fontWeight: 500, margin: '8px 0 4px 0', display: 'block' }}>x:</label>
                <NumericFormat
                  thousandSeparator="," 
                  decimalSeparator="."
                  allowNegative={false}
                  decimalScale={0}
                  fixedDecimalScale={false}
                  name="x"
                  value={form.peratus.x}
                  onValueChange={({ value }) => handlePeratusChange({ target: { name: 'x', value } })}
                  style={{ width: "100%", padding: 8, borderRadius: 8, border: '1.5px solid #bdbdbd', fontSize: 15, outline: 'none', wordBreak: 'break-word', whiteSpace: 'pre-line' }}
                />
              </div>
            </div>
          )}
          {form.kategori === "Peratus Minimum" && (
            <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 0 }}>
              <div style={{ marginBottom: 16, maxWidth: 320 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Sasaran (%)</label>
                <input type="number" name="target" value={form.target} onChange={handleChange} style={{ width: "100%", padding: 8, borderRadius: 8, border: '1.5px solid #bdbdbd', fontSize: 15, outline: 'none', wordBreak: 'break-word', whiteSpace: 'pre-line' }} />
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Label y:</label>
                  <input type="text" name="labelY" value={form.peratusMinimum?.labelY || ""} onChange={handlePeratusMinimumChange} placeholder="Contoh: Jumlah Peruntukan (RM)" style={{ width: "100%", padding: 8, borderRadius: 8, border: '1.5px solid #bdbdbd', fontSize: 15, outline: 'none', wordBreak: 'break-word', whiteSpace: 'pre-line' }} />
                  <label style={{ fontWeight: 500, margin: '8px 0 4px 0', display: 'block' }}>y:</label>
                  <NumericFormat
                    thousandSeparator="," 
                    decimalSeparator="."
                    allowNegative={false}
                    decimalScale={0}
                    fixedDecimalScale={false}
                    name="y"
                    value={form.peratusMinimum?.y || ""}
                    onValueChange={({ value }) => handlePeratusMinimumChange({ target: { name: 'y', value } })}
                    style={{ width: "100%", padding: 8, borderRadius: 8, border: '1.5px solid #bdbdbd', fontSize: 15, outline: 'none', wordBreak: 'break-word', whiteSpace: 'pre-line' }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Label x:</label>
                  <input type="text" name="labelX" value={form.peratusMinimum?.labelX || ""} onChange={handlePeratusMinimumChange} placeholder="Contoh: Jumlah Belanja (RM)" style={{ width: "100%", padding: 8, borderRadius: 8, border: '1.5px solid #bdbdbd', fontSize: 15, outline: 'none', wordBreak: 'break-word', whiteSpace: 'pre-line' }} />
                  <label style={{ fontWeight: 500, margin: '8px 0 4px 0', display: 'block' }}>x:</label>
                  <NumericFormat
                    thousandSeparator="," 
                    decimalSeparator="."
                    allowNegative={false}
                    decimalScale={0}
                    fixedDecimalScale={false}
                    name="x"
                    value={form.peratusMinimum?.x || ""}
                    onValueChange={({ value }) => handlePeratusMinimumChange({ target: { name: 'x', value } })}
                    style={{ width: "100%", padding: 8, borderRadius: 8, border: '1.5px solid #bdbdbd', fontSize: 15, outline: 'none', wordBreak: 'break-word', whiteSpace: 'pre-line' }}
                  />
                </div>
              </div>
            </div>
          )}
          {form.kategori === "Tahap Kemajuan" && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontWeight: 600, marginBottom: 8, display: 'block', color: '#222' }}>Tahap Kemajuan:</label>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8, background: '#f8fafc', tableLayout: 'fixed' }}>
                <colgroup>
                  <col span="1" style={{ width: '60%' }} />
                  <col span="1" style={{ width: '12%' }} />
                  <col span="1" style={{ width: '10%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={{ border: "1.5px solid #1976d2", background: '#e3eafc', color: '#1976d2', fontWeight: 700, padding: 8 }}>Pernyataan</th>
                    <th style={{ border: "1.5px solid #1976d2", background: '#e3eafc', color: '#1976d2', fontWeight: 700, padding: 8 }}>Peratusan (%)</th>
                    <th style={{ border: "1.5px solid #1976d2", background: '#e3eafc', color: '#1976d2', fontWeight: 700, padding: 8 }}>Pencapaian Terkini</th>
                  </tr>
                </thead>
                <tbody>
                  {form.tahap.map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ border: "1.5px solid #bdbdbd", padding: 6 }}>
                        <input
                          type="text"
                          value={row.statement}
                          onChange={e => handleTahapChange(idx, "statement", e.target.value)}
                          style={{ width: "100%", minWidth: 0, boxSizing: 'border-box', padding: 7, borderRadius: 7, border: '1.5px solid #bdbdbd', fontSize: 15, outline: 'none', wordBreak: 'break-word', whiteSpace: 'pre-line' }}
                        />
                      </td>
                      <td style={{ border: "1.5px solid #bdbdbd", padding: 6 }}>
                        <input
                          type="number"
                          value={row.percent}
                          onChange={e => handleTahapChange(idx, "percent", e.target.value)}
                          style={{ width: "100%", minWidth: 0, boxSizing: 'border-box', padding: 7, borderRadius: 7, border: '1.5px solid #bdbdbd', fontSize: 15, outline: 'none', wordBreak: 'break-word', whiteSpace: 'pre-line' }}
                        />
                      </td>
                      <td style={{ border: "1.5px solid #bdbdbd", textAlign: "center" }}>
                        <input
                          type="radio"
                          name="tahapSelected"
                          checked={tahapSelected === idx}
                          onChange={() => handleTahapSelect(idx)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ marginBottom: 20, display: 'flex', gap: 16, justifyContent: 'flex-start' }}>
            <div style={{ minWidth: 0 }}>
              <label style={{ fontWeight: 600, marginBottom: 6, display: 'block', color: '#222' }}>Peruntukan (RM):</label>
              <NumericFormat
                thousandSeparator="," 
                decimalSeparator="."
                prefix="RM "
                allowNegative={false}
                decimalScale={2}
                fixedDecimalScale={true}
                name="peruntukan"
                value={form.peruntukan}
                onValueChange={({ value }) => setForm(prev => ({ ...prev, peruntukan: value }))}
                style={{ width: 220, padding: 10, borderRadius: 8, border: '1.5px solid #1976d2', fontSize: 16, outline: 'none', wordBreak: 'break-word', whiteSpace: 'pre-line' }}
                required
              />
            </div>
            <div style={{ minWidth: 0 }}>
              <label style={{ fontWeight: 600, marginBottom: 6, display: 'block', color: '#222' }}>Perbelanjaan (RM):</label>
              <NumericFormat
                thousandSeparator="," 
                decimalSeparator="."
                prefix="RM "
                allowNegative={false}
                decimalScale={2}
                fixedDecimalScale={true}
                name="perbelanjaan"
                value={form.perbelanjaan}
                onValueChange={({ value }) => setForm(prev => ({ ...prev, perbelanjaan: value }))}
                style={{ width: 220, padding: 10, borderRadius: 8, border: '1.5px solid #1976d2', fontSize: 16, outline: 'none', wordBreak: 'break-word', whiteSpace: 'pre-line' }}
                required
              />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 8 }}>
            <button type="submit" style={{ padding: "12px 32px", background: editIdx !== null ? "#ffa000" : "#1976d2", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 18, letterSpacing: 1, boxShadow: '0 2px 8px #e3eafc', transition: 'background 0.2s' }}>{editIdx !== null ? "Kemas Kini" : "Simpan"}</button>
          </div>
        </form>
      </div>
      {/* Garisan pemisah antara form dan filter/jadual */}
      <hr style={{ border: 'none', borderTop: '2px solid #e3eafc', margin: '32px 0 24px 0' }} />
      {/* Filter dan butang di atas table */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', margin: '24px 0 8px 0', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <div>
            <label style={{ fontWeight: 600, marginRight: 8 }}>Bahagian:</label>
            <select value={filterBahagian} onChange={e => setFilterBahagian(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1.5px solid #1976d2', fontSize: 15 }}>
              <option value="Keseluruhan">Keseluruhan</option>
              {bahagianList.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 600, marginRight: 8 }}>Kategori:</label>
            <select value={filterKategoriUtama} onChange={e => setFilterKategoriUtama(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1.5px solid #1976d2', fontSize: 15 }}>
              <option value="Keseluruhan">Keseluruhan</option>
              <option value="KPI">KPI</option>
              <option value="SKU">SKU</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <button
            onClick={handleDownloadExcel}
            type="button"
            style={{ padding: '10px 24px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 15, boxShadow: '0 1px 4px #e3eafc' }}
          >
            Muat Turun Excel
          </button>
          <label style={{ padding: '10px 24px', background: '#ffa000', color: '#fff', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 15, boxShadow: '0 1px 4px #e3eafc', marginBottom: 0 }}>
            Muat Naik Excel
            <input type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} style={{ display: 'none' }} />
          </label>
        </div>
      </div>
      {/* Table Senarai KPI yang telah disimpan */}
      {(filteredKpiList.length > 0) && (
        <div style={{ marginTop: 48, borderRadius: 16, boxShadow: '0 4px 24px #dbeafe', background: '#f8fafc', padding: 12, overflowX: 'auto', maxWidth: '100vw', minHeight: 200 }}>
          <table style={{ minWidth: 1100, borderCollapse: 'separate', borderSpacing: 0, background: '#fff', borderRadius: 16, overflow: 'hidden', fontFamily: 'Poppins, Arial, sans-serif', fontSize: 14, boxShadow: '0 2px 8px #e3eafc' }}>
              <thead>
                <tr style={{ background: '#1565c0', color: '#fff' }}>
                  <th style={{ padding: 10, fontWeight: 700, border: '1px solid #e3eafc', fontSize: 15, letterSpacing: 1, textAlign: 'left' }}>Bahagian</th>
                  <th style={{ padding: 10, fontWeight: 700, border: '1px solid #e3eafc', fontSize: 15, letterSpacing: 1, textAlign: 'left' }}>Kategori</th>
                  <th style={{ padding: 10, fontWeight: 700, border: '1px solid #e3eafc', fontSize: 15, letterSpacing: 1, textAlign: 'left' }}>Pernyataan</th>
                  {/* <th style={{ padding: 10, fontWeight: 700, border: '1px solid #e3eafc', fontSize: 15, letterSpacing: 1, textAlign: 'left' }}>Kaedah Pengukuran</th> */}
                  {/* <th style={{ padding: 10, fontWeight: 700, border: '1px solid #e3eafc', fontSize: 15, letterSpacing: 1, textAlign: 'left' }}>Target</th> */}
                  <th style={{ padding: 10, fontWeight: 700, border: '1px solid #e3eafc', fontSize: 15, letterSpacing: 1, textAlign: 'left' }}>Perincian</th>
                  <th style={{ padding: 10, fontWeight: 700, border: '1px solid #e3eafc', fontSize: 15, letterSpacing: 1, textAlign: 'center' }}>Peratus Pencapaian</th>
                  <th style={{ padding: 10, fontWeight: 700, border: '1px solid #e3eafc', fontSize: 15, letterSpacing: 1, textAlign: 'right' }}>Peruntukan (RM)</th>
                  <th style={{ padding: 10, fontWeight: 700, border: '1px solid #e3eafc', fontSize: 15, letterSpacing: 1, textAlign: 'right' }}>Perbelanjaan (RM)</th>
                  <th style={{ padding: 10, fontWeight: 700, border: '1px solid #e3eafc', fontSize: 15, letterSpacing: 1, textAlign: 'right' }}>% Perbelanjaan</th>
                  <th style={{ padding: 10, fontWeight: 700, border: '1px solid #e3eafc', fontSize: 15, letterSpacing: 1, textAlign: 'center' }}>Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {filteredKpiList.map((kpi, idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? 'linear-gradient(90deg, #f4f8fd 0%, #e3eafc 100%)' : '#fff', borderBottom: '1.5px solid #e3eafc' }}>
                    <td style={{ padding: 8, color: '#222', fontWeight: 500, border: '1px solid #e3eafc' }}>{kpi.department}</td>
                    <td style={{ padding: 8, color: '#222', border: '1px solid #e3eafc' }}>{kpi.kategoriUtama || '-'}</td>
                    <td style={{ padding: 8, color: '#222', fontWeight: 500, border: '1px solid #e3eafc', wordBreak: 'break-word', whiteSpace: 'pre-line', maxWidth: 220 }}>{kpi.kpi}</td>
                    {/* <td style={{ padding: 8, color: '#222', border: '1px solid #e3eafc' }}>{kpi.kategori}</td> */}
                    {/* <td style={{ padding: 8, color: '#222', border: '1px solid #e3eafc' }}>{kpi.target}</td> */}
                    <td style={{ padding: 0, color: '#222', border: '1px solid #e3eafc' }}>
                      <table style={{ width: '100%', background: 'none', border: 'none', fontSize: 13, margin: 0 }}>
                        <tbody>
                          {(() => {
                            switch (kpi.kategori) {
                              case "Bilangan":
                                return (
                                  <>
                                    <tr>
                                      <td style={{ fontWeight: 600, color: '#1976d2', width: 120 }}>Pencapaian</td>
                                    </tr>
                                    <tr>
                                      <td>{Number(kpi.bilangan.pencapaian).toLocaleString('en-US')}</td>
                                    </tr>
                                  </>
                                );
                              case "Peratus":
                                const peratusY = parseFloat(kpi.peratus.y);
                                const peratusX = parseFloat(kpi.peratus.x);
                                const peratusSebenar = (!isNaN(peratusY) && peratusY > 0 && !isNaN(peratusX)) ? ((peratusX / peratusY) * 100).toFixed(2) : "-";
                                return (
                                  <>
                                    <tr>
                                      <td style={{ fontWeight: 600, color: '#1976d2' }}>{kpi.peratus.labelY || "Peruntukan"}</td>
                                    </tr>
                                    <tr>
                                      <td>{Number(kpi.peratus.y).toLocaleString('en-US')}</td>
                                    </tr>
                                    <tr>
                                      <td style={{ fontWeight: 600, color: '#1976d2' }}>{kpi.peratus.labelX || "Perbelanjaan"}</td>
                                    </tr>
                                    <tr>
                                      <td>{Number(kpi.peratus.x).toLocaleString('en-US')}</td>
                                    </tr>
                                    <tr>
                                      <td style={{ fontWeight: 600, color: '#1976d2' }}>%</td>
                                    </tr>
                                    <tr>
                                      <td>{peratusSebenar}%</td>
                                    </tr>
                                  </>
                                );
                              case "Masa":
                                return (
                                  <>
                                    <tr>
                                      <td style={{ fontWeight: 600, color: '#1976d2', width: 180 }}>Pencapaian</td>
                                    </tr>
                                    <tr>
                                      <td>{kpi.masa.tarikhCapai}</td>
                                    </tr>
                                  </>
                                );
                              case "Tahap Kemajuan":
                                if (typeof kpi.tahapSelected !== 'undefined' && kpi.tahapSelected !== null) {
                                  const row = kpi.tahap[kpi.tahapSelected];
                                  return (
                                    <tr>
                                      <td colSpan={2} style={{ fontWeight: 600, color: '#1976d2', width: 180 }}>{row.statement}</td>
                                    </tr>
                                  );
                                }
                                return null;
                              case "Peratus Minimum":
                                const minY = parseFloat(kpi.peratusMinimum?.y);
                                const minX = parseFloat(kpi.peratusMinimum?.x);
                                const minSebenar = (!isNaN(minY) && minY > 0 && !isNaN(minX)) ? ((minX / minY) * 100).toFixed(2) : "-";
                                return (
                                  <>
                                    <tr>
                                      <td style={{ fontWeight: 600, color: '#1976d2' }}>{kpi.peratusMinimum?.labelY || "Peruntukan"}</td>
                                    </tr>
                                    <tr>
                                      <td>{Number(kpi.peratusMinimum?.y).toLocaleString('en-US')}</td>
                                    </tr>
                                    <tr>
                                      <td style={{ fontWeight: 600, color: '#1976d2' }}>{kpi.peratusMinimum?.labelX || "Perbelanjaan"}</td>
                                    </tr>
                                    <tr>
                                      <td>{Number(kpi.peratusMinimum?.x).toLocaleString('en-US')}</td>
                                    </tr>
                                    <tr>
                                      <td style={{ fontWeight: 600, color: '#1976d2' }}>%</td>
                                    </tr>
                                    <tr>
                                      <td>{minSebenar}%</td>
                                    </tr>
                                  </>
                                );
                              default:
                                return null;
                            }
                          })()}
                        </tbody>
                      </table>
                    </td>
                    <td style={{ padding: 8, color: '#1976d2', fontWeight: 700, textAlign: 'center', fontSize: 16, border: '1px solid #e3eafc' }}>{kiraPeratusPencapaian(kpi)}</td>
                    <td style={{ padding: 8, color: '#222', textAlign: 'right', border: '1px solid #e3eafc' }}>
                      {kpi.peruntukan && Number(kpi.peruntukan).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: 8, color: '#222', textAlign: 'right', border: '1px solid #e3eafc' }}>
                      {kpi.perbelanjaan && Number(kpi.perbelanjaan).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: 8, color: '#1976d2', textAlign: 'right', fontWeight: 700, border: '1px solid #e3eafc' }}>{kpi.percentBelanja}</td>
                    <td style={{ padding: 8, textAlign: 'center', border: '1px solid #e3eafc' }}>
                      <button onClick={() => handleEdit(idx)}
                        style={{ padding: '4px 8px', background: '#ffa000', color: '#fff', border: 'none', borderRadius: 20, cursor: 'pointer', fontWeight: 600, fontSize: 13, marginRight: 6, boxShadow: '0 1px 4px #e3eafc', transition: 'background 0.2s', display: 'inline-flex', alignItems: 'center' }}
                        title="Edit"
                      >
                        <EditIcon fontSize="inherit" style={{ fontSize: 16, marginRight: 2 }} />
                      </button>
                      <button onClick={() => handleDelete(idx)}
                        style={{ padding: '4px 8px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 20, cursor: 'pointer', fontWeight: 600, fontSize: 13, boxShadow: '0 1px 4px #e3eafc', transition: 'background 0.2s', display: 'inline-flex', alignItems: 'center' }}
                        title="Padam"
                      >
                        <DeleteIcon fontSize="inherit" style={{ fontSize: 16 }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}

export default AdminUtama; 
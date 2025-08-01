import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LandingPage from "./LandingPage";
import UserInterface from "./UserInterface";
import * as XLSX from "xlsx";
import Navbar from "./Navbar";
import Dashboard from "./Dashboard";
import { NumericFormat } from 'react-number-format';
import AdminUtama from './AdminUtama';
import MainLayout from './MainLayout';
import Login from './Login';
import { AuthProvider, useAuth } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import UserManagement from './UserManagement';

const departments = [
  "BKP", "MCP", "BWP", "UI", "UUU", "BPA", "MCL", "UAD", "BPPH", "UKK", "BPSM", "BAZ", "BTM", "BPI - Dar Assaadah", "BPI - Darul Ilmi", "BPI - Darul Kifayah", "BPI - HQ", "BPI - IKB", "BPI - PMA", "BPI - SMA-MAIWP", "BPI - SMISTA"
];

const kategoriOptions = [
  "Bilangan",
  "Peratus",
  "Masa",
  "Tahap Kemajuan"
];

const initialForm = {
  department: "",
  kpi: "",
  target: "",
  kategori: "",
  bilangan: { sasaran: "", pencapaian: "" },
  peratus: { x: "", y: "", labelX: "", labelY: "" },
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

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [kpiList, setKpiList] = useState(() => {
    const saved = localStorage.getItem("kpiList");
    return saved ? JSON.parse(saved) : [];
  });
  const [editIdx, setEditIdx] = useState(null);
  const [tahapSelected, setTahapSelected] = useState(null);

  useEffect(() => {
    localStorage.setItem("kpiList", JSON.stringify(kpiList));
  }, [kpiList]);

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

  function formatRM(value) {
    if (!value || value === "" || value === "0" || value === "0.00") return "RM 0.00";
    const number = Number(value);
    if (isNaN(number)) return "RM 0.00";
    return "RM " + number.toLocaleString("ms-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Fungsi untuk format currency untuk Excel
  function formatCurrency(value) {
    if (!value || value === "" || value === "0" || value === "0.00") return "RM 0.00";
    const number = Number(value);
    if (isNaN(number)) return "RM 0.00";
    return "RM " + number.toLocaleString("ms-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  const handleCurrencyChange = (e) => {
    const { name, value } = e.target;
    // Buang semua kecuali nombor dan titik perpuluhan
    const raw = value.replace(/[^0-9.]/g, "");
    setForm(prev => ({
      ...prev,
      [name]: raw
    }));
  };

  // Fungsi simpan KPI
  const handleSave = (e) => {
    e.preventDefault();
    let dataToSave = { ...form };
    if (form.kategori === "Tahap Kemajuan") {
      dataToSave.tahapSelected = tahapSelected;
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

  // Fungsi edit KPI
  const handleEdit = (idx) => {
    setForm(kpiList[idx]);
    setEditIdx(idx);
    if (kpiList[idx].kategori === "Tahap Kemajuan") {
      setTahapSelected(kpiList[idx].tahapSelected ?? null);
    } else {
      setTahapSelected(null);
    }
  };

  // Fungsi untuk update KPI dari User Interface
  const handleUpdateKPI = (idx, updatedKPI) => {
    setKpiList((prev) => prev.map((item, index) => index === idx ? updatedKPI : item));
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
        const actualPercent = (x / y) * 100;
        if (actualPercent <= target) {
          return "100.00%";
        } else {
          const margin = 100 - target;
          const excess = actualPercent - target;
          const penaltyRatio = excess / margin;
          const markah = (1 - penaltyRatio) * 100;
          return Math.max(0, Math.round(markah * 100) / 100).toFixed(2) + "%";
        }
      }
      return "-";
    }
    return "-";
  };

  // Fungsi untuk muat turun Excel
  const handleDownloadExcel = () => {
    const data = kpiList.map((kpi, idx) => ({
      "Bil": idx + 1,
      "Bahagian": kpi.department,
      "Kategori": kpi.kategoriUtama || '-',
      "Pernyataan": kpi.kpi,
      "Kaedah Pengukuran": kpi.kategori,
      "Target": kpi.target,
      "Perincian": (() => {
        switch (kpi.kategori) {
          case "Bilangan":
            const sasaranBilangan = kpi.bilangan.sasaran || kpi.target || "-";
            const pencapaianBilangan = kpi.bilangan.pencapaian || "-";
            return `Sasaran: ${sasaranBilangan}${String.fromCharCode(10)}Pencapaian: ${pencapaianBilangan}`;
          case "Peratus":
            const peratusY = parseFloat(kpi.peratus.y);
            const peratusX = parseFloat(kpi.peratus.x);
            const peratusSebenar = (!isNaN(peratusY) && peratusY > 0 && !isNaN(peratusX)) ? ((peratusX / peratusY) * 100).toFixed(2) : "-";
            return `${kpi.peratus.labelY || 'y'}: ${kpi.peratus.y}${String.fromCharCode(10)}${kpi.peratus.labelX || 'x'}: ${kpi.peratus.x}${String.fromCharCode(10)}% Sebenar: ${peratusSebenar}%`;
          case "Peratus Minimum":
            const minY = parseFloat(kpi.peratusMinimum?.y);
            const minX = parseFloat(kpi.peratusMinimum?.x);
            const minSebenar = (!isNaN(minY) && minY > 0 && !isNaN(minX)) ? ((minX / minY) * 100).toFixed(2) : "-";
            return `${kpi.peratusMinimum?.labelY || 'Peruntukan'}: ${kpi.peratusMinimum?.y}${String.fromCharCode(10)}${kpi.peratusMinimum?.labelX || 'Perbelanjaan'}: ${kpi.peratusMinimum?.x}${String.fromCharCode(10)}% Sebenar: ${minSebenar}%`;
          case "Masa":
            const sasaranTarikh = kpi.masa.sasaranTarikh || kpi.target || "-";
            const tarikhCapai = kpi.masa.tarikhCapai || "-";
            return `Sasaran Tarikh: ${sasaranTarikh}${String.fromCharCode(10)}Tarikh Berjaya Dicapai: ${tarikhCapai}`;
          case "Tahap Kemajuan":
            if (typeof kpi.tahapSelected !== 'undefined' && kpi.tahapSelected !== null) {
              const row = kpi.tahap[kpi.tahapSelected];
              return `${row.statement} (${row.percent}%)`;
            }
            return "-";
          default:
            return "-";
        }
      })(),
      "Peratus Pencapaian": kiraPeratusPencapaian(kpi),
      "Peruntukan (RM)": formatRM(kpi.peruntukan),
      "Perbelanjaan (RM)": formatRM(kpi.perbelanjaan),
      "% Perbelanjaan": kpi.percentBelanja,
    }));
    
    // Create worksheet with custom formatting
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Set column widths for better formatting
    ws['!cols'] = [
      { width: 5 },   // Bil
      { width: 15 },  // Bahagian
      { width: 10 },  // Kategori
      { width: 50 },  // Pernyataan
      { width: 20 },  // Kaedah Pengukuran
      { width: 15 },  // Target
      { width: 40 },  // Perincian
      { width: 20 },  // Peratus Pencapaian
      { width: 15 },  // Peruntukan (RM)
      { width: 15 },  // Perbelanjaan (RM)
      { width: 15 }   // % Perbelanjaan
    ];
    
    // Enable text wrapping for Perincian column and set row heights
    const perincianCol = 'G'; // Column G is Perincian
    for (let i = 2; i <= data.length + 1; i++) {
      const cellRef = `${perincianCol}${i}`;
      if (!ws[cellRef]) continue;
      
      ws[cellRef].s = {
        alignment: {
          vertical: 'top',
          horizontal: 'left',
          wrapText: true
        }
      };
    }
    
    // Format currency columns (Peruntukan and Perbelanjaan)
    const peruntukanCol = 'I'; // Column I is Peruntukan (RM)
    const perbelanjaanCol = 'J'; // Column J is Perbelanjaan (RM)
    
    for (let i = 2; i <= data.length + 1; i++) {
      // Format Peruntukan column
      const peruntukanCellRef = `${peruntukanCol}${i}`;
      if (ws[peruntukanCellRef]) {
        ws[peruntukanCellRef].s = {
          alignment: {
            horizontal: 'right',
            vertical: 'center'
          },
          font: {
            color: { rgb: "2E7D32" }, // Green color for positive values
            bold: true
          },
          border: {
            top: { style: 'thin', color: { rgb: "CCCCCC" } },
            bottom: { style: 'thin', color: { rgb: "CCCCCC" } },
            left: { style: 'thin', color: { rgb: "CCCCCC" } },
            right: { style: 'thin', color: { rgb: "CCCCCC" } }
          }
        };
      }
      
      // Format Perbelanjaan column
      const perbelanjaanCellRef = `${perbelanjaanCol}${i}`;
      if (ws[perbelanjaanCellRef]) {
        ws[perbelanjaanCellRef].s = {
          alignment: {
            horizontal: 'right',
            vertical: 'center'
          },
          font: {
            color: { rgb: "D32F2F" }, // Red color for expenditure
            bold: true
          },
          border: {
            top: { style: 'thin', color: { rgb: "CCCCCC" } },
            bottom: { style: 'thin', color: { rgb: "CCCCCC" } },
            left: { style: 'thin', color: { rgb: "CCCCCC" } },
            right: { style: 'thin', color: { rgb: "CCCCCC" } }
          }
        };
      }
    }
    
    // Format percentage columns
    const peratusPencapaianCol = 'H'; // Column H is Peratus Pencapaian
    const peratusPerbelanjaanCol = 'K'; // Column K is % Perbelanjaan
    
    for (let i = 2; i <= data.length + 1; i++) {
      // Format Peratus Pencapaian column
      const peratusCellRef = `${peratusPencapaianCol}${i}`;
      if (ws[peratusCellRef]) {
        ws[peratusCellRef].s = {
          alignment: {
            horizontal: 'center',
            vertical: 'center'
          },
          font: {
            bold: true,
            color: { rgb: "1976D2" } // Blue color for percentages
          }
        };
      }
      
      // Format % Perbelanjaan column
      const peratusBelanjaCellRef = `${peratusPerbelanjaanCol}${i}`;
      if (ws[peratusBelanjaCellRef]) {
        ws[peratusBelanjaCellRef].s = {
          alignment: {
            horizontal: 'center',
            vertical: 'center'
          },
          font: {
            bold: true,
            color: { rgb: "FF6B35" } // Orange color for expenditure percentage
          }
        };
      }
    }
    
    // Set row heights for better display
    if (!ws['!rows']) ws['!rows'] = [];
    for (let i = 1; i <= data.length + 1; i++) {
      ws['!rows'][i] = { hpt: 60 }; // Set row height to 60 points
    }
    
    // Format header row
    const headerRow = 1;
    for (let col = 0; col < Object.keys(data[0] || {}).length; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: headerRow - 1, c: col });
      if (ws[cellRef]) {
        ws[cellRef].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "1976D2" } },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }
    }
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "KPI_SKU");
    XLSX.writeFile(wb, "Senarai_KPI_SKU.xlsx");
  };

  // Fungsi upload Excel
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const confirmMsg = `Anda pasti untuk muat naik ${file.name}?`;
    if (!window.confirm(confirmMsg)) {
      e.target.value = ""; // reset supaya boleh pilih fail sama semula
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { defval: "" });
      
      // Mapping data Excel ke format kpiList dengan pemprosesan yang lebih baik
      const mapped = data.map(row => {
        // Bersihkan data peruntukan dan perbelanjaan
        let peruntukan = row["Peruntukan (RM)"] || "";
        let perbelanjaan = row["Perbelanjaan (RM)"] || "";
        
        // Buang "RM " prefix jika ada dan bersihkan format
        if (typeof peruntukan === 'string') {
          peruntukan = peruntukan.replace(/^RM\s*/, '').replace(/,/g, '').replace(/\s/g, '');
          // Jika kosong atau "0.00", set kepada "0"
          if (peruntukan === "" || peruntukan === "0.00" || peruntukan === "0") {
            peruntukan = "0";
          }
        }
        if (typeof perbelanjaan === 'string') {
          perbelanjaan = perbelanjaan.replace(/^RM\s*/, '').replace(/,/g, '').replace(/\s/g, '');
          // Jika kosong atau "0.00", set kepada "0"
          if (perbelanjaan === "" || perbelanjaan === "0.00" || perbelanjaan === "0") {
            perbelanjaan = "0";
          }
        }
        
        // Parse perincian untuk mendapatkan data pencapaian
        const perincian = row["Perincian"] || "";
        let pencapaianData = {};
        
        // Parse perincian berdasarkan kategori
        if (row["Kaedah Pengukuran"] === "Bilangan") {
          // Cari "Pencapaian: [nombor]" dalam perincian
          const pencapaianMatch = perincian.match(/Pencapaian:\s*([0-9,]+)/);
          if (pencapaianMatch) {
            pencapaianData = { pencapaian: pencapaianMatch[1].replace(/,/g, '') };
          }
        } else if (row["Kaedah Pengukuran"] === "Peratus") {
          // Parse data peratus dari perincian
          const lines = perincian.split('\n');
          let x = "", y = "", labelX = "", labelY = "";
          
          lines.forEach(line => {
            if (line.includes(':')) {
              const [label, value] = line.split(':').map(s => s.trim());
              if (label && value) {
                // Cari nilai yang mengandungi nombor (biasanya x dan y)
                const numericValue = value.replace(/,/g, '').replace(/%/g, '');
                if (!isNaN(parseFloat(numericValue))) {
                  if (label.includes('x') || label.includes('Perbelanjaan') || label.includes('Keluar Kemiskinan') || label.includes('Belanja')) {
                    x = numericValue;
                    labelX = label;
                  } else if (label.includes('y') || label.includes('Peruntukan') || label.includes('Overall') || label.includes('Zakat')) {
                    y = numericValue;
                    labelY = label;
                  }
                }
              }
            }
          });
          
          // Jika tidak jumpa data, cuba parse berdasarkan pola umum
          if (!x || !y) {
            const allNumbers = perincian.match(/(\d+(?:,\d+)*)/g);
            if (allNumbers && allNumbers.length >= 2) {
              // Ambil 2 nombor pertama sebagai x dan y
              x = allNumbers[0].replace(/,/g, '');
              y = allNumbers[1].replace(/,/g, '');
              labelX = "Pencapaian";
              labelY = "Sasaran";
            }
          }
          
          pencapaianData = { x, y, labelX, labelY };
        } else if (row["Kaedah Pengukuran"] === "Masa") {
          // Cari tarikh pencapaian dalam perincian
          const tarikhMatch = perincian.match(/Tarikh Berjaya Dicapai:\s*([0-9-]+)/);
          if (tarikhMatch) {
            pencapaianData = { tarikhCapai: tarikhMatch[1] };
          }
        } else if (row["Kaedah Pengukuran"] === "Peratus Minimum") {
          // Parse data peratus minimum dari perincian
          const lines = perincian.split('\n');
          let x = "", y = "", labelX = "", labelY = "";
          
          lines.forEach(line => {
            if (line.includes(':')) {
              const [label, value] = line.split(':').map(s => s.trim());
              if (label && value) {
                // Cari nilai yang mengandungi nombor (biasanya x dan y)
                const numericValue = value.replace(/,/g, '').replace(/%/g, '');
                if (!isNaN(parseFloat(numericValue))) {
                  if (label.includes('x') || label.includes('Perbelanjaan') || label.includes('Amil') || label.includes('Belanja')) {
                    x = numericValue;
                    labelX = label;
                  } else if (label.includes('y') || label.includes('Peruntukan') || label.includes('Zakat')) {
                    y = numericValue;
                    labelY = label;
                  }
                }
              }
            }
          });
          
          // Jika tidak jumpa data, cuba parse berdasarkan pola umum untuk Peratus Minimum
          if (!x || !y) {
            const allNumbers = perincian.match(/(\d+(?:,\d+)*)/g);
            if (allNumbers && allNumbers.length >= 2) {
              // Ambil 2 nombor pertama sebagai x dan y
              x = allNumbers[0].replace(/,/g, '');
              y = allNumbers[1].replace(/,/g, '');
              labelX = "Perbelanjaan";
              labelY = "Peruntukan";
            }
          }
          
          pencapaianData = { x, y, labelX, labelY };
        } else if (row["Kaedah Pengukuran"] === "Tahap Kemajuan") {
          // Parse data tahap kemajuan dari perincian
          // Format dalam Excel: "Kelulusan JKUU (50%)"
          const tahapMatch = perincian.match(/(.+?)\s*\((\d+)%\)/);
          if (tahapMatch) {
            const statement = tahapMatch[1].trim();
            const percent = tahapMatch[2];
            
            // Cari index tahap yang sesuai
            let tahapSelected = null;
            const tahapStatements = [
              "Mesyuarat Pengurusan",
              "Kelulusan JKUU", 
              "Kelulusan Mesyuarat MAIWP",
              "Kelulusan Parlimen"
            ];
            
            tahapStatements.forEach((tahap, index) => {
              if (statement.includes(tahap) || tahap.includes(statement)) {
                tahapSelected = index;
              }
            });
            
            // Jika tidak jumpa match yang tepat, cuba match berdasarkan peratus
            if (tahapSelected === null) {
              const percentNum = parseInt(percent);
              if (percentNum <= 25) tahapSelected = 0;
              else if (percentNum <= 50) tahapSelected = 1;
              else if (percentNum <= 75) tahapSelected = 2;
              else if (percentNum <= 100) tahapSelected = 3;
            }
            
            pencapaianData = { 
              tahapSelected: tahapSelected,
              statement: statement,
              percent: percent
            };
          }
        }
        
        // Kira % Perbelanjaan
        let percentBelanja = "-";
        const peruntukanNum = parseFloat(peruntukan);
        const perbelanjaanNum = parseFloat(perbelanjaan);
        
        // Handle kes di mana data adalah "NaN" atau tidak sah
        if (peruntukan === "NaN" || perbelanjaan === "NaN") {
          peruntukan = "0";
          perbelanjaan = "0";
        }
        
        if (!isNaN(peruntukanNum) && peruntukanNum > 0 && !isNaN(perbelanjaanNum)) {
          let percent = (perbelanjaanNum / peruntukanNum) * 100;
          if (percent > 100) percent = 100;
          percentBelanja = percent.toFixed(2) + "%";
        }
        
        return {
          department: row["Bahagian"] || "",
          kategoriUtama: row["Kategori"] || "",
          kpi: row["Pernyataan"] || "",
          kategori: row["Kaedah Pengukuran"] || "",
          target: row["Target"] || "",
          bilangan: row["Kaedah Pengukuran"] === "Bilangan" ? pencapaianData : { pencapaian: "" },
          peratus: row["Kaedah Pengukuran"] === "Peratus" ? pencapaianData : { x: "", y: "", labelX: "", labelY: "" },
          peratusMinimum: row["Kaedah Pengukuran"] === "Peratus Minimum" ? pencapaianData : { x: "", y: "", labelX: "", labelY: "" },
          masa: row["Kaedah Pengukuran"] === "Masa" ? pencapaianData : { sasaranTarikh: "", tarikhCapai: "" },
          tahap: row["Kaedah Pengukuran"] === "Tahap Kemajuan" ? [
            { statement: "Mesyuarat Pengurusan", percent: "25" },
            { statement: "Kelulusan JKUU", percent: "50" },
            { statement: "Kelulusan Mesyuarat MAIWP", percent: "75" },
            { statement: "Kelulusan Parlimen", percent: "100" }
          ] : [
            { statement: "", percent: "" },
            { statement: "", percent: "" },
            { statement: "", percent: "" },
            { statement: "", percent: "" }
          ],
          tahapSelected: row["Kaedah Pengukuran"] === "Tahap Kemajuan" ? pencapaianData.tahapSelected : null,
          peruntukan: peruntukan,
          perbelanjaan: perbelanjaan,
          percentBelanja: percentBelanja,
        };
      });
      
      setKpiList(mapped);
      alert(`✅ Berjaya memuat naik ${mapped.length} rekod dari fail Excel!`);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <AuthProvider>
      <Router>
        <div>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout><Dashboard kpiList={kpiList} /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/sistem-kpi" element={
              <ProtectedRoute>
                <MainLayout><Dashboard kpiList={kpiList} /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin-utama" element={
              <ProtectedRoute>
                <MainLayout><AdminUtama kpiList={kpiList} setKpiList={setKpiList} handleDownloadExcel={handleDownloadExcel} handleExcelUpload={handleExcelUpload} /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin-bahagian" element={
              <ProtectedRoute>
                <MainLayout><UserInterface kpiList={kpiList} onUpdateKPI={handleUpdateKPI} /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/user-management" element={
              <ProtectedRoute>
                <MainLayout><UserManagement /></MainLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}


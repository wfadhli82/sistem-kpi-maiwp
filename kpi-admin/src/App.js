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
    if (!value) return "";
    const number = Number(value);
    if (isNaN(number)) return "";
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
            return `Pencapaian: ${kpi.bilangan.pencapaian}`;
          case "Peratus":
            const peratusY = parseFloat(kpi.peratus.y);
            const peratusX = parseFloat(kpi.peratus.x);
            const peratusSebenar = (!isNaN(peratusY) && peratusY > 0 && !isNaN(peratusX)) ? ((peratusX / peratusY) * 100).toFixed(2) : "-";
            return `${kpi.peratus.labelY || 'y'}: ${kpi.peratus.y}, ${kpi.peratus.labelX || 'x'}: ${kpi.peratus.x}, % Sebenar: ${peratusSebenar}%`;
          case "Peratus Minimum":
            const minY = parseFloat(kpi.peratusMinimum?.y);
            const minX = parseFloat(kpi.peratusMinimum?.x);
            const minSebenar = (!isNaN(minY) && minY > 0 && !isNaN(minX)) ? ((minX / minY) * 100).toFixed(2) : "-";
            return `${kpi.peratusMinimum?.labelY || 'Peruntukan'}: ${kpi.peratusMinimum?.y}, ${kpi.peratusMinimum?.labelX || 'Perbelanjaan'}: ${kpi.peratusMinimum?.x}, % Sebenar: ${minSebenar}%`;
          case "Masa":
            return `Tarikh Berjaya Dicapai: ${kpi.masa.tarikhCapai}`;
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
      "Peruntukan (RM)": kpi.peruntukan,
      "Perbelanjaan (RM)": kpi.perbelanjaan,
      "% Perbelanjaan": kpi.percentBelanja,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
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
      // Mapping data Excel ke format kpiList
      const mapped = data.map(row => ({
        department: row["Bahagian"] || "",
        kategoriUtama: row["Kategori"] || "",
        kpi: row["Pernyataan"] || "",
        kategori: row["Kaedah Pengukuran"] || "",
        target: row["Target"] || "",
        bilangan: { pencapaian: row["Pencapaian"] || "" },
        peratus: { x: row["Pencapaian"] || "", y: row["Target"] || "" },
        masa: { tarikhCapai: row["Pencapaian"] || "" },
        tahap: [ { statement: row["Pernyataan"] || "", percent: row["Pencapaian"] || "" } ],
        peruntukan: row["Peruntukan (RM)"] || "",
        perbelanjaan: row["Perbelanjaan (RM)"] || "",
        percentBelanja: "-",
      }));
      setKpiList(mapped);
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


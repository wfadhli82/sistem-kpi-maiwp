import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import { FaUserShield, FaUserEdit, FaChartPie, FaRegLightbulb } from 'react-icons/fa';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-root dark-bg">
      <div className="landing-top-row">
        <img src="/logo-maiwp.png" alt="MAIWP Logo" className="maiwp-logo-vertical" />
        <div className="landing-title-block-vertical">
          <h1 className="landing-title-vertical">Sistem Pemantauan Prestasi MAIWP</h1>
          <div className="red-line-vertical"></div>
          <p className="landing-desc-vertical">
            Sistem ini dibangunkan bagi meningkatkan kecekapan dalam pengurusan pemantauan prestasi MAIWP secara keseluruhannya.
          </p>
        </div>
      </div>
      <div className="landing-main-grid">
        <div className="landing-img-col">
          <img src="/menara-maiwp.jpg" alt="Menara MAIWP" className="landing-main-img" />
        </div>
        <div className="landing-cards-grid">
          <div className="landing-card admin" onClick={() => navigate('/admin')}>
            <FaUserShield size={40} />
            <h2>Pentadbir</h2>
            <p>Form & Table (Admin Area)</p>
          </div>
          <div className="landing-card user" onClick={() => navigate('/user')}>
            <FaUserEdit size={40} />
            <h2>User</h2>
            <p>Key In Maklumat Pencapaian</p>
          </div>
          <div className="landing-card dashboard" onClick={() => navigate('/dashboard')}>
            <FaChartPie size={40} />
            <h2>Dashboard</h2>
            <p>Ringkasan Data</p>
          </div>
          <div className="landing-card coming-soon">
            <FaRegLightbulb size={40} />
            <h2>Akan Datang</h2>
            <p>Fungsi tambahan akan datang</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 
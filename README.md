# Sistem KPI

Sistem Key Performance Indicator (KPI) yang dibangunkan menggunakan React.js dan Material-UI untuk pengurusan dan pemantauan prestasi bahagian.

## Ciri-ciri Utama

### 📊 Dashboard
- **Pencapaian Keseluruhan**: Paparan keseluruhan SKU dan KPI
- **Pencapaian KPI**: Fokus pada KPI sahaja
- **Pencapaian SKU**: Fokus pada SKU sahaja

### 📈 Carta dan Analisis
- **Carta Prestasi Bahagian**: Purata % pencapaian mengikut bahagian
- **Taburan Pencapaian**: Distribution berdasarkan range pencapaian
- **Bilangan Mengikut Bahagian**: Count data mengikut bahagian

### 🎯 Kaedah Pengukuran
- **Bilangan**: Pengukuran berdasarkan jumlah
- **Peratus**: Pengukuran berdasarkan peratusan
- **Peratus Minimum**: Pengukuran dengan logik minimum
- **Masa**: Pengukuran berdasarkan tarikh
- **Tahap Kemajuan**: Pengukuran berdasarkan tahap

### 👥 Pengurusan Pengguna
- **Admin Utama**: Pengurusan data pusat
- **Admin Bahagian**: Pengurusan data bahagian

## Teknologi

- **Frontend**: React.js
- **UI Framework**: Material-UI (MUI)
- **Charts**: Recharts
- **Routing**: React Router DOM
- **Data Storage**: LocalStorage

## Struktur Projek

```
Sistem KPI/
├── kpi-admin/
│   ├── public/
│   ├── src/
│   │   ├── App.js              # Main application
│   │   ├── Dashboard.js        # Dashboard component
│   │   ├── AdminUtama.js       # Main admin interface
│   │   ├── UserInterface.js    # Department admin interface
│   │   ├── MainLayout.js       # Layout wrapper
│   │   └── ...
│   ├── package.json
│   └── README.md
└── README.md
```

## Pemasangan

1. **Clone repository**
   ```bash
   git clone [repository-url]
   cd Sistem KPI/kpi-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Build untuk production**
   ```bash
   npm run build
   ```

## Penggunaan

### Dashboard
- Akses dashboard utama untuk melihat overview
- Gunakan tab untuk menapis data (Keseluruhan/KPI/SKU)
- Lihat carta prestasi dan taburan pencapaian

### Admin Utama
- Tambah/edit/padam data KPI/SKU
- Import/export data Excel
- Filter data mengikut bahagian dan kategori

### Admin Bahagian
- Update pencapaian untuk bahagian tertentu
- Lihat dan edit data yang berkaitan dengan bahagian

## Bahagian yang Disokong

- BKP
- MCP
- BWP
- UI
- UUU
- BPA
- MCL
- UAD
- BPPH
- UKK
- BPSM
- BAZ
- BTM
- BPI (termasuk semua sub-bahagian BPI)

## Pembangunan

### Menambah Bahagian Baru
1. Edit `departments` array dalam `AdminUtama.js` dan `UserInterface.js`
2. Tambah nama bahagian baru

### Menambah Kaedah Pengukuran
1. Edit `kategoriOptions` dalam `AdminUtama.js`
2. Tambah logik pengiraan dalam `kiraPeratusPencapaian` function

## Lisensi

Projek ini dibangunkan untuk kegunaan dalaman organisasi.

## Penulis

Wan Fadhli - Sistem KPI Development Team 
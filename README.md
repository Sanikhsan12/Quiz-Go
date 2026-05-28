# QuizGo - Platform Edukasi & Kuis Interaktif

**QuizGo** adalah platform manajemen dan pengerjaan kuis interaktif berbasis web yang dirancang untuk mempermudah proses belajar mengajar antara Guru (Teacher) dan Siswa (Student), serta dikelola secara penuh oleh Admin. Platform ini memiliki fitur manajemen kuis, sistem remedial otomatis jika nilai siswa tidak mencapai batas kelulusan, dashboard statistik yang interaktif, serta mendukung mode gelap (dark mode) secara dinamis.

---

## 🛠️ Persyaratan Sistem (Requirements)

Sebelum menjalankan aplikasi secara lokal, pastikan perangkat Anda sudah menginstal beberapa software berikut:

1. **Docker & Docker Compose** (Sangat direkomendasikan untuk kemudahan setup)
   - Docker Engine v20.10+
   - Docker Compose v2.0+
2. **Node.js & npm** (Jika ingin menjalankan frontend secara manual tanpa Docker)
   - Node.js v18+
3. **Go (Golang)** (Jika ingin menjalankan backend secara manual tanpa Docker)
   - Go v1.21+
4. **Git** (Untuk manajemen repositori)

---

## 📂 Struktur Folder Proyek

Proyek ini menggunakan arsitektur monorepo sederhana yang memisahkan kode frontend dan backend secara jelas:

```text
QuizGo/
├── backend/                  # REST API Backend (Golang + Gin)
│   ├── config/               # Konfigurasi database & redis
│   ├── controllers/          # Logika bisnis & API Handler (Auth, Quiz, Student, Teacher)
│   ├── middlewares/          # JWT Auth & CORS middleware
│   ├── models/               # Definisi skema database GORM (User, Quiz, Question, Score, dll)
│   ├── routes/               # Routing endpoint API
│   ├── utils/                # Helper / Utilitas
│   ├── Dockerfile            # Dockerfile untuk containerisasi Backend
│   ├── go.mod / go.sum       # File dependensi Golang
│   └── main.go               # Entry point aplikasi backend
│
├── frontend/                 # Single Page Application (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/       # Komponen reusable (Sidebar, Navbar, Layout, dll)
│   │   ├── pages/            # Halaman aplikasi berdasarkan role (Admin, Teacher, Student)
│   │   ├── App.jsx           # Routing & layout utama frontend
│   │   └── main.jsx          # Entry point React
│   ├── public/               # Asset statis
│   ├── Dockerfile            # Dockerfile untuk containerisasi Frontend (Multi-stage Nginx)
│   ├── package.json          # File dependensi frontend
│   ├── tailwind.config.js    # Konfigurasi Tailwind CSS
│   └── vite.config.js        # Konfigurasi bundler Vite
│
├── docker-compose.yml        # Orkestrasi multi-container (Postgres, Redis, Backend, Frontend)
└── .gitignore                # File gitignore tingkat root
```

---

## 🚀 Cara Menjalankan di Local Docker

Langkah termudah untuk menjalankan seluruh stack teknologi (PostgreSQL, Redis, Backend, dan Frontend) adalah menggunakan **Docker Compose**. Ikuti langkah-langkah di bawah ini:

### 1. Clone Repositori & Masuk ke Folder Proyek
```bash
cd UTS3
```

### 2. Jalankan Container Menggunakan Docker Compose
Jalankan perintah berikut untuk membangun image dan menjalankan service di background:
```bash
docker compose up -d --build
```

### 3. Verifikasi Container yang Berjalan
Pastikan semua container berjalan dengan status `Up`:
```bash
docker compose ps
```
Aplikasi akan menjalankan 4 layanan utama:
*   **Database (PostgreSQL)** pada port `5432`
*   **Cache (Redis)** pada port `6379`
*   **Backend API (Golang)** pada port `8080` (Akses API via `http://localhost:8080/api/v1`)
*   **Frontend Web (React)** pada port `3000` (Akses UI via `http://localhost:3000`)

### 4. Akses Aplikasi
Buka browser favorit Anda dan akses:
*   **Web Portal**: `http://localhost:3000`

---

## 🔑 Kredensial Default (Uji Coba)

Saat aplikasi pertama kali dijalankan, database akan otomatis melakukan migrasi skema dan menyediakan akun bawaan untuk pengujian (seed data):

| Role | Username / Email | Password | Fitur Utama |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `password` | Menyetujui pendaftaran Guru/Siswa, mengelola pengguna |
| **Teacher** | `teacher` | `password` | Membuat kuis, membuat soal, melihat statistik nilai siswa |
| **Student** | `student` | `password` | Mengerjakan kuis, melihat riwayat kuis, remedial otomatis |

---

## 🛑 Menghentikan Aplikasi

Untuk menghentikan dan menghapus semua container yang berjalan tanpa kehilangan data database, jalankan:
```bash
docker compose down
```

Jika Anda ingin menghentikan container sekaligus **menghapus seluruh data** database (reset database), jalankan:
```bash
docker compose down -v
```

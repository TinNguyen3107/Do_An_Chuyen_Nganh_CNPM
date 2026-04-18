# 26Tech LMS — Hệ thống Quản lý Khoá học Trực tuyến

> **Đồ án Chuyên ngành — Công nghệ Phần mềm**  
> Sinh viên thực hiện: Nguyễn Thanh Linh  
> Nền tảng: Web Application (ReactJS + Node.js + MongoDB)

---

## 📖 Giới thiệu

**26Tech LMS** là một hệ thống quản lý học tập trực tuyến (Learning Management System) cho phép:

- 🎓 **Học viên** tìm kiếm, đăng ký và học tập các khoá học trực tuyến
- 🏫 **Giảng viên** tạo, quản lý nội dung khoá học và theo dõi doanh thu
- 👑 **Quản trị viên** điều hành toàn bộ nền tảng, duyệt khoá học và xuất báo cáo

---

## ✨ Tính năng chính

### 🎓 Học viên (Student)
| Tính năng | Mô tả |
|---|---|
| Đăng ký / Đăng nhập | Xác thực JWT, reset mật khẩu qua email |
| Tìm kiếm khoá học | Lọc theo danh mục, cấp độ, từ khoá |
| Thanh toán trực tuyến | Hỗ trợ MoMo, ATM, chuyển khoản ngân hàng |
| Học tập | Xem bài giảng video, đánh dấu hoàn thành từng bài |
| Theo dõi tiến độ | % hoàn thành khoá học cập nhật theo thời gian thực |
| Đánh giá & nhận xét | Rating 5 sao và viết review sau khi học |
| Lịch sử thanh toán | Xem lại toàn bộ giao dịch đã thực hiện |

### 🏫 Giảng viên (Instructor)
| Tính năng | Mô tả |
|---|---|
| Tạo & quản lý khoá học | CRUD khoá học, chương (chapter), bài giảng (lesson) |
| Gửi duyệt khoá học | Admin duyệt trước khi xuất bản |
| Ví giảng viên | Theo dõi hoa hồng (70%), số dư, lịch sử thu nhập |
| Rút tiền | Yêu cầu rút tiền về tài khoản ngân hàng |

### 👑 Quản trị viên (Admin)
| Tính năng | Mô tả |
|---|---|
| Dashboard tổng quan | Thống kê doanh thu, người dùng, khoá học |
| Quản lý người dùng | Xem, phân quyền, khoá/mở tài khoản |
| Duyệt giảng viên | Xét duyệt hồ sơ đăng ký giảng viên |
| Duyệt khoá học | Approve/Reject khoá học mới và cập nhật |
| Quản lý danh mục | CRUD danh mục khoá học |
| Chi trả giảng viên | Duyệt yêu cầu rút tiền |
| **Báo cáo & Export** ✨ | Xuất báo cáo doanh thu, người dùng, khoá học, giảng viên ra CSV/Excel |

---

## 🛠️ Công nghệ sử dụng

| Layer | Công nghệ |
|---|---|
| **Frontend** | ReactJS 18, Vite, Tailwind CSS |
| **Backend** | Node.js, Express.js 5, ES Modules |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Auth** | JWT (httpOnly cookie + Authorization header) |
| **Payment** | MoMo API, Mock ATM/Bank |
| **Upload** | Multer (local storage `/uploads/`) |
| **Email** | Nodemailer (reset password) |
| **Export** | ExcelJS (`.xlsx`), csv-stringify (`.csv`) |
| **Validation** | Joi |
| **Testing** | Jest, Supertest |

---

## 🏗️ Kiến trúc hệ thống

```
Client (React + Vite)
        │  HTTP/HTTPS
        ▼
┌─────────────────────────────────┐
│         Express.js Server       │
│                                 │
│  Routes → Validators            │
│       → Middlewares (Auth/Role) │
│       → Controllers             │
│       → Services (Logic)        │
│       → Repositories (Queries)  │
│       → Models (Mongoose)       │
└──────────────┬──────────────────┘
               │ Mongoose
               ▼
         MongoDB Atlas
```

---

## 📁 Cấu trúc thư mục

```
Do_An_Chuyen_Nganh_CNPM/
├── backend/                   ← Node.js + Express API
│   ├── server.js              ← Entry point
│   ├── config/
│   │   └── db.js              ← Kết nối MongoDB
│   ├── models/                ← Mongoose schemas
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Chapter.js
│   │   ├── Lesson.js
│   │   ├── Enrollment.js
│   │   ├── LessonProgress.js
│   │   ├── Payment.js
│   │   ├── Payout.js
│   │   ├── InstructorProfile.js
│   │   ├── InstructorWallet.js
│   │   ├── Category.js
│   │   └── Review.js
│   ├── controllers/           ← HTTP handlers
│   ├── services/              ← Business logic
│   ├── repositories/          ← Database queries
│   ├── routes/                ← URL routing
│   ├── middlewares/           ← Auth, Role, Upload, Error
│   ├── validators/            ← Joi input validation
│   ├── utils/                 ← Helpers (token, export, initAdmin)
│   └── tests/                 ← Jest unit tests
│
└── fe/                        ← React + Vite frontend
    └── src/
        ├── pages/
        │   ├── Admin/         ← Dashboard, Users, Reports...
        │   ├── Instructor/    ← Dashboard, CreateCourse, Wallet...
        │   ├── Student/       ← Dashboard, MyCourses, Learning...
        │   └── Public/        ← HomePage, CourseList, CourseDetail
        ├── components/        ← Shared UI components
        ├── layouts/           ← DashboardLayout, MainLayout
        ├── services/          ← Axios API service
        ├── context/           ← AuthContext
        └── router/            ← React Router config
```

---

## 🚀 Hướng dẫn chạy dự án

### Yêu cầu
- Node.js >= 18
- MongoDB Atlas account (hoặc local MongoDB)

### 1. Clone repository
```bash
git clone https://github.com/TinNguyen3107/Do_An_Chuyen_Nganh_CNPM.git
cd Do_An_Chuyen_Nganh_CNPM
```

### 2. Cài đặt dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../fe
npm install
```

### 3. Cấu hình môi trường

Tạo file `backend/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:5173

# Admin mặc định
ADMIN_EMAIL=admin@26tech.vn
ADMIN_PASSWORD=Admin@123456
ADMIN_NAME=Admin 26Tech

# Email (reset password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 4. Chạy development server
```bash
# Backend (port 5000)
cd backend
npm run dev

# Frontend (port 5173)
cd fe
npm run dev
```

Truy cập: **http://localhost:5173**

---

## 🔌 API Endpoints chính

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Đăng ký tài khoản |
| POST | `/api/auth/login` | Public | Đăng nhập |
| GET | `/api/courses` | Public | Danh sách khoá học |
| POST | `/api/payments/momo` | Student | Thanh toán MoMo |
| GET | `/api/stats/overview` | Admin | Thống kê tổng quan |
| GET | `/api/reports/revenue` | Admin | Báo cáo doanh thu |
| GET | `/api/reports/revenue/export` | Admin | Export Excel/CSV |
| GET | `/api/reports/users` | Admin | Báo cáo người dùng |
| GET | `/api/reports/courses` | Admin | Báo cáo khoá học |
| GET | `/api/reports/instructors` | Admin | Báo cáo giảng viên |

---

## 🧪 Chạy Unit Tests

```bash
cd backend
npm test
```

Tests được viết bằng **Jest + Supertest**, bao phủ các service: `authService`, `categoryService`, `courseService`, `enrollmentService`, `instructorService`, `userService`.

---

## 📊 Luồng hoạt động chính

```
Học viên đăng ký khoá học trả phí:
  [Chọn khoá học] → [Checkout] → [Chọn phương thức thanh toán]
       → [Thanh toán MoMo/ATM/Bank] → [Webhook callback]
       → [Tạo Enrollment] → [Cộng commission vào ví GV]
       → [Học viên có quyền truy cập khoá học]

Giảng viên tạo khoá học:
  [Tạo khoá học (Draft)] → [Thêm chương + bài giảng]
       → [Gửi duyệt Admin] → [Admin Approve]
       → [Publish khoá học] → [Học viên thấy trên trang chủ]
```

---

## 🌿 Git Branches

| Branch | Mô tả |
|---|---|
| `main` | Production-ready code |
| `feature/admin-reporting-export` | Tính năng Báo cáo & Export cho Admin |

---

## 📝 License

Dự án được thực hiện cho mục đích học thuật trong khuôn khổ đồ án chuyên ngành.

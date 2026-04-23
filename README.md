# 26Tech LMS — Hệ thống Quản lý Khoá học Trực tuyến

> **Đồ án Chuyên ngành — Công nghệ Phần mềm**  
> Nhóm thực hiện : T1 Team  
> Nền tảng: Web Application (ReactJS + Node.js + MongoDB)

---

## 1. Giới thiệu chung

Trong những năm gần đây, giáo dục trực tuyến đang phát triển mạnh mẽ và trở thành xu hướng phổ biến trong đào tạo hiện đại. Nhu cầu học tập mọi lúc, mọi nơi của học viên ngày càng tăng, kéo theo yêu cầu về một hệ thống quản lý khóa học trực tuyến linh hoạt, dễ sử dụng và đảm bảo an toàn dữ liệu.

**26Tech LMS** (Learning Management System) là một nền tảng học tập trực tuyến được xây dựng nhằm đáp ứng nhu cầu đó. Hệ thống cho phép giảng viên tạo và quản lý nội dung khóa học, đồng thời hỗ trợ học viên đăng ký, thanh toán và học tập trực tuyến với khả năng theo dõi tiến độ hiệu quả. Nền tảng cũng cung cấp đầy đủ các công cụ quản trị cho Admin, bao gồm duyệt khoá học, quản lý người dùng và xuất báo cáo thống kê.

---

## 2. Mục tiêu dự án

Mục tiêu chính của đề tài là xây dựng một hệ thống học tập trực tuyến đáp ứng các chức năng cốt lõi của một LMS, bao gồm:

- ✅ Cho phép giảng viên tạo và quản lý khóa học, bài giảng và nội dung đào tạo.
- ✅ Hỗ trợ học viên tìm kiếm, đăng ký và học tập trực tuyến thông qua nền tảng web.
- ✅ Quản lý quá trình ghi danh, thanh toán và cấp quyền truy cập khóa học tự động.
- ✅ Cung cấp chức năng theo dõi tiến độ học tập, đánh giá và phản hồi khóa học.
- ✅ Xây dựng giao diện thân thiện, dễ sử dụng và phù hợp với người dùng trên nhiều thiết bị.
- ✅ Cung cấp công cụ báo cáo và xuất dữ liệu (CSV/Excel) cho quản trị viên.

---

## 3. Phạm vi và chức năng hệ thống

Hệ thống LMS được thiết kế gồm **3 nhóm người dùng chính**: Student (Học viên), Instructor (Giảng viên), Admin (Quản trị viên).

### 🎓 Phân hệ Học viên (Student)

Học viên có thể sử dụng hệ thống để học tập và quản lý khóa học cá nhân:

| Tính năng | Mô tả |
|---|---|
| Đăng ký / Đăng nhập | Xác thực JWT, reset mật khẩu qua email |
| Tìm kiếm khoá học | Lọc theo danh mục, cấp độ, từ khoá |
| Xem chi tiết khoá học | Xem chương trình, bài giảng, mô tả, giá |
| Thanh toán trực tuyến | Hỗ trợ MoMo và thẻ ATM |
| Học tập | Xem bài giảng video, đánh dấu hoàn thành từng bài |
| Theo dõi tiến độ | % hoàn thành khoá học cập nhật theo thời gian thực |
| Đánh giá & nhận xét | Rating 5 sao và viết review sau khi học |
| Lịch sử thanh toán | Xem lại toàn bộ giao dịch đã thực hiện |

### 🏫 Phân hệ Giảng viên (Instructor)

Giảng viên có vai trò xây dựng nội dung và quản lý khóa học của mình:

| Tính năng | Mô tả |
|---|---|
| Đăng ký trở thành giảng viên | Nộp hồ sơ, chờ Admin phê duyệt |
| Tạo & quản lý khoá học | CRUD khoá học, chương (chapter), bài giảng (lesson) |
| Gửi duyệt khoá học | Admin duyệt trước khi xuất bản |
| Theo dõi học viên & doanh thu | Xem số lượng ghi danh và thống kê thu nhập |
| Ví giảng viên | Theo dõi hoa hồng (70%), số dư, lịch sử thu nhập |
| Rút tiền | Yêu cầu rút tiền về tài khoản ngân hàng |

### 👑 Phân hệ Quản trị viên (Admin)

Admin có quyền quản lý toàn bộ hệ thống:

| Tính năng | Mô tả |
|---|---|
| Dashboard tổng quan | Thống kê doanh thu, người dùng, khoá học |
| Quản lý người dùng | Xem, phân quyền, khoá/mở tài khoản |
| Duyệt giảng viên | Xét duyệt hồ sơ đăng ký giảng viên |
| Duyệt khoá học | Approve/Reject khoá học mới và bản cập nhật |
| Quản lý danh mục | CRUD danh mục khoá học |
| Chi trả giảng viên | Duyệt yêu cầu rút tiền |
| **Báo cáo & Export** ✨ | Xuất báo cáo doanh thu, người dùng, khoá học, giảng viên ra CSV/Excel |

---

## 4. Yêu cầu phi chức năng

Hệ thống cần đảm bảo các yêu cầu phi chức năng quan trọng sau:

| Tiêu chí | Yêu cầu |
|---|---|
| **Giao diện** | Hiện đại, trực quan, thân thiện với người dùng; hỗ trợ responsive trên nhiều thiết bị |
| **Bảo mật** | Xác thực JWT, phân quyền rõ ràng theo role (Student / Instructor / Admin) |
| **Toàn vẹn dữ liệu** | Dữ liệu khoá học, thanh toán và tiến độ học tập được lưu trữ an toàn trên MongoDB Atlas |
| **Idempotency** | Tránh tính trùng hoa hồng và ghi danh trùng nhờ cơ chế kiểm tra trước khi ghi |
| **Khả năng mở rộng** | Kiến trúc phân tầng (Routes → Controllers → Services → Repositories) dễ mở rộng |
| **Kiểm thử** | Unit test bao phủ các service nghiệp vụ với Jest + Supertest |
| **Đặt tên nhất quán** | Tuân theo RESTful API convention, code được đặt tên rõ ràng, có comment |

---

## 5. Công nghệ sử dụng

Dự án được triển khai theo mô hình **Web Application** với kiến trúc **Client – Server**:

| Layer | Công nghệ | Ghi chú |
|---|---|---|
| **Frontend** | ReactJS 18, Vite, Tailwind CSS | SPA, routing phía client |
| **Backend** | Node.js, Express.js 5, ES Modules | RESTful API |
| **Database** | MongoDB Atlas, Mongoose ODM | NoSQL, cloud |
| **Auth** | JSON Web Token (JWT) | httpOnly cookie + Authorization header |
| **Payment** | MoMo API, thẻ ATM | Tích hợp cổng thanh toán |
| **Upload** | Multer | Lưu file local `/uploads/` |
| **Email** | Nodemailer | Gửi mail reset mật khẩu |
| **Export** | ExcelJS, csv-stringify | Xuất báo cáo `.xlsx` và `.csv` |
| **Validation** | Joi | Kiểm tra dữ liệu đầu vào |
| **Testing** | Jest, Supertest | Unit test cho service layer |

### Kiến trúc hệ thống

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

### Cấu trúc thư mục

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
| POST | `/api/payments/atm` | Student | Thanh toán thẻ ATM |
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
       → [Thanh toán MoMo hoặc ATM] → [Callback xác nhận]
       → [Tạo Enrollment] → [Cộng commission vào ví GV]
       → [Học viên có quyền truy cập khoá học]

Giảng viên tạo khoá học:
  [Tạo khoá học (Draft)] → [Thêm chương + bài giảng]
       → [Gửi duyệt Admin] → [Admin Approve]
       → [Publish khoá học] → [Học viên thấy trên trang chủ]
```

---

## 6. Kết luận sơ bộ

Đề tài **26Tech LMS** giúp nhóm sinh viên rèn luyện các kỹ năng thực tế trong phát triển phần mềm hiện đại, bao gồm:

- **Phân tích yêu cầu** và thiết kế hệ thống theo mô hình phân tầng
- **Làm việc nhóm** với Git Flow, quản lý nhánh tính năng và pull request
- **Xây dựng RESTful API** đầy đủ với xác thực, phân quyền và validation
- **Tích hợp thanh toán thực tế** với cổng MoMo và thẻ ATM
- **Phát triển giao diện** React hiện đại với Tailwind CSS
- **Viết unit test** bao phủ nghiệp vụ cốt lõi
- **Xuất báo cáo** dữ liệu dạng Excel/CSV phục vụ quản trị

Sản phẩm có thể được sử dụng như một **mô hình tham khảo** cho các hệ thống học tập trực tuyến quy mô nhỏ và vừa, đồng thời là nền tảng để mở rộng thêm các tính năng nâng cao trong tương lai như hỗ trợ livestream, AI gợi ý khoá học, hay chứng chỉ hoàn thành.

---

## 📝 License

Dự án được thực hiện cho mục đích học thuật trong khuôn khổ đồ án chuyên ngành.

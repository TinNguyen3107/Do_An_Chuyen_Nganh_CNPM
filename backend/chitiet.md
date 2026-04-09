Quét toàn bộ cấu trúc backend trước:

Listed directory backend
Searched for files: *.js

Đây là toàn bộ cấu trúc backend với chức năng từng file:

---

## 🏗️ Kiến trúc Layered — Backend `Do_An_Chuyen_Nganh_CNPM`

```
📁 backend/
 ├── server.js                    ← Điểm khởi động ứng dụng
 ├── .env                         ← Biến môi trường (bí mật)
 ├── package.json                 ← Dependencies & scripts
 │
 ├── 📁 config/
 ├── 📁 models/
 ├── 📁 validators/
 ├── 📁 middlewares/
 ├── 📁 routes/
 ├── 📁 controllers/
 ├── 📁 services/
 ├── 📁 repositories/
 ├── 📁 utils/
 └── 📁 tests/
```

---

## 📄 [server.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/server.js:0:0-0:0) — Điểm khởi động

**Vai trò:** File đầu tiên chạy khi `npm run dev`. Cấu hình toàn bộ Express app.

```
server.js làm gì?
  1. Import Express, cors, dotenv
  2. Kết nối MongoDB → config/db.js
  3. Gắn middleware toàn cục: cors, json parser, static(/uploads)
  4. Đăng ký tất cả routes: /api/auth, /api/courses, ...
  5. Gắn error handler middleware
  6. Gọi initAdmin() → tạo tài khoản admin mặc định nếu chưa có
  7. Lắng nghe port 5000
```

---

## 📁 `config/`

| File | Chức năng |
|---|---|
| **[db.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/config/db.js:0:0-0:0)** | Kết nối MongoDB bằng Mongoose, log tên database khi connect thành công |

---

## 📁 `models/` — Định nghĩa cấu trúc dữ liệu

> Mỗi file = 1 collection trong MongoDB

| File | Collection | Vai trò |
|---|---|---|
| **[User.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/models/User.js:0:0-0:0)** | `users` | Schema người dùng: name, email, password (hash), role, instructorStatus, avatar. Có **pre-save hook** tự hash password bằng bcrypt |
| **[Course.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/models/Course.js:0:0-0:0)** | `courses` | Schema khoá học: title, description, category, instructor, price, level, status (draft/published), thumbnail, requirements, objectives, tags |
| **[Category.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/models/Category.js:0:0-0:0)** | `categories` | Schema danh mục: name, description, icon, isActive |
| **[Enrollment.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/models/Enrollment.js:0:0-0:0)** | `enrollments` | Schema ghi danh: user + course + enrolledAt. Có unique index ngăn đăng ký trùng |
| **[InstructorProfile.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/models/InstructorProfile.js:0:0-0:0)** | `instructorprofiles` | Schema hồ sơ giảng viên: expertise, education, biography, cvUrl, status (pending/approved/rejected), adminNote, reviewedBy |

---

## 📁 `validators/` — Kiểm tra dữ liệu đầu vào (Joi)

> **Chạy trước controller**, từ chối request không hợp lệ ngay từ đầu

| File | Schemas chứa |
|---|---|
| **[auth.validator.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/validators/auth.validator.js:0:0-0:0)** | `registerSchema`, `loginSchema`, `updateProfileSchema`, `forgotPasswordSchema`, `resetPasswordSchema` |
| **[category.validator.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/validators/category.validator.js:0:0-0:0)** | `createCategorySchema`, `updateCategorySchema` |
| **[course.validator.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/validators/course.validator.js:0:0-0:0)** | `createCourseSchema`, `updateCourseSchema` |
| **[enrollment.validator.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/validators/enrollment.validator.js:0:0-0:0)** | `enrollCourseSchema` |
| **[instructor.validator.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/validators/instructor.validator.js:0:0-0:0)** | `applyAsInstructorSchema`, `rejectInstructorSchema` |
| **[user.validator.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/validators/user.validator.js:0:0-0:0)** | `changeRoleSchema` |

---

## 📁 `middlewares/` — Phần mềm trung gian

> Chạy **giữa** Request và Controller, xử lý xác thực, phân quyền, upload file, lỗi

| File | Chức năng |
|---|---|
| **[authMiddleware.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/middlewares/authMiddleware.js:0:0-0:0)** | Giải mã JWT token từ header `Authorization: Bearer <token>` → đính kèm `req.user`. Có thêm `optionalProtect` (không bắt buộc login) |
| **[roleMiddleware.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/middlewares/roleMiddleware.js:0:0-0:0)** | Kiểm tra `req.user.role` có nằm trong danh sách roles cho phép không. VD: `authorizeRoles('admin')` |
| **[uploadMiddleware.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/middlewares/uploadMiddleware.js:0:0-0:0)** | Cấu hình **Multer** xử lý upload file. Lưu file vào thư mục `/uploads/`, đặt tên file theo timestamp, giới hạn 5MB |
| **[validate.middleware.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/middlewares/validate.middleware.js:0:0-0:0)** | **Factory middleware**: nhận Joi schema → trả về middleware validate `req.body`, `req.query` hoặc `req.params`. Trả HTTP 400 nếu sai |
| **[errorMiddleware.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/middlewares/errorMiddleware.js:0:0-0:0)** | Bắt mọi lỗi từ toàn bộ app, format thành JSON `{ success: false, message }`. Phân biệt môi trường dev/prod |

---

## 📁 `routes/` — Định nghĩa URL endpoints

> Gắn middleware + gọi controller handler cho từng URL

| File | Base URL | Endpoints chính |
|---|---|---|
| **[authRoutes.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/routes/authRoutes.js:0:0-0:0)** | `/api/auth` | POST /register, POST /login, POST /logout, GET /profile, PUT /profile |
| **[categoryRoutes.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/routes/categoryRoutes.js:0:0-0:0)** | `/api/categories` | GET /, GET /:id, POST / (admin), PUT /:id (admin), DELETE /:id (admin) |
| **[courseRoutes.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/routes/courseRoutes.js:0:0-0:0)** | `/api/courses` | GET /, GET /:id, GET /my-courses, POST /, PUT /:id, PATCH /:id/publish, DELETE /:id |
| **[enrollmentRoutes.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/routes/enrollmentRoutes.js:0:0-0:0)** | `/api/enrollments` | POST /, GET /my, GET /check/:courseId |
| **[instructorRoutes.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/routes/instructorRoutes.js:0:0-0:0)** | `/api/instructors` | POST /apply, GET /application, GET /applications (admin), PATCH /applications/:id/approve, PATCH /applications/:id/reject |
| **[userRoutes.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/routes/userRoutes.js:0:0-0:0)** | `/api/users` | GET / (admin), PATCH /:id/role (admin), PATCH /:id/toggle-status (admin) |
| **[statsRoutes.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/routes/statsRoutes.js:0:0-0:0)** | `/api/stats` | GET /overview (admin) — thống kê tổng quan |

---

## 📁 `controllers/` — Xử lý HTTP Request/Response

> Nhận `req`, gọi `service`, trả về `res.json(...)`. **Không có logic nghiệp vụ**

| File | Hàm xử lý |
|---|---|
| **[authController.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/LMS_test2/backend/controllers/authController.js:0:0-0:0)** | [register](cci:1://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/fe/src/services/api.js:43:2-45:4), [login](cci:1://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/fe/src/services/api.js:46:2-46:48), [logout](cci:1://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/fe/src/services/api.js:47:2-47:40), [getProfile](cci:1://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/fe/src/services/api.js:48:2-48:44), [updateProfile](cci:1://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/repositories/instructorRepository.js:14:0-15:84) |
| **[categoryController.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/LMS_test2/backend/controllers/categoryController.js:0:0-0:0)** | `getCategories`, `getCategoryById`, `createCategory`, `updateCategory`, `deleteCategory` |
| **[courseController.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/LMS_test2/backend/controllers/courseController.js:0:0-0:0)** | `getCourses`, [getCourse](cci:1://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/fe/src/services/api.js:93:2-93:77), [getMyCourses](cci:1://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/fe/src/services/api.js:74:2-74:52), `createCourse`, `updateCourse`, `publishCourse`, `deleteCourse`, `getAdminCourses` |
| **[enrollmentController.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/LMS_test2/backend/controllers/enrollmentController.js:0:0-0:0)** | `enrollCourse`, [getMyEnrollments](cci:1://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/fe/src/services/api.js:90:2-90:52), [checkEnrollment](cci:1://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/fe/src/services/api.js:91:58-92:74) |
| **[instructorController.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/LMS_test2/backend/controllers/instructorController.js:0:0-0:0)** | [getMyApplication](cci:1://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/fe/src/services/api.js:107:2-107:61), `applyAsInstructor`, [getAllApplications](cci:1://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/LMS_test2/backend/services/instructorService.js:49:0-58:2), [approveInstructor](cci:1://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/LMS_test2/backend/services/instructorService.js:60:0-81:2), [rejectInstructor](cci:1://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/LMS_test2/backend/services/instructorService.js:83:0-103:2) |
| **[userController.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/LMS_test2/backend/controllers/userController.js:0:0-0:0)** | `getUsers`, `changeUserRole`, `toggleUserStatus` |

---

## 📁 `services/` — Logic nghiệp vụ (Business Logic)

> Trung tâm của ứng dụng — **mọi rule kinh doanh** đặt tại đây

| File | Logic chính |
|---|---|
| **[authService.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/LMS_test2/backend/services/authService.js:0:0-0:0)** | Hash password (bcrypt), tạo JWT token, verify login, forgot/reset password |
| **[categoryService.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/LMS_test2/backend/services/categoryService.js:0:0-0:0)** | Kiểm tra tên danh mục trùng, không cho xóa category có khoá học |
| **[courseService.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/LMS_test2/backend/services/courseService.js:0:0-0:0)** | Kiểm tra instructor đã approved chưa mới được tạo khoá học, chỉ owner mới sửa/xóa, chỉ xóa được draft |
| **[enrollmentService.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/LMS_test2/backend/services/enrollmentService.js:0:0-0:0)** | Kiểm tra đã enroll chưa, kiểm tra khoá học published, cập nhật totalStudents |
| **[instructorService.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/LMS_test2/backend/services/instructorService.js:0:0-0:0)** | Chặn nộp đơn khi đang pending/approved, cập nhật `instructorStatus` của User khi duyệt/từ chối |
| **[userService.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/LMS_test2/backend/services/userService.js:0:0-0:0)** | Lấy danh sách user có phân trang, đổi role, toggle active/inactive |

---

## 📁 `repositories/` — Tương tác Database

> Chỉ chứa **Mongoose queries** thuần túy, không có logic

| File | Queries |
|---|---|
| **[userRepository.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/LMS_test2/backend/repositories/userRepository.js:0:0-0:0)** | findById, findByEmail (+password), createUser, findAllUsers (filter+search+paginate), updateUserById, findPendingInstructors |
| **[courseRepository.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/LMS_test2/backend/repositories/courseRepository.js:0:0-0:0)** | findPublished (filter+search+paginate), findById, findByInstructor, create, updateById, deleteById, countAll |
| **[categoryRepository.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/LMS_test2/backend/repositories/categoryRepository.js:0:0-0:0)** | findAll, findById, findByName, create, update, delete, countCoursesByCategory |
| **[enrollmentRepository.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/LMS_test2/backend/repositories/enrollmentRepository.js:0:0-0:0)** | create, findByUser, findByUserAndCourse (check trùng), findByCourse, countByCourse |
| **[instructorRepository.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/LMS_test2/backend/repositories/instructorRepository.js:0:0-0:0)** | findByUserId, findById, createProfile, updateProfile, updateByUserId, findAllApplications (paginate), countApplications |

---

## 📁 `utils/` — Tiện ích

| File | Chức năng |
|---|---|
| **[generateToken.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/utils/generateToken.js:0:0-0:0)** | Tạo JWT token với `jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' })` |
| **[initAdmin.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/utils/initAdmin.js:0:0-0:0)** | Chạy 1 lần khi server khởi động — kiểm tra nếu chưa có admin thì tạo tài khoản admin mặc định từ [.env](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/.env:0:0-0:0) |

---

## 📁 `tests/` — Unit Tests

| File | Test cho |
|---|---|
| **[authService.test.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/tests/authService.test.js:0:0-0:0)** | Đăng ký, đăng nhập, token |
| **[categoryService.test.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/tests/categoryService.test.js:0:0-0:0)** | CRUD category |
| **[courseService.test.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/tests/courseService.test.js:0:0-0:0)** | Tạo/sửa/xóa/publish khoá học |
| **[enrollmentService.test.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/tests/enrollmentService.test.js:0:0-0:0)** | Ghi danh, check trùng |
| **[instructorService.test.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/tests/instructorService.test.js:0:0-0:0)** | Nộp đơn, approve, reject |
| **[userService.test.js](cci:7://file:///f:/%C4%90%E1%BB%92%20%C3%81N%20CN%20CNPM/Do_An_Chuyen_Nganh_CNPM/backend/tests/userService.test.js:0:0-0:0)** | Quản lý user (admin) |

---

## 🔄 Luồng Request đi qua các tầng

```
Request
   ↓
[Routes]          → Định nghĩa URL, gắn middleware
   ↓
[Validators]      → Joi kiểm tra input (trả 400 nếu sai)
   ↓
[authMiddleware]  → Xác thực JWT (trả 401 nếu sai)
   ↓
[roleMiddleware]  → Kiểm tra quyền (trả 403 nếu sai)
   ↓
[uploadMiddleware]→ Xử lý file upload (nếu có)
   ↓
[Controllers]     → Nhận req, gọi service, trả res
   ↓
[Services]        → Thực thi business logic
   ↓
[Repositories]    → Query MongoDB qua Mongoose
   ↓
[Models]          → Schema + Mongoose hooks
   ↓
  MongoDB
```

TÊN ĐỀ TÀI: **XÂY DỰNG HỆ THỐNG QUẢN LÝ KHOÁ HỌC TRỰC TUYẾN (LMS)**

TÊN ĐỀ TÀI: XÂY DỰNG HỆ THỐNG QUẢN LÝ KHOÁ HỌC TRỰC TUYẾN 26Tech


**1. Giới thiệu chung**
Trong những năm gần đây, giáo dục trực tuyến đang phát triển mạnh mẽ và trở thành xu hướng phổ biến trong đào tạo hiện đại. Nhu cầu học tập mọi lúc, mọi nơi của học viên ngày càng tăng, kéo theo yêu cầu về một hệ thống quản lý khóa học trực tuyến linh hoạt, dễ sử dụng và đảm bảo an toàn dữ liệu.
Dự án này hướng tới xây dựng một nền tảng LMS cơ bản, cho phép giảng viên tạo và quản lý nội dung khóa học, đồng thời hỗ trợ học viên đăng ký, thanh toán và học tập trực tuyến với khả năng theo dõi tiến độ hiệu quả.

**2. Mục tiêu dự án**
Mục tiêu chính bao gồm:
- Cho phép giảng viên tạo và quản lý khóa học, bài giảng và nội dung đào tạo.
- Hỗ trợ học viên tìm kiếm, đăng ký và học tập trực tuyến thông qua nền tảng web.
- Quản lý quá trình ghi danh, thanh toán và cấp quyền truy cập khóa học tự động.
- Cung cấp chức năng theo dõi tiến độ học tập, đánh giá và phản hồi khóa học.
- Xây dựng giao diện thân thiện, dễ sử dụng và phù hợp với người dùng trên nhiều thiết bị.

**3. Phạm vi và chức năng hệ thống**
Hệ thống được thiết kế gồm 3 nhóm người dùng chính: Student (Học viên), Instructor (Giảng viên), Admin (Quản trị viên).

🔹 Phân hệ Học viên (Student)
Học viên có thể sử dụng hệ thống để học tập và quản lý khóa học cá nhân, bao gồm:
- Đăng ký và đăng nhập tài khoản an toàn.
- Tìm kiếm và xem danh sách các khóa học đã được xuất bản.
- Xem chi tiết khóa học (chương, bài giảng, mô tả, giá).
- Ghi danh khóa học miễn phí hoặc thanh toán trực tuyến đối với khóa học trả phí.
- Truy cập bài giảng sau khi ghi danh thành công.
- Đánh dấu hoàn thành bài học và theo dõi tiến độ học tập (%).
- Đánh giá và nhận xét khóa học sau khi hoàn thành phần lớn nội dung.
- Quản lý các khóa học đã đăng ký trong mục “My Courses”.

🔹 Phân hệ Giảng viên (Instructor)
Giảng viên có vai trò xây dựng nội dung và quản lý khóa học của mình:
- Tạo khóa học mới ở trạng thái Draft để chỉnh sửa trước khi xuất bản.
- Quản lý nội dung khóa học: chương, bài giảng video (CRUD).
- Gửi khóa học để Admin duyệt trước khi xuất bản.
- Theo dõi số lượng học viên ghi danh và doanh thu từ khóa học.
- Xem thống kê khóa học qua Instructor Dashboard.
- 
🔹 Phân hệ Quản trị viên (Admin)
Admin có quyền quản lý toàn bộ hệ thống:
- Quản lý người dùng và phân quyền (Admin / Instructor / Student).
- Quản lý danh mục khóa học.
- Duyệt hoặc từ chối các khóa học được gửi lên từ giảng viên.
- Xem thống kê tổng quan hệ thống: doanh thu, số lượng khóa học, số lượng người dùng.
- Xuất báo cáo doanh thu và số lượng học viên theo từng khóa học (Export CSV/PDF).

**4. Yêu cầu phi chức năng**
Hệ thống cần đảm bảo các yêu cầu phi chức năng quan trọng như:
- Giao diện hiện đại, trực quan, thân thiện với người dùng.
- Hỗ trợ responsive trên nhiều thiết bị.
- Bảo mật thông tin với cơ chế xác thực và phân quyền rõ ràng.
- Đảm bảo dữ liệu khóa học, thanh toán và tiến độ học tập được lưu trữ an toàn.
- 
**5. Công nghệ sử dụng**
Dự án dự kiến triển khai với các công nghệ:
- Frontend: ReactJS (Vite), Tailwind CSS
- Backend: Node.js, ExpressJS
- Database: MongoDB

**6. Kết luận sơ bộ**
Đề tài giúp sinh viên rèn luyện kỹ năng làm việc nhóm, phân tích yêu cầu, thiết kế hệ thống và triển khai một ứng dụng web hoàn chỉnh theo quy trình kỹ nghệ phần mềm. Sản phẩm có thể được sử dụng như một mô hình tham khảo cho các hệ thống học tập trực tuyến quy mô nhỏ trong môi trường học tập .

Trong những năm gần đây, giáo dục trực tuyến đang phát triển mạnh mẽ và trở thành xu hướng phổ biến trong đào tạo hiện đại. Nhu cầu học tập mọi lúc, mọi nơi của học viên ngày càng tăng, kéo theo yêu cầu về một hệ thống quản lý khóa học trực tuyến linh hoạt, dễ sử dụng và đảm bảo an toàn dữ liệu.

Dự án này hướng tới xây dựng một nền tảng LMS cơ bản, cho phép giảng viên tạo và quản lý nội dung khóa học, đồng thời hỗ trợ học viên đăng ký, thanh toán và học tập trực tuyến với khả năng theo dõi tiến độ hiệu quả.

2. Mục tiêu dự án

Mục tiêu chính của đề tài là xây dựng một hệ thống học tập trực tuyến đáp ứng các chức năng cốt lõi của một LMS, bao gồm:

Cho phép giảng viên tạo và quản lý khóa học, bài giảng và nội dung đào tạo.

Hỗ trợ học viên tìm kiếm, đăng ký và học tập trực tuyến thông qua nền tảng web.

Quản lý quá trình ghi danh, thanh toán và cấp quyền truy cập khóa học tự động.

Cung cấp chức năng theo dõi tiến độ học tập, đánh giá và phản hồi khóa học.

Xây dựng giao diện thân thiện, dễ sử dụng và phù hợp với người dùng trên nhiều thiết bị.

3. Phạm vi và chức năng hệ thống

Hệ thống LMS được thiết kế gồm 3 nhóm người dùng chính: Student (Học viên), Instructor (Giảng viên), Admin (Quản trị viên).

🔹 Phân hệ Học viên (Student)

Học viên có thể sử dụng hệ thống để học tập và quản lý khóa học cá nhân, bao gồm:

Đăng ký và đăng nhập tài khoản an toàn.

Tìm kiếm và xem danh sách các khóa học đã được xuất bản.

Xem chi tiết khóa học (chương, bài giảng, mô tả, giá).

Ghi danh khóa học miễn phí hoặc thanh toán trực tuyến đối với khóa học trả phí.

Truy cập bài giảng sau khi ghi danh thành công.

Đánh dấu hoàn thành bài học và theo dõi tiến độ học tập (%).

Đánh giá và nhận xét khóa học sau khi hoàn thành phần lớn nội dung.

Quản lý các khóa học đã đăng ký trong mục “My Courses”.

🔹 Phân hệ Giảng viên (Instructor)

Giảng viên có vai trò xây dựng nội dung và quản lý khóa học của mình:

Tạo khóa học mới ở trạng thái Draft để chỉnh sửa trước khi xuất bản.

Quản lý nội dung khóa học: chương, bài giảng video (CRUD).

Gửi khóa học để Admin duyệt trước khi xuất bản.

Theo dõi số lượng học viên ghi danh và doanh thu từ khóa học.

Xem thống kê khóa học qua Instructor Dashboard.

🔹 Phân hệ Quản trị viên (Admin)

Admin có quyền quản lý toàn bộ hệ thống:

Quản lý người dùng và phân quyền (Admin / Instructor / Student).

Quản lý danh mục khóa học.

Duyệt hoặc từ chối các khóa học được gửi lên từ giảng viên.

Xem thống kê tổng quan hệ thống: doanh thu, số lượng khóa học, số lượng người dùng.

Xuất báo cáo doanh thu và số lượng học viên theo từng khóa học (Export CSV/PDF).

4. Yêu cầu phi chức năng

Hệ thống cần đảm bảo các yêu cầu phi chức năng quan trọng như:

Giao diện hiện đại, trực quan, thân thiện với người dùng.

Hỗ trợ responsive trên nhiều thiết bị.

Bảo mật thông tin với cơ chế xác thực và phân quyền rõ ràng.

Đảm bảo dữ liệu khóa học, thanh toán và tiến độ học tập được lưu trữ an toàn.

5. Công nghệ sử dụng

Dự án dự kiến triển khai theo mô hình Web Application với các công nghệ:

Frontend: ReactJS (Vite), Tailwind CSS

Backend: Node.js, ExpressJS

Database: MongoDB


6. Kết luận sơ bộ

Đề tài giúp sinh viên rèn luyện kỹ năng làm việc nhóm, phân tích yêu cầu, thiết kế hệ thống và triển khai một ứng dụng web hoàn chỉnh theo quy trình kỹ nghệ phần mềm. Sản phẩm có thể được sử dụng như một mô hình tham khảo cho các hệ thống học tập trực tuyến quy mô nhỏ trong môi trường học tập .


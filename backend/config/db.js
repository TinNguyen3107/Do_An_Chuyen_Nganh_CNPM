import mongoose from 'mongoose';
import Course from '../models/Course.js';

const connectDB = async () => {
  try {
    // Sửa: dùng đúng tên biến trong .env là MONGODB_URI
    const uri = process.env.MONGODB_URI;

    // Debug để kiểm tra (có thể xóa sau khi chạy ổn)
    console.log('URI đang sử dụng để kết nối MongoDB:', uri || 'UNDEFINED - kiểm tra .env');

    if (!uri) {
      throw new Error('MONGO_URI không tồn tại trong biến môi trường. Kiểm tra file .env');
    }

    const conn = await mongoose.connect(uri, {
      // Các option khuyến nghị cho Atlas (tùy chọn, nhưng tốt hơn)
      serverSelectionTimeoutMS: 5000,     // timeout nếu không chọn được server
      socketTimeoutMS: 45000,             // timeout socket
      family: 4,                          // dùng IPv4 (tránh lỗi IPv6 trên một số mạng)
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database name: ${conn.connection.name}`);

    // Tự động đồng bộ các chỉ mục (indexes) cho Course
    // Lệnh này đảm bảo rằng các thay đổi về Index trong Model (như language_override)
    // sẽ luôn được tự động cập nhật vào Database mà không cần chạy thủ công.
    await Course.syncIndexes();
    console.log('Course Indexes Synced Successfully!');
    
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    // In thêm stack nếu cần debug sâu
    // console.error(error);
    process.exit(1);
  }
};

export default connectDB;
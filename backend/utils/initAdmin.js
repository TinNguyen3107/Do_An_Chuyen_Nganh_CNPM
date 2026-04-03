import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const initAdmin = async () => {
  try {
    // Drop the old clerkId index if it exists from previous iterations
    try {
      await User.collection.dropIndex('clerkId_1');
      console.log('✅ Đã xoá index clerkId_1 cũ.');
    } catch (e) {
      // Ignore if index doesn't exist
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log('⚠️ Không tìm thấy biến môi trường ADMIN_EMAIL hoặc ADMIN_PASSWORD. Bỏ qua khởi tạo Admin mặc định.');
      return;
    }

    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: adminPassword, // pre-save will hash this
        role: 'admin',
        isActive: true,
      });

      console.log('✅ Đã tạo tài khoản Admin mặc định thành công.');
    } else {
      // Ensure the existing admin has role admin
      if (adminExists.role !== 'admin') {
        adminExists.role = 'admin';
        await adminExists.save();
        console.log('✅ Đã cập nhật quyền Admin cho tài khoản mặc định.');
      } else {
        console.log('ℹ️ Tài khoản Admin mặc định đã tồn tại.');
      }
    }
  } catch (error) {
    console.error('❌ Lỗi khi khởi tạo Admin mặc định:', error);
  }
};

export default initAdmin;

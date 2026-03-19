import Category from '../models/Category.js';

const initCategories = async () => {
  try {
    console.log('🔄 Đang khởi tạo danh mục...');
    
    const categories = [
      { name: 'Lập trình Web', description: 'Các khóa học về phát triển web' },
      { name: 'Lập trình Mobile', description: 'Phát triển ứng dụng di động' },
      { name: 'Khoa học dữ liệu', description: 'Data Science và Machine Learning' },
      { name: 'Thiết kế đồ họa', description: 'UI/UX, Photoshop, Figma' },
      { name: 'Marketing', description: 'Digital Marketing, SEO' },
      { name: 'Kinh doanh', description: 'Khởi nghiệp, Quản trị' },
      { name: 'Ngoại ngữ', description: 'Tiếng Anh, Tiếng Nhật, Tiếng Hàn' },
      { name: 'Kỹ năng mềm', description: 'Kỹ năng giao tiếp, làm việc nhóm' }
    ];

    let createdCount = 0;
    for (const cat of categories) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        await Category.create(cat);
        createdCount++;
        console.log(`✅ Đã tạo danh mục: ${cat.name}`);
      } else {
        console.log(`⏭️ Danh mục đã tồn tại: ${cat.name}`);
      }
    }
    
    console.log(`🎯 Khởi tạo danh mục hoàn tất! (${createdCount} mới, ${categories.length - createdCount} đã có)`);
  } catch (error) {
    console.error('❌ Lỗi khi tạo danh mục:', error.message);
  }
};

export default initCategories;
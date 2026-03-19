import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Tiêu đề khóa học là bắt buộc'],
    trim: true 
  },
  description: { 
    type: String, 
    required: [true, 'Mô tả khóa học là bắt buộc'] 
  },
  price: { 
    type: Number, 
    default: 0,
    min: [0, 'Giá không thể âm']
  },
  thumbnail: { 
    type: String,
    default: '/default-course.jpg'
  },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category',
    required: true 
  },
  instructor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['draft', 'published'], 
    default: 'draft' 
  },
  studentsCount: { 
    type: Number, 
    default: 0 
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  duration: {
    type: Number, // tổng số giờ học
    default: 0
  }
}, { 
  timestamps: true 
});

// Index để tìm kiếm nhanh
courseSchema.index({ title: 'text', description: 'text' });

const Course = mongoose.model('Course', courseSchema);
export default Course;
import mongoose from 'mongoose';


const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tiêu đề khoá học là bắt buộc'],
      trim: true,
      maxlength: [200, 'Tiêu đề không được vượt quá 200 ký tự'],
    },
    description: {
      type: String,
      required: [true, 'Mô tả khoá học là bắt buộc'],
      trim: true,
    },
    shortDescription: {
      type: String,
      default: '',
      maxlength: [300, 'Mô tả ngắn không được vượt quá 300 ký tự'],
    },
    thumbnail: {
      type: String,
      default: '',
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Danh mục là bắt buộc'],
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Giá không được âm'],
    },
    // isFree is auto-computed but stored for quick queries
    isFree: {
      type: Boolean,
      default: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'all'],
      default: 'all',
    },
    language: {
      type: String,
      default: 'Tiếng Việt',
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    // Aggregated stats (updated on enrollment/review)
    totalStudents: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalLectures: {
      type: Number,
      default: 0,
    },
    totalDuration: {
      type: Number, // in minutes
      default: 0,
    },
    requirements: {
      type: [String],
      default: [],
    },
    objectives: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Auto-set isFree based on price
courseSchema.pre('save', function (next) {
  this.isFree = this.price === 0;
  next();
});

// Index for fast searches
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
courseSchema.index({ status: 1, category: 1 });
courseSchema.index({ instructor: 1 });

const Course = mongoose.model('Course', courseSchema);
export default Course;

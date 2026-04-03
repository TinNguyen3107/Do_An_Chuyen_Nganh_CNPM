/**
 * Chapter Model
 *
 * Chương học thuộc về một Course.
 * Course → Chapter → Lesson
 */
import mongoose from 'mongoose';

const chapterSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Đảm bảo thứ tự chương là duy nhất trong một khoá học
chapterSchema.index({ course: 1, order: 1 });

const Chapter = mongoose.model('Chapter', chapterSchema);
export default Chapter;

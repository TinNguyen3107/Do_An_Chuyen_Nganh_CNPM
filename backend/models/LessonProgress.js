import mongoose from 'mongoose';

const lessonProgressSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true,
  },

  videoPercent: { type: Number, default: 0 },
  textReadSeconds: { type: Number, default: 0 },

  isVideoCompleted: { type: Boolean, default: false },
  isTextCompleted: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },

  completedAt: Date,
}, { timestamps: true });

lessonProgressSchema.index({ student: 1, lesson: 1 }, { unique: true });

export default mongoose.model('LessonProgress', lessonProgressSchema);
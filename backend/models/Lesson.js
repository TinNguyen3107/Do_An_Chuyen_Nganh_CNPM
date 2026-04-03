/**
 * Lesson Model
 *
 * Mỗi Lesson thuộc về một Course và một Chapter.
 * Hỗ trợ 3 loại: video | text | quiz
 */
import mongoose from 'mongoose';

// ── Quiz question sub-schema ──────────────────────────────────────
const questionSchema = new mongoose.Schema(
  {
    question:     { type: String, required: true, trim: true },
    options:      { type: [String], required: true },
    correctIndex: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

// ── Lesson schema ─────────────────────────────────────────────────
const lessonSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    type: {
      type: String,
      enum: ['video', 'text', 'quiz'],
      required: true,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    // ── Nội dung theo loại ──────────────────────────────────────────
    // video
    video_url:  { type: String, default: '' },
    duration:   { type: Number, default: 0 },  // giây (seconds)

    // text
    text_content: { type: String, default: '' },

    // quiz
    questions: {
      type: [questionSchema],
      default: [],
    },

    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index để sort theo order trong course
lessonSchema.index({ course: 1, order: 1 });

const Lesson = mongoose.model('Lesson', lessonSchema);
export default Lesson;

/**
 * Course Model — clean (no business-rule validation, only schema structure)
 *
 * Validation is handled by Joi validators in validators/course.validator.js
 */
import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      default: '',
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
      required: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    // Auto-computed from price
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
    // ── Admin Review Status ────────────────────────────────────────
    reviewStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    // Aggregated stats (updated on enrollment / review)
    totalStudents: { type: Number, default: 0 },
    averageRating:  { type: Number, default: 0 },
    totalReviews:   { type: Number, default: 0 },
    totalLectures:  { type: Number, default: 0 },
    totalDuration:  { type: Number, default: 0 }, // minutes

    requirements: { type: [String], default: [] },
    objectives:   { type: [String], default: [] },
    tags:         { type: [String], default: [] },

    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Infrastructure hook: auto-set isFree flag based on price
courseSchema.pre('save', function (next) {
  this.isFree = this.price === 0;
  next();
});

// Indexes for fast searches
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
courseSchema.index({ status: 1, category: 1 });
courseSchema.index({ instructor: 1 });

const Course = mongoose.model('Course', courseSchema);
export default Course;

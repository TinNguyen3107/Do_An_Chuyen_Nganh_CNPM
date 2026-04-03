/**
 * InstructorProfile Model — clean (no business-rule validation, only schema structure)
 *
 * Validation is handled by Joi validators in validators/instructor.validator.js
 */
import mongoose from 'mongoose';

const instructorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    expertise: {
      type: String,
      required: true,
      trim: true,
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
    },
    education: {
      type: String,
      default: '',
      trim: true,
    },
    biography: {
      type: String,
      default: '',
      trim: true,
    },
    portfolio: {
      type: String,
      default: '',
      trim: true,
    },
    cvUrl: {
      type: String,
      default: '',
    },
    // Admin review
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminNote: {
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
  },
  { timestamps: true }
);

const InstructorProfile = mongoose.model('InstructorProfile', instructorProfileSchema);
export default InstructorProfile;

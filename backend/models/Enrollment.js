import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    // How the student gained access
    enrollmentType: {
      type: String,
      enum: ['free', 'paid', 'admin_grant'],
      default: 'free',
    },
    // Reference to payment record if paid
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    // Progress percentage (0-100)
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Enforce unique enrollment per user-course pair
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
export default Enrollment;

import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Enrollment from '../models/Enrollment.js';

export const getCourseLessons = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    res.status(400);
    throw new Error('Course ID không hợp lệ');
  }

  const enrollment = await Enrollment.findOne({
    user: userId,
    course: courseId,
  });

  if (!enrollment) {
    res.status(403);
    throw new Error('Bạn chưa ghi danh khóa học này');
  }

  const lessonsCollection = mongoose.connection.db.collection('lessons');

  const lessons = await lessonsCollection
    .find({
      course: new mongoose.Types.ObjectId(courseId),
    })
    .sort({ order: 1 })
    .toArray();

  // Map snake_case DB fields → camelCase expected by LearningPage
  const mapped = lessons.map((l) => ({
    _id:         l._id,
    title:       l.title,
    type:        l.type,
    order:       l.order,
    chapter:     l.chapter,
    // field mapping
    videoUrl:    l.video_url    || l.videoUrl    || '',
    textContent: l.text_content || l.textContent || '',
    duration:    l.duration     || 0,
    questions:   l.questions    || [],
  }));

  res.json({
    success: true,
    data: mapped,
  });
});
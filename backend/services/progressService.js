import * as progressRepo from '../repositories/progressRepository.js';

/**
 * Progress Service — business logic
 */

// ── Helper: cập nhật % tiến độ trên Enrollment ───────────────────────────────

const syncEnrollmentProgress = async (userId, courseId) => {
  const [totalLessons, completedLessons] = await Promise.all([
    progressRepo.countPublishedLessons(courseId),
    progressRepo.countCompletedLessons(userId, courseId),
  ]);

  const progress =
    totalLessons === 0
      ? 0
      : Math.min(100, Math.round((completedLessons / totalLessons) * 100));

  await progressRepo.updateEnrollment(userId, courseId, {
    progress,
    isCompleted: progress === 100,
  });

  return progress;
};

// ── Helper: tìm hoặc tạo LessonProgress doc ──────────────────────────────────

const getOrCreateProgress = async (student, course, lesson) => {
  let progress = await progressRepo.findProgress(student, course, lesson);
  if (!progress) {
    progress = await progressRepo.createProgress(student, course, lesson);
  }
  return progress;
};

// ── Helper: xác định isCompleted dựa trên nội dung bài học ───────────────────

const resolveIsCompleted = (progress, lesson) => {
  // DB lưu snake_case: video_url, text_content
  const hasVideo = !!(lesson?.video_url || lesson?.videoUrl);
  const hasText  = !!(lesson?.text_content || lesson?.textContent);
  const isQuiz   = lesson?.type === 'quiz';

  if (isQuiz) return false; // quiz dùng endpoint riêng
  if (hasVideo && hasText) return progress.isVideoCompleted && progress.isTextCompleted;
  if (hasVideo)            return progress.isVideoCompleted;
  if (hasText)             return progress.isTextCompleted;
  return true; // không có content → mark done
};

// ── Public functions ──────────────────────────────────────────────────────────

/**
 * Ghi nhận thời gian đọc text của học viên
 */
export const handleTextProgress = async (userId, courseId, lessonId, textReadSeconds) => {
  const [progress, lesson] = await Promise.all([
    getOrCreateProgress(userId, courseId, lessonId),
    progressRepo.findLessonRaw(lessonId),
  ]);

  progress.textReadSeconds = Math.max(
    progress.textReadSeconds || 0,
    textReadSeconds || 0
  );

  if (progress.textReadSeconds >= 10) {
    progress.isTextCompleted = true;
  }

  progress.isCompleted = resolveIsCompleted(progress, lesson);

  if (progress.isCompleted && !progress.completedAt) {
    progress.completedAt = new Date();
  }

  await progressRepo.saveProgress(progress);
  await syncEnrollmentProgress(userId, courseId);

  return progress;
};

/**
 * Ghi nhận % video đã xem của học viên
 */
export const handleVideoProgress = async (userId, courseId, lessonId, videoPercent) => {
  const [progress, lesson] = await Promise.all([
    getOrCreateProgress(userId, courseId, lessonId),
    progressRepo.findLessonRaw(lessonId),
  ]);

  progress.videoPercent = Math.max(
    progress.videoPercent || 0,
    videoPercent || 0
  );

  if (progress.videoPercent >= 50) {
    progress.isVideoCompleted = true;
  }

  progress.isCompleted = resolveIsCompleted(progress, lesson);

  if (progress.isCompleted && !progress.completedAt) {
    progress.completedAt = new Date();
  }

  await progressRepo.saveProgress(progress);
  await syncEnrollmentProgress(userId, courseId);

  return progress;
};

/**
 * Đánh dấu bài quiz hoàn thành (chỉ gọi khi đúng 100%)
 */
export const handleQuizProgress = async (userId, courseId, lessonId) => {
  const progress = await getOrCreateProgress(userId, courseId, lessonId);

  progress.isCompleted = true;
  if (!progress.completedAt) progress.completedAt = new Date();

  await progressRepo.saveProgress(progress);
  await syncEnrollmentProgress(userId, courseId);

  return progress;
};

/**
 * Lấy toàn bộ tiến độ của học viên trong một khoá học
 */
export const getCourseProgress = async (userId, courseId) =>
  progressRepo.findProgressByCourse(userId, courseId);

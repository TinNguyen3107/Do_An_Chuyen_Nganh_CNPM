import { useEffect } from 'react';
import { updateVideoProgress, updateTextProgress } from '../../services/progressApi';

export default function LessonLearningPage({ lesson, courseId }) {
  const lessonId = lesson._id;

  // ================= TEXT LOGIC =================
  useEffect(() => {
    if (lesson.textContent) {
      const timer = setTimeout(() => {
        updateTextProgress(courseId, lessonId, 10);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [lesson]);

  return (
    <div>
      <h2>{lesson.title}</h2>

      {/* ================= VIDEO ================= */}
      {lesson.videoUrl && (
        <video
          width="600"
          controls
          onTimeUpdate={(e) => {
            const current = e.target.currentTime;
            const duration = e.target.duration;

            if (!duration) return;

            const percent = (current / duration) * 100;

            if (percent >= 80) {
              updateVideoProgress(courseId, lessonId, percent);
            }
          }}
        >
          <source src={lesson.videoUrl} type="video/mp4" />
        </video>
      )}

      {/* ================= TEXT ================= */}
      {lesson.textContent && (
        <div style={{ marginTop: '20px' }}>
          <p>{lesson.textContent}</p>
        </div>
      )}
    </div>
  );
}
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function LearningPage() {
  const { courseId } = useParams();

  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [textDoneMap, setTextDoneMap] = useState({});
  const [videoDoneMap, setVideoDoneMap] = useState({});

  const textTimerRef = useRef(null);
  const videoReportedRef = useRef({});

  const getAuthConfig = () => {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('userToken') ||
      localStorage.getItem('accessToken');

    return {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      withCredentials: true,
    };
  };

  const markLessonCompletedLocal = (lessonId) => {
    setCompletedLessonIds((prev) =>
      prev.includes(lessonId) ? prev : [...prev, lessonId]
    );
  };

  const fetchLessons = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await axios.get(
        `http://localhost:5000/api/learning/course/${courseId}`,
        getAuthConfig()
      );

      const lessonData = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data?.lessons)
        ? res.data.lessons
        : [];

      setLessons(lessonData);

      if (lessonData.length > 0) {
        setCurrentLesson((prev) => {
          if (!prev) return lessonData[0];
          const stillExists = lessonData.find((l) => l._id === prev._id);
          return stillExists || lessonData[0];
        });
      } else {
        setCurrentLesson(null);
      }
    } catch (err) {
      console.error('Fetch lessons error:', err);
      setError(
        err.response?.data?.message || 'Không thể tải danh sách bài học'
      );
      setLessons([]);
      setCurrentLesson(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/progress/course/${courseId}`,
        getAuthConfig()
      );

      const items = Array.isArray(res.data?.data) ? res.data.data : [];

      const nextTextDoneMap = {};
      const nextVideoDoneMap = {};
      const nextCompletedLessonIds = [];

      items.forEach((item) => {
        const lessonId =
          typeof item.lesson === 'object' && item.lesson !== null
            ? item.lesson._id
            : item.lesson;

        if (!lessonId) return;

        if (item.isTextCompleted) nextTextDoneMap[lessonId] = true;
        if (item.isVideoCompleted) nextVideoDoneMap[lessonId] = true;
        if (item.isCompleted) nextCompletedLessonIds.push(lessonId);
      });

      setTextDoneMap(nextTextDoneMap);
      setVideoDoneMap(nextVideoDoneMap);
      setCompletedLessonIds(nextCompletedLessonIds);
    } catch (err) {
      console.error('Fetch progress error:', err);
    }
  };

  useEffect(() => {
    const initPage = async () => {
      await fetchLessons();
      await fetchProgress();
    };

    initPage();

    return () => {
      if (textTimerRef.current) {
        clearTimeout(textTimerRef.current);
      }
    };
  }, [courseId]);

  const reportTextProgress = async (lesson) => {
    try {
      await axios.post(
        `http://localhost:5000/api/progress/course/${courseId}/lesson/${lesson._id}/text`,
        { textReadSeconds: 10 },
        getAuthConfig()
      );

      setTextDoneMap((prev) => ({ ...prev, [lesson._id]: true }));

      const hasVideo = !!lesson.videoUrl;
      if (!hasVideo || videoDoneMap[lesson._id]) {
        markLessonCompletedLocal(lesson._id);
      }
    } catch (err) {
      console.error('Text progress error:', err);
    }
  };

  const reportVideoProgress = async (lesson, percent) => {
    try {
      await axios.post(
        `http://localhost:5000/api/progress/course/${courseId}/lesson/${lesson._id}/video`,
        { videoPercent: Math.round(percent) },
        getAuthConfig()
      );

      setVideoDoneMap((prev) => ({ ...prev, [lesson._id]: true }));

      const hasText = !!lesson.textContent;
      if (!hasText || textDoneMap[lesson._id]) {
        markLessonCompletedLocal(lesson._id);
      }
    } catch (err) {
      console.error('Video progress error:', err);
    }
  };

  useEffect(() => {
    if (!currentLesson) return;

    if (textTimerRef.current) {
      clearTimeout(textTimerRef.current);
    }

    if (currentLesson.textContent && !textDoneMap[currentLesson._id]) {
      textTimerRef.current = setTimeout(() => {
        reportTextProgress(currentLesson);
      }, 10000);
    }

    return () => {
      if (textTimerRef.current) {
        clearTimeout(textTimerRef.current);
      }
    };
  }, [currentLesson, courseId, textDoneMap, videoDoneMap]);

  const handleVideoTimeUpdate = async (e, lesson) => {
    const video = e.target;
    if (!video?.duration) return;

    const percent = (video.currentTime / video.duration) * 100;

    if (percent >= 80 && !videoReportedRef.current[lesson._id]) {
      videoReportedRef.current[lesson._id] = true;
      await reportVideoProgress(lesson, percent);
    }
  };

  const isLessonLocked = (index) => {
    if (index === 0) return false;

    const previousLesson = lessons[index - 1];
    if (!previousLesson) return false;

    return !completedLessonIds.includes(previousLesson._id);
  };

  const handleSelectLesson = (lesson, index) => {
    if (isLessonLocked(index)) return;
    setCurrentLesson(lesson);
  };

  const getCompletionPercent = () => {
    if (!lessons.length) return 0;
    return Math.round((completedLessonIds.length / lessons.length) * 100);
  };

  return (
    <div className="p-6 text-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Học khóa học</h1>
        <p className="text-slate-400 mt-1">Course ID: {courseId}</p>
      </div>

      <div className="mb-6 bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-300">Tiến độ khóa học</span>
          <span className="font-semibold text-blue-400">
            {getCompletionPercent()}%
          </span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${getCompletionPercent()}%` }}
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          Đang tải bài học...
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-800 text-red-300 rounded-2xl p-6">
          {error}
        </div>
      ) : lessons.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          Không có bài học
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <h2 className="font-bold mb-4">Danh sách bài học</h2>

              <div className="space-y-3">
                {lessons.map((lesson, index) => {
                  const locked = isLessonLocked(index);
                  const completed = completedLessonIds.includes(lesson._id);
                  const active = currentLesson?._id === lesson._id;

                  return (
                    <button
                      key={lesson._id}
                      onClick={() => handleSelectLesson(lesson, index)}
                      disabled={locked}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        active
                          ? 'bg-blue-600 border-blue-500'
                          : locked
                          ? 'bg-slate-800 border-slate-700 opacity-50 cursor-not-allowed'
                          : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold text-sm">
                            {index + 1}. {lesson.title}
                          </div>
                          <div className="text-xs text-slate-300 mt-1">
                            {lesson.textContent ? 'Có văn bản' : 'Không có văn bản'}{' '}
                            • {lesson.videoUrl ? 'Có video' : 'Không có video'}
                          </div>
                        </div>

                        <div className="text-xs font-semibold">
                          {completed ? (
                            <span className="text-green-400">Xong</span>
                          ) : locked ? (
                            <span className="text-yellow-400">Khóa</span>
                          ) : (
                            <span className="text-blue-300">Mở</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {currentLesson ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h2 className="text-xl font-bold mb-4">{currentLesson.title}</h2>

                {currentLesson.videoUrl && (
                  <div className="mb-5">
                    <video
                      src={currentLesson.videoUrl}
                      controls
                      className="w-full rounded-xl bg-black"
                      onTimeUpdate={(e) => handleVideoTimeUpdate(e, currentLesson)}
                    />
                    <p className="text-xs text-slate-400 mt-2">
                      Xem tối thiểu 80% video để hoàn thành phần video.
                    </p>
                  </div>
                )}

                {currentLesson.textContent && (
                  <div className="mb-5">
                    <h3 className="font-semibold mb-2">Nội dung bài học</h3>
                    <div className="bg-slate-800 rounded-xl p-4 text-slate-200 leading-7">
                      {currentLesson.textContent}
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Đọc tối thiểu 10 giây để hoàn thành phần văn bản.
                    </p>
                  </div>
                )}

                <div className="bg-slate-800 rounded-xl p-4">
                  <h3 className="font-semibold mb-2">Trạng thái bài học</h3>
                  <div className="text-sm text-slate-300 space-y-1">
                    <p>
                      Văn bản:{' '}
                      <span
                        className={
                          textDoneMap[currentLesson._id]
                            ? 'text-green-400 font-semibold'
                            : 'text-yellow-400 font-semibold'
                        }
                      >
                        {currentLesson.textContent
                          ? textDoneMap[currentLesson._id]
                            ? 'Đã hoàn thành'
                            : 'Chưa hoàn thành'
                          : 'Không áp dụng'}
                      </span>
                    </p>
                    <p>
                      Video:{' '}
                      <span
                        className={
                          videoDoneMap[currentLesson._id]
                            ? 'text-green-400 font-semibold'
                            : 'text-yellow-400 font-semibold'
                        }
                      >
                        {currentLesson.videoUrl
                          ? videoDoneMap[currentLesson._id]
                            ? 'Đã hoàn thành'
                            : 'Chưa hoàn thành'
                          : 'Không áp dụng'}
                      </span>
                    </p>
                    <p>
                      Bài học:{' '}
                      <span
                        className={
                          completedLessonIds.includes(currentLesson._id)
                            ? 'text-green-400 font-semibold'
                            : 'text-yellow-400 font-semibold'
                        }
                      >
                        {completedLessonIds.includes(currentLesson._id)
                          ? 'Đã hoàn thành'
                          : 'Chưa hoàn thành'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                Chọn một bài học để bắt đầu
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
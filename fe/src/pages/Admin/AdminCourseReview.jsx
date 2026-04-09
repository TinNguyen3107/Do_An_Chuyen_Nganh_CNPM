import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminCourseReviewAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminCourseReview() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [filterTab, setFilterTab] = useState('pending');
  const [expandedLessonId, setExpandedLessonId] = useState(null);
  const [lessonDetail, setLessonDetail] = useState(null);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('26tech_user') || '{}');
  const token = user.token;

  useEffect(() => {
    if (!token) {
      navigate('/auth');
      return;
    }
    fetchCourses();
  }, [page, filterTab, token, navigate]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = { page, limit: pageSize };
      const response =
        filterTab === 'approved'
          ? await adminCourseReviewAPI.getApproved(params)
          : filterTab === 'rejected'
          ? await adminCourseReviewAPI.getRejected(params)
          : await adminCourseReviewAPI.getPending(params);

      setCourses(response.data.courses || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Lỗi khi tải danh sách khoá học:', error);
      toast.error('Lỗi khi tải danh sách khoá học');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (course) => {
    try {
      setLoading(true);
      const response = await adminCourseReviewAPI.getByIdForReview(course._id);
      setSelectedCourse(response.data.data);
      setShowModal(true);
    } catch (error) {
      console.error('Lỗi khi tải chi tiết khoá học:', error);
      toast.error('Lỗi khi tải chi tiết khoá học');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
    setRejectionReason('');
    setExpandedLessonId(null);
    setLessonDetail(null);
  };

  const handleExpandLesson = async (lesson) => {
    if (expandedLessonId === lesson._id) {
      // Nếu đã expand, click lại để collapse
      setExpandedLessonId(null);
      setLessonDetail(null);
      return;
    }

    try {
      setLoadingLesson(true);
      const response = await adminCourseReviewAPI.getLessonDetail(lesson._id);
      setLessonDetail(response.data.data);
      setExpandedLessonId(lesson._id);
    } catch (error) {
      console.error('Lỗi khi tải chi tiết bài học:', error);
      toast.error('Lỗi khi tải chi tiết bài học');
    } finally {
      setLoadingLesson(false);
    }
  };

  const handleApproveCourse = async (courseId) => {
    if (!window.confirm('Bạn có chắc muốn duyệt khoá học này?')) return;

    try {
      setActionLoading(true);
      await adminCourseReviewAPI.approve(courseId);
      toast.success('Khoá học đã được duyệt thành công');
      closeModal();
      fetchCourses();
    } catch (error) {
      console.error('Lỗi khi duyệt khoá học:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi duyệt khoá học');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectCourse = async (courseId) => {
    if (!rejectionReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    if (!window.confirm('Bạn có chắc muốn từ chối khoá học này?')) return;

    try {
      setActionLoading(true);
      await adminCourseReviewAPI.reject(courseId, rejectionReason);
      toast.success('Khoá học đã bị từ chối');
      closeModal();
      fetchCourses();
    } catch (error) {
      console.error('Lỗi khi từ chối khoá học:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi từ chối khoá học');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Duyệt Khoá Học</h1>
        <p className="text-slate-400 text-sm">Kiểm tra và duyệt khoá học từ giảng viên</p>
      </div>

      <div className="flex gap-4 mb-6 border-b border-slate-700">
        {['pending', 'approved', 'rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setFilterTab(tab);
              setPage(1);
            }}
            className={`px-4 py-3 font-medium transition ${
              filterTab === tab
                ? 'text-white border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab === 'pending' && '⏳ Chờ Duyệt'}
            {tab === 'approved' && '✅ Đã Duyệt'}
            {tab === 'rejected' && '❌ Bị Từ Chối'}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Đang tải...</div>
        ) : courses.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            {filterTab === 'pending' && 'Không có khoá học chờ duyệt'}
            {filterTab === 'approved' && 'Không có khoá học đã duyệt'}
            {filterTab === 'rejected' && 'Không có khoá học bị từ chối'}
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-800/50 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Tên Khoá Học</th>
                    <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Giảng Viên</th>
                    <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Trạng Thái</th>
                    <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {courses.map((course) => (
                    <tr key={course._id} className="hover:bg-slate-800/30 transition group">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white group-hover:text-blue-400 transition truncate max-w-xs">{course.title}</div>
                        <div className="text-xs text-slate-500">{course.category?.name}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">{course.instructor?.name || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            course.reviewStatus === 'pending'
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              : course.reviewStatus === 'approved'
                              ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                              : 'bg-red-500/10 text-red-500 border border-red-500/20'
                          }`}
                        >
                          {course.reviewStatus === 'pending' && '⏳ Chờ duyệt'}
                          {course.reviewStatus === 'approved' && '✅ Đã duyệt'}
                          {course.reviewStatus === 'rejected' && '❌ Từ chối'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleViewDetail(course)}
                          className="px-4 py-1.5 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white border border-slate-700 hover:border-blue-500 rounded-lg transition-all"
                        >
                          Xem Chi Tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 p-4 border-t border-slate-800">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`min-w-[32px] h-8 rounded-lg flex items-center justify-center transition-all ${
                      page === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && selectedCourse && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-h-[90vh] overflow-y-auto max-w-4xl w-full shadow-2xl">
            <div className="sticky top-0 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-8 py-5 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-blue-500">📘</span> Chi Tiết Khoá Học
              </h2>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition">
                ✕
              </button>
            </div>

            <div className="p-8 space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
                  <h3 className="text-lg font-bold text-white">📚 Thông Tin Chung</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-slate-400 text-xs uppercase font-semibold">Tên Khoá Học</p>
                    <p className="text-white text-lg font-medium">{selectedCourse.title}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 text-xs uppercase font-semibold">Giảng Viên</p>
                    <p className="text-white text-lg font-medium">{selectedCourse.instructor?.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 text-xs uppercase font-semibold">Danh Mục</p>
                    <p className="text-white font-medium">{selectedCourse.category?.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 text-xs uppercase font-semibold">Mức Độ</p>
                    <p className="text-white font-medium capitalize">{selectedCourse.level}</p>
                  </div>
                </div>
                <div className="mt-6 space-y-1">
                  <p className="text-slate-400 text-xs uppercase font-semibold">Mô Tả Ngắn</p>
                  <p className="text-slate-300 italic">{selectedCourse.shortDescription || 'Không có mô tả ngắn'}</p>
                </div>
                <div className="mt-4 space-y-1">
                  <p className="text-slate-400 text-xs uppercase font-semibold">Mô Tả Chi Tiết</p>
                  <p className="text-slate-200 mt-2 whitespace-pre-wrap">{selectedCourse.description}</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-8 w-1 bg-purple-500 rounded-full"></div>
                  <h3 className="text-lg font-bold text-white">📖 Đề cương khoá học</h3>
                </div>
                <div className="space-y-4">
                  {selectedCourse.chapters?.map((chapter, idx) => (
                    <div key={chapter._id} className="bg-slate-800/40 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
                      <div className="font-bold text-white mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 bg-slate-700 rounded-md flex items-center justify-center text-xs text-blue-400">{idx + 1}</span>
                        {chapter.title}
                      </div>
                      <div className="space-y-3">
                        {chapter.lessons?.map((lesson, lessonIdx) => (
                          <div key={lesson._id}>
                            <button
                              onClick={() => handleExpandLesson(lesson)}
                              disabled={loadingLesson}
                              className="w-full text-left text-sm text-slate-300 ml-8 flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/30 transition group"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full transition ${expandedLessonId === lesson._id ? 'bg-blue-400' : 'bg-slate-600'}`}></span>
                              <div className="flex-1">
                                <span className="font-medium group-hover:text-blue-400">{lesson.title}</span>
                                <span className="mx-2 text-slate-600">•</span>
                                <span className="text-xs text-slate-500 uppercase">{lesson.type}</span>
                              </div>
                              <span className={`text-xs text-slate-500 transition ${expandedLessonId === lesson._id ? 'rotate-180' : ''}`}>▼</span>
                            </button>

                            {/* Chi tiết lesson */}
                            {expandedLessonId === lesson._id && (
                              <div className="ml-8 mt-3 p-4 bg-slate-900/50 border border-slate-700 rounded-lg space-y-3">
                                {loadingLesson ? (
                                  <div className="text-slate-400 text-sm">Đang tải chi tiết bài học...</div>
                                ) : lessonDetail ? (
                                  <>
                                    {/* Video */}
                                    {lessonDetail.type === 'video' && (
                                      <div className="space-y-2">
                                        <p className="text-xs text-slate-500 uppercase font-semibold">📹 Video</p>
                                        {lessonDetail.video_url ? (
                                          <div className="space-y-2">
                                            {/* YouTube embed */}
                                            {(lessonDetail.video_url.includes('youtube.com') || lessonDetail.video_url.includes('youtu.be')) ? (
                                              <div className="aspect-video bg-slate-950 rounded-lg overflow-hidden border border-slate-700">
                                                <iframe
                                                  width="100%"
                                                  height="100%"
                                                  src={lessonDetail.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                                                  title="Video bài học"
                                                  frameBorder="0"
                                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                  allowFullScreen
                                                  className="w-full h-full"
                                                ></iframe>
                                              </div>
                                            ) : (
                                              // Generic video player
                                              <div className="aspect-video bg-slate-950 rounded-lg overflow-hidden border border-slate-700">
                                                <video
                                                  width="100%"
                                                  height="100%"
                                                  controls
                                                  className="w-full h-full"
                                                >
                                                  <source src={lessonDetail.video_url} type="video/mp4" />
                                                  Trình duyệt của bạn không hỗ trợ video
                                                </video>
                                              </div>
                                            )}
                                            <a 
                                              href={lessonDetail.video_url} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-blue-400 hover:text-blue-300 hover:underline break-all text-xs"
                                            >
                                              {lessonDetail.video_url}
                                            </a>
                                          </div>
                                        ) : (
                                          <p className="text-slate-500 text-xs italic">Chưa có video</p>
                                        )}
                                      </div>
                                    )}

                                    {/* Text Content */}
                                    {lessonDetail.type === 'text' && (
                                      <div className="space-y-2">
                                        <p className="text-xs text-slate-500 uppercase font-semibold">📝 Nội dung bài đọc</p>
                                        {lessonDetail.text_content ? (
                                          <div className="bg-slate-950 p-3 rounded border border-slate-700 text-slate-200 text-sm max-h-64 overflow-y-auto whitespace-pre-wrap">
                                            {lessonDetail.text_content}
                                          </div>
                                        ) : (
                                          <p className="text-slate-500 text-xs italic">Chưa có nội dung</p>
                                        )}
                                      </div>
                                    )}

                                    {/* Quiz */}
                                    {lessonDetail.type === 'quiz' && (
                                      <div className="space-y-3">
                                        <p className="text-xs text-slate-500 uppercase font-semibold">❓ Câu hỏi trắc nghiệm</p>
                                        {lessonDetail.questions && lessonDetail.questions.length > 0 ? (
                                          <div className="space-y-3">
                                            {lessonDetail.questions.map((q, qIdx) => (
                                              <div key={qIdx} className="bg-slate-950 p-3 rounded border border-slate-700">
                                                <p className="text-slate-200 text-sm font-medium mb-2">
                                                  <span className="text-slate-500">Q{qIdx + 1}:</span> {q.question}
                                                </p>
                                                <ul className="space-y-1 ml-4">
                                                  {q.options.map((opt, optIdx) => (
                                                    <li key={optIdx} className={`text-xs text-slate-300 flex items-center gap-2 ${optIdx === q.correctIndex ? 'text-green-400' : ''}`}>
                                                      <span className={optIdx === q.correctIndex ? 'text-green-500' : 'text-slate-600'}>
                                                        {optIdx === q.correctIndex ? '✓' : '○'}
                                                      </span>
                                                      {opt}
                                                    </li>
                                                  ))}
                                                </ul>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <p className="text-slate-500 text-xs italic">Chưa có câu hỏi</p>
                                        )}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <p className="text-slate-500 text-xs">Không thể tải chi tiết bài học</p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                        {(!chapter.lessons || chapter.lessons.length === 0) && (
                          <div className="text-xs text-slate-500 ml-8 italic italic">Chưa có bài học trong chương này</div>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!selectedCourse.chapters || selectedCourse.chapters.length === 0) && (
                    <div className="bg-slate-800/20 border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500">
                      Hiện chưa có nội dung chương học nào được cập nhật
                    </div>
                  )}
                </div>
              </section>

              {selectedCourse.reviewStatus === 'rejected' && selectedCourse.rejectionReason && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
                   <div className="flex items-center gap-2 mb-3 text-red-500">
                    <span className="text-lg">⚠️</span>
                    <h3 className="font-bold uppercase text-xs tracking-wider">Lý Do Từ Chối</h3>
                   </div>
                  <p className="text-red-200 text-sm">{selectedCourse.rejectionReason}</p>
                </div>
              )}

              {selectedCourse.reviewStatus === 'pending' && (
                <div className="space-y-3 pt-6 border-t border-slate-800">
                   <div className="flex items-center gap-2 text-amber-500 mb-1">
                    <h3 className="font-bold uppercase text-xs tracking-wider">Ý kiến phản hồi (Nếu từ chối)</h3>
                   </div>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Vui lòng cung cấp lý do cụ thể nếu từ chối duyệt khoá học..."
                    className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    rows="4"
                  />
                  <p className="text-slate-500 text-xs">Phản hồi này sẽ được gửi trực tiếp đến giảng viên thông qua hệ thống.</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-slate-900 border-t border-slate-800 px-8 py-5 flex justify-end gap-4 z-10">
              {selectedCourse.reviewStatus === 'pending' ? (
                <>
                  <button
                    onClick={closeModal}
                    disabled={actionLoading}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition disabled:opacity-50"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={() => handleRejectCourse(selectedCourse._id)}
                    disabled={actionLoading}
                    className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl font-medium transition-all disabled:opacity-50"
                  >
                    {actionLoading ? 'Đang xử lý...' : 'Từ Chối'}
                  </button>
                  <button
                    onClick={() => handleApproveCourse(selectedCourse._id)}
                    disabled={actionLoading}
                    className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
                  >
                    {actionLoading ? 'Đang xử lý...' : 'Duyệt Khoá Học'}
                  </button>
                </>
              ) : (
                <button
                  onClick={closeModal}
                  className="px-10 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition"
                >
                  Đóng cửa sổ
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

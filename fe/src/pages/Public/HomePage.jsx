import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { courseAPI, categoryAPI } from '../../services/api';

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(i => (
      <svg key={i} className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'text-amber-400' : 'text-slate-600'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const CourseCard = ({ course }) => (
  <Link to={`/courses/${course._id}`} className="group block bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1">
    <div className="aspect-video bg-slate-800 relative overflow-hidden">
      {course.thumbnail ? (
        <img src={course.thumbnail} alt={course.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
          <svg className="w-12 h-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      <div className="absolute top-3 left-3 px-2 py-1 bg-slate-900/90 backdrop-blur-md rounded-md text-xs font-bold text-blue-400 border border-blue-500/20">
        {course.category?.name || 'Khác'}
      </div>
      {course.isFree && (
        <div className="absolute top-3 right-3 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-md text-xs font-bold text-green-400">
          MIỄN PHÍ
        </div>
      )}
    </div>
    <div className="p-5">
      <h3 className="font-bold text-base text-white mb-1 group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">{course.title}</h3>
      <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        {course.instructor?.name}
      </p>
      <div className="flex items-center gap-2 mb-3">
        <StarRating rating={course.averageRating || 0} />
        <span className="text-xs text-amber-400 font-semibold">{course.averageRating > 0 ? course.averageRating.toFixed(1) : 'Mới'}</span>
        <span className="text-xs text-slate-600">({course.totalStudents || 0})</span>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
        <span className="font-bold text-lg text-white">
          {course.isFree ? <span className="text-green-400">Miễn phí</span> : `${Number(course.price).toLocaleString('vi-VN')}đ`}
        </span>
        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-lg">{course.level || 'Tất cả'}</span>
      </div>
    </div>
  </Link>
);

const STATS = [
  { label: 'Học viên', value: '10,000+', icon: '👥' },
  { label: 'Khoá học', value: '500+', icon: '📚' },
  { label: 'Giảng viên', value: '200+', icon: '🏫' },
  { label: 'Đánh giá 5 sao', value: '98%', icon: '⭐' },
];

const FEATURES = [
  { icon: '🎯', title: 'Học theo lộ trình', desc: 'Nội dung được thiết kế bài bản, từ cơ bản đến nâng cao' },
  { icon: '📱', title: 'Học mọi lúc mọi nơi', desc: 'Truy cập khoá học từ bất kỳ thiết bị nào, bất cứ lúc nào' },
  { icon: '🏆', title: 'Chứng chỉ hoàn thành', desc: 'Nhận chứng chỉ sau khi hoàn thành khoá học' },
  { icon: '💬', title: 'Hỗ trợ tận tâm', desc: 'Đội ngũ giảng viên luôn sẵn sàng hỗ trợ bạn' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      courseAPI.getAll({ limit: 8 }),
      categoryAPI.getAll(),
    ]).then(([cRes, catRes]) => {
      setFeatured(cRes.data.courses || []);
      setCategories((catRes.data.data || []).slice(0, 6));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col">
      {/* HERO SECTION */}
      <section className="relative w-full px-6 py-24 md:py-36 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.15),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-semibold mb-8">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            Nền tảng học trực tuyến hàng đầu Việt Nam
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Nâng tầm kiến thức<br />cùng{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
              26Tech
            </span>
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Học bất cứ đâu, bất cứ lúc nào với hàng trăm khoá học chất lượng từ các chuyên gia hàng đầu trong ngành.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/courses" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 text-base">
              🚀 Khám phá khoá học
            </Link>
            <Link to="/auth" className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all border border-slate-700 hover:border-slate-600 text-base">
              Đăng ký miễn phí →
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="w-full py-12 border-y border-slate-800 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-3xl font-extrabold text-white mb-1">{s.value}</div>
                <div className="text-slate-400 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="w-full max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Danh mục nổi bật</h2>
              <p className="text-slate-400">Khám phá các lĩnh vực học tập đa dạng</p>
            </div>
            <Link to="/courses" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">Xem tất cả →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((cat, i) => {
              const emojis = ['💻', '🌐', '🤖', '📊', '📱', '🎨', '🔐', '☁️'];
              return (
                <Link key={cat._id} to={`/courses?category=${cat._id}`} className="group flex flex-col items-center gap-3 p-5 bg-slate-900 border border-slate-800 rounded-2xl text-center hover:border-blue-500/40 hover:bg-blue-500/5 transition-all duration-300 hover:-translate-y-1">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{emojis[i % emojis.length]}</span>
                  <span className="text-sm font-semibold text-slate-300 group-hover:text-blue-400 transition-colors line-clamp-2">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* FEATURED COURSES */}
      <section className="w-full max-w-7xl mx-auto px-6 py-16 border-t border-slate-800">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Khoá học nổi bật</h2>
            <p className="text-slate-400">Các khoá học được đánh giá cao nhất trên 26Tech</p>
          </div>
          <Link to="/courses" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">Xem tất cả →</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-slate-800" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-800 rounded w-1/2" />
                  <div className="h-4 bg-slate-800 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map(course => <CourseCard key={course._id} course={course} />)}
            {featured.length === 0 && (
              <div className="col-span-4 text-center py-20 text-slate-500">
                <div className="text-5xl mb-4">📚</div>
                <p>Chưa có khoá học nào được xuất bản.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* FEATURES */}
      <section className="w-full py-20 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Tại sao chọn 26Tech?</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Chúng tôi cung cấp trải nghiệm học tập tốt nhất với công nghệ hiện đại</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">{f.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="w-full py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-3xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Sẵn sàng bắt đầu hành trình học tập?
            </h2>
            <p className="text-slate-400 mb-8 text-lg">Đăng ký miễn phí và khám phá hàng trăm khoá học ngay hôm nay</p>
            <div className="flex gap-4 justify-center">
              <Link to="/auth" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-500/30 text-base">
                Bắt đầu ngay miễn phí
              </Link>
              <Link to="/courses" className="px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold rounded-2xl transition-all text-base">
                Xem khoá học
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

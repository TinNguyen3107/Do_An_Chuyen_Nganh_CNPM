import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { courseAPI, categoryAPI } from '../../services/api';

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(i => (
      <svg key={i} className={`w-3 h-3 ${i <= Math.round(rating) ? 'text-amber-400' : 'text-slate-600'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

export default function CourseList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const category = searchParams.get('category') || '';
  const level = searchParams.get('level') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 12;

  useEffect(() => {
    categoryAPI.getAll().then(res => setCategories(res.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit };
    if (category) params.category = category;
    if (level) params.level = level;
    if (searchParams.get('search')) params.search = searchParams.get('search');

    courseAPI.getAll(params).then(res => {
      setCourses(res.data.courses || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    }).catch(console.error).finally(() => setLoading(false));
  }, [searchParams]);

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const handleSearch = (ev) => {
    ev.preventDefault();
    setParam('search', search);
  };

  const LEVELS = [
    { value: '', label: 'Tất cả cấp độ' },
    { value: 'beginner', label: 'Cơ bản' },
    { value: 'intermediate', label: 'Trung cấp' },
    { value: 'advanced', label: 'Nâng cao' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Khám phá Khoá học</h1>
        <p className="text-slate-400">
          {total > 0 ? `${total} khoá học có sẵn` : 'Đang tải...'}
        </p>
      </div>

      {/* SEARCH BAR */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm khoá học..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all">
          Tìm kiếm
        </button>
      </form>

      <div className="flex gap-8">
        {/* SIDEBAR FILTERS */}
        <div className="w-56 flex-shrink-0 hidden lg:block">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sticky top-24">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Bộ lọc</h3>

            {/* Categories */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Danh mục</p>
              <div className="space-y-1">
                <button
                  onClick={() => setParam('category', '')}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${!category ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                  Tất cả
                </button>
                {categories.map(cat => (
                  <button
                    key={cat._id}
                    onClick={() => setParam('category', cat._id)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${category === cat._id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Level */}
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Cấp độ</p>
              <div className="space-y-1">
                {LEVELS.map(l => (
                  <button
                    key={l.value}
                    onClick={() => setParam('level', l.value)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${level === l.value ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* COURSES GRID */}
        <div className="flex-1 min-w-0">
          {/* Mobile filters */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-2 lg:hidden">
            <button onClick={() => setParam('category', '')} className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-lg transition-colors ${!category ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Tất cả</button>
            {categories.map(cat => (
              <button key={cat._id} onClick={() => setParam('category', cat._id)} className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-lg transition-colors ${category === cat._id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>{cat.name}</button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
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
          ) : courses.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-white mb-2">Không tìm thấy khoá học</h3>
              <p className="text-slate-400 mb-6">Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm</p>
              <button onClick={() => setSearchParams({})} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all">
                Xoá bộ lọc
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {courses.map(course => (
                  <Link key={course._id} to={`/courses/${course._id}`} className="group block bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
                    <div className="aspect-video bg-slate-800 relative overflow-hidden">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                          <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 px-2 py-1 bg-slate-900/90 rounded-md text-xs font-bold text-blue-400">
                        {course.category?.name}
                      </div>
                      {course.isFree && (
                        <div className="absolute top-3 right-3 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-md text-xs font-bold text-green-400">FREE</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-sm text-white mb-1 group-hover:text-blue-400 transition-colors line-clamp-2">{course.title}</h3>
                      <p className="text-xs text-slate-500 mb-2">{course.instructor?.name}</p>
                      <div className="flex items-center gap-1.5 mb-3">
                        <StarRating rating={course.averageRating || 0} />
                        <span className="text-xs text-amber-400 font-semibold">{course.averageRating > 0 ? course.averageRating.toFixed(1) : 'Mới'}</span>
                        <span className="text-xs text-slate-600">({course.totalStudents || 0})</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                        <span className="font-bold text-base text-white">
                          {course.isFree ? <span className="text-green-400 text-sm">Miễn phí</span> : `${Number(course.price).toLocaleString('vi-VN')}đ`}
                        </span>
                        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{course.level || 'All'}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', i + 1); setSearchParams(p); }}
                      className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

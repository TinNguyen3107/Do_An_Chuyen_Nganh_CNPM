import { useState, useEffect, useCallback } from 'react';
import { reportAPI } from '../../services/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString('vi-VN') + 'đ';
const fmtNum = (n) => Number(n || 0).toLocaleString('vi-VN');

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryCard({ icon, label, value, color, sub }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${color} shadow-lg`}>
      <div className="absolute -right-3 -top-3 text-6xl opacity-10 select-none">{icon}</div>
      <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">{label}</p>
      <p className="text-2xl font-extrabold text-white leading-tight">{value}</p>
      {sub && <p className="text-xs text-white/50 mt-1">{sub}</p>}
    </div>
  );
}

function FilterBar({ startDate, endDate, groupBy, showGroupBy, onStartDate, onEndDate, onGroupBy, onSearch, loading }) {
  return (
    <div className="flex flex-wrap items-end gap-3 mb-6 p-4 bg-slate-800/60 border border-slate-700 rounded-2xl">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-400 font-medium">Từ ngày</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDate(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-400 font-medium">Đến ngày</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDate(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
        />
      </div>
      {showGroupBy && (
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400 font-medium">Nhóm theo</label>
          <select
            value={groupBy}
            onChange={(e) => onGroupBy(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="day">Theo ngày</option>
            <option value="month">Theo tháng</option>
          </select>
        </div>
      )}
      <button
        onClick={onSearch}
        disabled={loading}
        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        {loading ? '⏳ Đang tải...' : '🔍 Xem báo cáo'}
      </button>
    </div>
  );
}

function ExportBar({ onExport, exporting }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-xs text-slate-400 font-medium">Xuất file:</span>
      <button
        onClick={() => onExport('excel')}
        disabled={exporting}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
      >
        📊 Excel (.xlsx)
      </button>
      <button
        onClick={() => onExport('csv')}
        disabled={exporting}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
      >
        📄 CSV
      </button>
      {exporting && <span className="text-xs text-slate-500 animate-pulse">Đang tạo file...</span>}
    </div>
  );
}

function DataTable({ columns, rows, emptyMsg = 'Không có dữ liệu' }) {
  const [page, setPage]     = useState(1);
  const PAGE_SIZE = 15;
  const total     = rows.length;
  const totalPages= Math.ceil(total / PAGE_SIZE);
  const slice     = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (rows.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-sm">{emptyMsg}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800/80">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((row, i) => (
              <tr key={i} className={`border-t border-slate-800 ${i % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-900/20'} hover:bg-slate-800/50 transition-colors`}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-slate-300 whitespace-nowrap">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-xs text-slate-400">
          <span>Hiển thị {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} / {total} dòng</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40">← Trước</button>
            <span className="px-3 py-1.5 bg-slate-800 rounded-lg">{page}/{totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40">Sau →</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Revenue ─────────────────────────────────────────────────────────────
function RevenueTab() {
  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = today.slice(0, 8) + '01';

  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate,   setEndDate]   = useState(today);
  const [groupBy,   setGroupBy]   = useState('day');
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportAPI.getRevenue({ startDate, endDate, groupBy });
      setData(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [startDate, endDate, groupBy]);

  useEffect(() => { load(); }, []);

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const res = await reportAPI.exportRevenue({ startDate, endDate, groupBy, format });
      const ext = format === 'csv' ? 'csv' : 'xlsx';
      downloadBlob(res.data, `report_revenue_${today}.${ext}`);
    } catch (e) { console.error(e); }
    finally { setExporting(false); }
  };

  const COLS = [
    { key: 'period',          label: 'Kỳ' },
    { key: 'transactions',    label: 'Giao dịch', render: (v) => fmtNum(v) },
    { key: 'totalAmount',     label: 'Doanh thu',      render: (v) => <span className="font-semibold text-emerald-400">{fmt(v)}</span> },
    { key: 'platformFee',     label: 'Platform (30%)', render: (v) => <span className="text-blue-400">{fmt(v)}</span> },
    { key: 'commissionAmount',label: 'GV (70%)',        render: (v) => <span className="text-purple-400">{fmt(v)}</span> },
  ];

  return (
    <div>
      <FilterBar
        startDate={startDate} endDate={endDate} groupBy={groupBy} showGroupBy
        onStartDate={setStartDate} onEndDate={setEndDate} onGroupBy={setGroupBy}
        onSearch={load} loading={loading}
      />
      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <SummaryCard icon="💰" label="Tổng doanh thu" value={fmt(data.summary.totalRevenue)} color="from-emerald-600 to-teal-700" />
            <SummaryCard icon="🏦" label="Platform (30%)" value={fmt(data.summary.totalPlatformFee)} color="from-blue-600 to-indigo-700" />
            <SummaryCard icon="🏫" label="Hoa hồng GV (70%)" value={fmt(data.summary.totalCommission)} color="from-purple-600 to-pink-700" />
            <SummaryCard icon="🧾" label="Giao dịch" value={fmtNum(data.summary.totalTransactions)} color="from-amber-600 to-orange-700" sub="thành công" />
          </div>
          <ExportBar onExport={handleExport} exporting={exporting} />
          <DataTable columns={COLS} rows={data.rows} emptyMsg="Không có doanh thu trong khoảng thời gian này" />
        </>
      )}
    </div>
  );
}

// ─── Tab: Users ───────────────────────────────────────────────────────────────
function UsersTab() {
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState('2000-01-01');
  const [endDate,   setEndDate]   = useState(today);
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportAPI.getUsers({ startDate, endDate });
      setData(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [startDate, endDate]);

  useEffect(() => { load(); }, []);

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const res = await reportAPI.exportUsers({ startDate, endDate, format });
      const ext = format === 'csv' ? 'csv' : 'xlsx';
      downloadBlob(res.data, `report_users_${today}.${ext}`);
    } catch (e) { console.error(e); }
    finally { setExporting(false); }
  };

  const COLS = [
    { key: 'name',            label: 'Họ tên' },
    { key: 'email',           label: 'Email', render: (v) => <span className="text-slate-400">{v}</span> },
    { key: 'role',            label: 'Vai trò', render: (v) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${v === 'Học viên' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>{v}</span>
    )},
    { key: 'status',          label: 'Trạng thái', render: (v) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${v === 'Hoạt động' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{v}</span>
    )},
    { key: 'enrollmentCount', label: 'Khoá đăng ký', render: (v) => fmtNum(v) },
    { key: 'createdAt',       label: 'Ngày tham gia' },
  ];

  return (
    <div>
      <FilterBar startDate={startDate} endDate={endDate} onStartDate={setStartDate} onEndDate={setEndDate} onSearch={load} loading={loading} />
      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <SummaryCard icon="👥" label="Tổng người dùng" value={fmtNum(data.summary.totalUsers)} color="from-indigo-600 to-blue-700" />
            <SummaryCard icon="🎓" label="Học viên" value={fmtNum(data.summary.totalStudents)} color="from-sky-600 to-cyan-700" />
            <SummaryCard icon="🏫" label="Giảng viên" value={fmtNum(data.summary.totalInstructors)} color="from-amber-600 to-orange-700" />
            <SummaryCard icon="✅" label="Đang hoạt động" value={fmtNum(data.summary.activeUsers)} color="from-emerald-600 to-teal-700" />
          </div>
          <ExportBar onExport={handleExport} exporting={exporting} />
          <DataTable columns={COLS} rows={data.rows} />
        </>
      )}
    </div>
  );
}

// ─── Tab: Courses ─────────────────────────────────────────────────────────────
function CoursesTab() {
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState('2000-01-01');
  const [endDate,   setEndDate]   = useState(today);
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportAPI.getCourses({ startDate, endDate });
      setData(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [startDate, endDate]);

  useEffect(() => { load(); }, []);

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const res = await reportAPI.exportCourses({ startDate, endDate, format });
      const ext = format === 'csv' ? 'csv' : 'xlsx';
      downloadBlob(res.data, `report_courses_${today}.${ext}`);
    } catch (e) { console.error(e); }
    finally { setExporting(false); }
  };

  const COLS = [
    { key: 'title',          label: 'Khoá học', render: (v) => <span className="font-medium text-white max-w-[200px] block truncate">{v}</span> },
    { key: 'instructor',     label: 'Giảng viên' },
    { key: 'category',       label: 'Danh mục' },
    { key: 'status',         label: 'Trạng thái', render: (v) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${v === 'Đã xuất bản' ? 'bg-emerald-500/20 text-emerald-400' : v === 'Nháp' ? 'bg-slate-500/20 text-slate-400' : 'bg-orange-500/20 text-orange-400'}`}>{v}</span>
    )},
    { key: 'totalStudents',  label: 'Học viên', render: (v) => fmtNum(v) },
    { key: 'averageRating',  label: 'Rating', render: (v) => v ? <span className="text-yellow-400">⭐ {Number(v).toFixed(1)}</span> : '—' },
    { key: 'revenue',        label: 'Doanh thu', render: (v) => <span className="font-semibold text-emerald-400">{fmt(v)}</span> },
  ];

  return (
    <div>
      <FilterBar startDate={startDate} endDate={endDate} onStartDate={setStartDate} onEndDate={setEndDate} onSearch={load} loading={loading} />
      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <SummaryCard icon="📚" label="Tổng khoá học" value={fmtNum(data.summary.totalCourses)} color="from-indigo-600 to-blue-700" />
            <SummaryCard icon="🌐" label="Đã xuất bản" value={fmtNum(data.summary.publishedCourses)} color="from-emerald-600 to-teal-700" />
            <SummaryCard icon="💰" label="Tổng doanh thu" value={fmt(data.summary.totalRevenue)} color="from-purple-600 to-pink-700" />
            <SummaryCard icon="⭐" label="Rating trung bình" value={data.summary.avgRating} color="from-amber-600 to-orange-700" sub="/ 5.0" />
          </div>
          <ExportBar onExport={handleExport} exporting={exporting} />
          <DataTable columns={COLS} rows={data.rows} />
        </>
      )}
    </div>
  );
}

// ─── Tab: Instructors ─────────────────────────────────────────────────────────
function InstructorsTab() {
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState('2000-01-01');
  const [endDate,   setEndDate]   = useState(today);
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportAPI.getInstructors({ startDate, endDate });
      setData(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [startDate, endDate]);

  useEffect(() => { load(); }, []);

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const res = await reportAPI.exportInstructors({ startDate, endDate, format });
      const ext = format === 'csv' ? 'csv' : 'xlsx';
      downloadBlob(res.data, `report_instructors_${today}.${ext}`);
    } catch (e) { console.error(e); }
    finally { setExporting(false); }
  };

  const COLS = [
    { key: 'name',          label: 'Giảng viên' },
    { key: 'email',         label: 'Email', render: (v) => <span className="text-slate-400">{v}</span> },
    { key: 'totalCourses',  label: 'Khoá học', render: (v) => fmtNum(v) },
    { key: 'totalEarned',   label: 'Tổng thu nhập', render: (v) => <span className="text-emerald-400">{fmt(v)}</span> },
    { key: 'payoutAmount',  label: 'Đã rút', render: (v) => <span className="text-blue-400">{fmt(v)}</span> },
    { key: 'walletBalance', label: 'Số dư ví', render: (v) => <span className="text-amber-400">{fmt(v)}</span> },
    { key: 'totalPayouts',  label: 'Lần rút', render: (v) => fmtNum(v) },
    { key: 'joinedAt',      label: 'Tham gia' },
  ];

  return (
    <div>
      <FilterBar startDate={startDate} endDate={endDate} onStartDate={setStartDate} onEndDate={setEndDate} onSearch={load} loading={loading} />
      {data && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <SummaryCard icon="🏫" label="Tổng giảng viên" value={fmtNum(data.summary.totalInstructors)} color="from-amber-600 to-orange-700" />
            <SummaryCard icon="💰" label="Tổng thu nhập GV" value={fmt(data.summary.totalEarned)} color="from-emerald-600 to-teal-700" />
            <SummaryCard icon="💸" label="Đã chi trả" value={fmt(data.summary.totalPayoutAmount)} color="from-blue-600 to-indigo-700" />
          </div>
          <ExportBar onExport={handleExport} exporting={exporting} />
          <DataTable columns={COLS} rows={data.rows} />
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'revenue',     label: '💰 Doanh thu',   Component: RevenueTab },
  { key: 'users',       label: '👥 Người dùng',  Component: UsersTab },
  { key: 'courses',     label: '📚 Khoá học',    Component: CoursesTab },
  { key: 'instructors', label: '🏫 Giảng viên',  Component: InstructorsTab },
];

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState('revenue');

  const ActiveComponent = TABS.find((t) => t.key === activeTab)?.Component;

  return (
    <div className="animate-fade-in max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">📊 Báo cáo &amp; Xuất dữ liệu</h1>
        <p className="text-slate-400 text-sm">Xem thống kê chi tiết và xuất báo cáo theo kỳ</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        {ActiveComponent && <ActiveComponent key={activeTab} />}
      </div>
    </div>
  );
}

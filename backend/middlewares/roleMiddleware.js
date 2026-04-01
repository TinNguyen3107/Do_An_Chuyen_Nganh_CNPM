/**
 * Role-based authorization middleware factory
 * Usage: authorize('admin') or authorize('admin', 'instructor')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Vui lòng đăng nhập để tiếp tục');
    }
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Tài khoản ${req.user.role} không có quyền truy cập chức năng này`);
    }
    next();
  };
};

/**
 * Require instructor to be approved
 * Must be used AFTER protect and authorize('instructor', 'admin')
 */
export const requireApprovedInstructor = (req, res, next) => {
  if (req.user.role === 'admin') return next(); // admins bypass
  if (req.user.instructorStatus !== 'approved') {
    res.status(403);
    throw new Error('Tài khoản giảng viên của bạn chưa được phê duyệt. Vui lòng chờ Admin xét duyệt hồ sơ.');
  }
  next();
};

import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// Bảo vệ Route (Yêu cầu đăng nhập)
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Lấy token từ header Authorization (Bearer token) hoặc từ cookie
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Không có quyền truy cập, token không hợp lệ (Not authorized, token failed)');
    }
  } else {
    res.status(401);
    throw new Error('Không có quyền truy cập, không có token. Vui lòng đăng nhập.');
  }
});

// Admin Route (Chỉ Admin mới truy cập được)
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Không có quyền truy cập, yêu cầu quyền Admin');
  }
};

// Giảng viên Route (Chỉ Instructor mới truy cập được)
const instructor = (req, res, next) => {
  if (req.user && (req.user.role === 'instructor' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403);
    throw new Error('Không có quyền truy cập, yêu cầu quyền Giảng viên');
  }
};

// Optional auth — attaches req.user if token present, but does NOT block anonymous requests
const optionalProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch {
      // Invalid token — just ignore, treat as guest
    }
  }
  next();
};

export { protect, admin, instructor, optionalProtect };

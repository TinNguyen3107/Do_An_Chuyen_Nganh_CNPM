import multer from 'multer';
import path from 'path';

// ─── Storage configuration ────────────────────────────────────────
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// ─── File type filters ────────────────────────────────────────────
const cvFileFilter = (req, file, cb) => {
  const allowed = /pdf|doc|docx/;
  const extValid = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeValid = /pdf|msword|wordprocessingml/.test(file.mimetype);
  if (extValid && mimeValid) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép tải lên file PDF hoặc Word (DOC/DOCX)'));
  }
};

const imageFileFilter = (req, file, cb) => {
  const allowed = /jpg|jpeg|png|webp|gif/;
  const extValid = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeValid = /image/.test(file.mimetype);
  if (extValid && mimeValid) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép tải lên file ảnh (JPG, PNG, WEBP, GIF)'));
  }
};

// ─── Upload instances ─────────────────────────────────────────────
// FIX TIẾNG VIỆT: defCharset + defParamCharset buộc busboy dùng UTF-8
// thay vì latin1 (mặc định trên Windows) khi parse multipart/form-data.
// Nếu thiếu 2 option này, mọi ký tự Unicode (tiếng Việt) trong các
// trường text của FormData sẽ bị encode sai → lỗi "???" hoặc validation fail.

/** For CV / document uploads (instructor application) */
export const uploadCV = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: cvFileFilter,
  defCharset: 'utf8',
  defParamCharset: 'utf8',
});

/** For image uploads (course thumbnail, avatar) */
export const uploadImage = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
  fileFilter: imageFileFilter,
  defCharset: 'utf8',
  defParamCharset: 'utf8',
});

// Default export for backward compatibility
export default uploadCV;

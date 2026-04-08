import crypto from 'crypto';
import https from 'https';
import * as paymentRepo from '../repositories/paymentRepository.js';
import * as courseRepo from '../repositories/courseRepository.js';
import * as enrollmentRepo from '../repositories/enrollmentRepository.js';
import * as walletRepo from '../repositories/walletRepository.js';
import { MOMO_CONFIG, BANK_CONFIG } from '../config/payment.js';

// ── Commission Processing ──────────────────────────────────────────────────
/**
 * Tính hoa hồng và cộng vào ví instructor ngay sau khi payment thành công.
 * — Idempotent: kiểm tra commissionProcessed trước khi thực hiện.
 * — Atomic: dùng $inc trên MongoDB để tránh race condition.
 */
async function processCommission(payment) {
  try {
    if (payment.commissionProcessed) return; // Đã xử lý rồi, bỏ qua

    const course = await courseRepo.findById(payment.course);
    if (!course || !course.instructor) {
      console.warn(`[Commission] Không tìm thấy course/instructor cho payment ${payment._id}`);
      return;
    }

    // Tìm hoặc tạo wallet cho instructor
    const wallet = await walletRepo.findOrCreate(course.instructor);
    const rate = wallet.commissionRate ?? 0.7;
    const commissionAmount = Math.floor(payment.amount * rate);
    const platformFee = payment.amount - commissionAmount;

    // Atomic update wallet (tránh race condition với $inc)
    await walletRepo.incrementBalance(course.instructor, commissionAmount);

    // Cập nhật payment: đánh dấu đã xử lý
    payment.commissionAmount = commissionAmount;
    payment.platformFee = platformFee;
    payment.commissionProcessed = true;
    await payment.save();

    console.log(
      `[Commission] Payment ${payment._id}: ${payment.amount}d →` +
      ` Instructor ${commissionAmount}d (${Math.round(rate * 100)}%) +` +
      ` Platform ${platformFee}d`
    );
  } catch (err) {
    // Không throw — lỗi commission không nên block luồng chính
    console.error('[Commission] Lỗi xử lý hoa hồng:', err);
  }
}

// ── Helpers ──────────────────────────────────────────────────────
function createMomoSignature(rawSignature) {
  return crypto
    .createHmac('sha256', MOMO_CONFIG.secretKey)
    .update(rawSignature)
    .digest('hex');
}

function sendMomoRequest(requestBody) {
  return new Promise((resolve, reject) => {
    const url = new URL(MOMO_CONFIG.endpoint);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve({ statusCode: res.statusCode, body: JSON.parse(data) }); }
        catch { reject(new Error('Không thể parse response từ MoMo')); }
      });
    });
    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
}

// ── Create MoMo Payment ─────────────────────────────────────────
export const createMomoPayment = async (userId, courseId) => {
  const course = await courseRepo.findById(courseId);
  if (!course) throw new Error('Không tìm thấy khoá học');
  if (course.status !== 'published') throw new Error('Khoá học chưa được công khai');
  if (course.isFree) throw new Error('Khoá học này miễn phí, không cần thanh toán');

  // Check already enrolled
  const existingEnrollment = await enrollmentRepo.findByUserAndCourse(userId, courseId);
  if (existingEnrollment) throw new Error('Bạn đã đăng ký khoá học này rồi');

  const requestId = MOMO_CONFIG.partnerCode + Date.now();
  const orderId = requestId;
  const amountStr = String(Math.round(course.price));
  const info = `Thanh toán khoá học: ${course.title}`;
  const extraData = Buffer.from(JSON.stringify({ userId, courseId })).toString('base64');
  const requestType = 'captureWallet';

  const rawSignature = [
    `accessKey=${MOMO_CONFIG.accessKey}`, `amount=${amountStr}`, `extraData=${extraData}`,
    `ipnUrl=${MOMO_CONFIG.ipnUrl}`, `orderId=${orderId}`, `orderInfo=${info}`,
    `partnerCode=${MOMO_CONFIG.partnerCode}`, `redirectUrl=${MOMO_CONFIG.redirectUrl}`,
    `requestId=${requestId}`, `requestType=${requestType}`,
  ].join('&');

  const signature = createMomoSignature(rawSignature);
  const requestBody = JSON.stringify({
    partnerCode: MOMO_CONFIG.partnerCode, accessKey: MOMO_CONFIG.accessKey,
    requestId, amount: amountStr, orderId, orderInfo: info,
    redirectUrl: MOMO_CONFIG.redirectUrl, ipnUrl: MOMO_CONFIG.ipnUrl,
    extraData, requestType, signature, lang: 'vi',
  });

  console.log('\n=== MoMo Payment Request ===', { orderId, amount: amountStr, courseId });
  const response = await sendMomoRequest(requestBody);
  console.log('MoMo Response:', response.body);

  if (response.body.errorCode === 0 || response.body.resultCode === 0) {
    const payment = await paymentRepo.create({
      user: userId, course: courseId, orderId, amount: Number(amountStr),
      orderInfo: info, method: 'momo', status: 'pending',
      payUrl: response.body.payUrl, gatewayResponse: response.body,
    });
    return { payment, payUrl: response.body.payUrl, orderId, requestId, amount: amountStr };
  } else {
    throw new Error(response.body.message || response.body.localMessage || 'MoMo trả lỗi');
  }
};

// ── Create ATM/Bank Card Payment ────────────────────────────────
export const createATMPayment = async (userId, courseId) => {
  const course = await courseRepo.findById(courseId);
  if (!course) throw new Error('Không tìm thấy khoá học');
  if (course.status !== 'published') throw new Error('Khoá học chưa được công khai');
  if (course.isFree) throw new Error('Khoá học này miễn phí, không cần thanh toán');

  const existingEnrollment = await enrollmentRepo.findByUserAndCourse(userId, courseId);
  if (existingEnrollment) throw new Error('Bạn đã đăng ký khoá học này rồi');

  const requestId = MOMO_CONFIG.partnerCode + Date.now();
  const orderId = `ATM${requestId}`;
  const amountStr = String(Math.round(course.price));
  const info = `Thanh toán khoá học: ${course.title}`;
  const extraData = Buffer.from(JSON.stringify({ userId, courseId })).toString('base64');
  const requestType = 'payWithATM';

  const rawSignature = [
    `accessKey=${MOMO_CONFIG.accessKey}`, `amount=${amountStr}`, `extraData=${extraData}`,
    `ipnUrl=${MOMO_CONFIG.ipnUrl}`, `orderId=${orderId}`, `orderInfo=${info}`,
    `partnerCode=${MOMO_CONFIG.partnerCode}`, `redirectUrl=${MOMO_CONFIG.redirectUrl}`,
    `requestId=${requestId}`, `requestType=${requestType}`,
  ].join('&');

  const signature = createMomoSignature(rawSignature);
  const requestBody = JSON.stringify({
    partnerCode: MOMO_CONFIG.partnerCode, accessKey: MOMO_CONFIG.accessKey,
    requestId, amount: amountStr, orderId, orderInfo: info,
    redirectUrl: MOMO_CONFIG.redirectUrl, ipnUrl: MOMO_CONFIG.ipnUrl,
    extraData, requestType, signature, lang: 'vi',
  });

  console.log('\n=== ATM/Bank Payment Request ===', { orderId, amount: amountStr, courseId });
  const response = await sendMomoRequest(requestBody);
  console.log('ATM Response:', response.body);

  if (response.body.errorCode === 0 || response.body.resultCode === 0) {
    const payment = await paymentRepo.create({
      user: userId, course: courseId, orderId, amount: Number(amountStr),
      orderInfo: info, method: 'atm', status: 'pending',
      payUrl: response.body.payUrl, gatewayResponse: response.body,
    });
    return { payment, payUrl: response.body.payUrl, orderId, requestId, amount: amountStr };
  } else {
    throw new Error(response.body.message || response.body.localMessage || 'Lỗi tạo đơn ATM');
  }
};

// ── Create Bank Transfer Payment ────────────────────────────────
export const createBankPayment = async (userId, courseId) => {
  const course = await courseRepo.findById(courseId);
  if (!course) throw new Error('Không tìm thấy khoá học');
  if (course.status !== 'published') throw new Error('Khoá học chưa được công khai');
  if (course.isFree) throw new Error('Khoá học này miễn phí, không cần thanh toán');

  const existingEnrollment = await enrollmentRepo.findByUserAndCourse(userId, courseId);
  if (existingEnrollment) throw new Error('Bạn đã đăng ký khoá học này rồi');

  const orderId = `BANK${Date.now()}`;
  const amount = Math.round(course.price);
  const info = `Thanh toán khoá học: ${course.title}`;
  const transferContent = `26TECH ${orderId.slice(-8).toUpperCase()}`;
  const qrUrl = `${BANK_CONFIG.vietQRBase}/${BANK_CONFIG.bankCode}-${BANK_CONFIG.accountNumber}-compact2.jpg`
    + `?amount=${amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;

  const payment = await paymentRepo.create({
    user: userId, course: courseId, orderId, amount,
    orderInfo: info, method: 'bank', status: 'pending',
    bankInfo: {
      bankName: BANK_CONFIG.bankName, accountNumber: BANK_CONFIG.accountNumber,
      accountName: BANK_CONFIG.accountName, transferContent, qrUrl,
    },
  });

  console.log(`\n=== Bank Payment Created: ${orderId} | ${amount} VND ===`);
  return {
    payment, orderId, amount: String(amount), orderInfo: info, transferContent, qrUrl,
    bank: {
      name: BANK_CONFIG.bankName, code: BANK_CONFIG.bankCode,
      accountNumber: BANK_CONFIG.accountNumber, accountName: BANK_CONFIG.accountName,
      branch: BANK_CONFIG.branch,
    },
  };
};

// ── Confirm Payment (manual/admin/demo) ─────────────────────────
export const confirmBankPayment = async (orderId, transId) => {
  const payment = await paymentRepo.findByOrderId(orderId);
  if (!payment) throw new Error('Không tìm thấy đơn hàng');
  if (payment.status === 'success') throw new Error('Đơn hàng đã được xác nhận');

  // Update payment status
  const updated = await paymentRepo.updateByOrderId(orderId, {
    status: 'success',
    transId: transId || `DEMO_TXN_${Date.now()}`,
    paidAt: new Date(),
  });

  // Auto-enroll student
  const existingEnrollment = await enrollmentRepo.findByUserAndCourse(payment.user, payment.course);
  if (!existingEnrollment) {
    await enrollmentRepo.createEnrollment({
      user: payment.user, course: payment.course, enrollmentType: 'paid', payment: payment._id,
    });
    await courseRepo.incrementStudentCount(payment.course);
  }

  // Tính hoa hồng tự động (idempotent)
  await processCommission(updated);

  console.log(`\n=== Payment Confirmed: ${orderId} (method: ${payment.method}) ===`);
  return updated;
};

// ── MoMo IPN Callback ──────────────────────────────────────────
export const handleMomoIPN = async (body) => {
  const {
    partnerCode, orderId, requestId, amount, orderInfo, orderType,
    transId, resultCode, message, payType, responseTime, extraData,
    signature: momoSignature,
  } = body;

  const rawSig = [
    `accessKey=${MOMO_CONFIG.accessKey}`, `amount=${amount}`, `extraData=${extraData}`,
    `message=${message}`, `orderId=${orderId}`, `orderInfo=${orderInfo}`,
    `orderType=${orderType}`, `partnerCode=${partnerCode}`, `payType=${payType}`,
    `requestId=${requestId}`, `responseTime=${responseTime}`, `resultCode=${resultCode}`, `transId=${transId}`,
  ].join('&');

  const isValid = createMomoSignature(rawSig) === momoSignature;
  if (!isValid) {
    console.log('Invalid MoMo IPN signature');
    return false;
  }

  const status = resultCode === 0 ? 'success' : 'failed';
  const payment = await paymentRepo.updateByOrderId(orderId, {
    status, transId, paidAt: status === 'success' ? new Date() : null,
    gatewayResponse: body,
  });

  if (status === 'success' && payment) {
    // Auto-enroll
    const existingEnrollment = await enrollmentRepo.findByUserAndCourse(payment.user, payment.course);
    if (!existingEnrollment) {
      await enrollmentRepo.createEnrollment({
        user: payment.user, course: payment.course, enrollmentType: 'paid', payment: payment._id,
      });
      await courseRepo.incrementStudentCount(payment.course);
    }
    // Tính hoa hồng tự động (idempotent)
    await processCommission(payment);
  }

  console.log(`Order ${orderId}: ${status}`);
  return true;
};

// ── Get payment status ─────────────────────────────────────────
export const getPaymentStatus = async (orderId) => {
  const payment = await paymentRepo.findByOrderId(orderId);
  if (!payment) throw new Error('Không tìm thấy đơn hàng');
  return payment;
};

// ── Get user's payments ────────────────────────────────────────
export const getUserPayments = async (userId) => {
  return paymentRepo.findByUser(userId);
};

// ── Get all payments (admin) ───────────────────────────────────
export const getAllPayments = async () => {
  return paymentRepo.findAll();
};

// ── Get payment stats (admin) ──────────────────────────────────
export const getPaymentStats = async () => {
  return paymentRepo.getStats();
};

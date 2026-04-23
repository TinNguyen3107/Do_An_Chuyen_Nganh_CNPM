/**
 * Payment gateway configuration
 */

export const MOMO_CONFIG = {
  partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMO',
  accessKey: process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85',
  secretKey: process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
  endpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
  redirectUrl: process.env.MOMO_REDIRECT_URL || 'http://localhost:5173/payment-result',
  ipnUrl: process.env.MOMO_IPN_URL || 'http://localhost:5000/api/payments/momo/ipn',
};

export const BANK_CONFIG = {
  bankName: process.env.BANK_NAME || 'Vietcombank',
  bankCode: process.env.BANK_CODE || 'VCB',
  accountNumber: process.env.BANK_ACCOUNT_NUMBER || '1234567890',
  accountName: process.env.BANK_ACCOUNT_NAME || '26TECH EDUCATION JSC',
  branch: process.env.BANK_BRANCH || 'CN Ha Noi',
  vietQRBase: 'https://img.vietqr.io/image',
};

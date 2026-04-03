import Joi from 'joi';

export const createPaymentSchema = Joi.object({
  courseId: Joi.string().required().messages({
    'any.required': 'courseId là bắt buộc',
    'string.empty': 'courseId không được để trống',
  }),
});

export const confirmBankSchema = Joi.object({
  orderId: Joi.string().required().messages({
    'any.required': 'orderId là bắt buộc',
  }),
  transId: Joi.string().optional().allow(''),
});

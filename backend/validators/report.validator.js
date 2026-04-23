/**
 * report.validator.js — Validate query params cho Admin Report APIs
 */

import Joi from 'joi';

const today = () => new Date();

/**
 * Schema chung cho startDate / endDate
 *  - startDate không được ở tương lai
 *  - endDate   không được ở tương lai
 *  - startDate phải <= endDate
 */
export const dateRangeSchema = Joi.object({
  startDate: Joi.date()
    .max('now')
    .messages({
      'date.base': 'startDate không hợp lệ',
      'date.max':  'startDate không được ở tương lai',
    }),

  endDate: Joi.date()
    .max('now')
    .when('startDate', {
      is:   Joi.date().valid(),
      then: Joi.date().min(Joi.ref('startDate')),
    })
    .messages({
      'date.base': 'endDate không hợp lệ',
      'date.max':  'endDate không được ở tương lai',
      'date.min':  'endDate phải lớn hơn hoặc bằng startDate',
    }),

  groupBy: Joi.string().valid('day', 'month').default('day').messages({
    'any.only': 'groupBy chỉ chấp nhận "day" hoặc "month"',
  }),

  format: Joi.string().valid('csv', 'excel').default('excel').messages({
    'any.only': 'format chỉ chấp nhận "csv" hoặc "excel"',
  }),
}).options({ allowUnknown: false });

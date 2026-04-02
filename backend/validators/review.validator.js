import Joi from 'joi';

export const createOrUpdateReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required().messages({
    'number.base': 'Số sao phải là số',
    'number.min': 'Số sao tối thiểu là 1',
    'number.max': 'Số sao tối đa là 5',
    'any.required': 'Vui lòng chọn số sao',
  }),

  comment: Joi.string().allow('').max(1000).messages({
    'string.max': 'Nhận xét tối đa 1000 ký tự',
  }),
});

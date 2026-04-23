/**
 * Generic Joi validation middleware factory.
 *
 * Usage in a route file:
 *   import { validate } from '../middlewares/validate.middleware.js';
 *   import { registerSchema } from '../validators/auth.validator.js';
 *
 *   router.post('/register', validate(registerSchema), register);
 *
 * @param {import('joi').ObjectSchema} schema - Joi schema to validate req.body against
 * @param {'body'|'query'|'params'} [source='body'] - which part of req to validate
 */
export const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,   // collect ALL errors, not just the first one
    allowUnknown: false, // reject unexpected fields
    stripUnknown: true,  // silently strip unknown fields that pass (only hits when allowUnknown:true, but good default)
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: error.details.map((d) => d.message),
    });
  }

  // Replace req[source] with the coerced/stripped value from Joi
  req[source] = value;
  next();
};

/**
 * Validate req.query instead of req.body.
 * Shorthand: validate(schema, 'query')
 */
export const validateQuery = (schema) => validate(schema, 'query');

/**
 * Validate req.params.
 * Shorthand: validate(schema, 'params')
 */
export const validateParams = (schema) => validate(schema, 'params');

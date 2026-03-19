import express from 'express';
import { getUsers, getUser, changeRole, toggleStatus } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { changeRoleSchema } from '../validators/user.validator.js';

const router = express.Router();

// All user management routes require admin
router.use(protect, authorize('admin'));

router.get('/', getUsers);
router.get('/:id', getUser);
router.patch('/:id/role', validate(changeRoleSchema), changeRole);
router.patch('/:id/toggle-status', toggleStatus);

export default router;

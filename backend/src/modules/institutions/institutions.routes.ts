import { Router } from 'express';
import { InstitutionsController } from './institutions.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { authorize } from '../../common/middleware/rbac.middleware';
import { UserRole } from '../../common/constants/roles';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.use(authMiddleware);

// Super Admin only routes
router.post('/', authorize(UserRole.SUPER_ADMIN), InstitutionsController.create);
router.post('/bulk-import', authorize(UserRole.SUPER_ADMIN), upload.single('file'), InstitutionsController.bulkImport);
router.get('/', authorize(UserRole.SUPER_ADMIN), InstitutionsController.list);

// Institution details (Super Admin or authorized institution member)
router.get('/:id', InstitutionsController.getById);

export const institutionRoutes = router;


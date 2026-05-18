import { Router } from 'express';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  exportLeadsCSV,
} from '../controllers/leadController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = Router();

// All lead routes require authentication
router.use(authenticate);

// GET /api/leads/export/csv — MUST be before /:id to avoid route conflict
router.get('/export/csv', requireRole('admin'), exportLeadsCSV);

// GET /api/leads
router.get('/', getLeads);

// GET /api/leads/:id
router.get('/:id', getLeadById);

// POST /api/leads — admin only
router.post('/', requireRole('admin'), createLead);

// PUT /api/leads/:id — admin only
router.put('/:id', requireRole('admin'), updateLead);

// DELETE /api/leads/:id — admin only
router.delete('/:id', requireRole('admin'), deleteLead);

export default router;

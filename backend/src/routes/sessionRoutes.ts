import { Router } from 'express';
import {
  createSession,
  getSession,
  startSession,
  updatePhase,
  resetSession,
  endSession,
  getTeacherSessions,
} from '../controllers/sessionController';
import { getTeams, addTeam, updatePawn } from '../controllers/teamController';
import {
  getSubmissions,
  submitLkpd,
  gradeSubmission,
  uploadPhoto,
  exportExcel,
} from '../controllers/submissionController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { upload } from '../config/storage';

const router = Router();

// Sesi Kelas
router.post('/', authMiddleware as any, createSession as any);
router.post('/create', authMiddleware as any, createSession as any);
router.get('/my/list', authMiddleware as any, getTeacherSessions as any);
router.get('/:roomCode', getSession);
router.post('/:roomCode/start', startSession);
router.patch('/:roomCode/phase', updatePhase);
router.post('/:roomCode/reset', resetSession);
router.post('/:roomCode/end', endSession);

// Tim & Pion
router.get('/:roomCode/teams', getTeams);
router.post('/:roomCode/teams', addTeam);
router.patch('/:roomCode/teams/:teamId/pawn', updatePawn);

// LKPD & Penilaian
router.get('/:roomCode/submissions', getSubmissions);
router.post('/:roomCode/submissions/lkpd', submitLkpd);
router.patch('/submissions/:id/grade', gradeSubmission);

// Media Upload & Ekspor
router.post('/:roomCode/upload', upload.single('photo'), uploadPhoto);
router.get('/:roomCode/export/excel', exportExcel);

export default router;

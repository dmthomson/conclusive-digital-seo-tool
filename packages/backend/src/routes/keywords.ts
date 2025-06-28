import { Router } from 'express';

const router = Router();

router.get('/research', (req, res) => {
  res.json({ message: 'Keyword research endpoint - coming soon' });
});

export default router;

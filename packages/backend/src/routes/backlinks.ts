import { Router } from 'express';

const router = Router();

router.get('/check', (req, res) => {
  res.json({ message: 'Backlink checker endpoint - coming soon' });
});

export default router;

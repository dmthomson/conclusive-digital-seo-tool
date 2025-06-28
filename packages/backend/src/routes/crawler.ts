import { Router } from 'express';

const router = Router();

router.post('/crawl', (req, res) => {
  res.json({ message: 'Crawler endpoint - coming soon' });
});

export default router;

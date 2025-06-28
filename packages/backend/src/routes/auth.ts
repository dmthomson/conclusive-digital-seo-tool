import { Router } from 'express';

const router = Router();

router.post('/login', (req, res) => {
  res.json({ message: 'Auth endpoint - coming soon' });
});

router.post('/register', (req, res) => {
  res.json({ message: 'Register endpoint - coming soon' });
});

export default router;

import express from 'express';

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'conclusive-seo-backend' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Conclusive Digital SEO Tool API', version: '1.0.0' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;

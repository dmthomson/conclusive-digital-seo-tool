import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import crawlerRoutes from './routes/crawler';
import analysisRoutes from './routes/analysis';
import keywordRoutes from './routes/keywords';
import backlinkRoutes from './routes/backlinks';
import individualToolsRoutes from './routes/individual-tools';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.'
    });
    this.app.use('/api', limiter);

    // Body parsing middleware
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path} - ${req.ip}`);
      next();
    });
  }

  private initializeRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'conclusive-seo-backend',
        version: '1.0.0'
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/projects', projectRoutes);
    this.app.use('/api/crawler', crawlerRoutes);
    this.app.use('/api/analysis', analysisRoutes);
    this.app.use('/api/keywords', keywordRoutes);
    this.app.use('/api/backlinks', backlinkRoutes);
    this.app.use('/api/tools', individualToolsRoutes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        message: 'Conclusive Digital SEO Tool API',
        version: '1.0.0',
        status: 'running'
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async listen(): Promise<void> {
    const port = process.env.PORT || 5000;

    try {
      this.app.listen(port, () => {
        logger.info(`🚀 Conclusive Digital SEO Tool Backend running on port ${port}`);
        logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`🌐 CORS Origin: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Start the server
const app = new App();
app.listen();

export default app;

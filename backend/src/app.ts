import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { globalRateLimiter } from './middleware/rateLimiter.middleware';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler.middleware';
import { logger } from './config/logger';

// Route imports
import authRoutes from './modules/auth/auth.router';
import studentRoutes from './modules/students/students.router';
import teacherRoutes from './modules/teachers/teachers.router';
import classRoutes from './modules/classes/classes.router';
import attendanceRoutes from './modules/attendance/attendance.router';
import holidayRoutes from './modules/holidays/holidays.router';
import dashboardRoutes from './modules/dashboard/dashboard.router';
import reportRoutes from './modules/reports/reports.router';
import notificationRoutes from './modules/notifications/notifications.router';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(globalRateLimiter);

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// Logging
app.use(morgan('combined', {
  stream: { write: (message) => logger.http(message.trim()) },
}));

// API Docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/students', studentRoutes);
apiRouter.use('/teachers', teacherRoutes);
apiRouter.use('/classes', classRoutes);
apiRouter.use('/attendance', attendanceRoutes);
apiRouter.use('/holidays', holidayRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/notifications', notificationRoutes);

app.use('/api/v1', apiRouter);

// Error handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;

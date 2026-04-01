import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './src/config/swagger';
import { globalLimiter, authLimiter } from './src/middlewares/rateLimit.middleware';
import { errorHandler } from './src/middlewares/errorHandler.middleware';
import { authMiddleware } from './src/middlewares/auth.middleware';
import authRoutes from './src/routes/auth.routes';
import userRoutes from './src/routes/user.routes';
import departmentRoutes from './src/routes/department.routes';
import candidateRoutes from './src/routes/candidate.routes';
import jobPositionRoutes from './src/routes/jobPosition.routes';
import jobApplicationRoutes from './src/routes/jobApplication.routes';

const app = express();

// Segurança
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(globalLimiter);

// Parsing
app.use(express.json());
app.use(cookieParser());

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas públicas
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/jobs', jobPositionRoutes);

// Rotas internas
app.use('/api/users',            authMiddleware, userRoutes);
app.use('/api/departments',      authMiddleware, departmentRoutes);
app.use('/api/candidates',       authMiddleware, candidateRoutes);
app.use('/api/job-applications', authMiddleware, jobApplicationRoutes);

// Error handler — sempre por último
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger disponível em http://localhost:${PORT}/api-docs`);
});
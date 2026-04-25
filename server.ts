import express from 'express';
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
import csrfRoutes from './src/routes/csrf.routes';
import helmet from 'helmet';
import internalProfileRoutes from './src/routes/internalProfile.routes';

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(globalLimiter);

app.use(express.json());
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/csrf-token', csrfRoutes);
app.use('/api/auth',       authLimiter, authRoutes);
app.use('/api/jobs',       jobPositionRoutes);
app.use('/api/candidates', candidateRoutes); // acho que não faz sentido aqui estar publico

app.use('/api/users',            authMiddleware, userRoutes);
app.use('/api/departments',      authMiddleware, departmentRoutes);
app.use('/api/job-applications', authMiddleware, jobApplicationRoutes);
app.use('/api/internal-profiles', authMiddleware, internalProfileRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger disponível em http://localhost:${PORT}/api-docs`);
});

export default app;
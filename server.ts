import express from 'express';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './src/config/swagger';
import authRoutes from './src/routes/auth.routes';
import userRoutes from './src/routes/user.routes';
import departmentRoutes from './src/routes/department.routes';
import candidateRoutes from './src/routes/candidate.routes';
import jobPositionRoutes from './src/routes/jobPosition.routes';
import jobApplicationRoutes from './src/routes/jobApplication.routes';
import { authMiddleware } from './src/middlewares/auth.middleware';

const app = express();

app.use(express.json());
app.use(cookieParser());

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas públicas
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobPositionRoutes);

// Rotas internas — protegidas pelo authMiddleware
app.use('/api/users',            authMiddleware, userRoutes);
app.use('/api/departments',      authMiddleware, departmentRoutes);
app.use('/api/candidates',       authMiddleware, candidateRoutes);
app.use('/api/job-applications', authMiddleware, jobApplicationRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger disponível em http://localhost:${PORT}/api-docs`);
});
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
import candidateExternalRoutes from './src/routes/candidateExternal.routes';
import jobPositionRoutes from './src/routes/jobPosition.routes';
import jobPositionAvailableRoutes from './src/routes/jobPositionAvailable.routes';
import jobApplicationRoutes from './src/routes/jobApplication.routes';
import csrfRoutes from './src/routes/csrf.routes';
import helmet from 'helmet';
import internalProfileRoutes from './src/routes/internalProfile.routes';
import candidateInternalRoutes from './src/routes/candidateInternal.routes';

const app = express();

app.use(helmet());
// Mantenha apenas UMA declaração de CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));

app.use(express.json());
app.use(globalLimiter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Essas publicas para disponibilizar vagas e aceitar candidaturas
app.use('/api/v1/candidates-external',         candidateExternalRoutes);
app.use('/api/v1/jobs-available',              jobPositionAvailableRoutes);


// Recomendação para que essas rotas sejam privadas, acessiveis dentro de uma intranet, apenas para colaboradores
app.use('/api/v1/csrf-token',           csrfRoutes);
app.use('/api/v1/auth',                 authLimiter, authRoutes);
app.use('/api/v1/users',                authMiddleware, userRoutes);
app.use('/api/v1/departments',          authMiddleware, departmentRoutes);
app.use('/api/v1/jobs-services',        authMiddleware, jobPositionRoutes);
app.use('/api/v1/jobs-applications',    authMiddleware, jobApplicationRoutes);
app.use('/api/v1/internal-profiles',    authMiddleware, internalProfileRoutes);
app.use('/api/v1/candidates-internal',  authMiddleware, candidateInternalRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger disponível em http://localhost:${PORT}/api-docs`);
});

export default app;
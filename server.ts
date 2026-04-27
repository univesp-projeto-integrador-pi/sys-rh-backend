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

// ROTAS PÚBLICAS (Ou que controlam o próprio auth dentro do arquivo de rotas)
app.use('/api/csrf-token', csrfRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/jobs', jobPositionRoutes);

// ROTAS QUE EXIGEM LOGIN (O middleware pode ser global aqui ou dentro de cada router)
// Sugestão: Deixe o middleware no server.ts para o que for 100% privado
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/departments', authMiddleware, departmentRoutes);
app.use('/api/candidates', candidateRoutes); // O middleware já está dentro do candidateRoutes
app.use('/api/job-applications', authMiddleware, jobApplicationRoutes); // ✅ ADICIONE O authMiddleware AQUI

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger disponível em http://localhost:${PORT}/api-docs`);
});

export default app;
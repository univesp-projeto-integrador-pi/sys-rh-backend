import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './src/config/swagger';
import userRoutes from './src/routes/user.routes';
import departmentRoutes from './src/routes/department.routes';
import candidateRoutes from './src/routes/candidate.routes';
import jobPositionRoutes from './src/routes/jobPosition.routes';
import jobApplicationRoutes from './src/routes/jobApplication.routes';

const app = express();

app.use(express.json());

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// rotas internas
app.use('/api/users',            userRoutes);
app.use('/api/departments',      departmentRoutes);
app.use('/api/candidates',       candidateRoutes);
app.use('/api/job-applications', jobApplicationRoutes);

// rotas públicas
app.use('/api/jobs',             jobPositionRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
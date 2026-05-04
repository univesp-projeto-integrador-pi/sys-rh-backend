import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./src/config/swagger";
import {
  globalLimiter,
  authLimiter,
} from "./src/middlewares/rateLimit.middleware";
import { errorHandler } from "./src/middlewares/errorHandler.middleware";
import { authMiddleware } from "./src/middlewares/auth.middleware";
import helmet from "helmet";

// Importação das Rotas
import authRoutes from "./src/routes/auth.routes";
import userRoutes from "./src/routes/user.routes";
import departmentRoutes from "./src/routes/department.routes";
import candidateExternalRoutes from "./src/routes/candidateExternal.routes";
import candidateInternalRoutes from "./src/routes/candidateInternal.routes";
import jobPositionRoutes from "./src/routes/jobPosition.routes";
import jobPositionAvailableRoutes from "./src/routes/jobPositionAvailable.routes";
import jobApplicationRoutes from "./src/routes/jobApplication.routes";
import internalProfileRoutes from "./src/routes/internalProfile.routes";
import csrfRoutes from "./src/routes/csrf.routes";
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());
app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  }),
);
app.use(globalLimiter);

app.use(helmet());
app.use(express.json());
//app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));

// 3. Documentação
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- 4. DEFINIÇÃO DAS ROTAS (API V1) ---

// A. ROTAS PÚBLICAS (Acessíveis sem Token)
// Ex: Cadastro de candidato e listagem de vagas abertas
app.use("/api/v1/candidates-external", candidateExternalRoutes);
app.use("/api/v1/jobs-available", jobPositionAvailableRoutes);

// B. ROTAS DE INFRAESTRUTURA / AUTH
app.use("/api/v1/csrf-token", csrfRoutes);
app.use("/api/v1/auth", authLimiter, authRoutes);

// C. ROTAS PRIVADAS (Exigem authMiddleware e, em alguns casos, Roles específicas)
// O authMiddleware aqui garante que apenas usuários logados acessem esses grupos
app.use("/api/v1/users", authMiddleware, userRoutes);
app.use("/api/v1/departments", authMiddleware, departmentRoutes);
app.use("/api/v1/jobs-services", authMiddleware, jobPositionRoutes);
app.use("/api/v1/jobs-applications", authMiddleware, jobApplicationRoutes);
app.use("/api/v1/internal-profiles", authMiddleware, internalProfileRoutes);
app.use("/api/v1/candidates-internal", authMiddleware, candidateInternalRoutes);

// 5. Middleware de Erro (Deve ser o último a ser declarado)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📄 Swagger disponível em http://localhost:${PORT}/api-docs`);
});

export default app;

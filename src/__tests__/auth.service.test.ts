import authService from "../services/auth.service";
import userRepository from "../repositories/user.repository";
import refreshTokenRepository from "../repositories/refreshToken.repository";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import { AppError } from "../middlewares/errorHandler.middleware";

jest.mock("../repositories/user.repository");
jest.mock("../repositories/refreshToken.repository");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;
const mockRefreshTokenRepository = refreshTokenRepository as jest.Mocked<
  typeof refreshTokenRepository
>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

const mockUser = {
  id: "user-1",
  name: "Recrutador",
  email: "recrutador@empresa.com",
  hashPassword: "hashed-password",
  role: UserRole.RECRUITER,
  createdAt: new Date(),
  updatedAt: null,
};

beforeAll(() => {
  process.env.JWT_ACCESS_SECRET = "access-secret";
  process.env.JWT_REFRESH_SECRET = "refresh-secret";
  process.env.JWT_ACCESS_EXPIRES_IN = "15m";
  process.env.JWT_REFRESH_EXPIRES_IN = "7d";
});

describe("AuthService", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("register", () => {
    it("deve registrar usuário com senha hasheada corretamente", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      (mockBcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
      mockUserRepository.create.mockResolvedValue(mockUser as any);

      const result = await authService.register({
        name: "Recrutador",
        email: "recrutador@empresa.com",
        password: "Senha@123",
      });

      expect(mockBcrypt.hash).toHaveBeenCalledWith("Senha@123", 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          hashPassword: "hashed-password",
        }),
      );
      expect(result).not.toHaveProperty("hashPassword");
      expect(result.email).toBe("recrutador@empresa.com");
    });

    it("deve lançar AppError 409 quando email já cadastrado", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);

      await expect(
        authService.register({
          name: "Recrutador",
          email: "recrutador@empresa.com",
          password: "Senha@123",
        }),
      ).rejects.toThrow(AppError);

      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("deve retornar tokens e usar sub no payload", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockJwt.sign as jest.Mock)
        .mockReturnValueOnce("access-token")
        .mockReturnValueOnce("refresh-token");
      mockRefreshTokenRepository.create.mockResolvedValue({} as any);

      const result = await authService.login({
        email: "recrutador@empresa.com",
        password: "Senha@123",
      });

      expect(result).toHaveProperty("accessToken");
      expect(result.user.role).toBe(UserRole.RECRUITER);

      expect(mockJwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({ role: "RECRUITER" }),
        expect.any(String),
        expect.any(Object),
      );
    });

    it("deve lançar erro 401 para credenciais inválidas (senha incorreta)", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({
          email: "recrutador@empresa.com",
          password: "senha-errada",
        }),
      ).rejects.toThrow("Credenciais inválidas");
    });
  });

  describe("refresh", () => {
    it("deve renovar o access token usando sub do payload decodificado", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      mockRefreshTokenRepository.findByToken.mockResolvedValue({
        id: "token-1",
        token: "refresh-token",
        userId: "user-1",
        expiresAt: futureDate,
        createdAt: new Date(),
        user: mockUser as any,
      } as any);

      (mockJwt.verify as jest.Mock).mockReturnValue({
        sub: "user-1",
        email: "recrutador@empresa.com",
        role: UserRole.RECRUITER,
      });

      (mockJwt.sign as jest.Mock).mockReturnValue("novo-access-token");

      const result = await authService.refresh("refresh-token");

      expect(result).toHaveProperty("accessToken", "novo-access-token");
    });

    it("deve lançar erro quando refresh token não fornecido", async () => {
      await expect(authService.refresh("")).rejects.toThrow(
        "Refresh token não fornecido",
      );
    });

    it("deve lançar erro quando refresh token não existe no banco", async () => {
      mockRefreshTokenRepository.findByToken.mockResolvedValue(null);

      await expect(authService.refresh("token-inexistente")).rejects.toThrow(
        "Refresh token inválido ou expirado",
      );
    });

    it("deve lançar erro quando refresh token está expirado", async () => {
      mockRefreshTokenRepository.findByToken.mockResolvedValue(null);

      await expect(authService.refresh("token-expirado")).rejects.toThrow(
        "Refresh token inválido ou expirado",
      );
    });

    it("deve lançar erro quando assinatura do token é inválida", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      mockRefreshTokenRepository.findByToken.mockResolvedValue({
        id: "token-1",
        token: "refresh-token",
        userId: "user-1",
        expiresAt: futureDate,
        createdAt: new Date(),
        user: mockUser,
      });

      (mockJwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("invalid signature");
      });

      await expect(authService.refresh("refresh-token")).rejects.toThrow(
        "Refresh token inválido",
      );
    });
  });

  describe("logout", () => {
    it("deve chamar a deleção do token corretamente", async () => {
      await authService.logout("token-ativo");
      expect(mockRefreshTokenRepository.deleteByToken).toHaveBeenCalledWith(
        "token-ativo",
      );
    });
  });
});

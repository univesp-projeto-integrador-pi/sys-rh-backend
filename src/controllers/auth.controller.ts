import { Request, Response } from 'express';
import authService from '../services/auth.service';

class AuthController {
  async register(req: Request, res: Response) {
    try {
      const user = await authService.register(req.body);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { accessToken, refreshToken, user } = await authService.login(req.body);

      // refresh token vai no cookie HttpOnly
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS em produção
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias em ms
      });

      res.json({ accessToken, user });
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const token = req.cookies?.refreshToken;
      const { accessToken } = await authService.refresh(token);
      res.json({ accessToken });
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const token = req.cookies?.refreshToken;
      await authService.logout(token);

      res.clearCookie('refreshToken');
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async logoutAll(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      await authService.logoutAll(userId);

      res.clearCookie('refreshToken');
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new AuthController();
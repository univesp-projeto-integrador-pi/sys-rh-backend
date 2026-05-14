import { Request, Response, NextFunction } from "express";
import authService from "../services/auth.service";

class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.register(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { accessToken, refreshToken, user } = await authService.login(
        req.body,
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ accessToken, user });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshToken;
      const { accessToken } = await authService.refresh(token);
      res.json({ accessToken });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshToken;
      await authService.logout(token);
      res.clearCookie("refreshToken");
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async logoutAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      await authService.logoutAll(userId);
      res.clearCookie("refreshToken");
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();

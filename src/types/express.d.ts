import { UserRole } from "@prisma/client";
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      email?: string;
      role?: UserRole;
    }
  }
}

declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      // pode adicionar mais campos se quiser
      // email?: string;
      // role?: string;
    };
  }
}

import { doubleCsrf } from "csrf-csrf";
import "dotenv/config";

export const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || "dev-secret",

  getSessionIdentifier: (req) => {
    return req.ip || "anonymous";
  },

  cookieName: "csrf-token",

  cookieOptions: {
    httpOnly: false,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  },

  getCsrfTokenFromRequest: (req) => {
    const token = req.headers["x-csrf-token"];
    if (!token) return "";
    return token as string;
  },
});

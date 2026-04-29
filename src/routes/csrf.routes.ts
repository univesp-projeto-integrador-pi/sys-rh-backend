import { Router } from "express";
import { doubleCsrf } from "csrf-csrf";

const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET!,

  getSessionIdentifier: (req: any) => {
    return req.user?.id || req.ip || "anonymous";
  },

  cookieName: "csrf-token",

  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  },

  size: 64,

  // ✅ nome correto
  getCsrfTokenFromRequest: (req) => {
    return req.headers["x-csrf-token"] as string;
  },
});

const router = Router();

router.get("/", (req, res) => {
  const token = generateCsrfToken(req, res);
  res.json({ csrfToken: token });
});

router.post("/protected", doubleCsrfProtection, (req, res) => {
  res.json({ message: "CSRF válido ✅" });
});

export { doubleCsrfProtection };
export default router;

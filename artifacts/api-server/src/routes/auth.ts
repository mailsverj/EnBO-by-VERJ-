import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "../lib/db.js";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import type { SafeUser } from "@workspace/db/schema";

const router = Router();

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const safeUser: SafeUser = { ...user };
  delete (safeUser as Record<string, unknown>)["passwordHash"];
  req.session.user = safeUser;

  res.json({ user: safeUser });
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

router.get("/auth/me", requireAuth, (req, res) => {
  res.json({ user: req.session.user });
});

export default router;

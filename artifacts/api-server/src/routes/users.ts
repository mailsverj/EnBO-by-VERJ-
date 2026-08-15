import { Router } from "express";
import { db } from "../lib/db.js";
import { usersTable } from "@workspace/db/schema";
import { requireAuth, requireRoles } from "../middleware/auth.js";
import type { SafeUser } from "@workspace/db/schema";

const router = Router();

router.get("/users", requireAuth, requireRoles("Chief Admin", "Super Admin", "Management"), async (_req, res) => {
  const users = await db.select({
    id: usersTable.id,
    email: usersTable.email,
    name: usersTable.name,
    roles: usersTable.roles,
    vbdoId: usersTable.vbdoId,
    createdAt: usersTable.createdAt,
    updatedAt: usersTable.updatedAt,
  }).from(usersTable);
  
  res.json({ users: users as SafeUser[] });
});

export default router;

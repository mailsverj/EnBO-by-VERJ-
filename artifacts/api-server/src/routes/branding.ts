import { Router, type IRouter } from "express";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const router: IRouter = Router();

/**
 * Public branding asset used by transactional emails. Email clients cannot
 * resolve the frontend's bundled asset URLs, so expose the approved light
 * logo directly from the API.
 */
router.get("/branding/enbo-logo-light.png", async (_req, res) => {
  try {
    const logoPath = resolve(process.cwd(), "../../attached_assets/enbo-verj-logo-light.png");
    const logo = await readFile(logoPath);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.type("png").send(logo);
  } catch {
    res.status(404).send("Branding asset not found");
  }
});

export default router;
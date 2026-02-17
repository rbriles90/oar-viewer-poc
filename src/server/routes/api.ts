import { Router } from "express";
import { readFile } from "fs/promises";
import { resolve } from "path";
import { getInternalToken } from "../auth/aps.js";

export const apiRouter = Router();

/**
 * GET /api/models
 * Returns available model URNs for the project.
 * In the MVP, this reads from a static config file.
 */
apiRouter.get("/models", async (_req, res) => {
  try {
    const configPath = resolve(process.cwd(), "public/data/models.json");
    const data = await readFile(configPath, "utf-8");
    res.json(JSON.parse(data));
  } catch (err) {
    console.error("Models config error:", err);
    res.status(500).json({ error: "Failed to load model configuration" });
  }
});

/**
 * GET /api/metadata
 * Returns the project equipment metadata JSON.
 */
apiRouter.get("/metadata", async (_req, res) => {
  try {
    const metadataPath = resolve(process.cwd(), "public/data/metadata.json");
    const data = await readFile(metadataPath, "utf-8");
    res.json(JSON.parse(data));
  } catch (err) {
    console.error("Metadata load error:", err);
    res.status(500).json({ error: "Failed to load equipment metadata" });
  }
});

/**
 * GET /api/token
 * Proxy endpoint — returns a 2-legged internal token.
 * Used for server-side APS API calls from the frontend.
 */
apiRouter.get("/token", async (_req, res) => {
  try {
    const token = await getInternalToken();
    res.json(token);
  } catch (err) {
    console.error("Internal token error:", err);
    res.status(500).json({ error: "Failed to obtain internal token" });
  }
});

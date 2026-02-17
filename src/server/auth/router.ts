import { Router } from "express";
import { getPublicToken, getAuthorizationUrl, exchangeCode } from "./aps.js";

export const authRouter = Router();

/**
 * GET /api/auth/token
 * Returns a public viewer token (2-legged, viewables:read scope).
 * The frontend calls this to initialize the APS Viewer.
 */
authRouter.get("/token", async (_req, res) => {
  try {
    const token = await getPublicToken();
    res.json(token);
  } catch (err) {
    console.error("Token error:", err);
    res.status(500).json({ error: "Failed to obtain viewer token" });
  }
});

/**
 * GET /api/auth/login
 * Redirects the user to Autodesk's OAuth login page (3-legged flow).
 */
authRouter.get("/login", (_req, res) => {
  try {
    const url = getAuthorizationUrl();
    res.redirect(url);
  } catch (err) {
    console.error("Login redirect error:", err);
    res.status(500).json({ error: "Failed to build authorization URL" });
  }
});

/**
 * GET /api/auth/callback
 * Handles the OAuth callback after Autodesk login.
 * Exchanges the authorization code for a token and redirects to the viewer.
 */
authRouter.get("/callback", async (req, res) => {
  const code = req.query.code as string;

  if (!code) {
    res.status(400).json({ error: "Missing authorization code" });
    return;
  }

  try {
    const token = await exchangeCode(code);
    // In the MVP, pass the token to the frontend via query param.
    // A production app would use httpOnly cookies or sessions.
    res.redirect(`/?token=${encodeURIComponent(token.access_token)}`);
  } catch (err) {
    console.error("Callback error:", err);
    res.status(500).json({ error: "Failed to exchange authorization code" });
  }
});

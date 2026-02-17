import type { ApsToken } from "../../shared/types.js";

const APS_BASE_URL = "https://developer.api.autodesk.com";

function getCredentials() {
  const clientId = process.env.APS_CLIENT_ID;
  const clientSecret = process.env.APS_CLIENT_SECRET;
  const callbackUrl = process.env.APS_CALLBACK_URL;

  if (!clientId || !clientSecret) {
    throw new Error("Missing APS_CLIENT_ID or APS_CLIENT_SECRET in environment variables");
  }

  return { clientId, clientSecret, callbackUrl };
}

/** Cache for 2-legged token */
let tokenCache: { token: ApsToken; expiresAt: number } | null = null;

/**
 * Get a 2-legged access token for server-side APS operations.
 * Used for model translation status, metadata queries, etc.
 */
export async function getInternalToken(): Promise<ApsToken> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const { clientId, clientSecret } = getCredentials();

  const response = await fetch(`${APS_BASE_URL}/authentication/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
      scope: "data:read viewables:read",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`APS auth failed (${response.status}): ${text}`);
  }

  const token = (await response.json()) as ApsToken;

  tokenCache = {
    token,
    expiresAt: Date.now() + token.expires_in * 1000 - 60_000, // refresh 1 min early
  };

  return token;
}

/**
 * Get a public (viewer-scoped) access token for the frontend.
 * Limited to viewables:read scope only.
 */
export async function getPublicToken(): Promise<ApsToken> {
  const { clientId, clientSecret } = getCredentials();

  const response = await fetch(`${APS_BASE_URL}/authentication/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
      scope: "viewables:read",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`APS public token failed (${response.status}): ${text}`);
  }

  return (await response.json()) as ApsToken;
}

/**
 * Build the 3-legged OAuth authorization URL.
 * Users are redirected here to log in with Autodesk credentials.
 */
export function getAuthorizationUrl(): string {
  const { clientId, callbackUrl } = getCredentials();

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: callbackUrl || "",
    scope: "data:read viewables:read",
  });

  return `${APS_BASE_URL}/authentication/v2/authorize?${params}`;
}

/**
 * Exchange an authorization code for a 3-legged access token.
 */
export async function exchangeCode(code: string): Promise<ApsToken> {
  const { clientId, clientSecret, callbackUrl } = getCredentials();

  const response = await fetch(`${APS_BASE_URL}/authentication/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: callbackUrl || "",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`APS code exchange failed (${response.status}): ${text}`);
  }

  return (await response.json()) as ApsToken;
}

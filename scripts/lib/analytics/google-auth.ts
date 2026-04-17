import { readFileSync } from "fs";
import { createSign } from "crypto";

const TOKEN_URI = "https://oauth2.googleapis.com/token";
const DEFAULT_SERVICE_ACCOUNT_PATH = `${process.env.HOME}/.config/audiocontrol/analytics-service-account.json`;

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
}

/** Create a JWT and exchange it for a Google OAuth2 access token */
export async function getAccessToken(
  scopes: string[],
  serviceAccountPath?: string
): Promise<string> {
  const keyPath = serviceAccountPath ?? DEFAULT_SERVICE_ACCOUNT_PATH;
  const key = JSON.parse(
    readFileSync(keyPath, "utf-8")
  ) as ServiceAccountKey;

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(
    JSON.stringify({ alg: "RS256", typ: "JWT" })
  ).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      iss: key.client_email,
      scope: scopes.join(" "),
      aud: TOKEN_URI,
      iat: now,
      exp: now + 3600,
    })
  ).toString("base64url");

  const signInput = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(signInput);
  const signature = signer.sign(key.private_key, "base64url");

  const jwt = `${signInput}.${signature}`;

  const response = await fetch(TOKEN_URI, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Token exchange failed: ${response.status}\n${body}`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

export function getDefaultServiceAccountPath(): string {
  return DEFAULT_SERVICE_ACCOUNT_PATH;
}

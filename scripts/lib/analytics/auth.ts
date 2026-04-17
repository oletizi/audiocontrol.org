import { readFileSync } from "fs";
import type { UmamiKeyConfig } from "./types.js";

const UMAMI_KEY_PATH = `${process.env.HOME}/.config/audiocontrol/umami-key.json`;
const UMAMI_BASE_URL = "https://api.umami.is/v1";
const WEBSITE_ID = "2b9a4087-e93a-432d-adba-252233404d67";

/** Load the Umami API key from ~/.config/audiocontrol/umami-key.json */
export function loadApiKey(): string {
  const raw = readFileSync(UMAMI_KEY_PATH, "utf-8");
  // Config uses relaxed JSON (unquoted keys)
  const parsed = JSON.parse(raw.replace(/(\w+):/g, '"$1":')) as UmamiKeyConfig;
  if (!parsed.apiKey || !parsed.apiKey.trim()) {
    throw new Error(`Missing apiKey in ${UMAMI_KEY_PATH}`);
  }
  return parsed.apiKey.trim();
}

/** Get the Umami base URL */
export function getBaseUrl(): string {
  return UMAMI_BASE_URL;
}

/** Get the website ID */
export function getWebsiteId(): string {
  return WEBSITE_ID;
}

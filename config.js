// config.js - Multi-provider configuration

export const PROVIDERS = {
  FREE: "free",
  OPENAI: "openai"
};

// Pollinations AI Key (Free Tier)
export const POLLINATIONS_API_KEY = "sk_23xOY22WU7BgYlls40W57r1vKuTmPMNH";

// Pollinations Endpoints (2026)
export const POLLINATIONS_CHAT_ENDPOINT = "https://gen.pollinations.ai/v1/chat/completions";
export const FREE_IMAGE_ENDPOINT = "https://image.pollinations.ai/prompt/";

// OpenAI Endpoints
export const OPENAI_CHAT_ENDPOINT = "https://api.openai.com/v1/chat/completions";
export const OPENAI_IMAGE_ENDPOINT = "https://api.openai.com/v1/images/generations";

export function getSavedProvider() {
  return localStorage.getItem("nexus_ai_provider") || PROVIDERS.FREE;
}

export function saveProvider(provider) {
  localStorage.setItem("nexus_ai_provider", provider);
}

export function getSavedOpenAIKey() {
  return localStorage.getItem("nexus_openai_key") || "";
}

export function saveOpenAIKey(key) {
  localStorage.setItem("nexus_openai_key", key.trim());
}

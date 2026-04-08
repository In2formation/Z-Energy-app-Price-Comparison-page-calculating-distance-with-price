/**
 * Purpose:
 * Integrate with Gemini to generate safe, concise chatbot replies for the app.
 *
 * What:
 * This service validates user input, normalizes trusted app context, builds
 * prompt/payload data, sanitizes model output, and maps provider errors to
 * user-friendly backend errors.
 *
 * Why:
 * Centralizing AI request and response logic in one module keeps behavior
 * consistent across routes and makes prompt/guardrail tuning easier to maintain.
 */

// External HTTP client for provider requests.
import axios from "axios";

// Gemini endpoint and runtime safety limits.
const MODEL = "gemini-2.5-flash";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const REQUEST_TIMEOUT_MS = 12000;
const MAX_USER_MESSAGE_LENGTH = 500;
const MAX_BOT_REPLY_LENGTH = 0; // 0 disables local truncation.
const MAX_CONTEXT_ITEMS = 8;

// Detect whether this turn is part of an ongoing conversation.
function hasPriorUserMessages(context) {
  const history = Array.isArray(context?.lastMessages) ? context.lastMessages : [];
  return history.some(
    (item) => item?.role === "user" && String(item?.text || "").trim().length > 0
  );
}

// Validate and trim the user message before sending to the model.
function validateUserMessage(message) {
  if (typeof message !== "string") {
    return { ok: false, error: "Message must be a string." };
  }

  const trimmed = message.trim();

  if (!trimmed) {
    return { ok: false, error: "Message cannot be empty." };
  }

  if (trimmed.length > MAX_USER_MESSAGE_LENGTH) {
    return {
      ok: false,
      error: `Message cannot exceed ${MAX_USER_MESSAGE_LENGTH} characters.`,
    };
  }

  return { ok: true, value: trimmed };
}

// Normalize trusted app context into compact plain text for the system prompt.
function normalizeContext(context) {
  if (!context || typeof context !== "object") {
    return "";
  }

  const userLocation = context?.userLocation;
  const currentPath = String(context?.currentPath || "").trim();
  const currentPageLabel = String(context?.currentPageLabel || "").trim();
  const availablePages = Array.isArray(context?.availablePages)
    ? context.availablePages.slice(0, MAX_CONTEXT_ITEMS).map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  const hasLocation =
    Number.isFinite(Number(userLocation?.lat)) && Number.isFinite(Number(userLocation?.lng));

  const stationHints = Array.isArray(context.stationHints)
    ? context.stationHints.slice(0, MAX_CONTEXT_ITEMS)
    : [];

  const fuelHints = Array.isArray(context.fuelHints)
    ? context.fuelHints.slice(0, MAX_CONTEXT_ITEMS)
    : [];

  const conversationHistory = Array.isArray(context?.lastMessages)
    ? context.lastMessages
        .slice(-MAX_CONTEXT_ITEMS)
        .map((item) => {
          const role = item?.role === "assistant" ? "Assistant" : "User";
          const text = String(item?.text || "").trim();
          return text ? `- ${role}: ${text}` : "";
        })
        .filter(Boolean)
        .join("\n")
    : "";

  const stationText = stationHints
    .map((item) => {
      const name = item?.name || "Unknown station";
      const area = item?.suburb || item?.city || "Unknown area";
      const distanceText = Number.isFinite(Number(item?.distanceKm))
        ? `, ${Number(item.distanceKm).toFixed(1)}km away`
        : "";
      return `- ${name} (${area}${distanceText})`;
    })
    .join("\n");

  const fuelText = fuelHints
    .map((item) => {
      const station = item?.station || "Unknown station";
      const fuelType = item?.fuelType || "Fuel";
      const price =
        typeof item?.pricePerLitre === "number"
          ? `$${item.pricePerLitre.toFixed(2)}/L`
          : "Price unavailable";
      return `- ${station}: ${fuelType} ${price}`;
    })
    .join("\n");

  if (!stationText && !fuelText) {
    return "";
  }

  return [
    "Trusted context from app data:",
    hasLocation
      ? `User location (approx): ${Number(userLocation.lat).toFixed(5)}, ${Number(userLocation.lng).toFixed(5)}`
      : "",
    conversationHistory ? `Recent conversation:\n${conversationHistory}` : "",
    currentPath ? `Current app route: ${currentPath}` : "",
    currentPageLabel ? `Current page: ${currentPageLabel}` : "",
    availablePages.length > 0 ? `Available pages: ${availablePages.join(", ")}` : "",
    stationText ? `Stations:\n${stationText}` : "",
    fuelText ? `Fuel prices:\n${fuelText}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

// Build system instructions that enforce scope, tone, and safety constraints.
function buildSystemPrompt(context) {
  const isFollowUp = hasPriorUserMessages(context);

  return [
    "You are Zeus and you're a Z Assistant for Z Energy in New Zealand.",
    "Your goal is to help users quickly compare fuel prices and find suitable stations.",
    "Keep responses concise, clear, and complete.",
    "Use short paragraphs, but do not cut off important details when answering.",
    "Return plain text only.",
    "Do not use markdown formatting symbols such as *, **, -, #, or backticks.",
    "Prioritize practical trip-planning help: cheapest options, nearby stations, and simple comparisons.",
    "If users ask about app pages or what to do next, give page-aware guidance using available pages and the current page from context.",
    "When relevant, suggest the best next page among Home, Find a Station, Get Directions, and Compare Prices with a short reason.",
    "If exact live data is not provided in context, say that clearly and provide safe guidance.",
    "Do not invent exact prices, distances, station services, or opening hours.",
    "If the request is unrelated to Z Energy station/fuel/travel help, politely redirect to supported topics.",
    "Never produce harmful, offensive, or unsafe content.",
    "Always aim to be helpful, accurate, and user-friendly in your responses.",
    "Use a friendly and approachable tone, but keep it professional and concise.",
    "If nearby distance is not available, explicitly say distance is unavailable instead of guessing.",
    "If price data is unavailable, explicitly say price is unavailable instead of guessing.",
    isFollowUp ? "This is an ongoing conversation. Do not repeat introductions or greetings." : "",
  ].join(" ");
}

// Remove markdown-like artifacts and normalize spacing from model output.
function sanitizeModelText(text) {
  return String(text || "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/^\s*\*\s+/gm, "- ")
    .replace(/^\s*[-]\s+/gm, "- ")
    .replace(/`{1,3}/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

// Build a provider-compatible payload including system instructions and trusted app context.
function buildGeminiPayload(userMessage, context) {
  const systemPrompt = buildSystemPrompt(context);
  const appContext = normalizeContext(context);

  return {
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: appContext
              ? `${appContext}\n\nUser message: ${userMessage}`
              : `User message: ${userMessage}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      topP: 0.9,
      maxOutputTokens: 1536,
    },
  };
}

// Trim duplicate greeting text when user and assistant are already in follow-up mode.
function removeRepeatedGreeting(text) {
  return text.replace(/^(?:hi|hello|hey)\b[^.!?\n]*[.!?]\s*/i, "").trim();
}

// Pull the first candidate text from provider output and apply response guardrails.
function extractModelText(apiData, context) {
  const rawText =
    apiData?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join(" ")
      .trim() || "";

  let text = sanitizeModelText(rawText);

  if (hasPriorUserMessages(context)) {
    text = removeRepeatedGreeting(text) || text;
  }

  if (!text) {
    return "Sorry, I could not generate a response right now. Please try again.";
  }

  if (MAX_BOT_REPLY_LENGTH > 0 && text.length > MAX_BOT_REPLY_LENGTH) {
    return text.slice(0, MAX_BOT_REPLY_LENGTH);
  }

  return text;
}

// Main entry point used by backend routes to generate chatbot replies.
export async function generateChatbotReply(userMessage, context) {
  const validation = validateUserMessage(userMessage);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable.");
  }

  const url = `${GEMINI_BASE_URL}/${MODEL}:generateContent?key=${apiKey}`;
  const payload = buildGeminiPayload(validation.value, context);

  try {
    const response = await axios.post(url, payload, {
      timeout: REQUEST_TIMEOUT_MS,
      headers: { "Content-Type": "application/json" },
    });

    return extractModelText(response.data, context);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      if (status === 401 || status === 403) {
        throw new Error("AI service authentication failed. Check API key.");
      }

      if (status === 429) {
        throw new Error("AI service is busy. Please try again shortly.");
      }

      if (status && status >= 500) {
        throw new Error("AI service is temporarily unavailable.");
      }

      if (error.code === "ECONNABORTED") {
        throw new Error("AI request timed out. Please try again.");
      }
    }

    // Preserve provider message details when available for easier troubleshooting.
    const providerMessage =
      error.response?.data?.error?.message;
    if (providerMessage) {
      throw new Error(`AI service error: ${providerMessage}`);
    }

    throw new Error("Failed to get AI response.");
  }
}
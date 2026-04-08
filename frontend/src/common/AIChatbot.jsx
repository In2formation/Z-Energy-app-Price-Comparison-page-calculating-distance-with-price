/**
 * Purpose:
 * Provide the interactive AI chatbot modal experience used on the Home page.
 *
 * What:
 * This component manages chat state, backend status checks, location toggling,
 * speech playback, prompt handling, modal open/close behavior, and user-facing
 * confirmations for reset/leave actions.
 *
 * Why:
 * Consolidating chatbot behavior in one component ensures a consistent assistant
 * experience and keeps feature changes localized and maintainable.
 */
import { useEffect, useRef, useState } from "react";
import { askChatbot, getChatbotStatus } from "../services/api";
import styles from "./AIChatbot.module.css";
import chatbotSymbol from "../assets/Ai-Chatbot-Symbol.png";
import { FaLocationDot } from "react-icons/fa6";
import { FaVolumeHigh, FaVolumeXmark } from "react-icons/fa6";

// Curated prompts to help users start common fuel/station questions quickly.
const QUICK_PROMPTS = [
  {
    value: "What's the cheapest 91 near me?",
  },
  {
    value: "Show stations around me?",
  },
  {
    value: "What fuel types are available?",
  },
];

const HELP_NUDGE_INTERVAL_MS = 30 * 1000;
const HELP_NUDGE_MAX_RUNTIME_MS = 3 * 60 * 1000;
const CHAT_HISTORY_STORAGE_KEY = "zeus-ai-chat-history-v1";
const CHAT_UI_STATE_STORAGE_KEY = "zeus-ai-chat-ui-state-v1";
const CHAT_HISTORY_MAX_ITEMS = 80;
const SPEECH_CURSOR_PERSIST_THROTTLE_MS = 180;
const HELP_NUDGE_MESSAGES = [
  "Hi, do you need help? - click me!",
  "I can give you advice on what you need and then your next step, if you'd like!",
  "Maybe somebody could entertain me but I wonder who... yes you, I'm talking to you! Ask me something!",
  "lalalala I'm just a bored chatbot waiting for your questions about anything!",
  "Hurry up and ask me mortal! Before I get bored and leave! Just kidding, I'm always here to help you with your fuel needs!",
];

const buildEmptySpeechCursor = () => ({
  messageId: null,
  chunkIndex: 0,
  charIndex: 0,
});

const PAGE_LABELS = {
  "/": "Home",
  "/find-a-station": "Find a Station",
  "/get-directions": "Get Directions",
  "/gas-buddy": "Compare Prices",
};

const buildMessage = (role, text) => ({
  id: crypto.randomUUID(),
  role,
  text,
  timestamp: new Date().toISOString(),
});

const buildWelcomeMessage = () =>
  buildMessage("assistant", "Hi, I'm Zeus! How can I help you today?");

const loadStoredMessages = () => {
  if (typeof window === "undefined") {
    return [buildWelcomeMessage()];
  }

  try {
    const raw = window.localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
    if (!raw) {
      return [buildWelcomeMessage()];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [buildWelcomeMessage()];
    }

    const safeMessages = parsed
      .map((item) => {
        const role = item?.role === "assistant" ? "assistant" : item?.role === "user" ? "user" : "";
        const text = String(item?.text || "").trim();
        if (!role || !text) return null;

        return {
          id: String(item?.id || crypto.randomUUID()),
          role,
          text,
          timestamp: String(item?.timestamp || new Date().toISOString()),
        };
      })
      .filter(Boolean)
      .slice(-CHAT_HISTORY_MAX_ITEMS);

    return safeMessages.length > 0 ? safeMessages : [buildWelcomeMessage()];
  } catch {
    return [buildWelcomeMessage()];
  }
};

const loadStoredUiState = () => {
  if (typeof window === "undefined") {
    return {
      locationStatus: "off",
      userLocation: null,
      isSpeakerEnabled: false,
      isHelpNudgeDisabled: false,
      helpNudgeStartedAt: Date.now(),
      helpNudgeMessageIndex: 0,
      speechCursor: buildEmptySpeechCursor(),
    };
  }

  try {
    const raw = window.localStorage.getItem(CHAT_UI_STATE_STORAGE_KEY);
    if (!raw) {
      return {
        locationStatus: "off",
        userLocation: null,
        isSpeakerEnabled: false,
        isHelpNudgeDisabled: false,
        helpNudgeStartedAt: Date.now(),
        helpNudgeMessageIndex: 0,
        speechCursor: buildEmptySpeechCursor(),
      };
    }

    const parsed = JSON.parse(raw);
    const allowedStatuses = new Set(["off", "on", "denied", "unsupported"]);
    let locationStatus = allowedStatuses.has(parsed?.locationStatus)
      ? parsed.locationStatus
      : "off";

    const lat = Number(parsed?.userLocation?.lat);
    const lng = Number(parsed?.userLocation?.lng);
    const accuracyMeters = Number(parsed?.userLocation?.accuracyMeters);
    const userLocation = Number.isFinite(lat) && Number.isFinite(lng)
      ? {
          lat,
          lng,
          accuracyMeters: Number.isFinite(accuracyMeters) ? Math.round(accuracyMeters) : 0,
        }
      : null;

    if (locationStatus === "on" && !userLocation) {
      locationStatus = "off";
    }

    const rawMessageId = String(parsed?.speechCursor?.messageId || "").trim();
    const rawChunkIndex = Number(parsed?.speechCursor?.chunkIndex);
    const rawCharIndex = Number(parsed?.speechCursor?.charIndex);
    const speechCursor = {
      messageId: rawMessageId || null,
      chunkIndex: Number.isFinite(rawChunkIndex) && rawChunkIndex >= 0 ? Math.floor(rawChunkIndex) : 0,
      charIndex: Number.isFinite(rawCharIndex) && rawCharIndex >= 0 ? Math.floor(rawCharIndex) : 0,
    };

    return {
      locationStatus,
      userLocation,
      isSpeakerEnabled: Boolean(parsed?.isSpeakerEnabled),
      isHelpNudgeDisabled: false,
      helpNudgeStartedAt: Date.now(),
      helpNudgeMessageIndex: 0,
      speechCursor,
    };
  } catch {
    return {
      locationStatus: "off",
      userLocation: null,
      isSpeakerEnabled: false,
      isHelpNudgeDisabled: false,
      helpNudgeStartedAt: Date.now(),
      helpNudgeMessageIndex: 0,
      speechCursor: buildEmptySpeechCursor(),
    };
  }
};

const MAX_SPEECH_CHUNK = 220;

// Split long messages into manageable speech chunks to improve TTS stability.
const splitIntoSpeechChunks = (text, maxChars = MAX_SPEECH_CHUNK) => {
  const source = String(text || "").trim();
  if (!source) return [];
  if (source.length <= maxChars) return [source];

  const pieces = [];
  let remaining = source;

  while (remaining.length > maxChars) {
    const segment = remaining.slice(0, maxChars + 1);
    let breakIndex = Math.max(
      segment.lastIndexOf("."),
      segment.lastIndexOf("!"),
      segment.lastIndexOf("?"),
      segment.lastIndexOf(","),
      segment.lastIndexOf(" ")
    );

    if (breakIndex < Math.floor(maxChars * 0.55)) {
      breakIndex = maxChars;
    }

    pieces.push(remaining.slice(0, breakIndex + 1).trim());
    remaining = remaining.slice(breakIndex + 1).trim();
  }

  if (remaining.length > 0) {
    pieces.push(remaining);
  }

  return pieces;
};

// Format chat timestamps into short local times suitable for compact bubbles.
const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};

// Prefer a male-like English voice for a consistent Zeus assistant tone.
const pickMaleVoice = (voices) => {
  if (!Array.isArray(voices) || voices.length === 0) return null;

  const maleLike = voices.find((voice) =>
    /david|guy|mark|james|daniel|lee|male/i.test(voice.name)
  );

  if (maleLike) return maleLike;

  return voices.find((voice) => /en-nz|en-au|en-gb|en-us/i.test(voice.lang)) || null;
};

function AIChatbot() {
  const [uiStateSeed] = useState(() => loadStoredUiState());

  // Core chat UI state and user interaction state.
  const [input, setInput] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [pendingPageAction, setPendingPageAction] = useState("");
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(uiStateSeed.isSpeakerEnabled);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakerStatus, setSpeakerStatus] = useState("Speaker off");
  const [messages, setMessages] = useState(() => loadStoredMessages());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [isDatabaseOnline, setIsDatabaseOnline] = useState(false);
  const [hasStatusLoaded, setHasStatusLoaded] = useState(false);
  const [locationStatus, setLocationStatus] = useState(uiStateSeed.locationStatus);
  const [userLocation, setUserLocation] = useState(uiStateSeed.userLocation);
  const [showHelpNudge, setShowHelpNudge] = useState(false);
  const [helpNudgeIndex, setHelpNudgeIndex] = useState(0);
  const [isHelpNudgeDisabled, setIsHelpNudgeDisabled] = useState(uiStateSeed.isHelpNudgeDisabled);
  const [isVisibleInstance, setIsVisibleInstance] = useState(true);

  // Refs used to control timers, autoscroll, and long-running speech queue state.
  const closeTimerRef = useRef(null);
  const launcherRef = useRef(null);
  const iconImageRef = useRef(null);
  const helpNudgeTextRef = useRef(null);
  const jumpSpinIntervalRef = useRef(null);
  const messagesRef = useRef(null);
  const speakerRunIdRef = useRef(0);
  const zeusVoiceRef = useRef(null);
  const speakerQueueRef = useRef([]);
  const queuedMessageIdsRef = useRef(new Set());
  const speechCursorRef = useRef(uiStateSeed.speechCursor || buildEmptySpeechCursor());
  const speechCursorLastPersistAtRef = useRef(0);
  const speechCursorLastPersistKeyRef = useRef("");
  const helpNudgeStartedAtRef = useRef(uiStateSeed.helpNudgeStartedAt);
  const helpNudgeMessageIndexRef = useRef(uiStateSeed.helpNudgeMessageIndex);
  const audioContextRef = useRef(null);
  const isAudioUnlockedRef = useRef(false);

  const isChatAvailable = isBackendOnline && isDatabaseOnline;

  const persistSpeechCursor = (cursor, options = {}) => {
    if (typeof window === "undefined") return;

    const force = Boolean(options?.force);
    const normalizedCursor = {
      messageId: String(cursor?.messageId || "").trim() || null,
      chunkIndex: Number.isFinite(Number(cursor?.chunkIndex))
        ? Math.max(0, Math.floor(Number(cursor?.chunkIndex)))
        : 0,
      charIndex: Number.isFinite(Number(cursor?.charIndex))
        ? Math.max(0, Math.floor(Number(cursor?.charIndex)))
        : 0,
    };

    const cursorKey = `${normalizedCursor.messageId || ""}:${normalizedCursor.chunkIndex}:${normalizedCursor.charIndex}`;
    const now = Date.now();

    if (!force && now - speechCursorLastPersistAtRef.current < SPEECH_CURSOR_PERSIST_THROTTLE_MS) {
      return;
    }

    if (cursorKey === speechCursorLastPersistKeyRef.current) {
      return;
    }

    try {
      const state = window.localStorage.getItem(CHAT_UI_STATE_STORAGE_KEY);
      const parsed = state ? JSON.parse(state) : {};
      window.localStorage.setItem(
        CHAT_UI_STATE_STORAGE_KEY,
        JSON.stringify({
          ...parsed,
          speechCursor: normalizedCursor,
        })
      );
      speechCursorLastPersistAtRef.current = now;
      speechCursorLastPersistKeyRef.current = cursorKey;
    } catch {
      // Ignore storage errors.
    }
  };

  // Poll backend + database health so chat controls can reflect real availability.
  const refreshBackendStatus = async () => {
    try {
      const status = await getChatbotStatus();
      setIsBackendOnline(Boolean(status?.backendOnline));
      setIsDatabaseOnline(Boolean(status?.databaseOnline));
      setHasStatusLoaded(true);
    } catch {
      setIsBackendOnline(false);
      setIsDatabaseOnline(false);
      setHasStatusLoaded(true);
    }
  };

  // Keep backend/database status fresh even while the modal is closed.
  useEffect(() => {
    refreshBackendStatus();
    const intervalId = window.setInterval(refreshBackendStatus, 10000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  // Cleanup timers and active speech when component unmounts.
  // Visibility effect handles pausing speech before unmount to avoid cross-page cancel races.
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }

      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, []);

  // Track visibility so hidden duplicate chatbot mounts do not interfere with behavior.
  useEffect(() => {
    const updateVisibility = () => {
      setIsVisibleInstance(Boolean(launcherRef.current && launcherRef.current.getClientRects().length > 0));
    };

    updateVisibility();
    window.addEventListener("resize", updateVisibility);

    return () => {
      window.removeEventListener("resize", updateVisibility);
    };
  }, []);

  // When this instance becomes hidden (page navigation), immediately pause its speech.
  useEffect(() => {
    if (!isVisibleInstance) {
      persistSpeechCursor(speechCursorRef.current, { force: true });
      pauseSpeaker();
    }
  }, [isVisibleInstance]);

  // Animate icon with jump and spin every 10-20 seconds (only when backend is online).
  useEffect(() => {
    const scheduleNextJump = () => {
      const delayMs = Math.random() * 10000 + 10000;
      jumpSpinIntervalRef.current = window.setTimeout(() => {
        if (iconImageRef.current && isVisibleInstance && isChatAvailable) {
          iconImageRef.current.classList.add(styles.jumping);
          if (helpNudgeTextRef.current) {
            helpNudgeTextRef.current.classList.add(styles.jumping);
          }
          window.setTimeout(() => {
            if (iconImageRef.current) {
              iconImageRef.current.classList.remove(styles.jumping);
            }
            if (helpNudgeTextRef.current) {
              helpNudgeTextRef.current.classList.remove(styles.jumping);
            }
            scheduleNextJump();
          }, 800);
        } else {
          scheduleNextJump();
        }
      }, delayMs);
    };

    scheduleNextJump();

    return () => {
      if (jumpSpinIntervalRef.current) {
        window.clearTimeout(jumpSpinIntervalRef.current);
      }
    };
  }, [isVisibleInstance, isChatAvailable]);

  // Unlock Web Audio after user interaction so reminder chimes are not blocked.
  useEffect(() => {
    const ensureAudioUnlocked = () => {
      try {
        const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextCtor) return;

        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContextCtor();
        }

        audioContextRef.current
          .resume()
          .then(() => {
            isAudioUnlockedRef.current = true;
          })
          .catch(() => {});
      } catch {
        // Silent fail: reminders still show even if chime cannot be unlocked.
      }
    };

    const handleUserUnlock = () => {
      ensureAudioUnlocked();
    };

    window.addEventListener("pointerdown", handleUserUnlock, { passive: true });
    window.addEventListener("keydown", handleUserUnlock);
    window.addEventListener("touchstart", handleUserUnlock, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", handleUserUnlock);
      window.removeEventListener("keydown", handleUserUnlock);
      window.removeEventListener("touchstart", handleUserUnlock);
    };
  }, []);

  // Warm and cache selected speech voice as soon as browser voices are available.
  useEffect(() => {
    if (!("speechSynthesis" in window)) return undefined;

    const synth = window.speechSynthesis;

    const warmVoiceCache = () => {
      if (zeusVoiceRef.current) return;

      const voices = synth.getVoices();
      const selected = pickMaleVoice(voices);
      if (selected) {
        zeusVoiceRef.current = selected;
      }
    };

    warmVoiceCache();
    synth.addEventListener("voiceschanged", warmVoiceCache);

    return () => {
      synth.removeEventListener("voiceschanged", warmVoiceCache);
    };
  }, []);

  // Keep newest messages visible without smooth scrolling delays.
  useEffect(() => {
    if (!isOpen || !messagesRef.current) return;

    messagesRef.current.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "auto",
    });
  }, [messages, isLoading, isOpen]);

  // Persist chat history between page navigations.
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const snapshot = messages.slice(-CHAT_HISTORY_MAX_ITEMS);
      window.localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // Ignore storage quota/privacy mode errors.
    }
  }, [messages]);

  // Persist UI-related chatbot state between pages where Zeus is mounted.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isVisibleInstance = Boolean(
      launcherRef.current && launcherRef.current.getClientRects().length > 0
    );
    if (!isVisibleInstance) return;

    try {
      window.localStorage.setItem(
        CHAT_UI_STATE_STORAGE_KEY,
        JSON.stringify({
          locationStatus,
          userLocation,
          isSpeakerEnabled,
          speechCursor: speechCursorRef.current,
        })
      );
    } catch {
      // Ignore storage quota/privacy mode errors.
    }
  }, [locationStatus, userLocation, isSpeakerEnabled, isHelpNudgeDisabled]);

  // Force speaker/location behavior into safe offline defaults.
  useEffect(() => {
    if (!isVisibleInstance) {
      return;
    }

    if (!hasStatusLoaded) {
      return;
    }

    if (!isChatAvailable) {
      setSelectedPrompt("");
      pauseSpeaker();
      setSpeakerStatus("Locked while offline");
    } else if (!isSpeaking) {
      setSpeakerStatus(isSpeakerEnabled ? "Speaker on" : "Speaker off");
    }
  }, [isVisibleInstance, hasStatusLoaded, isChatAvailable, isSpeaking, isSpeakerEnabled]);

  // Queue only unseen messages so speaker mode can continue reading incrementally.
  useEffect(() => {
    if (!isVisibleInstance || !isSpeakerEnabled || !isChatAvailable) {
      return;
    }

    const resumeCursor = speechCursorRef.current;

    if (resumeCursor?.messageId) {
      const resumeMsgIndex = messages.findIndex((msg) => msg?.id === resumeCursor.messageId);

      if (resumeMsgIndex !== -1) {
        for (let i = 0; i < resumeMsgIndex; i += 1) {
          if (messages[i]?.id) {
            queuedMessageIdsRef.current.add(messages[i].id);
          }
        }

        const resumeMessage = messages[resumeMsgIndex];
        const resumeChunks = splitIntoSpeechChunks(resumeMessage.text);
        const startChunkIndex = Math.min(
          Math.max(0, Number(resumeCursor.chunkIndex) || 0),
          Math.max(0, resumeChunks.length - 1)
        );

        for (let chunkIndex = startChunkIndex; chunkIndex < resumeChunks.length; chunkIndex += 1) {
          const originalText = resumeChunks[chunkIndex];
          const startCharIndex =
            chunkIndex === startChunkIndex
              ? Math.min(Math.max(0, Number(resumeCursor.charIndex) || 0), originalText.length)
              : 0;
          const text = originalText.slice(startCharIndex);

          if (!text) {
            continue;
          }

          speakerQueueRef.current.push({
            speakerName: resumeMessage.role === "assistant" ? "Zeus" : "Me",
            text,
            isFirstChunk: chunkIndex === 0 && startCharIndex === 0,
            messageId: resumeMessage.id,
            chunkIndex,
            startCharIndex,
          });
        }

        queuedMessageIdsRef.current.add(resumeMessage.id);
        speechCursorRef.current = buildEmptySpeechCursor();
      }
    }

    const freshMessages = messages.filter(
      (msg) =>
        msg?.id &&
        String(msg?.text || "").trim().length > 0 &&
        !queuedMessageIdsRef.current.has(msg.id)
    );

    if (freshMessages.length === 0) {
      return;
    }

    for (const msg of freshMessages) {
      const chunks = splitIntoSpeechChunks(msg.text);
      const speakerName = msg.role === "assistant" ? "Zeus" : "Me";

      chunks.forEach((chunk, chunkIndex) => {
        speakerQueueRef.current.push({
          speakerName,
          text: chunk,
          isFirstChunk: chunkIndex === 0,
          messageId: msg.id,
          chunkIndex,
          startCharIndex: 0,
        });
      });

      queuedMessageIdsRef.current.add(msg.id);
    }

    if (!isSpeaking) {
      processSpeechQueue();
    }
  }, [isVisibleInstance, messages, isSpeakerEnabled, isChatAvailable, isSpeaking]);

  // Intercept refresh shortcuts to prevent accidental loss of active chat session.
  useEffect(() => {
    const hasChatHistory = messages.length > 1 || String(input || "").trim().length > 0;

    const handleRefreshShortcuts = (event) => {
      if (!hasChatHistory || showClearConfirm || showLeaveConfirm) {
        return;
      }

      const key = String(event.key || "").toLowerCase();
      const isRefreshShortcut =
        key === "f5" ||
        ((event.ctrlKey || event.metaKey) && key === "r");

      if (!isRefreshShortcut) {
        return;
      }

      event.preventDefault();
      setPendingPageAction("refresh");
      setShowLeaveConfirm(true);
    };

    window.addEventListener("keydown", handleRefreshShortcuts);

    return () => {
      window.removeEventListener("keydown", handleRefreshShortcuts);
    };
  }, [messages, input, showClearConfirm, showLeaveConfirm]);

  // Show a periodic launcher nudge so users always know help is available.
  useEffect(() => {
    helpNudgeStartedAtRef.current = Date.now();
    helpNudgeMessageIndexRef.current = 0;
    setHelpNudgeIndex(0);

    if (!isHelpNudgeDisabled) {
      setShowHelpNudge(false);
    }
  }, []);

  // Show a periodic launcher nudge so users always know help is available.
  useEffect(() => {

    const playChime = () => {
      try {
        if (!isAudioUnlockedRef.current) return;

        const audioCtx = audioContextRef.current;
        if (!audioCtx) return;

        if (audioCtx.state === "suspended") {
          audioCtx.resume().catch(() => {});
        }

        const oscillator = audioCtx.createOscillator();
        const oscillator2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        oscillator.type = "sine";
        oscillator2.type = "triangle";
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        oscillator.frequency.setValueAtTime(1174, audioCtx.currentTime + 0.08);
        oscillator2.frequency.setValueAtTime(659, audioCtx.currentTime + 0.02);
        oscillator2.frequency.setValueAtTime(988, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.09, audioCtx.currentTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);

        oscillator.connect(gain);
        oscillator2.connect(gain);
        gain.connect(audioCtx.destination);
        oscillator.start();
        oscillator2.start(audioCtx.currentTime + 0.01);
        oscillator.stop(audioCtx.currentTime + 0.22);
        oscillator2.stop(audioCtx.currentTime + 0.23);
      } catch {
        // Silent fail keeps reminder visible even when browser blocks autoplay audio.
      }
    };

    const intervalId = window.setInterval(() => {
      if (!isVisibleInstance) {
        setShowHelpNudge(false);
        return;
      }

      if (isOpen || !isChatAvailable || isHelpNudgeDisabled) {
        setShowHelpNudge(false);
        return;
      }

      const elapsed = Date.now() - helpNudgeStartedAtRef.current;
      if (elapsed >= HELP_NUDGE_MAX_RUNTIME_MS) {
        setShowHelpNudge(false);
        return;
      }

      setShowHelpNudge(true);
      setHelpNudgeIndex(helpNudgeMessageIndexRef.current % HELP_NUDGE_MESSAGES.length);
      helpNudgeMessageIndexRef.current += 1;
      playChime();
    }, HELP_NUDGE_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isVisibleInstance, isOpen, isChatAvailable, isHelpNudgeDisabled]);

  // Hide reminder immediately if services go offline.
  useEffect(() => {
    if (!isChatAvailable || isHelpNudgeDisabled) {
      setShowHelpNudge(false);
      setHelpNudgeIndex(0);
    }
  }, [isChatAvailable, isHelpNudgeDisabled]);

  // Open modal immediately and cancel any in-flight close animation timeout.
  const handleOpen = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setIsClosing(false);
    setIsOpen(true);
    setShowHelpNudge(false);
    setHelpNudgeIndex(0);
  };

  // Supports optional open event from other Home UI affordances.
  useEffect(() => {
    const openFromHomeSuggestion = () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }

      setIsClosing(false);
      setIsOpen(true);
      setShowHelpNudge(false);
      setHelpNudgeIndex(0);
    };

    window.addEventListener("open-ai-chatbot", openFromHomeSuggestion);

    return () => {
      window.removeEventListener("open-ai-chatbot", openFromHomeSuggestion);
    };
  }, []);

  // Close modal with animation and delayed unmount for smooth exit motion.
  const handleRequestClose = () => {
    if (!isOpen || isClosing) return;

    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      closeTimerRef.current = null;
    }, 240);
  };

  // Return all chat state to initial defaults for a fresh new session.
  const resetConversation = () => {
    stopSpeaker();
    setIsSpeakerEnabled(false);
    setMessages([buildWelcomeMessage()]);
    speakerQueueRef.current = [];
    queuedMessageIdsRef.current.clear();
    speechCursorRef.current = buildEmptySpeechCursor();
    persistSpeechCursor(speechCursorRef.current, { force: true });
    setInput("");
    setSelectedPrompt("");
    setError("");
    setIsLoading(false);
    setLocationStatus("off");
    setUserLocation(null);

    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(CHAT_HISTORY_STORAGE_KEY);
      } catch {
        // Ignore storage errors.
      }
    }
  };

  // Backdrop click closes modal without clearing conversation.
  const handleBackdropClose = () => {
    handleRequestClose();
  };

  // Top-right close button asks for confirmation before clearing history.
  const handleCloseButton = () => {
    if (!isOpen || isClosing) return;

    setShowClearConfirm(true);
  };

  const handleCancelClearConfirm = () => {
    setShowClearConfirm(false);
  };

  const handleConfirmClearAndClose = () => {
    setShowClearConfirm(false);
    setIsHelpNudgeDisabled(true);
    setShowHelpNudge(false);
    setHelpNudgeIndex(0);
    resetConversation();
    handleRequestClose();
  };

  const handleCancelLeaveConfirm = () => {
    setShowLeaveConfirm(false);
    setPendingPageAction("");
  };

  const handleConfirmLeaveAction = () => {
    const action = pendingPageAction;
    setShowLeaveConfirm(false);
    setPendingPageAction("");

    if (action === "refresh") {
      stopSpeaker();
      setIsSpeakerEnabled(false);
      window.location.reload();
    }
  };

  // Send message to backend and append both user and assistant responses.
  const sendMessage = async (rawMessage) => {
    const trimmed = String(rawMessage || "").trim();
    if (!trimmed || isLoading) return;

    const userMessage = buildMessage("user", trimmed);

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError("");
    setIsLoading(true);

    if (!isChatAvailable) {
      setIsLoading(false);
      setError("Chatbot is offline right now. Please wait for backend connection.");
      return;
    }

    try {
      const data = await askChatbot(trimmed, {
        lastMessages: messages.slice(-6).map((msg) => ({
          role: msg.role,
          text: msg.text,
        })),
        userLocation,
        currentPath: window.location.pathname,
        currentPageLabel: PAGE_LABELS[window.location.pathname] || "Unknown page",
        availablePages: Object.values(PAGE_LABELS),
      });

      const botMessage = buildMessage(
        "assistant",
        data?.reply || "Sorry, I could not generate a response right now."
      );

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Something went wrong while contacting the AI service.";

      setError(message);

      setMessages((prev) => [
        ...prev,
        buildMessage("assistant", "Sorry, I am having trouble right now. Please try again shortly."),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Selecting a quick prompt auto-sends and then resets the dropdown placeholder.
  const handlePromptChange = async (event) => {
    if (!isChatAvailable || isLoading) return;

    const prompt = event.target.value;
    setSelectedPrompt(prompt);

    if (prompt) {
      setInput(prompt);
      await sendMessage(prompt);
      setSelectedPrompt("");
    }
  };

  // Request high-accuracy location once and keep status-specific feedback text.
  const enableLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("unsupported");
      return;
    }

    setLocationStatus("loading");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracyMeters: Math.round(position.coords.accuracy || 0),
        });
        setLocationStatus("on");
      },
      () => {
        setLocationStatus("denied");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await sendMessage(input);
  };

  const toggleLocation = () => {
    if (!isChatAvailable) return;

    if (locationStatus === "on") {
      setLocationStatus("off");
      setUserLocation(null);
      return;
    }

    enableLocation();
  };

  // Hard stop current speech run and clear any queued utterances.
  const stopSpeaker = () => {
    speakerRunIdRef.current += 1;
    speakerQueueRef.current = [];
    speechCursorRef.current = buildEmptySpeechCursor();
    persistSpeechCursor(speechCursorRef.current, { force: true });
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakerStatus(isChatAvailable ? "Speaker off" : "Locked while offline");
  };

  // Pause current speech without clearing the queue so it can resume later.
  const pauseSpeaker = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakerStatus(isChatAvailable ? "Speaker on" : "Locked while offline");
  };

  // Resolve and cache the preferred voice each time speech starts.
  const getZeusVoice = () => {
    if (!("speechSynthesis" in window)) return null;

    const synth = window.speechSynthesis;
    const voices = synth.getVoices();

    if (zeusVoiceRef.current) {
      const sameVoice = voices.find((voice) => voice.voiceURI === zeusVoiceRef.current.voiceURI);
      if (sameVoice) {
        zeusVoiceRef.current = sameVoice;
        return sameVoice;
      }
    }

    const selected = pickMaleVoice(voices);
    if (selected) {
      zeusVoiceRef.current = selected;
      return selected;
    }

    return null;
  };

  // Process one queue item at a time to support long responses and new arrivals.
  const processSpeechQueue = () => {
    if (!isSpeakerEnabled || !isChatAvailable) {
      return;
    }

    if (!("speechSynthesis" in window)) {
      setError("Speech is not supported in this browser.");
      return;
    }

    if (speakerQueueRef.current.length === 0) {
      setIsSpeaking(false);
      setSpeakerStatus("Speaker on");
      return;
    }

    const runId = speakerRunIdRef.current;
    const synth = window.speechSynthesis;
    const zeusVoice = getZeusVoice();

    setIsSpeaking(true);
    const currentItem = speakerQueueRef.current.shift();

    speechCursorRef.current = {
      messageId: currentItem.messageId || null,
      chunkIndex: Number.isFinite(Number(currentItem.chunkIndex))
        ? Math.max(0, Math.floor(Number(currentItem.chunkIndex)))
        : 0,
      charIndex: Number.isFinite(Number(currentItem.startCharIndex))
        ? Math.max(0, Math.floor(Number(currentItem.startCharIndex)))
        : 0,
    };
    persistSpeechCursor(speechCursorRef.current);

    setSpeakerStatus(`Speaking ${currentItem.speakerName}`);

    const prefix = currentItem.isFirstChunk ? `${currentItem.speakerName} says: ` : "";
    const utterance = new SpeechSynthesisUtterance(`${prefix}${currentItem.text}`);
    utterance.rate = 0.95;
    utterance.pitch = 0.9;

    if (zeusVoice) {
      utterance.voice = zeusVoice;
    }

    utterance.onboundary = (event) => {
      if (speakerRunIdRef.current !== runId) return;

      const boundaryCharIndex = Number(event?.charIndex);
      if (!Number.isFinite(boundaryCharIndex) || boundaryCharIndex < 0) {
        return;
      }

      const baseCharIndex = Number.isFinite(Number(currentItem.startCharIndex))
        ? Math.max(0, Math.floor(Number(currentItem.startCharIndex)))
        : 0;

      speechCursorRef.current = {
        messageId: currentItem.messageId || null,
        chunkIndex: Number.isFinite(Number(currentItem.chunkIndex))
          ? Math.max(0, Math.floor(Number(currentItem.chunkIndex)))
          : 0,
        charIndex: baseCharIndex + Math.max(0, Math.floor(boundaryCharIndex)),
      };
      persistSpeechCursor(speechCursorRef.current);
    };

    utterance.onend = () => {
      if (speakerRunIdRef.current !== runId) return;

      speechCursorRef.current = {
        messageId: currentItem.messageId || null,
        chunkIndex: Number.isFinite(Number(currentItem.chunkIndex))
          ? Math.max(0, Math.floor(Number(currentItem.chunkIndex + 1)))
          : 0,
        charIndex: 0,
      };
      persistSpeechCursor(speechCursorRef.current, { force: true });

      processSpeechQueue();
    };

    utterance.onerror = () => {
      if (speakerRunIdRef.current !== runId) return;
      processSpeechQueue();
    };

    synth.speak(utterance);
  };

  // Toggle speaker mode and rebuild queue against current message history.
  const toggleSpeaker = () => {
    if (!isChatAvailable) {
      setSpeakerStatus("Locked while offline");
      return;
    }

    if (isSpeakerEnabled) {
      setIsSpeakerEnabled(false);
      stopSpeaker();
      return;
    }

    speakerRunIdRef.current += 1;
    speakerQueueRef.current = [];
    queuedMessageIdsRef.current.clear();
    setIsSpeakerEnabled(true);
    setSpeakerStatus("Speaker on");
  };

  return (
    <div ref={launcherRef} className={styles.chatbotLauncher}>
      {showHelpNudge && !isOpen && (
        <p ref={helpNudgeTextRef} className={styles.helpNudgeText} role="status" aria-live="polite">
          {HELP_NUDGE_MESSAGES[helpNudgeIndex]}
        </p>
      )}

      {/* Floating launcher icon that opens the chatbot modal. */}
      <button
        type="button"
        className={styles.chatIconButton}
        onClick={handleOpen}
        aria-label="Open Z Assistant chatbot"
      >
        <img ref={iconImageRef} src={chatbotSymbol} alt="" aria-hidden="true" />
      </button>

      {isOpen && (
        // Backdrop closes the modal when clicked outside the chatbot card.
        <div
          className={`${styles.modalBackdrop} ${isClosing ? styles.modalBackdropClosing : ""}`.trim()}
          onClick={handleBackdropClose}
          role="presentation"
        >
          <section
            className={`${styles.chatbotCard} ${isClosing ? styles.chatbotCardClosing : ""}`.trim()}
            aria-label="Z Assistant chatbot"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Header contains live status plus location/speaker controls. */}
            <header className={styles.chatHeader}>
              <h2>Z Assistant</h2>
              <div className={styles.statusRow}>
                <p className={isChatAvailable ? styles.statusOnline : styles.statusOffline}>
                  {isChatAvailable ? "Online" : "Offline"}
                </p>
                <button
                  type="button"
                  className={`${styles.locationIconButton} ${locationStatus === "on" ? styles.locationOn : styles.locationOff}`}
                  onClick={toggleLocation}
                  disabled={locationStatus === "loading" || !isChatAvailable}
                  aria-disabled={locationStatus === "loading" || !isChatAvailable}
                  aria-label={locationStatus === "on" ? "Turn location off" : "Turn location on"}
                  title={locationStatus === "on" ? "Location on" : "Location off"}
                >
                  <FaLocationDot />
                </button>
                <button
                  type="button"
                  className={`${styles.speakerIconButton} ${isSpeakerEnabled ? styles.speakerOn : styles.speakerOff}`}
                  onClick={toggleSpeaker}
                  disabled={!isChatAvailable}
                  aria-disabled={!isChatAvailable}
                  aria-label={isSpeakerEnabled ? "Disable speaker mode" : "Enable speaker mode"}
                  title={isSpeakerEnabled ? "Disable speaker" : "Enable speaker"}
                >
                  {isSpeakerEnabled ? <FaVolumeHigh /> : <FaVolumeXmark />}
                </button>
              </div>
              <p className={styles.speakerHint}>{speakerStatus}</p>
              <button
                type="button"
                className={styles.closeButton}
                onClick={handleCloseButton}
                aria-label="Close chatbot"
              >
                x
              </button>
            </header>

            <div className={styles.chatBody}>
              {/* Chronological message log with sender labels and timestamps. */}
              <div
                ref={messagesRef}
                className={styles.messages}
                role="log"
                aria-live="polite"
              >
                {messages.map((msg) =>
                  msg.role === "user" ? (
                    <article key={msg.id} className={styles.userBubble}>
                      <p className={styles.messageSender}>Me</p>
                      <p className={styles.messageText}>{msg.text}</p>
                      <time className={styles.messageTime} dateTime={msg.timestamp || ""}>
                        {formatTimestamp(msg.timestamp)}
                      </time>
                    </article>
                  ) : (
                    <article key={msg.id} className={styles.botModalBubble}>
                      <img
                        src={chatbotSymbol}
                        alt=""
                        aria-hidden="true"
                        className={styles.botModalSymbol}
                      />
                      <div className={styles.botMessageBody}>
                        <p className={styles.messageSender}>Zeus</p>
                        <p className={styles.botModalText}>{msg.text}</p>
                        <time className={styles.messageTime} dateTime={msg.timestamp || ""}>
                          {formatTimestamp(msg.timestamp)}
                        </time>
                      </div>
                    </article>
                  )
                )}

                {isLoading && (
                  <div className={styles.loadingContainer}>
                    <img
                      src={chatbotSymbol}
                      alt=""
                      aria-hidden="true"
                      className={styles.loadingSpinner}
                    />
                  </div>
                )}
              </div>

              {error && <p className={styles.errorText}>{error}</p>}

              {/* Location helper text reflects current browser geolocation state. */}
              <div className={styles.locationRow}>
                <p className={styles.locationText}>
                  {locationStatus === "off" && "Location is off."}
                  {locationStatus === "loading" && "Requesting location access..."}
                  {locationStatus === "on" && "Location enabled for nearby station answers."}
                  {locationStatus === "denied" && "Location access denied by browser."}
                  {locationStatus === "unsupported" && "Location is not supported in this browser."}
                </p>
              </div>

              {/* Prompt selector sends pre-written prompts in one step. */}
              <div className={styles.quickPrompts} aria-label="Suggested prompts">
                <select
                  className={styles.promptDropdown}
                  value={selectedPrompt}
                  onChange={handlePromptChange}
                  disabled={isLoading || !isChatAvailable}
                  aria-disabled={isLoading || !isChatAvailable}
                  aria-label="Choose a suggested prompt"
                >
                  <option value="">Choose a quick prompt</option>
                  {QUICK_PROMPTS.map((prompt) => (
                    <option key={prompt.value} value={prompt.value}>
                      {prompt.value}
                    </option>
                  ))}
                </select>
              </div>

              {/* Free-text input for custom questions. */}
              <form className={styles.inputRow} onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Type here"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  maxLength={500}
                  disabled={isLoading || !isChatAvailable}
                  aria-label="Type your message"
                />

                <button
                  type="submit"
                  disabled={isLoading || !input.trim() || !isChatAvailable}
                  aria-label="Send message"
                />
              </form>

              {/* Full overlay lock when backend or database status is offline. */}
              {!isChatAvailable && (
                <div className={styles.offlineOverlay} role="status" aria-live="polite">
                  We're currently facing minor difficulties, please try again later.
                </div>
              )}

              {/* Confirm clear action before resetting session state. */}
              {showClearConfirm && (
                <div className={styles.confirmOverlay} role="presentation">
                  <section
                    className={styles.confirmDialog}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Confirm clear chatbot history"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <h3 className={styles.confirmTitle}>Clear conversation history?</h3>
                    <p className={styles.confirmText}>
                      This will clear your chatbot messages and location state.
                    </p>
                    <div className={styles.confirmActions}>
                      <button
                        type="button"
                        className={`${styles.confirmActionButton} ${styles.confirmCancelButton}`}
                        onClick={handleCancelClearConfirm}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className={`${styles.confirmActionButton} ${styles.confirmClearButton}`}
                        onClick={handleConfirmClearAndClose}
                      >
                        Clear and close
                      </button>
                    </div>
                  </section>
                </div>
              )}

              {/* Confirm refresh to avoid accidental chat history loss. */}
              {showLeaveConfirm && (
                <div className={styles.confirmOverlay} role="presentation">
                  <section
                    className={styles.confirmDialog}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Confirm page refresh"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <h3 className={styles.confirmTitle}>Refresh this page?</h3>
                    <p className={styles.confirmText}>
                      You have chatbot history in this session. Refreshing will clear the current chat.
                    </p>
                    <div className={styles.confirmActions}>
                      <button
                        type="button"
                        className={`${styles.confirmActionButton} ${styles.confirmCancelButton}`}
                        onClick={handleCancelLeaveConfirm}
                      >
                        Stay here
                      </button>
                      <button
                        type="button"
                        className={`${styles.confirmActionButton} ${styles.confirmClearButton}`}
                        onClick={handleConfirmLeaveAction}
                      >
                        Refresh now
                      </button>
                    </div>
                  </section>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default AIChatbot;
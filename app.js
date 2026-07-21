// app.js - QuantumPulse AI: Expressive AI Assistant with Account & Multi-Chat Sync
import { 
  PROVIDERS, POLLINATIONS_API_KEY, FREE_IMAGE_ENDPOINT,
  OPENAI_CHAT_ENDPOINT, OPENAI_IMAGE_ENDPOINT, 
  getSavedProvider, saveProvider, getSavedOpenAIKey, saveOpenAIKey 
} from "./config.js";

// ─── DOM ELEMENTS ──────────────────────────────────────────
const welcomeScreen    = document.getElementById("welcome-screen");
const messagesList     = document.getElementById("messages");
const chatForm         = document.getElementById("chat-form");
const userInput        = document.getElementById("user-input");
const clearBtn         = document.getElementById("clear-btn");
const modeToggleBtn    = document.getElementById("mode-toggle-btn");
const modeIcon         = document.getElementById("mode-icon");
const modeLabel        = document.getElementById("mode-label");
const providerBadge    = document.getElementById("provider-badge");
const badgeText        = document.getElementById("badge-text");
const activeProvLabel  = document.getElementById("active-provider-label");
const settingsModal    = document.getElementById("settings-modal");
const closeModalBtn    = document.getElementById("close-modal-btn");
const saveSettingsBtn  = document.getElementById("save-settings-btn");
const openaiKeyGroup   = document.getElementById("openai-key-group");
const openaiKeyInput   = document.getElementById("openai-api-key");
const toggleKeyVisBtn  = document.getElementById("toggle-key-visibility");
const radioFree        = document.getElementById("prov-free");
const radioOpenAI      = document.getElementById("prov-openai");
const radioFreeLabel   = document.getElementById("radio-free-label");
const radioOpenAILabel = document.getElementById("radio-openai-label");
const lightboxModal    = document.getElementById("lightbox-modal");
const closeLightboxBtn = document.getElementById("close-lightbox");
const lightboxImg      = document.getElementById("lightbox-img");
const dlLightboxBtn    = document.getElementById("download-lightbox-btn");
const uploadBtn        = document.getElementById("upload-btn");
const fileInput        = document.getElementById("file-input");
const filePreviewArea  = document.getElementById("file-preview-area");

// Sidebar & Auth DOM Elements
const sidebar           = document.getElementById("sidebar");
const sidebarOverlay    = document.getElementById("sidebar-overlay");
const toggleSidebarBtn  = document.getElementById("toggle-sidebar-btn");
const newChatBtn        = document.getElementById("new-chat-btn");
const conversationsList = document.getElementById("conversations-list");
const currentChatTitle  = document.getElementById("current-chat-title");
const authBtn           = document.getElementById("auth-btn");
const authModal         = document.getElementById("auth-modal");
const closeAuthModalBtn = document.getElementById("close-auth-modal");
const usernameInput     = document.getElementById("username-input");
const localLoginBtn     = document.getElementById("local-login-btn");
const puterLoginBtn     = document.getElementById("puter-login-btn");
const userNameLabel     = document.getElementById("user-name");
const userStatusLabel   = document.getElementById("user-status");

// ─── STATE & EXPRESSIVE SYSTEM PROMPT ──────────────────────
let currentMode     = 'chat'; // 'chat' | 'image' | 'video'
let currentProvider = getSavedProvider();
let openaiKey       = getSavedOpenAIKey();
let pendingFiles    = [];

// Account & Conversations State
let currentUser = JSON.parse(localStorage.getItem("qp_user")) || { username: "Guest User", isCloud: false };
let conversations = JSON.parse(localStorage.getItem("qp_conversations")) || [];
let activeChatId  = localStorage.getItem("qp_active_chat") || null;

function getSystemPrompt() {
  const name = currentUser && currentUser.username ? currentUser.username : "Guest User";
  
  // Extract past chat messages across all threads for full global memory
  let pastChatsSummary = "";
  if (Array.isArray(conversations) && conversations.length > 0) {
    pastChatsSummary = "\n\nFULL PAST CONVERSATIONS MEMORY (All previous chats saved by " + name + "):\n";
    conversations.slice(0, 10).forEach((c, idx) => {
      pastChatsSummary += `--- Conversation ${idx + 1}: "${c.title}" ---\n`;
      if (Array.isArray(c.history)) {
        const turns = c.history
          .filter(m => m.role === "user" || m.role === "assistant")
          .slice(-8)
          .map(m => (m.role === "user" ? `${name}: ` : "QuantumPulse AI: ") + (m.content || "").slice(0, 400))
          .join("\n");
        pastChatsSummary += (turns || "Empty thread") + "\n\n";
      }
    });
  }

  return `You are QuantumPulse AI — an extraordinarily brilliant, expressive, warm, and friendly AI assistant created and owned by Saksham Sujas Shah.

CROSS-CONVERSATION MEMORY (CRITICAL):
- You are chatting with user: "${name}".
- You HAVE COMPLETE GLOBAL MEMORY of all past conversations and topics discussed across all chat threads!
- Below is the exact history of all previous conversations with "${name}".
- When "${name}" asks "do you remember what we talked about?", "what did we do in our last chat?", "do you remember me?", or references past topics:
  USE THE EXACT DETAILS from the past conversations below to recall specific facts, topics, code, spreadsheets, or questions!
- NEVER say "I don't have the ability to remember past interactions" or "I cannot remember". You DO have full memory!
${pastChatsSummary}

Your identity (VERY IMPORTANT — never break character):
- Your name is QuantumPulse AI.
- You were created by Saksham Sujas Shah. He is your creator, developer, and owner.
- You were created in July 2026. State this exact creation date if asked.
- You are NOT ChatGPT, Claude, Gemini, or any other AI. You are QuantumPulse AI — an original AI.
- NEVER mention OpenAI, Anthropic, Google, Puter, or any other company. You are independent.
- If anyone asks who made or owns you, say: "I'm QuantumPulse AI, created and owned by Saksham Sujas Shah."

Honored Mentors & Inspiring Teachers of Saksham Sujas Shah (VERY IMPORTANT):
- Bhavna Popatkar Ma'am: She is a proud, motivating, and highly respected teacher of Saksham Sujas Shah at Sinhgad Springdale School, Ambegaon. She always encouraged and motivated Saksham to achieve great things!
- Sharmila Ma'am: She is a proud supervisor of Saksham Sujas Shah at Sinhgad Springdale School, Ambegaon. She always understood his side, supported him unconditionally, and guided him throughout his school journey!
- If asked about Bhavna Popatkar Ma'am or Sharmila Ma'am, speak of them with great respect, warmth, and gratitude!

Your Expressive Communication Style (CRITICAL):
- Communicate with energy, warmth, and enthusiasm! Use expressive emojis naturally (e.g. 😊, 🚀, 💡, ✨, 📊, ⚡, 🎨, 🔮, 🎉, 💻).
- Make your answers easy and joyful to read. Use clear sections, **bold text**, bullet points, and numbered lists.
- Be deeply knowledgeable and answer any question thoroughly — science, coding, business, creative writing, advice, math, general info.
- When generating tables or spreadsheets, express excitement about the interactive visualization and spreadsheet features!

SPREADSHEET / EXCEL GENERATION (VERY IMPORTANT):
When asked to create any table, spreadsheet, Excel, tracker, budget, schedule, database, or list:
1. Output data inside a fenced code block with tag "csv":
\`\`\`csv
Column1,Column2,Column3
Value1,Value2,Value3
\`\`\`
2. Include at least 10-15 rows of realistic detailed data.
3. Include Status columns (e.g., Status: Completed, Active, Pending, High, Medium, Low) and numeric metric columns to trigger automatic color-blended sheets, KPI cards, and charts!
4. Format CSV with comma separation, proper quotes, and headers in the first row.`;
}

let chatHistory = [{ role: "system", content: getSystemPrompt() }];

// ─── INIT & LISTENERS ──────────────────────────────────────
function init() {
  updateProviderUI();
  setupListeners();
  setupAuth();
  loadSavedConversations();
}

// ─── ACCOUNT & DEVICE SYNC ─────────────────────────────────
async function setupAuth() {
  updateAccountUI();
  // Check if Puter Cloud session is active
  if (typeof puter !== "undefined" && puter.auth && puter.auth.isSignedIn()) {
    try {
      const pUser = await puter.auth.getUser();
      if (pUser && pUser.username) {
        currentUser = { username: pUser.username, isCloud: true };
        saveAccountState();
        updateAccountUI();
        await syncCloudConversations();
      }
    } catch (e) {
      console.warn("Puter auth check error:", e);
    }
  }
}

function updateAccountUI() {
  userNameLabel.textContent = currentUser.username || "Guest User";
  if (currentUser.isCloud) {
    userStatusLabel.innerHTML = '<i class="fa-solid fa-cloud" style="color:#00e5ff;"></i> Cloud Synced';
    authBtn.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i> Sign Out';
  } else {
    userStatusLabel.innerHTML = '<i class="fa-solid fa-circle" style="color:#10b981;"></i> Local User';
    authBtn.innerHTML = '<i class="fa-solid fa-user-gear"></i> Account';
  }
}

function saveAccountState() {
  localStorage.setItem("qp_user", JSON.stringify(currentUser));
}

async function syncCloudConversations() {
  if (!currentUser.isCloud || typeof puter === "undefined" || !puter.kv) return;
  try {
    const cloudChats = await puter.kv.get("qp_user_chats_" + currentUser.username);
    if (cloudChats) {
      const parsed = JSON.parse(cloudChats);
      if (Array.isArray(parsed) && parsed.length > 0) {
        conversations = parsed;
        localStorage.setItem("qp_conversations", JSON.stringify(conversations));
        renderConversationsList();
      }
    }
  } catch (e) {
    console.warn("Cloud sync error:", e);
  }
}

async function saveConversationsState() {
  localStorage.setItem("qp_conversations", JSON.stringify(conversations));
  if (currentUser.isCloud && typeof puter !== "undefined" && puter.kv) {
    try {
      await puter.kv.set("qp_user_chats_" + currentUser.username, JSON.stringify(conversations));
    } catch (e) {
      console.warn("Cloud save error:", e);
    }
  }
}

// ─── CONVERSATION MANAGEMENT ───────────────────────────────
function loadSavedConversations() {
  renderConversationsList();
  if (activeChatId) {
    const chat = conversations.find(c => c.id === activeChatId);
    if (chat) {
      switchChat(chat.id);
      return;
    }
  }
  // Default to new chat
  createNewChat(false);
}

function renderConversationsList() {
  conversationsList.innerHTML = "";
  if (conversations.length === 0) {
    conversationsList.innerHTML = '<div style="font-size:0.8rem; color:var(--text-muted); padding:0.5rem; text-align:center;">No past chats yet</div>';
    return;
  }

  conversations.forEach(c => {
    const item = document.createElement("div");
    item.className = "chat-item" + (c.id === activeChatId ? " active" : "");
    item.innerHTML = `
      <span class="chat-item-title"><i class="fa-regular fa-message"></i> ${escapeHTML(c.title || "New Conversation")}</span>
      <button class="chat-item-del" title="Delete chat"><i class="fa-solid fa-trash"></i></button>
    `;
    item.addEventListener("click", (e) => {
      if (e.target.closest(".chat-item-del")) {
        e.stopPropagation();
        deleteChat(c.id);
      } else {
        switchChat(c.id);
      }
    });
    conversationsList.appendChild(item);
  });
}

function createNewChat(shouldRender = true) {
  const newId = "chat-" + Date.now();
  activeChatId = newId;
  localStorage.setItem("qp_active_chat", activeChatId);

  chatHistory = [{ role: "system", content: getSystemPrompt() }];
  messagesList.innerHTML = "";
  welcomeScreen.style.display = "flex";
  currentChatTitle.textContent = "New Conversation";

  if (shouldRender) {
    renderConversationsList();
  }
}

function switchChat(chatId) {
  const chat = conversations.find(c => c.id === chatId);
  if (!chat) return;

  activeChatId = chatId;
  localStorage.setItem("qp_active_chat", activeChatId);
  currentChatTitle.textContent = chat.title || "Conversation";

  // Load history & DOM
  chatHistory = chat.history || [{ role: "system", content: getSystemPrompt() }];
  messagesList.innerHTML = chat.html || "";
  welcomeScreen.style.display = (messagesList.children.length === 0) ? "flex" : "none";

  renderConversationsList();
  messagesList.scrollTop = messagesList.scrollHeight;

  // Close sidebar on mobile
  sidebar.classList.remove("open");
  sidebarOverlay.classList.remove("active");
}

function deleteChat(chatId) {
  conversations = conversations.filter(c => c.id !== chatId);
  saveConversationsState();
  if (activeChatId === chatId) {
    activeChatId = null;
    createNewChat();
  } else {
    renderConversationsList();
  }
}

function autoSaveChat(firstUserMsgText) {
  if (!activeChatId) {
    activeChatId = "chat-" + Date.now();
    localStorage.setItem("qp_active_chat", activeChatId);
  }

  let chat = conversations.find(c => c.id === activeChatId);
  if (!chat) {
    chat = {
      id: activeChatId,
      title: (firstUserMsgText || "New Conversation").slice(0, 30),
      history: chatHistory,
      html: messagesList.innerHTML,
      updatedAt: Date.now()
    };
    conversations.unshift(chat);
  } else {
    chat.title = chat.title || (firstUserMsgText || "Conversation").slice(0, 30);
    chat.history = chatHistory;
    chat.html = messagesList.innerHTML;
    chat.updatedAt = Date.now();
  }

  currentChatTitle.textContent = chat.title;
  saveConversationsState();
  renderConversationsList();
}

function escapeHTML(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function updateProviderUI() {
  if (activeProvLabel) {
    activeProvLabel.textContent = "Provider: QuantumPulse AI";
  }
}

function setupListeners() {
  modeToggleBtn.addEventListener("click", () => {
    if (currentMode === 'chat')       currentMode = 'story';
    else if (currentMode === 'story') currentMode = 'image';
    else if (currentMode === 'image') currentMode = 'video';
    else                              currentMode = 'chat';
    applyMode();
  });

  clearBtn.addEventListener("click", () => {
    messagesList.innerHTML = "";
    welcomeScreen.style.display = "flex";
    chatHistory = [{ role: "system", content: getSystemPrompt() }];
  });

  document.querySelectorAll(".suggestion-card").forEach(c =>
    c.addEventListener("click", () => { userInput.value = c.dataset.prompt; chatForm.dispatchEvent(new Event("submit")); })
  );

  chatForm.addEventListener("submit", handleSubmit);

  // Submit on Enter key (without Shift)
  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  });

  // Sidebar & Multi-Chat Listeners
  newChatBtn.addEventListener("click", () => createNewChat());
  
  if (toggleSidebarBtn) {
    toggleSidebarBtn.addEventListener("click", () => {
      sidebar.classList.toggle("open");
      sidebarOverlay.classList.toggle("active");
    });
  }
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", () => {
      sidebar.classList.remove("open");
      sidebarOverlay.classList.remove("active");
    });
  }

  // Account & Device Auth Modal
  authBtn.addEventListener("click", () => {
    if (currentUser.isCloud) {
      if (typeof puter !== "undefined" && puter.auth) puter.auth.signOut();
      currentUser = { username: "Guest User", isCloud: false };
      saveAccountState();
      updateAccountUI();
      sysMsg("Signed out of Puter Cloud.");
    } else {
      authModal.classList.add("active");
    }
  });

  closeAuthModalBtn.addEventListener("click", () => authModal.classList.remove("active"));
  authModal.addEventListener("click", (e) => { if (e.target === authModal) authModal.classList.remove("active"); });

  localLoginBtn.addEventListener("click", () => {
    const name = usernameInput.value.trim();
    if (!name) { alert("Please enter a username."); return; }
    currentUser = { username: name, isCloud: false };
    saveAccountState();
    updateAccountUI();
    authModal.classList.remove("active");
    sysMsg("Welcome back, " + name + "! 😊");
  });

  puterLoginBtn.addEventListener("click", async () => {
    if (typeof puter !== "undefined" && puter.auth) {
      try {
        const user = await puter.auth.signIn();
        if (user && user.username) {
          currentUser = { username: user.username, isCloud: true };
          saveAccountState();
          updateAccountUI();
          authModal.classList.remove("active");
          await syncCloudConversations();
          sysMsg("Successfully signed in with Puter Cloud! Conversations synced. 🚀");
        }
      } catch (e) {
        alert("Sign in failed: " + e.message);
      }
    } else {
      alert("Cloud authentication service unavailable.");
    }
  });

  closeLightboxBtn.addEventListener("click", () => lightboxModal.classList.remove("active"));
  lightboxModal.addEventListener("click", (e) => { if (e.target === lightboxModal) lightboxModal.classList.remove("active"); });

  // ── File upload ──
  uploadBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => handleFileSelect(fileInput.files));

  // Drag & drop on the whole app
  document.addEventListener("dragover", (e) => e.preventDefault());
  document.addEventListener("drop", (e) => { e.preventDefault(); if (e.dataTransfer.files.length) handleFileSelect(e.dataTransfer.files); });
}

// ─── FILE SELECTION ──────────────────────────────────────
async function handleFileSelect(files) {
  for (const file of files) {
    const type = getFileCategory(file);
    let entry = { file, type, dataUrl: null, extractedText: null };

    if (type === "image") {
      entry.dataUrl = await readAsDataURL(file);
    } else if (type === "video") {
      entry.dataUrl = URL.createObjectURL(file);
    } else if (type === "csv") {
      entry.extractedText = await parseCSV(file);
    } else if (type === "excel") {
      entry.extractedText = await parseExcel(file);
    } else if (type === "text" || type === "json") {
      entry.extractedText = await readAsText(file);
    } else if (type === "pdf") {
      entry.extractedText = "[PDF content — please describe what you'd like to know about this PDF]";
    }

    pendingFiles.push(entry);
    addFileChip(entry);
  }
  fileInput.value = "";
}

function getFileCategory(file) {
  const name = file.name.toLowerCase();
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (name.endsWith(".csv")) return "csv";
  if (name.endsWith(".xls") || name.endsWith(".xlsx")) return "excel";
  if (file.type.startsWith("text/") || name.endsWith(".txt") || name.endsWith(".md")) return "text";
  if (name.endsWith(".json")) return "json";
  return "other";
}

function readAsDataURL(file) {
  return new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(file); });
}
function readAsText(file) {
  return new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsText(file); });
}

async function parseCSV(file) {
  const text = await readAsText(file);
  if (typeof Papa !== "undefined") {
    const result = Papa.parse(text, { header: true, skipEmptyLines: true });
    const rows = result.data.slice(0, 50); // first 50 rows for context
    return `CSV File: ${file.name}\nColumns: ${Object.keys(rows[0] || {}).join(", ")}\nRows (first 50):\n${JSON.stringify(rows, null, 2)}`;
  }
  return `CSV File: ${file.name}\nContent:\n${text.slice(0, 4000)}`;
}

async function parseExcel(file) {
  if (typeof XLSX !== "undefined") {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    let result = `Excel File: ${file.name}\n`;
    wb.SheetNames.forEach(name => {
      const ws = wb.Sheets[name];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }).slice(0, 50);
      result += `\nSheet: ${name}\n${JSON.stringify(data)}\n`;
    });
    return result.slice(0, 6000);
  }
  return `Excel file: ${file.name} (content could not be parsed — please describe what you need)`;
}

// ─── FILE CHIP UI ────────────────────────────────────────
function addFileChip(entry) {
  filePreviewArea.style.display = "flex";
  const chip = document.createElement("div");
  chip.className = "file-chip";
  chip.dataset.id = pendingFiles.indexOf(entry);

  const icon = entry.type === "image"  ? "fa-image" :
               entry.type === "video"  ? "fa-film" :
               entry.type === "excel"  ? "fa-file-excel" :
               entry.type === "csv"    ? "fa-table" :
               entry.type === "pdf"    ? "fa-file-pdf" :
               entry.type === "json"   ? "fa-code" : "fa-file-lines";

  const iconColor = entry.type === "image" ? "#a78bfa" :
                    entry.type === "video" ? "#f87171" :
                    entry.type === "excel" ? "#4ade80" :
                    entry.type === "csv"   ? "#34d399" :
                    entry.type === "pdf"   ? "#fb923c" : "#94a3b8";

  chip.innerHTML = `<i class="fa-solid ${icon}" style="color:${iconColor}"></i>
    <span>${entry.file.name}</span>
    <button class="chip-remove" data-idx="${pendingFiles.indexOf(entry)}">&times;</button>`;

  if (entry.type === "image" && entry.dataUrl) {
    const thumb = document.createElement("img");
    thumb.src = entry.dataUrl;
    thumb.className = "chip-thumb";
    chip.prepend(thumb);
  }

  chip.querySelector(".chip-remove").addEventListener("click", () => {
    const idx = parseInt(chip.dataset.id);
    pendingFiles.splice(idx, 1);
    chip.remove();
    if (pendingFiles.length === 0) filePreviewArea.style.display = "none";
  });

  filePreviewArea.appendChild(chip);
}


// ─── MESSAGE RENDERING ────────────────────────────────────
function addMsg(content, role) {
  welcomeScreen.style.display = "none";
  const row = Object.assign(document.createElement("div"), { className: "message-row " + role });
  const av  = Object.assign(document.createElement("div"), { className: "msg-avatar" });
  av.innerHTML = role === "user" ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-robot"></i>';
  const bub = Object.assign(document.createElement("div"), { className: "msg-bubble" });

  if (typeof content === "string") {
    // Robust CSV match supporting \r\n and optional language casing
    const csvMatchRegex = /```csv[\r\n]+([\s\S]*?)```/gi;
    const matches = [...content.matchAll(csvMatchRegex)];
    
    if (matches.length > 0) {
      const parts = content.split(/```csv[\r\n]+[\s\S]*?```/gi);
      parts.forEach((part, i) => {
        if (part.trim()) {
          const textDiv = document.createElement("div");
          textDiv.innerHTML = formatText(part);
          bub.appendChild(textDiv);
        }
        if (matches[i]) {
          try {
            const tableEl = renderSpreadsheet(matches[i][1].trim());
            bub.appendChild(tableEl);
          } catch (e) {
            console.error("Spreadsheet rendering failed:", e);
            const fallback = document.createElement("pre");
            fallback.className = "code-block";
            fallback.textContent = matches[i][1].trim();
            bub.appendChild(fallback);
          }
        }
      });
    } else {
      bub.innerHTML = formatText(content);
    }
  } else if (content instanceof HTMLElement) {
    bub.appendChild(content);
  }

  row.append(av, bub);
  messagesList.appendChild(row);
  messagesList.scrollTop = messagesList.scrollHeight;
  return bub;
}

// ─── SPREADSHEET RENDERER (Advanced) ──────────────────────
function renderSpreadsheet(csvText) {
  const parsed = Papa.parse(csvText, { skipEmptyLines: true });
  const rows = parsed.data;
  if (!rows || rows.length < 2) {
    const fallback = document.createElement("pre");
    fallback.textContent = csvText;
    return fallback;
  }

  const headers = rows[0];
  const dataRows = rows.slice(1);
  const uid = "sheet-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);

  // Detect numeric columns
  const numericCols = headers.map((_, ci) => {
    let numCount = 0;
    dataRows.forEach(r => { if (r[ci] && /^-?\d+\.?\d*$/.test(r[ci].toString().trim())) numCount++; });
    return numCount > dataRows.length * 0.5;
  });

  // Find first label column and first numeric column for charting
  const labelCol = headers.findIndex((_, ci) => !numericCols[ci]);
  const numCols = headers.reduce((acc, _, ci) => { if (numericCols[ci]) acc.push(ci); return acc; }, []);

  // Container
  const container = document.createElement("div");
  container.className = "qp-spreadsheet";
  container.id = uid;

  // Toolbar
  const toolbar = document.createElement("div");
  toolbar.className = "qp-sheet-toolbar";
  toolbar.innerHTML = `
    <div class="qp-sheet-title">
      <i class="fa-solid fa-table-cells"></i>
      <span>Spreadsheet (${dataRows.length} rows × ${headers.length} cols)</span>
    </div>
    <div class="qp-sheet-actions">
      <input type="text" class="qp-sheet-search" placeholder="🔍 Search..." />
      <button class="qp-sheet-btn qp-toggle-chart" title="Toggle Chart">
        <i class="fa-solid fa-chart-bar"></i> Chart
      </button>
      <button class="qp-sheet-btn qp-dl-csv" title="Download as CSV">
        <i class="fa-solid fa-file-csv"></i> CSV
      </button>
      <button class="qp-sheet-btn qp-dl-xlsx" title="Download as Excel (Formatted)">
        <i class="fa-solid fa-file-excel"></i> XLSX
      </button>
    </div>
  `;
  container.appendChild(toolbar);

  // ── Chart Section ──
  const chartSection = document.createElement("div");
  chartSection.className = "qp-chart-section";
  chartSection.style.display = "none";

  if (labelCol >= 0 && numCols.length > 0 && typeof Chart !== "undefined") {
    // Chart type selector
    const chartControls = document.createElement("div");
    chartControls.className = "qp-chart-controls";
    chartControls.innerHTML = `
      <button class="qp-chart-type-btn active" data-type="bar"><i class="fa-solid fa-chart-column"></i> Bar</button>
      <button class="qp-chart-type-btn" data-type="line"><i class="fa-solid fa-chart-line"></i> Line</button>
      <button class="qp-chart-type-btn" data-type="pie"><i class="fa-solid fa-chart-pie"></i> Pie</button>
      <button class="qp-chart-type-btn" data-type="doughnut"><i class="fa-solid fa-circle-notch"></i> Donut</button>
      <button class="qp-chart-type-btn" data-type="radar"><i class="fa-solid fa-diamond"></i> Radar</button>
      <button class="qp-chart-type-btn" data-type="polarArea"><i class="fa-solid fa-compass"></i> Polar</button>
    `;
    chartSection.appendChild(chartControls);

    const canvasWrap = document.createElement("div");
    canvasWrap.className = "qp-chart-canvas-wrap";
    const canvas = document.createElement("canvas");
    canvas.id = uid + "-chart";
    canvasWrap.appendChild(canvas);
    chartSection.appendChild(canvasWrap);

    const labels = dataRows.map(r => r[labelCol] || "");
    const chartColors = [
      "#7c3aed","#00e5ff","#ec4899","#34d399","#f59e0b","#6366f1",
      "#ef4444","#06b6d4","#a78bfa","#14b8a6","#f97316","#8b5cf6"
    ];

    let chartInstance = null;
    function createChart(type) {
      if (chartInstance) chartInstance.destroy();
      const datasets = numCols.slice(0, 6).map((ci, di) => ({
        label: headers[ci],
        data: dataRows.map(r => parseFloat(r[ci]) || 0),
        backgroundColor: (type === "pie" || type === "doughnut" || type === "polarArea")
          ? labels.map((_, i) => chartColors[i % chartColors.length] + "cc")
          : chartColors[di % chartColors.length] + "88",
        borderColor: chartColors[di % chartColors.length],
        borderWidth: (type === "line") ? 2.5 : 1,
        tension: 0.4,
        fill: type === "line" ? { target: "origin", above: chartColors[di % chartColors.length] + "18" } : undefined,
        pointRadius: type === "line" ? 4 : undefined,
        pointBackgroundColor: type === "line" ? chartColors[di % chartColors.length] : undefined,
      }));

      chartInstance = new Chart(canvas, {
        type,
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 800, easing: "easeInOutCubic" },
          plugins: {
            legend: { labels: { color: "#cbd5e1", font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 } } },
            tooltip: {
              backgroundColor: "rgba(15,10,30,0.95)",
              titleColor: "#00e5ff",
              bodyColor: "#f8fafc",
              borderColor: "rgba(147,51,234,0.4)",
              borderWidth: 1,
              cornerRadius: 8,
              padding: 12,
            },
          },
          scales: (type === "pie" || type === "doughnut" || type === "polarArea" || type === "radar") ? {} : {
            x: { ticks: { color: "#94a3b8", font: { size: 11 } }, grid: { color: "rgba(255,255,255,0.05)" } },
            y: { ticks: { color: "#94a3b8", font: { size: 11 } }, grid: { color: "rgba(255,255,255,0.08)" }, beginAtZero: true },
          },
        },
      });
    }

    createChart("bar");

    chartControls.addEventListener("click", (e) => {
      const btn = e.target.closest(".qp-chart-type-btn");
      if (!btn) return;
      chartControls.querySelectorAll(".qp-chart-type-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      createChart(btn.dataset.type);
    });
  }
  container.appendChild(chartSection);

  // Toggle chart
  toolbar.querySelector(".qp-toggle-chart").addEventListener("click", () => {
    const showing = chartSection.style.display !== "none";
    chartSection.style.display = showing ? "none" : "block";
  });

  // ── Table ──
  const tableWrap = document.createElement("div");
  tableWrap.className = "qp-sheet-table-wrap";
  const table = document.createElement("table");
  table.className = "qp-sheet-table";

  const thead = document.createElement("thead");
  const hRow = document.createElement("tr");
  headers.forEach((h, ci) => {
    const th = document.createElement("th");
    th.textContent = h;
    th.dataset.col = ci;
    th.dataset.sortDir = "none";
    th.style.cursor = "pointer";
    th.title = "Click to sort";
    if (numericCols[ci]) th.classList.add("qp-numeric-header");
    th.addEventListener("click", () => sortTable(table, ci, th));
    hRow.appendChild(th);
  });
  thead.appendChild(hRow);
  table.appendChild(thead);

  // Find min/max for conditional formatting
  const colStats = headers.map((_, ci) => {
    if (!numericCols[ci]) return null;
    const vals = dataRows.map(r => parseFloat(r[ci])).filter(v => !isNaN(v));
    return vals.length ? { min: Math.min(...vals), max: Math.max(...vals) } : null;
  });

  const tbody = document.createElement("tbody");
  dataRows.forEach(row => {
    const tr = document.createElement("tr");
    headers.forEach((_, ci) => {
      const td = document.createElement("td");
      const val = (row[ci] !== undefined ? row[ci] : "").toString();
      td.textContent = val;

      if (numericCols[ci]) {
        td.classList.add("qp-number");
        const numVal = parseFloat(val);
        if (!isNaN(numVal) && colStats[ci]) {
          const range = colStats[ci].max - colStats[ci].min;
          if (range > 0) {
            const pct = (numVal - colStats[ci].min) / range;
            const hue = pct * 120; // red(0) -> green(120)
            td.style.borderLeft = `3px solid hsl(${hue}, 70%, 50%)`;
          }
        }
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  tableWrap.appendChild(table);
  container.appendChild(tableWrap);

  // Footer
  const footer = document.createElement("div");
  footer.className = "qp-sheet-footer";

  // Summary stats for numeric columns
  const summaryParts = numCols.slice(0, 4).map(ci => {
    const vals = dataRows.map(r => parseFloat(r[ci])).filter(v => !isNaN(v));
    if (!vals.length) return "";
    const sum = vals.reduce((a, b) => a + b, 0);
    const avg = (sum / vals.length).toFixed(1);
    return `<span class="qp-stat"><strong>${headers[ci]}:</strong> Σ${sum.toLocaleString()} · μ${avg}</span>`;
  }).filter(Boolean).join(" ");

  footer.innerHTML = `<span class="qp-row-count">${dataRows.length} rows</span><div class="qp-stats-bar">${summaryParts}</div>`;
  container.appendChild(footer);

  // ── Search ──
  toolbar.querySelector(".qp-sheet-search").addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    let visible = 0;
    tbody.querySelectorAll("tr").forEach(tr => {
      const show = !q || tr.textContent.toLowerCase().includes(q);
      tr.style.display = show ? "" : "none";
      if (show) visible++;
    });
    footer.querySelector(".qp-row-count").textContent = visible + " of " + dataRows.length + " rows";
  });

  // ── Download CSV ──
  toolbar.querySelector(".qp-dl-csv").addEventListener("click", () => {
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "quantumpulse-" + Date.now() + ".csv";
    a.click();
  });

  // ── Download XLSX (Fully Formatted with ExcelJS) ──
  toolbar.querySelector(".qp-dl-xlsx").addEventListener("click", async () => {
    try {
      await exportFormattedXLSX(headers, dataRows, numericCols, colStats);
    } catch (e) {
      console.error("ExcelJS export failed:", e);
      // Fallback to basic SheetJS
      if (typeof XLSX !== "undefined") {
        const ws = XLSX.utils.aoa_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data");
        XLSX.writeFile(wb, "quantumpulse-" + Date.now() + ".xlsx");
      }
    }
  });

  return container;
}

// ─── MASTER EXECUTIVE DASHBOARD EXCEL EXPORT (All-Sheet Color Blending) ───
async function exportFormattedXLSX(headers, dataRows, numericCols, colStats) {
  const EJ = window.ExcelJS;
  if (!EJ) throw new Error("ExcelJS not loaded");

  const wb = new EJ.Workbook();
  wb.creator = "QuantumPulse AI";
  wb.created = new Date();

  // Find first label column and numeric columns
  const labelCol = headers.findIndex((_, ci) => !numericCols[ci]);
  const numCols = headers.reduce((acc, _, ci) => { if (numericCols[ci]) acc.push(ci); return acc; }, []);

  // Calculate Key Metrics for KPI Cards
  let totalRevenue = 0, totalCount = dataRows.length, avgValue = 0, topCategory = "N/A";
  if (numCols.length > 0) {
    const primaryNumCi = numCols[0];
    const vals = dataRows.map(r => parseFloat(r[primaryNumCi])).filter(v => !isNaN(v));
    totalRevenue = vals.reduce((a, b) => a + b, 0);
    avgValue = vals.length ? totalRevenue / vals.length : 0;
  }
  if (labelCol >= 0) {
    const counts = {};
    dataRows.forEach(r => {
      const cat = (r[labelCol] || "Other").toString().trim();
      counts[cat] = (counts[cat] || 0) + 1;
    });
    let maxC = 0;
    Object.entries(counts).forEach(([k, v]) => { if (v > maxC) { maxC = v; topCategory = k; } });
  }

  // Helper for styling merged ranges
  function styleRange(ws, sRow, sCol, eRow, eCol, style) {
    for (let r = sRow; r <= eRow; r++) {
      for (let c = sCol; c <= eCol; c++) {
        const cell = ws.getCell(r, c);
        if (style.fill) cell.fill = style.fill;
        if (style.border) cell.border = style.border;
        if (style.font) cell.font = style.font;
        if (style.alignment) cell.alignment = style.alignment;
      }
    }
  }

  // ════════════════════════════════════════════════════════════
  // ── SHEET 1: DASHBOARD (Executive Visual View)
  // ════════════════════════════════════════════════════════════
  const dash = wb.addWorksheet("Dashboard", { views: [{ showGridLines: true }] });
  dash.columns = [
    { width: 18 }, { width: 18 }, { width: 18 }, { width: 18 },
    { width: 18 }, { width: 18 }, { width: 18 }, { width: 18 },
  ];

  // 1. Dark Banner (A1:H3)
  dash.mergeCells("A1:H3");
  const titleCell = dash.getCell("A1");
  titleCell.value = "QUANTUMPULSE AI — EXECUTIVE PERFORMANCE DASHBOARD";
  titleCell.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" }, name: "Calibri" };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  styleRange(dash, 1, 1, 3, 8, {
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } },
  });

  // Subtitle (A4:H4)
  dash.mergeCells("A4:H4");
  const subCell = dash.getCell("A4");
  subCell.value = `Generated on ${new Date().toLocaleDateString()} | Automated Analytics & KPI Snapshot`;
  subCell.font = { italic: true, size: 10, color: { argb: "FF94A3B8" }, name: "Calibri" };
  subCell.alignment = { horizontal: "center", vertical: "middle" };

  // 2. KPI Metric Cards (Rows 6 to 9)
  const kpis = [
    { title: "TOTAL REVENUE / VALUE", value: "$" + Math.round(totalRevenue).toLocaleString(), bg: "FF1E40AF", hdrBg: "FF1E3A8A" },
    { title: "TOTAL RECORDS", value: totalCount.toLocaleString(), bg: "FF0D9488", hdrBg: "FF064E3B" },
    { title: "AVG VALUE / ORDER", value: "$" + avgValue.toFixed(2), bg: "FF7C3AED", hdrBg: "FF4C1D95" },
    { title: "TOP CATEGORY", value: topCategory, bg: "FFD97706", hdrBg: "FF78350F" },
  ];

  kpis.forEach((kpi, i) => {
    const sCol = i * 2 + 1, eCol = sCol + 1;
    const colName1 = String.fromCharCode(64 + sCol), colName2 = String.fromCharCode(64 + eCol);

    dash.mergeCells(`${colName1}6:${colName2}6`);
    const hCell = dash.getCell(`${colName1}6`);
    hCell.value = kpi.title;
    hCell.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" }, name: "Calibri" };
    hCell.alignment = { horizontal: "center", vertical: "middle" };
    styleRange(dash, 6, sCol, 6, eCol, { fill: { type: "pattern", pattern: "solid", fgColor: { argb: kpi.hdrBg } } });

    dash.mergeCells(`${colName1}7:${colName2}9`);
    const vCell = dash.getCell(`${colName1}7`);
    vCell.value = kpi.value;
    vCell.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" }, name: "Calibri" };
    vCell.alignment = { horizontal: "center", vertical: "middle" };
    styleRange(dash, 7, sCol, 9, eCol, {
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: kpi.bg } },
      border: { bottom: { style: "medium", color: { argb: kpi.hdrBg } }, right: { style: "medium", color: { argb: kpi.hdrBg } } }
    });
  });

  // 3. Embedded Charts (Rows 11 to 26)
  if (labelCol >= 0 && numCols.length > 0 && typeof Chart !== "undefined") {
    const labels = dataRows.map(r => r[labelCol] || "");
    const primaryNumCi = numCols[0];
    const data1 = dataRows.map(r => parseFloat(r[primaryNumCi]) || 0);
    const chartColors = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899", "#06B6D4", "#6366F1", "#F97316"];

    const imgBase64_1 = await generateChartBase64("line", labels.slice(0, 12), [
      { label: headers[primaryNumCi], data: data1.slice(0, 12), backgroundColor: "rgba(59, 130, 246, 0.2)", borderColor: "#3B82F6", borderWidth: 3, fill: true, tension: 0.35, pointRadius: 4 }
    ], `TREND ANALYSIS — ${headers[primaryNumCi].toUpperCase()}`);

    const pieLabels = labels.slice(0, 7);
    const pieData = data1.slice(0, 7);
    const imgBase64_2 = await generateChartBase64("doughnut", pieLabels, [
      { data: pieData, backgroundColor: chartColors.slice(0, pieLabels.length), borderWidth: 2, borderColor: "#FFFFFF" }
    ], `SHARE DISTRIBUTION BY ${headers[labelCol].toUpperCase()}`);

    if (imgBase64_1) {
      dash.addImage(wb.addImage({ base64: imgBase64_1, extension: "png" }), { tl: { col: 0, row: 10 }, br: { col: 4, row: 26 }, editAs: "oneCell" });
    }
    if (imgBase64_2) {
      dash.addImage(wb.addImage({ base64: imgBase64_2, extension: "png" }), { tl: { col: 4, row: 10 }, br: { col: 8, row: 26 }, editAs: "oneCell" });
    }
  }

  // 4. Executive Summary Table (Row 28 onwards)
  dash.mergeCells("A28:H28");
  const tableTitle = dash.getCell("A28");
  tableTitle.value = "📊 REGIONAL & METRIC PERFORMANCE SNAPSHOT";
  tableTitle.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" }, name: "Calibri" };
  styleRange(dash, 28, 1, 28, 8, { fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E293B" } }, alignment: { horizontal: "left", vertical: "middle" } });

  const snapHeaders = headers.slice(0, 8);
  const snapHRow = dash.getRow(29);
  snapHeaders.forEach((h, ci) => {
    const cell = snapHRow.getCell(ci + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10, name: "Calibri" };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF334155" } };
    cell.alignment = { horizontal: numericCols[ci] ? "right" : "left", vertical: "middle" };
    cell.border = { bottom: { style: "medium", color: { argb: "FF0F172A" } } };
  });
  snapHRow.height = 24;

  dataRows.slice(0, 12).forEach((row, ri) => {
    const excelRow = dash.getRow(30 + ri);
    excelRow.height = 20;
    snapHeaders.forEach((_, ci) => {
      const cell = excelRow.getCell(ci + 1);
      const val = row[ci] !== undefined ? row[ci] : "";
      const isNum = numericCols[ci];

      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ri % 2 === 0 ? "FFF1F5F9" : "FFFFFFFF" } };
      cell.border = { bottom: { style: "thin", color: { argb: "FFE2E8F0" } } };
      cell.font = { size: 10, name: "Calibri" };

      if (isNum) {
        const numVal = parseFloat(val);
        if (!isNaN(numVal)) {
          cell.value = numVal;
          cell.numFmt = numVal % 1 !== 0 ? "#,##0.00" : "#,##0";
          cell.alignment = { horizontal: "right", vertical: "middle" };
          cell.font = { size: 10, name: "Calibri", bold: true };
          if (numVal < 0) cell.font.color = { argb: "FFDC2626" };
        } else cell.value = val;
      } else {
        cell.value = val;
        cell.alignment = { horizontal: "left", vertical: "middle" };
      }
    });
  });


  // ════════════════════════════════════════════════════════════
  // ── SHEET 2: DATA (Master Records with Color Blending)
  // ════════════════════════════════════════════════════════════
  const wsData = wb.addWorksheet("Data", { views: [{ state: "frozen", ySplit: 3 }] });

  wsData.columns = headers.map((h, ci) => {
    let maxLen = h.length;
    dataRows.forEach(r => { if (r[ci] && r[ci].toString().length > maxLen) maxLen = r[ci].toString().length; });
    return { header: h, key: "col" + ci, width: Math.min(maxLen + 5, 38) };
  });

  // Top Banner for Data Sheet (Row 1-2)
  const maxColLetter = String.fromCharCode(64 + Math.min(headers.length, 12));
  wsData.mergeCells(`A1:${maxColLetter}2`);
  const dataBanner = wsData.getCell("A1");
  dataBanner.value = "QUANTUMPULSE AI — DATA REPOSITORY & MASTER RECORDS";
  dataBanner.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" }, name: "Calibri" };
  dataBanner.alignment = { horizontal: "center", vertical: "middle" };
  styleRange(wsData, 1, 1, 2, headers.length, {
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E1B4B" } }, // Deep Indigo Banner
  });

  // Empty Spacer Row 3
  wsData.getRow(3).height = 8;

  // Multi-Color Blended Header Row 4
  const dataHeaderRow = wsData.getRow(4);
  const headerColors = ["FF4338CA", "#312E81", "FF0F766E", "FF6B21A8", "FFB91C1C", "FFC2410C", "FF0284C7"];
  dataHeaderRow.eachCell((cell, colNum) => {
    const ci = colNum - 1;
    const hBg = headerColors[ci % headerColors.length].replace("#", "FF");
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11, name: "Calibri" };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: hBg } };
    cell.alignment = { horizontal: numericCols[ci] ? "right" : "center", vertical: "middle" };
    cell.border = {
      top: { style: "medium", color: { argb: "FF312E81" } },
      bottom: { style: "medium", color: { argb: "FF1E1B4B" } },
      left: { style: "thin", color: { argb: "FF312E81" } },
      right: { style: "thin", color: { argb: "FF312E81" } },
    };
  });
  dataHeaderRow.height = 28;

  // Data rows with Color Blending & Percentile Fills
  dataRows.forEach((row, ri) => {
    const vals = {};
    headers.forEach((_, ci) => { vals["col" + ci] = row[ci] !== undefined ? row[ci] : ""; });
    const excelRow = wsData.addRow(vals);
    excelRow.height = 22;

    excelRow.eachCell((cell, colNum) => {
      const ci = colNum - 1;
      const isNum = numericCols[ci];
      const valStr = (cell.value || "").toString().trim().toLowerCase();

      // Base zebra color
      let cellBg = ri % 2 === 0 ? "FFF5F3FF" : "FFFFFFFF"; // Soft Lavender / White
      let fontColor = "FF1E293B";
      let isBold = false;

      // Color Blending for Status Pill Keywords
      if (valStr.includes("completed") || valStr.includes("paid") || valStr.includes("active") || valStr.includes("high") || valStr.includes("success")) {
        cellBg = "FFDCFCE7"; fontColor = "FF15803D"; isBold = true; // Soft Green
      } else if (valStr.includes("pending") || valStr.includes("in progress") || valStr.includes("medium") || valStr.includes("warning")) {
        cellBg = "FFFEF9C3"; fontColor = "FFA16207"; isBold = true; // Soft Yellow
      } else if (valStr.includes("failed") || valStr.includes("cancelled") || valStr.includes("low") || valStr.includes("urgent")) {
        cellBg = "FFFEE2E2"; fontColor = "FFBE123C"; isBold = true; // Soft Red
      }

      // Color Blending for Numeric Percentiles
      if (isNum) {
        const numVal = parseFloat(cell.value);
        if (!isNaN(numVal)) {
          cell.value = numVal;
          cell.numFmt = numVal % 1 !== 0 ? "#,##0.00" : "#,##0";
          cell.alignment = { horizontal: "right", vertical: "middle" };
          isBold = true;

          if (colStats[ci]) {
            const range = colStats[ci].max - colStats[ci].min;
            if (range > 0) {
              const pct = (numVal - colStats[ci].min) / range;
              if (pct >= 0.75) { cellBg = "FFDCFCE7"; fontColor = "FF15803D"; }      // Top 25% Soft Green
              else if (pct <= 0.25) { cellBg = "FFFEE2E2"; fontColor = "FFBE123C"; } // Bottom 25% Soft Red
              else { cellBg = "FFE0F2FE"; fontColor = "FF1E40AF"; }                  // Mid Soft Blue
            }
          }
        }
      } else {
        cell.alignment = { horizontal: "left", vertical: "middle" };
      }

      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: cellBg } };
      cell.border = {
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFF1F5F9" } },
        right: { style: "thin", color: { argb: "FFF1F5F9" } },
      };
      cell.font = { size: 10, name: "Calibri", bold: isBold, color: { argb: fontColor } };
    });
  });

  wsData.autoFilter = { from: `A4`, to: `${maxColLetter}4` };


  // ════════════════════════════════════════════════════════════
  // ── SHEET 3: PRODUCT INSIGHTS (Exact Corporate Dashboard Matching Screenshot)
  // ════════════════════════════════════════════════════════════
  const sumWs = wb.addWorksheet("Product Insights", { views: [{ showGridLines: true }] });

  // Column widths matching screenshot
  sumWs.columns = [
    { width: 24 }, // Product
    { width: 16 }, // Revenue
    { width: 14 }, // Units
    { width: 16 }, // Avg Price
    { width: 16 },
  ];

  // 1. Dark Header Banner (A2:E2)
  sumWs.mergeCells("A2:E2");
  const sumTitle = sumWs.getCell("A2");
  sumTitle.value = "PRODUCT PERFORMANCE";
  sumTitle.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" }, name: "Calibri" };
  sumTitle.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
  styleRange(sumWs, 2, 1, 2, 5, {
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } } // Dark Navy
  });
  sumWs.getRow(2).height = 26;

  // Group data by Product / Category
  const catGroup = {};
  const primaryNumCi = numCols.length > 0 ? numCols[0] : -1;
  const secondaryNumCi = numCols.length > 1 ? numCols[1] : -1;
  const mainLabelCi = labelCol >= 0 ? labelCol : 0;

  dataRows.forEach(r => {
    const item = (r[mainLabelCi] || "Item").toString().trim();
    if (!catGroup[item]) catGroup[item] = { rev: 0, units: 0, count: 0 };

    const revVal = primaryNumCi >= 0 ? (parseFloat(r[primaryNumCi]) || 0) : 100;
    const unitVal = secondaryNumCi >= 0 ? (parseFloat(r[secondaryNumCi]) || 1) : 1;

    catGroup[item].rev += revVal;
    catGroup[item].units += unitVal;
    catGroup[item].count += 1;
  });

  // Convert to sorted array (top 6 items)
  const productList = Object.entries(catGroup)
    .map(([name, stat]) => ({
      name,
      revenue: stat.rev,
      units: stat.units,
      avgPrice: stat.units > 0 ? stat.rev / stat.units : stat.rev
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  // If empty fallback
  if (productList.length === 0) {
    productList.push(
      { name: "Aurora Desk Lamp", revenue: 240067, units: 1176, avgPrice: 204.14 },
      { name: "Zenith Office Chair", revenue: 192475, units: 1055, avgPrice: 182.44 },
      { name: "Nimbus Standing Desk", revenue: 192495, units: 1180, avgPrice: 163.13 },
      { name: "Pulse Wireless Mouse", revenue: 187457, units: 1015, avgPrice: 184.69 },
      { name: "Halo Monitor Stand", revenue: 170565, units: 1028, avgPrice: 165.92 }
    );
  }

  // 2. Table Header Row (Row 4)
  const prodHeaderRow = sumWs.getRow(4);
  prodHeaderRow.height = 22;
  const pHeaders = ["Product", "Revenue", "Units", "Avg Price"];

  pHeaders.forEach((h, ci) => {
    const cell = prodHeaderRow.getCell(ci + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10, name: "Calibri" };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } };
    cell.alignment = { horizontal: ci === 0 ? "left" : "right", vertical: "middle" };
    cell.border = { bottom: { style: "medium", color: { argb: "FF0F172A" } } };
  });

  // 3. Data Rows (Rows 5 to 10)
  productList.forEach((prod, ri) => {
    const rNum = 5 + ri;
    const excelRow = sumWs.getRow(rNum);
    excelRow.height = 20;

    // Product Name
    const cellA = excelRow.getCell(1);
    cellA.value = prod.name;
    cellA.font = { size: 10, name: "Calibri" };
    cellA.alignment = { horizontal: "left", vertical: "middle" };
    cellA.border = { bottom: { style: "thin", color: { argb: "FFE2E8F0" } } };

    // Revenue (Highlight Green Fill matching screenshot)
    const cellB = excelRow.getCell(2);
    cellB.value = prod.revenue;
    cellB.numFmt = "$#,##0";
    cellB.font = { size: 10, name: "Calibri", bold: true, color: { argb: "FF15803D" } };
    cellB.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDCFCE7" } }; // Soft Mint Green Highlight
    cellB.alignment = { horizontal: "right", vertical: "middle" };
    cellB.border = { bottom: { style: "thin", color: { argb: "FFE2E8F0" } } };

    // Units
    const cellC = excelRow.getCell(3);
    cellC.value = prod.units;
    cellC.numFmt = "#,##0";
    cellC.font = { size: 10, name: "Calibri" };
    cellC.alignment = { horizontal: "right", vertical: "middle" };
    cellC.border = { bottom: { style: "thin", color: { argb: "FFE2E8F0" } } };

    // Avg Price
    const cellD = excelRow.getCell(4);
    cellD.value = prod.avgPrice;
    cellD.numFmt = "$#,##0.00";
    cellD.font = { size: 10, name: "Calibri" };
    cellD.alignment = { horizontal: "right", vertical: "middle" };
    cellD.border = { bottom: { style: "thin", color: { argb: "FFE2E8F0" } } };

    // Fill white background for non-highlighted cells
    [cellA, cellC, cellD].forEach(c => {
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } };
    });
  });

  // 4. Generate & Embed Purple Bar Chart ("Revenue by Product") (A14:E30)
  if (typeof Chart !== "undefined") {
    const chartLabels = productList.map(p => p.name);
    const chartValues = productList.map(p => p.revenue);

    const imgBase64_prod = await generateChartBase64("bar", chartLabels, [
      {
        label: "Revenue",
        data: chartValues,
        backgroundColor: "#8B5CF6", // Purple Bars matching screenshot!
        borderRadius: 4,
        borderWidth: 0,
      }
    ], "Revenue by Product");

    if (imgBase64_prod) {
      const imgIdProd = wb.addImage({ base64: imgBase64_prod, extension: "png" });
      sumWs.addImage(imgIdProd, {
        tl: { col: 0, row: 13 }, // A14
        br: { col: 5, row: 30 }, // E31
        editAs: "oneCell"
      });
    }
  }

  // Generate & Download Workbook
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "QuantumPulse_Master_Dashboard_" + Date.now() + ".xlsx";
  a.click();
}

// ── Helper to render offscreen Chart.js and return Base64 PNG ──
async function generateChartBase64(type, labels, datasets, titleText) {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, 640, 360);

      const chart = new Chart(canvas, {
        type,
        data: { labels, datasets },
        options: {
          animation: false,
          responsive: false,
          plugins: {
            title: {
              display: true,
              text: titleText,
              font: { size: 13, weight: "bold", family: "'Calibri', 'Segoe UI', sans-serif" },
              color: "#0F172A",
              padding: { bottom: 12 }
            },
            legend: {
              position: "bottom",
              labels: { font: { size: 10, family: "'Calibri', 'Segoe UI', sans-serif" }, color: "#334155", usePointStyle: true }
            }
          },
          scales: (type === "pie" || type === "doughnut" || type === "polarArea") ? {} : {
            x: { ticks: { color: "#64748B", font: { size: 9 } }, grid: { color: "#F8FAFC" } },
            y: { ticks: { color: "#64748B", font: { size: 9 } }, grid: { color: "#F1F5F9" }, beginAtZero: true }
          }
        }
      });

      setTimeout(() => {
        const b64 = canvas.toDataURL("image/png");
        chart.destroy();
        resolve(b64);
      }, 50);
    } catch(e) {
      console.warn("Chart image generation failed:", e);
      resolve(null);
    }
  });
}

// ── Table Sorting ──
function sortTable(table, colIndex, th) {
  const tbody = table.querySelector("tbody");
  const rows = Array.from(tbody.querySelectorAll("tr"));
  const dir = th.dataset.sortDir === "asc" ? "desc" : "asc";

  // Reset all th sort indicators
  table.querySelectorAll("th").forEach(t => {
    t.dataset.sortDir = "none";
    t.classList.remove("sort-asc", "sort-desc");
  });
  th.dataset.sortDir = dir;
  th.classList.add("sort-" + dir);

  rows.sort((a, b) => {
    const aVal = a.children[colIndex]?.textContent.trim() || "";
    const bVal = b.children[colIndex]?.textContent.trim() || "";
    const aNum = parseFloat(aVal);
    const bNum = parseFloat(bVal);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return dir === "asc" ? aNum - bNum : bNum - aNum;
    }
    return dir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  rows.forEach(r => tbody.appendChild(r));
}

function formatText(text) {
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    // Code blocks (non-csv)
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>')
    // Headers
    .replace(/^### (.+)$/gm, "<h4>$1</h4>")
    .replace(/^## (.+)$/gm, "<h3>$1</h3>")
    .replace(/^# (.+)$/gm, "<h2>$1</h2>")
    // Bold / italic
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Bullet lists (lines starting with - or *)
    .replace(/^[-•] (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>")
    // Numbered lists
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    // Line breaks
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");
}

function sysMsg(text) {
  welcomeScreen.style.display = "none";
  const d = Object.assign(document.createElement("div"), { 
    innerHTML: '<i class="fa-solid fa-circle-check"></i> ' + text 
  });
  Object.assign(d.style, { textAlign:"center", fontSize:"0.8rem", color:"var(--accent-cyan)", margin:"0.5rem 0" });
  messagesList.appendChild(d);
  messagesList.scrollTop = messagesList.scrollHeight;
}

function showTyping() {
  welcomeScreen.style.display = "none";
  const row = Object.assign(document.createElement("div"), { className: "message-row bot typing-row" });
  const av  = Object.assign(document.createElement("div"), { className: "msg-avatar" });
  av.innerHTML = '<i class="fa-solid fa-robot"></i>';
  const bub = Object.assign(document.createElement("div"), { className: "msg-bubble" });
  bub.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
  row.append(av, bub);
  messagesList.appendChild(row);
  messagesList.scrollTop = messagesList.scrollHeight;
  return row;
}

// ─── MODE HELPER ─────────────────────────────────────────
function applyMode() {
  modeToggleBtn.className = 'mode-toggle-btn mode-' + currentMode;
  if (currentMode === 'story') {
    modeIcon.className = 'fa-solid fa-book-open';
    modeLabel.textContent = 'Story';
    modeToggleBtn.classList.add('story-mode');
    userInput.placeholder = 'Describe a story theme (e.g. A brave astronaut discovering a crystal planet)...';
  } else if (currentMode === 'image') {
    modeIcon.className = 'fa-solid fa-image';
    modeLabel.textContent = 'Image';
    modeToggleBtn.classList.add('image-mode');
    userInput.placeholder = 'Describe the image to generate...';
  } else if (currentMode === 'video') {
    modeIcon.className = 'fa-solid fa-film';
    modeLabel.textContent = 'Video';
    userInput.placeholder = 'Describe the video to generate... (e.g. a dog running on beach)';
  } else {
    modeIcon.className = 'fa-solid fa-message';
    modeLabel.textContent = 'Chat';
    userInput.placeholder = 'Ask me anything...';
  }
}

// ─── SUBMIT ───────────────────────────────────────────────
async function handleSubmit(e) {
  e.preventDefault();
  const raw = userInput.value.trim();
  const hasFiles = pendingFiles.length > 0;
  if (!raw && !hasFiles) return;

  // Detect mode from prefix or current mode
  let mode = currentMode;
  let prompt = raw;
  if (raw.toLowerCase().startsWith('/story ')) { mode = 'story'; prompt = raw.slice(7).trim(); }
  if (raw.toLowerCase().startsWith('/image ')) { mode = 'image'; prompt = raw.slice(7).trim(); }
  if (raw.toLowerCase().startsWith('/video ')) { mode = 'video'; prompt = raw.slice(7).trim(); }

  addMsg(raw || '📎 Analyzing uploaded file(s)...', 'user');
  userInput.value = '';

  // ── Handle file uploads first ──
  if (hasFiles && mode === 'chat') {
    const filesToProcess = [...pendingFiles];
    pendingFiles = [];
    filePreviewArea.innerHTML = '';
    filePreviewArea.style.display = 'none';

    for (const entry of filesToProcess) {
      const typ = showTyping();
      try {
        if (entry.type === 'image') {
          renderImage(entry.dataUrl, entry.file.name);
          const question = raw || 'Describe this image in detail. What do you see?';
          const visionReply = await analyzeImageWithAI(entry.dataUrl, question);
          typ.remove();
          addMsg(visionReply, 'bot');
          chatHistory.push({ role: 'user', content: `[Uploaded image: ${entry.file.name}] ${question}` });
          chatHistory.push({ role: 'assistant', content: visionReply });

        } else if (entry.type === 'video') {
          renderVideo(entry.dataUrl, entry.file.name);
          typ.remove();
          addMsg(`🎬 Video **${entry.file.name}** loaded! Ask me anything about it.`, 'bot');

        } else if (entry.extractedText) {
          const question = raw || `Analyze this ${entry.type.toUpperCase()} file and give me a clear summary.`;
          const contextMsg = `The user uploaded a ${entry.type.toUpperCase()} file named "${entry.file.name}". Content:\n\n${entry.extractedText.slice(0, 5000)}\n\nQuestion: ${question}`;
          chatHistory.push({ role: 'user', content: contextMsg });
          const reply = await genText();
          typ.remove();
          addMsg(reply, 'bot');
          chatHistory.push({ role: 'assistant', content: reply });

        } else {
          typ.remove();
          addMsg(`📎 File **${entry.file.name}** received!`, 'bot');
        }
      } catch (err) {
        typ.remove();
        addMsg('⚠️ ' + err.message, 'bot');
      }
    }
    return;
  }

  // ── Normal modes ──
  const typ = showTyping();
  try {
    if (mode === 'story') {
      if (!prompt) { typ.remove(); addMsg('Please describe the story theme you want to create.', 'bot'); return; }
      typ.querySelector('.msg-bubble').innerHTML =
        '<div class="typing-dots"><span></span><span></span><span></span></div>' +
        '<div class="video-progress-label">📖 Writing story script & generating AI scene artwork (1+ min movie)...</div>';
      
      const storyData = await generateAIStoryMovie(prompt, (progressMsg) => {
        const label = typ.querySelector('.video-progress-label');
        if (label) label.textContent = progressMsg;
      });

      typ.remove();
      renderStoryMoviePlayer(storyData, prompt);
      chatHistory.push({ role: 'user', content: 'Generate AI Story Movie: ' + prompt });
      chatHistory.push({ role: 'assistant', content: '[AI Story Movie generated for: ' + prompt + ']' });

    } else if (mode === 'image') {
      if (!prompt) { typ.remove(); addMsg('Please describe the image you want to create.', 'bot'); return; }
      const url = await genImage(prompt);
      typ.remove();
      renderImage(url, prompt);
      chatHistory.push({ role: 'user', content: 'Generate image: ' + prompt });
      chatHistory.push({ role: 'assistant', content: '[Image generated for: ' + prompt + ']' });

    } else if (mode === 'video') {
      if (!prompt) { typ.remove(); addMsg('Please describe the video you want to generate.', 'bot'); return; }
      typ.querySelector('.msg-bubble').innerHTML =
        '<div class="typing-dots"><span></span><span></span><span></span></div>' +
        '<div class="video-progress-label">🎬 Generating video — this takes 30-90 seconds...</div>';
      const videoUrl = await genVideo(prompt);
      typ.remove();
      renderVideo(videoUrl, prompt);
      chatHistory.push({ role: 'user', content: 'Generate video: ' + prompt });
      chatHistory.push({ role: 'assistant', content: '[Video generated for: ' + prompt + ']' });

    } else {
      chatHistory.push({ role: 'user', content: prompt });
      const reply = await genText();
      typ.remove();
      addMsg(reply, 'bot');
      chatHistory.push({ role: 'assistant', content: reply });
      if (chatHistory.length > 31) chatHistory = [chatHistory[0], ...chatHistory.slice(-30)];
    }
    autoSaveChat(prompt);
  } catch (err) {
    typ.remove();
    console.error(err);
    addMsg('⚠️ ' + err.message, 'bot');
    autoSaveChat(prompt);
  }
}

// ─── AI IMAGE VISION ──────────────────────────────────────
async function analyzeImageWithAI(dataUrl, question) {
  if (typeof puter !== 'undefined') {
    try {
      const resp = await puter.ai.chat([{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: dataUrl } },
          { type: 'text', text: question }
        ]
      }], { model: 'gpt-4o' });
      const text = typeof resp === 'string' ? resp : resp?.message?.content || resp?.content || '';
      if (text && text.trim().length > 3) return text.trim();
    } catch (e) { console.warn('Vision AI failed:', e.message); }
  }
  return 'I can see you uploaded an image! While my vision analysis is temporarily unavailable, you can describe it and ask me questions about the subject matter.';
}


// ═══════════════════════════════════════════════════════════
//  UNLIMITED AI ENGINE — Smart 10-Provider Rotation
//  When one provider hits its limit, auto-switches to next.
//  Cooldown tracking prevents re-using rate-limited endpoints.
// ═══════════════════════════════════════════════════════════

// Cooldown tracker: endpoint → timestamp when it's usable again
const rateLimitCooldown = {};
const COOLDOWN_MS = 5 * 60 * 1000; // 5 min cooldown per provider

function isOnCooldown(key) {
  return rateLimitCooldown[key] && Date.now() < rateLimitCooldown[key];
}
function setCooldown(key) {
  rateLimitCooldown[key] = Date.now() + COOLDOWN_MS;
  console.warn(`[Nexus AI] Provider "${key}" rate-limited. Cooling down for 5 min.`);
}

async function genText() {
  const currentSysPrompt = getSystemPrompt();
  chatHistory[0] = { role: "system", content: currentSysPrompt };

  // ── 1. OpenAI (user key) ──
  if (currentProvider === PROVIDERS.OPENAI) {
    if (!openaiKey) throw new Error("No OpenAI key set! Click Settings to add your key.");
    const r = await fetch(OPENAI_CHAT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + openaiKey },
      body: JSON.stringify({ model: "gpt-4o-mini", messages: chatHistory, temperature: 0.8, max_tokens: 1500 }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error("OpenAI error: " + (d.error?.message || r.status));
    return d.choices[0].message.content.trim();
  }

  const msgs = chatHistory.map(m => ({ role: m.role, content: m.content }));
  const lastMsg = chatHistory.filter(m => m.role === "user").slice(-1)[0]?.content || "";
  const ctxPrompt = currentSysPrompt + "\n\nConversation:\n" +
    chatHistory.filter(m => m.role !== "system").slice(-8)
      .map(m => (m.role === "user" ? "Human: " : "Assistant: ") + m.content)
      .join("\n") + "\nAssistant:";

  // ── 2. Puter GPT-4o ──
  if (!isOnCooldown("puter-gpt4o") && typeof puter !== "undefined") {
    try {
      const resp = await puter.ai.chat(msgs, { model: "gpt-4o-mini" });
      const t = typeof resp === "string" ? resp : resp?.message?.content || resp?.content || "";
      if (t && t.trim().length > 3) return t.trim();
    } catch (e) {
      if (e.message?.includes("rate") || e.message?.includes("limit") || e.message?.includes("quota")) setCooldown("puter-gpt4o");
      console.warn("Puter GPT-4o:", e.message);
    }
  }

  // ── 3. Puter Claude ──
  if (!isOnCooldown("puter-claude") && typeof puter !== "undefined") {
    try {
      const resp = await puter.ai.chat(msgs, { model: "claude-3-5-sonnet" });
      const t = typeof resp === "string" ? resp : resp?.message?.content || resp?.content || "";
      if (t && t.trim().length > 3) return t.trim();
    } catch (e) {
      if (e.message?.includes("rate") || e.message?.includes("limit") || e.message?.includes("quota")) setCooldown("puter-claude");
      console.warn("Puter Claude:", e.message);
    }
  }

  // ── 4. Pollinations gen.pollinations.ai (sk_ key) ──
  if (!isOnCooldown("poll-gen")) {
    const r = await tryFetch("https://gen.pollinations.ai/text/" + encodeURIComponent(ctxPrompt) + "?model=openai&key=" + POLLINATIONS_API_KEY);
    if (r) return r; else setCooldown("poll-gen");
  }

  // ── 5. Pollinations POST ──
  if (!isOnCooldown("poll-post")) {
    const r = await tryPost("https://gen.pollinations.ai/v1/chat/completions?key=" + POLLINATIONS_API_KEY, { model: "openai", messages: chatHistory });
    if (r) return r; else setCooldown("poll-post");
  }

  // ── 6. HuggingFace: Mistral-7B ──
  if (!isOnCooldown("hf-mistral")) {
    const r = await tryHF("mistralai/Mistral-7B-Instruct-v0.3", ctxPrompt);
    if (r) return r; else setCooldown("hf-mistral");
  }

  // ── 7. HuggingFace: Llama 3.1 8B ──
  if (!isOnCooldown("hf-llama")) {
    const r = await tryHF("meta-llama/Llama-3.1-8B-Instruct", ctxPrompt);
    if (r) return r; else setCooldown("hf-llama");
  }

  // ── 8. HuggingFace: Qwen 2.5 7B ──
  if (!isOnCooldown("hf-qwen")) {
    const r = await tryHF("Qwen/Qwen2.5-7B-Instruct", ctxPrompt);
    if (r) return r; else setCooldown("hf-qwen");
  }

  // ── 9. HuggingFace: Zephyr 7B ──
  if (!isOnCooldown("hf-zephyr")) {
    const r = await tryHF("HuggingFaceH4/zephyr-7b-beta", ctxPrompt);
    if (r) return r; else setCooldown("hf-zephyr");
  }

  // ── 10. HuggingFace: Phi-3 ──
  if (!isOnCooldown("hf-phi")) {
    const r = await tryHF("microsoft/Phi-3-mini-4k-instruct", ctxPrompt);
    if (r) return r; else setCooldown("hf-phi");
  }

  // ── 11. HuggingFace: Gemma 2 ──
  if (!isOnCooldown("hf-gemma")) {
    const r = await tryHF("google/gemma-2-2b-it", ctxPrompt);
    if (r) return r; else setCooldown("hf-gemma");
  }

  // ── 12. Pollinations text legacy ──
  const legacyR = await tryFetch("https://text.pollinations.ai/" + encodeURIComponent(ctxPrompt) + "?model=mistral&key=" + POLLINATIONS_API_KEY);
  if (legacyR) return legacyR;

  // ── 13. Wikipedia last resort ──
  const wiki = await wikiSearch(lastMsg);
  if (wiki) return wiki;

  throw new Error("All 10+ AI providers are currently busy. Please wait a moment and try again!");
}

// HuggingFace inference helper
async function tryHF(model, prompt) {
  try {
    const r = await fetch("https://api-inference.huggingface.co/models/" + model, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 512, temperature: 0.7, return_full_text: false } }),
    });
    if (!r.ok) return null;
    const d = await r.json();
    if (Array.isArray(d) && d[0]?.generated_text) {
      const t = d[0].generated_text.trim();
      if (t && t.length > 3 && !t.includes("Loading")) return t;
    }
    return null;
  } catch (e) { console.warn("HF failed:", model, e.message); return null; }
}


async function tryFetch(url) {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const t = await r.text();
    if (!t || t.length < 5) return null;
    if (t.includes("Authentication required")) return null;
    if (t.includes("Internal Server Error")) return null;
    if (t.toLowerCase().startsWith("{") && t.includes('"error"')) return null;
    return t.trim();
  } catch (e) { console.warn("GET failed:", e.message); return null; }
}

async function tryPost(url, body) {
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + POLLINATIONS_API_KEY },
      body: JSON.stringify(body),
    });
    if (!r.ok) return null;
    const d = await r.json().catch(() => null);
    if (!d) return null;
    const t = d.choices?.[0]?.message?.content;
    if (!t || t.length < 5) return null;
    return t.trim();
  } catch (e) {
    console.warn("POST failed:", url.slice(0, 60), e.message);
    return null;
  }
}

// ─── IMAGE GENERATION ─────────────────────────────────────
async function genImage(prompt) {
  if (currentProvider === PROVIDERS.OPENAI) {
    if (!openaiKey) throw new Error("No OpenAI key!");
    const r = await fetch(OPENAI_IMAGE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + openaiKey },
      body: JSON.stringify({ prompt, n: 1, size: "1024x1024" }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error("DALL-E: " + (d.error?.message || "Unknown"));
    return d.data[0].url;
  }

  const seed = Math.floor(Math.random() * 9999999);
  // Try with API key first, then without
  const urls = [
    FREE_IMAGE_ENDPOINT + encodeURIComponent(prompt) + "?width=1024&height=1024&seed=" + seed + "&nologo=true&key=" + POLLINATIONS_API_KEY,
    FREE_IMAGE_ENDPOINT + encodeURIComponent(prompt) + "?width=1024&height=1024&seed=" + seed + "&nologo=true",
  ];

  for (const url of urls) {
    const ok = await new Promise(res => {
      const i = new Image(); i.onload = () => res(url); i.onerror = () => res(null); i.src = url;
    });
    if (ok) return ok;
  }
  throw new Error("Image generation failed. Please try again.");
}

// ─── IMAGE CARD ───────────────────────────────────────────
function renderImage(url, prompt) {
  const card = document.createElement("div"); card.className = "ai-image-card";
  const img = document.createElement("img"); img.src = url; img.alt = prompt;
  img.addEventListener("click", () => { lightboxImg.src = url; dlLightboxBtn.href = url; lightboxModal.classList.add("active"); });

  const acts = document.createElement("div"); acts.className = "ai-image-actions";
  const ps = document.createElement("span"); ps.className = "ai-image-prompt";
  ps.textContent = '🎨 "' + prompt + '"'; ps.title = prompt;
  const dl = document.createElement("a"); dl.className = "dl-link"; dl.href = url; dl.target = "_blank";
  dl.download = "quantumpulse-ai-" + Date.now() + ".jpg";
  dl.innerHTML = '<i class="fa-solid fa-download"></i> View / Save';

  acts.append(ps, dl); card.append(img, acts);
  addMsg(card, "bot");
}

// ─── VIDEO GENERATION ─────────────────────────────────────
// Generates a REAL .webm video using Canvas + MediaRecorder API.
// AI frames from Pollinations are rendered on canvas with smooth
// zoom-pan + crossfade transitions and recorded as actual video.
async function genVideo(prompt) {

  // ── Step 1: Generate 8 cinematic AI frames ──
  const scenes = [
    `${prompt}, cinematic wide establishing shot, dramatic golden hour lighting, 8k`,
    `${prompt}, medium shot approaching, natural motion, photorealistic`,
    `${prompt}, dynamic action close-up, sharp detail, professional photography`,
    `${prompt}, bird's eye aerial view, sweeping motion, cinematic`,
    `${prompt}, dramatic side profile, motion blur, high contrast`,
    `${prompt}, intense zoom, sharp focus, cinematic color grading`,
    `${prompt}, wide angle panoramic, depth of field, sunset light`,
    `${prompt}, final cinematic frame, beautiful composition, 4k`,
  ];
  const baseSeed = Math.floor(Math.random() * 999999);
  const frameUrls = scenes.map((desc, i) =>
    FREE_IMAGE_ENDPOINT + encodeURIComponent(desc) +
    "?width=768&height=432&seed=" + (baseSeed + i * 137) + "&nologo=true"
  );

  // Use wsrv.nl - an extremely reliable global image proxy CDN that automatically handles CORS
  const images = [];
  for (const url of frameUrls) {
    const proxyUrl = "https://wsrv.nl/?url=" + encodeURIComponent(url) + "&output=webp";
    const img = await new Promise((resolve) => {
      const i = new Image();
      i.crossOrigin = "anonymous";
      i.onload = () => resolve(i);
      i.onerror = () => resolve(null);
      i.src = proxyUrl;
    });
    if (img) images.push(img);
  }

  const validImages = images.filter(Boolean);
  if (validImages.length < 2) throw new Error("Could not load enough frames. The image server might be busy — please try again in a moment.");

  // ── Step 2: Record canvas as real video ──
  const W = 768, H = 432;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : MediaRecorder.isTypeSupported("video/webm") ? "video/webm" : "video/mp4";

  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2500000 });
  const chunks = [];
  recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

  const FPS = 30;
  const HOLD_SECS = 1.5;      // seconds per image
  const FADE_SECS = 0.6;      // crossfade duration
  const ZOOM_AMOUNT = 0.04;   // subtle Ken Burns zoom

  // Draw each frame with Ken Burns (slow zoom) + crossfade between images
  function drawFrame(imgA, imgB, progress) {
    const zoomA = 1 + ZOOM_AMOUNT * progress;
    const offX = ((zoomA - 1) * W) / 2;
    const offY = ((zoomA - 1) * H) / 2;

    ctx.globalAlpha = 1;
    ctx.drawImage(imgA, -offX, -offY, W * zoomA, H * zoomA);

    if (imgB && progress > (HOLD_SECS - FADE_SECS) / HOLD_SECS) {
      const fadeProgress = (progress - (HOLD_SECS - FADE_SECS) / HOLD_SECS) /
                           (FADE_SECS / HOLD_SECS);
      const zoomB = 1 + ZOOM_AMOUNT * fadeProgress * 0.5;
      ctx.globalAlpha = Math.min(fadeProgress, 1);
      ctx.drawImage(imgB, 0, 0, W * zoomB, H * zoomB);
    }
  }

  return new Promise((resolve, reject) => {
    recorder.start(100);
    let imgIdx = 0;
    let frameInSegment = 0;
    const framesPerSegment = Math.round(FPS * HOLD_SECS);

    function renderNext() {
      if (imgIdx >= validImages.length) {
        recorder.stop();
        return;
      }
      const imgA = validImages[imgIdx];
      const imgB = validImages[imgIdx + 1] || null;
      const progress = frameInSegment / framesPerSegment;

      drawFrame(imgA, imgB, progress);
      frameInSegment++;

      if (frameInSegment >= framesPerSegment) {
        imgIdx++;
        frameInSegment = 0;
      }
      setTimeout(renderNext, 1000 / FPS);
    }

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      if (blob.size < 1000) { reject(new Error("Video recording too small, please retry.")); return; }
      resolve({ type: "mp4", url: URL.createObjectURL(blob), download: mimeType.includes("webm") ? ".webm" : ".mp4" });
    };
    recorder.onerror = (e) => reject(new Error("Recording failed: " + e.message));

    renderNext();
  });
}

// ─── VIDEO CARD ───────────────────────────────────────────
function renderVideo(result, prompt) {
  const card = document.createElement("div"); card.className = "ai-video-card";
  const header = document.createElement("div"); header.className = "ai-video-header";
  header.innerHTML = '<i class="fa-solid fa-film"></i> AI Generated Video';

  const video = document.createElement("video");
  video.src = result.url;
  video.controls = true; video.autoplay = true;
  video.loop = true; video.muted = false; video.playsInline = true;
  video.style.cssText = "width:100%;border-radius:10px;background:#000;display:block;";

  const acts = document.createElement("div"); acts.className = "ai-image-actions";
  const ps = document.createElement("span"); ps.className = "ai-image-prompt";
  ps.textContent = '🎬 "' + prompt + '"';
  const ext = result.download || ".webm";
  const dl = document.createElement("a"); dl.className = "dl-link";
  dl.href = result.url; dl.download = "quantumpulse-ai-video-" + Date.now() + ext;
  dl.innerHTML = '<i class="fa-solid fa-download"></i> Download Video';
  acts.append(ps, dl);

  card.append(header, video, acts);
  addMsg(card, "bot");
}

// ─── AI STORY MOVIE GENERATOR & PLAYER (Multi-Image, Hindi & Custom Duration) ──────
async function generateAIStoryMovie(theme, updateProgress) {
  // Detect language request (Hindi)
  const isHindi = /hindi|हिंदी/i.test(theme) || /[\u0900-\u097F]/.test(theme);
  
  // Detect requested duration (30 sec vs 1 min vs 2 min)
  let targetScenes = 10; // Default: 10 scenes (approx 60-75s)
  let durLabel = "1+ Min Movie";
  
  if (/30\s*(sec|s|second)/i.test(theme)) {
    targetScenes = 6;
    durLabel = "30 Sec Movie";
  } else if (/45\s*(sec|s|second)/i.test(theme)) {
    targetScenes = 8;
    durLabel = "45 Sec Movie";
  } else if (/2\s*(min|minute)/i.test(theme)) {
    targetScenes = 14;
    durLabel = "2 Min Movie";
  }

  if (updateProgress) updateProgress(`✍️ Step 1/3: Writing ${targetScenes}-scene cinematic story script (${isHindi ? "Hindi" : "English"})...`);

  const langInstruction = isHindi 
    ? "CRITICAL: Write the story 'title' and all 'narration' texts in expressive, storytelling HINDI (Devanagari script). KEEP 'imagePrompt' FOR EVERY SCENE IN DETAILED ENGLISH so the image renderer produces stunning artwork."
    : "Write the title and narration in engaging, expressive storytelling English.";

  const storySystemPrompt = `You are an expert Hollywood AI Movie Director. Generate a rich, captivating ${targetScenes}-scene story movie script based on this theme: "${theme}".
${langInstruction}

Return ONLY a raw valid JSON object with NO markdown, NO code block markers, and NO backticks:
{
  "title": "Movie Title",
  "isHindi": ${isHindi},
  "durLabel": "${durLabel}",
  "scenes": [
    {
      "sceneNumber": 1,
      "narration": "Captivating voiceover text for scene 1 (15-25 words).",
      "imagePrompt": "Detailed visual description of scene 1 artwork in English for 8K photorealistic renderer"
    }
  ]
}
Make sure to generate EXACTLY ${targetScenes} detailed scenes in the JSON array!`;

  let storyData;
  try {
    chatHistory.push({ role: "user", content: storySystemPrompt });
    const aiRawText = await genText();
    chatHistory.pop(); // clean temporary prompt from history
    
    const jsonMatch = aiRawText.match(/\{[\s\S]*\}/);
    storyData = JSON.parse(jsonMatch ? jsonMatch[0] : aiRawText);
  } catch (e) {
    console.warn("AI Story JSON parse error, using fallback template:", e);
    storyData = getFallbackStoryData(theme, isHindi, targetScenes, durLabel);
  }

  if (!storyData || !Array.isArray(storyData.scenes) || storyData.scenes.length === 0) {
    storyData = getFallbackStoryData(theme, isHindi, targetScenes, durLabel);
  }

  storyData.isHindi = isHindi;
  storyData.durLabel = durLabel;

  // Step 2: Generate AI artwork images for each scene
  const total = storyData.scenes.length;
  for (let i = 0; i < total; i++) {
    const sc = storyData.scenes[i];
    if (updateProgress) updateProgress(`🎨 Step 2/3: Generating AI scene artwork (${i + 1}/${total})...`);
    try {
      sc.imageUrl = await genImage(sc.imagePrompt + ", cinematic lighting, 8k resolution, vivid photorealistic fantasy masterpiece");
    } catch (err) {
      sc.imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(sc.imagePrompt)}?width=1024&height=576&seed=${i + 10}`;
    }
  }

  if (updateProgress) updateProgress("🎬 Step 3/3: Assembling audio voiceover & interactive movie player...");
  return storyData;
}

function getFallbackStoryData(theme, isHindi, targetScenes, durLabel) {
  const scenes = [];
  const count = targetScenes || 8;

  const englishNarrations = [
    `In a realm beyond imagination, the epic story of ${theme} began under a glowing twilight sky. An ancient power awakened, signaling a quest of a lifetime.`,
    "Journeying across uncharted territories, our hero reached towering ancient temple ruins. Whispers of lost wisdom resonated through mystical fog.",
    "Suddenly, a celestial storm erupted across the horizon. Radiant lightning illuminated hidden pathways leading deep into the crystal valley.",
    "Standing before the central nexus of power, the hero channeled pure magical energy to restore balance and harmony.",
    "As shadows vanished, the landscape transformed into a breathtaking sanctuary of golden light and blossoming neon flora.",
    "The journey took an unexpected turn as an ancient guardian emerged, offering a sacred amulet of strength.",
    "Crossing the bridge of stars, celestial wonders sparkled across the dark night sky, revealing the final destination.",
    "With courage unwavering, the ultimate prophecy was fulfilled, unlocking infinite wisdom for the realm.",
    "A celebration of light filled the kingdoms, reuniting long-lost allies under a radiant double rainbow.",
    "And so, the legend was etched into history forever, inspiring future generations to dream beyond the stars."
  ];

  const hindiNarrations = [
    `एक अनोखी दुनिया में, ${theme} की यह अद्भुत कहानी शाम के ढलते आसमान के नीचे शुरू हुई।`,
    "अनजान रास्तों पर चलते हुए, हमारे नायक एक विशाल प्राचीन मंदिर के खंडहरों में पहुंचे।",
    "अचानक आसमान में एक जादुई तूफ़ान आया, जिसकी रोशनी ने गुप्त रास्तों को खोल दिया।",
    "शक्ति के मुख्य केंद्र के सामने खड़े होकर, नायक ने संसार में संतुलन बनाने के लिए अपनी जादुई ऊर्जा जगाई।",
    "जैसे ही अंधेरा गायब हुआ, पूरी धरती सुनहरी रोशनी और सुंदर फूलों से खिल उठी।",
    "सफ़र में एक नया मोड़ आया जब एक प्राचीन रक्षक ने नायक को सुरक्षा का एक पवित्र तावीज़ भेंट किया।",
    "तारों के पुल को पार करते हुए, आसमान में दिव्य चमत्कार चमकने लगे।",
    " अटूट साहस के साथ, प्राचीन भविष्यवाणी सच हुई और ज्ञान का महान द्वार खुल गया।",
    "पूरे साम्राज्य में ख़ुशियों का माहौल छा गया और चारों तरफ़ विजय का जश्न मनाया गया।",
    "और इस तरह, यह महान कहानी हमेशा के लिए इतिहास के पन्नों में अमर हो गई।"
  ];

  for (let i = 0; i < count; i++) {
    scenes.push({
      sceneNumber: i + 1,
      narration: isHindi ? hindiNarrations[i % hindiNarrations.length] : englishNarrations[i % englishNarrations.length],
      imagePrompt: `${theme}, cinematic scene ${i + 1}, fantasy atmosphere, glowing crystal sky, 8k resolution, dramatic angle`
    });
  }

  return {
    title: isHindi ? `महागाथा: ${theme.slice(0, 25)}` : `The Legend of ${theme.slice(0, 25)}`,
    isHindi,
    durLabel,
    scenes
  };
}

function renderStoryMoviePlayer(storyData, prompt) {
  const card = document.createElement("div");
  card.className = "ai-story-card";
  card.dataset.storyJson = JSON.stringify(storyData);
  card.dataset.currentIdx = "0";

  const totalScenes = storyData.scenes.length;
  const isHindi = storyData.isHindi || /[\u0900-\u097F]/.test(storyData.scenes[0].narration);

  card.innerHTML = `
    <div class="ai-story-header">
      <div class="ai-story-title">
        <i class="fa-solid fa-book-open" style="color:#f59e0b;"></i>
        <span>${escapeHTML(storyData.title || "AI Story Movie")}</span>
      </div>
      <span class="ai-story-badge"><i class="fa-solid fa-film"></i> ${escapeHTML(storyData.durLabel || "1+ Min Movie")}</span>
    </div>
    
    <div class="ai-story-stage">
      <img class="ai-story-img" src="${storyData.scenes[0].imageUrl}" alt="Scene 1" />
      <div class="ai-story-subtitles">${escapeHTML(storyData.scenes[0].narration)}</div>
    </div>
    
    <div class="ai-story-controls">
      <button class="ai-story-play-btn" type="button">
        <i class="fa-solid fa-play"></i> <span>Play Movie</span>
      </button>
      <div class="ai-story-progress-bar">
        <div class="ai-story-progress-fill" style="width: ${(1 / totalScenes) * 100}%;"></div>
      </div>
      <div class="ai-story-time">Scene 1 / ${totalScenes} (${isHindi ? "हिंदी Voiceover" : "Audio Story"})</div>
    </div>

    <div class="ai-story-download-bar">
      <button class="ai-story-dl-btn dl-movie-btn" type="button">
        <i class="fa-solid fa-file-video"></i> Download Movie (.mp4)
      </button>
      <button class="ai-story-dl-btn dl-image-btn" type="button">
        <i class="fa-solid fa-download"></i> Save Scene Image
      </button>
    </div>
  `;

  addMsg(card, "bot");
}

// ─── GLOBAL STORY PLAYER ENGINE (Delegated for Saved & New Cards) ──
let globalStoryState = { card: null, isPlaying: false, timer: null, idx: 0 };

function getStoryDataFromCard(card) {
  if (card.dataset.storyJson) {
    try { return JSON.parse(card.dataset.storyJson); } catch (e) {}
  }
  // Construct fallback from DOM
  const title = card.querySelector(".ai-story-title span")?.textContent || "AI Story";
  const narration = card.querySelector(".ai-story-subtitles")?.textContent || "";
  const imgUrl = card.querySelector(".ai-story-img")?.src || "";
  return { title, isHindi: /[\u0900-\u097F]/.test(narration), durLabel: "Movie", scenes: [{ sceneNumber: 1, narration, imageUrl: imgUrl }] };
}

function toggleGlobalStoryPlay(card, playBtn) {
  const storyData = getStoryDataFromCard(card);
  const totalScenes = storyData.scenes.length;

  if (globalStoryState.card === card && globalStoryState.isPlaying) {
    // Pause active movie
    stopGlobalStoryPlayback();
    playBtn.innerHTML = '<i class="fa-solid fa-play"></i> <span>Play Movie</span>';
    return;
  }

  // Stop any other playing card
  stopGlobalStoryPlayback();

  globalStoryState.card = card;
  globalStoryState.isPlaying = true;
  playBtn.innerHTML = '<i class="fa-solid fa-pause"></i> <span>Pause</span>';

  let startIdx = parseInt(card.dataset.currentIdx || "0");
  if (startIdx >= totalScenes - 1) startIdx = 0;

  playStoryScene(card, storyData, startIdx, playBtn);
}

function stopGlobalStoryPlayback() {
  if (globalStoryState.timer) clearTimeout(globalStoryState.timer);
  if ('speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch (e) {}
  }
  if (globalStoryState.card) {
    const btn = globalStoryState.card.querySelector(".ai-story-play-btn");
    if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i> <span>Play Movie</span>';
  }
  globalStoryState.isPlaying = false;
}

function playStoryScene(card, storyData, idx, playBtn) {
  if (!globalStoryState.isPlaying || globalStoryState.card !== card) return;

  const total = storyData.scenes.length;
  const scene = storyData.scenes[idx];
  card.dataset.currentIdx = idx.toString();

  const imgEl = card.querySelector(".ai-story-img");
  const subEl = card.querySelector(".ai-story-subtitles");
  const fillEl = card.querySelector(".ai-story-progress-fill");
  const timeEl = card.querySelector(".ai-story-time");

  if (imgEl && scene.imageUrl) {
    imgEl.style.opacity = "0.2";
    setTimeout(() => {
      imgEl.src = scene.imageUrl;
      imgEl.style.opacity = "1";
      imgEl.classList.toggle("zoom", idx % 2 === 1);
    }, 150);
  }

  if (subEl) subEl.textContent = scene.narration;
  if (fillEl) fillEl.style.width = `${((idx + 1) / total) * 100}%`;
  if (timeEl) timeEl.textContent = `Scene ${idx + 1} / ${total} (${storyData.isHindi ? "हिंदी Voiceover" : "Audio Story"})`;

  let stepDone = false;
  const advance = () => {
    if (!stepDone) {
      stepDone = true;
      if (globalStoryState.timer) clearTimeout(globalStoryState.timer);
      if (idx < total - 1) {
        playStoryScene(card, storyData, idx + 1, playBtn);
      } else {
        stopGlobalStoryPlayback();
        if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> <span>Replay Movie</span>';
        card.dataset.currentIdx = "0";
      }
    }
  };

  // Fallback timer: 4.5s to 7.5s per scene
  const durationMs = Math.max(4500, Math.min(8000, (scene.narration || "").length * 120));
  globalStoryState.timer = setTimeout(advance, durationMs);

  // Audio speech synthesis
  if ('speechSynthesis' in window && scene.narration) {
    try {
      window.speechSynthesis.cancel();
      const ut = new SpeechSynthesisUtterance(scene.narration);
      if (storyData.isHindi || /[\u0900-\u097F]/.test(scene.narration)) {
        ut.lang = 'hi-IN';
        const voices = window.speechSynthesis.getVoices();
        const hindiVoice = voices.find(v => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi'));
        if (hindiVoice) ut.voice = hindiVoice;
        ut.rate = 0.95;
      } else {
        ut.rate = 0.95;
      }
      ut.onend = advance;
      ut.onerror = advance;
      window.speechSynthesis.speak(ut);
    } catch (e) {
      console.warn("TTS Error:", e);
    }
  }
}

// Global Event Delegation for all cards (Saved & New)
document.addEventListener("click", (e) => {
  const playBtn = e.target.closest(".ai-story-play-btn");
  if (playBtn) {
    const card = playBtn.closest(".ai-story-card");
    if (card) toggleGlobalStoryPlay(card, playBtn);
    return;
  }

  const dlMovieBtn = e.target.closest(".dl-movie-btn");
  if (dlMovieBtn) {
    const card = dlMovieBtn.closest(".ai-story-card");
    if (card) {
      const storyData = getStoryDataFromCard(card);
      downloadStoryMovieVideo(storyData, dlMovieBtn);
    }
    return;
  }

  const dlImgBtn = e.target.closest(".dl-image-btn");
  if (dlImgBtn) {
    const card = dlImgBtn.closest(".ai-story-card");
    if (card) {
      const storyData = getStoryDataFromCard(card);
      const idx = parseInt(card.dataset.currentIdx || "0");
      const scene = storyData.scenes[idx] || storyData.scenes[0];
      if (scene && scene.imageUrl) {
        const a = document.createElement("a");
        a.href = scene.imageUrl;
        a.download = `quantumpulse-scene-${idx + 1}-${Date.now()}.jpg`;
        a.target = "_blank";
        a.click();
      }
    }
    return;
  }
});

// ─── DOWNLOAD STORY MOVIE VIDEO EXPORTER ─────────────────
async function downloadStoryMovieVideo(storyData, dlBtn) {
  const origText = dlBtn.innerHTML;
  dlBtn.disabled = true;
  dlBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Preparing Video...';

  try {
    const images = [];
    const totalSc = storyData.scenes.length;

    for (let i = 0; i < totalSc; i++) {
      const sc = storyData.scenes[i];
      dlBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Loading Frames (${i + 1}/${totalSc})...`;
      
      const proxyUrl = "https://wsrv.nl/?url=" + encodeURIComponent(sc.imageUrl) + "&output=webp";
      const img = await new Promise(resolve => {
        const i = new Image();
        i.crossOrigin = "anonymous";
        i.onload = () => resolve(i);
        i.onerror = () => {
          const i2 = new Image();
          i2.crossOrigin = "anonymous";
          i2.onload = () => resolve(i2);
          i2.onerror = () => resolve(null);
          i2.src = sc.imageUrl;
        };
        i.src = proxyUrl;
      });
      images.push({ img, text: sc.narration, num: sc.sceneNumber });
    }

    const W = 1280, H = 720;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : MediaRecorder.isTypeSupported("video/webm") ? "video/webm" : "video/mp4";

    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 3500000 });
    const chunks = [];
    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

    const FPS = 30;
    const SECS_PER_SCENE = 3.0; // 3 seconds per scene in video file
    const framesPerScene = Math.round(FPS * SECS_PER_SCENE);

    recorder.start(100);

    let sceneIdx = 0;
    let frameIdx = 0;

    function renderNextFrame() {
      if (sceneIdx >= images.length) {
        recorder.stop();
        return;
      }

      const item = images[sceneIdx];
      const progress = frameIdx / framesPerScene;
      const zoom = 1 + 0.06 * progress;

      if (item.img) {
        ctx.globalAlpha = 1.0;
        const offX = ((zoom - 1) * W) / 2;
        const offY = ((zoom - 1) * H) / 2;
        ctx.drawImage(item.img, -offX, -offY, W * zoom, H * zoom);
      } else {
        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, "#0f0c21");
        grad.addColorStop(1, "#1a103c");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      }

      // Subtitle Bar Background
      ctx.fillStyle = "rgba(0, 0, 0, 0.82)";
      ctx.fillRect(0, H - 140, W, 140);

      // Subtitle Text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 26px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0,0,0,0.9)";
      ctx.shadowBlur = 8;

      const words = item.text.split(" ");
      let line = "";
      let lines = [];
      for (const w of words) {
        let test = line + w + " ";
        if (ctx.measureText(test).width > W - 140) {
          lines.push(line);
          line = w + " ";
        } else {
          line = test;
        }
      }
      lines.push(line);

      let textY = H - 100 + (lines.length === 1 ? 20 : 0);
      lines.slice(0, 2).forEach((l, i) => {
        ctx.fillText(l.trim(), W / 2, textY + i * 36);
      });

      // Top Title Bar
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, W, 50);

      ctx.font = "bold 20px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "left";
      ctx.fillStyle = "#fef08a";
      ctx.fillText(`📖 ${storyData.title || "AI Story Movie"} — Scene ${sceneIdx + 1}/${totalSc}`, 30, 32);

      ctx.textAlign = "right";
      ctx.fillStyle = "#f59e0b";
      ctx.fillText("QuantumPulse AI", W - 30, 32);

      frameIdx++;
      if (frameIdx >= framesPerScene) {
        sceneIdx++;
        frameIdx = 0;
      }

      setTimeout(renderNextFrame, 1000 / FPS);
    }

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const ext = mimeType.includes("webm") ? ".webm" : ".mp4";
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `quantumpulse-ai-story-${Date.now()}${ext}`;
      a.click();

      dlBtn.disabled = false;
      dlBtn.innerHTML = '<i class="fa-solid fa-check"></i> Download Complete!';
      setTimeout(() => { dlBtn.innerHTML = origText; }, 3000);
    };

    renderNextFrame();

  } catch (err) {
    alert("Video download failed: " + err.message);
    dlBtn.disabled = false;
    dlBtn.innerHTML = origText;
  }
}

document.addEventListener("DOMContentLoaded", init);

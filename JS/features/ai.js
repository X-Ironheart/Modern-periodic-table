import { elementsDataEn, getNormalizedCategoryClass } from "../main.js";
import config from "../../config.js";

let sessionQueries = [];
let geminiApiKey = "";
let activeEngine = "local"; // "local" or "gemini"

// Dynamic inject markdown styling rules
const styleId = "ai-custom-markdown-styles";
if (!document.getElementById(styleId)) {
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    .chat-bubble table {
      border-collapse: collapse;
      width: 100%;
      margin: 10px 0;
      font-size: 0.8rem;
      background: rgba(15, 23, 42, 0.4);
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .chat-bubble th, .chat-bubble td {
      border: 1px solid rgba(255, 255, 255, 0.06);
      padding: 6px 10px;
      text-align: left;
    }
    .chat-bubble th {
      background: rgba(255, 255, 255, 0.05);
      font-weight: 700;
      color: #fff;
    }
    .chat-bubble td {
      color: #cbd5e1;
    }
    .chat-bubble tr:nth-child(even) {
      background: rgba(255, 255, 255, 0.02);
    }
    .chat-bubble code {
      font-family: 'Roboto Mono', monospace;
      background: rgba(0, 0, 0, 0.4);
      padding: 2px 4px;
      border-radius: 4px;
      font-size: 0.82rem;
      color: var(--yellow-highlight);
    }
    .chat-bubble pre {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 10px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 8px 0;
    }
    .chat-bubble pre code {
      background: transparent;
      padding: 0;
      color: #fff;
    }
    .chat-bubble ul, .chat-bubble ol {
      margin: 6px 0;
      padding-left: 20px;
      color: #cbd5e1;
    }
    .chat-bubble li {
      margin-bottom: 4px;
    }
    .chat-bubble h1, .chat-bubble h2, .chat-bubble h3, .chat-bubble h4 {
      margin-top: 12px;
      margin-bottom: 6px;
      color: #fff;
      font-family: var(--font-space);
      font-weight: 600;
    }
    .chat-bubble h3 { font-size: 1.1rem; }
    .chat-bubble h4 { font-size: 0.95rem; }
    .chat-bubble p {
      margin: 6px 0;
    }
    .chat-bubble strong {
      color: #fff;
    }
    .typing-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 0 2px 0;
    }
    .typing-dot {
      width: 6px;
      height: 6px;
      background: #94a3b8;
      border-radius: 50%;
      animation: typing-bounce 1.4s infinite ease-in-out both;
    }
    .typing-dot:nth-child(1) { animation-delay: -0.32s; }
    .typing-dot:nth-child(2) { animation-delay: -0.16s; }
    @keyframes typing-bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
    .mic-pulsing {
      animation: mic-pulse 1.5s infinite;
      color: #ef4444 !important;
      background: rgba(239, 68, 68, 0.15) !important;
    }
    @keyframes mic-pulse {
      0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); }
      70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
      100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }
  `;
  document.head.appendChild(style);
}

async function loadAndParseEnv() {
  try {
    let response = await fetch(".env");
    if (!response.ok) {
      response = await fetch("/.env");
    }
    if (response.ok) {
      const text = await response.text();
      const lines = text.split("\n");
      for (const line of lines) {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1].trim();
          let value = (match[2] || "").trim();
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
          } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.slice(1, -1);
          }
          if (key === "GEMINI_API_KEY" || key === "API_KEY" || key === "GOOGLE_API_KEY") {
            return value;
          }
        }
      }
    }
  } catch (e) {
    console.warn("Could not load .env file from root: ", e);
  }
  return "";
}

function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function processMarkdownTable(rows) {
  if (rows.length < 2) return rows.join("\n");
  
  function extractCells(row) {
    return row.split("|").slice(1, -1).map(cell => cell.trim());
  }

  const headerCells = extractCells(rows[0]);
  const isSeparator = rows[1].includes("-");
  
  let startIndex = 1;
  let headersHtml = "";
  if (isSeparator) {
    headersHtml = `<thead><tr>${headerCells.map(c => `<th>${c}</th>`).join("")}</tr></thead>`;
    startIndex = 2;
  }

  let bodyRowsHtml = [];
  for (let i = startIndex; i < rows.length; i++) {
    const cells = extractCells(rows[i]);
    bodyRowsHtml.push(`<tr>${cells.map(c => `<td>${c}</td>`).join("")}</tr>`);
  }

  return `<table>${headersHtml}<tbody>${bodyRowsHtml.join("")}</tbody></table>`;
}

function compileMarkdown(text) {
  if (!text) return "";

  let html = text;

  // Escape HTML entities to prevent raw markup injection
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks: ```js ... ```
  html = html.replace(/```(?:[a-zA-Z0-9]+)?\n([\s\S]*?)\n```/g, (match, p1) => {
    return `<pre><code>${p1}</code></pre>`;
  });

  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Bold: **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // Italic: *text*
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // Headings
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^#### (.*$)/gim, "<h4>$1</h4>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  // Parse lists line by line
  const lines = html.split("\n");
  let inList = false;
  let listHtml = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inList) {
        listHtml.push("<ul>");
        inList = true;
      }
      listHtml.push(`<li>${line.substring(2)}</li>`);
    } else {
      if (inList) {
        listHtml.push("</ul>");
        inList = false;
      }
      listHtml.push(lines[i]);
    }
  }
  if (inList) {
    listHtml.push("</ul>");
  }
  html = listHtml.join("\n");

  // Parse tables
  const linesForTable = html.split("\n");
  let inTable = false;
  let tableRows = [];
  let tableHtmlOutput = [];

  for (let i = 0; i < linesForTable.length; i++) {
    const line = linesForTable[i].trim();
    if (line.startsWith("|") && line.endsWith("|")) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      tableRows.push(line);
    } else {
      if (inTable) {
        tableHtmlOutput.push(processMarkdownTable(tableRows));
        inTable = false;
      }
      tableHtmlOutput.push(linesForTable[i]);
    }
  }
  if (inTable) {
    tableHtmlOutput.push(processMarkdownTable(tableRows));
  }
  html = tableHtmlOutput.join("\n");

  // Process standard line breaks
  html = html.split("\n").map(line => {
    const trimmed = line.trim();
    if (
      trimmed === "" ||
      trimmed.startsWith("<h") ||
      trimmed.startsWith("</h") ||
      trimmed.startsWith("<pre") ||
      trimmed.startsWith("</pre") ||
      trimmed.startsWith("<code") ||
      trimmed.startsWith("</code") ||
      trimmed.startsWith("<ul") ||
      trimmed.startsWith("</ul") ||
      trimmed.startsWith("<li") ||
      trimmed.startsWith("</li") ||
      trimmed.startsWith("<table") ||
      trimmed.startsWith("</table") ||
      trimmed.startsWith("<tr") ||
      trimmed.startsWith("</tr") ||
      trimmed.startsWith("<td") ||
      trimmed.startsWith("</td") ||
      trimmed.startsWith("<th") ||
      trimmed.startsWith("</th")
    ) {
      return line;
    }
    return line + "<br>";
  }).join("\n");

  return html;
}

export function initAI() {
  const sendBtn = document.getElementById("chat-send-btn");
  const inputField = document.getElementById("chat-user-input");
  const saveKeyBtn = document.getElementById("save-api-key");
  const keyField = document.getElementById("gemini-api-key");
  const statusMsg = document.getElementById("key-status-msg");
  const resetBtn = document.getElementById("chat-reset-btn");
  const micBtn = document.getElementById("chat-mic-btn");
  const modelBtn = document.getElementById("model-select-btn");
  const modelDropdown = document.getElementById("model-dropdown-menu");
  const engineLocalBtn = document.getElementById("engine-local-btn");
  const engineGeminiBtn = document.getElementById("engine-gemini-btn");
  const modelNameDisplay = document.getElementById("model-name-display");

  // 1. Dynamic greeting based on current local time
  const titleEl = document.getElementById("ai-greeting-title");
  if (titleEl) {
    const hours = new Date().getHours();
    let greeting = "Good afternoon";
    if (hours >= 5 && hours < 12) {
      greeting = "Good morning";
    } else if (hours >= 12 && hours < 18) {
      greeting = "Good afternoon";
    } else {
      greeting = "Good evening";
    }
    titleEl.textContent = greeting;
  }

  // 2. Load API Key state
  let savedKey = localStorage.getItem("gemini_api_key") || "";
  if (savedKey) {
    geminiApiKey = savedKey;
    if (keyField) keyField.value = savedKey;
    updateKeyStatus("Key loaded from storage");
  } else {
    loadAndParseEnv().then((envKey) => {
      if (envKey) {
        geminiApiKey = envKey;
        updateKeyStatus("Key loaded from .env");
      } else {
        updateKeyStatus("Using local database engine");
      }
    });
  }

  function updateKeyStatus(msg) {
    if (statusMsg) {
      statusMsg.textContent = msg;
    }
  }

  saveKeyBtn.onclick = () => {
    const key = keyField.value.trim();
    if (key) {
      localStorage.setItem("gemini_api_key", key);
      geminiApiKey = key;
      updateKeyStatus("Key saved successfully");
    } else {
      localStorage.removeItem("gemini_api_key");
      geminiApiKey = "";
      loadAndParseEnv().then((envKey) => {
        if (envKey) {
          geminiApiKey = envKey;
          updateKeyStatus("Key loaded from .env");
        } else {
          updateKeyStatus("Using local database engine");
        }
      });
    }
  };

  // 3. Dropdown Toggles and Engine Selector
  modelBtn.onclick = (e) => {
    e.stopPropagation();
    modelDropdown.classList.toggle("show");
  };

  document.addEventListener("click", () => {
    modelDropdown.classList.remove("show");
  });

  modelDropdown.onclick = (e) => {
    e.stopPropagation();
  };

  engineLocalBtn.onclick = () => {
    activeEngine = "local";
    engineLocalBtn.classList.add("active-engine");
    engineGeminiBtn.classList.remove("active-engine");
    engineLocalBtn.querySelector(".engine-check").textContent = "✓";
    engineGeminiBtn.querySelector(".engine-check").textContent = "";
    modelNameDisplay.textContent = "Smart (Hydrogen)";
    modelDropdown.classList.remove("show");
  };

  engineGeminiBtn.onclick = () => {
    activeEngine = "gemini";
    engineGeminiBtn.classList.add("active-engine");
    engineLocalBtn.classList.remove("active-engine");
    engineGeminiBtn.querySelector(".engine-check").textContent = "✓";
    engineLocalBtn.querySelector(".engine-check").textContent = "";
    modelNameDisplay.textContent = "Gemini Brain";
    modelDropdown.classList.remove("show");
  };

  // 4. Speech Recognition Integration
  let recognition = null;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => {
      micBtn.classList.add("mic-pulsing");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (inputField) {
        inputField.value = transcript;
        inputField.focus();
      }
    };

    recognition.onerror = () => {
      micBtn.classList.remove("mic-pulsing");
    };

    recognition.onend = () => {
      micBtn.classList.remove("mic-pulsing");
    };
  }

  micBtn.onclick = () => {
    if (!recognition) {
      alert("Voice search is not supported in your browser. Try Google Chrome.");
      return;
    }
    if (micBtn.classList.contains("mic-pulsing")) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  // 5. Send logic
  async function queryGemini(message) {
    if (!geminiApiKey) {
      throw new Error("API Key is missing. Please add/save your key in the settings panel first.");
    }

    const isOpenRouter = geminiApiKey.startsWith("sk-or-");
    const url = isOpenRouter
      ? "https://openrouter.ai/api/v1/chat/completions"
      : `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

    const systemInstruction = "You are Hydrogen, a professional, friendly, and knowledgeable chemistry AI assistant. You answer chemistry and science queries concisely and clearly. Format data tables, bullet points, and equations using markdown to keep them structured.";

    let response;
    if (isOpenRouter) {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${geminiApiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Modern Periodic Table"
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: message }
          ]
        })
      });
    } else {
      const prompt = `${systemInstruction}\n\nUser Question: ${message}`;
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.error?.message || response.statusText;
      throw new Error(`API error: ${errMsg}`);
    }

    const data = await response.json();
    if (isOpenRouter) {
      const reply = data.choices?.[0]?.message?.content;
      if (!reply) {
        throw new Error("Received empty response from OpenRouter.");
      }
      return reply;
    } else {
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!reply) {
        throw new Error("Received empty response from Gemini API.");
      }
      return reply;
    }
  }

  function handleLocalQuery(query) {
    const cleanQuery = query.toLowerCase().trim();

    function findElements(text) {
      const found = [];
      elementsDataEn.forEach((el) => {
        const nameLower = el.name.toLowerCase();
        const symLower = el.symbol.toLowerCase();
        const nameRegex = new RegExp(`\\b${nameLower}\\b`, "i");
        const symRegex = new RegExp(`\\b${symLower}\\b`, "i");
        if (nameRegex.test(text) || symRegex.test(text)) {
          found.push(el);
        }
      });
      return Array.from(new Set(found));
    }

    const matchedElements = findElements(cleanQuery);

    // Comparison Check
    if (cleanQuery.includes("compare") || cleanQuery.includes(" vs ") || cleanQuery.includes("versus")) {
      if (matchedElements.length >= 2) {
        const el1 = matchedElements[0];
        const el2 = matchedElements[1];
        return `
          <h3>Comparing ${el1.name} and ${el2.name}</h3>
          <table>
            <thead>
              <tr>
                <th>Property</th>
                <th>${el1.name} (${el1.symbol})</th>
                <th>${el2.name} (${el2.symbol})</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Atomic Number</strong></td>
                <td>${el1.number}</td>
                <td>${el2.number}</td>
              </tr>
              <tr>
                <td><strong>Atomic Mass</strong></td>
                <td>${el1.atomic_mass ? el1.atomic_mass.toFixed(3) : "Unknown"} u</td>
                <td>${el2.atomic_mass ? el2.atomic_mass.toFixed(3) : "Unknown"} u</td>
              </tr>
              <tr>
                <td><strong>Category</strong></td>
                <td>${el1.category}</td>
                <td>${el2.category}</td>
              </tr>
              <tr>
                <td><strong>Electron Config</strong></td>
                <td><code>${el1.electron_configuration}</code></td>
                <td><code>${el2.electron_configuration}</code></td>
              </tr>
              <tr>
                <td><strong>Electronegativity</strong></td>
                <td>${el1.electronegativity_pauling || "Unknown"}</td>
                <td>${el2.electronegativity_pauling || "Unknown"}</td>
              </tr>
              <tr>
                <td><strong>Phase</strong></td>
                <td>${el1.phase}</td>
                <td>${el2.phase}</td>
              </tr>
              <tr>
                <td><strong>Density</strong></td>
                <td>${el1.density ? el1.density + " g/cm³" : "Unknown"}</td>
                <td>${el2.density ? el2.density + " g/cm³" : "Unknown"}</td>
              </tr>
              <tr>
                <td><strong>Melting Point</strong></td>
                <td>${el1.melt ? el1.melt + " K" : "Unknown"}</td>
                <td>${el2.melt ? el2.melt + " K" : "Unknown"}</td>
              </tr>
              <tr>
                <td><strong>Boiling Point</strong></td>
                <td>${el1.boil ? el1.boil + " K" : "Unknown"}</td>
                <td>${el2.boil ? el2.boil + " K" : "Unknown"}</td>
              </tr>
            </tbody>
          </table>
          <p><strong>Summary (${el1.name}):</strong> ${el1.summary}</p>
          <p><strong>Summary (${el2.name}):</strong> ${el2.summary}</p>
        `;
      }
    }

    // Single Element Check
    if (matchedElements.length === 1) {
      const el = matchedElements[0];
      return `
        <h3>Element Spotlight: ${el.name} (${el.symbol})</h3>
        <p><strong>Summary:</strong> ${el.summary}</p>
        <table>
          <thead>
            <tr>
              <th colspan="2">Scientific Specifications</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Atomic Number / Group</strong></td>
              <td>Number ${el.number} | Period ${el.period} | Group ${el.group}</td>
            </tr>
            <tr>
              <td><strong>Atomic Weight (Mass)</strong></td>
              <td>${el.atomic_mass ? el.atomic_mass.toFixed(4) : "Unknown"} u</td>
            </tr>
            <tr>
              <td><strong>Chemical Family</strong></td>
              <td>${el.category}</td>
            </tr>
            <tr>
              <td><strong>Configuration</strong></td>
              <td><code>${el.electron_configuration}</code></td>
            </tr>
            <tr>
              <td><strong>Electronegativity</strong></td>
              <td>${el.electronegativity_pauling ? el.electronegativity_pauling + " (Pauling)" : "Unknown"}</td>
            </tr>
            <tr>
              <td><strong>Physical State (STP)</strong></td>
              <td>${el.phase}</td>
            </tr>
            <tr>
              <td><strong>Density</strong></td>
              <td>${el.density ? el.density + " g/cm³" : "Unknown"}</td>
            </tr>
            <tr>
              <td><strong>Melting / Boiling</strong></td>
              <td>Melt: ${el.melt ? el.melt + " K" : "Unknown"} | Boil: ${el.boil ? el.boil + " K" : "Unknown"}</td>
            </tr>
            <tr>
              <td><strong>Discovered By</strong></td>
              <td>${el.discovered_by || "Ancient / Unknown"}</td>
            </tr>
          </tbody>
        </table>
      `;
    }

    // Category spotlight check
    const categories = [
      "alkali metal", "alkaline earth metal", "transition metal", "post-transition metal",
      "metalloid", "noble gas", "lanthanide", "actinide", "diatomic nonmetal", "polyatomic nonmetal"
    ];
    for (const cat of categories) {
      if (cleanQuery.includes(cat) || cleanQuery.includes(cat + "s")) {
        const matches = elementsDataEn.filter(el => el.category.toLowerCase().includes(cat));
        if (matches.length > 0) {
          const listHtml = matches.map(el => `<tr><td>${el.number}</td><td><strong>${el.symbol}</strong></td><td>${el.name}</td><td>${el.atomic_mass ? el.atomic_mass.toFixed(2) : "Unknown"}</td></tr>`).join("");
          return `
            <h3>List of ${cat.charAt(0).toUpperCase() + cat.slice(1)}s</h3>
            <p>We found ${matches.length} elements in this family:</p>
            <table>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Symbol</th>
                  <th>Name</th>
                  <th>Atomic Mass</th>
                </tr>
              </thead>
              <tbody>
                ${listHtml}
              </tbody>
            </table>
          `;
        }
      }
    }

    // Default local advice
    return `
      <p>I am running on the <strong>Hydrogen Local DB</strong> engine. I can provide facts and comparisons directly from the offline periodic table catalog.</p>
      <p>Try queries like:</p>
      <ul>
        <li><em>"Tell me about Gold"</em></li>
        <li><em>"Compare Oxygen and Helium"</em></li>
        <li><em>"List all noble gases"</em></li>
      </ul>
      <p>For complex questions (e.g., chemical reactions, explanation of concepts), please switch to the <strong>Gemini Generative Brain</strong> engine in the model dropdown settings.</p>
    `;
  }

  function scrollToBottom() {
    const chatBox = document.getElementById("chat-messages-box");
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }

  async function handleSend() {
    const message = inputField.value.trim();
    if (!message) return;

    inputField.value = "";

    const aiPage = document.getElementById("view-ai");
    if (aiPage) {
      aiPage.classList.add("chat-active");
    }

    const chatBox = document.getElementById("chat-messages-box");

    const userBubble = document.createElement("div");
    userBubble.className = "chat-bubble user-bubble";
    userBubble.innerHTML = `<strong>You:</strong> ${escapeHtml(message)}`;
    chatBox.appendChild(userBubble);
    scrollToBottom();

    sessionQueries.push(message);
    renderSessionLogs();

    const assistantBubble = document.createElement("div");
    assistantBubble.className = "chat-bubble assistant-bubble";
    assistantBubble.innerHTML = `
      <strong>Hydrogen:</strong>
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
    chatBox.appendChild(assistantBubble);
    scrollToBottom();

    try {
      let replyHtml = "";
      if (activeEngine === "local") {
        const replyText = handleLocalQuery(message);
        await new Promise(resolve => setTimeout(resolve, 600));
        replyHtml = replyText;
      } else {
        const replyText = await queryGemini(message);
        replyHtml = compileMarkdown(replyText);
      }
      assistantBubble.innerHTML = `<strong>Hydrogen:</strong><br>${replyHtml}`;
    } catch (error) {
      assistantBubble.innerHTML = `<strong>Hydrogen:</strong><br><span style="color:#ef4444;">Error: ${escapeHtml(error.message)}</span>`;
    }
    scrollToBottom();
  }

  sendBtn.onclick = handleSend;

  inputField.onkeydown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  // 6. Dynamic suggestions pills & history setup
  renderRecentElements();
  renderSessionLogs();
  initAppShortcuts();

  const pills = document.querySelectorAll(".ai-suggest-pill");
  pills.forEach(pill => {
    pill.onclick = () => {
      const q = pill.getAttribute("data-query");
      if (inputField && q) {
        inputField.value = q;
        handleSend();
      }
    };
  });

  resetBtn.onclick = () => {
    const chatBox = document.getElementById("chat-messages-box");

    if (chatBox) {
      chatBox.innerHTML = `
        <div class="chat-bubble assistant-bubble">
          <strong>Hydrogen:</strong> Welcome! I am Hydrogen, your chemistry
          assistant. Feel free to ask me questions like:
          <em>"What is the melting point of Iron?"</em> or
          <em>"Tell me about Helium."</em>
        </div>
      `;
    }

    const aiPage = document.getElementById("view-ai");
    if (aiPage) {
      aiPage.classList.remove("chat-active");
    }

    sessionQueries = [];
    renderSessionLogs();
  };

  function initAppShortcuts() {
    const shortcuts = document.querySelectorAll(".shortcut-item");
    shortcuts.forEach((item) => {
      item.onclick = (e) => {
        e.stopPropagation();
        const tabName = item.getAttribute("data-target-tab");
        const simSub = item.getAttribute("data-sim-sub");
        const refSub = item.getAttribute("data-ref-sub");

        const navBtn = document.querySelector(`.nav-pill[data-tab="${tabName}"]`);
        if (navBtn) {
          navBtn.click();

          if (simSub) {
            setTimeout(() => {
              const subBtn = document.querySelector(`.sim-tab-btn[data-sim="${simSub}"]`);
              if (subBtn) subBtn.click();
            }, 50);
          }

          if (refSub) {
            setTimeout(() => {
              const subBtn = document.querySelector(`.ref-tab-btn[data-ref="${refSub}"]`);
              if (subBtn) subBtn.click();
            }, 50);
          }
        }
      };
    });
  }

  function renderRecentElements() {
    const container = document.getElementById("recent-elements-list");
    if (!container) return;

    let recentSymbols = [];
    try {
      recentSymbols = JSON.parse(localStorage.getItem("recent_elements") || "[]");
    } catch (e) {}

    if (recentSymbols.length === 0) {
      recentSymbols = ["Au", "He", "U"];
    }

    const recentElements = recentSymbols
      .map((sym) => elementsDataEn.find((el) => el.symbol.toLowerCase() === sym.toLowerCase()))
      .filter(Boolean);

    if (recentElements.length === 0) {
      container.innerHTML = `<p style="font-size:0.75rem; color:#94a3b8; text-align:center;">No elements visited yet.</p>`;
      return;
    }

    container.innerHTML = recentElements
      .map((el) => {
        const catClass = getNormalizedCategoryClass(el.category);
        return `
        <div class="recent-el-item" data-query="Tell me about ${el.name}">
          <span class="recent-el-badge ${catClass}" style="background-color: var(--${catClass})">${el.symbol}</span>
          <div class="recent-el-details">
            <strong>${el.name}</strong>
            <span>Recently Clicked</span>
          </div>
          <span class="recent-el-more">...</span>
        </div>
      `;
      })
      .join("");

    container.querySelectorAll(".recent-el-item").forEach((item) => {
      item.onclick = () => {
        const q = item.getAttribute("data-query");
        if (inputField && q) {
          inputField.value = q;
          handleSend();
        }
      };
    });
  }

  function renderSessionLogs() {
    const container = document.getElementById("session-logs-list");
    if (!container) return;

    if (sessionQueries.length === 0) {
      container.innerHTML = `
        <div class="log-el-item placeholder-log">
          <span class="log-bubble-icon">💬</span>
          <div class="log-details">
            <strong>How can Hydrogen help me?</strong>
            <span>Explore elements instantly</span>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = sessionQueries
      .slice(-3)
      .reverse()
      .map(
        (q) => `
      <div class="log-el-item" data-query="${q}">
        <span class="log-bubble-icon">💬</span>
        <div class="log-details">
          <strong>${q.length > 28 ? q.substring(0, 25) + "..." : q}</strong>
          <span>Ask Again</span>
        </div>
      </div>
    `,
      )
      .join("");

    container.querySelectorAll(".log-el-item").forEach((item) => {
      item.onclick = () => {
        const q = item.getAttribute("data-query");
        if (inputField && q) {
          inputField.value = q;
          handleSend();
        }
      };
    });
  }
}

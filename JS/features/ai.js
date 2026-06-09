import { elementsDataEn, getNormalizedCategoryClass } from "../main.js";

let sessionQueries = [];

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

  // 2. Load dynamic cards content
  renderRecentElements();
  renderSessionLogs();
  initAppShortcuts();

  // 3. Toggle Model Selector Dropdown Menu
  if (modelBtn && modelDropdown) {
    modelBtn.onclick = (e) => {
      e.stopPropagation();
      modelDropdown.classList.toggle("show");
    };

    if (!window.aiDropdownRegistered) {
      window.addEventListener("click", () => {
        const dd = document.getElementById("model-dropdown-menu");
        if (dd) dd.classList.remove("show");
      });
      window.aiDropdownRegistered = true;
    }
  }

  // 4. Load saved API key & selected engine
  const savedKey = localStorage.getItem("gemini_api_key");
  let currentEngine = localStorage.getItem("selected_engine") || "local";

  if (savedKey) {
    keyField.value = savedKey;
    statusMsg.textContent = "Gemini AI Engine Active";
    statusMsg.style.color = "#10b981";
    if (!localStorage.getItem("selected_engine")) {
      currentEngine = "gemini";
    }
  }

  function setEngine(engine) {
    currentEngine = engine;
    localStorage.setItem("selected_engine", engine);

    if (engine === "gemini") {
      modelNameDisplay.textContent = "Smart (Gemini)";
      if (engineGeminiBtn) engineGeminiBtn.querySelector(".engine-check").textContent = "✓";
      if (engineLocalBtn) engineLocalBtn.querySelector(".engine-check").textContent = "";
      if (engineGeminiBtn) engineGeminiBtn.classList.add("active-engine");
      if (engineLocalBtn) engineLocalBtn.classList.remove("active-engine");
    } else {
      modelNameDisplay.textContent = "Smart (Hydrogen)";
      if (engineLocalBtn) engineLocalBtn.querySelector(".engine-check").textContent = "✓";
      if (engineGeminiBtn) engineGeminiBtn.querySelector(".engine-check").textContent = "";
      if (engineLocalBtn) engineLocalBtn.classList.add("active-engine");
      if (engineGeminiBtn) engineGeminiBtn.classList.remove("active-engine");
    }
  }

  setEngine(currentEngine);

  if (engineLocalBtn) {
    engineLocalBtn.onclick = () => {
      setEngine("local");
      modelDropdown.classList.remove("show");
    };
  }

  if (engineGeminiBtn) {
    engineGeminiBtn.onclick = () => {
      setEngine("gemini");
      modelDropdown.classList.remove("show");
    };
  }

  // 5. Save API Key action
  if (saveKeyBtn) {
    saveKeyBtn.onclick = () => {
      const key = keyField.value.trim();
      if (key) {
        localStorage.setItem("gemini_api_key", key);
        statusMsg.textContent = "Gemini AI Engine Active";
        statusMsg.style.color = "#10b981";
        setEngine("gemini");
      } else {
        localStorage.removeItem("gemini_api_key");
        statusMsg.textContent = "Using local database engine";
        statusMsg.style.color = "#cbd5e1";
        setEngine("local");
      }
      modelDropdown.classList.remove("show");
    };
  }

  // 6. Suggestion pills click listeners
  const suggestionPills = document.querySelectorAll(".ai-suggest-pill");
  suggestionPills.forEach((pill) => {
    pill.onclick = () => {
      const query = pill.getAttribute("data-query");
      if (inputField) {
        inputField.value = query;
        handleSend();
      }
    };
  });

  // 7. Reset Chat / Clear Topic button handler
  if (resetBtn) {
    resetBtn.onclick = (e) => {
      e.stopPropagation();
      const chatMessages = document.getElementById("chat-messages-box");
      if (chatMessages) {
        chatMessages.innerHTML = `
          <div class="chat-bubble assistant-bubble">
            <strong>Hydrogen:</strong> Welcome! I am Hydrogen, your chemistry assistant. Feel free to ask me questions like: <em>"What is the melting point of Iron?"</em> or <em>"Tell me about Helium."</em>
          </div>
        `;
      }
      const viewAi = document.getElementById("view-ai");
      if (viewAi) viewAi.classList.remove("chat-active");
      if (inputField) {
        inputField.value = "";
        inputField.focus();
      }
    };
  }

  // 8. Voice Recognition mic button integration
  if (micBtn) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        micBtn.style.color = "#ef4444";
        micBtn.style.transform = "scale(1.15)";
        if (inputField) inputField.placeholder = "Listening...";
      };

      recognition.onend = () => {
        micBtn.style.color = "";
        micBtn.style.transform = "";
        if (inputField) inputField.placeholder = "Ask anything about elements, compounds, or reactions...";
      };

      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        if (inputField) {
          inputField.value = transcript;
          inputField.focus();
        }
      };

      micBtn.onclick = (e) => {
        e.stopPropagation();
        try {
          recognition.start();
        } catch (err) {
          recognition.stop();
        }
      };
    } else {
      micBtn.style.opacity = "0.3";
      micBtn.title = "Speech recognition not supported in this browser";
    }
  }

  // 9. Send / Submit triggers
  if (sendBtn) {
    sendBtn.onclick = handleSend;
  }
  if (inputField) {
    inputField.onkeydown = (e) => {
      if (e.key === "Enter") {
        handleSend();
      }
    };
  }
}

async function handleSend() {
  const inputField = document.getElementById("chat-user-input");
  if (!inputField) return;

  const query = inputField.value.trim();
  if (!query) return;

  // Clear input
  inputField.value = "";

  // Set chat tab layout state as active to shift landing layout
  const viewAi = document.getElementById("view-ai");
  if (viewAi) {
    viewAi.classList.add("chat-active");
  }

  // Append user bubble
  appendMessage("User", query, true);

  // Append thinking bubble
  const chatMessages = document.getElementById("chat-messages-box");
  const loadingBubble = document.createElement("div");
  loadingBubble.classList.add("chat-bubble", "assistant-bubble");
  loadingBubble.innerHTML = `<strong>Hydrogen:</strong> <em>Thinking...</em>`;
  chatMessages.appendChild(loadingBubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  const apiKey = localStorage.getItem("gemini_api_key");
  const engine = localStorage.getItem("selected_engine") || "local";
  let responseText = "";

  try {
    if (engine === "gemini" && apiKey) {
      responseText = await callGeminiAPI(query, apiKey);
    } else {
      responseText = await getLocalResponse(query);
    }
    // Record to session logs for Card 3
    recordSessionQuery(query);
  } catch (err) {
    console.error(err);
    responseText = "Sorry, I encountered an error connecting to my generative model. Please verify your API Key and internet connection.";
  }

  // Remove loading and append assistant bubble
  loadingBubble.remove();
  appendMessage("Hydrogen", responseText, false);
}

function appendMessage(sender, text, isUser) {
  const chatMessages = document.getElementById("chat-messages-box");
  if (!chatMessages) return;

  const bubble = document.createElement("div");
  bubble.classList.add("chat-bubble");
  bubble.classList.add(isUser ? "user-bubble" : "assistant-bubble");

  // Basic markdown formatting
  let formattedText = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");

  bubble.innerHTML = `<strong>${sender}:</strong> ${formattedText}`;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function callGeminiAPI(prompt, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: `You are a professional chemistry AI assistant called "Hydrogen". Answer questions about the periodic table, chemical elements, compounds, and chemistry. Keep answers concise, highly informative, structured, and chemically accurate. User question: ${prompt}`
          }
        ]
      }
    ]
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error("Gemini API request failed");
  }

  const data = await res.json();
  if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
    return data.candidates[0].content.parts[0].text;
  }
  return "I could not generate a response. Please try again.";
}

function getLocalResponse(query) {
  const q = query.toLowerCase();

  // Check for comparison intents
  if (q.includes("compare") || q.includes("difference between")) {
    const foundElements = findElementsInText(q);
    if (foundElements.length >= 2) {
      return generateLocalComparisonReport(foundElements[0], foundElements[1]);
    }
  }

  // Check for single element lookup
  const found = findElementsInText(q);
  if (found.length > 0) {
    return generateLocalElementReport(found[0]);
  }

  // Fallback response
  return `I am currently running on my **Local Database Engine** because no Gemini API key is provided.

I can give you instant detailed reports on any element (e.g. ask *"Tell me about Oxygen"* or *"melting point of Iron"*) or compare two elements (e.g. *"compare Copper and Zinc"*).

To unlock my full generative AI brain and ask arbitrary questions (like explaining covalent bonds, balancing equations, etc.), please paste a **Google Gemini API Key** in the settings panel by clicking the model button inside the search capsule!`;
}

function findElementsInText(text) {
  const matches = [];
  elementsDataEn.forEach((el) => {
    const name = el.name.toLowerCase();
    const symbol = el.symbol.toLowerCase();

    const regexName = new RegExp(`\\b${name}\\b`, "i");
    const regexSymbol = new RegExp(`\\b${symbol}\\b`, "i");

    if (regexName.test(text) || regexSymbol.test(text)) {
      matches.push(el);
    }
  });
  return matches;
}

function generateLocalElementReport(el) {
  return `**Element Profile: ${el.name} (${el.symbol})**
- **Atomic Number**: ${el.number}
- **Atomic Mass**: ${el.atomic_mass} u
- **Category**: ${el.category}
- **Phase**: ${el.phase}
- **Melting Point**: ${el.melt ? el.melt + " K" : "Unknown"}
- **Boiling Point**: ${el.boil ? el.boil + " K" : "Unknown"}
- **Electron Configuration**: ${el.electron_configuration}
- **Electronegativity**: ${el.electronegativity_pauling ? el.electronegativity_pauling + " Pauling" : "Unknown"}
- **Density**: ${el.density ? el.density + " g/cm³" : "Unknown"}
- **Discovered By**: ${el.discovered_by || "Unknown"}

**Summary**: ${el.summary}`;
}

function generateLocalComparisonReport(el1, el2) {
  const melt1 = el1.melt ? el1.melt + " K" : "Unknown";
  const melt2 = el2.melt ? el2.melt + " K" : "Unknown";
  const boil1 = el1.boil ? el1.boil + " K" : "Unknown";
  const boil2 = el2.boil ? el2.boil + " K" : "Unknown";
  const density1 = el1.density ? el1.density + " g/cm³" : "Unknown";
  const density2 = el2.density ? el2.density + " g/cm³" : "Unknown";

  return `**Comparison Report: ${el1.name} vs ${el2.name}**

| Property | ${el1.name} (${el1.symbol}) | ${el2.name} (${el2.symbol}) |
| :--- | :--- | :--- |
| **Atomic No.** | ${el1.number} | ${el2.number} |
| **Mass** | ${el1.atomic_mass} u | ${el2.atomic_mass} u |
| **Category** | ${el1.category} | ${el2.category} |
| **Phase** | ${el1.phase} | ${el2.phase} |
| **Melting Pt.** | ${melt1} | ${melt2} |
| **Boiling Pt.** | ${boil1} | ${boil2} |
| **Density** | ${density1} | ${density2} |
| **Electronegativity** | ${el1.electronegativity_pauling || "Unknown"} | ${el2.electronegativity_pauling || "Unknown"} |

*Generated dynamically using the local elements database.*`;
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
    .map(sym => elementsDataEn.find(el => el.symbol.toLowerCase() === sym.toLowerCase()))
    .filter(Boolean);

  if (recentElements.length === 0) {
    container.innerHTML = `<p style="font-size:0.75rem; color:#94a3b8; text-align:center;">No elements visited yet.</p>`;
    return;
  }

  container.innerHTML = recentElements.map(el => {
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
  }).join("");

  container.querySelectorAll(".recent-el-item").forEach(item => {
    item.onclick = () => {
      const q = item.getAttribute("data-query");
      const inputField = document.getElementById("chat-user-input");
      if (inputField) {
        inputField.value = q;
        handleSend();
      }
    };
  });
}

function recordSessionQuery(query) {
  if (!sessionQueries.includes(query)) {
    sessionQueries.push(query);
    renderSessionLogs();
  }
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

  container.innerHTML = sessionQueries.slice(-3).reverse().map(q => `
    <div class="log-el-item" data-query="${q}">
      <span class="log-bubble-icon">💬</span>
      <div class="log-details">
        <strong>${q.length > 28 ? q.substring(0, 25) + "..." : q}</strong>
        <span>Ask Again</span>
      </div>
    </div>
  `).join("");

  container.querySelectorAll(".log-el-item").forEach(item => {
    item.onclick = () => {
      const q = item.getAttribute("data-query");
      const inputField = document.getElementById("chat-user-input");
      if (inputField) {
        inputField.value = q;
        handleSend();
      }
    };
  });
}

function initAppShortcuts() {
  const shortcuts = document.querySelectorAll(".shortcut-item");
  shortcuts.forEach(item => {
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

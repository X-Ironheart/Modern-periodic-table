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
  const apiKey = process.env.HYDROGEN_API_KEY;

sendBtn.onclick = async() => {
  if(!inputField.value) return;
  const message = inputField.value;
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
        model: "gpt-4",
        messages: [{ content: message }]
    })
});

if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
}

const data = await response.json();
console.log(data);
}

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

  function initAppShortcuts() {
    const shortcuts = document.querySelectorAll(".shortcut-item");
    shortcuts.forEach((item) => {
      item.onclick = (e) => {
        e.stopPropagation();
        const tabName = item.getAttribute("data-target-tab");
        const simSub = item.getAttribute("data-sim-sub");
        const refSub = item.getAttribute("data-ref-sub");

        const navBtn = document.querySelector(
          `.nav-pill[data-tab="${tabName}"]`,
        );
        if (navBtn) {
          navBtn.click();

          if (simSub) {
            setTimeout(() => {
              const subBtn = document.querySelector(
                `.sim-tab-btn[data-sim="${simSub}"]`,
              );
              if (subBtn) subBtn.click();
            }, 50);
          }

          if (refSub) {
            setTimeout(() => {
              const subBtn = document.querySelector(
                `.ref-tab-btn[data-ref="${refSub}"]`,
              );
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
      recentSymbols = JSON.parse(
        localStorage.getItem("recent_elements") || "[]",
      );
    } catch (e) {}

    if (recentSymbols.length === 0) {
      recentSymbols = ["Au", "He", "U"];
    }

    const recentElements = recentSymbols
      .map((sym) =>
        elementsDataEn.find(
          (el) => el.symbol.toLowerCase() === sym.toLowerCase(),
        ),
      )
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
        const inputField = document.getElementById("chat-user-input");
        if (inputField) {
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
        const inputField = document.getElementById("chat-user-input");
        if (inputField) {
          inputField.value = q;
          handleSend();
        }
      };
    });
  }
}

import { elementsDataEn } from "./main.js";

export function initAI() {
  const sendBtn = document.getElementById("chat-send-btn");
  const inputField = document.getElementById("chat-user-input");
  const saveKeyBtn = document.getElementById("save-api-key");
  const keyField = document.getElementById("gemini-api-key");
  const statusMsg = document.getElementById("key-status-msg");

  // Load saved API key
  const savedKey = localStorage.getItem("gemini_api_key");
  if (savedKey) {
    keyField.value = savedKey;
    statusMsg.textContent = "Gemini AI Engine Active";
    statusMsg.style.color = "#10b981";
  }

  // Handle save key
  saveKeyBtn.onclick = () => {
    const key = keyField.value.trim();
    if (key) {
      localStorage.setItem("gemini_api_key", key);
      statusMsg.textContent = "Gemini AI Engine Active";
      statusMsg.style.color = "#10b981";
    } else {
      localStorage.removeItem("gemini_api_key");
      statusMsg.textContent = "Using local database engine";
      statusMsg.style.color = "#cbd5e1";
    }
  };

  // Click sample queries
  const sampleItems = document.querySelectorAll(".sample-queries li");
  sampleItems.forEach((item) => {
    item.onclick = () => {
      inputField.value = item.textContent.replace(/"/g, "");
      inputField.focus();
    };
  });

  // Handle send message
  sendBtn.onclick = handleSend;
  inputField.onkeydown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };
}

async function handleSend() {
  const inputField = document.getElementById("chat-user-input");
  const query = inputField.value.trim();
  if (!query) return;

  // Clear input
  inputField.value = "";

  // Append user bubble
  appendMessage("User", query, true);

  // Append loading bubble
  const chatMessages = document.getElementById("chat-messages-box");
  const loadingBubble = document.createElement("div");
  loadingBubble.classList.add("chat-bubble", "assistant-bubble");
  loadingBubble.innerHTML = `<strong>Hydrogen:</strong> <em>Thinking...</em>`;
  chatMessages.appendChild(loadingBubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  const apiKey = localStorage.getItem("gemini_api_key");
  let responseText = "";

  try {
    if (apiKey) {
      // Call Gemini API
      responseText = await callGeminiAPI(query, apiKey);
    } else {
      // Use Local Parser
      responseText = await getLocalResponse(query);
    }
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
  const bubble = document.createElement("div");
  bubble.classList.add("chat-bubble");
  bubble.classList.add(isUser ? "user-bubble" : "assistant-bubble");

  // Basic markdown formatting
  let formattedText = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // bold
    .replace(/\*(.*?)\*/g, "<em>$1</em>") // italics
    .replace(/\n/g, "<br/>"); // line breaks

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

  // 1. Check for comparison intents
  if (q.includes("compare") || q.includes("difference between")) {
    const foundElements = findElementsInText(q);
    if (foundElements.length >= 2) {
      return generateLocalComparisonReport(foundElements[0], foundElements[1]);
    }
  }

  // 2. Check for single element lookup
  const found = findElementsInText(q);
  if (found.length > 0) {
    return generateLocalElementReport(found[0]);
  }

  // 3. Fallback generic response
  return `I am currently running on my **Local Database Engine** because no Gemini API key is provided.

I can give you instant detailed reports on any element (e.g. ask *"Tell me about Oxygen"* or *"melting point of Iron"*) or compare two elements (e.g. *"compare Copper and Zinc"*).

To unlock my full generative AI brain and ask arbitrary questions (like explaining covalent bonds, balancing equations, etc.), please paste a **Google Gemini API Key** in the settings panel on the left!`;
}

function findElementsInText(text) {
  const matches = [];
  elementsDataEn.forEach((el) => {
    const name = el.name.toLowerCase();
    const symbol = el.symbol.toLowerCase();
    
    // Check word boundaries to prevent matching short symbols inside other words
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

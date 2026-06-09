import { initTabs } from "./core/tabs.js";
import { initTrends } from "./features/trends.js";
import { initAI } from "./features/ai.js";
import { initCompare } from "./features/compare.js";
import { initShowcase } from "./features/showcase3d.js";
import { initSimulators } from "./features/simulators.js";
import { initReference } from "./features/reference.js";

export let lockedElement = null;
export let elementsDataEn = [];
export let magneticProperties = {};
export let isotopesDatabase = {};
let activeCategoryFilter = null; // Tracks active category spotlight filter
let categoriesList = [];

// Helper to normalize category name into a CSS class
export function getNormalizedCategoryClass(category) {
  if (!category) return "";
  let cat = category.toLowerCase().trim();

  if (cat.includes("lanthanide")) return "lanthanide-metal";
  if (cat.includes("actinide")) return "actinide-metal";
  if (cat.includes("alkali metal")) return "alkali-metal";
  if (cat.includes("alkaline earth")) return "alkaline-earth-metal";
  if (cat.includes("post-transition")) return "post-transition-metal";
  if (cat.includes("transition metal")) return "transition-metal";
  if (cat.includes("noble gas")) return "noble-gas";
  if (cat.includes("diatomic nonmetal")) return "diatomic-nonmetal";
  if (cat.includes("polyatomic nonmetal")) return "polyatomic-nonmetal";
  if (cat.includes("metalloid")) return "metalloid";

  return cat.replace(/\s+/g, "-");
}

// Asynchronously load Periodic Elements database from JSON
async function getDataFromJsonEn() {
  let fetchedData = null;
  try {
    const [engData, magnetismData, isotopesData] = await Promise.all([
      fetch("./data/JSON/elements_en.json").then((res) => {
        if (!res.ok) throw new Error("Failed to load elements catalog");
        return res.json();
      }),
      fetch("./data/JSON/magnetic_properties.json").then((res) => {
        if (!res.ok) throw new Error("Failed to load magnetic properties");
        return res.json();
      }),
      fetch("./data/JSON/isotopes.json").then((res) => {
        if (!res.ok) throw new Error("Failed to load isotopes guide");
        return res.json();
      })
    ]);
    fetchedData = { engData, magnetismData, isotopesData };
  } catch (err) {
    console.error("API connection failure:", err);
    showErrorOverlay(err.message || "Failed to load database. Please check your internet connection.");
    return;
  }

  if (!fetchedData) return;
  elementsDataEn.push(...fetchedData.engData.elements);
  Object.assign(magneticProperties, fetchedData.magnetismData);
  Object.assign(isotopesDatabase, fetchedData.isotopesData);

  const main = document.getElementById("main");
  if (!main) return;
  
  lockedElement = elementsDataEn[0]; // Set default active element
  
  // Extract unique categories dynamically from loaded elements database
  const uniqueCategories = [...new Set(elementsDataEn.map(el => el.category))]
    .filter(cat => cat && !cat.toLowerCase().includes("unknown"));
  categoriesList = uniqueCategories.map(cat => ({
    en: cat,
    class: getNormalizedCategoryClass(cat)
  }));

  renderCategoriesGuide(); // Generate categories pills dynamically

  // Optimize DOM updates using a DocumentFragment (avoids 119 consecutive reflows)
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < elementsDataEn.length; i++) {
    const element = elementsDataEn[i];

    const elementDiv = document.createElement("div");
    elementDiv.classList.add("element");
    elementDiv.classList.add(element.name); // Handle space names

    // Add exact category representation class for CSS highlighting and spotlight filtering
    const normalizedClass = getNormalizedCategoryClass(element.category);
    if (normalizedClass) {
      elementDiv.classList.add(normalizedClass);
    }

    const elementsName = element.name;
    const elementsSymbol = element.symbol;
    const atomicNumber = element.number;

    const atomNameDiv = document.createElement("div");
    atomNameDiv.classList.add("atom-name");

    const atomSymbolsDiv = document.createElement("div");
    atomSymbolsDiv.classList.add("atom-symbol");

    const atomicNumberDiv = document.createElement("div");
    atomicNumberDiv.classList.add("atomic-number");

    atomicNumberDiv.textContent = atomicNumber;
    atomNameDiv.textContent = elementsName;
    atomSymbolsDiv.textContent = elementsSymbol;

    elementDiv.style.gridColumn = element.xpos;
    elementDiv.style.gridRow = element.ypos;

    elementDiv.appendChild(atomicNumberDiv);
    elementDiv.appendChild(atomSymbolsDiv);
    elementDiv.appendChild(atomNameDiv);

    // Apply block border classification classes
    if (element.exception) {
      elementDiv.classList.add("exception");
      elementDiv.classList.add("s-group");
    } else if (element.block === "s") {
      elementDiv.classList.add("s-group");
    } else if (element.block === "p") {
      elementDiv.classList.add("p-group");
    } else if (element.block === "d") {
      elementDiv.classList.add("d-group");
    } else if (element.block === "f") {
      elementDiv.classList.add("f-group");
    }

    // Cache DOM reference for O(1) runtime operations
    element.cellElement = elementDiv;

    elementDiv.addEventListener("mouseleave", () => {
      // Revert dashboard back to currently locked element
      if (lockedElement) {
        updateActiveDashboard(lockedElement);
      }
    });

    elementDiv.addEventListener("click", (e) => {
      e.stopPropagation();
      lockedElement = element;
      updateActiveDashboard(element);
      highlightElementCell(elementDiv);
      
      // Track recently viewed elements for the AI Assistant's landing page
      try {
        let recent = JSON.parse(localStorage.getItem("recent_elements") || "[]");
        recent = recent.filter(s => s !== element.symbol);
        recent.unshift(element.symbol);
        recent = recent.slice(0, 3);
        localStorage.setItem("recent_elements", JSON.stringify(recent));
      } catch (err) {
        console.error("Error saving recent element:", err);
      }
    });

    fragment.appendChild(elementDiv);
  }

  main.appendChild(fragment);

  // Pre-load default active element dashboard state
  updateActiveDashboard(lockedElement);

  // Initialize modular routing tabs navigator
  initTabs({
    table: () => {
      resetGridColoring();
    },
    trends: () => {
      initTrends();
    },
    ai: () => {
      initAI();
    },
    compare: () => {
      initCompare();
    },
    showcase: () => {
      initShowcase();
    },
    simulators: () => {
      initSimulators();
    },
    reference: () => {
      initReference();
    }
  });
}

// Low latency updater to refresh the premium Dynamic Dashboard header box
function updateActiveDashboard(element) {
  if (!element) return;

  // Left Panel card properties
  document.getElementById("activeNumber").textContent = element.number;
  document.getElementById("activeMass").textContent = (typeof element.atomic_mass === "number")
    ? element.atomic_mass.toFixed(3)
    : (element.atomic_mass || "Unknown");
  document.getElementById("activeSymbol").textContent = element.symbol;
  document.getElementById("activeNameEn").textContent = element.name;

  // Right Panel Console metrics
  const displayCat =
    element.category.charAt(0).toUpperCase() + element.category.slice(1);
  document.getElementById("activeCategory").textContent = displayCat;

  document.getElementById("activeConfig").textContent =
    element.electron_configuration;

  const electroneg = element.electronegativity_pauling;
  document.getElementById("activeElectronegativity").textContent = electroneg
    ? `${electroneg} Pauling`
    : "Unknown";

  document.getElementById("activePhase").textContent = element.phase;

  // Dynamic scientific summary description
  document.getElementById("activeSummary").textContent =
    element.summary ||
    "No scientific summary available for this element. Details will be populated on chemical updates.";
}

// Renders the Categories Guide Pill list inside the slate dashboard
function renderCategoriesGuide() {
  const container = document.getElementById("categoryPillsWrapper");
  if (!container) return;
  container.innerHTML = "";

  const fragment = document.createDocumentFragment();

  categoriesList.forEach((cat) => {
    const pillBtn = document.createElement("button");
    pillBtn.classList.add("category-pill");

    // Circle indicator
    const dot = document.createElement("div");
    dot.classList.add("pill-dot");
    dot.classList.add(cat.class);

    // English label
    const labelSpan = document.createElement("span");
    const formattedLabel = cat.en.charAt(0).toUpperCase() + cat.en.slice(1);
    labelSpan.textContent = formattedLabel;

    pillBtn.appendChild(dot);
    pillBtn.appendChild(labelSpan);

    // Interactive category click filtering controls
    pillBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleCategorySpotlight(cat.en, pillBtn);
    });

    fragment.appendChild(pillBtn);
  });

  container.appendChild(fragment);
}

// Reset filter triggers when clicking on the page body
document.body.addEventListener("click", () => {
  if (activeCategoryFilter) {
    const main = document.getElementById("main");
    const allPills = document.querySelectorAll(".category-pill");

    activeCategoryFilter = null;
    main.classList.remove("update-category");
    main.classList.remove("dim-elements");
    
    // Spotlight clean up using pre-cached DOM cells
    elementsDataEn.forEach((el) => {
      if (el.cellElement) {
        el.cellElement.classList.remove("highlighted-element");
      }
    });

    allPills.forEach((p) => {
      p.classList.remove("active-category");
    });
  }
});

// Toggles element grid spotlights: Dims all elements in the periodic table except matching category
function toggleCategorySpotlight(category, clickedPill) {
  const main = document.getElementById("main");
  const allPills = document.querySelectorAll(".category-pill");

  // If clicked pill was already active, turn off spotlight filtering completely
  if (activeCategoryFilter === category) {
    activeCategoryFilter = null;
    main.classList.remove("update-category");
    main.classList.remove("dim-elements");
    elementsDataEn.forEach((el) => {
      if (el.cellElement) {
        el.cellElement.classList.remove("highlighted-element");
      }
    });
    allPills.forEach((p) => {
      p.classList.remove("active-category");
    });
    return;
  }

  // Set clicked category as active filter
  activeCategoryFilter = category;
  main.classList.add("update-category");

  // Toggle active styling states on pills
  allPills.forEach((p) => {
    p.classList.remove("active-category");
  });

  clickedPill.classList.add("active-category");

  // Spotlight matching grid elements using pre-cached DOM cells
  const cssClass = getNormalizedCategoryClass(category);
  elementsDataEn.forEach((el) => {
    const cell = el.cellElement;
    if (!cell) return;
    if (cell.classList.contains(cssClass)) {
      cell.classList.add("highlighted-element");
    } else {
      cell.classList.remove("highlighted-element");
    }
  });
}

// Interactive cell dynamic lock animations
function highlightElementCell(elementDiv) {
  setTimeout(() => {
    elementDiv.style.transform = "";
  }, 200);
}

export function resetGridColoring() {
  elementsDataEn.forEach((data) => {
    const el = data.cellElement;
    if (!el) return;
    
    el.style.backgroundColor = "";
    el.style.borderColor = "";
    el.style.opacity = "";
    el.style.transform = "";
    
    const normalizedClass = getNormalizedCategoryClass(data.category);
    el.className = `element ${data.name} ${normalizedClass}`;
    if (data.exception) {
      el.classList.add("exception", "s-group");
    } else if (data.block) {
      el.classList.add(`${data.block}-group`);
    }
  });
  
  const main = document.getElementById("main");
  if (main) {
    main.classList.remove("dim-elements");
    main.classList.remove("update-category");
  }
}

// Premium floating connection error overlay
function showErrorOverlay(errorMessage) {
  if (document.getElementById("db-error-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "db-error-overlay";
  overlay.className = "error-overlay";

  overlay.innerHTML = `
    <div class="error-card">
      <div class="error-icon">⚠️</div>
      <h2 class="error-title">Database Connection Error</h2>
      <p class="error-text">There was a problem loading the elements database details: <strong>${errorMessage}</strong></p>
      <button class="error-retry-btn" onclick="window.location.reload()">Retry Connection</button>
    </div>
  `;

  document.body.appendChild(overlay);
}

// Trigger dynamic initialization on script load
getDataFromJsonEn();
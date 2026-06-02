// Bilingual translation dictionary for elements
const arabicNames = {
  "Hydrogen": "هيدروجين", "Helium": "هيليوم", "Lithium": "ليثيوم", "Beryllium": "بيريليوم",
  "Boron": "بورون", "Carbon": "كربون", "Nitrogen": "نيتروجين", "Oxygen": "أكسجين",
  "Fluorine": "فلور", "Neon": "نيون", "Sodium": "صوديوم", "Magnesium": "ماغنيسيوم",
  "Aluminium": "ألومنيوم", "Silicon": "سيليكون", "Phosphorus": "فسفور", "Sulfur": "كبريت",
  "Chlorine": "كلور", "Argon": "أرغون", "Potassium": "بوتاسيوم", "Calcium": "كالسيوم",
  "Scandium": "سكانديوم", "Titanium": "تيتانيوم", "Vanadium": "فاناديوم", "Chromium": "كروم",
  "Manganese": "منغنيز", "Iron": "حديد", "Cobalt": "كوبالت", "Nickel": "نيكل",
  "Copper": "نحاس", "Zinc": "زنك", "Gallium": "غاليوم", "Germanium": "جرمانيوم",
  "Arsenic": "زرنيخ", "Selenium": "سيلينيوم", "Bromine": "بروم", "Krypton": "كريبتون"
};

// Bilingual category dictionary
const arabicCategories = {
  "diatomic nonmetal": "لا فلز ثنائي",
  "alkali metal": "فلز قلوي",
  "alkaline earth metal": "فلز ترابي",
  "transition metal": "فلز انتقالي",
  "post-transition metal": "فلز ضعيف",
  "metalloid": "شبه فلز",
  "polyatomic nonmetal": "لا فلز متعدد",
  "noble gas": "غاز نبيل",
  "lanthanide": "لانثانيد",
  "actinide": "أكتينيد"
};

// List of all elements globally cached once loaded
let loadedElements = [];
let lockedElement = null; // Tracks clicked/locked element
let activeCategoryFilter = null; // Tracks active category spotlight filter

// Helper to normalize category name into a CSS class that matches our table stylesheet
function getNormalizedCategoryClass(category) {
  if (!category) return "";
  let cat = category.toLowerCase().trim();
  
  if (cat.includes("lanthanide")) return "lanthanide-metal";
  if (cat.includes("actinide")) return "actinide-metal";
  if (cat.includes("alkali metal")) return "alkali-metal";
  if (cat.includes("alkaline earth")) return "alkaline-earth-metal";
  if (cat.includes("transition metal")) return "transition-metal";
  if (cat.includes("post-transition")) return "post-transition-metal";
  if (cat.includes("noble gas")) return "noble-gas";
  if (cat.includes("diatomic nonmetal")) return "diatomic-nonmetal";
  if (cat.includes("polyatomic nonmetal")) return "polyatomic-nonmetal";
  if (cat.includes("metalloid")) return "metalloid";
  
  return cat.replace(/\s+/g, "-");
}

// Dynamic Categories to generate Pills
const categoriesList = [
  { en: "diatomic nonmetal", class: "diatomic-nonmetal" },
  { en: "alkali metal", class: "alkali-metal" },
  { en: "alkaline earth metal", class: "alkaline-earth-metal" },
  { en: "transition metal", class: "transition-metal" },
  { en: "post-transition metal", class: "post-transition-metal" },
  { en: "metalloid", class: "metalloid" },
  { en: "polyatomic nonmetal", class: "polyatomic-nonmetal" },
  { en: "noble gas", class: "noble-gas" },
  { en: "lanthanide", class: "lanthanide-metal" },
  { en: "actinide", class: "actinide-metal" }
];

// Asynchronously load Periodic Elements database from JSON
async function getDataFromJson() {
  const result = await fetch("./data/elements.json")
    .then((res) => res.json())
    .catch((err) => console.log(err));

  if (!result || !result.elements) return;
  
  loadedElements = result.elements;
  lockedElement = loadedElements[0]; // Default lock on Hydrogen on load

  const main = document.getElementById("main");
  
  // Render Categories Guide dynamically
  renderCategoriesGuide();

  // Loop through loaded elements strictly within index limits (i < elements.length) to prevent crashes
  for (let i = 0; i < loadedElements.length; i++) {
    const element = loadedElements[i];
    
    const elementDiv = document.createElement("div");
    elementDiv.classList.add("element");
    elementDiv.classList.add(element.name.replace(/\s+/g, "-")); // Handle space names
    
    // Add exact category representation class for CSS highlighting
    const categoryClass = getNormalizedCategoryClass(element.category);
    elementDiv.classList.add(categoryClass);

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

    // Dynamic Hover / Click State Management for pixel-perfect low latency DOM interaction
    elementDiv.addEventListener("mouseenter", () => {
      updateActiveDashboard(element);
    });

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
    });

    main.appendChild(elementDiv);
  }

  // Pre-load default active element dashboard state
  updateActiveDashboard(lockedElement);
}

// Low latency updater to refresh the premium Dynamic Dashboard header box
function updateActiveDashboard(element) {
  if (!element) return;
  
  // Left Panel card properties
  document.getElementById('activeNumber').textContent = element.number;
  document.getElementById('activeMass').textContent = parseFloat(element.atomic_mass).toFixed(3);
  document.getElementById('activeSymbol').textContent = element.symbol;
  document.getElementById('activeNameEn').textContent = element.name;
  
  const arName = arabicNames[element.name] || "";
  document.getElementById('activeNameAr').textContent = arName;

  // Right Panel Console metrics
  const displayCat = element.category.charAt(0).toUpperCase() + element.category.slice(1);
  const arCat = arabicCategories[element.category] || "";
  document.getElementById('activeCategory').textContent = `${displayCat} | ${arCat}`;
  
  document.getElementById('activeConfig').textContent = element.electron_configuration || "N/A";
  
  const electroneg = element.electronegativity_pauling;
  document.getElementById('activeElectronegativity').textContent = electroneg ? `${electroneg} Pauling` : "N/A | لا يوجد";
  
  document.getElementById('activePhase').textContent = element.phase || "Solid";
  
  // Dynamic scientific summary description
  document.getElementById('activeSummary').textContent = element.summary || "No scientific summary available for this element. Details will be populated on chemical updates.";
}

// Renders the Categories Guide Pill list inside the slate dashboard
function renderCategoriesGuide() {
  const container = document.getElementById("categoryPillsWrapper");
  if (!container) return;
  
  container.innerHTML = "";

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

    // Interactive category hover / click filtering controls
    pillBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleCategorySpotlight(cat.en, pillBtn);
    });

    container.appendChild(pillBtn);
  });
}

// Toggles element grid spotlights: Dims all elements in the periodic table except matching category
function toggleCategorySpotlight(category, clickedPill) {
  const main = document.getElementById("main");
  const allElements = document.querySelectorAll(".element");
  const allPills = document.querySelectorAll(".category-pill");

  // If clicked pill was already active, turn off spotlight filtering completely
  if (activeCategoryFilter === category) {
    activeCategoryFilter = null;
    main.classList.remove("dim-elements");
    allElements.forEach(el => el.classList.remove("highlighted-element"));
    allPills.forEach(p => {
      p.classList.remove("active-category");
      // Remove Arabic dynamic label inside pill on deactivate
      const arLabel = p.querySelector(".pill-ar-label");
      if (arLabel) arLabel.remove();
    });
    return;
  }

  // Set clicked category as active filter
  activeCategoryFilter = category;
  main.classList.add("dim-elements");

  // Toggle active styling states on pills
  allPills.forEach(p => {
    p.classList.remove("active-category");
    const arLabel = p.querySelector(".pill-ar-label");
    if (arLabel) arLabel.remove();
  });

  clickedPill.classList.add("active-category");
  
  // Inject Arabic subscript dynamic translation label into active pill
  const arLabel = document.createElement("span");
  arLabel.classList.add("pill-ar-label");
  arLabel.textContent = arabicCategories[category] || "";
  clickedPill.appendChild(arLabel);

  // Spotlight matching grid elements
  const cssClass = getNormalizedCategoryClass(category);
  allElements.forEach(el => {
    if (el.classList.contains(cssClass)) {
      el.classList.add("highlighted-element");
    } else {
      el.classList.remove("highlighted-element");
    }
  });
}

// Interactive cell dynamic lock animations
function highlightElementCell(elementDiv) {
  elementDiv.style.transform = "scale(1.3)";
  setTimeout(() => {
    elementDiv.style.transform = "";
  }, 200);
}

// Reset filter triggers when clicking on the page body
document.body.addEventListener("click", () => {
  if (activeCategoryFilter) {
    const main = document.getElementById("main");
    const allElements = document.querySelectorAll(".element");
    const allPills = document.querySelectorAll(".category-pill");
    
    activeCategoryFilter = null;
    main.classList.remove("dim-elements");
    allElements.forEach(el => el.classList.remove("highlighted-element"));
    allPills.forEach(p => {
      p.classList.remove("active-category");
      const arLabel = p.querySelector(".pill-ar-label");
      if (arLabel) arLabel.remove();
    });
  }
});

// Dynamic Navigation Pill switching interaction
function setupNavigationPills() {
  const pills = document.querySelectorAll(".nav-pill");
  pills.forEach(pill => {
    pill.addEventListener("click", () => {
      pills.forEach(p => p.classList.remove("active-pill"));
      pill.classList.add("active-pill");
    });
  });
}

// Trigger dynamic initialization on script load
getDataFromJson();
setupNavigationPills();

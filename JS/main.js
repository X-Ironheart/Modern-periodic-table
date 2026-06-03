let lockedElement = null;
let activeCategoryFilter = null; // Tracks active category spotlight filter

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
  "actinide": "أكتينيد",
};

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
  { en: "actinide", class: "actinide-metal" },
];

// Helper to normalize category name into a CSS class
function getNormalizedCategoryClass(category) {
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
  const result = await fetch("./data/JSON/elements.json")
    .then((res) => res.json())
    .catch((err) => {
      console.log(err);
      main.style.display = "none";
      document.body.style.display = "flex";
      document.body.style.alignItems = "center";
      document.body.style.justifyContent = "center";
      document.body.style.width = `100vw`;
      document.body.style.height = `100vh`;
      const errCollection = document.createElement(`div`);
      errCollection.style.display = "flex";
      errCollection.style.flexDirection = "column";
      errCollection.style.alignItems = "center";
      errCollection.style.justifyContent = "center";

      const errLog = document.createElement("div");
      const errText = document.createTextNode(new Error(`No API Found`));
      errLog.appendChild(errText);
      errLog.style.color = "#eee";
      errLog.style.fontSize = "30px";

      const megToDev = document.createElement("div");
      const tellToDev = document.createTextNode(
        `Hi There, You Are Trying To Find Nothing In This Shit Website So Please Get Out From Here :)`,
      );
      megToDev.appendChild(tellToDev);
      megToDev.style.color = "#eee";
      megToDev.style.textAlign = errLog.style.textAlign = "center";

      errCollection.appendChild(errLog);
      errCollection.appendChild(megToDev);
      document.body.appendChild(errCollection);
    });

  const main = document.getElementById("main");
  
  lockedElement = result.elements[0]; // Set default active element
  renderCategoriesGuide(); // Generate categories pills dynamically

  for (let i = 0; i < result.elements.length; i++) {
    console.log(result.elements[i]);
    const element = result.elements[i];

    const elementDiv = document.createElement("div");
    elementDiv.classList.add("element");
    elementDiv.classList.add(element.name); // Handle space names

    // Add exact category representation class for CSS highlighting
    elementDiv.classList.add(element.category.replace(/\s+/g, "-"));

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

    elementDiv.style.gridColumn = result.elements[i].xpos;
    elementDiv.style.gridRow = result.elements[i].ypos;

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

    if (result.elements[i].category.includes("alkaline earth")) {
      elementDiv.classList.add("alkaline-earth-metal");
    } else if (result.elements[i].category.includes("alkali metal")) {
      elementDiv.classList.add("alkali-metal");
    } else if (result.elements[i].category.includes("post-transition")) {
      elementDiv.classList.add("post-transition-metal");
    } else if (result.elements[i].category.includes("transition metal")) {
      elementDiv.classList.add("transition-metal");
    } else if (result.elements[i].category.includes("metalloid")) {
      elementDiv.classList.add("metalloid");
    } else if (result.elements[i].category.includes("diatomic nonmetal")) {
      elementDiv.classList.add("diatomic-nonmetal");
    } else if (result.elements[i].category.includes("noble gas")) {
      elementDiv.classList.add("noble-gas");
    } else if (result.elements[i].category.includes("polyatomic nonmetal")) {
      elementDiv.classList.add("polyatomic-nonmetal");
    } else if (result.elements[i].category.includes("lanthanide")) {
      elementDiv.classList.add("lanthanide-metal");
    } else if (result.elements[i].category.includes("actinide")) {
      elementDiv.classList.add("actinide-metal");
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
  document.getElementById("activeNumber").textContent = element.number;
  document.getElementById("activeMass").textContent = parseFloat(
    element.atomic_mass,
  ).toFixed(3);
  document.getElementById("activeSymbol").textContent = element.symbol;
  document.getElementById("activeNameEn").textContent = element.name;

  const arName = element.arabic_name || "";
  document.getElementById("activeNameAr").textContent = arName;

  // Right Panel Console metrics
  const displayCat =
    element.category.charAt(0).toUpperCase() + element.category.slice(1);
  const arCat = arabicCategories[element.category] || "";
  document.getElementById("activeCategory").textContent =
    `${displayCat} | ${arCat}`;

  document.getElementById("activeConfig").textContent =
    element.electron_configuration || "N/A";

  const electroneg = element.electronegativity_pauling;
  document.getElementById("activeElectronegativity").textContent = electroneg
    ? `${electroneg} Pauling`
    : "N/A | لا يوجد";

  document.getElementById("activePhase").textContent = element.phase || "Solid";

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

    container.appendChild(pillBtn);
  });
}

// Reset filter triggers when clicking on the page body
document.body.addEventListener("click", () => {
  if (activeCategoryFilter) {
    const main = document.getElementById("main");
    const allElements = document.querySelectorAll(".element");
    const allPills = document.querySelectorAll(".category-pill");

    activeCategoryFilter = null;
    main.classList.remove("dim-elements");
    allElements.forEach((el) => el.classList.remove("highlighted-element"));
    allPills.forEach((p) => {
      p.classList.remove("active-category");
      const arLabel = p.querySelector(".pill-ar-label");
      if (arLabel) arLabel.remove();
    });
  }
});

// Toggles element grid spotlights: Dims all elements in the periodic table except matching category
function toggleCategorySpotlight(category, clickedPill) {
  const main = document.getElementById("main");
  const allElements = document.querySelectorAll(".element");
  const allPills = document.querySelectorAll(".category-pill");

  // If clicked pill was already active, turn off spotlight filtering completely
  if (activeCategoryFilter === category) {
    activeCategoryFilter = null;
    main.classList.remove("dim-elements");
    allElements.forEach((el) => el.classList.remove("highlighted-element"));
    allPills.forEach((p) => {
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
  allPills.forEach((p) => {
    p.classList.remove("active-category");
    const arLabel = p.querySelector(".pill-ar-label");
    if (arLabel) arLabel.remove();
  });

  clickedPill.classList.add("active-category");

  // Spotlight matching grid elements
  const cssClass = getNormalizedCategoryClass(category);
  allElements.forEach((el) => {
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

// Dynamic Navigation Pill switching interaction
function setupNavigationPills() {
  const pills = document.querySelectorAll(".nav-pill");
  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      pills.forEach((p) => p.classList.remove("active-pill"));
      pill.classList.add("active-pill");
    });
  });
}

// Trigger dynamic initialization on script load
getDataFromJsonEn();
setupNavigationPills();

let lockedElement = null;
let lockedElementAr = null;
let elementsDataEn = [];
let elementsDataAr = [];
let activeCategoryFilter = null; // Tracks active category spotlight filter



// Dynamic Categories to generate Pills (extracted dynamically from JSON)
let categoriesList = [];

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
  const [engData, arData] = await Promise.all([
    fetch("./data/JSON/elements_en.json").then((res) => res.json()),
    fetch("./data/JSON/elements_ar.json").then((res) => res.json())
  ]).catch((err) => {
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

  elementsDataEn = engData.elements;
  elementsDataAr = arData.elements;

  const main = document.getElementById("main");
  
  lockedElement = elementsDataEn[0]; // Set default active element
  lockedElementAr = elementsDataAr[0];
  
  // Extract unique categories dynamically from loaded elements database (excluding unknown categories for a cleaner UI)
  const uniqueCategories = [...new Set(elementsDataEn.map(el => el.category))]
    .filter(cat => cat && !cat.toLowerCase().includes("unknown"));
  categoriesList = uniqueCategories.map(cat => {
    const matchingElIndex = elementsDataEn.findIndex(el => el.category === cat);
    const matchingArEl = matchingElIndex !== -1 ? elementsDataAr[matchingElIndex] : null;
    return {
      en: cat,
      ar: matchingArEl ? matchingArEl.arabic_category : cat,
      class: getNormalizedCategoryClass(cat)
    };
  });

  renderCategoriesGuide(); // Generate categories pills dynamically

  for (let i = 0; i < elementsDataEn.length; i++) {
    const element = elementsDataEn[i];
    const arElement = elementsDataAr[i];

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

    elementDiv.style.gridColumn = elementsDataEn[i].xpos;
    elementDiv.style.gridRow = elementsDataEn[i].ypos;

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
      updateActiveDashboard(element, arElement);
    });

    elementDiv.addEventListener("mouseleave", () => {
      // Revert dashboard back to currently locked element
      if (lockedElement && lockedElementAr) {
        updateActiveDashboard(lockedElement, lockedElementAr);
      }
    });

    elementDiv.addEventListener("click", (e) => {
      e.stopPropagation();
      lockedElement = element;
      lockedElementAr = arElement;
      updateActiveDashboard(element, arElement);
      highlightElementCell(elementDiv);
    });

    main.appendChild(elementDiv);
  }

  // Pre-load default active element dashboard state
  updateActiveDashboard(lockedElement, lockedElementAr);
}

// Low latency updater to refresh the premium Dynamic Dashboard header box
function updateActiveDashboard(element, arElement) {

  // Left Panel card properties
  document.getElementById("activeNumber").textContent = element.number;
  document.getElementById("activeMass").textContent = parseFloat(
    element.atomic_mass,
  ).toFixed(3);
  document.getElementById("activeSymbol").textContent = element.symbol;
  document.getElementById("activeNameEn").textContent = element.name;

  const arName = arElement.name || "";
  document.getElementById("activeNameAr").textContent = arName;

  // Right Panel Console metrics
  const displayCat =
    element.category.charAt(0).toUpperCase() + element.category.slice(1);
  document.getElementById("activeCategory").textContent =
    `${displayCat}`;

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
    const formattedLabel = cat.en.charAt(0).toUpperCase() + cat.en.slice(1); // Convert To Css Code
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
  });

  clickedPill.classList.add("active-category");

  // Add Arabic dynamic label inside active pill for premium bilingual feedback
  const catObj = categoriesList.find(c => c.en === category);
  const arCatName = catObj ? catObj.ar : "";
  if (arCatName) {
    const arLabelSpan = document.createElement("span");
    arLabelSpan.classList.add("pill-ar-label");
    arLabelSpan.textContent = arCatName;
    clickedPill.appendChild(arLabelSpan);
  }

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
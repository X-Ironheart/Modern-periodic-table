import { elementsDataEn, isotopesDatabase } from "../main.js";

let activeSortCol = "number";
let isSortAsc = true;
let searchFilter = "";

export function initReference() {
  const refTabs = document.querySelectorAll(".ref-tab-btn");
  const subPanels = document.querySelectorAll(".ref-sub-panel");
  const searchInput = document.getElementById("ref-list-search");
  const tableHeaders = document.querySelectorAll(".ref-elements-table th");
  const isotopeSelect = document.getElementById("isotope-el-select");

  // Tab switching
  refTabs.forEach((tab) => {
    tab.onclick = () => {
      refTabs.forEach((t) => t.classList.remove("active-ref-tab"));
      tab.classList.add("active-ref-tab");
      
      subPanels.forEach((p) => p.classList.remove("active-ref-panel"));
      
      const refType = tab.getAttribute("data-ref");
      const targetPanel = document.getElementById(`ref-panel-${refType}`);
      if (targetPanel) {
        targetPanel.classList.add("active-ref-panel");
      }

      if (refType === "list") {
        renderElementsTable();
      } else if (refType === "isotopes") {
        initIsotopeSelectors();
      }
    };
  });

  // Table sorting
  tableHeaders.forEach((th) => {
    th.onclick = () => {
      const col = th.getAttribute("data-sort");
      if (activeSortCol === col) {
        isSortAsc = !isSortAsc; // Toggle direction
      } else {
        activeSortCol = col;
        isSortAsc = true;
      }
      renderElementsTable();
    };
  });

  // Search filter typing
  searchInput.oninput = (e) => {
    searchFilter = e.target.value.toLowerCase().trim();
    renderElementsTable();
  };

  // Populate isotope elements list if empty
  if (isotopeSelect.children.length === 0) {
    elementsDataEn.forEach((el) => {
      const opt = document.createElement("option");
      opt.value = el.number;
      opt.textContent = `${el.number} - ${el.name} (${el.symbol})`;
      isotopeSelect.appendChild(opt);
    });

    isotopeSelect.onchange = (e) => renderIsotopesForElement(parseInt(e.target.value));
  }

  // Draw default view
  renderElementsTable();
}

function renderElementsTable() {
  const tbody = document.getElementById("ref-table-body");
  tbody.innerHTML = "";

  // Filter
  let filtered = elementsDataEn.filter((el) => {
    if (!searchFilter) return true;
    return (
      el.name.toLowerCase().includes(searchFilter) ||
      el.symbol.toLowerCase().includes(searchFilter) ||
      el.category.toLowerCase().includes(searchFilter) ||
      el.number.toString() === searchFilter
    );
  });

  // Sort
  filtered.sort((a, b) => {
    let valA = a[activeSortCol];
    let valB = b[activeSortCol];

    // Handle nested arrays or specialized comparisons
    if (activeSortCol === "melt" || activeSortCol === "boil" || activeSortCol === "density") {
      valA = valA === null ? -1 : valA;
      valB = valB === null ? -1 : valB;
    }

    if (valA < valB) return isSortAsc ? -1 : 1;
    if (valA > valB) return isSortAsc ? 1 : -1;
    return 0;
  });

  // Render rows using a DocumentFragment to minimize browser reflows
  const fragment = document.createDocumentFragment();

  filtered.forEach((el) => {
    const tr = document.createElement("tr");

    const formattedMass = (typeof el.atomic_mass === "number") 
      ? el.atomic_mass.toFixed(4) 
      : (el.atomic_mass || "Unknown");

    tr.innerHTML = `
      <td>${el.number}</td>
      <td><strong>${el.symbol}</strong></td>
      <td>${el.name}</td>
      <td>${formattedMass}</td>
      <td>${el.category}</td>
      <td>${(el.density !== null && el.density !== undefined && typeof el.density === 'number') ? el.density.toFixed(4) : "Unknown"}</td>
      <td>${el.melt !== null ? el.melt : "Unknown"}</td>
      <td>${el.boil !== null ? el.boil : "Unknown"}</td>
    `;
    fragment.appendChild(tr);
  });

  tbody.appendChild(fragment);
}

function initIsotopeSelectors() {
  const select = document.getElementById("isotope-el-select");
  if (!select.value) {
    select.value = 1;
  }
  renderIsotopesForElement(parseInt(select.value));
}

function renderIsotopesForElement(atomicNo) {
  const title = document.getElementById("isotopes-el-title");
  const container = document.getElementById("isotopes-cards-container");
  container.innerHTML = "";

  const element = elementsDataEn.find(el => el.number === atomicNo);
  if (!element) return;

  title.textContent = `${element.name} (${element.symbol}) Isotopes`;

  let isotopes = isotopesDatabase[atomicNo] || isotopesDatabase[String(atomicNo)];
  if (!isotopes) {
    // Generate placeholder isotopes based on elements atomic mass
    const nominalMass = Math.round(element.atomic_mass || 1);
    isotopes = [
      {
        name: `${element.name}-${nominalMass - 1}`,
        mass: (typeof element.atomic_mass === 'number') ? (element.atomic_mass - 0.998).toFixed(4) : "Unknown",
        abundance: "Trace",
        halflife: "Unstable (minutes)",
        decay: "Beta / Gamma",
        use: "Scientific research, tracing experiments"
      },
      {
        name: `${element.name}-${nominalMass} (Stable)`,
        mass: (typeof element.atomic_mass === 'number') ? element.atomic_mass.toFixed(4) : "Unknown",
        abundance: "99.8%",
        halflife: "Stable",
        decay: "None",
        use: "Natural structural component, industrial standard"
      },
      {
        name: `${element.name}-${nominalMass + 1}`,
        mass: (typeof element.atomic_mass === 'number') ? (element.atomic_mass + 1.002).toFixed(4) : "Unknown",
        abundance: "0.2%",
        halflife: "Stable",
        decay: "None",
        use: "Geochemical dating, metabolic tracing studies"
      }
    ];
  }

  // Draw isotope cards using a DocumentFragment
  const fragment = document.createDocumentFragment();

  isotopes.forEach((iso) => {
    const card = document.createElement("div");
    card.classList.add("isotope-card");

    card.innerHTML = `
      <div class="isotope-header">
        <span class="isotope-name">${iso.name}</span>
        <span class="isotope-abundance">${iso.abundance}</span>
      </div>
      <div class="isotope-row">
        <span class="isotope-lbl">Atomic Mass:</span>
        <span class="isotope-val">${iso.mass} u</span>
      </div>
      <div class="isotope-row">
        <span class="isotope-lbl">Half-Life:</span>
        <span class="isotope-val">${iso.halflife}</span>
      </div>
      <div class="isotope-row">
        <span class="isotope-lbl">Decay Mode:</span>
        <span class="isotope-val">${iso.decay}</span>
      </div>
      <div class="isotope-row" style="flex-direction:column; gap:4px; margin-top:4px;">
        <span class="isotope-lbl">Key Application:</span>
        <span class="isotope-val" style="font-family:inherit; font-size:0.75rem; color:#94a3b8;">${iso.use}</span>
      </div>
    `;

    fragment.appendChild(card);
  });

  container.appendChild(fragment);
}

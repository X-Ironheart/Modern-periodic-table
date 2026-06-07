import { elementsDataEn } from "./main.js";

export function initCompare() {
  const select1 = document.getElementById("compare-el-1");
  const select2 = document.getElementById("compare-el-2");

  if (select1.children.length === 0) {
    // Populate dropdowns if empty
    elementsDataEn.forEach((el) => {
      const option1 = document.createElement("option");
      option1.value = el.number;
      option1.textContent = `${el.number} - ${el.name} (${el.symbol})`;
      select1.appendChild(option1);

      const option2 = document.createElement("option");
      option2.value = el.number;
      option2.textContent = `${el.number} - ${el.name} (${el.symbol})`;
      select2.appendChild(option2);
    });

    // Set defaults (Hydrogen vs Carbon)
    select1.value = 1;
    select2.value = 6;
  }

  // Bind change events
  select1.onchange = () => updateComparison();
  select2.onchange = () => updateComparison();

  // Run initial compare
  updateComparison();
}

function updateComparison() {
  const select1 = document.getElementById("compare-el-1");
  const select2 = document.getElementById("compare-el-2");
  
  const el1 = elementsDataEn.find(el => el.number === parseInt(select1.value));
  const el2 = elementsDataEn.find(el => el.number === parseInt(select2.value));

  if (!el1 || !el2) return;

  // Update Card 1
  document.getElementById("comp-num-1").textContent = el1.number;
  document.getElementById("comp-sym-1").textContent = el1.symbol;
  document.getElementById("comp-name-1").textContent = el1.name;
  renderStatsList("comp-stats-1", el1);

  // Update Card 2
  document.getElementById("comp-num-2").textContent = el2.number;
  document.getElementById("comp-sym-2").textContent = el2.symbol;
  document.getElementById("comp-name-2").textContent = el2.name;
  renderStatsList("comp-stats-2", el2);

  // Update Progress Gauges
  // Mass
  updateGaugeWidth("mass-bar-1", el1.atomic_mass, 300);
  updateGaugeWidth("mass-bar-2", el2.atomic_mass, 300);

  // Electronegativity
  updateGaugeWidth("neg-bar-1", el1.electronegativity_pauling || 0, 4.0);
  updateGaugeWidth("neg-bar-2", el2.electronegativity_pauling || 0, 4.0);

  // Melting Point
  updateGaugeWidth("melt-bar-1", el1.melt || 0, 4000);
  updateGaugeWidth("melt-bar-2", el2.melt || 0, 4000);

  // Density
  updateGaugeWidth("dens-bar-1", el1.density || 0, 25);
  updateGaugeWidth("dens-bar-2", el2.density || 0, 25);
}

function renderStatsList(containerId, el) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  const stats = [
    { label: "Category", val: el.category },
    { label: "Phase", val: el.phase },
    { label: "Electron Config", val: el.electron_configuration },
    { label: "Electronegativity", val: el.electronegativity_pauling ? `${el.electronegativity_pauling} Pauling` : "Unknown" },
    { label: "Melting Point", val: el.melt ? `${el.melt} K` : "Unknown" },
    { label: "Boiling Point", val: el.boil ? `${el.boil} K` : "Unknown" },
    { label: "Density", val: el.density ? `${el.density} g/cm³` : "Unknown" },
    { label: "Discoverer", val: el.discovered_by || "Unknown" }
  ];

  stats.forEach((s) => {
    const row = document.createElement("div");
    row.classList.add("comp-stat-row");

    const labelSpan = document.createElement("span");
    labelSpan.classList.add("comp-stat-lbl");
    labelSpan.textContent = s.label;

    const valSpan = document.createElement("span");
    valSpan.classList.add("comp-stat-val");
    valSpan.textContent = s.val;

    row.appendChild(labelSpan);
    row.appendChild(valSpan);
    container.appendChild(row);
  });
}

function updateGaugeWidth(id, value, maxBound) {
  const bar = document.getElementById(id);
  if (!bar) return;
  const percentage = Math.min(100, Math.max(0, (value / maxBound) * 100));
  bar.style.width = `${percentage}%`;
}

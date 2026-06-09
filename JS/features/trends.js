import { elementsDataEn } from "../main.js";

export function initTrends() {
  const trendButtons = document.querySelectorAll(".trend-btn");
  
  trendButtons.forEach((btn) => {
    // Re-bind click event to prevent duplicates
    btn.onclick = () => {
      trendButtons.forEach((b) => b.classList.remove("active-trend"));
      btn.classList.add("active-trend");
      const trendType = btn.getAttribute("data-tab") || btn.getAttribute("data-trend");
      applyHeatmap(trendType);
    };
  });

  // Default to Electronegativity on load
  const activeBtn = document.querySelector(".trend-btn.active-trend");
  if (activeBtn) {
    applyHeatmap(activeBtn.getAttribute("data-trend"));
  }
}

function applyHeatmap(type) {
  // 1. Gather values and find bounds
  let values = [];
  elementsDataEn.forEach((el) => {
    let val = getPropertyVal(el, type);
    if (val !== null && val !== undefined) {
      values.push(val);
    }
  });

  const min = Math.min(...values);
  const max = Math.max(...values);

  // 2. Map colors onto cached grid cells
  elementsDataEn.forEach((el) => {
    const cell = el.cellElement;
    if (!cell) return;

    let val = getPropertyVal(el, type);
    
    // Reset classes and style override
    cell.className = "element"; // Clear category colors
    
    if (val === null || val === undefined) {
      cell.style.backgroundColor = "#273142";
      cell.style.borderColor = "rgba(255,255,255,0.05)";
      cell.style.color = "#475569";
    } else {
      // Calculate normalized ratio
      const ratio = max === min ? 0.5 : (val - min) / (max - min);
      
      // HSL color gradient scale (Hue shifts from 240 [Blue] down to 0 [Red])
      const hue = Math.round(240 - (ratio * 240));
      
      cell.style.backgroundColor = `hsl(${hue}, 80%, 40%)`;
      cell.style.borderColor = `hsl(${hue}, 90%, 65%)`;
      cell.style.color = "#fff";
    }
  });
}

function getPropertyVal(el, type) {
  switch (type) {
    case "electronegativity":
      return el.electronegativity_pauling;
    case "radius":
      return el.atomic_radius || null;
    case "ionization":
      return (el.ionization_energies && el.ionization_energies.length > 0) 
        ? el.ionization_energies[0] 
        : null;
    case "mass":
      return el.atomic_mass;
    default:
      return null;
  }
}

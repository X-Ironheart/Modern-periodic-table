import { elementsDataEn, magneticProperties } from "../main.js";

let playInterval = null;
let currentSim = "thermo"; // "thermo" or "magnetism"

export function initSimulators() {
  const simTabs = document.querySelectorAll(".sim-tab-btn");
  const subPanels = document.querySelectorAll(".sim-sub-panel");
  const tempSlider = document.getElementById("thermo-temp-slider");
  const playBtn = document.getElementById("thermo-play-btn");

  // Tab Toggling
  simTabs.forEach((tab) => {
    tab.onclick = () => {
      simTabs.forEach((t) => t.classList.remove("active-sim-tab"));
      tab.classList.add("active-sim-tab");
      
      subPanels.forEach((p) => p.classList.remove("active-sub-panel"));
      
      const simType = tab.getAttribute("data-sim");
      currentSim = simType;
      
      const targetPanel = document.getElementById(`sim-panel-${simType}`);
      if (targetPanel) {
        targetPanel.classList.add("active-sub-panel");
      }

      // Stop heating autoplay if switching tabs
      if (simType !== "thermo") {
        stopAutoHeat();
      }

      applySimulationState();
    };
  });

  // Thermodynamics slider interactions
  tempSlider.oninput = () => {
    updateTemperatureDisplay(tempSlider.value);
    if (currentSim === "thermo") {
      applySimulationState();
    }
  };

  // Autoplay Play/Pause button
  playBtn.onclick = () => {
    if (playInterval) {
      stopAutoHeat();
    } else {
      startAutoHeat();
    }
  };

  // Run initial simulator draw
  applySimulationState();
}

function updateTemperatureDisplay(kelvin) {
  document.getElementById("temp-val-k").textContent = `${kelvin} K`;
  const celsius = Math.round(kelvin - 273.15);
  document.getElementById("temp-val-c").textContent = `${celsius} °C`;
}

function startAutoHeat() {
  const slider = document.getElementById("thermo-temp-slider");
  const playBtn = document.getElementById("thermo-play-btn");
  
  playBtn.classList.add("playing");
  playBtn.querySelector("span").textContent = "Pause Heat";
  // Change SVG icon to pause icon
  playBtn.querySelector("svg").innerHTML = `<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>`;

  playInterval = setInterval(() => {
    let val = parseInt(slider.value) + 50;
    if (val > 6000) {
      val = 0; // Loop back
    }
    slider.value = val;
    updateTemperatureDisplay(val);
    applySimulationState();
  }, 80);
}

function stopAutoHeat() {
  if (playInterval) {
    clearInterval(playInterval);
    playInterval = null;
  }
  const playBtn = document.getElementById("thermo-play-btn");
  if (playBtn) {
    playBtn.classList.remove("playing");
    playBtn.querySelector("span").textContent = "Auto-Heat";
    // Change SVG icon to play icon
    playBtn.querySelector("svg").innerHTML = `<path d="M8 5v14l11-7z"/>`;
  }
}

function applySimulationState() {
  if (currentSim === "thermo") {
    const slider = document.getElementById("thermo-temp-slider");
    applyThermoStates(parseInt(slider.value));
  } else if (currentSim === "magnetism") {
    applyMagnetismStates();
  }
}

// Color elements dynamically based on states of matter at specific temperature
function applyThermoStates(temp) {
  elementsDataEn.forEach((el) => {
    const cell = el.cellElement;
    if (!cell) return;

    cell.className = "element"; // Clear defaults

    const state = getElementStateAtTemp(el, temp);
    
    if (state === "solid") {
      cell.style.backgroundColor = "#1d4ed8"; // solid blue
      cell.style.borderColor = "#3b82f6";
      cell.style.color = "#fff";
    } else if (state === "liquid") {
      cell.style.backgroundColor = "#047857"; // liquid emerald
      cell.style.borderColor = "#10b981";
      cell.style.color = "#fff";
    } else if (state === "gas") {
      cell.style.backgroundColor = "#b45309"; // gas orange/amber
      cell.style.borderColor = "#f59e0b";
      cell.style.color = "#fff";
    } else {
      cell.style.backgroundColor = "#334155"; // unknown grey
      cell.style.borderColor = "#475569";
      cell.style.color = "#94a3b8";
    }
  });
}

function getElementStateAtTemp(el, temp) {
  // If melting / boiling points are provided, compare them
  if (el.melt !== null && el.boil !== null) {
    if (temp < el.melt) return "solid";
    if (temp >= el.melt && temp < el.boil) return "liquid";
    return "gas";
  }

  // Handle elements with sublimation points or missing values
  if (el.melt !== null && el.boil === null) {
    if (temp < el.melt) return "solid";
    return "liquid"; // Assume liquid/fluid
  }
  
  if (el.melt === null && el.boil !== null) {
    if (temp < el.boil) return "solid";
    return "gas";
  }

  // Fallback to standard phase properties in database
  if (el.phase) {
    return el.phase.toLowerCase();
  }
  
  return "unknown";
}

// Color elements dynamically based on magnetic classifications
function applyMagnetismStates() {
  const ferromagnetic = magneticProperties.ferromagnetic || [];
  const antiferromagnetic = magneticProperties.antiferromagnetic || [];
  const diamagnetic = magneticProperties.diamagnetic || [];

  elementsDataEn.forEach((el) => {
    const cell = el.cellElement;
    if (!cell) return;

    cell.className = "element"; // Clear defaults

    const no = el.number;
    if (ferromagnetic.includes(no)) {
      cell.style.backgroundColor = "#b91c1c"; // bright red
      cell.style.borderColor = "#f87171";
      cell.style.color = "#fff";
    } else if (antiferromagnetic.includes(no)) {
      cell.style.backgroundColor = "#db2777"; // hot pink
      cell.style.borderColor = "#f472b6";
      cell.style.color = "#fff";
    } else if (diamagnetic.includes(no)) {
      cell.style.backgroundColor = "#475569"; // slate grey
      cell.style.borderColor = "#94a3b8";
      cell.style.color = "#cbd5e1";
    } else {
      // Treat alkali/alkaline earth/rare earths as paramagnetic
      cell.style.backgroundColor = "#7e22ce"; // paramagnetic (violet/purple)
      cell.style.borderColor = "#c084fc";
      cell.style.color = "#fff";
    }
  });
}

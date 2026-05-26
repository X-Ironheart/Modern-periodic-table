

let numberOfElements = 118;

let elementNames = [
  "Hydrogen","Helium","Lithium","Beryllium","Boron","Carbon","Nitrogen","Oxygen","Fluorine","Neon",
  "Sodium","Magnesium","Aluminum","Silicon","Phosphorus","Sulfur","Chlorine","Argon","Potassium","Calcium",
  "Scandium","Titanium","Vanadium","Chromium","Manganese","Iron","Cobalt","Nickel","Copper","Zinc",
  "Gallium","Germanium","Arsenic","Selenium","Bromine","Krypton","Rubidium","Strontium","Yttrium","Zirconium",
  "Niobium","Molybdenum","Technetium","Ruthenium","Rhodium","Palladium","Silver","Cadmium","Indium","Tin",
  "Antimony","Tellurium","Iodine","Xenon","Cesium","Barium","Lanthanum","Cerium","Praseodymium","Neodymium",
  "Promethium","Samarium","Europium","Gadolinium","Terbium","Dysprosium","Holmium","Erbium","Thulium","Ytterbium",
  "Lutetium","Hafnium","Tantalum","Tungsten","Rhenium","Osmium","Iridium","Platinum","Gold","Mercury",
  "Thallium","Lead","Bismuth","Polonium","Astatine","Radon","Francium","Radium","Actinium","Thorium",
  "Protactinium","Uranium","Neptunium","Plutonium","Americium","Curium","Berkelium","Californium","Einsteinium",
  "Fermium","Mendelevium","Nobelium","Lawrencium","Rutherfordium","Dubnium","Seaborgium","Bohrium","Hassium",
  "Meitnerium","Darmstadtium","Roentgenium","Copernicium","Nihonium","Flerovium","Moscovium","Livermorium",
  "Tennessine","Oganesson"
];

let elementSymbols = [
  "H","He","Li","Be","B","C","N","O","F","Ne",
  "Na","Mg","Al","Si","P","S","Cl","Ar","K","Ca",
  "Sc","Ti","V","Cr","Mn","Fe","Co","Ni","Cu","Zn",
  "Ga","Ge","As","Se","Br","Kr","Rb","Sr","Y","Zr",
  "Nb","Mo","Tc","Ru","Rh","Pd","Ag","Cd","In","Sn",
  "Sb","Te","I","Xe","Cs","Ba","La","Ce","Pr","Nd",
  "Pm","Sm","Eu","Gd","Tb","Dy","Ho","Er","Tm","Yb",
  "Lu","Hf","Ta","W","Re","Os","Ir","Pt","Au","Hg",
  "Tl","Pb","Bi","Po","At","Rn","Fr","Ra","Ac","Th",
  "Pa","U","Np","Pu","Am","Cm","Bk","Cf","Es","Fm",
  "Md","No","Lr","Rf","Db","Sg","Bh","Hs","Mt","Ds",
  "Rg","Cn","Nh","Fl","Mc","Lv","Ts","Og"
];

let sGroup = document.createElement("div");
sGroup.classList.add("s-groups");
document.body.appendChild(sGroup);

let pGroup = document.createElement("div");
pGroup.classList.add("s-groups");
document.body.appendChild(pGroup);

let dGroup = document.createElement("div");
dGroup.classList.add("s-groups");
document.body.appendChild(dGroup);

let fGroup = document.createElement("div");
fGroup.classList.add("s-groups");
document.body.appendChild(fGroup);

  for (let i = 0; i <= elementNames.length; i++) {
    const elementDiv = document.createElement("div");
    elementDiv.classList.add(`${elementNames[i]}`);
    elementDiv.classList.add(`element`);
    const elementsName = elementNames[i];
    const elementsSymbol = elementSymbols[i];
    const atomicNumber = i + 1;
    const atomNameDiv = document.createElement("div");
    const atomSymbolsDiv = document.createElement("div");
    const atomicNumberDiv = document.createElement("div");
    atomicNumberDiv.textContent = atomicNumber;
    atomNameDiv.textContent = elementsName;
    atomSymbolsDiv.textContent = elementsSymbol;
    elementDiv.appendChild(atomicNumberDiv);
    elementDiv.appendChild(atomSymbolsDiv);
    elementDiv.appendChild(atomNameDiv);
    document.body.appendChild(elementDiv);
    if (atomicNumber) {
      
    }
  }

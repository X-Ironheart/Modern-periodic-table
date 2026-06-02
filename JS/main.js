async function getDataFromJson() {
  const result = await fetch("./data/elements.json")
    .then((res) => res.json())
    .catch((err) => console.log(err));

  for (let i = 0; i <= result.elements.length; i++) {
    const elementDiv = document.createElement("div");
    elementDiv.classList.add(`element`);
    elementDiv.classList.add(`${result.elements[i].name}`);

    const elementsName = result.elements[i].name;
    const elementsSymbol = result.elements[i].symbol;
    const atomicNumber = result.elements[i].number;
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

    if (result.elements[i].exception) {
      elementDiv.classList.add("exception");
      elementDiv.classList.add("s-group");
    } else if (result.elements[i].block === "s") {
      elementDiv.classList.add("s-group");
    } else if (result.elements[i].block === "p") {
      elementDiv.classList.add("p-group");
    } else if (result.elements[i].block === "d") {
      elementDiv.classList.add("d-group");
    } else if (result.elements[i].block === "f") {
      elementDiv.classList.add("f-group");
    }

    if (result.elements[i].category === "alkaline earth metal") {
      elementDiv.classList.add("alkaline-earth-metal");
    } else if (result.elements[i].category === "alkali metal") {
      elementDiv.classList.add("alkali-metal");
    } else if (result.elements[i].category === "transition metal") {
      elementDiv.classList.add("transition-metal");
    } else if (result.elements[i].category === "post-transition metal") {
      elementDiv.classList.add("post-transition-metal");
    } else if (result.elements[i].category === "metalloid") {
      elementDiv.classList.add("metalloid");
    } else if (result.elements[i].category === "diatomic nonmetal") {
      elementDiv.classList.add("diatomic-nonmetal");
    } else if (result.elements[i].category === "noble gas") {
      elementDiv.classList.add("noble-gas");
    } else if (result.elements[i].category === "polyatomic nonmetal") {
      elementDiv.classList.add("polyatomic-nonmetal");
    } else if (result.elements[i].category === "lanthanide") {
      elementDiv.classList.add("lanthanide-metal");
    } else if (result.elements[i].category === "actinide") {
      elementDiv.classList.add("actinide-metal");
    }

    main.appendChild(elementDiv);
  }
}

getDataFromJson();

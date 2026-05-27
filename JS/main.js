async function getDataFromJson() {
  const result = await fetch("./data/elements.json")
    .then((res) => res.json())
    .catch((err) => console.log(err));

  const sGroup = document.createElement("div");
  sGroup.classList.add("sGroup");
  main.appendChild(sGroup);
  
    const dGroup = document.createElement("div");
    dGroup.classList.add("dGroup");
   main.appendChild(dGroup);

  const pGroup = document.createElement("div");
  pGroup.classList.add("pGroup");
  main.appendChild(pGroup);

  const fGroup = document.createElement("div");
  fGroup.classList.add("fGroup");
  main.appendChild(fGroup);

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
    atomicNumberDiv.classList.add("atomic-number")

    atomicNumberDiv.textContent = atomicNumber;
    atomNameDiv.textContent = elementsName;
    atomSymbolsDiv.textContent = elementsSymbol;
    elementDiv.appendChild(atomicNumberDiv);
    elementDiv.appendChild(atomSymbolsDiv);
    elementDiv.appendChild(atomNameDiv);
    elementDiv.style.gridArea = elementsSymbol

    if (result.elements[i].expetion) {
      pGroup.appendChild(elementDiv);
    } else if (result.elements[i].block === "s") {
      sGroup.appendChild(elementDiv);
    } else if (result.elements[i].block === "p") {
      pGroup.appendChild(elementDiv);
    } else if (result.elements[i].block === "d") {
      dGroup.appendChild(elementDiv);
    } else if (result.elements[i].block === "f") {
      fGroup.appendChild(elementDiv);
    }
  }
}

getDataFromJson();

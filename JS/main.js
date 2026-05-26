async function getDataFromJson() {
  const result = await fetch("./data/elements.json").then((res) => res.json());
  const sGroup = document.createElement("div");
  sGroup.classList.add("sGroup");

  const dGroup = document.createElement("div");
  dGroup.classList.add("dGroup");

  const fGroup = document.createElement("div");
  fGroup.classList.add("fGroup");

  for (let i = 0; i <= result.elements.length; i++) {
    const elementDiv = document.createElement("div");
    elementDiv.classList.add(`element`);
    elementDiv.classList.add(`${result.elements[i].name}`);

    const elementsName = result.elements[i].name;
    const elementsSymbol = result.elements[i].symbol;
    const atomicNumber = result.elements[i].number;
    const atomNameDiv = document.createElement("div");
    const atomSymbolsDiv = document.createElement("div");
    const atomicNumberDiv = document.createElement("div");

    atomicNumberDiv.textContent = atomicNumber;
    atomNameDiv.textContent = elementsName;
    atomSymbolsDiv.textContent = elementsSymbol;
    elementDiv.appendChild(atomicNumberDiv);
    elementDiv.appendChild(atomSymbolsDiv);
    elementDiv.appendChild(atomNameDiv);

    document.body.appendChild(sGroup);
    document.body.appendChild(dGroup);
    document.body.appendChild(fGroup);
    console.log(result);
  }
}

getDataFromJson();

async function getDataFromJson() {
  const result = await fetch("./data/elements.json").then((res) => res.json());
  const sGroup = document.createElement("div");
  sGroup.classList.add("sGroup");
  document.body.appendChild(sGroup);

  const pGroup = document.createElement("div");
  pGroup.classList.add("pGroup");
  document.body.appendChild(pGroup);

  const dGroup = document.createElement("div");
  dGroup.classList.add("dGroup");
  document.body.appendChild(dGroup);

  const fGroup = document.createElement("div");
  fGroup.classList.add("fGroup");
  document.body.appendChild(fGroup);

  for (let i = 0; i < result.elements.length; i++) {
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

    console.log(result.elements[i].name);

    if (result.elements[i].expetion) {
      sGroup.appendChild(elementDiv);
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

  console.log(sGroup);
  console.log(pGroup);
  console.log(dGroup);
  console.log(fGroup);
}

getDataFromJson();

async function getDataFromJson() {
  const result = await fetch("./data/elements.json").then((res) => res.json());
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
    document.body.appendChild(elementDiv);
  }
  makeElemnts();
  console.log(result);
}

getDataFromJson();

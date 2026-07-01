export class CampoMinado extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.template = document.createElement("template");
        this.build();
    }

    build() {
      let start = 1;
      let end = 6;
        for (let row = start; row < end; row++) {
            const line = document.createElement("div");
            line.classList.add("row");
            line.id = "row" + row;
            for (let col = start; col < end; col++) {
                const cell = document.createElement("button");
                cell.classList.add("cell", row, col);
                line.appendChild(cell);
                console.log(row, col);
            }
            this.template.content.appendChild(line);
        }
        this.style();
        console.log(this.template);
        this.shadowRoot.appendChild(this.template.content.cloneNode(true));
    }
    style() {
        const style = document.createElement("style");
        style.textContent = `
        :host {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .row {
          display: flex;
          gap: 0.4rem;
        }
        .cell {
          border: none;
          border-radius: 0.2rem;
          width: 2rem;
          aspect-ratio: 1;
        }
        .cell:hover {
          filter: brightness(0.9);
          cursor: pointer;
    }
      `;
        this.shadowRoot.appendChild(style);
    }
}

customElements.define("campo-minado", CampoMinado);

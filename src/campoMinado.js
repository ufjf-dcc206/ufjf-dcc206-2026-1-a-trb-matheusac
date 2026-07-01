export class CampoMinado extends HTMLElement {
	static get observedAttributes() {
		return ["cells"]; // vou usar dps
	}
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
				cell.classList.add(`cell`, `row${row}`, `col${col}`);
				line.appendChild(cell);
				// console.log(row, col);
			}
			this.template.content.appendChild(line);
		}
		// console.log(this.template);
		this.shadowRoot.appendChild(this.template.content.cloneNode(true));

		this.gerarMinas(end);
		this.style();
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
      .mine {
        background-color: #ff0000;
      }
      `;
		this.shadowRoot.appendChild(style);
	}

	gerarMinas(end) {
		for (let mina = 1; mina < Math.floor(end / 2); mina++) {
			let row = Math.floor(Math.random() * (end - 1) + 1);
			let col = Math.floor(Math.random() * (end - 1) + 1);
      console.log(row, col);
			this.shadowRoot
				.querySelector(`.cell.row${row}.col${col}`)
				.classList.add("mine");
		}
	}

  
}

customElements.define("campo-minado", CampoMinado);

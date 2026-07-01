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
    this.detectarInputs();
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
        background: var(--accent);
      }
      .cell:hover {
        filter: brightness(0.9);
        cursor: pointer;
      }
      .cell.mine {
        background-color: #ff0000;
      }
      .cell.cavado {
        background: var(--accent-bg);
      }
      .cell.cavado:hover {
        pointer-events: none;
        cursor: default;
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

  detectarInputs() {
    const cell = this.shadowRoot.querySelectorAll('.cell');
    cell.forEach(element => {
      element.addEventListener('click', () => {
        this.verificarArredores(element)
      });
    });
  }

  verificarArredores(btn) {
    if (btn.classList.contains("mine")) {
      // fim de jogo
      return;
    }
    else {
      this.cavar(btn);
    }

    let row = btn.classList[1].slice(3);
    let col = btn.classList[2].slice(3);
    
    console.log(row, col);


    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const adjacentRow = parseInt(row) + i;
        const adjacentCol = parseInt(col) + j;
        const adjacentCell = this.shadowRoot.querySelector(`.cell.row${adjacentRow}.col${adjacentCol}`);
        if(adjacentCell === null) { continue;}
        if (adjacentCell.classList.contains('cavado')) {
          continue;
        }
        if (adjacentCell && adjacentCell.classList.contains("mine")) {
          // nao fazer nada
        }
        else {
          this.cavar(adjacentCell);
        }
      }
    }
  }
  
  cavar(cell) {
    cell.classList.add('cavado');
  }
}

customElements.define("campo-minado", CampoMinado);

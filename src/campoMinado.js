export class CampoMinado extends HTMLElement {
	static get observedAttributes() {
		return ["rows", "cols", "bombs"]; // vou usar dps
	}
	constructor() {
		super();

		this.rows = this.getAttribute("rows") || 8;
		this.cols = this.getAttribute("cols") || 10;
		this.bombs = this.getAttribute("bombs") || 10;
		this.board = [];
		this.flags = this.bombs;

		this.build();
		// this.template = document.createElement("template");
	}

	build() {
		this.attachShadow({ mode: "open" });

		this.addIonIcons();

		this.style();
		this.uiBuild();

		this.resetBtn();
		this.resetGame();
	}

	addIonIcons() {
		if (!document.querySelector("ion-icon")) {
			const ionIconScript1 = document.createElement("script");
			ionIconScript1.type = "module";
			ionIconScript1.src =
				"https://unpkg.com/ionicons@4.5.10-0/dist/ionicons/ionicons.esm.js";

			const ionIconScript2 = document.createElement("script");
			ionIconScript2.noModule = "";
			ionIconScript2.src =
				"https://unpkg.com/ionicons@4.5.10-0/dist/ionicons/ionicons.js";

			document.body.appendChild(ionIconScript1);
			document.body.appendChild(ionIconScript2);
		}
	}

	// changes

	// inicializar info de tudo
	runGameData() {
		this.fillCampData();
		this.plantMines();
		this.countMinesAround();
	}

	fillCampData() {
		for (let r = 0; r < this.rows; r++) {
			const row = [];
			for (let c = 0; c < this.cols; c++) {
				row.push({
					r,
					c,
					isMine: false,
					isDigged: false,
					surroundingMines: 0,
					isFlagged: false,
				});
			}

			this.board.push(row);
		}
	}

	plantMines() {
		for (let i = 0; i < this.bombs; i++) {
			const row = Math.floor(Math.random() * this.rows);
			const col = Math.floor(Math.random() * this.cols);
			this.board[row][col].isMine = true;
		}
	}

	countMinesAround() {
		for (let r = 0; r < this.rows; r++) {
			for (let c = 0; c < this.cols; c++) {
				let bombas = 0;
				if (this.board[r][c].isMine) {
					continue;
				}
				this.getNeighbors(r, c).forEach((neighbor) => {
					if (this.board[neighbor.r][neighbor.c].isMine) {
						bombas++;
					}
				});
				this.board[r][c].surroundingMines = bombas;
			}
		}
	}

	getNeighbors(r, c) {
		let neighbors = [];

		for (let i = -1; i <= 1; i++) {
			for (let j = -1; j <= 1; j++) {
				if (
					r + i < 0 ||
					r + i >= this.rows ||
					c + j < 0 ||
					c + j >= this.cols
				) {
					continue;
				}
				neighbors.push(this.board[r + i][c + j]);
			}
		}
		return neighbors;
	}

	handleCellClick(cell) {
		// console.log("clicou!", cell.gameData);

		if (cell.gameData.isFlagged || cell.gameData.isDigged) {
			return;
		}
		if (cell.gameData.isMine) {
			this.gameOver();
			return;
		}
		this.cavar(cell);
		this.checkGameEnd();
	}

	cavar(cell) {
		if (!cell || !cell.gameData) {
			return;
		}
		if (cell.gameData.isFlagged || cell.gameData.isDigged) {
			return;
		}

		cell.classList.add("cavado");
		cell.gameData.isDigged = true;
		cell.textContent =
			cell.gameData.surroundingMines > 0
				? cell.gameData.surroundingMines
				: "";

		if (cell.gameData.surroundingMines === 0) {
			this.getNeighbors(cell.gameData.r, cell.gameData.c).forEach(
				(neighbor) => {
					if (!neighbor.isMine && !neighbor.isDigged) {
						this.cavar(neighbor.element);
					}
				},
			);
		}
	}

	// adicionando ao dom/shadow-dom

	gridBuild() {
		const gridContainer = document.createElement("div");
		gridContainer.id = "grid";

		for (let r = 0; r < this.rows; r++) {
			for (let c = 0; c < this.cols; c++) {
				const cellData = this.board[r][c];
				const cellE = document.createElement("button");
				cellE.classList.add("cell");
				cellE.gameData = cellData;
				cellData.element = cellE;

				if (cellData.isMine) {
					cellE.classList.add("mine");
				}

				cellE.addEventListener("click", (e) =>
					this.handleCellClick(cellE),
				);
				// console.log(row, col);
				gridContainer.appendChild(cellE);
			}
		}

		this.shadowRoot.appendChild(gridContainer);
	}

	style() {
		const styling = document.createElement("style");
		styling.textContent = `
        :host {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
        }
        #grid {
            display: grid;
            grid-template-columns: repeat(${this.cols}, 1fr);
            grid-template-rows: repeat(${this.rows}, 1fr);
            gap: 0.4rem;
        }
        .cell {
            border: none;
            border-radius: 0.2rem;
            text-decoration: none;
            width: 2rem;
            aspect-ratio: 1;
            background: var(--accent);
        }
        .cell:hover {
            filter: brightness(0.9);
            cursor: pointer;
        }
        .cell.mine {
            background: #ff0000;
        }
        .cell.cavado {
            background: var(--accent-bg);
        }
        .cell.cavado:hover {
            pointer-events: none;
            cursor: default;
        }

        ion-icon {
            font-size: 1.5rem;
        }

        .uiHeader {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.5rem;
        }
        .flagIcon {
            color: var(--accent);
        }

        button {
            background: none;
            border: none;
            font-size: 1rem;
            padding: 0;
            text-decoration: underline;
            color: var(--text-h);
            font: var(--sans);
        }
        button:hover {
            cursor: pointer;
        }
      `;
		this.shadowRoot.appendChild(styling);
	}

	uiBuild() {
		const uiHeader = document.createElement("div");
		uiHeader.classList.add("uiHeader");
		uiHeader.innerHTML = `
            <p>Bombas: ${this.bombs}</p>
            
            <button class="resetBtn">Reiniciar Jogo</button>
        `;

		// <ion-icon name="flag" class="flagIcon"></ion-icon>

		this.shadowRoot.appendChild(uiHeader);
		// this.shadowRoot.appendChild(uiFooter);
	}

	resetBtn() {
		const btn = this.shadowRoot.querySelector(".resetBtn");
		btn.addEventListener("click", () => this.resetGame());
	}

	// updateUI () {
	//     const flagSpan = this.shadowRoot.querySelector(".uiHeader span");
	//     if (flagSpan) {
	//         flagSpan.textContent = this.flags;
	//     }
	// }

	//

	// updates

	resetGame() {
		if (this.shadowRoot.querySelector("#grid")) {
			this.shadowRoot.querySelector("#grid").remove();
		}
		this.rows = this.getAttribute("rows") || 8;
		this.cols = this.getAttribute("cols") || 10;
		this.bombs = this.getAttribute("bombs") || 10;
		this.board = [];
		this.flags = this.bombs;
		this.runGameData();
		this.gridBuild();
	}

	checkGameEnd() {
		const cells = this.shadowRoot.querySelector(
			".cell:not(.cavado):not(.mine)",
		);
		if (!cells) {
			this.gameWin();
		}
		console.log("checando...", cells);
	}

	gameWin() {
		setTimeout(() => {
            alert("Parabéns! Você venceu! :)");
        }, 120);
        const jogo = this.shadowRoot.querySelector("#grid");
        jogo.style.pointerEvents = "none";
	}

	gameOver() {
        setTimeout(() => {
            alert("Você perdeu! :(");
        }, 120);

        const jogo = this.shadowRoot.querySelector("#grid");
        jogo.style.pointerEvents = "none";

		// let modal = this.shadowRoot.querySelector("modais-jogo");

		// if (!modal) {
		// 	modal = document.createElement("modais-jogo");
		// 	modal.addEventListener("restart-game", () => this.resetGame());
		// 	this.shadowRoot.appendChild(modal);
		// }

		// modal.setAttribute("tipo", tipo);
	}

    


}

customElements.define("campo-minado", CampoMinado);

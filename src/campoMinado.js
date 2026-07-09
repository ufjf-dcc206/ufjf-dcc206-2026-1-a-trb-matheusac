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
		this.flagMode = false;
		this.flagsEl = null;
		this.flagModeBtn = null;

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
		let planted = 0;

		while (planted < this.bombs) {
			const row = Math.floor(Math.random() * this.rows);
			const col = Math.floor(Math.random() * this.cols);

			if (this.board[row][col].isMine) {
				continue;
			}

			this.board[row][col].isMine = true;
			planted++;
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

		if (cell.gameData.isDigged) {
			return;
		}

		if (this.flagMode) {
			this.toggleFlag(cell);
			return;
		}

		if (cell.gameData.isFlagged) {
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

	toggleFlag(cell) {
		if (!cell || !cell.gameData || cell.gameData.isDigged) {
			return;
		}

		if (cell.gameData.isFlagged) {
			cell.gameData.isFlagged = false;
			cell.classList.remove("flagged");
			cell.replaceChildren();
			this.flags++;
		} else {
			if (this.flags <= 0) return;

			cell.gameData.isFlagged = true;
			cell.classList.add("flagged");
			cell.replaceChildren(this.createFlagIcon());
			this.flags--;
		}

		this.updateUI();
	}

	createFlagIcon() {
		const icon = document.createElement("ion-icon");
		icon.setAttribute("name", "flag");
		return icon;
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
            background: var(--cell);
        }
        .cell:hover {
            filter: brightness(0.9);
            cursor: pointer;
        }
            /*
        .cell.mine {
            background: var(--alert);
        }*/
        .cell.cavado.mine {
            background: var(--alert-50);
        }
        .cell.cavado {
            background: var(--dig);
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
            
        .flagModeBtn {
            padding: 0.6rem;
            border-radius: 1rem;
            display: flex;
            align-items: center;
        }
        .flagModeBtn.active {
            text-decoration: none;
            font-weight: 700;
            background: var(--dig);
        }
        .resetBtn {
        text-decoration: underline;
        }

        .flagIcon {
            color: var(--alert);
        }

        button {
            background: none;
            border: none;
            font-size: 1rem;
            padding: 0;
            
            color: var(--txt);
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
            <button class="flagModeBtn"></button>
            <button class="resetBtn">Reiniciar Jogo</button>
        `;

		this.flagsEl = uiHeader.querySelector(".flagModeBtn");
		this.flagModeBtn = uiHeader.querySelector(".flagModeBtn");

		this.shadowRoot.appendChild(uiHeader);
		this.updateUI();
	}

	//

	resetBtn() {
		const btn = this.shadowRoot.querySelector(".resetBtn");
		btn.addEventListener("click", () => this.resetGame());

		const flagModeBtn = this.shadowRoot.querySelector(".flagModeBtn");
		flagModeBtn.addEventListener("click", () => {
			this.flagMode = !this.flagMode;
			this.updateUI();
		});
	}

	// updates

	updateUI() {
		if (this.flagModeBtn) {
			this.flagModeBtn.replaceChildren();

			const icon = document.createElement("ion-icon");
			icon.classList.add("flagIcon");
			icon.setAttribute("name", "flag");

			this.flagModeBtn.append(
				icon,
				` ${this.flags} | Modo: ${this.flagMode ? "ON" : "OFF"}`,
			);
			this.flagModeBtn.classList.toggle("active", this.flagMode);
		}
	}

	resetGame() {
		if (this.shadowRoot.querySelector("#grid")) {
			this.shadowRoot.querySelector("#grid").remove();
		}
		this.rows = this.getAttribute("rows") || 8;
		this.cols = this.getAttribute("cols") || 10;
		this.bombs = this.getAttribute("bombs") || 10;
		this.board = [];
		this.flags = this.bombs;
		this.flagMode = false;
		this.runGameData();
		this.gridBuild();
		this.updateUI();
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

	// finais de jogo

	gameWin() {
		const modais = document.querySelector("modais-jogo");
		// setTimeout(() => {
			// alert("Parabéns! Você venceu! :)");
			modais.setAttribute("tipo", "win");
		// }, 120);
		const jogo = this.shadowRoot.querySelector("#grid");
		jogo.style.pointerEvents = "none";
	}

	gameOver() {
		const modais = document.querySelector("modais-jogo");
		// setTimeout(() => {
			// alert("Você perdeu! :(");
			modais.setAttribute("tipo", "lose");
		// }, 120);

		const jogo = this.shadowRoot.querySelector("#grid");
		jogo.style.pointerEvents = "none";

		const mines = this.shadowRoot.querySelectorAll(".cell.mine");
		mines.forEach((cell) => {
			cell.classList.add("cavado");
			cell.replaceChildren();
			const icon = document.createElement("ion-icon");
			icon.classList.add("flagIcon");
			icon.setAttribute("name", "close-circle");
			cell.appendChild(icon);
		});

	}
}

customElements.define("campo-minado", CampoMinado);

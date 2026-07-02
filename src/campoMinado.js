export class CampoMinado extends HTMLElement {
    static get observedAttributes() {
        return ["cells"]; // vou usar dps
    }
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.template = document.createElement("template");

        this.rows = 8;
        this.cols = 10;
        this.bombs = 10;
        this.board = [];
    }

    connectedCallback() {
        this.fillCampData();
        this.plantMines();
        this.countMinesAround();
        // console.log(this.board);
        this.build();
    }

    // back

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

    // front

    build() {
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
        // console.log(this.template);
        // this.template.content.appendChild(gridContainer);
        this.shadowRoot.appendChild(gridContainer);

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
        #grid {
        display: grid;
        grid-template-columns: repeat(${this.cols}, 1fr);
        grid-template-rows: repeat(${this.rows}, 1fr);
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
        background: #ff0000;
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
}

customElements.define("campo-minado", CampoMinado);

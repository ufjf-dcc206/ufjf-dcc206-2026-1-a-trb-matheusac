class Modais extends HTMLElement {
	static get observedAttributes() {
		return ["frase", "tipo"]; // vou usar dps
	}
	constructor() {
		super();

		this.frase = "modal base";
    this.fraseBtn = "fechar"
		this.tipo = "";

		this.build();
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === "tipo") {
			this.tipo = newValue;

			if (newValue == "lose") {
				this.frase = "Você <em>perdeu</em> o jogo.";
				this.fraseBtn = "Fechar";
				this.resetModal();
			} 
      else if (newValue == "win") {
				this.frase = "Você <em>ganhou</em> o jogo.";
				this.fraseBtn = "Fechar";
				this.resetModal();
			} 
      else if (newValue == "restart") {
				this.frase = "Reiniciar o jogo?";
				this.fraseBtn = "Reiniciar";
				this.resetModal();
			}
		}
		console.log(newValue);
	}

	build() {
		this.attachShadow({ mode: "open" });
		this.setStyle();
    this.createModal();
		// this.escutarEventos();
	}

	setStyle() {
		const globalStyle = document.createElement("style");
		globalStyle.innerHTML += `
      .close {
      display: none;
      pointer-events: none;
      }
    `;
		document.head.appendChild(globalStyle);

		const shadowStyle = document.createElement("style");
		shadowStyle.innerHTML = `
        :host {
          display: flex;
          justify-content: center;
          align-items: center;
          
          position: absolute;
          z-index: 3;
          width: 100vw;
          height: 100vh;
          
          top: 0;
          left: 0;
          
          background: #47474780;
          align-content: center;

          --em-color: grey;
          
        }
        .modal {
          min-width: 20vw;
          min-height: 18vh;
          padding: 1rem;
  
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
  
          border-radius: 1.8rem;
          background: #E1D6CA80;
          z-index: 6;
        }
        .modal p {
          font-size: 1.6rem;
        }
        .modal button {
          border: none;
          border-radius: 1.4rem;
          font-size: 1.2rem;
          padding: 0.6rem 0.8rem;
        }
        button:hover {
          cursor: pointer;
          filter: brightness(0.8);
        }
        em {
          color: var(--em-color);
          font-style: normal;
        }
      `;
		this.shadowRoot.appendChild(shadowStyle);
	}

  createModal() {
    const modal = document.createElement("div");
		modal.innerHTML = `
      <div class='modal'>
        <p>${this.frase}</p>
        <button>${this.fraseBtn}</button>
      </div>
    `;
		this.shadowRoot.appendChild(modal);
    
    const color = this.tipo === "lose" ? "#9B1515" : this.tipo === "win" ? "#299736" : "#171922";
    this.shadowRoot.host.style.setProperty("--em-color", color);
    
    
    this.escutarEventos();
  }

	resetModal() {
		this.shadowRoot.host.classList.remove("close")
    const modal = this.shadowRoot.querySelector(".modal");
    modal.remove();
    this.createModal();
	}

	setModalInfo() {}

	escutarEventos() {
		const btn = this.shadowRoot.querySelector("button");
		const modalContainer = this.shadowRoot.host;

		btn.addEventListener("click", () => {
			modalContainer.classList.add("close");
		});
	}
}

customElements.define("modais-jogo", Modais);

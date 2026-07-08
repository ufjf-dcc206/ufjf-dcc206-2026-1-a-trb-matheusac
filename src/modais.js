class Modais extends HTMLElement {
    static get observedAttributes() {
        return ["frase", "tipo"]; // vou usar dps
    }
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.template = document.createElement("template");

        this.frase = "";
        this.tipo = "";

        this.build();
        this.escutarEventos();
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "tipo") {
            this.tipo = newValue;
            if (newValue == "lose") this.frase = "você perdeu o jogo";

            if (newValue == "win") this.frase = "você ganhou o jogo";

            if (newValue == "restart") this.frase = "reiniciar o jogo?";
        }
        // console.log(newValue)
    }

    build() {
        this.template.innerHTML = `
          <div class='modal'>
            <p>esse é um <em>modal</em> teste</p>
            <button>tá bom</button>
          </div>
          
        <style>
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
            
            background: #dcdcdc80;
            align-content: center;
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
            background: #ababab;
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
            color: red;
            font-style: normal;
          }

          :host .close {
            display: none;
            pointer-events: none;
          }
          
        </style>
      `;

      // const globalStyle = document.createElement('style')
      // globalStyle.innerHTML = `
      //   <style>
      //     .close {
      //     display: none;
      //       pointer-events: none;
      //     }
        
      //   </style>
      // `;
      // document.head.appendChild(globalStyle);

        this.shadowRoot.appendChild(this.template.content.cloneNode(true));
    }
    escutarEventos() {
      const btn = this.shadowRoot.querySelector('button');
      const modalContainer = document.querySelector('modais-jogo');

      btn.addEventListener('click', () => {
        modalContainer.classList.toggle('close')
      });

    }
}

customElements.define("modais-jogo", Modais);

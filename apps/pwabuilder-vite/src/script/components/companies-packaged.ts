import { LitElement, css, html } from 'lit';

import { customElement, state } from 'lit/decorators.js';

@customElement('companies-packaged')
export class ComapniesPackaged extends LitElement {

  @state() companies: string[] = ["facebook", "instagram", "mailchimp", "plutotv", "sketchapp", "tiktok", "twitter"];
  @state() paused: boolean = false;
  
  static get styles() {
    return [
    css`
      :host {
        --carousel-width: 1000px;
        --slide-width: 200px;
        --slide-height: 80px;
        --carousel-image-width: 120px;
      }
      #success-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        padding: 2em 0;
        background-color: white;
      }

      #success-title {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #292C3A;
        margin-bottom: 1em;
      }

      #success-title h2 {
        text-align: center;
        font-size: 1.6em;
        margin: 0;
      }

      #success-title p {
        text-align: center;
        margin: 0;
        font-size: .75em;
      }

      #success-wrapper #img-box {
        background-image: url("/assets/new/packaged_1366.svg");
        height: 4em;
        width: 100%;
        background-repeat: no-repeat;
        background-position: center;
      }
      .controls {
        border: none;
        background: none;
        height: 20px;
        width: auto;
      }

      .controls:hover {
        cursor: pointer;
      }

      .controls ion-icon {
        color: #4F3FB6;
        padding: 5px;
        border: 1px solid #4F3FB6;
        border-radius: 50%;
      }

      @keyframes scroll {
        0% { transform: translateX(0); }
        14% { transform: translateX(calc(var(--slide-width) * -1)); }
        28% { transform: translateX(calc(var(--slide-width) * -2)); }
        42% { transform: translateX(calc(var(--slide-width) * -3)); }
        56% { transform: translateX(calc(var(--slide-width) * -4)); }
        70% { transform: translateX(calc(var(--slide-width) * -5)); }
        84% { transform: translateX(calc(var(--slide-width) * -6)); }
        100% { transform: translateX(calc(var(--slide-width) * -7)); }
      }

      .slider {
        background: white;
        height: var(--slide-height);
        overflow:hidden;
        position: relative;
        width: var(--carousel-width);
      }

      .slider::before,
      .slider::after {
        content: "";
        height: 100px;
        position: absolute;
        width: 200px;
        z-index: 2;
      }
      
      .slider::after {
        right: 0;
        top: 0;
        transform: rotateZ(180deg);
      }

      .slider::before {
        left: 0;
        top: 0;
      }

      .slide-track {
        animation: scroll 21s infinite ease;
        animation-delay: 3s;
        display: flex;
        width: calc(var(--slide-width) * 14);
      }
      
      .slide {
        display: flex;
        align-items: center;
        justify-content: center;
        height: var(--slide-height);
        width: var(--slide-width)
      }

      .slide img {
        height: auto;
        width: var(--carousel-image-width);
      }

      @media (min-width: 200px) and (max-width: 400px) {
        :host {
          --carousel-width: 200px;
        }
      }

      @media (min-width: 400px) and (max-width: 600px) {
        :host {
          --carousel-width: 400px;
        }
      }

      @media (min-width: 600px) and (max-width: 800px) {
        :host {
          --carousel-width: 600px;
        }
      }

      @media (min-width: 800px) and (max-width: 1000px) {
        :host {
          --carousel-width: 800px;
        }
      }

      @media (min-width: 1000px) {
        :host {
          --carousel-width: 1000px;
        }
      }

      @media screen and (-ms-high-contrast: white-on-black) {
        .controls ion-icon {
          color: white;
          border-color: white;
        }
      }
    `
    ];
  }

  constructor() {
    super();
  }

  firstUpdated() {
    const shuffled = this.shuffle(this.companies);
    this.companies = [...shuffled];
  }

  shuffle(array: any) {
    let currentIndex = array.length
    let randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
  }

  toggleAnimation(){
    this.paused = !this.paused;
    let animatedElement = (this.shadowRoot!.querySelector(".slide-track") as HTMLElement);
    if(this.paused){
      animatedElement!.style.animationPlayState = 'paused';
    } else {
      animatedElement!.style.animationPlayState = 'running';
    }
  }

  render() {
    return html`
    <div id="success-wrapper">
      <div id="success-title">
          <h2>Apps Packaged</h2>
          <p>Companies of all sizes—from startups to Fortune 500s—have used PWABuilder to package their PWAs.</p>
      </div>
      <div class="slider">
        <div class="slide-track">
          ${this.companies.map((comp: string) => 
              html`
              <div class="slide">
                <img src="/assets/new/${comp}_carousel.png" alt="${comp} logo" />
              </div>`
            )}
            ${this.companies.map((comp: string) => 
              html`
              <div class="slide">
                <img src="/assets/new/${comp}_carousel.png" alt="${comp} logo" />
              </div>`
            )}
        </div>
      </div>
      ${this.paused ? html`<button class="controls" type="button" @click=${() => this.toggleAnimation()}><ion-icon name="play" aria-label="play button"></ion-icon></button>` : html`<button class="controls" type="button" @click=${() => this.toggleAnimation()}><ion-icon name="pause" aria-label="pause button"></ion-icon></button>`}
    </div>
    `;
  }
}

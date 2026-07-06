import { LitElement, html } from 'lit';

import { customElement, state } from 'lit/decorators.js';
import { companiesPackagedStyles } from './companies-packaged.styles';
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';
import '@awesome.me/webawesome/dist/components/icon/icon.js';

@customElement('companies-packaged')
export class ComapniesPackaged extends LitElement {

    @state() companies: string[] = ["facebook", "instagram", "mailchimp", "plutotv", "sketchapp", "glass", "tiktok", "x"];
    @state() paused: boolean = false;

    static styles = [companiesPackagedStyles];

    constructor() {
        super();
    }

    connectedCallback(): void {
        super.connectedCallback();
        /* const shuffled = this.shuffle(this.companies);
        this.companies = [...shuffled]; */
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

    toggleAnimation() {
        this.paused = !this.paused;
        let animatedElement = (this.shadowRoot!.querySelector(".slide-track") as HTMLElement);
        if (this.paused) {
            animatedElement!.style.animationPlayState = 'paused';
            recordPWABuilderProcessStep("middle.carousel_paused", AnalyticsBehavior.ProcessCheckpoint);
        } else {
            animatedElement!.style.animationPlayState = 'running';
            recordPWABuilderProcessStep("middle.carousel_played", AnalyticsBehavior.ProcessCheckpoint);

        }
    }

    render() {
        return html`
    <div id="success-wrapper">
      <div id="success-title">
          <h2>Apps packaged</h2>
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
      <button
        class="controls"
        type="button"
        @click=${this.toggleAnimation}
        role="button"
        aria-label="${this.paused ? "Click here to play carousel" : "Click here to pause carousel"}"
      >
        <wa-icon name="${this.paused ? "play-fill" : "pause-fill"}" role="img"></wa-icon>
      </button>
    </div>
    `;
    }
}

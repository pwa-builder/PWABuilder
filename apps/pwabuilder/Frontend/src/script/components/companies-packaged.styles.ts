import { css } from "lit";

export const companiesPackagedStyles = css`
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
        color: var(--font-color);
        margin-bottom: 1em;
      }

      #success-title h2 {
        text-align: center;
        font-size: var(--header-font-size);
        margin: 0;
      }

      #success-title p {
        text-align: center;
        margin: 0;
        font-size:  var(--body-font-size);
      }

      #success-wrapper #img-box {
        background-image: url("/assets/new/packaged_1366.svg");
        height: 4em;
        width: 100%;
        background-repeat: no-repeat;
        background-position: center;
      }
      .controls {
        height: 32px;
        width: 32px;
        border: 1px solid var(--primary-color);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
      }

      .controls:hover {
        cursor: pointer;
      }

      wa-icon {
        color: var(--primary-color);
        font-size: 15px;
      }

      @keyframes scroll {
        0% { transform: translateX(0); }
        12% { transform: translateX(calc(var(--slide-width) * -1)); }
        24% { transform: translateX(calc(var(--slide-width) * -2)); }
        36% { transform: translateX(calc(var(--slide-width) * -3)); }
        48% { transform: translateX(calc(var(--slide-width) * -4)); }
        60% { transform: translateX(calc(var(--slide-width) * -5)); }
        72% { transform: translateX(calc(var(--slide-width) * -6)); }
        84% { transform: translateX(calc(var(--slide-width) * -7)); }
        100% { transform: translateX(calc(var(--slide-width) * -8)); }
      }

      .slider {
        background: #ffffff;
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
        width: calc(var(--slide-width) * 16);
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
        .controls wa-icon {
          color: #ffffff;
          border-color: #ffffff;
        }
      }
    `;
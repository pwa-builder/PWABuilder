import { LitElement, html, css, customElement, internalProperty } from 'lit-element';

@customElement('rating-dial')
export class RatingDial extends LitElement {
  @internalProperty() rating: "top" | "middle" | "bottom" = "bottom";

  static get styles() {
    return css`
      #dial-block {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      #pointer {
        position: absolute;
        transform-origin: bottom;
      }
    `;
  }

  constructor() {
    super();
  }

  firstUpdated() {
    const pointerEl = this.shadowRoot?.querySelector("#pointer");

    if (pointerEl) {
      switch(this.rating) {
        case "top": 
          pointerEl.animate([
            {
              transform: "rotate(90deg) translate(10px, 13px)"
            },
            {
              transform: "rotate(0deg) translate(10px, 13px)"
            }
          ],
          {
            fill: "forwards",
            easing: "ease-in-out",
          });

          break;
        case "middle":
          pointerEl.animate([
            {
              transform: "rotate(0deg) translate(0px, 5px)"
            },
            {
              transform: "rotate(-90deg) translate(0px, 5px)"
            }
          ],
          {
            fill: "forwards",
            easing: "ease-in-out"
          });

          break;
        case "bottom": 
        // translate(-10px, 5px) rotate(-180deg);
          pointerEl.animate([
            {
              transform: "rotate(0deg) translate(10px, -5px)"
            },
            {
              transform: "rotate(-180deg) translate(10px, -5px)"
            }
          ], 
          {
            fill: "forwards",
            easing: "ease-in-out"
          })
          break;
      }
    }
  }

  render() {
    return html`<div id="dial-block">
      <img aria-hidden="true" id="dial" src="/assets/dial.png" />
      <img aria-hidden="true" id="pointer" src="/assets/pointer.png" />
    </div> `;
  }
}

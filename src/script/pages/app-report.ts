import {
  LitElement,
  css,
  html,
  customElement,
  internalProperty,
} from 'lit-element';

@customElement('app-report')
export class AppReport extends LitElement {
  @internalProperty() testResults = null;

  static get styles() {
    return css``;
  }

  constructor() {
    super();
  }

  firstUpdated() {
    const search = new URLSearchParams(location.search);
    const results = search.get('results');

    if (results) {
      this.testResults = JSON.parse(results);
      console.log('testResults', this.testResults);
    }
  }

  render() {
    return html` <div>
      <h3>Hello world</h3>
    </div>`;
  }
}

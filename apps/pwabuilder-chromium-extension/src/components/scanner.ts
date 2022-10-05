import { LitElement, html, css, CSSResultGroup } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "@shoelace-style/shoelace/dist/components/progress-ring/progress-ring";
import "@shoelace-style/shoelace/dist/components/badge/badge";
import "@shoelace-style/shoelace/dist/components/spinner/spinner";
import "@shoelace-style/shoelace/dist/components/details/details";

import { runManifestChecks } from "../utils/manifest";
import { TestResult } from "../interfaces/manifest";
import { testSecurity } from "../checks/security";
import { getManifestTestResults } from "../checks/sw";
import { SiteData } from "../interfaces/validation";
import { deepEqual } from "../utils/utils";

interface ValidationTests {
  passedTests: Array<TestResult>;
  failedTests: Array<TestResult>;
  category: string;
}

@customElement("pwa-scanner")
export class PWAScanner extends LitElement {
  static styles = [
    css`
      .root {
        display: flex;
        flex-direction: column;
        align-items: center;
        align-content: center;
      }

      .go-button {
        margin: 20px;
      }


      .item-passed {
        color: green;
      }

      .item-failed {
        color: red;
      }

      .item-recommended {
      }

      .rings {
        display: flex;
        flex-direction: row;
        padding: 10px;
      }

      .rings pwa-scanner-ring {
        margin: 10px 20px;
      }
      
      .test-wrapper {
        width: 100%;
      }

      .test-header {
        margin: 20px 0 10px 0;
        font-size: 16px;
      }
    `,
  ];

  private _siteData!: SiteData;

  @property() 
  get siteData(): SiteData {
    return this._siteData;
  }

  set siteData(val: SiteData) {
    const oldValue = this._siteData;
    this._siteData = val;

    if (this._siteData) {
      if (oldValue) {
        if (!deepEqual(oldValue.manifest, this._siteData.manifest)) {
          this.runManifestChecks();
        }
        if (!deepEqual(oldValue.sw, this._siteData.sw)) {
          this.runSwChecks();
        }
        // if (!deepEqual(oldValue.security, this._siteData.security)) {
        if (this._siteData.currentUrl && oldValue.currentUrl !== this._siteData.currentUrl) {
          this.runSecurityChecks();
        }
      } else {
        this.runManifestChecks();
        this.runSwChecks();
        this.runSecurityChecks();
      }
    }

    this.requestUpdate();
  }

  @state() private manifestTestResults!: ValidationTests;
  @state() private swTestResults!: ValidationTests;
  @state() private securityTestResults!: ValidationTests;

  @state() private manifestTestsLoading: boolean = true;
  @state() private swTestsLoading: boolean = true;
  @state() private securityTestsLoading: boolean = true;

  private async runManifestChecks() {
    this.manifestTestsLoading = true;
    const tests = await runManifestChecks({
      manifestUrl: this.siteData.manifest.manifestUri!,
      initialManifest: this.siteData.manifest.manifest!,
      siteUrl: this.siteData.currentUrl,
      isGenerated: false,
      isEdited: false,
      manifest: this.siteData.manifest.manifest!,
    });


    const passed = tests.filter(t => t.result);
    const failed = tests.filter(t => !t.result);

    this.manifestTestResults = {
      passedTests: passed,
      failedTests: failed,
      category: "Manifest"
    }
    this.manifestTestsLoading = false;
  }

  private async runSwChecks() {
    this.swTestsLoading = true;
    let tests = getManifestTestResults(this.siteData.sw);

    const passed = tests.filter(t => t.result);
    const failed = tests.filter(t => !t.result);

    this.swTestResults = {
      passedTests: passed,
      failedTests: failed,
      category: "Service Worker"
    }

    this.swTestsLoading = false;
  }

  private async runSecurityChecks() {
    if (!this.siteData.currentUrl) {
      return;
    }
    this.securityTestsLoading = true;
    let tests = await testSecurity(this.siteData.currentUrl);

    const passed = tests.filter(t => t.result);
    const failed = tests.filter(t => !t.result);

    this.securityTestResults = {
      passedTests: passed,
      failedTests: failed,
      category: "Security"
    }

    this.securityTestsLoading = false;
  }

  render() {
    if (!this.siteData) {
      return html`No site data`;
    }

    return html`
      <div class="root">
        <div>Current Url = ${this.siteData.currentUrl}</div>
      
        <div class="rings">
          <pwa-scanner-ring label="Manifest" .testResults=${this.manifestTestResults} ?isLoading=${this.manifestTestsLoading}>
          </pwa-scanner-ring>
          <pwa-scanner-ring label="Service Worker" .testResults=${this.swTestResults} ?isLoading=${this.swTestsLoading}>
          </pwa-scanner-ring>
          <pwa-scanner-ring label="Security" .testResults=${this.securityTestResults} ?isLoading=${this.securityTestsLoading}>
          </pwa-scanner-ring>
        </div>
      
        ${this.renderTests(this.manifestTestsLoading, this.manifestTestResults)}
        ${this.renderTests(this.swTestsLoading, this.swTestResults)}
        ${this.renderTests(this.securityTestsLoading, this.securityTestResults)}
      </div>
    `;
  }

  renderTests(isLoading: boolean, tests: ValidationTests) {
    if (!isLoading && tests) {
      return html`
        <div class="test-wrapper">
          <div class="test-header">${tests.category}</div>
            ${[...tests.failedTests, ...tests.passedTests].map(t => html`
            <sl-details>
              <div slot="summary" .className=${t.result ? 'item-passed' : t.category==='required' ? 'item-failed' : 'item-recommended' }>
                <sl-badge variant="${t.result ? 'success' : t.category === 'required' ? 'danger' : 'warning'}">
                  ${t.result ? 'Passed' : t.category === 'required' ? 'Failed' : 'Recommended'}
                </sl-badge>
                ${t.infoString}
              </div>
              <div class="panel">${(t as any).description}</div>
            </sl-details>
            `)}
        </div>
      `;
    }

    return html``;
  }
}

@customElement("pwa-scanner-ring")
export class PWAScannerRing extends LitElement {

  static styles = [
    css`
      .root {
        display: flex;
        flex-direction: column;
        align-items: center;
        align-content: center;
      }

      sl-progress-ring {
        --size: 68px;
        --track-width: 5px;
        font-size: 15px;
      }

      sl-progress-ring.good {
        --indicator-color: green;
      }

      sl-progress-ring.bad {
        --indicator-color: red;
        --track-color: #ff000026;
      }

      sl-progress-ring.ok {
        --indicator-color: orange;
      }

      .label {
        font-size: 16px;
        margin-top: 10px;
      }

      .ring {
        height: 68px;
        width: 68px;
      }
    `
  ]

  // @property({type: Number}) public value: number = 0;
  // @property({type: String}) public type: "good" | "bad" | "ok" | "default" = "default";
  // @property({type: String}) public content: string | undefined;
  @property({ type: String }) public label: string | undefined;;
  @property({ type: Boolean }) public isLoading: boolean = false;
  @property({ type: Object }) public testResults!: ValidationTests;

  render() {
    return html`
    <div class="root">
      <div class="ring">
        ${this.isLoading || !this.testResults ? this.renderLoading() : this.renderLoaded()}
      </div>
      <span class="label">
        ${this.label}
      </span>
    </div>
    `;
  }

  renderLoaded() {
    const passed = this.testResults.passedTests.length;
    const failed = this.testResults.failedTests.length;

    const value = passed / (passed + failed);
    let status = "good";

    if (value < 0.25) status = "bad";
    if (value < 0.5) status = "ok";

    return html`
      <sl-progress-ring .className=${status} value="${value * 100}">
        ${passed}/${passed + failed}
      </sl-progress-ring>
    `;
  }

  renderLoading() {
    return html`
      <sl-spinner style="font-size: 4rem;"></sl-spinner>
    `;
  }

}
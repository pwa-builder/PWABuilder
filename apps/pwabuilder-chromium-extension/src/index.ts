import { LitElement, html } from "lit";
import {customElement} from 'lit/decorators.js';
import './components/scanner';
import './components/package-windows';
// import './components/manifest-designer';
import '@pwabuilder/manifest-editor';

import {
  provideFluentDesignSystem,
  fluentTabs,
  fluentTab,
  fluentTabPanel
} from "@fluentui/web-components";

provideFluentDesignSystem().register(
  fluentTabs(),
  fluentTab(),
  fluentTabPanel()
);


@customElement("pwa-extension")
export class PwaExtension extends LitElement {

  render() {
    return html`
    <fluent-tabs>
      <fluent-tab id="validate">Validate</fluent-tab>
      <fluent-tab id="manifest">Manifest</fluent-tab>
      <fluent-tab id="package">Package</fluent-tab>

      <fluent-tab-panel id="validatePanel">
        <pwa-scanner></pwa-scanner>
      </fluent-tab-panel>

      <fluent-tab-panel id="validatePanel">
        <pwa-manifest-editor></pwa-manifest-editor>
      </fluent-tab-panel>

      <fluent-tab-panel id="validatePanel">
        <package-windows></package-windows>
      </fluent-tab-panel>
    </fluent-tabs>
    `
    ;
  }

}
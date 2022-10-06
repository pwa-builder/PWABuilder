import { LitElement, css, html } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';
import { Manifest } from '../utils/interfaces';

import "./manifest-info-form"
import "./manifest-settings-form"
import "./manifest-platform-form"
import "./manifest-icons-form"
import "./manifest-screenshots-form"
// import "./manifest-preview-form"
import "./manifest-code-form"

import { prettyString } from '../utils/pretty-json';
import { ManifestInfoForm } from './manifest-info-form';
import { ManifestPlatformForm } from './manifest-platform-form';
/* import { recordPWABuilderProcessStep } from '@pwabuilder/site-analyrics'; */

/**
 * @since 0.1
 * @status stable
 *
 * @property initialManifest - the initial manifest to be edited/tested.
 * @property manifestURL - used to fetch images (screenshots & icons).
 *
 * @event manifestUpdated - Emitted when any field in the manifest.
 * @event iconsUpdated - Emitted when changes are made to the icons field.
 * @event screenshotsUpdated - Emitted when changes are made to the screenshots field.
 *
 * @method resetManifest - Resets the manifest back to value of initialManifest.
 * @method downloadManifest - Writes and downloads the manifest to a file called manifest.json.
 * @method getIcons - Returns a list of the blobs all the icons.
 * @method getScreenshots - Returns a list of the blobs of all the screenshots.
 **/

@customElement('pwa-manifest-editor')
export class PWAManifestEditor extends LitElement {

  // For more information on using properties and state in lit
  // check out this link https://lit.dev/docs/components/properties/

  private _initialManifest: Manifest = {};

  set initialManifest(manifest: Manifest) {
    let oldVal = this._initialManifest;
    this._initialManifest = manifest
    this.manifest = JSON.parse(JSON.stringify(this.initialManifest));
    this.requestUpdate('initialManifest', oldVal);
  }

  @property({type: Object}) get initialManifest() { return this._initialManifest; }

  //@property({type: Object}) initialManifest: Manifest = {};

  @property({type: String}) manifestURL: string = '';

  @property({type: String}) baseURL: string = '';

  @property({type: String}) startingTab: string = "info";

  @state() manifest: Manifest = {};
  @state() selectedTab: string = "info";

  static get styles() {
    return css`
      sl-tab::part(base) {
        --sl-font-size-small: 14px;
        --sl-spacing-medium: .75rem;
        --sl-space-large: 1rem;
        position: relative;
      }
      .error-indicator {
        position: absolute;
        right: .5em;
      }
      sl-tab-group {
        --indicator-color: #4F3FB6;
      }
      sl-tab::part(base):hover {
        color: #4F3FB6;
      }
      sl-tab[active]::part(base) {
        color: #4F3FB6;
        font-weight: bold;
      }
      sl-tab-panel::part(base){
        overflow-y: auto;
        overflow-x: hidden;
        height: 500px;
        padding: 1em .5em .5em .5em;
      }

      @media(max-width: 765px){

      }

      @media(max-width: 600px){

      }

      @media(max-width: 480px){
        sl-tab::part(base) {
          --sl-font-size-small: 12px;
          --sl-spacing-medium: .5rem;
          --sl-space-large: .75em;
        }
      }
    `;
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    //console.log(await validateRequiredFields(this._initialManifest))
  }

  private updateManifest(field: any, change: any){

    // we want to add generated photos to the current
    // field instead of replacing them
    if(field === "screenshots" || field === "icons"){
      let cur = this.manifest[field] || [];
      change.forEach((ele: any) => {
        cur.push(ele);
      });
      change = cur;
    }

    this.manifest = {...this.manifest, [field]: change};

    //console.log("Manifest Successfuly Updated.")

    //console.log(`updated manifest with new field ${field}`, this.manifest);
  }

  public resetManifest(){
    this.manifest = JSON.parse(JSON.stringify(this.initialManifest));
    //console.log("manifest in reset fun", this.manifest);

    (this.shadowRoot!.getElementById("info-tab") as ManifestInfoForm).initMissingColors();

    (this.shadowRoot!.getElementById("platform-tab") as ManifestPlatformForm).reset();
  }

  public downloadManifest() {
    let filename = "manifest.json";
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(prettyString(this.manifest)));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);

    let manifestDownloaded = new CustomEvent('manifestDownloaded', {
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(manifestDownloaded);

  }

  // Think about what this function should actually return?
  // Downloadable content?
  // The manifest field of screenshots?
  public getScreenshots(){
    return this.manifest.screenshots;
  }

  errorInTab(e: CustomEvent){
    let tabs = this.shadowRoot!.querySelectorAll('sl-tab');
    let tab = tabs[0];

    let panel = e.detail.panel;
    let areThereErrors = e.detail.areThereErrors;

    tabs.forEach((temp: any) => {
      if(temp.panel === panel){
        tab = temp;
      }
    });
    if(areThereErrors){
      if(tab.childElementCount == 0){
        tab.innerHTML = `${tab.innerHTML}<span class="error-indicator" style='color: #eb5757'>!</span>`;
      }
    } else {
      tab.innerHTML = tab.innerHTML.split("<")[0];
    }
    
  }

  cleanUrl(url: string): string {
    let cleanedUrl: string | undefined;
  
    if (url && !url.startsWith('http') && !url.startsWith('https')) {
      cleanedUrl = 'https://' + url;
    }
  
    if (cleanedUrl) {
      const test = this.isValidURL(cleanedUrl);
  
      if (test === false && !url.toLowerCase().startsWith('http://')) {
        throw new Error(
          'This error means that you may have a bad https cert or the url may not be correct'
        );
      }
  
      return cleanedUrl;
    }
  
    // original URL is ok
    return url;
  }
  
  isValidURL(str: string) {
    // from https://stackoverflow.com/a/14582229 but removed the ip address section
    var pattern = new RegExp(
      '^((https?:)?\\/\\/)?' + // protocol
      '(?:\\S+(?::\\S*)?@)?(([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}' + // domain name
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\\\#[-a-z\\\\d_]*)?', // fragment locator
      'i' // case insensitive
    );
    return !!pattern.test(str);
  }

  setSelectedTab(e: any){
    this.selectedTab = e.detail.name;
    let tabSwitched = new CustomEvent('tabSwitched', {
      detail: {
          tab: this.selectedTab,
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(tabSwitched);
  }

  render() {
    return html`
      <sl-tab-group id="editor-tabs" @sl-tab-show=${(e: any) => this.setSelectedTab(e)}>
        <sl-tab slot="nav" panel="info" ?active=${this.startingTab === "info"}>Info</sl-tab>
        <sl-tab slot="nav" panel="settings" ?active=${this.startingTab === "settings"}>Settings</sl-tab>
        <sl-tab slot="nav" panel="platform" ?active=${this.startingTab === "platform"}>Platform</sl-tab>
        <sl-tab slot="nav" panel="icons" ?active=${this.startingTab === "icons"}>Icons</sl-tab>
        <sl-tab slot="nav" panel="screenshots" ?active=${this.startingTab === "screenshots"}>Screenshots</sl-tab>
        <!-- <sl-tab slot="nav" panel="preview">Preview</sl-tab> -->
        <sl-tab slot="nav" panel="code">Code</sl-tab>
        <sl-tab-panel name="info"><manifest-info-form id="info-tab" .manifest=${this.manifest} @manifestUpdated=${(e: any) => this.updateManifest(e.detail.field, e.detail.change)} @errorInTab=${(e: CustomEvent) => this.errorInTab(e)}></manifest-info-form></sl-tab-panel>
        <sl-tab-panel name="settings"><manifest-settings-form .manifest=${this.manifest} @manifestUpdated=${(e: any) => this.updateManifest(e.detail.field, e.detail.change)} @errorInTab=${(e: CustomEvent) => this.errorInTab(e)}></manifest-settings-form></sl-tab-panel>
        <sl-tab-panel name="platform"><manifest-platform-form id="platform-tab" .manifest=${this.manifest} @manifestUpdated=${(e: any) => this.updateManifest(e.detail.field, e.detail.change)} @errorInTab=${(e: CustomEvent) => this.errorInTab(e)}></manifest-platform-form></sl-tab-panel>
        <sl-tab-panel name="icons"><manifest-icons-form .manifest=${this.manifest} .manifestURL=${this.cleanUrl(this.manifestURL)} @manifestUpdated=${(e: any) => this.updateManifest(e.detail.field, e.detail.change)} @errorInTab=${(e: CustomEvent) => this.errorInTab(e)}></manifest-icons-form></sl-tab-panel>
        <sl-tab-panel name="screenshots"><manifest-screenshots-form .manifest=${this.manifest} .manifestURL=${this.cleanUrl(this.manifestURL)} .baseURL=${this.cleanUrl(this.baseURL)} @manifestUpdated=${(e: any) => this.updateManifest(e.detail.field, e.detail.change)} @errorInTab=${(e: CustomEvent) => this.errorInTab(e)}></manifest-screenshots-form></sl-tab-panel>
        <!-- <sl-tab-panel name="preview"><manifest-preview-form .manifest=${this.manifest} .manifestURL=${this.cleanUrl(this.manifestURL)} @manifestUpdated=${(e: any) => this.updateManifest(e.detail.field, e.detail.change)}></manifest-preview-form></sl-tab-panel> -->
        <sl-tab-panel name="code"><manifest-code-form .manifest=${this.manifest} @manifestUpdated=${(e: any) => this.updateManifest(e.detail.field, e.detail.change)}></manifest-code-form></sl-tab-panel>
      </sl-tab-group>
    `;
  }
}

/* const DEFAULT_MANIFEST: Manifest = {
  dir: 'auto',
  display: 'fullscreen',
  name: 'placeholder name',
  short_name: 'placeholder short_name',
  start_url: "/",
  orientation: 'any',
  scope: '/',
  lang: 'en',
  description: 'placeholder description',
  theme_color: '#000000',
  background_color: '#000000',
  icons: [],
  screenshots: [],
}; //load an initial manifest */
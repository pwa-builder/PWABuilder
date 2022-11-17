import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { windowsEndpoint } from "../endpoints";
import { WindowsOptions } from "../interfaces/windowsOptions";
import { SiteData } from "../interfaces/validation";

import "@shoelace-style/shoelace/dist/components/input/input";
import '@shoelace-style/shoelace/dist/components/button/button';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip';

@customElement("package-windows")
export class PackageWindows extends LitElement {
  @state() currentManiUrl: string | undefined = undefined;
  @state() windowsOptions: WindowsOptions | undefined = undefined;
  
  static styles = [
    css`
      :host {
        display: block;
      }
      
      form {
        display: grid;
        gap: 10px;
      }
      
      label {
        display: flex;
        flex-direction: column;
      }
      
      form sl-button {
        width: 8em;
        justify-self: flex-end;
      }
      
      sl-tooltip p {
        white-space: pre-wrap;
        width: 20em;
      }
      
      #header-block {
        display: flex;
        align-items: center;
        justify-content: space-between;
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

    if (this._siteData && this._siteData.currentUrl && this._siteData.manifest.hasManifest) {
      this.currentManiUrl = this._siteData.manifest.manifestUri;
      const manifest = this._siteData.manifest.manifest;

      if (manifest) {
        // set options we can find in manifest
        this.setUpOptions(
          this._siteData.currentUrl,
          manifest.name || manifest.short_name || "My App",
          "",
          "",
          "",
          true,
          "",
          ""
        );
      }
    }

    this.requestUpdate();
  }
  

  private async packageForWindows(options: any): Promise<Response | undefined> {
    let response: Response | undefined;

    try {
      response = await fetch(windowsEndpoint, {
        method: "POST",
        body: JSON.stringify(options),
        headers: new Headers({ "content-type": "application/json" }),
      });
    } catch (err) {
      console.error(err);
    }

    return response;
  }

  private setUpOptions(
    url: string,
    name: string,
    packageId: string,
    version: string,
    classicVersion: string,
    allowSigning: boolean = true,
    publisherDisplayName: string,
    publisherCommonName: string
  ): WindowsOptions {
    this.windowsOptions = {
      url,
      name,
      packageId,
      version,
      allowSigning,
      classicPackage: {
        generate: true,
        version: classicVersion,
      },
      publisher: {
        displayName: publisherDisplayName,
        commonName: publisherCommonName,
      },
    };

    return this.windowsOptions;
  }

  async handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (event.target) {
      let data = new FormData(event.target as HTMLFormElement);

      if (this.windowsOptions) {
        for (var pair of data.entries()) {
          switch (pair[0]) {
            case "packageId":
              this.windowsOptions.packageId = pair[1].toString();

              break;
            case "version":
              this.windowsOptions.version = pair[1].toString();

              break;
            case "classicVersion":
              this.windowsOptions.classicPackage.version = pair[1].toString();

              break;
            case "publisherDisplayName":
              this.windowsOptions.publisher.displayName = pair[1].toString();

              break;
            case "publisherCommonName":
              this.windowsOptions.publisher.commonName = pair[1].toString();

              break;

            default:
              break;
          }
        }

        // we now have all options, lets try to generate a package
        const response = await this.packageForWindows(this.windowsOptions);
        if (response) {
          const data = await response.blob();
          const url = URL.createObjectURL(data);

          // var blob = new Blob(["text" + "file"], {type: "application/octet-stream"});
          // var url = URL.createObjectURL(blob);

          // download the package
          await chrome.downloads.download({
            url,
            filename: `${this.windowsOptions.packageId}.zip`,
            saveAs: true,
          });
        }
      }
    }
  }

  render() {
    return html`
      <div id="header-block">
        <h1>Package for The Microsoft Store</h1>
        <a href="https://blog.pwabuilder.com/docs/windows-platform/">Documentation</a>
      </div>

      <form @submit="${($event: SubmitEvent) => this.handleSubmit($event)}">
        <!-- label for packageId input -->
        <sl-tooltip id="tooltip" anchor="packageId">
          <div slot="content">
            The Package ID uniquely identifying your app in the Microsoft Store.
            Get this value from Windows Partner Center.
          </div>
          
          <label for="packageId"
          >Package Id
          
          <sl-input
          type="text"
          id="packageId"
          name="packageId"
          placeholder="MyCompany.MyApp"
          required
          max-length="50"
          min-length="3"
          pattern="[a-zA-Z0-9.-]*$"
          ></sl-input>
        </label>
      </sl-tooltip>

        <!-- label for publisherDisplayName input -->
        <sl-tooltip id="tooltip" anchor="publisherDisplayName">
          <div slot="content">
            The display name of your app's publisher. Get this value from
            Windows Partner Center.
          </div>
          <label for="publisherDisplayName"
          >Publisher Display Name
          <sl-input
          type="text"
          id="publisherDisplayName"
          name="publisherDisplayName"
          placeholder="Contoso Inc."
          required
          min-length="3"
          spellcheck="false"
          ></sl-input>
        </label>
      </sl-tooltip>

        <!-- label for publisherCommonName input -->
        <sl-tooltip id="tooltip" anchor="publisherCommonName">
          <div slot="content">
            The ID of your app's publisher. Get this value from Windows Partner
            Center.
          </div>
          <label for="publisherCommonName"
          >Publisher Common Name
          <sl-input
          type="text"
          id="publisherCommonName"
          name="publisherCommonName"
          placeholder="Publisher Common Name"
          pattern="CN=.+"
          required
          spellcheck="false"
          ,
          min-length="4"
          ,
          ></sl-input>
        </label>
      </sl-tooltip>

        <!-- label for version input -->
        <sl-tooltip id="tooltip" anchor="version">
          <div slot="content">
            Your app version in the form of '1.0.0'. It must not start with zero
            and must be greater than classic package version. For new apps, this
            should be set to 1.0.1
          </div>
          
          <label for="version"
            >Version
            <sl-input
            type="text"
            id="version"
            name="version"
            required
            min-length="5"
            placeholder="1.0.1"
            spellcheck="false"
            pattern="^[^0]+\\d*.\\d+.\\d+$"
            ></sl-input>
          </label>
        </sl-tooltip>

        <!-- label for classicVersion input -->
        <sl-tooltip id="tooltip" anchor="classicVersion">
          <div slot="content">
            The version of your app that runs on older versions of Windows. Must
            be in the form of '1.0.0', it cannot start with zero, and must be
            less than app version. For new apps, this should be set to 1.0.0
          </div>
          <label for="classicVersion"
            >Classic Version
            <sl-input
              type="text"
              id="classicVersion"
              name="classicVersion"
              required
              min-length="5"
              placeholder="1.0.0"
              spellcheck="false"
              pattern="^[^0]+\\d*.\\d+.\\d+$"
            ></sl-input>
          </label>
        </sl-tooltip>

        <!-- submit button -->
        <sl-button appearance="accent" type="submit"
          >Generate</sl-button
        >
      </form>
    `;
  }
}

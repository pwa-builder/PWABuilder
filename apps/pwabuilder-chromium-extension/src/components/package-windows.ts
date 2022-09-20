import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { windowsEndpoint } from "../endpoints";
import { WindowsOptions } from "../interfaces/windowsOptions";

import {
  provideFluentDesignSystem,
  fluentTextField,
  fluentButton,
  fluentTooltip,
  fluentAnchor,
} from "@fluentui/web-components";
import { getManifestInfo } from "../checks/manifest";

provideFluentDesignSystem().register(
  fluentTextField(),
  fluentButton(),
  fluentTooltip(),
  fluentAnchor()
);

@customElement("package-windows")
export class PackageWindows extends LitElement {
  @state() currentManiUrl: string | undefined = undefined;
  @state() windowsOptions: WindowsOptions | undefined = undefined;
  @state() currentUrl: string = "";

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

      form fluent-button {
        width: 8em;
        justify-self: flex-end;
      }

      fluent-tooltip p {
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

  public async firstUpdated() {
    const manifestInfo = await getManifestInfo();
        
    if (manifestInfo) {
      this.currentManiUrl = manifestInfo.manifestUri;
      const manifest = manifestInfo.manifest;

      // get current url
      let url = await chrome.tabs.query({ active: true, currentWindow: true });
      if (url.length > 0) {
        this.currentUrl = url[0].url || "";
      }

      if (manifest) {
        // set options we can find in manifest
        this.setUpOptions(
          this.currentUrl,
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
        <fluent-anchor href="https://blog.pwabuilder.com/docs/windows-platform/">Documentation</fluent-anchor>
      </div>

      <form @submit="${($event: SubmitEvent) => this.handleSubmit($event)}">
        <!-- label for packageId input -->
        <fluent-tooltip id="tooltip" anchor="packageId">
          <p>
            The Package ID uniquely identifying your app in the Microsoft Store.
            Get this value from Windows Partner Center.
          </p>
        </fluent-tooltip>

        <label for="packageId"
          >Package Id

          <fluent-text-field
            type="text"
            id="packageId"
            name="packageId"
            placeholder="MyCompany.MyApp"
            required
            max-length="50"
            min-length="3"
            pattern="[a-zA-Z0-9.-]*$"
          ></fluent-text-field>
        </label>

        <!-- label for publisherDisplayName input -->
        <fluent-tooltip id="tooltip" anchor="publisherDisplayName">
          <p>
            The display name of your app's publisher. Get this value from
            Windows Partner Center.
          </p>
        </fluent-tooltip>
        <label for="publisherDisplayName"
          >Publisher Display Name
          <fluent-text-field
            type="text"
            id="publisherDisplayName"
            name="publisherDisplayName"
            placeholder="Contoso Inc."
            required
            min-length="3"
            spellcheck="false"
          ></fluent-text-field>
        </label>

        <!-- label for publisherCommonName input -->
        <fluent-tooltip id="tooltip" anchor="publisherCommonName">
          <p>
            The ID of your app's publisher. Get this value from Windows Partner
            Center.
          </p>
        </fluent-tooltip>
        <label for="publisherCommonName"
          >Publisher Common Name
          <fluent-text-field
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
          ></fluent-text-field>
        </label>

        <!-- label for version input -->
        <fluent-tooltip id="tooltip" anchor="version">
          <p>
            Your app version in the form of '1.0.0'. It must not start with zero
            and must be greater than classic package version. For new apps, this
            should be set to 1.0.1
          </p>
        </fluent-tooltip>

        <label for="version"
          >Version
          <fluent-text-field
            type="text"
            id="version"
            name="version"
            required
            min-length="5"
            placeholder="1.0.1"
            spellcheck="false"
            pattern="^[^0]+\\d*.\\d+.\\d+$"
          ></fluent-text-field>
        </label>

        <!-- label for classicVersion input -->
        <fluent-tooltip id="tooltip" anchor="classicVersion">
          <p>
            The version of your app that runs on older versions of Windows. Must
            be in the form of '1.0.0', it cannot start with zero, and must be
            less than app version. For new apps, this should be set to 1.0.0
          </p>
        </fluent-tooltip>
        <label for="classicVersion"
          >Classic Version
          <fluent-text-field
            type="text"
            id="classicVersion"
            name="classicVersion"
            required
            min-length="5"
            placeholder="1.0.0"
            spellcheck="false"
            pattern="^[^0]+\\d*.\\d+.\\d+$"
          ></fluent-text-field>
        </label>

        <!-- submit button -->
        <fluent-button appearance="accent" type="submit"
          >Generate</fluent-button
        >
      </form>
    `;
  }
}

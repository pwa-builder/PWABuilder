import { LitElement, css, html, TemplateResult } from 'lit';

import { customElement, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import {
  BreakpointValues,
  xxxLargeBreakPoint,
  largeBreakPoint,
  mediumBreakPoint,
  smallBreakPoint,
  customBreakPoint,
} from '../utils/css/breakpoints';
import { hidden_all } from '../utils/css/hidden';
import { resizeObserver } from '../utils/events';

// @ts-ignore
import style from '../../../styles/layout-defaults.css';

import '../components/app-header';
import '../components/app-sidebar';
import '../components/content-header';
import '../components/app-modal';
import '../components/app-card';
import '../components/resource-hub';
import '../components/windows-form';
import '../components/android-form';
import '../components/ios-form';
import '../components/oculus-form';

import {
  getPlatformsGenerated,
  GeneratedPlatforms,
} from '../services/congrats';
import { fileSave } from 'browser-fs-access';
import { Router } from '@vaadin/router';
import { generatePackage, Platform } from '../services/publish';
import { BlogPost, allPosts } from '../services/blog';

import { localeStrings } from '../../locales';
import { WindowsPackageOptions } from '../utils/win-validation';
import { IOSAppPackageOptions } from '../utils/ios-validation';
import { AndroidPackageOptions } from '../utils/android-validation';

@customElement('app-congrats')
export class AppCongrats extends LitElement {
  @state() mql = window.matchMedia(
    `(min-width: ${BreakpointValues.largeUpper}px)`
  );
  @state() isDeskTopView = this.mql.matches;
  @state() generatedPlatforms: GeneratedPlatforms = getPlatformsGenerated();
  @state() generating = false;
  @state() errored = false;
  @state() errorMessage: string | undefined;
  @state() blob: Blob | File | undefined;
  @state() testBlob: Blob | File | undefined;
  @state() openWindowsOptions = false;
  @state() openAndroidOptions = false;
  @state() openIOSOptions = false;
  @state() openOculusOptions = false;
  @state() blog_posts: Array<BlogPost> | undefined;
  @state() featuredPost: BlogPost | undefined;

  static get styles() {
    return [
      style,
      css`
        content-header::part(header) {
          display: none;
        }

        app-button {
          --button-width: 152px;
        }

        app-button#return-to-manifest-button {
          --button-width: 200px;
        }

        #summary-block {
          padding: 16px 16px 16px 36px;
          border-bottom: var(--list-border);

          margin-right: 2em;
        }

        p {
          font-size: var(--font-size);
          color: var(--font-color);
          max-width: 767px;
        }

        h1 {
          font-size: var(--xlarge-font-size);
          line-height: 46px;
        }

        h2 {
          font-size: var(--medium-font-size);
          margin-bottom: 8px;
        }

        #hero-p {
          font-size: var(--font-size);
          line-height: 24px;
          max-width: 406px;
        }

        ul {
          list-style: none;
          margin: 0;
          padding: 0;

          width: 100%;
        }

        li {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 35px;
          padding-bottom: 35px;
          border-bottom: var(--list-border);
        }

        li h3 {
          font-size: var(--small-medium-font-size);
          margin-bottom: 8px;
          margin-top: 0px;
        }

        #other-stores {
          padding: 16px 16px 16px 36px;
          border-bottom: var(--list-border);
          margin-right: 2em;
        }

        #blog-section {
          padding: 16px 32px;
          background: #f8f8f8;
        }

        #tools-section {
          padding: 16px;
        }

        #tools-block {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(244px, 1fr));
          grid-gap: 23px;
        }

        #tools-section h2 {
          margin-top: 36px;
          margin-bottom: 32px;

          text-align: center;
        }

        #blog-section h2 {
          margin-top: 36px;
          margin-bottom: 32px;
        }

        #blog-block {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(256px, 1fr));
        }

        #blog-block app-card {
          max-width: 612px;
          margin-bottom: 10px;
          box-shadow: 0px 2px 4px 0px rgb(0 0 0 / 25%);
          border: none;
          border-radius: 4px;
        }

        #blog-block #first-card {
          max-height: 552px;
          margin-right: 24px;
        }

        #tools-section h2 {
          text-align: center;
        }

        #test-package-button {
          display: block;
          margin-top: 15px;
        }

        #android-publish-button {
          /* same width as buttons above it */
          width: 152px;
        }

        #anchor-block {
          display: flex;
          margin-top: 20px;
          justify-content: flex-end;
          margin-bottom: 20px;
        }

        #anchor-block fast-anchor::part(control) {
          border-bottom: none;
          color: inherit;
          font-weight: var(--font-bold);
          font-size: var(--small-medium-font-size);
        }

        #platform-actions-block {
          margin-left: 16px;
        }

        .test-package-button {
          width: 150px;
          height: 40px;
          display: inherit;
        }
      `,
      xxxLargeBreakPoint(
        css`
          app-sidebar {
            display: block;
          }

          #tablet-sidebar {
            display: none;
          }

          #desktop-sidebar {
            display: block;
          }

          #congrats-wrapper {
            max-width: 69em;
            background: white;
          }
        `
      ),
      largeBreakPoint(
        css`
          #tablet-sidebar {
            display: block;
          }

          #desktop-sidebar {
            display: none;
          }
        `
      ),
      mediumBreakPoint(
        css`
          #blog-block #first-card {
            margin-right: initial;
          }

          .congrats h1 {
            font-size: 33px;
            max-width: 10em;

            margin-top: 0;
            margin-bottom: 2em;
          }

          .congrats p {
            display: none;
          }

          #other-stores li {
            flex-direction: column;
            align-items: flex-start;
          }

          #other-stores #title-block {
            width: 100%;
          }

          #other-stores #title-block p {
            width: unset;
          }

          #other-stores #platform-actions-block {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 2em;
          }

          #other-stores li h1 {
            font-size: 33px;

            margin-top: 0;
            margin-bottom: 1em;
          }

          #test-package-button app-button::part(underlying-button) {
            width: 152px;
            font-size: var(--font-size);
            height: 40px;
          }
        `
      ),
      smallBreakPoint(
        css`
          fast-tabs::part(tablist) {
            display: none;
          }

          .congrats h1 {
            font-size: 33px;

            margin-top: 0;
            margin-bottom: 2em;
          }

          .congrats p {
            display: none;
          }

          #other-stores li {
            flex-direction: column;
            align-items: flex-start;
          }

          #other-stores #title-block {
            width: 100%;
          }

          #other-stores #title-block p {
            width: unset;
          }

          #other-stores #platform-actions-block {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 2em;
            margin-left: 0;
          }

          #other-stores li h1 {
            font-size: 33px;

            margin-top: 0;
            margin-bottom: 1em;
          }

          #test-package-button app-button::part(underlying-button) {
            width: 152px;
            font-size: var(--font-size);
            height: 40px;
          }

          #anchor-block {
            justify-content: space-around;
          }

          #blog-block app-card {
            height: 300px;
          }
        `
      ),
      hidden_all,
      xxxLargeBreakPoint(
        css`
          app-sidebar {
            display: block;
          }

          #tablet-sidebar {
            display: none;
          }

          #desktop-sidebar {
            display: block;
          }
        `
      ),
      largeBreakPoint(
        css`
          #tablet-sidebar {
            display: block;
          }

          #desktop-sidebar {
            display: none;
          }
        `
      ),
      mediumBreakPoint(
        css`
          #blog-block #first-card {
            margin-right: initial;
          }
        `
      ),
      smallBreakPoint(
        css`
          #blog-block {
            display: block;
            overflow-y: hidden;
            overflow-x: scroll;
            scroll-snap-type: x proximity;
            white-space: nowrap;
            align-items: center;
            padding: 0 16px;
            margin-bottom: 16px;
          }

          .other.posts {
            display: inline-block;
            margin-left: 32px;
          }

          #blog-block #first-card {
            margin-right: 0;
          }

          #blog-block .blog {
            display: inline-block;
            width: calc(100% - 32px);
            margin-right: 32px;
            margin-bottom: 16px;
            scroll-snap-align: center;
          }
        `
      ),
      customBreakPoint(
        css`
          #blog-block {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          #blog-block app-card {
            max-width: 416px;
          }

          /* due to container, might want to refactor so the container is optional. */
          .other.posts {
            width: 100%;
          }

          .other.posts app-card {
            margin-left: auto;
            margin-right: auto;
          }
        `,
        480,
        639
      ),
    ];
  }

  constructor() {
    super();

    resizeObserver.observe(this);
  }

  firstUpdated() {
    let possiblePosts = allPosts;

    if (possiblePosts) {
      // first post in array will be featured
      // the below logic figures out what that should be
      // If both platforms were not generated then the featured should
      // be Windows with Android being the second post

      if (this.generatedPlatforms.windows === false) {
        // Windows platform was not generated, windows blog post should be featured
        possiblePosts.map(post => {
          if (post.relatedPlatform && post.relatedPlatform === 'windows') {
            this.featuredPost = post;

            possiblePosts = possiblePosts.filter(
              item => item.title !== post.title
            );
          }
        });
      } else if (this.generatedPlatforms.android === false) {
        possiblePosts.map(post => {
          if (post.relatedPlatform && post.relatedPlatform === 'android') {
            this.featuredPost = post;

            possiblePosts = possiblePosts.filter(
              item => item.title !== post.title
            );
          }
        });
      } else if (this.generatedPlatforms.ios === false) {
        possiblePosts.map(post => {
          if (post.relatedPlatform && post.relatedPlatform === 'ios') {
            this.featuredPost = post;

            possiblePosts = possiblePosts.filter(
              item => item.title !== post.title
            );
          }
        });
      }

      this.blog_posts = possiblePosts;
    }
  }

  async generateApp(type: Platform, packageOptions?: AndroidPackageOptions | WindowsPackageOptions | IOSAppPackageOptions) {
    try {
      this.generating = true;
      const packageData = await generatePackage(type, packageOptions);
      if (packageData) {
        if (packageData.type === 'test') {
          this.testBlob = packageData.blob || undefined;
        } else {
          this.blob = packageData.blob || undefined;
        }
      }
    } catch (err) {
      console.error(err);
      this.showAlertModal(err as string);
    } finally {
      this.generating = false;
      this.openAndroidOptions = false;
      this.openWindowsOptions = false;
      this.openIOSOptions = false;
    }
  }

  async download() {
    if (this.blob || this.testBlob) {
      await fileSave((this.blob as Blob) || (this.testBlob as Blob), {
        fileName: 'your_pwa.zip',
        extensions: ['.zip'],
      });

      this.blob = undefined;
      this.testBlob = undefined;
    }
  }

  returnToFix() {
    const resultsString = sessionStorage.getItem('results-string');

    // navigate back to report-card page
    // with current manifest results
    Router.go(`/reportcard?results=${resultsString}`);
  }

  showAlertModal(errorMessage: string) {
    this.errored = true;

    this.errorMessage = errorMessage;
  }

  render() {
    return html`
      <app-modal
        heading="Wait a minute!"
        .body="${this.errorMessage || ''}"
        ?open="${this.errored}"
        id="error-modal"
      >
        <img
          class="modal-image"
          slot="modal-image"
          src="/assets/warning.svg"
          alt="warning icon"
        />

        <div slot="modal-actions">
          <app-button id="return-to-manifest-button" @click="${() => this.returnToFix()}"
            >Return to Manifest Options</app-button
          >
        </div>
      </app-modal>

      <app-modal
        ?open="${this.blob ? true : false}"
        heading="Download your package"
        body="Your app package is ready for download."
        id="download-modal"
      >
        <img
          class="modal-image"
          slot="modal-image"
          src="/assets/images/store_fpo.png"
          alt="publish icon"
        />

        <div slot="modal-actions">
          <app-button @click="${() => this.download()}">Download</app-button>
        </div>
      </app-modal>

      <app-modal
        ?open="${this.testBlob ? true : false}"
        heading="Windows Test Package Download"
        body="${localeStrings.input.publish.windows.test_package}"
        id="test-download-modal"
      >
        <img
          class="modal-image"
          slot="modal-image"
          src="/assets/images/warning.svg"
          alt="warning icon"
        />

        <div slot="modal-actions">
          <app-button @click="${() => this.download()}">Download</app-button>
        </div>
      </app-modal>

      <app-modal
        id="windows-options-modal"
        heading="Microsoft Store Options"
        body="Customize your Windows app below"
        ?open="${this.openWindowsOptions}"
      >
        <windows-form
          slot="modal-form"
          .generating=${this.generating}
          @init-windows-gen="${(ev: CustomEvent) =>
            this.generateApp('windows', ev.detail as WindowsPackageOptions)}"
        ></windows-form>
      </app-modal>

      <app-modal
        id="android-options-modal"
        heading="Google Play Store Options"
        body="Customize your Android app below"
        ?open="${this.openAndroidOptions}"
      >
        <android-form
          slot="modal-form"
          .generating=${this.generating}
          @init-android-gen="${(ev: CustomEvent) =>
            this.generateApp('android', ev.detail as AndroidPackageOptions)}"
        ></android-form>
      </app-modal>

      <app-modal
        id="ios-options-modal"
        heading="iOS App Store Options"
        body="Customize your iOS app below"
        ?open="${this.openIOSOptions}"
      >
        <ios-form
          slot="modal-form"
          .generating=${this.generating}
          @init-ios-gen="${(ev: CustomEvent) =>
          this.generateApp('ios', ev.detail)}"
        ></ios-form>
      </app-modal>

      <app-modal
        id="oculus-options-modal"
        heading="Meta Quest App Options"
        body="Customize your Meta Quest app below"
        ?open="${this.openOculusOptions}"
      >
        <oculus-form
          slot="modal-form"
          .generating=${this.generating}
          @init-oculus-gen="${(ev: CustomEvent) =>
          this.generateApp('oculus', ev.detail)}"
        ></oculus-form>
      </app-modal>

      <div id="congrats-wrapper">
        <app-header></app-header>

        <div
          id="grid"
          class="${classMap({
            'grid-mobile': this.isDeskTopView == false,
          })}"
        >
          <app-sidebar id="desktop-sidebar"></app-sidebar>

          <div>
            <content-header class="congrats">
              <h1 slot="hero-container">Awesome!</h1>
              <p id="hero-p" slot="hero-container">
                You have taken your PWA to the app stores!
              </p>
            </content-header>

            <app-sidebar id="tablet-sidebar"></app-sidebar>

            <section id="other-stores">
              <h2>Publish your PWA to other stores?</h2>

              <ul>
                ${this.renderWindowsPlatform()}
                ${this.renderAndroidPlatform()}
                ${this.renderiOSPlatform()}
              </ul>

            </section>

            <section id="blog-section">
              <h2>Learn more on our Blog…</h2>

              <div id="blog-block">
                ${this.featuredPost
                  ? html`<app-card
                      id="first-card"
                      cardTitle="${this.featuredPost.title}"
                      description="${this.featuredPost.description}"
                      imageUrl="${this.featuredPost.imageUrl}"
                      linkText="Read Post"
                      linkRoute="${this.featuredPost.clickUrl}"
                      .tags=${this.featuredPost.tags}
                      .featured="${this.isFeatured()}"
                      ?isActionCard="${true}"
                      class="${classMap({
                        blog: true,
                        featured: this.isFeatured(),
                      })}"
                    >
                    </app-card>`
                  : null}

                <div class="other posts">
                  ${this.blog_posts
                    ? this.blog_posts.map(post => {
                        return html`
                          <app-card
                            cardTitle="${post.title}"
                            description="${post.description}"
                            class="blog"
                            imageUrl="${post.imageUrl}"
                            linkText="Read Post"
                            .linkRoute="${post.clickUrl}"
                            ?isActionCard="${true}"
                          >
                          </app-card>
                        `;
                      })
                    : null}
                </div>
              </div>

              <div id="anchor-block">
                <fast-anchor
                  href="https://blog.pwabuilder.com"
                  target="_blank"
                  appearance="hypertext"
                  >View more blog posts</fast-anchor
                >
              </div>
            </section>

            <section id="tools-section">
              <resource-hub page="complete">
                <h2 slot="title">Helpful tools for you...</h2>
              </resource-hub>
            </section>
          </div>
        </div>
      </div>
    `;
  }

  isFeatured() {
    return window.innerWidth > 1023;
  }

  renderWindowsPlatform(): TemplateResult {
    // If we already generated windows package, skip this.
    if (this.generatedPlatforms.windows) {
      return html``;
    }      
      
    return html`
      <li>
        <div id="title-block">
          <h3>Windows</h3>
          <p>
            <a href="https://blog.pwabuilder.com/posts/bringing-chromium-edge-pwas-to-the-microsoft-store/">
              PWAs work great on Windows!
            </a>
            Tap Test Package to test your PWA on a Windows
            device, or if you're ready, tap Publish to generate
            a Microsoft Store-ready package for your PWA.
          </p>
        </div>

        <div id="platform-actions-block">
          <app-button
            @click="${() => this.openWindowsOptions = true}">
            Publish
          </app-button>

          <loading-button
            ?loading=${this.generating}
            id="test-package-button"
            class="navigation test-package-button secondary"
            .secondary=${true}
            @click="${() => this.generateApp('windows')}">
            Test Package
            </loading-button>
        </div>
      </li>
    `;
  }

  renderAndroidPlatform(): TemplateResult {
    // If we already generated Android, skip this.
    if (this.generatedPlatforms.android) {
      return html``;
    }

    return html`
      <li>
        <div id="title-block">
          <h3>Android</h3>
          <p>
            Want to ship your PWA to Android? PWAs also work great
            on Android and are accepted in the Google Play Store.
            Tap publish to generate a package you can both test
            on a Android device and submit to the Google Play Store.
          </p>
        </div>

        <div id="platform-actions-block">
          <app-button
            id="android-publish-button"
            @click="${() => this.openAndroidOptions = true}">
            Publish
          </app-button>
        </div>
      </li>
    `;
  }

  renderiOSPlatform(): TemplateResult {
    // If we already generated iOS, skip this.
    if (this.generatedPlatforms.ios) {
      return html``;
    }

    return html`
      <li>
        <div id="title-block">
          <h3>iOS</h3>
          <p>
            Your PWA can run on iOS and be published to the iOS App Store. 
            Tab publish to generate your iOS app package.
          </p>
        </div>
      
        <div id="platform-actions-block">
          <app-button @click="${() => this.openIOSOptions = true}">
            Publish
          </app-button>
        </div>
      </li>
    `;
  }
}



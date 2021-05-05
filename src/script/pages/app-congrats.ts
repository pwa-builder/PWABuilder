import {
  LitElement,
  css,
  html
} from 'lit';

import { customElement,
  state, } from "lit/decorators.js"
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

// @ts-ignore
import style from '../../../styles/layout-defaults.css';

import '../components/app-header';
import '../components/app-sidebar';
import '../components/content-header';
import '../components/app-modal';
import '../components/app-card';
import '../components/resource-hub';

import { getPlatformsGenerated } from '../services/congrats';
import { fileSave } from 'browser-fs-access';
import { Router } from '@vaadin/router';
import { generatePackage, platform } from '../services/publish';
import { BlogPost, allPosts } from '../services/blog';

@customElement('app-congrats')
export class AppCongrats extends LitElement {
  @state() mql = window.matchMedia(
    `(min-width: ${BreakpointValues.largeUpper}px)`
  );

  @state() isDeskTopView = this.mql.matches;

  @state() generatedPlatforms;

  @state() generating = false;

  @state() errored = false;
  @state() errorMessage: string | undefined;

  @state() blob: Blob | File | undefined;
  @state() testBlob: Blob | File | undefined;
  @state() open_windows_options = false;
  @state() open_android_options = false;

  @state() blog_posts: Array<BlogPost> | undefined;
  @state() featuredPost: BlogPost | undefined;

  static get styles() {
    return [
      style,
      css`
        content-header::part(header) {
          display: none;
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

        h2 {
          font-size: var(--xlarge-font-size);
          line-height: 46px;
          max-width: 526px;
        }

        h3 {
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

        li h4 {
          font-size: var(--small-medium-font-size);
          margin-bottom: 8px;
          margin-top: 0px;
        }

        #other-stores {
          padding: 16px;
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

        #tools-section h3 {
          margin-top: 36px;
          margin-bottom: 32px;

          text-align: center;
        }

        #blog-section h3 {
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

        #tools-section h3 {
          text-align: center;
        }

        #test-package-button {
          display: block;
          margin-top: 15px;

          --neutral-fill-rest: white;
          --neutral-fill-active: white;
          --neutral-fill-hover: white;
        }

        #test-package-button::part(underlying-button) {
          --button-font-color: var(--font-color);
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

        ${xxxLargeBreakPoint(
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
        )}

        ${largeBreakPoint(
          css`
            #tablet-sidebar {
              display: block;
            }

            #desktop-sidebar {
              display: none;
            }
          `
        )}

        ${mediumBreakPoint(
          css`
            #blog-block #first-card {
              margin-right: initial;
            }

            .congrats h2 {
              font-size: 33px;
              max-width: 10em;

              margin-top: 0;
              margin-bottom: 2em;
            }

            .congrats p {
              display: none;
            }
          `
        )}

        ${smallBreakPoint(
          css`
            fast-tabs::part(tablist) {
              display: none;
            }

            .congrats h2 {
              font-size: 33px;

              margin-top: 0;
              margin-bottom: 2em;
            }

            .congrats p {
              display: none;
            }
          `
        )},
      `,
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
  }

  firstUpdated() {
    this.generatedPlatforms = getPlatformsGenerated();

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
      }

      this.blog_posts = possiblePosts;
    }
  }

  async generate(type: platform, form?: HTMLFormElement) {
    try {
      this.generating = true;

      const packageData = await generatePackage(type, form);

      if (packageData) {
        if (packageData.type === 'test') {
          this.testBlob = packageData.blob;
        } else {
          this.blob = packageData.blob;
        }
      }

      this.generating = false;
      this.open_android_options = false;
      this.open_windows_options = false;
    } catch (err) {
      console.error(err);

      this.showAlertModal(err);
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

  showWindowsOptionsModal() {
    this.open_windows_options = !this.open_windows_options;
  }

  showAndroidOptionsModal() {
    this.open_android_options = !this.open_android_options;
  }

  render() {
    return html`
      <app-modal
        title="Wait a minute!"
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
          <app-button @click="${() => this.returnToFix()}"
            >Return to Manifest Options</app-button
          >
        </div>
      </app-modal>

      <app-modal
        ?open="${this.blob ? true : false}"
        title="Download your package"
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
        title="Test Package Download"
        body="Want to test your files first before publishing? No problem! Description here about how this isn’t store ready and how they can come back and publish their PWA after doing whatever they need to do with their testing etc etc tc etc."
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
        title="Microsoft Store Options"
        body="Customize your Windows package below!"
        ?open="${this.open_windows_options}"
      >
        <windows-form
          slot="modal-form"
          .generating=${this.generating}
          @init-windows-gen="${ev => this.generate('windows', ev.detail.form)}"
        ></windows-form>
      </app-modal>

      <app-modal
        id="android-options-modal"
        title="Google Play Store Options"
        body="Customize your Android package below!"
        ?open="${this.open_android_options}"
      >
        <android-form
          slot="modal-form"
          .generating=${this.generating}
          @init-android-gen="${ev => this.generate('android', ev.detail.form)}"
        ></android-form>
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
              <h2 slot="hero-container">Awesome!</h2>
              <p id="hero-p" slot="hero-container">
                You have taken your PWA to the app stores!
              </p>
            </content-header>

            <app-sidebar id="tablet-sidebar"></app-sidebar>

            <section id="summary-block">
              <h3>Nice</h3>

              <p>
                Check below to package your PWA for another store and visit our Blog for demos, components and to learn more about PWAs!
              </p>
            </section>

            <section id="other-stores">
              <h3>Publish your PWA to other stores?</h3>

              <ul>
                ${this.generatedPlatforms &&
                this.generatedPlatforms.windows === false
                  ? html`
                      <li>
                        <div id="title-block">
                          <h4>Windows</h4>
                          <p>
                            <a href="https://medium.com/pwabuilder/bringing-chromium-edge-pwas-progressive-web-apps-to-the-microsoft-store-c0bd07914ed9?source=friends_link&sk=04ca8b2ae2bd094b04ef6b53780b5698">PWAs work great on Windows!</a> Tap Test Package to test your PWA on a Windows device, or if you're ready, tap Publish to generate a Microsoft Store-ready package for your PWA!
                          </p>
                        </div>

                        <div id="platform-actions-block">
                          <app-button
                            @click="${() => this.showWindowsOptionsModal()}"
                            >Publish</app-button
                          >

                          <loading-button
                            ?loading=${this.generating}
                            id="test-package-button"
                            @click="${() => this.generate('windows')}"
                            >Test Package</loading-button
                          >
                        </div>
                      </li>
                    `
                  : null}
              </ul>

              ${this.generatedPlatforms &&
              this.generatedPlatforms.android === false
                ? html`
                    <li>
                      <div id="title-block">
                        <h4>Android</h4>
                        <p>
                          Want to ship your PWA to Android? PWAs also work great on Android and are accepted in the Google Play Store. Tap publish to generate a package you can both test with and submit to the Google Play Store!
                        </p>
                      </div>

                      <div id="platform-actions-block">
                        <app-button
                          id="android-publish-button"
                          @click="${() => this.showAndroidOptionsModal()}"
                          >Publish</app-button
                        >
                      </div>
                    </li>
                  `
                : null}
            </section>

            <section id="blog-section">
              <h3>Learn more on our Blog…</h3>

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
                          >
                          </app-card>
                        `;
                      })
                    : null}
                </div>
              </div>

              <div id="anchor-block">
                <fast-anchor href="" appearance="hypertext"
                  >View more blog posts</fast-anchor
                >
              </div>
            </section>

            <section id="tools-section">
              <resource-hub page="complete">
                <h3 slot="title">Helpful tools for you...</h3>
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
}

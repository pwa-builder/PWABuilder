import { Router } from '@vaadin/router';
import { LitElement, css, html } from 'lit';
//@ts-ignore
import style from '../../../styles/layout-defaults.css';
import { fastAnchorCss } from '../utils/css/fast-elements';
import { customElement, state } from 'lit/decorators.js';
import { getUserDetailsById, isUserLoggedIn } from '../services/sign-in';

@customElement('user-dashboard')
export class UserDashboard extends LitElement {
  userProjects: any[] = [];
  constructor() {
    super();
  }

  static get styles() {
    return [
      style,
      fastAnchorCss,
      css`
        ul {
          list-style: none;
          margin: 0;
          padding: 0;

          width: 100%;
        }

        #title-block {
          width: 100%;
        }

        #title-block p {
          width: unset;
        }

        li {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 35px;
          padding-bottom: 35px;
          border-bottom: var(--list-border);
        }
        p {
          font-size: initial;
          font-weight: initial;
          padding-left: 34px;
        }
        h2 {
          font-size: 44px;
          line-height: 46px;
        }
      `,
    ];
  }
  goToTestingPage(siteUrl: string, testResults: string) {
    console.log('Go to testing page', siteUrl, testResults);
    Router.go(
      `/reportcard?site=${siteUrl}&results=${JSON.stringify(testResults)}`
    );
  }
  convertToDateString(date: string) {
    const dateString = new Date(date);
    return dateString.toDateString() + ' ' + dateString.toTimeString();
  }
  async firstUpdated() {
    if (isUserLoggedIn()) {
      const userResp = await getUserDetailsById();
      this.userProjects = await userResp?.json();
      //const objects = userResp?.body?.json();
      console.log('User response', this.userProjects);
      this.requestUpdate();
    }
  }
  renderProjectCards(): any[] {
    console.log(this.userProjects[0], 'SiteUrl');
    return this.userProjects.map(
      userProject => html`
        <li>
          <div id="title-block">
            <h3>
              <app-button
                @click=${() =>
                  this.goToTestingPage(
                    userProject.siteUrl,
                    userProject.testResults
                  )}
              >
                ${userProject.siteUrl}
              </app-button>
              <p>Date Tested: ${this.convertToDateString(userProject.time)}</p>
            </h3>
          </div>
        </li>
      `
    );
  }

  render() {
    return html`
      <app-header></app-header>
      <h2>
        Your projects
        <h2>
          <ul>
            ${this.renderProjectCards()}
          </ul>
        </h2>
      </h2>
    `;
  }
}

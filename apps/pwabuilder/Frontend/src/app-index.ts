import './webawesome';
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Router, Route } from '@vaadin/router';

import './script/components/app-footer';
import './script/components/app-button';
//import './script/components/cookie-banner';
import './script/components/discord-box';
import './script/components/toast-alert';
import { ToastEvent, SHOW_TOAST_EVENT_NAME } from './script/models/toast-event';
import { recordPageView, storeQueryParam } from './script/utils/analytics';
import { appIndexStyles } from './app-index.styles';

@customElement('app-index')
export class AppIndex extends LitElement {

    @state() pageName: string = '';

    // Active toasts rendered in the top-right stack, each paired with a unique
    // id so they can be individually removed once dismissed.
    @state() private toasts: Array<{ id: number; toast: ToastEvent }> = [];

    // Monotonic counter used to give each toast a stable key for removal.
    private toastCounter = 0;

    static styles = [appIndexStyles];

    constructor() {
        super();

        storeQueryParam('ref');

        window.addEventListener('vaadin-router-location-changed', ev => {
            window.scrollTo({ top: 0, behavior: 'smooth' });

            recordPageView(
                ev.detail.location.pathname, // path
                ev.detail.location.route?.component // page name
            );
        });
    }

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('DOMContentLoaded', this.handlePageChange);
        window.addEventListener('popstate', this.handlePageChange);
        window.addEventListener(SHOW_TOAST_EVENT_NAME, this.handleShowToast);
    }

    disconnectedCallback() {
        window.removeEventListener('DOMContentLoaded', this.handlePageChange);
        window.removeEventListener('popstate', this.handlePageChange);
        window.removeEventListener(SHOW_TOAST_EVENT_NAME, this.handleShowToast);
        super.disconnectedCallback();
    }

    // Adds a toast to the stack when a "show-toast" event is dispatched.
    private handleShowToast = (event: WindowEventMap[typeof SHOW_TOAST_EVENT_NAME]) => {
        const id = this.toastCounter++;
        this.toasts = [...this.toasts, { id, toast: event.detail }];
    };

    // Removes a toast from the stack once it has been dismissed.
    private removeToast(id: number) {
        this.toasts = this.toasts.filter(entry => entry.id !== id);
    }

    handlePageChange = () => {

        var urlObj = new URL(location.href);

        // Get the pathname (page name)
        var pathname = urlObj.pathname;

        // Remove leading slash if present
        this.pageName = pathname.replace(/^\//, '');

        type PageMap = {
            [key: string]: string
        }

        const pages: PageMap = {
            'reportcard': 'Report Card',
            'congratulations': 'Congratulations',
            'portals': 'Portals',
            'imagegenerator': 'Image Generator'
        }

        const pageName = this.pageName.toLocaleLowerCase();

        // For the report card page, include the analyzed site URL in the title so
        // screen reader users can distinguish between multiple open report card tabs.
        if (pageName === 'reportcard') {
            const siteUrl = urlObj.searchParams.get('site');
            if (siteUrl) {
                this.setPageTitle('Report Card', `Report card for ${siteUrl} - PWABuilder`);
            } else {
                this.setPageTitle(pages['reportcard']);
            }
        } else {
            this.setPageTitle(pages[pageName] || 'Home');
        }
    }

    // Function to set the page title dynamically.
    // Pass a fullTitle to override the default "{title} / PWABuilder" format.
    setPageTitle(title: string, fullTitle?: string) {
        document!.getElementById('pageTitle')!.textContent = title;
        document.title = fullTitle ?? `${title} / PWABuilder`; // Update the browser tab title
    }

    firstUpdated() {
        // this method is a lifecycle even in lit-element
        // for more info check out the lit-element docs https://lit-element.polymer-project.org/guide/lifecycle

        // For more info on using the @vaadin/router check here https://vaadin.com/router
        const router = new Router(this.shadowRoot?.querySelector('#router-outlet'));
        router.setRoutes([
            {
                path: '',
                animate: true,
                children: [
                    {
                        path: '/',
                        component: 'app-home',
                        action: async () => {
                            await import('./script/pages/app-home.js');
                        }
                    },
                    {
                        path: '/reportcard',
                        component: 'app-report',
                        action: async () => {
                            await import('./script/pages/app-report.js');
                        },
                    },
                    {
                        path: '/portals', // used by the power platform team
                        component: 'powerplatform-publish',
                        action: async () => {
                            await import('./script/pages/powerplatform-publish.js');
                        },
                    },
                    {
                        path: '/imageGenerator', // used by Edge dev tools
                        component: 'image-generator',
                        action: async () => {
                            await import('./script/pages/image-generator.js');
                        },
                    },
                    {
                        path: '/google-play-packaging-status',
                        component: 'google-play-packaging-status',
                        action: async () => await import('./script/pages/google-play-packaging-status.js')
                    },
                    {
                        path: '(.*)', // Match any other route not defined above
                        redirect: '/', // Redirect to the home page or another valid route
                    },
                ] as Route[],
            },
        ]);
    }

    render() {
        return html`
            <div id="wrapper">
                <!-- cookie banner not required so long as we only have essential cookies -->
                <!-- <cookie-banner></cookie-banner> -->

                <main id="content">
                <div id="router-outlet"></div>
                </main>
                ${this.pageName === "congratulations" ? null : html`<discord-box></discord-box>`}
                <app-footer></app-footer>
            </div>

            <div class="toast-stack">
                ${this.toasts.map(({ id, toast }) => html`
                <toast-alert
                    .toast=${toast}
                    @toast-dismiss=${() => this.removeToast(id)}></toast-alert>
                `)}
            </div>
        `;
    }
}

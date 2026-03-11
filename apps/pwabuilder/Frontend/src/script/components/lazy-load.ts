import { LitElement, html, TemplateResult } from "lit";
import { Ref, createRef, ref } from "lit/directives/ref.js";
import { customElement, property, state } from "lit/decorators.js";
import "@shoelace-style/shoelace/dist/components/skeleton/skeleton.js";
import "@shoelace-style/shoelace/dist/components/visually-hidden/visually-hidden.js";

/**
 * Component that lazily loads another component, showing a loading skeleton while the other component is loading.
 * It can also delay loading the component and delay rendering until it's been scrolled into view.
 * Using this component can reduce initial page load time and reduce bundle sizes.
 * 
 * Usage:
 *      <lazy-load when="visible" .importer="${() => import("../components/my-component.js")}" .renderer="${() => this.renderMyComponent()}"></lazy-load>
 * 
 * Parameters:
 *      - when: Specifies when the load function should be evaluated. Should be "immediate", "visible", a Promise, or a Lit ref to another <lazy-load> element.
 *          "immediate": the load function will be invoked as soon as possible. 
 *          "visible": the load function will be invoked only once this <lazy-load> component is scrolled into view.
 *          A Promise: the load function will be invoked once this promise resolves. To use a promise, you must specify the Lit property syntax (use a period): ".when=${promise}"
 *          Lit ref: the load function will be invoked when the <lazy-load> element referenced by this Lit ref is finished loading. To use a Lit ref, you must specify the Lit property syntax (use a period): ".when=${ref}"
  * 
 *      - importer: A function that dynamically imports the components to be rendered. If specified, you must specified a .renderer attribute that renders the component.
 * 
 *      - renderer: The function that renders the component. This function should return a TemplateResult.
 * 
 * Styling:
 *      You should set the min-height of the <lazy-load> element to approximate the real height once your component is loaded.
 */
@customElement("lazy-load")
export class LazyLoad extends LitElement {
    @property() when: "immediate" | "visible" | Promise<unknown> | Ref<LazyLoad> | null | undefined = "immediate";
    @property({ attribute: "renderer" }) renderer: ((() => TemplateResult) | null | undefined) | (() => TemplateResult) | null = null;
    @property({ attribute: "importer" }) importer: (() => Promise<unknown>) | null | undefined = null;
    @state() loadedComponent: TemplateResult | null = null;
    private visibleObserver: IntersectionObserver | null = null;
    private loadedPromiseResolver: (() => void) | undefined;
    private renderedPromise = new Promise<void>(resolve => this.loadedPromiseResolver = resolve);
    private isRenderedPromiseResolved = false;
    private skeletonRef = createRef<HTMLElement>();

    protected firstUpdated(): void {
        if (this.importer || this.when) {
            this.listenForLoad();
        }
    }

    // Don't use ShadowDOM, as we want parent styles to leak into this component and affect the loaded component.
    protected createRenderRoot(): HTMLElement | ShadowRoot {
        return this;
    }

    render(): TemplateResult {
        if (!this.loadedComponent) {
            return this.renderLoading();
        }

        // If we have a separate render function, call that to get the latest render.
        if (this.renderer) {
            this.resolveRenderedPromise();
            return this.renderer();
        }

        this.resolveRenderedPromise();
        return this.loadedComponent;
    }

    private renderLoading(): TemplateResult {
        return html`
            <sl-visually-hidden>
                <h3>Loaded next group of collections</h3>
            </sl-visually-hidden>
            <sl-skeleton tabindex="0" class="lazy-loading-skeleton" effect="pulse" ${ref(this.skeletonRef)}></sl-skeleton>
        `;
    }

    private listenForLoad(): void {
        if (this.when === "immediate") {
            // Load the component when the page loads.
            this.loadImmediately();
        } else if (this.when === "visible") {
            // Load when visible. For this, we use IntersectionObserver to see when this component
            // becomes visible. And only then do we kick off the load.
            this.loadWhenVisible();
        } else if (this.when instanceof Promise) {
            // If it's a promise, load the component when the promise resolves or errors.
            this.when.finally(() => this.loadImmediately());
        } else {
            // It's a Lit ref. 
            const litRef = this.when as Ref<LazyLoad>;
            if (!litRef || !litRef.value || !(litRef.value instanceof LazyLoad)) {
                console.warn("<lazy-load> had an unknown .when property. Expects 'immediate' | 'visible' | Promise | Ref<LazyLoad>. Because of this, the <lazy-load> element will not be loaded.");
                return;
            }

            litRef.value.renderedPromise.then(() => this.loadImmediately());
        }
    }

    // When the component is loaded, add the loaded class to prevent the minimum height from affecting the height of the rendered element.
    private addLoadedClass(): void {
        // eslint-disable-next-line wc/no-self-class
        this.classList.add("loaded");
    }

    private loadImmediately(): void {
        if (this.importer && this.renderer) {
            this.importer().then(() => {
                this.renderedPromise.then(() => this.addLoadedClass());
                this.loadedComponent = this.renderer?.() || html``;
            });
        }
    }

    private loadWhenVisible(): void {
        // Disconnect any existing observer.
        this.visibleObserver?.disconnect();

        // Create our new observer and listen for visibility.
        if (!this.visibleObserver) {
            const options: IntersectionObserverInit = {
                root: null,
                threshold: 0, // should be between 0 and 1. 0 = as soon as the first pixel is visible. 1 = only when 100% of the element is in the viewport.
                rootMargin: "5px 5px 5px 5px" // give a 5px margin. As soon as this margin is in the viewport, consider it visible.
            };
            this.visibleObserver = new IntersectionObserver(entries => this.visibleObserved(entries), options);
        }

        const loadingSkeleton = this.querySelector("sl-skeleton");
        if (loadingSkeleton) {
            this.visibleObserver.observe(loadingSkeleton);
        }
    }

    private visibleObserved(entries: IntersectionObserverEntry[]): void {
        // This will be invoked the first time we observe an element.
        // We don't care about that initial invoke. Rather, we only care when the element is intersecting.
        const intersected = entries.find(e => e.isIntersecting);
        if (intersected) {
            // Discard our visibility observer; we're done listening for visible.
            this.visibleObserver?.disconnect();
            this.visibleObserver = null;

            this.loadImmediately();
        }
    }

    private resolveRenderedPromise(): void {
        if (!this.isRenderedPromiseResolved) {
            this.isRenderedPromiseResolved = true;
            queueMicrotask(() => this.loadedPromiseResolver?.());
        }
    }
}
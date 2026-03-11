import { LitElement, TemplateResult } from "lit";
import { Ref } from "lit/directives/ref.js";
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
export declare class LazyLoad extends LitElement {
    when: "immediate" | "visible" | Promise<unknown> | Ref<LazyLoad> | null | undefined;
    renderer: ((() => TemplateResult) | null | undefined) | (() => TemplateResult) | null;
    importer: (() => Promise<unknown>) | null | undefined;
    loadedComponent: TemplateResult | null;
    private visibleObserver;
    private loadedPromiseResolver;
    private renderedPromise;
    private isRenderedPromiseResolved;
    private skeletonRef;
    protected firstUpdated(): void;
    protected createRenderRoot(): HTMLElement | ShadowRoot;
    render(): TemplateResult;
    private renderLoading;
    private listenForLoad;
    private addLoadedClass;
    private loadImmediately;
    private loadWhenVisible;
    private visibleObserved;
    private resolveRenderedPromise;
}

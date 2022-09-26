import { LitElement, html, property, customElement, query, css, CSSResult } from 'lit-element';
import { InkingToolbarButtonStyles } from './inking-toolbar-button-styles';
import { InkingToolbar } from "./inking-toolbar";
import * as Colors from  "./colors";

@customElement('inking-toolbar-pen')
export class InkingToolbarPen extends LitElement {

    @property({type: InkingToolbar}) private toolbar: InkingToolbar;
    @query("button") private toolButton: HTMLButtonElement;
    @property({type: CSSResult}) private toolColor = Colors.black.toString();

    render() {
        return html`
            <button part="button" id="pen" class="toolbar-icon tooltip"
            aria-label="pen" role="tab" aria-controls="dropdown-container">
            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                viewBox="0 0 40 40" style="enable-background:new 0 0 40 40;" xml:space="preserve">
                <style type="text/css">
                    .color { fill: ${this.toolColor}; }
                    .white { fill: ${Colors.white}; }
                    .outline { fill: currentColor; }
                </style>
                <rect class="color" x="7" y="4" class="st0" width="26" height="6.9"/>
                <path class="color" d="M17.1,25l1,8.2c0.1,1,0.9,1.7,1.9,1.7s1.9-0.7,2-1.7l1-8.2H17.1z"/>
                <polygon class="white" points="14.9,24.8 8.1,11.1 32,11.1 25.1,24.8 "/>
                <path class="outline" d="M32,4v6H8V4H6v8h1.4l7,14h1.8l0.9,7.3c0.2,1.5,1.4,2.6,2.9,2.6h0.1c1.5,0,2.8-1.1,2.9-2.6l0.9-7.3h1.8l7-14H34V4H32z
                M21,33.1c-0.1,0.5-0.5,0.8-1,0.9c-0.5,0-0.9-0.4-0.9-0.9L18.2,26h3.6L21,33.1z M15.6,24l-6-12h20.8l-6,12H15.6z"/>
            </svg>
                <span class="tooltip-text">Pen</span>
            </button>
        `;
    }
    constructor() {
        super();
    }
    firstUpdated() {
        
        // find parent inking toolbar
        this.toolbar = <InkingToolbar>this.shadowRoot.host.parentElement;
        if (this.toolbar) {

            // add this tool component to its parent toolbar
            this.toolbar.addToolbarButton(this, "inking-toolbar-pen");

            // update state of tool button for accessbility
            let toolName = this.toolbar.getCurrentToolName();
            this.toolbar.addEventListener("tool-changed", () => {
                toolName = this.toolbar.getCurrentToolName();
                this.toolButton.setAttribute("tabindex", toolName && toolName === "pen" ? "0" : "-1");
                this.toolButton.setAttribute("aria-pressed", toolName && toolName === "pen" ? "0" : "-1");
            }, false);

            // update tool icon with chosen color
            this.toolbar.addEventListener("color-changed", () => {
                if (this.toolbar.getCurrentToolName() === "pen" )
                    this.toolColor = this.toolbar.getCurrentStrokeColor();
            });

        }

    }
    static get styles() {
        return [
            InkingToolbarButtonStyles
        ]
    }
}

@customElement('inking-toolbar-pencil')
export class InkingToolbarPencil extends LitElement {

    @property({type: InkingToolbar}) private toolbar: InkingToolbar;
    @query("button") private toolButton: HTMLButtonElement;
    @property({type: CSSResult}) private toolColor = Colors.black.toString();

    render() {
        return html`
            <button part="button" id="pencil" class="toolbar-icon tooltip"
            aria-label="pencil" role="tab" aria-controls="dropdown-container">
            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                viewBox="0 0 40 40" style="enable-background:new 0 0 40 40;" xml:space="preserve">
                <style type="text/css">
                    .color { fill: ${this.toolColor}; }
                    .white { fill: ${Colors.white}; }
                    .outline { fill: currentColor; }
                </style>
                <g>
                    <path class="color" d="M8,5.5v6.9h3.6c0.5,0,1-0.2,1.4-0.6c1.3-1.2,2.9-1.1,4.1,0.4c0,0,1.2,1.4,2.8,1.4c1.7,0,2.8-1.4,2.8-1.4
                    c1.2-1.4,2.8-1.6,4.1-0.4c0.4,0.4,0.9,0.6,1.4,0.6H32V5.5H8z"/>
                    <polygon class="color" points="20,34.5 24.9,24.6 15.1,24.6 	"/>
                </g>
                <g>
                <path class="white" d="M28.4,12.4c-0.5,0-1-0.2-1.4-0.6c-1.3-1.2-2.9-1.1-4.1,0.4c0,0-1.2,1.4-2.8,1.4c-1.7,0-2.8-1.4-2.8-1.4
                    c-1.2-1.4-2.8-1.6-4.1-0.4c-0.4,0.4-0.9,0.6-1.4,0.6H9l6,12.2h9.8l6-12.2C30.8,12.4,28.4,12.4,28.4,12.4z"/>
                </g>
                <path class="outline" d="M30,5.5v5.9h-1.6c-0.3,0-0.5-0.1-0.7-0.3c-0.8-0.8-1.8-1.2-2.8-1.1c-1,0.1-2,0.6-2.7,1.6c0,0-0.9,1.1-2,1.1
                c-1.2,0-2-1-2-1.1c-0.8-0.9-1.8-1.5-2.8-1.5c-1-0.1-1.9,0.3-2.7,1.1c-0.2,0.2-0.4,0.3-0.7,0.3H10V5.5H8v7l12,24.2l12-24.2v-7H30z
                M13.9,12.5c0.4-0.4,0.8-0.5,1.2-0.5c0.5,0,1,0.3,1.4,0.8c0.1,0.1,1.4,1.8,3.6,1.8c2,0,3.5-1.7,3.6-1.8C24,12.5,24.4,12,25,12
                c0.5,0,1,0.3,1.3,0.5c0.6,0.6,1.3,0.9,2.1,0.9h0.9l-5.1,10.2h-8.6l-5.1-10.2h1.1C12.6,13.4,13.3,13.1,13.9,12.5z M16.7,25.6h6.6
                L20,32.2L16.7,25.6z"/>
            </svg>
                <span class="tooltip-text">Pencil</span>
            </button>
        `;
    }
    constructor() {
        super();
    }
    firstUpdated() {
        
        // find parent inking toolbar
        this.toolbar = <InkingToolbar>this.shadowRoot.host.parentElement;
        if (this.toolbar) {

            // add this tool component to its parent toolbar            
            this.toolbar.addToolbarButton(this, "inking-toolbar-pencil");

            // update state of tool button for accessbility
            let toolName = this.toolbar.getCurrentToolName();
            this.toolbar.addEventListener("tool-changed", () => {
                toolName = this.toolbar.getCurrentToolName();
                this.toolButton.setAttribute("tabindex", toolName && toolName === "pencil" ? "0" : "-1");
                this.toolButton.setAttribute("aria-pressed", toolName && toolName === "pencil" ? "0" : "-1");
            }, false);

            // update tool icon with chosen color
            this.toolbar.addEventListener("color-changed", () => {
                if (this.toolbar.getCurrentToolName() === "pencil" )
                    this.toolColor = this.toolbar.getCurrentStrokeColor();
            });

        }

    }
    static get styles() {
        return [
            InkingToolbarButtonStyles
        ]
    }
}

@customElement('inking-toolbar-highlighter')
export class InkingToolbarHighlighter extends LitElement {

    @property({type: InkingToolbar}) private toolbar: InkingToolbar;
    @query("button") private toolButton: HTMLButtonElement;
    @property({type: CSSResult}) private toolColor = Colors.yellow.toString();

    render() {
        return html`
            <button part="button" id="highlighter" class="toolbar-icon tooltip"
            aria-label="highlighter" role="tab" aria-controls="dropdown-container">
            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                viewBox="0 0 40 40" style="enable-background:new 0 0 40 40;" xml:space="preserve">
                <style type="text/css">
                    .color { fill-rule: evenodd; clip-rule: evenodd; fill: ${this.toolColor}; }
                    .white { fill-rule: evenodd; clip-rule: evenodd; fill: ${Colors.white} }
                    .outline { fill-rule: evenodd; clip-rule: evenodd; fill: currentColor; }
                </style>
                <path class="color" d="M35,5H4v7h31V5z M24,23h-9v11.5l9-5V23z"/>
                <path class="white" d="M11,17.1c0-1.9-1.3-3.9-2.5-5.1h22c-1.4,1.4-2.5,3.3-2.5,5.1V23H11V17.1z"/>
                <path class="outline" d="M3,5v8h4.8C9,13.9,10,15.3,10,17.2V24h4v12.4l11-6.3V24h4v-6.8c0-1.9,1-3.3,2.2-4.2H36V5h-2v6H5V5H3z M23,24h-7
	            v9l7-4V24z M12,17.2c0-1.7-0.5-3.1-1.4-4.2h17.7c-0.8,1.1-1.4,2.5-1.4,4.2V22H12V17.2z"/>
            </svg>
                <span class="tooltip-text">Highlighter</span>
            </button>
        `;
    }
    constructor() {
        super();
    }
    firstUpdated() {
        
        // find parent inking toolbar
        this.toolbar = <InkingToolbar>this.shadowRoot.host.parentElement;
        if (this.toolbar) {

            // add this tool component to its parent toolbar
            this.toolbar.addToolbarButton(this, "inking-toolbar-highlighter");

            // update state of tool button for accessbility
            let toolName = this.toolbar.getCurrentToolName();
            this.toolbar.addEventListener("tool-changed", () => {
                toolName = this.toolbar.getCurrentToolName();
                this.toolButton.setAttribute("tabindex", toolName && toolName === "highlighter" ? "0" : "-1");
                this.toolButton.setAttribute("aria-pressed", toolName && toolName === "highlighter" ? "0" : "-1");
            }, false);

            // update tool icon with chosen color
            this.toolbar.addEventListener("color-changed", () => {
                if (this.toolbar.getCurrentToolName() === "highlighter" )
                    this.toolColor = this.toolbar.getCurrentStrokeColor();
            });

        }

    }
    static get styles() {
        return [
            InkingToolbarButtonStyles
        ]
    }
}

@customElement('inking-toolbar-eraser')
export class InkingToolbarEraser extends LitElement {

    @property({type: InkingToolbar}) private toolbar: InkingToolbar;
    @query("button") private toolButton: HTMLButtonElement;
    @property({type: CSSResult}) private toolColor = Colors.white.toString();

    render() {
        return html`
            <button part="button" id="eraser" class="toolbar-icon tooltip"
            aria-label="eraser" role="tab" aria-controls="dropdown-container">
            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                viewBox="0 0 40 40" style="enable-background:new 0 0 40 40;" xml:space="preserve">
                <style type="text/css">
                    .white { fill-rule: evenodd; clip-rule:evenodd; fill: ${Colors.white} }
                    .outline { fill-rule: evenodd; clip-rule: evenodd; fill: currentColor }
                </style>
                <path class="white" d="M5.6,27.4l6.5,6.6h7.5l14.2-14.3L23.6,9.5L5.6,27.4z"/>
                <path class="outline" d="M24.3,8.9c-0.4-0.4-1-0.4-1.4,0L5.1,26.7c-0.4,0.4-0.4,1,0,1.4l6.6,6.6c0.2,0.2,0.4,0.3,0.7,0.3h7.3
	            c0.3,0,0.5-0.1,0.7-0.3l14.2-14.2c0.4-0.4,0.4-1,0-1.4L24.3,8.9z M13,21.6L23.6,11l8.8,8.8L21.8,30.4L13,21.6z M11.6,23l-4.4,4.4
	            l5.6,5.6h6.4l1.1-1.1L11.6,23z M25,34c0-0.6,0.4-1,1-1h10c0.6,0,1,0.4,1,1s-0.4,1-1,1H26C25.4,35,25,34.6,25,34z M6,33
	            c-0.6,0-1,0.4-1,1s0.4,1,1,1h1c0.6,0,1-0.4,1-1s-0.4-1-1-1H6z"/>
            </svg>
                <span class="tooltip-text">Eraser</span>
            </button>
        `;
    }
    constructor() {
        super();
    }
    firstUpdated() {
        
        // find parent inking toolbar
        this.toolbar = <InkingToolbar>this.shadowRoot.host.parentElement;
        if (this.toolbar) {

            // add this tool component to its parent toolbar
            this.toolbar.addToolbarButton(this, "inking-toolbar-eraser");

            // update state of tool button for accessbility
            let toolName = this.toolbar.getCurrentToolName();
            this.toolbar.addEventListener("tool-changed", () => {
                toolName = this.toolbar.getCurrentToolName();
                this.toolButton.setAttribute("tabindex", toolName && toolName === "eraser" ? "0" : "-1");
                this.toolButton.setAttribute("aria-pressed", toolName && toolName === "eraser" ? "0" : "-1");
            }, false);

            // update tool icon with chosen color
            this.toolbar.addEventListener("color-changed", () => {
                if (this.toolbar.getCurrentToolName() === "eraser" )
                    this.toolColor = this.toolbar.getCurrentStrokeColor();
            });

        }

    }
    static get styles() {
        return [
            InkingToolbarButtonStyles
        ]
    }
}

@customElement('inking-toolbar-copy')
export class InkingToolbarCopy extends LitElement {

    @property({type: InkingToolbar}) private toolbar: InkingToolbar;
    @query("button") private toolButton: HTMLButtonElement;

    render() {
        return html`
            <button part="button" id="copy" class="toolbar-icon tooltip"
            aria-label="copy" role="tab">
            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                viewBox="0 0 40 40" style="enable-background:new 0 0 40 40;" xml:space="preserve">
                <style type="text/css">
                    .white { fill-rule: evenodd; clip-rule: evenodd; fill: ${Colors.white}; }
                    .outline { fill-rule: evenodd; clip-rule: evenodd; fill: currentColor; }
                </style>
                <path class="white" d="M16.2,5H7v25h9v5h17V18.5L25.3,10h-4.1L16.2,5z"/>
                <path class="outline" d="M16.5,4H6v27h9v5h19V18l-8.5-9h-4L16.5,4z M18.7,9l-3-3H8v23h7V9H18.7z M17,11v23h14.9V20H24v-9H17z M26.1,12.4
	            l5.2,5.6h-5.2C26.1,18,26.1,12.4,26.1,12.4z"/>
            </svg>
                <span class="tooltip-text">Copy</span>
            </button>
        `;
    }
    constructor() {
        super();
    }
    firstUpdated() {
        
        // find parent inking toolbar
        this.toolbar = <InkingToolbar>this.shadowRoot.host.parentElement;
        if (this.toolbar) {

            // add this tool component to its parent toolbar
            this.toolbar.addToolbarButton(this, "inking-toolbar-copy");

            // update state of tool button for accessbility
            let toolName = this.toolbar.getCurrentToolName();
            this.toolbar.addEventListener("tool-changed", () => {
                toolName = this.toolbar.getCurrentToolName();
                this.toolButton.setAttribute("tabindex", toolName && toolName === "copy" ? "0" : "-1");
                this.toolButton.setAttribute("aria-pressed", toolName && toolName === "copy" ? "0" : "-1");
            }, false);

        }

    }
    static get styles() {
        return [
            InkingToolbarButtonStyles
        ]
    }
}

@customElement('inking-toolbar-save')
export class InkingToolbarSave extends LitElement {

    @property({type: InkingToolbar}) private toolbar: InkingToolbar;
    @query("button") private toolButton: HTMLButtonElement;

    render() {
        return html`
            <button part="button" id="save" class="toolbar-icon tooltip"
            aria-label="save" role="tab">
                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                    viewBox="0 0 40 40" style="enable-background:new 0 0 40 40;" xml:space="preserve">
                    <style type="text/css">
                        .white { fill-rule: evenodd; clip-rule: evenodd; fill: ${Colors.white}; }
                        .outline { fill-rule: evenodd; clip-rule: evenodd; fill: currentColor; }
                    </style>
                    <path class="white" d="M32,32H10.1L6,27.9V7c0-0.6,0.4-1,1-1h25c0.6,0,1,0.4,1,1v24C33,31.6,32.6,32,32,32z"/>
                    <path class="outline" d="M9.9,31L7,28.1V7h2v12h21V7h2v24h-6v-8H12v8H9.9z M24,25v6h-6v-4h-2v4h-2v-6H24z M28,7H11v10h17V7z M33,33H9.1
                    L5,28.9V6c0-0.6,0.4-1,1-1h27c0.6,0,1,0.4,1,1v26C34,32.6,33.6,33,33,33z"/>
                </svg>
                <span class="tooltip-text">Save</span>
            </button>
        `;
    }
    constructor() {
        super();
    }
    firstUpdated() {
        
        // find parent inking toolbar
        this.toolbar = <InkingToolbar>this.shadowRoot.host.parentElement;
        if (this.toolbar) {

            // add this tool component to its parent toolbar
            this.toolbar.addToolbarButton(this, "inking-toolbar-save");

            // update state of tool button for accessbility
            let toolName = this.toolbar.getCurrentToolName();
            this.toolbar.addEventListener("tool-changed", () => {
                toolName = this.toolbar.getCurrentToolName();
                this.toolButton.setAttribute("tabindex", toolName && toolName === "save" ? "0" : "-1");
                this.toolButton.setAttribute("aria-pressed", toolName && toolName === "save" ? "0" : "-1");
            }, false);

        }

    }
    static get styles() {
        return [
            InkingToolbarButtonStyles
        ]
    }
}

@customElement('inking-toolbar-more')
export class InkingToolbarMore extends LitElement {

    @property({type: InkingToolbar}) private toolbar: InkingToolbar;
    @query("button") private toolButton: HTMLButtonElement;

    render() {
        return html`
            <button part="button" id="more" class="toolbar-icon tooltip"
                aria-label="more options" role="tab">
                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                    viewBox="0 0 40 40" style="enable-background:new 0 0 40 40;" xml:space="preserve">
                    <style type="text/css">
                        .white { fill-rule: evenodd; clip-rule: evenodd; fill: ${Colors.white}; }
                        .outline { fill-rule: evenodd; clip-rule: evenodd; fill: currentColor; }
                    </style>    
                    <g>        
                        <rect x="18.5" y="11.5" class="outline" width="3" height="3"/>
                        <rect x="18.5" y="18.5" class="outline" width="3" height="3"/>
                        <rect x="18.5" y="25.5" class="outline" width="3" height="3"/>
                    </g>  
                </svg>
                <span class="tooltip-text">More options</span>
            </button>
        `;
    }
    constructor() {
        super();
    }
    firstUpdated() {
        
        // find parent inking toolbar
        this.toolbar = <InkingToolbar>this.shadowRoot.host.parentElement;
        if (this.toolbar) {

            // add this tool component to its parent toolbar
            this.toolbar.addToolbarButton(this, "inking-toolbar-more");

            // update state of tool button for accessbility
            let toolName = this.toolbar.getCurrentToolName();
            this.toolbar.addEventListener("tool-changed", () => {
                toolName = this.toolbar.getCurrentToolName();
                this.toolButton.setAttribute("tabindex", toolName && toolName === "more" ? "0" : "-1");
                this.toolButton.setAttribute("aria-pressed", toolName && toolName === "more" ? "0" : "-1");
            }, false);

        }

    }
    static get styles() {
        return [
            InkingToolbarButtonStyles
        ]
    }
}
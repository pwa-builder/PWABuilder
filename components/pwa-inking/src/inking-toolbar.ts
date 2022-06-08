import {
    LitElement, html, customElement, property, css, query, CSSResult
} from 'lit-element';
import { InkingCanvas } from './inking-canvas';
import { InkingToolbarButtonStyles } from './inking-toolbar-button-styles';
import * as Colors from './colors';
import * as Utils from './utils';

@customElement('inking-toolbar')
export class InkingToolbar extends LitElement {

    // properties for toolbar and its dropdowns
    @property({type: String}) orientation: string = "";
    @property({type: String, attribute: "vertical"}) verticalAlignment: string = "";
    @property({type: String, attribute: "horizontal"}) horizontalAlignment: string = "";
    @query('#toolbar-container') private toolbarContainer: HTMLElement;
    @query('#tool-container') private toolContainer: HTMLElement;
    @property({type: NodeList}) private tools: Array<HTMLButtonElement>;
    @query("#customized-toolbar-selection") private customizedToolbarSelection: HTMLDivElement;
    @query("#default-toolbar-selection") private defaultToolbarSelection: HTMLDivElement;
    @property({type: Object}) private toolFocus = 0;
    @property({type: Number}) private penPencilFocus = 0;
    @property({type: Number}) private highlighterFocus = 0;
    @property({type: HTMLButtonElement}) private selectedTool: Element;
    @property({type: CustomEvent}) private toolChangedEvent: CustomEvent = new CustomEvent("tool-changed");
    @property({type: CustomEvent}) private colorChangedEvent: CustomEvent = new CustomEvent("color-changed");
    @query('#dropdown-container') private dropdownContainer: HTMLElement;
    @property({type: HTMLDivElement}) private selectedDropdown: HTMLDivElement;
    @query('.ink-dropdown') private inkDropdown: HTMLDivElement;
    @query('.more-options-dropdown') private moreOptionsDropdown: HTMLDivElement;
    @query('.ink-dropdown .title') private inkDropdownTitle: HTMLElement;
    @property({type: HTMLDivElement}) private selectedCircle: HTMLDivElement;
    @query('#erase-all') private eraseAllBtn: HTMLButtonElement;
    @query('.pen-pencil.palette') private penPencilPalette: HTMLElement;
    @query('.highlighter.palette') private highlighterPalette: HTMLElement;
    @query('#use-slider-size') private sliderCheckbox: HTMLInputElement;
    @query('.checkbox-track') private sliderCheckboxTrack: HTMLInputElement;
    @query('.on-text') private onText: HTMLElement;
    @query('.off-text') private offText: HTMLElement;
    @query('.slider') private slider: HTMLInputElement;
    @query("#slider-tooltip") private sliderTooltip: HTMLSpanElement;
    private readonly defaultSliderSize = "24";
    private readonly defaultSliderMin = "1";
    private readonly defaultSliderMax = "48";
    private readonly highlighterSliderSize = "50";
    private readonly highlighterSliderMin= "20";
    private readonly highlighterSliderMax = "80";
    @query('.sineCanvas') private sineCanvas: HTMLCanvasElement;
    @property({ type: CanvasRenderingContext2D }) private sineContext: CanvasRenderingContext2D;
    @property({type: Boolean}) private isWaitingToDrawSineCanvas: boolean = false;
    @query("#snackbar") private snackbar: HTMLDivElement;

    // access colors used in toolbar
    private static colors: Map<string, CSSResult> = Colors.getColors();

    // properties to influence connected inking canvas
    @property({type: CSSResult}) private selectedPenColor: CSSResult = Colors.black;
    @property({type: CSSResult}) private selectedPenColorName: string = 'black';
    @property({type: Number}) private selectedPenSize: number = parseInt(this.defaultSliderSize);
    @property({type: CSSResult}) private selectedPencilColor: CSSResult = Colors.black;
    @property({type: CSSResult}) private selectedPencilColorName: string = 'black';
    @property({type: Number}) private selectedPencilSize: number = parseInt(this.defaultSliderSize);
    @property({type: CSSResult}) private selectedHighlighterColor: CSSResult = Colors.yellow;
    @property({type: CSSResult}) private selectedHighlighterColorName: string = 'yellow';
    @property({type: Number}) private selectedHighlighterSize: number = parseInt(this.highlighterSliderSize);
    @property({type: Number}) private eraserSize: number = parseInt(this.defaultSliderSize);
    @property({type: String, attribute: "canvas"}) targetInkingCanvas: string = "";
    @property({type: InkingCanvas}) private inkingCanvas: InkingCanvas;

    constructor() {
        super();
    }

    render() {
        return html `
            <div id="toolbar-container">
                <div id="tool-container">
                    <div id="customized-toolbar-selection" role="tablist" aria-label="inking toolbar">
                        <slot @click="${this.clickedTool}"></slot>
                        <slot @click="${this.clickedTool}"></slot>
                        <slot @click="${this.clickedTool}"></slot>
                        <slot @click="${this.clickedTool}"></slot>
                        <slot @click="${this.clickedTool}"></slot>
                        <slot @click="${this.clickedTool}"></slot>
                    </div>
                    <div id="default-toolbar-selection" role="tablist" aria-label="inking toolbar">
                        <button id="pen" class="toolbar-icon tooltip" 
                        aria-label="pen" role="tab" aria-controls="dropdown-container"
                        @click="${this.clickedTool}">
                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                                viewBox="0 0 40 40" style="enable-background:new 0 0 40 40;" xml:space="preserve">
                                <style type="text/css">
                                    .pen-color { fill: ${this.selectedPenColor}; }
                                    .white { fill: ${Colors.white}; }
                                    .outline { fill: currentColor; }
                                </style>
                                <rect class="pen-color" x="7" y="4" class="st0" width="26" height="6.9"/>
                                <path class="pen-color" d="M17.1,25l1,8.2c0.1,1,0.9,1.7,1.9,1.7s1.9-0.7,2-1.7l1-8.2H17.1z"/>
                                <polygon class="white" points="14.9,24.8 8.1,11.1 32,11.1 25.1,24.8 "/>
                                <path class="outline" d="M32,4v6H8V4H6v8h1.4l7,14h1.8l0.9,7.3c0.2,1.5,1.4,2.6,2.9,2.6h0.1c1.5,0,2.8-1.1,2.9-2.6l0.9-7.3h1.8l7-14H34V4H32z
                                M21,33.1c-0.1,0.5-0.5,0.8-1,0.9c-0.5,0-0.9-0.4-0.9-0.9L18.2,26h3.6L21,33.1z M15.6,24l-6-12h20.8l-6,12H15.6z"/>
                            </svg>
                            <span class="tooltip-text">Pen</span>
                        </button>
                        <button id="pencil" class="toolbar-icon tooltip" 
                        aria-label="pencil" role="tab" aria-controls="dropdown-container"
                        @click="${this.clickedTool}">
                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                                viewBox="0 0 40 40" style="enable-background:new 0 0 40 40;" xml:space="preserve">
                                <style type="text/css">
                                    .pencil-color { fill: ${this.selectedPencilColor}; }
                                    .white { fill: ${Colors.white}; }
                                    .outline { fill: currentColor; }
                                </style>
                                <g>
                                    <path class="pencil-color" d="M8,5.5v6.9h3.6c0.5,0,1-0.2,1.4-0.6c1.3-1.2,2.9-1.1,4.1,0.4c0,0,1.2,1.4,2.8,1.4c1.7,0,2.8-1.4,2.8-1.4
                                    c1.2-1.4,2.8-1.6,4.1-0.4c0.4,0.4,0.9,0.6,1.4,0.6H32V5.5H8z"/>
                                    <polygon class="pencil-color" points="20,34.5 24.9,24.6 15.1,24.6 	"/>
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
                        <button id="highlighter" class="toolbar-icon tooltip" 
                        aria-label="highlighter" role="tab" aria-controls="dropdown-container"
                        @click="${this.clickedTool}">
                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                                viewBox="0 0 40 40" style="enable-background:new 0 0 40 40;" xml:space="preserve">
                                <style type="text/css">
                                    .highlighter-color { fill-rule: evenodd; clip-rule: evenodd; fill: ${this.selectedHighlighterColor}; }
                                    .white { fill-rule: evenodd; clip-rule: evenodd; fill: ${Colors.white} }
                                    .outline { fill-rule: evenodd; clip-rule: evenodd; fill: currentColor; }
                                </style>
                                <path class="highlighter-color" d="M35,5H4v7h31V5z M24,23h-9v11.5l9-5V23z"/>
                                <path class="white" d="M11,17.1c0-1.9-1.3-3.9-2.5-5.1h22c-1.4,1.4-2.5,3.3-2.5,5.1V23H11V17.1z"/>
                                <path class="outline" d="M3,5v8h4.8C9,13.9,10,15.3,10,17.2V24h4v12.4l11-6.3V24h4v-6.8c0-1.9,1-3.3,2.2-4.2H36V5h-2v6H5V5H3z M23,24h-7
                                v9l7-4V24z M12,17.2c0-1.7-0.5-3.1-1.4-4.2h17.7c-0.8,1.1-1.4,2.5-1.4,4.2V22H12V17.2z"/>
                            </svg>
                            <span class="tooltip-text">Highlighter</span>
                        </button>
                        <button id="eraser" class="toolbar-icon tooltip" 
                        aria-label="eraser" role="tab" aria-controls="dropdown-container"
                        @click="${this.clickedTool}">
                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
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
                        <button aria-label="copy" id="copy" class="toolbar-icon tooltip" 
                        aria-label="copy" role="tab"
                        @click="${this.clickedCopy}">
                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
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
                        <button id="save" class="toolbar-icon tooltip" 
                        aria-label="save" role="tab"
                        @click="${this.clickedSave}">
                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
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
                    </div>
                </div>
                <div id="dropdown-container">
                    <div class="ink-dropdown" role="tabpanel" aria-label="${this.getCurrentToolName()}" tabindex="-1">
                        <div class="title">Colors</div>
                        <div class="pen-pencil palette" role="tablist">
                            <button role="tab" tabindex="0" aria-pressed="-1" aria-label="black" class="black circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Black</span>
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="white" class="white circle tooltip" tabindex="0" @click="${this.clickedColor}">
                                <span class="tooltip-text">White</span>
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="silver" class="silver circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Silver</span> 
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="gray" class="gray circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Gray</span> 
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="dark-gray" class="dark-gray circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Dark gray</span> 
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="charcoal" class="charcoal circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Charcoal</span> 
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="magenta" class="magenta circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Magenta</span> 
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="red" class="red circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Red</span> 
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="red-orange" class="red-orange circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Red-orange</span> 
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="orange" class="orange circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Orange</span> 
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="gold" class="gold circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Gold</span> 
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="yellow" class="yellow circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Yellow</span> 
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="grass-green" class="grass-green circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Grass green</span> 
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="green" class="green circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Green</span> 
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="dark-green" class="dark-green circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Dark green</span> 
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="teal" class="teal circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Teal</span> 
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="blue" class="blue circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Blue</span> 
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="indigo" class="indigo circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Indigo</span> 
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="violet" class="violet circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Violet</span> 
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="purple" class="purple circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Purple</span> 
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="beige" class="beige circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Beige</span> 
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="light-brown" class="light-brown circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Light brown</span> 
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="brown" class="brown circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Brown</span> 
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="dark-brown" class="dark-brown circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Dark brown</span>
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="pastel-pink" class="pastel-pink circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Pastel pink</span> 
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="pastel-orange" class="pastel-orange circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Pastel orange</span> 
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="pastel-yellow" class="pastel-yellow circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Pastel yellow</span> 
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="pastel-green" class="pastel-green circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Pastel green</span> 
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="pastel-blue" class="pastel-blue circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Pastel blue</span> 
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="pastel-purple" class="pastel-purple circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Pastel purple</span> 
                            </button>
                        </div>
                        <div class="highlighter palette" role="tablist">
                            <button role="tab" tabindex="0" aria-pressed="-1" aria-label="yellow" class="yellow circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Yellow</span> 
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="green" class="green circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Green</span> 
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="light-blue" class="light-blue circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Light blue</span> 
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="pink" class="pink circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Pink</span> 
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="red-orange" class="red-orange circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Red-orange</span> 
                            </button>
                            <button role="tab" tabindex="-1" aria-pressed="-1" aria-label="violet" class="violet circle tooltip" @click="${this.clickedColor}">
                                <span class="tooltip-text">Violet</span> 
                            </button>
                        </div>
                        <div class="checkbox-wrapper">
                            <input type="checkbox" id="use-slider-size">
                            <div class="checkbox-track"><span class="on-text">ON</span><span class="off-text show">OFF</span></div>
                            <label class="checkbox-wrapper" for="use-slider-size" name="use-slider-size"><p class="checkbox-text">Use slider size</p></label>
                        </div>
                        <canvas class="sineCanvas"></canvas>
                        <div class="slider-container tooltip">
                            <span id="slider-tooltip" class="tooltip-text"></span> 
                            <input type="range" min="${this.defaultSliderMin}" max="${this.defaultSliderMax}" @value="${this.defaultSliderSize}" class="slider" @input="${this.changeStrokeSize}">
                        </div>
                        <button id="erase-all" name="erase-all" class="dropdown-button" @click="${this.clickedEraseAll}">Erase all ink</button>
                    </div>
                    <div class="more-options-dropdown" aria-label="more options" role="tabpanel" tabindex="-1">
                        <button class="more-options save dropdown-button" @click="${this.clickedSave}">
                            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                                viewBox="0 0 40 40" style="enable-background:new 0 0 40 40;" xml:space="preserve">
                                <style type="text/css">
                                    .white { fill-rule: evenodd; clip-rule: evenodd; fill: transparent; }
                                    .outline { fill-rule: evenodd; clip-rule: evenodd; fill: currentColor; }
                                </style>
                                <path class="white" d="M32,32H10.1L6,27.9V7c0-0.6,0.4-1,1-1h25c0.6,0,1,0.4,1,1v24C33,31.6,32.6,32,32,32z"/>
                                <path class="outline" d="M9.9,31L7,28.1V7h2v12h21V7h2v24h-6v-8H12v8H9.9z M24,25v6h-6v-4h-2v4h-2v-6H24z M28,7H11v10h17V7z M33,33H9.1
                                L5,28.9V6c0-0.6,0.4-1,1-1h27c0.6,0,1,0.4,1,1v26C34,32.6,33.6,33,33,33z"/>
                            </svg>
                            <p>Save</p>
                        </button>
                        <button class="more-options import dropdown-button" @click="${this.clickedImport}">
                            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                                viewBox="0 0 40 40" style="enable-background:new 0 0 40 40;" xml:space="preserve">    
                                <g>
                                    <polygon points="10.4,19.6 9,21 12.3,24.3 1,24.3 1,26.3 12.4,26.3 9.1,29.7 10.5,31.1 16.2,25.4 "/>
                                    <polygon points="4.9,5.9 4.9,22.7 6.9,22.7 6.9,7.9 36,7.9 36,19.3 32.7,16 27.1,21.6 17.5,12.1 11.8,17.8 13.3,19.2 17.5,14.9 
                                            32.5,29.8 33.9,28.4 28.5,23.1 32.7,18.9 36,22.2 36,32.1 6.9,32.1 6.9,28 4.9,28 4.9,34.1 38,34.1 38,5.9 "/>   
                                </g>  
                                <path d="M26.7,16.3c-2.1,0-3.7-1.7-3.7-3.7s1.7-3.7,3.7-3.7s3.7,1.7,3.7,3.7S28.8,16.3,26.7,16.3z M26.7,10.9c-1,0-1.7,0.8-1.7,1.7
                                    c0,1,0.8,1.7,1.7,1.7s1.7-0.8,1.7-1.7C28.5,11.6,27.7,10.9,26.7,10.9z"/>
                            </svg>
                            <p>Import picture</p>
                        </button>
                    </div>
                </div>
            </div>
            <div id="snackbar"></div>
        `;
    }

    firstUpdated() {
        
        // add any (last) detected inking canvas with matching name (TODO: handle multiple)
        this.connectCanvas();

        // set toolbar layout to developer's choice
        this.setOrientation();
        this.setVerticalAlignment();
        this.setHorizontalAlignment();

        // enable low-latency if possible
        this.sineContext = Utils.getLowLatencyContext(this.sineCanvas, "sine")

        // set canvas to use pointer event sizing by default
        this.slider.disabled = true;
        this.sliderCheckbox.checked = false;
        this.sliderCheckbox.addEventListener('change', () => this.toggleSliderCheckbox(), false);

        // support keyboard navigation for slider checkbox and handle, and dropdown container
        this.sliderCheckbox.addEventListener("keydown", function(e: KeyboardEvent) {
            if (e.keyCode === 13) { // enter/return key
                this.click();
            }
        }, false);
        this.slider.addEventListener("keydown", () => function(e: KeyboardEvent) {
            if (e.keyCode === 37) { // left arrow key
                this.value -= 1;
            }
            else if (e.keyCode === 39) { // right arrow key
                this.value += 1;
            }
        }), false;
        const outerThis = this;
        this.toolbarContainer.addEventListener("keydown", function(e: KeyboardEvent) {
            if (e.keyCode === 9) { // tab key
                outerThis.dropdownContainer.classList.add("tabbing-focus");
            }
        }), false;
        this.toolbarContainer.addEventListener("click", function() {
                outerThis.dropdownContainer.classList.remove("tabbing-focus");
        }), false;

        // draw example stroke for ink dropdowns
        this.isWaitingToDrawSineCanvas = true;
        Utils.runAsynchronously( () => { 
            this.drawSineCanvas();
            console.log("Sine canvas drawn for first time");
        });
    }

    // expose ability to check active tool name
    getCurrentToolName() {
        return (this.selectedTool) ? this.selectedTool.id : "";
    }

    // expose ability to get stroke color, size, & style

    getCurrentStrokeColor() {
        switch (this.selectedTool.id) {
            case "pen" :
                return this.selectedPenColor.toString();
                break;
            case "pencil" :
                return this.selectedPencilColor.toString();
                break;
            case "highlighter" :
                return this.selectedHighlighterColor.toString();
                break;
            case "eraser" :
                return Colors.white.toString();
                break;
            default:
                console.log("Could not find color value for selected utensil");
                break;
        }
    }

    getCurrentStrokeColorName() {
        switch (this.selectedTool.id) {
            case "pen" :
                return this.selectedPenColorName;
                break;
            case "pencil" :
                return this.selectedPencilColorName;
                break;
            case "highlighter" :
                return this.selectedHighlighterColorName;
                break;
            case "eraser" :
                return "white";
                break;
            default:
                console.log("Could not find color name for selected utensil");
                break;
        }
    }

    getCurrentStrokeSize() {
        switch (this.selectedTool.id) {
            case "pen" :
                return this.selectedPenSize;
                break;
            case "pencil" :
                return this.selectedPencilSize;
                break;
            case "highlighter" :
                return this.selectedHighlighterSize;
                break;
            case "eraser" :
                return this.eraserSize;
                break;
            default:
                console.log("Could not find stroke size for selected utensil");
                break;
        }
    }

    private setCurrentStrokeColor(color: CSSResult) {
        switch (this.selectedTool.id) {
            case "pen" :
                this.selectedPenColor = color;
                break;
            case "pencil" :
                this.selectedPencilColor = color;
                break;
            case "highlighter" :
                this.selectedHighlighterColor = color;
                break;
            case "eraser" :
                return Colors.white;
                break;
            default:
                console.log("Could not set color value for selected utensil");
                break;
        }
    }

    private setCurrentStrokeColorName(colorName: string) {
        switch (this.selectedTool.id) {
            case "pen" :
                this.selectedPenColorName = colorName;
                break;
            case "pencil" :
                this.selectedPencilColorName = colorName;
                break;
            case "highlighter" :
                this.selectedHighlighterColorName = colorName;
                break;
            case "eraser" :
                break;
            default:
                console.log("Could not set color name for selected utensil");
                break;
        }
    }

    private setCurrentStrokeSize() {
        switch (this.selectedTool.id) {
            case "pen" :
                this.selectedPenSize = parseInt(this.slider.value);
                break;
            case "pencil" :
                this.selectedPencilSize = parseInt(this.slider.value);
                break;
            case "highlighter" :
                this.selectedHighlighterSize = parseInt(this.slider.value);
                break;
            case "eraser" :
                this.eraserSize = parseInt(this.slider.value);
                break;
            default:
                console.log("Could not set stroke size for selected utensil");
                break;
        }
    }

    // expose ability to trigger additional sine canvas redraws
    requestDrawSineCanvas() {
        if (!this.isWaitingToDrawSineCanvas) {
            this.isWaitingToDrawSineCanvas = true;
        }
    }

    private connectCanvas() {

        // find matching inking canvas
        const possibleCanvas = this.shadowRoot.host.parentElement;
        if ((<InkingCanvas>possibleCanvas).name === this.targetInkingCanvas) {
            this.inkingCanvas = <InkingCanvas>possibleCanvas;
        }

        // attach events to matching inking canvas
        if (this.inkingCanvas) {

            // make toolbar appear when connected to an inking canvas
            this.toolbarContainer.classList.add("show");

            // hide dropdown once inking starts
            this.inkingCanvas.addEventListener('inking-started', () => {
                this.closeToolbar();
            }, false);

            // redraw example stroke with new size when inking canvas resizes
            this.inkingCanvas.addEventListener('inking-canvas-drawn', () => {
                this.requestDrawSineCanvas();
            }, false);

            // provide visual status of copy clicks
            this.inkingCanvas.addEventListener('inking-canvas-copied', ( e: CustomEvent ) => {
                this.flashSnackbar(e.detail.message);
            }, false);

            // set up default toolbar if no tool selection was specified
            if (!this.tools && this.children.length === 0) {
                this.tools = Array.from(this.toolContainer.querySelectorAll("button"));
                this.defaultToolbarSelection.classList.add("show");
                this.defaultToolbarSelection.addEventListener("keydown", (e) => this.handleToolSwitchingByKeyboard(e, this.tools), false);

                // make sure toolbar fits inside canvas
                if (!this.toolbarContainer.classList.contains("vertical-orientation")) {
                    this.inkingCanvas.setMinWidth(this.toolbarContainer.offsetWidth);
                }
            }

            // provide keyboard navigation for toolbar colors
            let penPencilColors = <HTMLButtonElement[]>Array.from(this.penPencilPalette.querySelectorAll('.circle'));
            this.penPencilPalette.addEventListener("keydown", (e) => this.handlePenPencilSwitchingByKeyboard(e, penPencilColors), false);
            let highlighterColors = <HTMLButtonElement[]>Array.from(this.highlighterPalette.querySelectorAll('.circle'));
            this.highlighterPalette.addEventListener("keydown", (e) => this.handleHighlighterSwitchingByKeyboard(e, highlighterColors), false);

        }
    }

    // expose method to children tools so they can add themselves to the toolbar once they load
    addToolbarButton(inkingToolbarButton: any, customElementName: string) {
        inkingToolbarButton = this.querySelector(customElementName);
        if (inkingToolbarButton) {
            let tool = inkingToolbarButton.shadowRoot.querySelector("button");
            if (tool) {
                if (!this.tools) this.tools = new Array<HTMLButtonElement>();
                this.tools.push(tool);
                if (this.children.length === this.tools.length) {

                    // done welcoming last tool, so set toolbar layout to developer's choice
                    this.setOrientation();
                    this.setVerticalAlignment();
                    this.setHorizontalAlignment();  
                    this.customizedToolbarSelection.addEventListener("keydown", (e) => this.handleToolSwitchingByKeyboard(e, this.tools), false);

                    // make sure toolbar fits inside canvas
                    if (!this.toolbarContainer.classList.contains("vertical-orientation")) {
                        this.inkingCanvas.setMinWidth(this.toolbarContainer.offsetWidth);
                    }
                }
            }
        }
    }

    private closeToolbar() {
        Utils.hideElementIfVisible(this.selectedDropdown);
        Utils.hideElementIfVisible(this.dropdownContainer);
        this.blurToolButtonFocus();
        if (this.selectedTool) Utils.hideElementIfVisible(<HTMLElement>this.selectedTool);
        if (this.selectedTool.id === "more") {
            this.resetToolbarToLastUsedUtensil();
        }
    }

    private resetToolbarToLastUsedUtensil() {
        let lastUsedUtensil = this.getLastUsedUtensil();
        this.selectedTool = lastUsedUtensil;
        this.selectedDropdown = this.inkDropdown;
        this.selectedTool.classList.add(this.getCurrentStrokeColorName());
        this.selectedTool.classList.add("clicked");
    }

    private getLastUsedUtensil() {
        let name = this.inkingCanvas.getStrokeStyle();
        for (let tool in this.tools) {
            if (this.tools[tool].id === name)
                return this.tools[tool];
        }
    }

    // TODO: find better to pass in & update Focus (index) properties instead of code duplication for keyboard navigation

    private handleToolSwitchingByKeyboard(e: KeyboardEvent, tabs: HTMLButtonElement[]) {

        // react to only left, up, right, or down arrow keys
        if (e.keyCode > 36 && e.keyCode < 41) {

            // unfocus whatever is currently selected
            tabs[this.toolFocus].setAttribute("tabindex", "-1");

            // right or down arrow key, respectively
            if (e.keyCode === 39 || e.keyCode === 40) {
                this.toolFocus++;

                // if we're at the end, go to the start
                if (this.toolFocus >= tabs.length) {
                    this.toolFocus = 0;
                }

            // left or up arrow key, respectively
            } else if (e.keyCode === 37 || e.keyCode === 38) {
                this.toolFocus--;

                // if we're at the start, move to the end
                if (this.toolFocus < 0) {
                    this.toolFocus = tabs.length - 1;
                }
            }
        
            // set focus for new selection
            tabs[this.toolFocus].setAttribute("tabindex", "0");
            tabs[this.toolFocus].focus();
    
        }
    }

    private handlePenPencilSwitchingByKeyboard(e: KeyboardEvent, tabs: HTMLButtonElement[]) {

        // react to only left, up, right, or down arrow keys
        if (e.keyCode > 36 && e.keyCode < 41) {

            // unfocus whatever is currently selected
            tabs[this.penPencilFocus].setAttribute("tabindex", "-1");

            // right or down arrow key, respectively
            if (e.keyCode === 39 || e.keyCode === 40) {
                this.penPencilFocus++;

                // if we're at the end, go to the start
                if (this.penPencilFocus >= tabs.length) {
                    this.penPencilFocus = 0;
                }

            // left or up arrow key, respectively
            } else if (e.keyCode === 37 || e.keyCode === 38) {
                this.penPencilFocus--;
                
                // if we're at the start, move to the end
                if (this.penPencilFocus < 0) {
                    this.penPencilFocus = tabs.length - 1;
                }
            }
        
            // set focus for new selection
            tabs[this.penPencilFocus].setAttribute("tabindex", "0");
            tabs[this.penPencilFocus].focus();
    
        }
    }

    private handleHighlighterSwitchingByKeyboard(e: KeyboardEvent, tabs: HTMLButtonElement[]) {

        // react to only left, up, right, or down arrow keys
        if (e.keyCode > 36 && e.keyCode < 41) {

            // unfocus whatever is currently selected
            tabs[this.highlighterFocus].setAttribute("tabindex", "-1");

            // right or down arrow key, respectively
            if (e.keyCode === 39 || e.keyCode === 40) {
                this.highlighterFocus++;

                // if we're at the end, go to the start
                if (this.highlighterFocus >= tabs.length) {
                    this.highlighterFocus = 0;
                }

            // left or up arrow key, respectively
            } else if (e.keyCode === 37 || e.keyCode === 38) {
            this.highlighterFocus--;
                
                // if we're at the start, move to the end
                if (this.highlighterFocus < 0) {
                    this.highlighterFocus = tabs.length - 1;
                }
            }
        
            // set focus for new selection
            tabs[this.highlighterFocus].setAttribute("tabindex", "0");
            tabs[this.highlighterFocus].focus();
    
        }
    }

    private setOrientation() {

        // default choice is "horizontal"

        if (this.orientation === "vertical") {
            
            if (this.toolbarContainer) this.toolbarContainer.classList.add("vertical-orientation");
            if (this.toolContainer) this.toolContainer.classList.add("vertical-orientation");
            if (this.dropdownContainer) this.dropdownContainer.classList.add("vertical-orientation");
 
            if (this.tools) {
                this.tools.forEach(tool => {
                    tool.classList.add('vertical-orientation');
                });
            }
        }
        else {
            if (this.tools) {
                this.tools.forEach(tool => {
                    tool.classList.add('horizontal-orientation');
                });
            }
        }
    }

    private setVerticalAlignment() {

        // default choice/setting is "top"

        switch (this.verticalAlignment) {
            case "":
                break;
            case "top":
                break;
            case "center":
                if (this.toolbarContainer) this.toolbarContainer.classList.add("vertical-center");
                if (this.dropdownContainer) this.dropdownContainer.classList.add("vertical-center");
                break;
            case "bottom":
                if (this.toolbarContainer) this.toolbarContainer.classList.add("bottom");
                if (this.dropdownContainer) this.dropdownContainer.classList.add("bottom");
                if (this.tools) {
                    this.tools.forEach(tool => {
                        tool.classList.add("bottom");
                    });
                }
                break;
            default:
                console.log("Could not set vertical toolbar alignment");
        }
    }

    private setHorizontalAlignment() {

        // default choice/setting is "left"

        switch (this.horizontalAlignment) {
            case "":
                if (this.tools) {
                    this.tools.forEach(tool => {
                        tool.classList.add("left");
                    });
                }
                break;
            case "left":
                this.tools.forEach(tool => {
                    tool.classList.add("left");
                });
                break;
            case "center":
                if (this.toolbarContainer) this.toolbarContainer.classList.add("horizontal-center");
                if (this.dropdownContainer) this.dropdownContainer.classList.add("horizontal-center");
                if (this.tools) {
                    this.tools.forEach(tool => {
                        tool.classList.add("center");
                    });
                }
                break;
            case "right":
                if (this.toolbarContainer) this.toolbarContainer.classList.add("right");
                if (this.dropdownContainer)this.dropdownContainer.classList.add("right");
                if (this.tools) {
                    this.tools.forEach(tool => {
                        tool.classList.add("right");
                    });
                }
                break;
            default:
                console.log("Could not set horizontal toolbar alignment");
        }
    }

    private async drawSineCanvas() {
        if (this.isWaitingToDrawSineCanvas && this.sineCanvas.classList.contains("show")) {

            // toggle semaphore to prevent unnecessary redraws
            this.isWaitingToDrawSineCanvas = false;

            // resize sine canvas with high resolution
            let rect = this.sineCanvas.getBoundingClientRect();
            if (rect.height !== 0 && rect.width !== 0 ) {
                this.sineCanvas.height = rect.height * devicePixelRatio;
                this.sineCanvas.width = rect.width * devicePixelRatio;
            }

            // define stroke size and pen color for new sine wave

            // TODO: find better way to scale strokeWidth based on different inking canvas and sine canvas aspect ratios
            let aspectRatioCorrection = 1.15;

            let strokeWidth = parseInt(this.slider.value) * this.inkingCanvas.getScale() * aspectRatioCorrection;
            this.sineContext.lineWidth = strokeWidth;
            this.sineContext.strokeStyle = this.getCurrentStrokeColor();

            // clear canvas for new sine wave
            this.sineContext.clearRect(0, 0, this.sineCanvas.width, this.sineCanvas.height);
            this.sineContext.fillStyle = Colors.colorPaletteBackground.toString();
            this.sineContext.fillRect(0, 0, this.sineCanvas.width, this.sineCanvas.height);

            // make the stroke points round
            this.sineContext.lineCap = 'round';
            this.sineContext.lineJoin = 'round';

            let w = this.sineCanvas.width;

            // determine vertical center of sine wave in canvas
            let h = this.sineCanvas.height/2;

            let a = h/2; // amplitude (height of wave)
            let f = 1; // frequency (1 wave)

            // formula for sine wave is:
                    // y = a * sin( ( 2 * pi * (frequency/timePeriod) * x ) + offsetFromOrigin)
                // where timePeriod is width of canvas & offsetFromOrigin is 0
                     // and x & y are the coordinates we want to draw on

            // start drawing the sine wave at an horizontal offset so it doesn't appear clipped off
            let x = strokeWidth;

            // vertically center start of the output by subtracting
                // the sine wave y calcualation from h (half the canvas height)
            let previousY = h - (a * Math.sin(2 * Math.PI * f/w * x));
            let currentY: number;

            // calibrate sine wave rotation calcuations to center results in canvas
            let rotationDegrees = 354;
            let offsetY = a/2 + (360 - rotationDegrees);
            let offsetX = -5 * devicePixelRatio;

            let strokesDrawn = 0;

            // draw the sine wave until just before the canvas ends to avoid clipping off end
            for (let i = strokeWidth/2 + 1; i < w - strokeWidth/2 - 1; i++) {

                this.sineContext.beginPath(); 
            
                let rotatedX1 = (x * Math.cos(rotationDegrees * Math.PI/180)) - (previousY * Math.sin(rotationDegrees * Math.PI/180));
                let rotatedY1 = (previousY * Math.cos(rotationDegrees * Math.PI/180)) + (x * Math.sin(rotationDegrees * Math.PI/180));

                // this.sineContext.moveTo(x,previousY);
                this.sineContext.moveTo(rotatedX1 + offsetX, rotatedY1 + offsetY);

                x = i;
                currentY = h - (a * Math.sin(2 * Math.PI * f/w * x));
                
                let rotatedX2 = (x * Math.cos(rotationDegrees * Math.PI/180)) - (currentY * Math.sin(rotationDegrees * Math.PI/180));
                let rotatedY2 = (currentY * Math.cos(rotationDegrees * Math.PI/180)) + (x * Math.sin(rotationDegrees * Math.PI/180));

                // this.sineContext.lineTo(x, currentY);
                this.sineContext.lineTo(rotatedX2 + offsetX, rotatedY2 + offsetY);

                previousY = currentY;

                if (this.selectedTool.id === "pencil") {
                    this.sineContext.fillStyle = this.sineContext.strokeStyle;
                    // Utils.drawPencilStroke(this.sineContext, x-1, x, previousY, currentY);
                    Utils.drawPencilStroke(this.sineContext, rotatedX1 + offsetX, rotatedX2 + offsetX, rotatedY1 + offsetY, rotatedY2 + offsetY);
                } else {
                    this.sineContext.stroke();
                }
                strokesDrawn++;
            }
            // console.log("sineCanvas strokes drawn: " + strokesDrawn);
        }

        // start & continue sine wave drawing loop
        Utils.runAsynchronously( () => { 
            requestAnimationFrame(async () => this.drawSineCanvas());
        });
    }

    private clickedTool(e: Event) {
        let tool = <Element>e.target;
        if (tool.localName === "svg") {
            tool = tool.parentElement;
        } else if (tool.parentElement.localName === "svg") {
            tool = tool.parentElement.parentElement;
        } else if (tool.parentElement.parentElement.localName === "svg") {
            tool = tool.parentElement.parentElement.parentElement;
        } else if (tool.id === "") {
            tool = tool.shadowRoot.firstElementChild;
            if (tool.id === "copy") {
                this.clickedCopy();
                return;
            } else if (tool.id === "save") {
                this.clickedSave();
                return;
            }
        }
        console.log(tool.id + " button clicked!");
        this.updateSelectedTool(tool);
    }

    private clickedEraseAll(e: Event) {
        let eraseAll = (<HTMLButtonElement>e.target);
        console.log(eraseAll.id + " has been clicked!");
        Utils.runAsynchronously( () => {
            this.inkingCanvas.eraseAll();
        });
    }

    private clickedColor(event: Event) {

        // find clicked color grid element through its class
        let selectedCircle = (<HTMLDivElement>event.target);
        let colorClass = selectedCircle.className.replace("clicked", "").replace("circle", "").replace("tooltip", "").trim();

        // get color string from css color
        let colorName = Utils.toCamelCase(colorClass);
        let backgroundColor = InkingToolbar.colors.get(colorName);

        this.changeInkingColor(backgroundColor, colorName);

        this.updateSliderColor(colorClass);

        this.updateCheckboxColor();

        if (this.sineCanvas) {
            this.requestDrawSineCanvas();
        }

        this.updateSelectedColor(selectedCircle);

        // let any connected tool components know to update their color if applicable
        if (!this.defaultToolbarSelection.classList.contains("show")) {
            this.dispatchEvent(this.colorChangedEvent);
        }

    }

    private clickedCopy() {
        try {
            if (this.inkingCanvas) {
                this.inkingCanvas.copyCanvasContents();
            } else {
                console.error("Cannot copy - inking canvas not connected");
                this.flashSnackbar("Could not copy canvas to clipboard :(");
            }
        } catch (err) {
            console.error(err);
        }
    }

    private clickedSave() {
        try {
            if (this.inkingCanvas) {
                this.inkingCanvas.saveCanvasContents();
            } else {
                console.error("Cannot save - inking canvas not connected");
            }
            this.closeToolbar();
        } catch (err) {
            console.error(err);
        }
    }

    private clickedImport() {
        try {
            if (this.inkingCanvas) {
                this.inkingCanvas.importCanvasContents();
            } else {
                console.error("Cannot import - inking canvas not connected")
            }
            this.closeToolbar();
        } catch (err) {
            console.log(err);
        }
    }

    private flashSnackbar(message: string) {
        this.snackbar.textContent = message;
        this.snackbar.classList.add("show");
        setTimeout(() => { 
            this.snackbar.classList.remove("show");
        }, 3000);
    }

    private isUtensil(tool: string) {
        return (tool === "pen" || tool === "pencil" 
        || tool === "highlighter" || tool === "eraser");
    }

    private updateSelectedTool(selectedTool: Element) {
        if (selectedTool !== this.selectedTool) {
            this.updateToolDropdown(selectedTool);
            if (this.isUtensil(selectedTool.id)) {
                this.changeInkingColor();
                this.inkingCanvas.setStrokeStyle(this.selectedTool.id);
            }
        } else {
            // this.blurToolButtonFocus();
            this.selectedDropdown.classList.toggle("show");
            this.dropdownContainer.classList.toggle("show");
            selectedTool.classList.toggle("show");
            if (!selectedTool.classList.contains("show"))
                this.resetToolbarToLastUsedUtensil();
        }
    }

    private blurToolButtonFocus() {
        if (document.activeElement instanceof HTMLButtonElement) {
            (<HTMLButtonElement>document.activeElement).blur();
        } else if (document.activeElement.shadowRoot && document.activeElement.shadowRoot.activeElement instanceof HTMLButtonElement) {
            (<HTMLButtonElement>document.activeElement.shadowRoot.activeElement).blur();
        }
    }

    private updateToolDropdown(el: Element) {
        let utensilName = el.id;
        if (utensilName === "highlighter") {
            this.inkDropdownTitle.classList.add("show");            
            this.togglePalette(this.penPencilPalette, this.highlighterPalette);
            Utils.hideElementIfVisible(this.eraseAllBtn);
        } else if (utensilName === "eraser") {
            Utils.hideElementIfVisible(this.inkDropdownTitle);                
            Utils.hideElementIfVisible(this.penPencilPalette);
            Utils.hideElementIfVisible(this.highlighterPalette);
            if (!this.eraseAllBtn.classList.contains("show")) 
                this.eraseAllBtn.classList.add("show");
        }  else if (utensilName === "pen" || utensilName === "pencil")  { 
            this.inkDropdownTitle.classList.add("show");            
            this.togglePalette(this.highlighterPalette, this.penPencilPalette);
            Utils.hideElementIfVisible(this.eraseAllBtn);
        }
        let newDropdown = (utensilName === "more") ? this.moreOptionsDropdown : this.inkDropdown; 
        this.toggleDropdown(newDropdown, el === this.selectedTool);
        this.toggleActiveTool(el);
    }

    private toggleActiveTool(lastClickedTool: Element) {
        if (this.selectedTool !== lastClickedTool) {

            if (this.selectedTool && this.selectedTool.classList.contains('clicked')) {

                // remove the color class of deselected utensil
                if (this.isUtensil(this.selectedTool.id)) 
                    this.selectedTool.classList.remove(Utils.toDash(this.getCurrentStrokeColorName()));

                this.selectedTool.classList.remove('clicked');
                this.selectedTool.classList.remove('show');

            }

            if (this.defaultToolbarSelection.classList.contains("show")) {
                if (this.selectedTool) {
                    this.selectedTool.setAttribute("tabindex", "-1");
                    this.selectedTool.setAttribute("aria-pressed", "-1");
                } else {
                    for (let i = 0; i < this.tools.length; i++) {
                        if (this.tools[i] !== lastClickedTool) {
                            this.tools[i].setAttribute("tabindex", "-1");
                            this.tools[i].setAttribute("aria-pressed", "-1");
                        }
                    }
                }
            }

            this.selectedTool = lastClickedTool;           
            this.selectedTool.classList.add('clicked');
            this.selectedTool.classList.add('show');

            if (this.defaultToolbarSelection.classList.contains("show")) {
                this.selectedTool.setAttribute("tabindex", "0");
                this.selectedTool.setAttribute("aria-pressed", "0");
            } else {

                // inform any connected tool components so they can update their states for accessibility
                this.dispatchEvent(this.toolChangedEvent);

            }
        
            if (this.isUtensil(this.selectedTool.id)) {

                // use the css friendly color class name with dashes
                let colorName = Utils.toDash(this.getCurrentStrokeColorName());

                this.selectedTool.classList.add(colorName);

                let selectedCircle: HTMLDivElement;
                if (this.selectedTool.id === "highlighter") {
                    selectedCircle = this.inkDropdown.querySelector('.ink-dropdown .highlighter .' + colorName);
                } else {
                    selectedCircle = this.inkDropdown.querySelector('.ink-dropdown .pen-pencil .' + colorName);
                }
                this.updateSelectedColor(selectedCircle);

                // update slider appearance to match saved utensil settings
                this.updateSliderColor(colorName);
                this.updateSliderRange();
                this.updateSliderSize();
                this.updateCheckboxColor();
            }
        }
    }

    private toggleSliderCheckbox() {
        this.updateCheckboxColor();
        this.slider.disabled = !this.slider.disabled;
        this.sineCanvas.classList.toggle("show");
        this.slider.classList.toggle("show");
        this.onText.classList.toggle("show");
        this.offText.classList.toggle("show");
        this.changeStrokeSize();
    }

    private togglePalette(old: HTMLElement, current?: HTMLElement) {
        Utils.hideElementIfVisible(old);
        if (current && !current.classList.contains("show")) {
            current.classList.add("show");
        }
    }

    private toggleDropdown(selectedDropdown: HTMLDivElement, isLastElementClicked: boolean) {
        if (this.selectedDropdown && this.selectedDropdown === selectedDropdown) {
            if (this.selectedDropdown.classList.contains("show") && isLastElementClicked) {
                this.selectedDropdown.classList.remove("show");
                this.dropdownContainer.classList.remove("show");
                this.selectedDropdown.setAttribute("tabindex", "-1");
            } else {
                this.selectedDropdown.classList.add("show");
                this.dropdownContainer.classList.add("show");
                this.selectedDropdown.setAttribute("tabindex", "0");
            }
        } else {
            if (this.selectedDropdown && this.selectedDropdown !== selectedDropdown) {
                this.selectedDropdown.classList.remove("show");
                this.selectedDropdown.setAttribute("tabindex", "-1");
            }
            this.selectedDropdown = selectedDropdown;
            this.selectedDropdown.classList.add("show");
            this.dropdownContainer.classList.add("show"); 
            this.selectedDropdown.setAttribute("tabindex", "0");
        }
    }

    private changeInkingColor(color?: CSSResult, colorName?: string) {
        if (this.inkingCanvas) {        

            if (color) this.setCurrentStrokeColor(color);
            if (colorName) this.setCurrentStrokeColorName(colorName);

            if (this.selectedTool && this.selectedTool.classList.contains('clicked')) {

                // remove the color class
                let length = this.selectedTool.classList.length;
                if (this.selectedTool.classList[length-1] !== "clicked" && this.selectedTool.classList[length-1] !== "show") {
                    this.selectedTool.classList.remove(this.selectedTool.classList[length-1]);
                } else if (this.selectedTool.classList[length-2] !== "clicked" && this.selectedTool.classList[length-2] !== "show") {
                    this.selectedTool.classList.remove(this.selectedTool.classList[length-2]);
                } else {
                    this.selectedTool.classList.remove(this.selectedTool.classList[length-3]);
                }

                // use the css friendly color class name with dashes
                let modifiedColorName = Utils.toDash(this.getCurrentStrokeColorName());

                this.selectedTool.classList.add(modifiedColorName);
            }
            this.inkingCanvas.setStrokeColor(this.getCurrentStrokeColor());
        }
    }

    private changeStrokeSize() {
        if (this.inkingCanvas) {
            if (this.slider.disabled) {
                this.inkingCanvas.setStrokeSize(-1); 
            } else  {
                this.setCurrentStrokeSize();
                this.updateSliderTooltip();
                this.inkingCanvas.setStrokeSize(this.getCurrentStrokeSize());
                if (this.sineCanvas) {
                    this.requestDrawSineCanvas();
                }
            }
        }
    }

    private updateSelectedColor(selectedCircle: HTMLDivElement) {
        if (this.selectedCircle !== selectedCircle) {
            if (this.selectedCircle && this.selectedCircle.classList.contains("clicked")) {
                this.selectedCircle.classList.remove("clicked");
                this.selectedCircle.setAttribute("tabindex", "-1");
                this.selectedCircle.setAttribute("aria-pressed", "-1");
            }
            this.selectedCircle = selectedCircle;
            this.selectedCircle.classList.add("clicked");
            this.selectedCircle.setAttribute("tabindex", "0");
            this.selectedCircle.setAttribute("aria-pressed", "0")
        }
    }

    private updateCheckboxColor() {
        if (this.sliderCheckboxTrack) {
            let color = Utils.toDash(this.getCurrentStrokeColorName());
            if (this.sliderCheckboxTrack.classList.length > 1) {
                    this.sliderCheckboxTrack.classList.remove(this.sliderCheckboxTrack.classList[1]);
                    if (this.sliderCheckbox.checked) 
                        this.sliderCheckboxTrack.classList.add(color);
            } else if (this.sliderCheckbox.checked) {
                this.sliderCheckboxTrack.classList.add(color);
            }
        }
    }

    private updateSliderColor(colorClass: string) {
        if (this.slider) {
            if (this.slider.classList.length > 1) {
                if (this.slider.classList[1] === "show") {
                    this.slider.classList.remove(this.slider.classList[2]);
                } else {
                    this.slider.classList.remove(this.slider.classList[1]);
                }
            }
            this.slider.classList.add(colorClass);
        }
    }

    private updateSliderSize() {
        if (this.slider) {
            this.slider.value = this.getCurrentStrokeSize().toString();
            this.changeStrokeSize();
        }
    }

    private updateSliderTooltip() {
        let value = this.slider.value;
        let min = parseInt(this.slider.min);
        let max = parseInt(this.slider.max);
        let newValue = ((parseInt(value) - min) / (max - min)) * 100;
        this.sliderTooltip.innerHTML = value;
        this.sliderTooltip.style.left = `calc(${newValue}% + (${8 - newValue * 0.15}px))`;
    }

    private updateSliderRange() {
        if (this.isUtensil(this.selectedTool.id)) {
            if (this.selectedTool.id === "highlighter") {
                this.slider.min = this.highlighterSliderMin;
                this.slider.max = this.highlighterSliderMax;
            } else {
                this.slider.min = this.defaultSliderMin;
                this.slider.max = this.defaultSliderMax;
            }
        }
    }

    static get styles() {
        return  [
            InkingToolbarButtonStyles,
            css `
                #toolbar-container {
                    position: absolute;
                    display: none;
                    margin: 6px;
                    white-space: nowrap;
                }
                #toolbar-container.show {
                    display: inline-block;
                }
                #toolbar-container.vertical-center {
                    bottom: 50%;
                    transform: translateY(50%);
                }
                #toolbar-container.bottom {
                    bottom: 0;
                    margin-bottom: 8px; // TODO: update to fit dev specified canvas border width
                }
                #toolbar-container.horizontal-center {
                    right: 50%;
                    transform: translateX(50%);
                }
                #toolbar-container.vertical-center.horizontal-center {
                    transform: translate(50%, 50%);
                }
                #toolbar-container.right {
                    position: fixed;
                    right: 0;
                }
                #tool-container {
                    background-color: ${Colors.white};
                    margin: 2px 2px 0px 2px;
                    display: inline-block;
                    font-size: 0; // remove children's inline-block spacing
                }
                #tool-container.vertical-orientation {
                    margin: 2px 0px 2px 2px; /* no gap between right of tool and dropdown */ 
                    border-bottom: 2px solid ${Colors.white};
                    border-right: 0px solid ${Colors.white};
                }
                #default-toolbar-selection {
                    display: none;
                }
                #default-toolbar-selection.show {
                    display: block;
                }
                #dropdown-container {
                    background-color: ${Colors.colorPaletteBackground};
                    width: 300px;
                    position: absolute;
                    border: none;
                    margin: -2px 2px 2px;
                }
                #dropdown-container.show {
                    box-sizing: border-box;
                    border: 2px solid ${Colors.gray};
                    border-radius: 2px;
                }
                #dropdown-container:focus {
                    outline: none;
                    -webkit-appearance: none;
                }
                /* make focus-visible workaround for Safari */
                #dropdown-container.tabbing-focus:focus {
                    outline: auto;
                }
                #dropdown-container:focus-visible {
                    outline: auto;
                }
                #dropdown-container.vertical-orientation {
                    display: inline-block;
                    margin-top: 2px;
                    margin-left: -2px;
                }
                #dropdown-container.vertical-orientation.show {
                    min-height: 200px;
                }
                #dropdown-container.right {
                    right: 0;
                    margin-right: 2px; // TODO: update to fit dev specified canvas border width
                }
                #dropdown-container.vertical-orientation.right {
                    margin-right: 48px; // TODO: update to fit dev specified canvas border width
                }
                #dropdown-container.vertical-center {
                    top: 100%;
                }
                #dropdown-container.vertical-orientation.vertical-center {
                    top: 0;
                }
                #dropdown-container.bottom {
                    bottom: 0;
                    margin-top: 0;
                    margin-bottom: 48px; // TODO: update to fit dev specified canvas border width
                }
                #dropdown-container.vertical-orientation.bottom {
                    margin-bottom: 4px;
                }
                // @media screen and (max-width: 400px) {
                //     #dropdown-container {
                //         width: 270px;
                //     }
                //     #dropdown-container.vertical-orientation {
                //         width: 220px;
                //     }
                // }
                .ink-dropdown {
                    display: none;
                    padding: 10px;
                    padding-bottom: 14px;
                    font-family: sans-serif;
                    font-size: 16px;
                    outline: none;
                }
                .ink-dropdown.show {
                    display: block;
                }
                .palette {
                    display: none;
                    grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
                    grid-auto-rows: minmax(25px, auto);
                    justify-items: center;
                    align-items: center;
                    justify-content: center;
                    align-content: center;
                    // border: 5px solid transparent;
                }
                .palette.show {
                    display: grid;
                }
                .sineCanvas {
                    height: 100px;
                    width: 100%;
                    max-height: 150px;
                    background-color: transparent;
                    padding-left: 0;
                    padding-right: 0;
                    padding-bottom: 17px; /* TODO: find better to prevent slider cutoff */
                    margin-left: auto;
                    margin-right: auto;
                    display: none;
                }
                .sineCanvas.show {
                    display: block;
                }
                .checkbox-wrapper {
                    position: relative;
                    width: 65px;
                    height: 30px;
                }
                .checkbox-wrapper input {
                    width: 65px;
                    height: 30px;
                    margin: 0 auto;
                    position: absolute;
                    opacity: 0;
                }
                .checkbox-wrapper input:focus-visible {
                    opacity: 1;
                    outline: 2px solid currentColor;
                }
                .checkbox-text {
                    position: relative;
                    top: 7px;
                    margin-left: 75px;
                    white-space: nowrap;
                }
                .checkbox-track {
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    background: ${Colors.darkGray};
                    border-radius: 20px;
                    transition: all 0.2s ease;
                    color: ${Colors.white};
                }
                .checkbox-track::after {
                    position: absolute;
                    content: "";
                    width: 20px;
                    height: 20px;
                    background-color: ${Colors.white};
                    border-radius: 50%;
                    border: 4px solid ${Colors.darkGray};
                    top: 1px;
                    left: 1px;
                    transition: all 0.2s ease;
                }
                input:checked + .checkbox-track.white::after {
                    background-color: ${Colors.silver};
                    border-color: ${Colors.white};
                }
                .checkbox-track.black::after {
                    border-color: ${Colors.black};
                }
                .checkbox-track.silver::after {
                    border-color: ${Colors.silver};
                }
                .checkbox-track.gray::after {
                    border-color: ${Colors.gray};
                }
                .checkbox-track.dark-gray::after {
                    border-color: ${Colors.darkGray};
                }
                .checkbox-track.charcoal::after {
                    border-color: ${Colors.charcoal};
                }
                .checkbox-track.magenta::after {
                    border-color: ${Colors.magenta};
                }
                .checkbox-track.red::after {
                    border-color: ${Colors.red};
                }
                .checkbox-track.red-orange::after {
                    border-color: ${Colors.redOrange};
                }
                .checkbox-track.orange::after {
                    border-color: ${Colors.orange};
                }
                .checkbox-track.gold::after {
                    border-color: ${Colors.gold};
                }
                .checkbox-track.yellow::after {
                    border-color: ${Colors.yellow};
                }
                .checkbox-track.grass-green::after {
                    border-color: ${Colors.grassGreen};
                }
                .checkbox-track.green::after {
                    border-color: ${Colors.green};
                }
                .checkbox-track.dark-green::after {
                    border-color: ${Colors.darkGreen};
                }
                .checkbox-track.teal::after {
                    border-color: ${Colors.teal};
                }
                .checkbox-track.blue::after {
                    border-color: ${Colors.blue};
                }
                .checkbox-track.indigo::after {
                    border-color: ${Colors.indigo};
                }
                .checkbox-track.purple::after {
                    border-color: ${Colors.purple};
                }
                .checkbox-track.violet::after {
                    border-color: ${Colors.violet};
                }
                .checkbox-track.beige::after {
                    border-color: ${Colors.beige};
                }
                .checkbox-track.light-brown::after {
                    border-color: ${Colors.lightBrown};
                }
                .checkbox-track.brown::after {
                    border-color: ${Colors.brown};
                }
                .checkbox-track.dark-brown::after {
                    border-color: ${Colors.darkBrown};
                }
                .checkbox-track.pastel-pink::after {
                    border-color: ${Colors.pastelPink};
                }
                .checkbox-track.pastel-orange::after {
                    border-color: ${Colors.pastelOrange};
                }
                .checkbox-track.pastel-yellow::after {
                    border-color: ${Colors.pastelYellow};
                }
                .checkbox-track.pastel-green::after {
                    border-color: ${Colors.pastelGreen};
                }
                .checkbox-track.pastel-blue::after {
                    border-color: ${Colors.pastelBlue};
                }
                .checkbox-track.pastel-purple::after {
                    border-color: ${Colors.pastelPurple};
                }
                .checkbox-track.light-blue::after {
                    border-color: ${Colors.lightBlue};
                }
                .checkbox-track.pink::after {
                    border-color: ${Colors.pink};
                }
                input:checked + .checkbox-track {
                    background-color: ${Colors.darkGreen};
                }
                input:checked + .checkbox-track.black {
                    background-color: ${Colors.black};
                    border-color: ${Colors.black};
                    color: ${Colors.white};
                }
                input:checked + .checkbox-track.white {
                    background-color: ${Colors.white};
                    color: ${Colors.black};
                }
                input:checked + .checkbox-track.silver {
                    background-color: ${Colors.silver};
                    color: ${Colors.black};
                }
                input:checked + .checkbox-track.gray {
                    background-color: ${Colors.gray};
                    color: ${Colors.white};
                }
                input:checked + .checkbox-track.dark-gray {
                    background-color: ${Colors.darkGray};
                    color: ${Colors.white};
                }
                input:checked + .checkbox-track.charcoal {
                    background-color: ${Colors.charcoal};
                    color: ${Colors.white};
                }
                input:checked + .checkbox-track.magenta {
                    background-color: ${Colors.magenta};
                    color: ${Colors.white};
                }
                input:checked + .checkbox-track.red {
                    background-color: ${Colors.red};
                    color: ${Colors.white};
                }
                input:checked + .checkbox-track.red-orange {
                    background-color: ${Colors.redOrange};
                    color: ${Colors.white};
                }
                input:checked + .checkbox-track.orange {
                    background-color: ${Colors.orange};
                    color: ${Colors.black};
                }
                input:checked + .checkbox-track.gold {
                    background-color: ${Colors.gold};
                    color: ${Colors.black};
                }
                input:checked + .checkbox-track.yellow {
                    background-color: ${Colors.yellow};
                    color: ${Colors.black};
                }
                input:checked + .checkbox-track.grass-green {
                    background-color: ${Colors.grassGreen};
                    color: ${Colors.black};
                }
                input:checked + .checkbox-track.green {
                    background-color: ${Colors.green};
                    color: ${Colors.black};
                }
                input:checked + .checkbox-track.dark-green {
                    background-color: ${Colors.darkGreen};
                    color: ${Colors.white};
                }
                input:checked + .checkbox-track.teal {
                    background-color: ${Colors.teal};
                    color: ${Colors.white};
                }
                input:checked + .checkbox-track.blue {
                    background-color: ${Colors.blue};
                    color: ${Colors.white};
                }
                input:checked + .checkbox-track.indigo {
                    background-color: ${Colors.indigo};
                    color: ${Colors.white};
                }
                input:checked + .checkbox-track.purple {
                    background-color: ${Colors.purple};
                    color: ${Colors.white};
                }
                input:checked + .checkbox-track.violet {
                    background-color: ${Colors.violet};
                    color: ${Colors.white};
                }
                input:checked + .checkbox-track.beige {
                    background-color: ${Colors.beige};
                    color: ${Colors.black};
                }
                input:checked + .checkbox-track.light-brown {
                    background-color: ${Colors.lightBrown};
                    color: ${Colors.white};
                }
                input:checked + .checkbox-track.brown {
                    background-color: ${Colors.brown};
                    color: ${Colors.white};
                }
                input:checked + .checkbox-track.dark-brown {
                    background-color: ${Colors.darkBrown};
                    color: ${Colors.white};
                }
                input:checked + .checkbox-track.pastel-pink {
                    background-color: ${Colors.pastelPink};
                    color: ${Colors.black};
                }
                input:checked + .checkbox-track.pastel-orange {
                    background-color: ${Colors.pastelOrange};
                    color: ${Colors.black};
                }
                input:checked + .checkbox-track.pastel-yellow {
                    background-color: ${Colors.pastelYellow};
                    color: ${Colors.black};
                }
                input:checked + .checkbox-track.pastel-green {
                    background-color: ${Colors.pastelGreen};
                    color: ${Colors.black};
                }
                input:checked + .checkbox-track.pastel-blue {
                    background-color: ${Colors.pastelBlue};
                    color: ${Colors.black};
                }
                input:checked + .checkbox-track.pastel-purple {
                    background-color: ${Colors.pastelPurple};
                    color: ${Colors.black};
                }
                input:checked + .checkbox-track.light-blue {
                    background-color: ${Colors.lightBlue};
                    color: ${Colors.black};
                }
                input:checked + .checkbox-track.pink {
                    background-color: ${Colors.pink};
                    color: ${Colors.white};
                }
                input:checked + .checkbox-track:before {
                    top: 5px;
                }
                input:checked + .checkbox-track:after {
                    transform: translateX(35px);
                }
                .on-text {
                    position: absolute;
                    top: 9px;
                    left: 12px;
                    font-size: 12px;
                    display: none;
                }
                .on-text.show {
                    display: inline;
                }
                .off-text {
                    position: absolute;
                    top: 9px;
                    left: 30px;
                    font-size: 12px; 
                    display: none;
                }
                .off-text.show {
                    display: inline;
                }
                input[type="range"] {
                    margin: auto;
                }
                input[type="range"]:focus:not(:focus-visible) {
                    border: none;
                }
                input[type="range"]:focus-visible {
                    box-shadow: 0px 0px 0px 2px currentColor;
                }
                .slider-container {
                    width: 100%;
                    padding-bottom: 8px;
                }
                .slider {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 100%;
                    height: 2px;
                    margin-bottom: 10px;
                    background-color: gray;
                    outline: none;
                    opacity: 0.7;
                    -webkit-transition: .2s;
                    transition: opacity .2s;
                    display: none;
                }
                .slider.show {
                    display: inline-block;
                }
                .slider:hover {
                    opacity: 1;
                }
                /* prevent Firefox from adding extra styling on focused slider */
                input[type=range]::-moz-focus-outer {
                    border: 0;
                }
                input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 10px;
                    height: 25px;
                    border-radius: 5px;
                    border: none;
                    cursor: pointer;
                }
                input[type="range"]:focus:not(:focus-visible)::-webkit-slider-thumb {
                    border: none;
                }
                input[type="range"]:focus-visible::-webkit-slider-thumb {
                    border: 2px solid currentColor;
                }
                input[type="range"]::-moz-range-thumb {
                    width: 10px;
                    height: 25px;
                    border: none;
                    cursor: pointer;
                }
                .slider.black::-webkit-slider-thumb {
                    background-color: ${Colors.black};
                }  
                .slider.black::-moz-range-thumb {
                    background-color: ${Colors.black};
                }
                .slider.white::-webkit-slider-thumb {
                    background-color: ${Colors.white};
                }        
                .slider.white::-moz-range-thumb {
                    background-color: ${Colors.white};
                }
                .slider.silver::-webkit-slider-thumb {
                    background-color: ${Colors.silver};
                }             
                .slider.silver::-moz-range-thumb {
                    background-color: ${Colors.silver};
                }
                .slider.gray::-webkit-slider-thumb {
                    background-color: ${Colors.gray};
                }               
                .slider.gray::-moz-range-thumb {
                    background-color: ${Colors.gray};
                }
                .slider.dark-gray::-webkit-slider-thumb {
                    background-color: ${Colors.darkGray};
                }              
                .slider.dark-gray::-moz-range-thumb {
                    background-color: ${Colors.darkGray};
                }
                .slider.charcoal::-webkit-slider-thumb {
                    background-color: ${Colors.charcoal};
                }      
                .slider.charcoal::-moz-range-thumb {
                    background-color: ${Colors.charcoal};
                }
                .slider.magenta::-webkit-slider-thumb {
                    background-color: ${Colors.magenta};
                }    
                .slider.magenta::-moz-range-thumb {
                    background-color: ${Colors.magenta};
                }
                .slider.red::-webkit-slider-thumb {
                    background-color: ${Colors.red};
                }    
                .slider.red::-moz-range-thumb {
                    background-color: ${Colors.red};
                }
                .slider.red-orange::-webkit-slider-thumb {
                    background-color: ${Colors.redOrange};
                }            
                .slider.red-orange::-moz-range-thumb {
                    background-color: ${Colors.redOrange};
                }
                .slider.orange::-webkit-slider-thumb {
                    background-color: ${Colors.orange};
                }      
                .slider.orange::-moz-range-thumb {
                    background-color: ${Colors.orange};
                }
                .slider.gold::-webkit-slider-thumb {
                    background-color: ${Colors.gold};
                }      
                .slider.gold::-moz-range-thumb {
                    background-color: ${Colors.gold};
                }
                .slider.yellow::-webkit-slider-thumb {
                    background-color: ${Colors.yellow};
                }      
                .slider.yellow::-moz-range-thumb {
                    background-color: ${Colors.yellow};
                }
                .slider.grass-green::-webkit-slider-thumb {
                    background-color: ${Colors.grassGreen};
                }      
                .slider.grass-green::-moz-range-thumb {
                    background-color: ${Colors.grassGreen};
                }            
                .slider.green::-webkit-slider-thumb {
                    background-color: ${Colors.green};
                }      
                .slider.green::-moz-range-thumb {
                    background-color: ${Colors.green};
                }            
                .slider.dark-green::-webkit-slider-thumb {
                    background-color: ${Colors.darkGreen};
                }      
                .slider.dark-green::-moz-range-thumb {
                    background-color: ${Colors.darkGreen};
                }            
                .slider.teal::-webkit-slider-thumb {
                    background-color: ${Colors.teal};
                }      
                .slider.teal::-moz-range-thumb {
                    background-color: ${Colors.teal};
                }            
                .slider.blue::-webkit-slider-thumb {
                    background-color: ${Colors.blue};
                }      
                .slider.blue::-moz-range-thumb {
                    background-color: ${Colors.blue};
                }            
                .slider.indigo::-webkit-slider-thumb {
                    background-color: ${Colors.indigo};
                }      
                .slider.indigo::-moz-range-thumb {
                    background-color: ${Colors.indigo};
                }
                .slider.violet::-webkit-slider-thumb {
                    background-color: ${Colors.violet};
                }      
                .slider.violet::-moz-range-thumb {
                    background-color: ${Colors.violet};
                }
                .slider.purple::-webkit-slider-thumb {
                    background-color: ${Colors.purple};
                }      
                .slider.purple::-moz-range-thumb {
                    background-color: ${Colors.purple};
                }
                .slider.beige::-webkit-slider-thumb {
                    background-color: ${Colors.beige};
                }      
                .slider.beige::-moz-range-thumb {
                    background-color: ${Colors.beige};
                }
                .slider.light-brown::-webkit-slider-thumb {
                    background-color: ${Colors.lightBrown};
                }      
                .slider.light-brown::-moz-range-thumb {
                    background-color: ${Colors.lightBrown};
                }
                .slider.brown::-webkit-slider-thumb {
                    background-color: ${Colors.brown};
                }      
                .slider.brown::-moz-range-thumb {
                    background-color: ${Colors.brown};
                }
                .slider.dark-brown::-webkit-slider-thumb {
                    background-color: ${Colors.darkBrown};
                }      
                .slider.dark-brown::-moz-range-thumb {
                    background-color: ${Colors.darkBrown};
                }
                .slider.pastel-pink::-webkit-slider-thumb {
                    background-color: ${Colors.pastelPink};
                }      
                .slider.pastel-pink::-moz-range-thumb {
                    background-color: ${Colors.pastelPink};
                }
                .slider.pastel-orange::-webkit-slider-thumb {
                    background-color: ${Colors.pastelOrange};
                }      
                .slider.pastel-orange::-moz-range-thumb {
                    background-color: ${Colors.pastelOrange};
                }
                .slider.pastel-yellow::-webkit-slider-thumb {
                    background-color: ${Colors.pastelYellow};
                }      
                .slider.pastel-yellow::-moz-range-thumb {
                    background-color: ${Colors.pastelYellow};
                }
                .slider.pastel-green::-webkit-slider-thumb {
                    background-color: ${Colors.pastelGreen};
                }      
                .slider.pastel-green::-moz-range-thumb {
                    background-color: ${Colors.pastelGreen};
                }
                .slider.pastel-blue::-webkit-slider-thumb {
                    background-color: ${Colors.pastelBlue};
                }      
                .slider.pastel-blue::-moz-range-thumb {
                    background-color: ${Colors.pastelBlue};
                }
                .slider.pastel-purple::-webkit-slider-thumb {
                    background-color: ${Colors.pastelPurple};
                }      
                .slider.pastel-purple::-moz-range-thumb {
                    background-color: ${Colors.pastelPurple};
                }
                .slider.light-blue::-webkit-slider-thumb {
                    background-color: ${Colors.lightBlue};
                }      
                .slider.light-blue::-moz-range-thumb {
                    background-color: ${Colors.lightBlue};
                }
                .slider.pink::-webkit-slider-thumb {
                    background-color: ${Colors.pink};
                }      
                .slider.pink::-moz-range-thumb {
                    background-color: ${Colors.pink};
                }
                .more-options-dropdown {
                    display: none;
                    padding: 10px;
                    font-family: sans-serif;
                    font-size: 16px;
                }
                .more-options-dropdown.show {
                    display: block;
                }

                #snackbar {
                    visibility: hidden;
                    min-width: 250px;
                    background-color: ${Colors.colorPaletteBackground};
                    color: ${Colors.black};
                    font-size: 16px;
                    font-family: sans-serif;
                    text-align: center;
                    border-radius: 2px;
                    padding: 16px;
                    position: fixed;
                    z-index: 1;
                    right: 50%;
                    transform: translateX(50%);
                    bottom: 30px;
                }          
                #snackbar.show {
                    visibility: visible;
                    -webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s;
                    animation: fadein 0.5s, fadeout 0.5s 2.5s;
                }
                @-webkit-keyframes fadein {
                    from {bottom: 0; opacity: 0;}
                    to {bottom: 30px; opacity: 1;}
                }
                @keyframes fadein {
                    from {bottom: 0; opacity: 0;}
                    to {bottom: 30px; opacity: 1;}
                }
                @-webkit-keyframes fadeout {
                    from {bottom: 30px; opacity: 1;}
                    to {bottom: 0; opacity: 0;}
                }
                @keyframes fadeout {
                    from {bottom: 30px; opacity: 1;}
                    to {bottom: 0; opacity: 0;}
                }
            `,
        ]
    }
}
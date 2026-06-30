import { css } from "lit";

export const hoistTooltipStyles = css`
	:host {
		display: inline-flex;
	}

	/* The anchor wraps the slotted trigger. WebAwesome's <wa-tooltip> attaches its
         hover/focus listeners to the element referenced by its "for" attribute, so the
         trigger must live in this shadow root alongside the tooltip and carry the id. */
	.tooltip-anchor {
		display: inline-flex;
		height: fit-content;
	}

	wa-tooltip {
		--max-width: 250px;
	}

	wa-tooltip::part(body) {
		box-shadow: 0 0 5px gray;
		background-color: #000;
		border-radius: 0.25rem;
		width: max-content;
	}

	wa-tooltip::part(base) {
		padding: 0px 15px 0px 15px;
	}

	.tooltip-content {
		color: #fff;
		font-family: var(--font-family);
		font-size: 14px;
		font-weight: normal;
		line-height: 21px;
		pointer-events: auto;
	}

	a,
	a:hover,
	a:active {
		color: white;
		display: block;
		margin-bottom: 15px;
	}
`;

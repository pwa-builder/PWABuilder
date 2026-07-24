import { css } from 'lit';

export const manifestInfoFormStyles = css`
	:host {
		--wa-input-focus-ring-width: 3px;
		--wa-input-focus-ring-color: #4f3fb670;
		--wa-input-focus-ring: 0 0 0 var(--wa-input-focus-ring-width)
		var(--wa-input-focus-ring-color);
		--wa-input-border-color-focus: #4f3fb6ac;
		--wa-input-font-family: Hind, sans-serif;
	}

	wa-input::part(base),
	wa-textarea::part(base),
	wa-option::part(base),
	wa-color-picker::part(base),
	wa-button::part(base) {
		--wa-input-font-size-medium: 16px;
		--wa-font-size-m: 16px;
		--wa-input-height-medium: 3em;
		--wa-button-font-size-medium: 16px;
	}

	wa-input::part(base),
	wa-textarea::part(base) {
		background-color: #fbfbfb;
	}

	#form-holder {
		display: flex;
		flex-direction: column;
		row-gap: 1em;
	}

	.form-row {
		display: flex;
		column-gap: 1em;
	}

	.form-row h3 {
		font-size: 18px;
		margin: 0;
	}

	/* Inline required asterisk, matching WebAwesome's required-indicator tokens. */
	.required-asterisk {
		color: var(--wa-form-control-required-content-color);
		margin-inline-start: var(--wa-form-control-required-content-offset);
	}

	/* Suppress wa-input's built-in required asterisk: it renders on the input's
       empty internal label line (its own line). We show it inline in our <h3> instead. */
	wa-input[required]::part(label) {
		display: none;
	}

	.field-desc {
		white-space: no-wrap;
		font-size: 14px;
		margin: 0;
		color: #717171;
	}

	.long .form-field {
		width: 100%;
		min-width: 0;
	}

	.form-field {
		flex: 1 1 0;
		min-width: 0;
		row-gap: 0.25em;
		display: flex;
		flex-direction: column;
	}

	wa-input,
	wa-textarea {
		width: 100%;
	}

	.form-field p {
		font-size: 14px;
	}

	.field-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		column-gap: 5px;
	}

	.header-left {
		display: flex;
		align-items: center;
		column-gap: 10px;
	}

	.color_field {
		display: flex;
		flex-direction: column;
	}

	.color-holder {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.toolTip {
		font-size: 14px;
		visibility: hidden;
		width: 150px;
		background: black;
		color: white;
		font-weight: 500;
		text-align: center;
		border-radius: 6px;
		padding: 0.75em;
		/* Position the tooltip */
		position: absolute;
		top: 20px;
		left: -25px;
		z-index: 1;
		box-shadow: 0px 2px 20px 0px #0000006c;
	}

	.field-header a {
		display: flex;
		align-items: center;
		position: relative;
		color: black;
	}

	a:hover .toolTip {
		visibility: visible;
	}

	a:visited,
	a:focus {
		color: black;
	}

	.color-section {
		display: flex;
		gap: 0.5em;
		align-items: center;
		justify-content: flex-start;
	}

	.color-section p {
		font-size: 18px;
		color: #717171;
		display: flex;
		align-items: center;
		height: fit-content;
		margin: 0;
	}

	wa-color-picker {
		--grid-width: 315px;
		height: 25px;
	}

	wa-color-picker::part(trigger) {
		border-radius: 0;
		height: 25px;
		width: 75px;
		display: flex;
	}

	wa-option:focus-within::part(base) {
		color: #ffffff;
		background-color: #4f3fb6;
	}

	wa-option::part(base):hover {
		color: #ffffff;
		background-color: #4f3fb6;
	}

	.error-color-field {
		border: 1px solid #eb5757 !important;
	}

	.error::part(base) {
		border-color: #eb5757;
		--wa-input-focus-ring-color: #eb575770;
		--wa-input-focus-ring-width: 3px;
		--wa-input-focus-ring: 0 0 0 var(--wa-input-focus-ring-width)
		var(--wa-input-focus-ring-color);
		--wa-input-border-color-focus: #eb5757ac;
	}

	.error::part(control) {
		border-color: #eb5757;
	}

	wa-input::part(input),
	wa-textarea::part(textarea) {
		color: rgb(27, 29, 38);
	}

	wa-input::part(input)::placeholder,
	wa-textarea::part(textarea)::placeholder {
		color: #9b9b9b;
	}

	.focus {
		color: #4f3fb6;
	}

	@media (max-width: 765px) {
		.form-row:not(.color-row) {
			flex-direction: column;
			row-gap: 1em;
		}

		.form-row:not(.color-row) .form-field {
			width: 100%;
		}
	}

	@media (max-width: 480px) {
		wa-input::part(base),
		wa-option::part(base) {
			--wa-input-font-size-medium: 14px;
			--wa-font-size-m: 14px;
			--wa-input-height-medium: 2.5em;
		}

		.form-row p {
			font-size: 12px;
		}

		.form-row h3 {
			font-size: 16px;
		}

		.color-row {
			gap: 1em;
			flex-direction: column;
		}

		.color-row .form-field {
			width: 100%;
		}

		.field-header a:after {
			content: '';
			position: absolute;
			left: -13px;
			top: -13px;
			z-index: -1;
			width: 40px;
			height: 40px;
			border-radius: 7px;
		}
	}
`;

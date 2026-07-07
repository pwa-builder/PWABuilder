import { css } from "lit";

export const manifestPlatformFormStyles = css`
	:host {
		--wa-input-focus-ring-width: 3px;
		--wa-input-focus-ring-color: #4f3fb670;
		--wa-input-focus-ring: 0 0 0 var(--wa-input-focus-ring-width) var(--wa-input-focus-ring-color);
		--wa-input-border-color-focus: #4F3FB6ac;
		--wa-input-font-family: Hind, sans-serif;
	}

	wa-input::part(base),
	wa-select::part(form-control),
	wa-option::part(base),
	wa-button::part(base),
	wa-checkbox::part(base),
	wa-checkbox::part(control),
	wa-details::part(base) {
		--wa-input-font-size-medium: 16px;
		--wa-button-font-size-medium: 12px;
		--wa-font-size-m: 16px;
		--wa-input-height-medium: 3em;
		--wa-toggle-size: 16px;
		--wa-toggle-size-small: 16px;
		--wa-input-font-size-small: 16px;
	}

	wa-details::part(base), wa-select::part(combobox), wa-input::part(base){
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

	.form-row p:not(.toolTip) {
		font-size: 14px;
		margin: 0;
		color: #717171;
	}

	wa-input::part(input),
	wa-select::part(display-input),
	wa-details::part(summary){
		color: #717171;
	}

	.form-field {
		width: 50%;
		min-width: 0;
		row-gap: .25em;
		display: flex;
		flex-direction: column;
	}

	.form-field p {
		font-size: 14px;
	}

	.field-header{
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
		align-items: center;
		column-gap: 10px;
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
		padding: .75em;
		/* Position the tooltip */
		position: absolute;
		top: 20px;
		left: -25px;
		z-index: 1;
		box-shadow: 0px 2px 20px 0px #0000006c;
	}

	.special-tip {
		left: -120px;
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

	a:visited, a:focus {
		color: black;
	}

	wa-option:focus-within::part(base) {
		color: #ffffff;
		background-color: #4F3FB6;
	}

	wa-option::part(base):hover{
		color: #ffffff;
		background-color: #4F3FB6;
	}

	#cat-field {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 10px 16px;
		padding: 0.75em 1em 1em 1em;
		background: white;
		align-items: start;
	}

	/*
        WebAwesome checkboxes keep their label on a single line by default, which
        clips longer category names in a fixed grid column. Allow the label to wrap
        and top-align the control so multi-line items line up cleanly in the grid.
      */
	#cat-field .cat-check::part(label) {
		white-space: normal;
		line-height: 1.2;
	}

	#cat-field .cat-check::part(base) {
		align-items: start;
	}

	#cat-field.error {
		border: 1px solid #eb5757;
		border-radius: 5px;
		padding: 1em;
	}

	wa-details {
		width: 100%;
	}

	wa-details::part(base){
		width: 100%;
		max-height: fit-content
	}

	wa-details::part(header){
		padding: 10px 15px;
		font-size: 16px;
	}

	wa-details:focus {
		outline: 5px solid var(--wa-input-focus-ring-color);
		border-radius: 5px;
	}

	wa-details.error:focus {
		outline: 5px solid #eb575770;
		border-radius: 5px;
	}

	.field-holder {
		display: flex;
		flex-direction: column;
        gap: 12px;
        padding: 6px;
	}

	.shortcut-header{
		padding: .5em 0;
		margin: 0;
		font-size: 16px;
	}

	.icon-close::part(base){
		padding: 0;
	}

	.field-details::part(content){
		display: flex;
		flex-direction: column;
		row-gap: 10px;
	}

	.field-holder wa-button {
		align-self: flex-start;
	}

	.long-items {
		display: flex;
		flex-direction: column;
		row-gap: 10px;
	}

	.long-items h3 {
		font-size: 18px;
		margin: 0;
	}

	.long-items p:not(.toolTip){
		font-size: 14px;
		margin: 0;
		color: #717171;
	}

	.long-items .form-field {
		width: 100%;
	}

	.items-holder {
		display: flex;
		align-items: flex-start;
        flex-direction: column;
		column-gap: 10px;
		padding-bottom: 10px;
	}

	.editable {
		display: flex;
		align-items:center;
		justify-content: space-between;
	}

	.error::part(base){
		border-color: #eb5757;
		--wa-input-focus-ring-color: #eb575770;
		--wa-input-focus-ring-width: 3px;
		--wa-input-focus-ring: 0 0 0 var(--wa-input-focus-ring-width) var(--wa-input-focus-ring-color);
		--wa-input-border-color-focus: #eb5757ac;
	}

	.error::part(control){
		border-color: #eb5757;
	}

	wa-button::part(base):hover {
		background-color: rgba(79, 63, 182, 0.06);
		border-color: rgba(79, 63, 182, 0.46);
		color: rgb(79, 63, 182);
	}

	wa-checkbox[checked]::part(control) {
		background-color: #4f3fb6;
		border-color: #4f3fb6;
		color: #ffffff;
	}

	.focus {
		color: #4f3fb6;
	}

	@media(max-width: 765px){
		.form-row {
			flex-direction: column;
			row-gap: 1em;
		}

		.form-field {
			width: 100%;
		}

		.special-tip {
			left: -25px;
		}
	}

	@media(max-width: 480px){
		wa-input::part(base),
		wa-select::part(form-control),
		wa-option::part(base),
		wa-button::part(base),
		wa-checkbox::part(base),
		wa-checkbox::part(control) {
			--wa-input-font-size-medium: 14px;
			--wa-font-size-m: 14px;
			--wa-input-height-medium: 2.5em;
			--wa-button-font-size-medium: 10px;
			--wa-toggle-size: 14px;
		}

		wa-details::part(header) {
			padding: 5px 10px;
			font-size: 14px;
		}

		.form-row p, .long-items p {
			font-size: 12px;
		}

		.form-row h3, .long-items h3 {
			font-size: 16px;
		}

		.field-header a:after {
			content: "";
			position: absolute;
			left: -13px;
			top: -13px;
			z-index: -1;
			width: 40px;
			height: 40px;
		}
	}
`;

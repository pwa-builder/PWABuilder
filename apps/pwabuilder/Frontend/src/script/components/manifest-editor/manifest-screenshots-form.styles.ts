import { css } from "lit";

export const manifestScreenshotsFormStyles = css`
	:host {
		--wa-input-focus-ring-width: 3px;
		--wa-input-focus-ring-color: #4f3fb670;
		--wa-input-focus-ring: 0 0 0 var(--wa-input-focus-ring-width) var(--wa-input-focus-ring-color);
		--wa-input-border-color-focus: #4F3FB6ac;
		--wa-input-font-family: Hind, sans-serif;
	}

	wa-input::part(base),
	wa-select::part(control),
	wa-button::part(base) {
		--wa-input-font-size-medium: 16px;
		--wa-input-height-medium: 3em;
		--wa-button-font-size-medium: 14px;
	}

	wa-input::part(base),
	wa-select::part(control){
		background-color: #fbfbfb;
	}

	#form-holder {
		display: flex;
		flex-direction: column;
		row-gap: 1em;
	}

	.form-field {
		width: 50%;
		row-gap: .25em;
		display: flex;
		flex-direction: column;
	}

	.form-field {
		display: flex;
		column-gap: 1em;
		width: 100%;
	}

	.form-field h3 {
		font-size: 18px;
		margin: 0;
	}

	.form-field p:not(.toolTip) {
		font-size: 14px;
		margin: 0;
		color: #717171;
	}

	wa-input::part(input){
		color: #717171;
	}

	.field-header{
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

	.sc-gallery {
		display: flex;
		gap: 7px;
		flex-wrap: wrap;
	}

	.screenshot {
		height: 150px;
		width: auto;
	}

	wa-input {
		width: 50%;
	}

	#add-sc {
		width: 50%;
	}

	.center_text {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 5px;
		font-size: 16px;
	}

	.screenshots-actions button {
		width: fit-content;
		height: fit-content;
	}

	@keyframes slide {
		0% , 100%{ bottom: -35px}

		25% , 75%{ bottom: -2px}

		20% , 80%{ bottom: 2px}
	}

	@keyframes rotate {
		0% { transform: rotate(-15deg)}

		25% , 75%{ transform: rotate(0deg)}

		100% {  transform: rotate(25deg)}
	}

	.error {
		color: #292c3a;
	}

	wa-button::part(base):hover {
		background-color: rgba(79, 63, 182, 0.06);
		border-color: rgba(79, 63, 182, 0.46);
		color: rgb(79, 63, 182);
	}

	.focus {
		color: #4f3fb6;
	}

	@media(max-width: 765px){
		wa-input {
			width: 100%;
		}
	}

	@media(max-width: 600px){
		wa-input::part(base),
		wa-select::part(control),
		wa-button::part(base) {
			--wa-input-font-size-medium: 14px;
			--wa-input-height-medium: 2.5em;
			--wa-button-font-size-medium: 12px;
		}
	}

	@media(max-width: 480px){
		.form-field p {
			font-size: 12px;
		}

		.form-field h3 {
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

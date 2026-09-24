import { css } from "lit";

export const windowsFormStyles = css`
	#windows-options-form {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.flipper-button {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.form-generate-button {
		width: 135px;
		height: 40px;
	}

	.basic-settings, .adv-settings {
		display: flex;
		flex-direction: column;
		gap: .75em;
	}

	#form-layout {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
	}

	.form-check:hover input:disabled {
		color: green;
	}

	.form-check:hover input:disabled {
		color: green;
	}

	/* Add vertical spacing between consecutive checkboxes within a group
        (e.g. the Target device families: Desktop / Holographic / Surface Hub). */
	.form-check + .form-check {
		margin-top: 0.5em;
	}

	wa-details {
		margin-top: 1em;
	}

	wa-details::part(base){
		border: none;
	}

	wa-details::part(summary-icon){
		display: none;
	}

	.dropdown_icon {
		transform: rotate(0deg);
		transition: transform .5s;
		height: 30px;
	}

	wa-details::part(header){
		padding: 0 10px;
	}

	wa-details::part(header):focus-visible {
		outline: 2px solid #000000;
		outline-offset: -2px;
	}

	.details-summary {
		display: flex;
		align-items: center;
		width: 100%;
	}

	.details-summary p {
		margin: 0;
		font-size: 18px;
		font-weight: bold;
	}

	.sub-multi {
		font-size: var(--body-font-size);
		margin: 0;
		color: rgba(0,0,0,.5);
	}

	arrow-link {
		margin: 10px 0;
	}

	:host{
		--wa-input-focus-ring-width: 3px;
		--wa-input-focus-ring-color: #4f3fb670;
		--wa-input-focus-ring: 0 0 0 var(--wa-input-focus-ring-width) var(--wa-input-focus-ring-color);
		--wa-input-border-color-focus: #4F3FB6ac;
		--wa-input-font-size-small: 22px;
	}

	#languageDrop::part(display-input){
		min-height: 40px;
	}

	#languageDrop::part(tag){
		font-size: var(--body-font-size);
		color: #757575;
		background-color: #f0f0f0;
		border-radius: var(--input-border-radius);
	}

	#languageDrop::part(listbox){
		background-color: #ffffff;
		height: 200px;
		overflow-y: scroll;
		border-radius: var(--input-border-radius);
		border: 1px solid #c5c5c5;
		margin-top: 3px;
	}

	#languageDrop wa-option::part(base){
		font-size: var(--body-font-size);
		color: #757575;
	}

	#languageDrop wa-option:focus-within::part(base) {
		color: #ffffff;
		background-color: #4F3FB6;
	}

	#languageDrop wa-option::part(base):hover{
		color: #ffffff;
		background-color: #4F3FB6;
	}

	#languageDrop::part(display-label){
		font-size: var(--body-font-size);
		color: #757575;
	}

	wa-color-picker {
		--grid-width: 315px;
		height: 25px;
	}

	wa-color-picker::part(trigger){
		border-radius: 0;
		height: 25px;
		width: 75px;
		display: flex;
	}

	.color-radio::part(control--checked){
		background-color: var(--primary-color);
		border-color: var(--primary-color);
	}

	#ai-hub-label {
		display: flex;
		align-items: center;
		justify-content: flex-start;
	}

	#ai-hub-text {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-start;
	}

	#ai-hub-text p {
		margin: 0;
		color: #7f7f7f;
		font-size: 14px;
	}

`;
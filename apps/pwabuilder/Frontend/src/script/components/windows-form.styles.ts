import { css } from "lit";

export const windowsFormStyles = css`
	.d-none {
		display: none;
	}

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
		overflow: auto;
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

	.actions-error {
		border-color: var(--error-color) !important;
	}

	.actions-error-message {
		font-size: var(--font-size);
	}

	.custom-entities-error-message {
		color: #eb5757;
		margin: 5px 0;
		font-size: 14px;
	}

	.actions-nested-content {
		margin-left: 1.5em;
		margin-top: 0.5em;
	}

	.actions-nested-content .form-check {
		margin-top: 1em;
	}

	.actions-nested-content #actions-file-picker {
		width: 100%;
		box-sizing: border-box;
		padding: 2em !important;
	}

	.actions-file-upload-zone {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		padding: 6px;
		border: 2px dashed #c5c5c5;
		border-radius: var(--input-border-radius);
		background-color: #fafafa;
		cursor: pointer;
		transition: all 0.3s ease;
		text-align: center;
		width: fit-content;
	}

	.actions-file-upload-zone:hover {
		border-color: #4F3FB6;
		background-color: #f0f8ff;
	}

	.actions-file-upload-zone.has-file {
		border-color: #28a745;
		background-color: #f8fff9;
	}

	.upload-icon {
		font-size: 24px;
		margin-right: 8px;
	}

	.upload-text {
		color: #4F3FB6;
		font-size: 14px;
		font-weight: 500;
		margin-right: 4px;
	}

	.actions-file-upload-zone:hover .upload-text {
		color: #3730a3;
	}

	.actions-file-upload-zone.has-file .upload-text {
		color: #28a745;
		font-weight: 500;
	}

	.actions-file-upload-zone.has-file:hover {
		border-color: #218838;
		background-color: #f1fff4;
	}

	.actions-file-upload-zone.has-error {
		border-color: #dc3545;
		background-color: #fff5f5;
	}

	.actions-file-upload-zone.has-error .upload-text {
		color: #dc3545;
		font-weight: 500;
	}

	.actions-file-upload-zone.has-error:hover {
		border-color: #c82333;
		background-color: #ffeaea;
	}

	.custom-entity-uploads {
		margin-top: 1em;
		margin-left: 1em;
		padding: 1em;
		border: 1px solid #e0e0e0;
		border-radius: var(--input-border-radius);
		background-color: #f9f9f9;
		font-size: 14px;
	}

	.custom-entity-uploads .form-group {
		margin-bottom: 1em;
	}

	.custom-entity-uploads .form-group:last-child {
		margin-bottom: 1em;
	}

	.custom-entity-uploads label {
		display: block;
		margin-bottom: 0.5em;
		font-weight: normal;
		font-size: 16px;
	}

	.custom-entity-uploads input[type="file"] {
		border: 1px solid #c5c5c5;
		border-radius: var(--input-border-radius);
		background-color: #ffffff;
		font-size: 12px;
	}

	.folder-picker-wrapper {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.file-picker-wrapper {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.file-picker-wrapper.has-file .file-picker-text,
	.folder-picker-wrapper.has-file .folder-picker-text {
		color: #28a745;
		font-weight: 500;
	}

	.file-picker-wrapper.has-error .file-picker-text,
	.folder-picker-wrapper.has-error .folder-picker-text {
		color: #dc3545;
		font-weight: 500;
	}

	.folder-picker-text,
	.file-picker-text {
		font-size: 12px;
		color: #666;
		font-style: italic;
	}

	.localized-entities-errors {
		margin-top: 1em;
		padding: 1em;
		background-color: #fff5f5;
		border: 1px solid #dc3545;
		border-radius: var(--input-border-radius);
		max-height: 300px;
		overflow-y: auto;
	}

	.localized-entities-errors h4 {
		margin: 0 0 0.5em 0;
		color: #dc3545;
		font-size: 14px;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	.localized-entities-errors h4::before {
		content: "⚠️";
		font-size: 16px;
	}

	.localized-entities-errors ul {
		margin: 0;
		padding-left: 1.2em;
	}

	.localized-entities-errors li {
		color: #dc3545;
		font-size: 12px;
		margin-bottom: 0.5em;
		line-height: 1.4;
		background-color: #fff;
		padding: 0.5em;
		border-radius: 4px;
		border: 1px solid #dc3545;
	}

	.localized-entities-errors li::marker {
		color: #dc3545;
	}
`;
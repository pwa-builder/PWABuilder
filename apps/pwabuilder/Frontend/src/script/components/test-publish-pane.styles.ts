import { css } from "lit";
import {
    // smallBreakPoint,
    mediumBreakPoint,
    largeBreakPoint,
    //xLargeBreakPoint,
    xxxLargeBreakPoint,
    smallBreakPoint,
} from '../utils/css/breakpoints';

export const testPublishPaneStyles = css`
	* {
		box-sizing: border-box;
	}

	#pp-frame-wrapper {
		width: 100%;
		height: fit-content;
	}

	#pp-frame-content {
		display: flex;
		flex-direction: column;
		height: fit-content;
	}

	#pp-frame-header {
		display: flex;
		flex-direction: column;
		row-gap: .25em;
		padding: 1em;
		padding-bottom: 0;
	}

	#pp-frame-header > * {
		margin: 0;
	}

	#pp-frame-header h1 {
		font-size: 24px;
	}

	#pp-frame-header p {
		font-size: 14px;
	}

	.card-wrapper {
		width: 100%;
		height: fit-content;
		display: flex;
		flex-direction: column;
		box-shadow: 0px 4px 10px 4px rgba(0, 0, 0, 0.05);
		position: relative;
		padding: 1em;
		border-radius: var(--card-border-radius);
	}

	.packaged-tracker {
		height: max-content;
		width: 33%;
		background-color: #E2F2E8;
		align-self: flex-end;
		justify-self: flex-end;
		border-bottom-left-radius: 5px;
		padding: 7px;
		padding-left: 9px;
		position: absolute;
		top: 0;
		right: 0;
	}

	.packaged-tracker p {
		margin: 0;
		text-align: center;
		color: #50BA87;
		font-size: 10px;
		line-height: 12px;
		font-weight: bold;
	}

	.experimental-tracker {
		height: max-content;
		width: 33%;
		background-color: #F2F3FB;
		align-self: flex-end;
		justify-self: flex-end;
		border-bottom-left-radius: 5px;
		padding: 7px;
		padding-left: 9px;
		position: absolute;
		top: 0;
		right: 0;
	}

	.experimental-tracker p {
		margin: 0;
		text-align: center;
		color: #4F3FB6;
		font-size: 10px;
		line-height: 12px;
		font-weight: bold;
	}

	.title-block {
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-start;
		width: 100%;
		row-gap: .45em;
	}

	.title-block h3 {
		margin: 0;
		font-size: 24px;
	}

	.factoids {
		width: 100%;
		height: max-content;
		padding-left: 16px;
		margin: 0;
		margin-top: 10px;
	}

	.factoids li {
		font-size: 14px;
	}

	.platform-actions-block {
		align-self: center;
		display: flex;
		justify-content: center;
		row-gap: 10px;
		width: 100%;
	}

	#store-cards {
		width: 100%;
		height: fit-content;
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-gap: .75em;
		padding: 1em;
		overflow-y: auto;
	}

	.package-button{
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
	}

	.package-button::part(base) {
		all: unset;
		width: 75%;
		background-color: #ffffff;
		color: var(--primary-color);
		border: 1px solid var(--primary-color);
		font-size: 14px;
		border-radius: 50px;
		padding: .75em 1em;
		text-align: center;
		font-weight: bold;
	}

	.package-button::part(label){
		padding: 0;
	}

	.package-button:hover {
		cursor: pointer;
	}

	.package-button::part(base):hover{
		box-shadow: var(--button-box-shadow);
	}

	#info-tooltip {
		height: 20px
	}

	.dialog::part(body){
		padding: 0;
		width: 100%;
	}

	.dialog::part(title){
		display: none;
	}

	.dialog::part(panel) {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.dialog::part(overlay){
		backdrop-filter: blur(10px);
	}

	/* Collapse the header's footprint (no white gap) while keeping the
         floating default close button (X), which lives inside the header. */
	.dialog::part(header){
		height: 0;
		min-height: 0;
		padding: 0;
		border: none;
	}

	.dialog::part(close-button__base){
		position: absolute;
		top: 5px;
		right: 5px;
	}

	#feedback {
		position: absolute;
		bottom: .5em;
		padding: 0 1em;
		width: 100%;
	}

	.feedback-holder {
		display: flex;
		gap: .5em;
		padding: .5em;
		border-radius: 3px;
		width: 100%;
		word-break: break-word;
	}

	.type-error {
		align-items: flex-start;
		background-color: #FAEDF1;
		border-left: 4px solid var(--error-color);
	}

	.type-success {
		align-items: center;
		background-color: #eefaed;
		border-left: 4px solid var(--success-color);
	}

	.feedback-holder p {
		margin: 0;
		font-size: 14px;
	}

	.error-desc {
		max-height: 175px;
		overflow-y: auto;
		line-height: normal;
	}

	.error-title {
		font-weight: bold;
	}

	.error-actions {
		display: flex;
		align-items: center;
		gap: 1em;
		margin-top: .25em;
	}

	.error-actions > * {
		all: unset;
		color: black;
		font-weight: bold;
		font-size: 14px;
		border-bottom: 1px solid transparent;
	}

	.error-actions > *:hover {
		cursor: pointer;
		border-bottom: 1px solid black;
	}

	.close_feedback {
		margin-left: auto;
	}

	.close_feedback:hover {
		cursor: pointer;
	}

	/* > 1920 */
	${xxxLargeBreakPoint(css``)}

	/* 640px - 1023px */
	${largeBreakPoint(css``)}

	/* 480px - 639px */
	${mediumBreakPoint(css`
			#store-cards {
				display: flex;
				flex-direction: column;
				row-gap: .5em;
				overflow-y: auto;
			}
	`)}

	/* < 480 */
	${smallBreakPoint(css`
			#store-cards {
				display: flex;
				flex-direction: column;
				row-gap: .5em;
				overflow-y: auto;
			}

			#pp-frame-header{
				margin-bottom: 10px;
				padding: 1em 2em 0em 1em;
			}

			#pp-frame-header h1 {
				font-size: 20px;
				line-height: 20px;
			}

			#pp-frame-header p {
				font-size: 12px;
			}
	`)}
`;

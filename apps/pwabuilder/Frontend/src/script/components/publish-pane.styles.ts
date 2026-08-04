import { css } from "lit";
import {
    // smallBreakPoint,
    mediumBreakPoint,
    largeBreakPoint,
    //xLargeBreakPoint,
    xxxLargeBreakPoint,
    smallBreakPoint,
} from '../utils/css/breakpoints';

export const publishPaneStyles = css`
	* {
		box-sizing: border-box;
	}

	#pp-frame-wrapper {
		width: 100%;
		height: 90vh;
	}

	#pp-frame-content {
		display: flex;
		flex-direction: column;
		height: 100%;
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
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		box-shadow: 0px 4px 10px 4px rgba(0, 0, 0, 0.05);
		position: relative;
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
		padding: 1em;
	}

	.title-block h2 {
		margin: 0;
		font-size: 24px;
	}

	.platform-header {
		display: flex;
		align-items: center;
	}

	.platform-icon {
		height: 40px;
		width: auto;
		flex-shrink: 0;
	}

	.platform-titles {
		display: flex;
		flex-direction: column;
	}

	.platform-subtitle {
		margin: 0;
		font-size: 14px;
		color: var(--secondary-font-color, #6b7280);
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
		height: 100%;
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-gap: .75em;
		padding: 1em;
		overflow-y: auto;
	}

	app-button {
		display: flex;
		justify-content: center;
	}

	.package-button {
		all: unset;
		width: 75%;
		background-color: var(--font-color);
		color: #ffffff;
		border: 1px solid transparent;
		font-size: 14px;
		border-radius: 50px;
		padding: .75em 1em;
		text-align: center;
		font-weight: bold;
	}

	.package-button:focus, .package-button:hover {
		box-shadow: var(--button-box-shadow);
		border: 1px solid #ffffff;
		outline: 2px solid #000000;
		background-color: rgba(0, 0, 0, 0.75);
		cursor: pointer;
	}

	#apk-tabs {
		display: flex;
		align-items: baseline;
		width: 100%;
		border-bottom: 2px solid var(--primary-color);
		margin-top: 20px;
		margin-bottom: 14px;
	}

	.tab-holder {
		width: 100%;
		display: flex;
		align-items: center;
		gap: .5em;
		justify-content: center;
	}

	.tab-holder p {
		font-size: 20px;
		font-weight: 700;
		line-height: 20px;
		letter-spacing: 0px;
		text-align: center;
		margin: 0;
		padding: 10px 0;
		white-space: nowrap;
	}

	.tab-holder p:hover {
		cursor: pointer;
	}

	#other-android{
		display: flex;
		align-items: center;
		justify-content: center;
	}

	#info-tooltip {
		height: 20px
	}

	.selected-apk {
		border-bottom: 5px solid var(--primary-color);
		color: var(--primary-color);
	}

	.unselected-apk {
		border-bottom: 5px solid transparent;
	}

	#pp-form-header {
		display: flex;
		flex-direction: column;
		background-color: #F2F3FB;
		border-top-left-radius: var(--card-border-radius);
		border-top-right-radius: var(--card-border-radius);
		padding: 1em;
		gap: .5em;
	}

	#pp-form-header > img {
		width: 25px;
	}

	#pp-form-header > button {
		all: unset;
		align-self: flex-start;
		display: inline-flex;
		width: fit-content;
	}

	#pp-form-header > button:hover {
		cursor: pointer;
	}

	#pp-form-header > button:focus-visible {
		outline: 2px solid #000000;
		outline-offset: 2px;
		border-radius: 4px;
	}

	#pp-form-header-content {
		display: flex;
		gap: 1em;
	}

	#pp-form-header-content img {
		height: 40px;
	}

	#pp-form-header-text {
		display: flex;
		flex-direction: column;
	}

	#pp-form-header-text > * {
		margin: 0;
	}

	#pp-form-header-text h1 {
		font-size: 24px;
		white-space: nowrap;
		line-height: 24px;
	}

	#pp-form-header-text p {
		font-size: 14px;
		color: rgba(0, 0, 0, 0.5)
	}

	windows-form, android-form, ios-form, oculus-form {
		height: 100%;
	}

	#form-area {
		height: 100%;
		width: 100%;
		overflow: auto;
		position: relative;
        padding-top: 12px;
	}

	#form-area[data-store="Android"] {
		padding-top: 0;
		flex-direction: column;
	}

	.dialog::part(body){
		padding: 0;
		width: 100%;
	}

	.dialog::part(title){
		display: none;
	}

	/* Collapse the dialog header's vertical footprint so it doesn't leave a
         white gap at the top. The header is kept (not removed via without-header)
         because the default close button (X) lives inside it and is floated to
         the top-right corner via ::part(close-button__base) below. */
	.dialog::part(header){
		height: 0;
		min-height: 0;
		padding: 0;
		border: none;
	}

	.dialog::part(panel) {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		border-radius: var(--card-border-radius);
	}

	.dialog::part(overlay){
		backdrop-filter: blur(10px);
	}

	.dialog::part(close-button__base){
		position: absolute;
		top: 5px;
		right: 5px;
		z-index: 1000;
	}

	#unsigned-tooltip{
		position: relative;
	}

	.toolTip {
		visibility: hidden;
		font-size: 14px;
		width: 150px;
		background: var(--font-color);
		color: white;
		font-weight: 500;
		text-align: center;
		border-radius: 6px;
		padding: .75em;
		/* Position the tooltip */
		position: absolute;
		top: 25px;
		left: -100px;
		z-index: 1;
		box-shadow: 0px 2px 20px 0px #0000006c;
	}

	#unsigned-tooltip:hover .toolTip {
		visibility: visible;
	}

	#feedback {
		position: fixed;
		top: .5em;
		width: 682px;
		@media (max-width: 535px) {
			top: unset;
			bottom: .5em;
			width: 100vw;
			left: 0;
			padding: 0 1em;
		}
	}

	.feedback-callout {
		width: 100%;
		word-break: break-word;
		box-shadow: var(--wa-shadow-m, 0 2px 8px rgba(0, 0, 0, 0.2));
	}

	.feedback-content {
		display: flex;
		align-items: flex-start;
		gap: .5em;
		width: 100%;
	}

	.feedback-text {
		flex: 1;
		min-width: 0;
	}

	.feedback-callout p {
		margin: 0;
		font-size: 14px;
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
		color: var(--font-color);
		font-weight: bold;
		font-size: 14px;
		border-bottom: 1px solid transparent;
	}

	.error-actions > *:hover {
		cursor: pointer;
		border-bottom: 1px solid var(--font-color);
	}

	.error-desc {
		max-height: 175px;
		overflow-y: auto;
		line-height: normal;
	}

	.close_feedback {
		all: unset;
		margin-left: auto;
		display: inline-flex;
		align-items: center;
		color: var(--font-color);
		font-size: 14px;
	}

	.close_feedback:hover {
		cursor: pointer;
	}

	#form-extras {
		display: flex;
		justify-content: space-between;
		padding: 1.5em 2em;
		background-color: #F2F3FB;
		border-bottom-right-radius: var(--card-border-radius);
		border-bottom-left-radius: var(--card-border-radius);
	}

	#form-details-block {
		width: 50%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	#form-details-block p {
		font-size: 14px;
		color: #808080;
	}

	#form-options-actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: .5em;
	}

	#generate-submit::part(base) {
		background-color: var(--font-color);
		color: white;
		height: 3em;
		width: 100%;
		border-radius: 50px;
	}

	#generate-submit:focus::part(base),
	#generate-submit:focus-visible::part(base) {
		border: 1px solid #ffffff;
		outline: 2px solid #000000;
		outline-offset: 2px;
		box-shadow: var(--button-box-shadow);
	}

	#form-extras wa-button::part(label){
		font-size: 16px;
		padding: .5em 2em;
		display: flex;
		align-items: center;
	}

	.arrow_link {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		font-weight: bold;
		margin-bottom: .25em;
		font-size: 14px;
	}

	.arrow_link a {
		text-decoration: none;
		border-bottom: 1px solid rgb(79, 63, 182);
		font-size: 1em;
		font-weight: bold;
		margin: 0px 0.5em 0px 0px;
		line-height: 1em;
		color: rgb(79, 63, 182);
	}

	.arrow_link a:visited {
		color: #4F3FB6;
	}

	.arrow_link:hover {
		cursor: pointer;
	}

	.arrow_link:hover img {
		animation: bounce 1s;
	}

	@keyframes bounce {
		0%, 20%, 50%, 80%, 100% {
			transform: translateY(0);
		}

		40% {
			transform: translateX(-5px);
		}

		60% {
			transform: translateX(5px);
		}
	}

	#tou-link{
		color: 757575;
		font-size: 14px;
	}

	@media(max-width: 640px){
		#form-extras {
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 1em;
		}

		#form-details-block {
			flex-direction: column;
			gap: .75em;
			align-items: center;
			text-align: center;
			width: 100%;
		}

		#form-options-actions {
			flex-direction: column;
		}
	}

	@media(min-height: 900px){
		#pp-frame-wrapper {
			width: 100%;
			height: 85vh;
		}
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

			#pp-form-header-content img {
				height: 35px;
			}

			#pp-form-header-text h1 {
				font-size: 20px;
				white-space: nowrap;
				line-height: 20px;
			}

			#pp-form-header-text p {
				font-size: 12px;
			}

			#apk-type p {
				font-size: 16px;
			}

			#info-tooltip {
				height: 16px
			}
	`)}
`;

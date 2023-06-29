import { css } from 'lit';
import { largeBreakPoint, mediumBreakPoint, smallBreakPoint } from '../../utils/css/breakpoints';

export default css`
:host {
		--sl-focus-ring-width: 3px;
		--sl-input-focus-ring-color: #595959;
		--sl-focus-ring: 0 0 0 var(--sl-focus-ring-width) var(--sl-input-focus-ring-color);
		--sl-input-border-color-focus: #4F3FB6ac;
		--sl-color-primary-300: var(--primary-color);
	}
	sl-tooltip::part(base){
		--sl-tooltip-font-size: 14px;
	}

	#wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 30px;
	}

	#wrapper > * {
		box-sizing: border-box;
	}

	#wrapper > *:not(#hero-section):not(#footer-section){
		max-width: 1366px;
	}

	#wrapper > :last-child:not(#footer-section) {
		margin-bottom: 30px;
	}

	#hero-section {
		padding: 50px 100px;
		background-image: url("/assets/new/giveaway_banner.png");
		height: 303px;
		background-repeat: no-repeat;
		background-size: cover;
		background-position: center;

		display: flex;
		flex-direction: column;
		gap: 6px;

		align-items: flex-start;
		justify-content: center;
		width: 100%;

		position: relative;
	}

	#hero-section.uncovered {
		background-image: url("/assets/new/giveaway_banner_nourl.png");
	}

	#hero-section.covered {
		background-image: url("/assets/new/giveaway_banner_url.png");
	}

	@media(min-width: 1366px){
		#hero-section.uncovered {
		background-image: url("/assets/new/giveaway_banner_nourl_1920.png");
	}
	}

	#hero-section h1 {
		font-family: Hind;
		font-size: var(--header-font-size);
		font-weight: 700;
		line-height: 40px;
		letter-spacing: 0em;
		text-align: left;
		color: #292C3A;
		margin: 0;
		max-width: min(525px, 65%);
	}

	#hero-section .hero-message {
		font-family: Hind;
		font-size: var(--subheader-font-size);
		font-weight: 400;
		line-height: 26px;
		letter-spacing: 0em;
		text-align: left;
		margin: 0;
		color: #292C3A;
		margin-bottom: 25px;
		max-width: min(555px, 65%);
	}

	#hero-section .hero-message.with-input {
		margin: 0;
	}

	.back-to-giveaway-home {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 10px;
		position: absolute;
		left: 100px;
		top: 35px;
		border-bottom: 1px solid transparent;
		width: 200px;
	}

	.back-to-giveaway-home:hover {
		cursor: pointer;
	}

	.back-to-giveaway-home img {
		height: 12px;
		width: auto;
	}

	.diff-url {
		color: var(--font-color);
		width: fit-content;
		font-size: var(--font-size);
		font-weight: 600;
		margin: 5px 0;
	}

	#hero-section .store-logo {
		position: absolute;
		top: 15px;
		right: 25px;
	}

	.input-area {
		margin-top: 20px;
	}

	.input-area form {
		display: flex; 
		gap: 10px;
	}

	#hero-section sl-input::part(base) {
		border: 1px solid #e5e5e5;
		border-radius: var(--input-border-radius);
		color: var(--font-color);
		width: 28em;
		font-size: 14px;
		height: 3em;
	}

	#hero-section sl-input::part(input) {
		height: 3em;
	}

	

	/* #hero-section .error::part(base){
		border-color: #eb5757;
		--sl-input-focus-ring-color: #eb575770;
		--sl-focus-ring-width: 3px;
		--sl-focus-ring: 0 0 0 var(--sl-focus-ring-width) var(--sl-input-focus-ring-color);
		--sl-input-border-color-focus: #eb5757ac;
	}

	.error-message {
		color: var(--error-color);
		font-size: var(--small-font-size);
		margin-top: 6px;
	} */

	#app-info-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 75%;
		background-color: #ffffff;
		border-radius: 10px;
		min-height: 165px;
		box-shadow: 0px 4px 30px 0px #00000014;
		gap: 15px;
		padding: 25px;
		margin-top: -95px;
		z-index: 1;
	}

	#logo-and-text {
		display: flex;
		justify-content: center;
		width: 100%;
		height: 100%;
		gap: 15px;
	}

	.square::part(indicator) {
		width: 120px;
		height: 120px;
		border-radius: 10px;
	}

	img.square {
		width: 120px;
		height: 120px;
		border-radius: 10px;
		padding: 10px;
	}

	#img-holder {
		height: 140px;
		width: 160px;
		border-radius: 10px;
		box-shadow: 0px 4px 30px 0px #00000014;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	#words {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	#words > *::part(indicator) {
		height: 16px;
	}

	#words sl-skeleton:nth-child(1)::part(indicator) {
		height: 24px;
	}
	#words sl-skeleton:nth-child(1)::part(base) {
		width: 55%;
	}

	#words sl-skeleton:nth-child(2)::part(base) {
		width: 60%;
	}

	#words sl-skeleton:nth-child(3)::part(base) {
		width: 70%;
	}

	#words sl-skeleton:nth-child(4)::part(base) {
		width: 60%;
	}

	.app-desc {
		max-width: 700px;
	}

	#categories > *::part(indicator) {
		height: 46px;
	}

 .card-holder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 10px;
		min-width: 92px;
 }

 .card-holder p {
		margin: 0;
		font-size: 14px;
		white-space: nowrap;
 }


 .card-holder sl-progress-ring {
	--size: 72px;
	font-size: 12px;
 }

 #rings {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	place-items: center;
	gap: 20px;
	box-shadow: 0px 4px 30px 0px #00000014;
	border-radius: 10px;
	padding: 20px;
 }

.loader-round {
	width: 72px;
	height: 72px;
	border-radius: 50%;
	position: relative;
	flex-shrink: 0;
	animation: rotate 1s linear infinite
}

.loader-round::before {
	content: "";
	box-sizing: border-box;
	position: absolute;
	inset: 0px;
	border-radius: 50%;
	border: 6px solid #D6D6D6;
	/* animation: prixClipFix 2s linear infinite, 2s ease-in-out 0.5s infinite normal none running pulse; */
	clip-path:polygon(50% 50%,0 0,100% 0,100% 100%,0 100%,0 50%)
}

@keyframes rotate {
	100%   {transform: rotate(360deg)}
}

#words p {
	margin: 0;
	font-size: 14px;
}

#words p:nth-child(1) {
	font-size: 24px;
	font-weight: 700;
}
#words p:nth-child(2) {
	width: 55%;
	font-weight: 700;
}

#app-info {
	display: flex;
	justify-content: center;
	width: 100%;
	height: 100%;
	gap: 15px;
}

.feedback-holder {
	display: flex;
	gap: .5em;
	padding: .5em;
	border-radius: 3px;
	width: 100%;
	word-break: break-word;
	box-sizing: border-box;
}

.type-error {
	align-items: flex-start;
	background-color: #FAEDF1;
	border-left: 4px solid var(--error-color);
}

.feedback-holder p {
	margin: 0;
	font-size: 14px;
	line-height: 14px;
}

.error-info {
	display: flex;
	flex-direction: column;
	gap: 5px;
}

.error-title {
	font-weight: bold;
}

.error-desc {
	max-height: 175px;
	line-height: normal;
}

#qual-div {
	background-color: #ffffff;
	border-radius: 10px;
	padding: 20px;
}

#qual-sum {
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	margin-bottom: 20px;
}

#qual-sum h2, #qual-section h2 {
	font-size: 18px;
	color: #4F3FB6;
	margin: 0;
}


#action-items-section {
	width: 75%;
}

.details::part(base) {
	border-radius: 10px;
	border: none;
}
.details::part(summary) {
	font-weight: bold;
	font-size: var(--card-body-font-size);
}
.details::part(header) {
	padding: 1em .75em;
}

sl-details::part(summary-icon){
	display: none;
}

sl-progress-ring {
	height: fit-content;
	--track-width: 4px;
	--indicator-width: 8px;
	--size: 100px;
	font-size: var(--subheader-font-size);
}

sl-progress-ring::part(label){
	color: var(--primary-color);
	font-weight: bold;
}

.red {
	--indicator-color: var(--error-color);
}

.yellow {
	--indicator-color: var(--warning-color);
}

.green {
	--indicator-color: var(--success-color);
}

.macro {
	width: 3em;
	height: auto;
}

#categories {
	display: flex;
	flex-direction: column;
	width: 100%;
	gap: 10px;
}

.inner-details::part(base) {
	border: none;
	background-color: #F1F1F1;
}

.inner-details::part(header) {
	padding: 0;
}

sl-details::part(header):focus {
	outline: none;
}

#qual-details::part(content) {
	padding-top: 0;
}

.inner-details::part(content) {
	padding: 20px;
	padding-top: 0;
}

.inner-summary {
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	padding: 5px 10px;
}

.inner-summary h3 {
	font-size: 14px;
	font-weight: normal;
	color: var(--font-color);
	margin: 0;
}

.summary-left {
	display: flex;
	align-items: center;
	gap: 10px;
}

.todos {
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: repeat(3, 1fr);
}

.inner-todo {
	display: flex;
	gap: 10px;
	align-items: center;
}

.inner-todo p {
	margin: 0;
	font-size: 14px;
	white-space: nowrap;
}

.inner-todo img {
	width: 13px;
	height: auto;
}

#enhancements-details::part(base) {
	background-color: #F1F2FA;
}

.dropdown_icon {
	transform: rotate(0deg);
	transition: transform .5s;
}

#sign-in-section {
	width: 75%;
	display: flex;
	align-items: flex-start;
}

.sign-in-button::part(label) {
	display: flex;
	gap: 10px;
}

.primary::part(base) {
	background-color: var(--font-color);
	color: white;
	font-size: 14px;
	height: 3em;
	border-radius: 50px;
}

.primary::part(label){
	display: flex;
	align-items: center;
	padding: var(--button-padding);
}

.primary::part(base):hover {
	border-color: var(--primary-color);
}

.retest-button {
	position: absolute;
	width: 100px;
	height: 35px;
	right: 95px;
	top: 30px;
}

.retest-button img {
	width: 14px;
	height: 14.7px;
}

.retest-button p {
	font-size: 12px !important;
	font-weight: bold !important;
}

.secondary::part(base) {
	background-color: #ffffff;
	color: var(--font-color);
	font-size: 14px;
	height: 3em;
	border-radius: 50px;
}

.secondary::part(label){
	display: flex;
	align-items: center;
	padding: var(--button-padding);
	gap: 10px;
}

.prisecondarymary::part(base):hover {
	border-color: var(--primary-color);
}

#qual-section {
	width: 75%;
	display: flex;
	flex-direction: column;
	padding: 20px;
	border-radius: 10px;
	background-color: #ffffff;
	box-shadow: 0px 4px 30px 0px #00000014;
}

#qual-section li {
	font-size: 14px;
}

#qual-section ul {
	margin: 20px 0;
}

#footer-section {
	background-color: #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40px;
	position: relative;
	width: 100%;
}

#footer-section-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: 1fr 1fr;
	width: 80%;
	column-gap: 20px;
	row-gap: 50px;
}

#marketing-img {
	border-radius: 10px;
	width: auto;
	height: 250px;
}

.footer-text {
	display: flex;
	flex-direction: column;
	gap: 10px;
	place-self: center;
}

.footer-text > * {
	margin: 0;
}

.footer-text sl-button::part(base){
	width: 35%;
}

.subheader {
	font-size: 24px;
	font-weight: 700;
	color: var(--font-color);
}

.body-text {
	font-size: 16px;
	color: var(--font-color);
}

.large-subheader {
	font-size: 36px;
	font-weight: 700;
	color: var(--font-color);
	line-height: 40px;
}

.large-body-text {
	font-size: 20px;
	color: var(--font-color);
	width: 76%;
}

.wheel-img {
	position: absolute;
	bottom: 0;
	right: 0;
	width: 500px;
}

#terms-and-conditions {
	display: flex;
	flex-direction: column;
	width: 75%;
}

#terms-and-conditions label {
	font-family: Hind;
	font-size: 14px;
	font-weight: 400;
	line-height: 12px;
	color:#292C3A;
	margin-bottom: 15px;
}

#terms-and-conditions sl-button {
	width: 218px;
	height: auto;
	background: #292C3A;
	box-shadow: 0px 0.9625px 3.85px rgba(0, 0, 0, 0.25);
	border-radius: 42.35px;
	margin-bottom: 10px;
}

#terms-and-conditions p {
	font-weight: bold;
	font-size: 14px;
	line-height: 16px;
	color: #292C3A;
}

#terms-and-conditions a { 
	color: #4F3FB6;
	text-decoration: underline;
}

#hero-section-bottom {
	width: 100%;
	height: 309px;
	background-image: url("/assets/microsoft-promo-banner.png");
	background-repeat: no-repeat;
	background-size: 100%;
	background-position: center;
	margin-bottom: 0px !important;
}

.dialog::part(body){
	padding-top: 0;
	padding-bottom: 0;
	display: flex;
	flex-direction: column;
	gap: 15px;
}
.dialog::part(header){
	width: 100%;
}
.dialog::part(title){
	font-weight: 600;
  font-size: 20px;
}
.dialog::part(panel) {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 65%;
	position: relative;
}
.dialog::part(overlay){
	backdrop-filter: blur(10px);
}
.dialog::part(close-button__base){
	position: absolute;
	top: 5px;
	right: 5px;
}

.dialog h2 {
	color: var(--primary-color);
	font-size: var(--subheader-font-size);
	margin: 0;
}

.dialog p, .dialog li {
	margin: 0;
	font-size: var(--font-size);
}

.accept-terms {
	width: fit-content;
	align-self: flex-end;
	margin-bottom: 30px;
}

@media(min-width: 1366px){
	#wrapper {
		background-color: #ffffff;
	}

	.feedback-holder p {
		font-size: 16px;
		line-height: 16px;
	}

	#terms-and-conditions label {
		font-size: 16px;
	}

	#terms-and-conditions p {
		font-size: 16px;
	}

	.subheader {
		font-size: 36px;
	}

	.body-text {
		font-size: 20px;
	}
}

@media(max-width: 1024px){

	#app-info {
		flex-direction: column;
	}
	#rings {
		display: flex;
		justify-content: space-evenly;
	}
	.card-holder {
		min-width: 50px;
	}

	#footer-section-grid {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.wheel-img {
		position: unset;
	}

	.footer-text {
		align-items: center;
	}

	.footer-text sl-button::part(base) {
		width: 100%;
	}

	.large-body-text, .large-subheader, .body-text {
		text-align: center;
	}

	#marketing-img {
		height: 200px;
	}

	
	
}
@media(max-width: 720px){
	#hero-section h1, #hero-section .hero-message {
		max-width: 95%;
	}
}

@media(max-width: 620px){
	.input-area {
		width: 100%;
	}
	.input-area form {
		flex-direction: column;
	}
	#hero-section sl-input::part(base) {
		width: 100%;
	}
	#hero-section .primary::part(base){
		width: 33%;
	}

	
}

@media(max-width: 414px) {
	#hero-section-bottom {
		height: 115px !important;
	}
}

${smallBreakPoint(css`
	.retest-button {
		top: 21px;
	}
	.secondary::part(label) {
		gap: 5px;
	}
	.back-to-giveaway-home {
		left: 45.26px;
    top: 98px;
	}
	.back-to-giveaway-home img {
		width: 25px;
    height: 13.75px;
	}
	.store-logo {
		width: 45px;
		height: 45px;
	}
	#hero-section {
		padding: 50px;
		height: 482px;
	}
	#hero-section p {
		width: 100% !important;
	}
	#app-info-section {
		width: 90%;
	}
	#img-holder {
		width: 115px;
		height: 115px;
	}
	#words p {
		width: 155px !important;
		white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
	}
	#action-items-section {
		width: 90%;
	}
	#qual-section {
		width: 90%;
	}
	#sign-in-section {
		width: 90%;
	}
	#sign-in-section sl-button {
		width: 100%;
	}
	#hero-section-bottom {
		height: 138px;
	}
`)}

${mediumBreakPoint(css`
.retest-button {
		top: 21px;
	}
	.back-to-giveaway-home {
		left: 45.26px;
    top: 30.5px;
	}
	.back-to-giveaway-home img {
		width: 25px;
    height: 13.75px;
	}
	.store-logo {
		width: 45px;
		height: 45px;
	}
	#hero-section {
		height: 303px;
		padding: 50px;
	}
	#hero-section p {
		width: 100% !important;
	}
	#img-holder {
		/* width:  */
	}
	#words {
		width: 60%;
	}
	#words p {
		height: auto;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
	}
	#hero-section-bottom {
		height: 145px;
	}
`)}

${largeBreakPoint(css`
	#hero-section p {
		width: 70% !important;
	}
	#hero-section-bottom {
		height: 199px;
	}
`)}
`
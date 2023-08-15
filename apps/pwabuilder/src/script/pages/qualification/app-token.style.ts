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

	#over-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 95vh;
	}

	#over-main-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 20px;
	}

	#over-main-content h1 {
		font-size: 36px;
		color: var(--font-color);
		margin: 0;
	}

	#icons-section {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 20px;
	}

	.twt {
		width: 65px;
		height: auto;
	}

	.disc {
		width: 55px;
		height: auto;
	}

	#icons-section img:hover {
		cursor: pointer;
	}

	#over-wrapper p span {
		font-weight: 700;
	}

	#over-wrapper > p {
		font-size: 16px;
		color: var(--font-color);
		margin: 0;
		position: absolute;
    bottom: 2.5vh;
	}

	#wrapper > * {
		box-sizing: border-box;
	}

	#wrapper > *:not(#hero-section):not(#footer-section):not(.top-banner-container){
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
		width: 100%;

		display: flex;
		justify-content: center;
		align-items: center;
		
		position: relative;
	}

	#hero-section.uncovered {
		background-image: url("/assets/new/giveaway_banner_nourl.png");
	}

	#hero-section.covered {
		background-image: url("/assets/new/giveaway_banner_url.png");
	}

	#hero-section-content {
		max-width: 1366px;

		display: flex;

		align-items: flex-start;
		justify-content: flex-start;
		width: 100%;

	}

	#hero-section-text {
		display: flex;
		flex-direction: column;
		gap: 6px;

		align-items: flex-start;
		justify-content: center;

		max-width: 800px;
		width: 100%;
		margin-top: 40px;
	}

	#actions-left {
		
		display: flex;
		position: absolute;
		top: 20px;
		left: 100px;    
		gap: 5px;
    align-items: center;
		height: 42px;
	}

	#actions-right {
		
		display: flex;
		position: absolute;
		top: 20px;
    right: 20px;
		gap: 20px;
	}

	.sign-out-prompt  {
		font-weight: bold;
		font-size: 14px;
		line-height: 16px;
		color: #292C3A;
		white-space: nowrap;
	}

	.sign-out-prompt a { 
		color: #4F3FB6;
		text-decoration: underline;
	}

	.sign-out-prompt a:hover { 
		cursor: pointer;
	}

	.sign-out-link { 
		color: #4F3FB6;
		text-decoration: underline;
		font-weight: bold;
		font-size: 14px;
		line-height: 16px;
	}

	.sign-out-link:hover { 
		cursor: pointer;
	}

	.pwabuilder-logo {
		height: 40px;
		width: auto;
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
		max-width: 575px;
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

	.input-area {
		margin-top: 20px;
		display: flex;
    flex-direction: column;
    gap: 10px;
	}

	.invalid-url {
		margin: 0;
    font-size: 14px;
    color: var(--error-color);
	}

	.input-area form {
		display: flex; 
		gap: 10px;
		align-items: center;
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

.error-actions {
	display: flex;
	align-items: center;
	gap: 20px;
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

.top-banner-container {
	padding: 7px;
	width: 100%;
	margin-bottom: -30px;
}

.over-banner {
	padding: 10px 30px;
	background-color: #FFF3F3;
	border: 1px solid #F10909;
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: space-evenly;
	gap: 10px;
	max-width: 720px;
}

.end-error-desc {
	font-size: 16px;
	color: var(--font-color);
}

.over-banner img {
	width: 50px;
	height: auto;
}

.feedback-holder p {
	margin: 0;
	font-size: 14px;
	line-height: 16px;
}

.error-info {
	display: flex;
	flex-direction: column;
	gap: 7px;
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
	box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 30px 0px;
	border-radius: 10px;
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

img[data-card="installable-details"] {
	transform: rotate(90deg);
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
	--indicator-color: #50ba87;
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
	padding-bottom: 15px;
}

.inner-summary {
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	padding: 5px 10px;
	padding-left: 14px;
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
	gap: 3px;
}

.inner-todo {
	display: flex;
	gap: 10px;
	align-items: center;
}

.inner-todo a {
	margin: 0;
	font-size: 14px;
	color: inherit;
	text-decoration: none;
}

.inner-todo a:hover, .inner-todo a:focus {
	text-decoration: underline;
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
	font-size: var(--button-font-size);
	padding: var(--button-padding);
	border-radius: 50px;
	display: flex;
	align-items: center;
	height: 3em;
}

.vtc-disabled::part(base) {
	background-color: #C3C3C3;
	color: white;
}

.primary::part(label){
	display: flex;
	align-items: center;
}

.primary::part(base):hover {
	border-color: var(--primary-color);
}

.retest-button img {
	width: 14px;
	height: auto;
}

.copy-code:hover {
	cursor: pointer;
}

.back-to-home {
	all: unset;
	border: 1px solid transparent;
	display: flex;
	align-items: center;
	justify-content: center;
}

.back-to-home:hover {
	cursor: pointer;
}

.back-to-home:focus {
	border: 1px solid black;
}

.secondary::part(base) {
	background-color: #ffffff;
	color: var(--font-color);
	font-size: 14px;
	padding: 12px 10px;
	height: 3em;
	border-radius: 50px;
	display: flex;
	align-items: center;
	width: fit-content;
	font-weight: bold;
}

.secondary::part(label){
	display: flex;
	align-items: center;
	gap: 10px;
	height: 18px;
  white-space: nowrap;
}

.primary::part(base):hover {
	border-color: var(--primary-color);
}

.secondary::part(base):focus {
	border: 1px solid black;
}

#qual-section {
	width: 75%;
	display: flex;
	flex-direction: column;
	padding: 20px;
	border-radius: 10px;
	background-color: #ffffff;
	box-shadow: 0px 4px 30px 0px #00000014;
	gap: 10px;
}

.FTC {
	font-size: var(--arrow-link-font-size);
	font-weight: bold;
	margin: 0px 0.5em 0px 0px;
	line-height: 1em;
	color: var(--primary-color);
	width: fit-content;
  border-bottom: 1px solid #4f3fb6;
}

.FTC:hover {
	cursor: pointer;
}

#qual-section li {
	font-size: 14px;
}

#qual-section ul {
	margin: 0;
	margin-bottom: 20px;
	padding-left: 20px;
}

#qual-section p {
	margin: 0;
	font-size: 14px;
}

.back-to-pwabuilder-section {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 10px;
	padding-top: 20px;
  padding-bottom: 60px;
}

#footer-section {
	background-color: #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40px 100px;
	width: 100%;
	min-height: 25vw;
}

#footer-section-grid {
	display: grid;
	width: 100%;
	column-gap: 20px;
	row-gap: 50px;
	max-width: 1366px;
}

.footer-grid-one-row {
	grid-template-columns: 1fr 1fr;
	grid-template-rows: unset;
}

.footer-grid-two-row {
	grid-template-columns: 1fr 1fr;
	grid-template-rows: 1fr 1fr;
}

#marketing-img {
	border-radius: 10px;
	max-width: 100%; /* Set the maximum width to 100% of its container */
  max-height: 100%; /* Set the maximum height to 100% of its container */
  width: auto; /* Allow the width to adjust proportionally */
  height: auto; /* Allow the height to adjust proportionally */
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
	width: 50%;
	display: flex;
  align-items: center;
}

.subheader {
	font-size: 24px;
	font-weight: 700;
	color: var(--font-color);
	white-space: nowrap;
}

.body-text {
	font-size: 16px;
	color: var(--font-color);
	max-width: 500px;
}

.large-body-text {
	font-size: 20px;
	color: var(--font-color);
	width: 76%;
}

.grid-item {
	display: flex;
	justify-content: center;
}

.grid-img {
	justify-content: flex-end;
}

.sc-img {
	justify-content: flex-start;
}

.wheel-img-1024, .wheel-img-small {
	display: none;
}

.grid-img img {
	max-width: 100%;
	max-height: 100%;
	position: absolute;
	bottom: 0;
	right: 0;
	height: 25vw;
	width: auto;
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

.withoutAccept::part(body) {
	padding-bottom: 25px;
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
	position: relative;
	width: 65%;
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



@media(min-width: 1920px){
	#hero-section h1 {
		font-size: 40px;
	}
	.subheader {
		font-size: 36px;
	}
}

@media(max-width: 1366px){
	#wrapper {
		background-color: #ffffff;
	}

	#terms-and-conditions label {
		font-size: 16px;
	}

	#terms-and-conditions p {
		font-size: 16px;
	}
}

@media(max-width: 1024px){
	.subheader {
		font-size: 24px;
		text-align: center;
	}

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

	.wheel-img-1920 {
		display: none;
	}
	.wheel-img-1024 {
		display: flex;
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

@media(max-width: 750px){
	#hero-section h1, #hero-section .hero-message {
		max-width: 95%;
	}

	#footer-section-grid {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.wheel-img-1024 {
		display: none;
	}
	.wheel-img-small {
		display: flex;
	}

	.grid-img img {
		position: unset;
		height: auto;
		width: 100%;
	}

	.wheel-img-small {
		width: 100%;
	}

	#footer-section {
		padding: 0;
		padding-top: 40px;
	}
	
	.footer-text {
		align-items: center;
	}

	.todos {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	#hero-section-content h1 {
		font-size: 30px;
	}
	.dialog::part(panel) {
		width: 100%;
	}

	.input-area {
		width: 100%;
	}
	.input-area form {
		flex-direction: column;
		align-items: flex-start;
	}
	sl-input {
		width: 100%;
	}
	#hero-section sl-input::part(base) {
		width: 100%;
	}
	#hero-section .primary::part(base){
		width: 33%;
	}

	#hero-section.uncovered, #hero-section.covered {
		background-image: url('/assets/new/giveaway_banner_mobile.png');
		background-position: bottom;
	}

	#hero-section {
		padding: 40px;
		height: 500px;
	}

	.back-to-giveaway-home {
		left: 50px;
	}

	#hero-section-text {
		margin: 80px 0;
	}

	#actions-left .sign-out-prompt {
		display: none;
	}

	#actions-left{
		left: 40px;
	}
	

}

@media(max-width: 620px){
	
	
}

@media(max-width: 420px) {
	#hero-section-bottom {
		height: 115px !important;
	}

	#hero-section.uncovered, #hero-section.covered {
		background-image: url('/assets/new/giveaway_banner_mobile.png');
	}
	
	#footer-section {
		padding: 0;
	}

	#footer-section-grid {
		width: 100%;
	}
	

	.sc-img {
		padding: 40px 40px 0 40px;
	}

	.footer-text {
		padding: 0 40px;
	}
	#actions-right {
		gap: 10px;
	}
}

${smallBreakPoint(css`
	.back-to-giveaway-home {
		top: 140px;
	}

	.secondary::part(label) {
		gap: 5px;
		padding: 0;
		font-size: 12px;
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
	.sign-in-button::part(base) {
		font-size: 13px;
	}
	#hero-section-bottom {
		height: 138px;
	}
	.subheader { 
		font-size: 20px !important;
	}
`)}

${mediumBreakPoint(css`
	
	#hero-section p {
		width: 100% !important;
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
	#sign-in-section {
		width: 100%;
		justify-content: center;
	}
`)}

${largeBreakPoint(css`
	#hero-section p:not(.sign-out-prompt) {
		width: 70% !important;
	}
	#hero-section-bottom {
		height: 199px;
	}
`)}
`
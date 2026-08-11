import { css } from "lit";

export const imageGeneratorStyles = css`
	:host {
		--loader-size: 1.8em;
		--form-label-size: var(--body-font-size, 16px);
		--form-label-weight: var(--font-bold, 700);
		--divider-color: #e2e4ea;
	}

	* {
		box-sizing: border-box;
	}

	h1 {
		font-size: clamp(2rem, 4vw, var(--header-font-size, 36px));
		line-height: 1.15;
		letter-spacing: -0.015em;
		margin: 0;
	}

	p {
		font-size: var(--body-font-size, 16px);
	}

	#image-generator-card {
		background: var(--primary-background-color, #ffffff);
		border-radius: var(--card-border-radius, 10px);
		margin: 0 auto;
		max-width: 1080px;
		padding: clamp(24px, 4vw, 48px);
		width: 100%;
	}

	.page-intro {
		border-bottom: 1px solid var(--divider-color);
		padding-bottom: 24px;
	}

	.page-intro p {
		color: var(--secondary-font-color);
		font-size: var(--body-font-size, 16px);
		margin: 8px 0 0;
		max-width: 680px;
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 24px;
		margin-top: 28px;
	}

	.form-grid {
		display: grid;
		gap: 32px;
		grid-template-columns: minmax(0, 2fr) minmax(240px, 1fr);
	}

	.form-left {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.form-right {
		border-left: 1px solid var(--divider-color);
		padding-left: 32px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
	}

	.form-label {
		color: var(--font-color);
		font-size: var(--form-label-size);
		font-weight: var(--form-label-weight);
		line-height: 1.35;
	}

	.form-help {
		color: var(--secondary-font-color);
		line-height: 1.45;
		margin: 4px 0 12px;
	}

	.form-bottom {
		border-top: 1px solid var(--divider-color);
		padding-top: 24px;
	}

	wa-button::part(base) {
		min-height: 44px;
	}

	#submit wa-button::part(base) {
		background-color: var(--primary-color);
		border-color: var(--primary-color);
	}

	.background {
		background-color: var(--primary-color);
		color: var(--font-color);
	}

	.main {
		min-height: calc(100vh - 72px);
		padding: clamp(16px, 4vw, 40px);
	}

	.platform-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	wa-radio-group#colorOption::part(form-control-label) {
		font-size: var(--form-label-size);
		font-weight: var(--form-label-weight);
		color: var(--font-color);
	}

	wa-number-input#padding::part(form-control-label) {
		font-size: var(--form-label-size);
		font-weight: var(--form-label-weight);
		color: var(--font-color);
	}

	wa-number-input#padding::part(hint) {
		font-size: var(--body-font-size, 16px);
		font-weight: normal;
		color: var(--secondary-font-color);
	}

	#padding {
		max-width: 360px;
		width: 100%;
	}

	wa-radio,
	wa-checkbox::part(base) {
		align-items: center;
	}

	wa-radio::part(label),
	wa-checkbox::part(label) {
		font-size: var(--body-font-size, 16px);
	}

	.custom-color-block {
		align-items: center;
		display: flex;
		gap: 12px;
		margin-top: 12px;
	}

	.custom-color-block label {
		font-size: var(--body-font-size, 16px);
		font-weight: var(--form-label-weight);
	}

	.custom-color-block input {
		height: 44px;
		width: 56px;
	}

	@media (max-width: 760px) {
		.form-grid {
			grid-template-columns: 1fr;
		}

		.form-right {
			border-left: 0;
			border-top: 1px solid var(--divider-color);
			padding-left: 0;
			padding-top: 24px;
		}
	}

	@media (max-width: 480px) {
		#image-generator-card {
			border-radius: 8px;
			padding: 24px 20px;
		}

		.main {
			padding: 12px;
		}
	}
`;

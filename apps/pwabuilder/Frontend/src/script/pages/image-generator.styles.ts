import { css } from "lit";

export const imageGeneratorStyles = css`
	:host {
		--loader-size: 1.8em;
		--heading-font-size: var(--large-font-size, 1.5em);
		--heading-font-weight: bold;
	}

	h1 {
		font-size: var(--xlarge-font-size, 2em);
		line-height: 48px;
		letter-spacing: -0.015em;
		margin: 0;
	}

	h2 {
		font-size: var(--heading-font-size);
		font-weight: var(--heading-font-weight);
	}

	p {
		font-size: var(--font-size);
	}

	#image-generator-card {
		background: #ffffff;
		padding: 16px;
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.form-left {
		display: flex;
		flex-direction: column;
		gap: 24px;
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
		padding: 32px;
	}

	.color-radio, .platform-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.color-section, .padding-section, .image-section, .platforms-section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	wa-radio-group#colorOption::part(form-control-label) {
		font-size: var(--heading-font-size);
		font-weight: var(--heading-font-weight);
		color: var(--font-color);
	}

	wa-number-input#padding::part(form-control-label) {
		font-size: var(--heading-font-size);
		font-weight: var(--heading-font-weight);
		color: var(--font-color);
	}

	wa-number-input#padding::part(hint) {
		font-size: var(--font-size);
		font-weight: normal;
		color: var(--font-color);
	}

	#padding {
		width: 30%;
		min-width: 220px;
	}
`;

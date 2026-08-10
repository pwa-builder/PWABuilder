import { css } from "lit";

export const imageGeneratorStyles = css`
	:host {
		--loader-size: 1.8em;
		--wa-input-height-medium: 1.5rem;
	}

	h1 {
		font-size: var(--xlarge-font-size);
		line-height: 48px;
		letter-spacing: -0.015em;
		margin: 0;
	}

	h2 {
		font-size: var(--large-font-size);
	}

	p {
		font-size: var(--font-size);
	}

	wa-button {
		height: 24px;
		padding: 8px 0;
	}

	wa-button::part(base) {
		margin: 0 16px;
	}

	#image-generator-card {
		background: #ffffff;
		padding: 16px;
	}

	#submit {
		margin-top: 8px;
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

	wa-radio-group#colorOption {
		margin-top: 8px;
	}

	wa-radio-group#colorOption::part(form-control-label) {
		font-size: var(--large-font-size);
		font-weight: bold;
		color: var(--font-color);
	}

	#padding {
		width: 30%;
	}
`;

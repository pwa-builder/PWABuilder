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

	small {
		display: block;
		font-size: 10px;
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

	input[type="number"] {
		width: 30%;
		font-size: 22px;
	}

	small {
		margin-top: 10px;
	}

	.color-radio, .platform-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.color-radio >*, .platform-list >* {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	input[type="radio"] {
		border: 0px;
		width: 22px;
		height: 22px;
		margin: 0;
		accent-color: var(--primary-color);
	}

	input[type="radio"]:hover {
		cursor: pointer;
	}

	input[type="checkbox"] {
		border: 0px;
		width: 22px;
		height: 22px;
		margin: 0;
		accent-color: var(--primary-color);
	}

	input[type="checkbox"]:hover {
		cursor: pointer;
	}
`;

import { css } from "lit";

export const todoListItemStyles = css`
	:host {
		display: block;
		width: 100%;
		font-size: 16px;
	}

	wa-details::part(header) {
		padding: var(--wa-space-xs);
		background-color: #f1f1f1;
	}

	wa-details::part(header):focus-visible {
		outline: 2px solid var(--primary-color);
		outline-offset: 2px;
	}

	.summary {
		display: flex;
		align-items: center;
		gap: var(--wa-space-xs);
		font-family: var(--body-font);
	}

	.status-icon {
		height: 16px;
		width: 16px;
		margin-top: -2px;
	}

	.error {
		white-space: pre-line;
	}

	.footer {
		display: flex;
		gap: var(--wa-space-m);
		wa-button {
			font-size: 1em;
		}

		wa-button::part(label) {
			padding: 0;
		}
	}
`;
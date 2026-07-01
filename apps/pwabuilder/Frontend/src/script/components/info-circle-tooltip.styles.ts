import { css } from "lit";

export const infoCircleTooltipStyles = css`
	.holder {
		display: flex;
		height: fit-content;
	}

	.info-circle-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		/* Spacing from the preceding label lives on the button (not the inner image)
           so the button's box stays square and the focus ring renders as a circle. */
		margin: 0 0 0 6px;
		display: flex;
		align-items: center;
	}

	.info-circle-btn:focus-visible {
		outline: 2px solid var(--primary-color, #4f3fb6);
		outline-offset: 2px;
		border-radius: 50%;
	}

	.info-circle-img {
		height: 16px;
		width: 16px;
		border-radius: 50%;
		padding: 4px;
	}
`;

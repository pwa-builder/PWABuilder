import { css } from "lit";

export const arrowLinkStyles = css`
	.arrow_anchor {
		font-size: var(--arrow-link-font-size);
		font-weight: bold;
		margin: 0px 0.5em 0px 0px;
		line-height: 1em;
		color: var(--primary-color);
		display: flex;
		column-gap: 10px;
		width: fit-content;
		text-decoration: none;
	}

	.arrow_anchor p {
		margin: 0;
		border-bottom: 1px solid #4f3fb6;
	}

	.arrow_anchor:visited {
		color: var(--primary-color);
	}

	.arrow_anchor:hover {
		cursor: pointer;
	}

	.arrow_anchor:focus-visible {
		outline: 2px solid #000000;
		outline-offset: 2px;
	}

	.arrow_anchor:hover img {
		animation: bounce 1s;
	}

	@keyframes bounce {
		0%,
		20%,
		50%,
		80%,
		100% {
			transform: translateY(0);
		}

		40% {
			transform: translateX(-5px);
		}

		60% {
			transform: translateX(5px);
		}
	}
`;
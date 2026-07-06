import { css } from "lit";
import {
  smallBreakPoint,
  mediumBreakPoint
} from '../utils/css/breakpoints';

export const communityCardStyles = css`
	.community-card {
		width: max-content;
		max-width: 480px;
		height: max-content;
		color: var(--font-color);
		display: flex;
		align-items: flex-start;
		column-gap: 1.5em;
		padding: .5em;
		padding-left: 0;
	}

	.community-card-content {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-start;
	}

	.community-card img {
		width: 3em;
		height: auto;
	}

	.community-card-content h3 {
		margin: 0;
		font-size: var(--subheader-font-size);
		font-weight: var(--font-bold);
	}

	.community-card-content p {
		font-size:  var(--body-font-size);
		margin-top: 0;
		margin-bottom: .25em;
	}

	.community-card-actions {
		color: var(--primary-color);
		fill: var(--primary-color);
		display: flex;
		align-items: center;
		justify-content: flex-start;
		column-gap: 1.5em;
	}

	.community-card-actions a {
		color: var(--primary-color);;
		font-size: var(--arrow-link-font-size);
		font-weight: bold;
		margin-right: .5em;
		width: 100%;
		border-bottom: 1px solid rgb(79, 63, 182);
		text-decoration: none;
		line-height: 14px;
	}

	.card-link-box {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		width: max-content;
	}

	.community-card-image img {
		width: 50px;
		height: auto;
	}

	.community-card-actions a:hover {
		cursor: pointer;
	}

	.community-card-actions a:visited {
		color:  var(--primary-color);;
	}

	.card-link-box img {
		width: .5em;
		height: auto;
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

	.card-link-box:hover img {
		animation: bounce 1s;
	}

	/* < 480px */
	${smallBreakPoint(css`
			.community-card {
				width: 100%;
			}

			.community-card-actions {
				flex-direction: column;
				align-items: flex-start;
				row-gap: .5em;
			}

			.community-card-image img {
				width: 35px;
				height: auto;
			}

			.community-card-content p {
				font-size: 16px;
			}
	`)}

	/* 480px - 639px */
	${mediumBreakPoint(css`
			.community-card {
				width: 100%;
			}
	`)}
`;
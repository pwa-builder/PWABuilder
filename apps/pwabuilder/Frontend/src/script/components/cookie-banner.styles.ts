import { css } from "lit";
import { smallBreakPoint } from '../utils/css/breakpoints';

export const cookieBannerStyles = css`
	#cookie-banner {
		background: rgb(243, 243, 243);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px;
		font-weight: 700;
		font-size: var(--footer-font-size);
		position: fixed;
		bottom: 0;
		z-index: 2;
		width: 100%;
		box-sizing: border-box;
	}

	#cookie-info {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-start;
	}

	#cookie-info p {
		margin: 0;
	}

	#cookie-actions {
		display: flex;
		align-items: center;
		justify-content: space-evenly;
	}

	#cookie-actions button {
		border-radius: var(--button-border-radius);
		border: none;
		padding: 8px;
		font-weight: bold;
		padding-left: 10px;
		padding-right: 10px;
		margin-left: 10px;
		width: fit-content;
	}

	#cookie-actions button:hover {
		cursor: pointer;
	}

	#cookie-actions #reject-button {
		background: #ffffff;
		color: var(--font-color);
	}

	#cookie-actions #accept-button {
		background: var(--font-color);
		color: white;
	}

	${smallBreakPoint(css`
			#cookie-banner {
				flex-direction: column;
				text-align: center;
			}

			#cookie-info{
				align-items: center;
				justify-content: center;
				text-align: center;
				margin-bottom: 10px;
			}

			#cookie-actions {
				flex-direction: column;
				align-items: center;
				justify-content: center;
				row-gap: 5px;
			}
	`)}
`;
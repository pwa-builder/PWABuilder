import { css } from "lit";
import {
    smallBreakPoint,
} from '../utils/css/breakpoints';

export const manifestInfoCardStyles = css`
	.mic-wrapper {
		display: flex;
		flex-direction: column;
	}

	.info-box {
		background-color: var(--font-color);
		width: 340px;
		color: #ffffff;
		padding: 10px;
		border-radius: 0;
		border-top-left-radius: var(--card-border-radius);
		border-top-right-radius: var(--card-border-radius);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 10px;
	}

	.info-box p {
		margin: 0;
		font-size: 16px;
		font-family: var(--font-family);
	}

	.right {
		background-color: transparent;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.right:hover {
		cursor: pointer;
	}

	.image-section {
		background: linear-gradient(93.16deg, #EAECF4 16%, #CED0EC 87.75%);
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.image-section img {
		padding: 10px 20px;
		max-width: 300px;
		max-height: 400px;
		height: auto;
	}

	.mic-actions {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		width: 100%;
		margin: 5px 0;
	}

	.learn-more {
		line-height: 17px;
		display: block;
		width: 100%;
	}

	.learn-more:visited, .learn-more:active, .learn-more:link {
		color: #ffffff;
	}

	.eim {
		background-color: transparent;
		border: none;
		color: #ffffff;
		padding: 0;
		text-decoration: underline;
		height: 25px;
		display: flex;
		align-items: center;
		font-weight: 700;
		font-size: 14px;
		font-family: var(--font-family);
	}

	.eim:hover {
		cursor: pointer;
	}

	.info-actions {
		background-color: var(--font-color);
		border: none;
		padding: 10px;
		padding-top: 0;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		width: 100%;
		gap: 15px;
		margin: 0;
		border-radius: 0;
		border-bottom-left-radius: var(--card-border-radius);
		border-bottom-right-radius: var(--card-border-radius);
	}

	wa-dropdown-item {
		border: 1px solid transparent;
	}

	wa-dropdown-item::part(checkmark), wa-dropdown-item::part(submenu-icon) {
		display: none;
	}

	wa-dropdown-item::part(label){
		color: #ffffff;
		font-size: var(--card-body-font-size);
		font-weight: bold;
		font-family: var(--font-family);
		padding: 0;
		text-decoration: underline;
	}

	wa-dropdown-item:hover, wa-dropdown-item::part(label) {
		background-color: unset;
	}

	wa-dropdown-item:focus {
		border: 1px solid #ffffff;
	}

	/* < 480px */
	${smallBreakPoint(css`
			.info-box{
				width: 240px;
			}

			.image-section img {
				width: 200px;
			}
	`)}
`;

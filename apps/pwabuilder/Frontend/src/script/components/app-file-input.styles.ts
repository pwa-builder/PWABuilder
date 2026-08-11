import { css } from "lit";
import { hidden } from '../utils/css/hidden';
import { fastButtonCss } from '../utils/css/fast-elements';

export const appFileInputStyles = css`
	[appearance='lightweight'] {
		box-shadow: none;
	}

	:hover {
		background-color: transparent;
	}

	wa-button::part(base) {
		min-height: 44px;
	}

	${hidden}

	${fastButtonCss}
`;

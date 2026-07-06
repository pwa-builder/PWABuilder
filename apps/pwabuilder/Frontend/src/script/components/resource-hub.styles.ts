import { css } from "lit";
import {
  smallBreakPoint,
  mediumBreakPoint,
  largeBreakPoint,
  xLargeBreakPoint,
  xxxLargeBreakPoint,
} from '../utils/css/breakpoints';
export const resourceHubStyles = css`
	#hub-panel {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-image: url(/assets/new/OtterBackgroundPWA1920.jpg);
		background-repeat: no-repeat;
		background-size: cover;
		padding: 2em;
	}

	#hub-panel h2 {
		color: #ffffff;
		margin: 0;
		margin-bottom: 1em;
		font-weight: bold;
		font-size: var(--header-font-size);
		text-align: center;
	}

	#cards {
		width: 100%;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		column-gap: 1em;
	}

	/* < 480px */
	${smallBreakPoint(css`
			#hub-panel{
				background-image: url(/assets/new/BackgroundPWA320.png);
				padding: 2em 1em;
			}

			#cards {
				flex-direction: column;
				row-gap: 1em;
				align-items: center;
				justify-content: center;
			}
	`)}

	/* 480px - 639px */
	${mediumBreakPoint(css`
			#hub-panel{
				background-image: url(/assets/new/BackgroundPWA480.png);
				padding: 2em 4em;
			}

			#cards {
				flex-direction: column;
				row-gap: 1em;
				align-items: center;
				justify-content: center;
			}
	`)}

	/* 640px - 1023px */
	${largeBreakPoint(css`
			#hub-panel{
				background-image: url(/assets/new/OtterBackgroundPWA1024.jpg);
				background-position: center center;
				padding: 3.25em;
			}
	`)}

	/*1024px - 1365px*/
	${xLargeBreakPoint(css`
			#hub-panel {
				background: url(/assets/new/OtterBackgroundPWA1366.jpg);
				background-position: center center;
				background-size: cover;
				background-repeat: no-repeat;
			}
	`)}

	/* > 1920 */
	${xxxLargeBreakPoint(css`
			#hub-panel{
				background-image: url(/assets/new/OtterBackgroundPWA1920.jpg);
				background-repeat: no-repeat;
				background-size: cover;
				padding: 3em;
			}
	`)}
`;
import { css } from "lit";
import {
    xxxLargeBreakPoint,
    xxLargeBreakPoint,
    xLargeBreakPoint,
    largeBreakPoint,
    mediumBreakPoint,
    smallBreakPoint,
    xSmallBreakPoint,
} from '../utils/css/breakpoints';

export const appHeaderStyles = css`
	:host {
		--header-background: white;
		--header-border: rgba(0, 0, 0, 0.25) solid 1px;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-left: 16px;
		padding-right: 16px;
		background: var(--header-background);
		color: white;
		height: 71px;
		border-bottom: var(--header-border);
		z-index: 1;
	}

	header img {
		cursor: pointer;
		width: 100px;
		height: auto;
	}

	nav {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		width: 8em;
		gap: .75em;
	}

	.nav_button {
		all: unset;
	}

	.nav_link {
		color: var(--font-color);
		text-decoration: none;
		border-bottom: none;
		font-weight: var(--font-bold);
		font-size: var(--subheader-font-size);
		margin: 0;
	}

	.nav_link:focus {
		outline: solid;
		outline-width: 2px;
	}

	.nav_link span {
		display: inline-block;
		height: 18px;
		font-size: 20px;
	}

	.nav_link:hover span{
		cursor: pointer;
	}

	nav wa-icon {
		font-size: 1.15em;
	}

	.nav_link:visited {
		color: black;
	}

	.link {
		display: block;
		width: 100%;
		text-decoration: none;
	}

	.link:visited, .link:active, .link:link {
		color: #777777;
	}

	.hover-color:hover {
		color: var(--primary-color);
	}

	wa-dropdown::part(menu) {
		display: flex;
		flex-direction: column;
		background-color: white;
		font-size: 16px;
	}

	wa-dropdown-item::part(checkmark), wa-dropdown-item::part(submenu-icon) {
		display: none;
	}

	wa-dropdown-item::part(label) {
		text-decoration: none;
		border-bottom: none;
		font-size: 14px;
		margin: 0;
		padding: 0;
	}

	wa-dropdown-item:focus-visible, wa-dropdown-item:hover {
		background-color: transparent;
		outline: none;
	}

	wa-dropdown-item:focus-visible::part(label), wa-dropdown-item:hover::part(label) {
		color: var(--primary-color);
		background-color: transparent;
	}

	wa-dropdown-item:focus-visible .link, wa-dropdown-item:hover .link {
		color: var(--primary-color);
		background-color: transparent;
	}

	wa-dropdown {
		position: relative;
	}

	wa-dropdown::part(base){
		box-shadow: 0px 16px 24px 0px #00000026;
	}

	.col-header {
		text-decoration: none;
		margin: 0;
		white-space: nowrap;
		font-weight: bold;
		color: #777777;
		padding: 0;
		font-size: 14px;
	}

	@media (prefers-color-scheme: light) {
		header {
			color: black;
		}
	}

	${xSmallBreakPoint(css`
			header {
				padding-left: 8px;
				padding-right: 8px;
			}

			header img {
				width: 60px;
			}

			nav {
				width: auto;
				gap: 0.5em;
			}

			.nav_link span {
				font-size: 16px;
			}
	`)}

	${smallBreakPoint(css`
	`)}

	${mediumBreakPoint(css`
			header nav {
				display: initial;
			}

			#desktop-nav {
				display: flex;
			}
	`)}

	${largeBreakPoint(css`
			#desktop-nav {
				display: flex;
			}
	`)}

	${xLargeBreakPoint(css`
			header {
				padding-left: 1em;
				padding-right: 1em;
			}
	`)}

	${xxLargeBreakPoint(css`
			header {
				padding-left: 3em;
				padding-right: 3em;
			}
	`)}

	${xxxLargeBreakPoint(css`
			header {
				background-color: white;
			}
	`)}
`;

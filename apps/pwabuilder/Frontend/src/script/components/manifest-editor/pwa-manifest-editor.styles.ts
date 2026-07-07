import { css } from "lit";

export const pwaManifestEditorStyles = css`
	wa-tab::part(base) {
		--wa-font-size-s: 14px;
		--wa-space-m: .75rem;
		--wa-space-l: 1rem;
		position: relative;
	}

	.error-indicator {
		position: absolute;
		right: 1.25em;
	}

	wa-tab-group {
		--indicator-color: #4F3FB6;
	}

	wa-tab::part(base):hover {
		color: #4F3FB6;
	}

	wa-tab::part(base):focus-visible{
		color: #4F3FB6;
		outline: 1px solid black;
	}

	wa-tab[active]::part(base) {
		color: #4F3FB6;
		font-weight: bold;
	}

	wa-tab-panel::part(base){
		overflow-y: auto;
		overflow-x: hidden;
		/* height: 500px; */
		padding: 1em .5em .5em .5em;
	}

	@media(max-width: 765px){
	}

	@media(max-width: 600px){
	}

	@media(max-width: 480px){
		wa-tab::part(base) {
			--wa-font-size-s: 12px;
			--wa-space-m: .5rem;
			--wa-space-l: .75em;
		}
	}
`;

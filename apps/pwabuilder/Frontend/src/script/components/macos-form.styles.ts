import { css } from "lit";

export const macosFormStyles = css`
	#macos-options-form {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.basic-settings, .adv-settings {
		display: flex;
		flex-direction: column;
		gap: .75em;
	}

	#form-layout {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
	}

	wa-details {
		margin-top: 1em;
	}

	wa-details::part(base){
		border: none;
	}

	wa-details::part(summary-icon){
		display: none;
	}

	wa-details::part(header){
		padding: 0 10px;
	}

	.details-summary {
		display: flex;
		align-items: center;
		width: 100%;
	}
`;

import { css } from "lit";

export const iosFormStyles = css`
	#ios-options-form {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.flipper-button {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.form-generate-button {
		width: 135px;
		height: 40px;
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

	.dropdown_icon {
		transform: rotate(0deg);
		transition: transform .5s;
		height: 30px;
	}

	wa-details::part(header){
		padding: 0 10px;
	}

	.details-summary {
		display: flex;
		align-items: center;
		width: 100%;
	}

	.details-summary p {
		margin: 0;
		font-size: 18px;
		font-weight: bold;
	}
`;

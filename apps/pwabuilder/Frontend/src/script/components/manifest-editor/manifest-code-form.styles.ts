import { css } from "lit";

export const manifestCodeFormStyles = css`
	#code-holder {
		position: relative;
		max-width: 700px;
	}

	#code-editor {
		overflow-x: scroll;
		margin: 0;
		background-color: #f6f8fa;
		padding: 5px;
		padding-top: 0;
		font-size: 16px;
	}

	#copy-manifest {
		position: absolute;
		top: 5px;
		right: 5px;
		display: flex;
		align-items: center;
	}

	#copy-manifest:hover {
		cursor: pointer;
	}
`;

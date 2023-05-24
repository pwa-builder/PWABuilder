export const widgetsSchema = {
	widgets: {
	  type: "array",
	  items: [
		{
		  properties: {
			name: {
			  type: "string",
			},
			description: {
			  type: "string",
			},
			tag: {
			  type: "string",
			},
			template: {
			  type: "string",
			},
			ms_ac_template: {
			  type: "string",
			},
			data: {
			  type: "string",
			},
			type: {
			  type: "string",
			},
			screenshots: {
			  type: "array",
			  properties: {
				items: {
				  src: {
					type: "string",
				  },
				  sizes: {
					type: "string",
				  },
				  label: {
					type: "string",
				  },
				},
				required: ["src", "sizes", "label"],
			  },
			},
			icons: {
			  type: "array",
			  properties: {
				items: {
				  src: {
					type: "string",
				  },
				  sizes: {
					type: "string",
				  },
				},
				required: ["src", "sizes"],
			  },
			},
			auth: {
			  type: "boolean",
			},
			update: {
			  type: "number",
			},
		  },
		  required: [
			"name",
			"description",
			"screenshots",
			"tag",
			"ms_ac_template",
		  ],
		},
	  ],
	},
  };
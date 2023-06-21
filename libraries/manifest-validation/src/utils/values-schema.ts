// create schemas from example-json here https://www.liquid-technologies.com/online-json-to-schema-converter

export const widgetsSchema = {
	type: "array",
	minItems: 1,
	items: {
		type: "object",
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
			minItems: 1,
			items: {
				type: "object",
				properties: {
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
			  }
		  },
		  icons: {
			type: "array",
			minItems: 1,
			items: {
				type: "object",
				properties: {
				  src: {
					type: "string",
				  },
				  sizes: {
					type: "string",
				  },
				},
				required: ["src", "sizes"],
			  }
		  },
		  auth: {
			type: "boolean",
		  },
		  update: {
			type: "number",
		  },
		},
		required: ["name", "description", "screenshots", "tag", "ms_ac_template"],
	  }
};

export const fileHandlersSchema = {
	type: "array",
	minItems: 1,
	items: {
		type: "object",
		properties: {
		  action: {
			type: "string",
		  },
		  accept: {
			type: "object",
			minProperties: 1,
			patternProperties: {
			  ".*": {
				type: "array",
				minItems: 1,
				items:
				  {
					type: "string",
				  }
			  },
			},
		  },
		},
		required: ["action", "accept"],
	  }
};  
  
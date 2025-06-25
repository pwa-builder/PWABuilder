using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Schema;

namespace PWABuilder.Validations.Schema
{
    public class WidgetsSchema
    {
		private static readonly string Schema = @"{
			'type': 'array',
			'minItems': 1,
			'items': {
				'type': 'object',
				'properties': {
				  'name': {
					'type': 'string',
				  },
				  'description': {
					'type': 'string',
				  },
				  'tag': {
					'type': 'string',
				  },
				  'template': {
					'type': 'string',
				  },
				  'ms_ac_template': {
					'type': 'string',
				  },
				  'data': {
					'type': 'string',
				  },
				  'type': {
					'type': 'string',
				  },
				  'screenshots': {
					'type': 'array',
					'minItems': 1,
					'items': {
						'type': 'object',
						'properties': {
						  'src': {
							'type': 'string',
						  },
						  'sizes': {
							'type': 'string',
						  },
						  'label': {
							'type': 'string',
						  },
						},
						'required': ['src', 'sizes', 'label'],
					  }
				  },
				  'icons': {
					'type': 'array',
					minItems: 1,
					items: {
						type: 'object',
						properties: {
						  src: {
							type: 'string',
						  },
						  sizes: {
							type: 'string',
						  },
						},
						required: ['src', 'sizes'],
					  }
				  },
				  'auth': {
					type: 'boolean',
				  },
				  'update': {
					'type': 'number',
				  },
				},
				'required': ['name', 'description', 'screenshots', 'tag', 'ms_ac_template'],
			  }
		}";

        public static bool ValidateWidgetSchema(string jObject)
        {
            var jSchema = JSchema.Parse(Schema);
            return JObject.Parse(jObject).IsValid(jSchema);
        }
    }
}

using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Schema;

namespace PWABuilder.Validations.Schema
{
    public class WidgetsSchema
    {
        private static readonly string Schema =
            @"{
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

        // The `widgets` member of the manifest is a JSON array, so we parse it as
        // a JToken (which accepts both arrays and objects). The previous
        // implementation called JObject.Parse, which throws for arrays with
        // "Error reading JObject from JsonReader. Current JsonReader item is not
        // an object: StartArray." That exception bubbled up to
        // ManifestAnalyzer.AnalyzeAsync's try/catch and marked the Widgets
        // capability as Skipped for every PWA that declared a valid widgets
        // array, making the Widgets check unpassable.
        public static bool ValidateWidgetSchema(string widgetsJson)
        {
            var schema = JSchema.Parse(Schema);
            return JToken.Parse(widgetsJson).IsValid(schema);
        }
    }
}

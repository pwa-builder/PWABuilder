using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Schema;

namespace PWABuilder.Validations.Schema
{
    public class FileHandlerSchema
    {
        private static readonly string Schema = @"{
			'type': 'array',
			'minItems': 1,
			'items': {
				'type': 'object',
				'properties': {
				  'action': {
					'type': 'string',
				  },
				  'accept': {
					'type': 'object',
					'minProperties': 1,
					'patternProperties': {
					  '.*': {
						'type': 'array',
						'minItems': 1,
						'items':
						  {
							'type': 'string',
						  }
					  },
					},
				  },
				},
				'required': ['action', 'accept'],
			  }
		}";

		public static bool ValidateFileHandlerSchema(string jObject)
		{
			var jSchema = JSchema.Parse(Schema);
			return JObject.Parse(jObject).IsValid(jSchema);
		}
    }
}

using PWABuilder.Models;

namespace PWABuilder.Utils
{
    public static class RequestUtils
    {
        public static OutputStatus CheckParams(HttpRequest req, IEnumerable<string> requiredParams)
        {
            var output = new OutputStatus { Status = 200 };

            foreach (var param in requiredParams)
            {
                if (string.IsNullOrWhiteSpace(req.Query[param]))
                {
                    output.Status = 400;
                    var err = new Exception($"Exception - no '{param}' param");
                    output.Body = new OutputBody
                    {
                        Error = new OutputError { Object = err.ToString(), Message = err.Message },
                    };
                    break;
                }
            }

            return output;
        }

        public static OutputStatus CreateStatusCodeOKResult(object data)
        {
            var output = new OutputStatus
            {
                Status = 200,
                Body = new OutputBody { Data = data },
            };

            return output;
        }

        public static OutputStatus CreateStatusCodeErrorResult(
            int status,
            string errorObject,
            string errorMessage
        )
        {
            return new OutputStatus
            {
                Status = status,
                Body = new OutputBody
                {
                    Error = new OutputError { Object = errorObject, Message = errorMessage },
                },
            };
        }
    }
}

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PWABuilder.Models;
using System.Collections.Generic;

namespace PWABuilder.Utils
{
    public static class RequestUtils
    {
        public static OutputStatus CheckParams(HttpRequest req, IEnumerable<string> requiredParams)
        {
            var output = new OutputStatus
            {
                Status = 200
            };

            foreach (var param in requiredParams)
            {
                if (string.IsNullOrWhiteSpace(req.Query[param]))
                {
                    output.Status = 400;
                    var err = new System.Exception($"Exception - no '{param}' param");
                    output.Body = new OutputBody
                    {
                        Error = new OutputError
                        {
                            Object = err.ToString(),
                            Message = err.Message
                        }
                    };
                    break;
                }
            }

            return output;
        }
    }
}
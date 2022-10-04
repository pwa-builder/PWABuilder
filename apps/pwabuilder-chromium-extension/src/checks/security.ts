import { api } from "../endpoints";
import { TestResult } from "../interfaces/manifest";
import { SecurityDataResults } from "../interfaces/validation";

const default_results = [
  {
    result: false,
    infoString: "Uses HTTPS",
    category: "required",
  },
  {
    result: false,
    infoString: "Has a valid SSL certificate",
    category: "required",
  },
  {
    result: false,
    infoString: "No mixed content on page",
    category: "required",
  },
];

export async function testSecurity(url: string): Promise<Array<TestResult>> {
  // We've witnessed this call take a very long time. We're going to time-box it to 20s.
  const twentySecondTimeout = new Promise<void>((resolve) =>
    setTimeout(() => resolve(), 20000)
  );

  const encodedUrl = encodeURIComponent(url);
  const securityUrl = `${api}/Security?site=${encodedUrl}`;
  const fetchResult = fetch(securityUrl);

  const fetchResultOrTimeout: void | Response = await Promise.race([
    twentySecondTimeout,
    fetchResult,
  ]);

  if (!fetchResultOrTimeout) {
    console.warn("Security check timed out after 20 seconds.");
    return default_results;
  }

  if (!fetchResultOrTimeout.ok) {
    console.warn(
      "Security check failed with non-successful status code",
      fetchResultOrTimeout.status,
      fetchResultOrTimeout.statusText
    );
    return default_results;
  }

  // we have made it through, yay!
  const results: { data: SecurityDataResults } =
    await fetchResultOrTimeout.json();
  console.info("Security detection completed successfully", results);

  const organizedResults = [
    {
      result: results.data.isHTTPS,
      infoString: "Uses HTTPS",
      category: "required",
    },
    {
      result: results.data.valid,
      infoString: "Has a valid SSL certificate",
      category: "required",
    },
    {
      result: results.data.validProtocol,
      infoString: "No mixed content on page",
      category: "required",
    },
  ];

  return organizedResults;
}

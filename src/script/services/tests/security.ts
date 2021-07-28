import { SecurityDataResults, TestResult } from '../../utils/interfaces';
import { env } from '../../utils/environment';
import { default_timeout } from '../../utils/api';

export const default_results = [
  {
    result: false,
    infoString: "Uses HTTPS",
    category: "required"
  },
  {
    result: false,
    infoString: "Has a valid SSL certificate",
    category: "required"
  },
  {
    result: false,
    infoString: "No mixed content on page",
    category: "required"
  }
];

export async function testSecurity(url: string): Promise<Array<TestResult>> {
  // We've witnessed this call take a very long time. We're going to time-box it to 20s.
  const twentySecondTimeout = new Promise<void>(resolve =>
    setTimeout(() => resolve(), default_timeout)
  );

  const encodedUrl = encodeURIComponent(url);
  const securityUrl = `${env.api}/Security?site=${encodedUrl}`;
  const fetchResult = fetch(securityUrl);

  const fetchResultOrTimeout: void | Response = await Promise.race([
    twentySecondTimeout,
    fetchResult,
  ]);

  if (!fetchResultOrTimeout) {
    console.warn('Offline check timed out after 20 seconds.');
    return default_results;
  }

  if (fetchResultOrTimeout && !fetchResultOrTimeout.ok) {
    throw new Error(
      'Error fetching security report: ' + await fetchResultOrTimeout.statusText
    );
  }

  // we have made it through, yay!
  const results: SecurityDataResults = await fetchResultOrTimeout.json();
  console.info('Security detection completed successfully', results);

  const organizedResults = [
    {
      result: results.data.isHTTPS,
      infoString: "Uses HTTPS",
      category: "required"
    },
    {
      result: results.data.valid,
      infoString: "Has a valid SSL certificate",
      category: "required"
    },
    {
      result: results.data.validProtocol,
      infoString: "No mixed content on page",
      category: "required"
    }
  ];

  return organizedResults;
}

import { SecurityDataResults, TestResult } from '../../utils/interfaces';
import { env } from '../../utils/environment';

export async function testSecurity(url: string): Promise<Array<TestResult>> {
  const encodedUrl = encodeURIComponent(url);
  const securityUrl = `${env.testAPIUrl}/Security?site=${encodedUrl}`;
  const fetchResult = await fetch(securityUrl);
  if (!fetchResult.ok) {
    throw new Error(
      'Error fetching security report: ' + fetchResult.statusText
    );
  }
  const results: SecurityDataResults = await fetchResult.json();
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

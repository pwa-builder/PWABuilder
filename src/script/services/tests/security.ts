import { SecurityDataResults } from '../../utils/interfaces';
import { env } from '../../utils/environment';

export async function testSecurity(url: string): Promise<SecurityDataResults> {
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
  return results;
}

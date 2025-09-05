/**
 * URL sanitization utilities to prevent SSRF attacks
 */

/**
 * Validates that a URL is safe to fetch by checking for:
 * - Valid URL format
 * - Only HTTP/HTTPS protocols
 * - No localhost or private IP addresses
 * @param url The URL string to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateUrl(url: string): { isValid: boolean; error?: string } {
  // Parse the URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch (parseError) {
    return { isValid: false, error: 'Invalid URL' };
  }

  // Only support http and https
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return { isValid: false, error: 'Only HTTP/HTTPS URLs are allowed' };
  }

  // Block localhost and private/internal address ranges
  const forbiddenHostnames = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '::1',
    '[::1]'
  ];
  const hostname = parsedUrl.hostname.toLowerCase();
  if (forbiddenHostnames.includes(hostname)) {
    return { isValid: false, error: 'Access to localhost is forbidden' };
  }

  // If hostname looks like an IP, check if it's private
  if (isIPAddress(hostname) && isPrivateIp(hostname)) {
    return { isValid: false, error: 'Access to private IP ranges is forbidden' };
  }

  return { isValid: true };
}

/**
 * Simple check if a string looks like an IP address
 * @param str The string to check
 * @returns true if it looks like an IP address
 */
function isIPAddress(str: string): boolean {
  // Simple IPv4 pattern
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  // Simple IPv6 pattern (basic check)
  const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
  
  return ipv4Pattern.test(str) || ipv6Pattern.test(str);
}

/**
 * Checks if an IP address is in a private/internal range
 * @param ip The IP address to check
 * @returns true if the IP is private, false otherwise
 */
function isPrivateIp(ip: string): boolean {
  // IPv4 private ranges
  if (ip.startsWith('10.')) return true;
  if (ip.startsWith('192.168.')) return true;
  if (ip.startsWith('172.')) {
    const second = Number(ip.split('.')[1]);
    if (second >= 16 && second <= 31) return true;
  }
  if (ip === '127.0.0.1' || ip === '0.0.0.0') return true;
  
  // IPv6 private ranges
  if (ip === '::1') return true;
  if (ip.startsWith('fc') || ip.startsWith('fd')) return true; // Unique local address
  
  return false;
}

/**
 * Validates the response type parameter
 * @param type The type string to validate
 * @returns The validated type or 'text' as default
 */
export function validateResponseType(type: unknown): 'blob' | 'json' | 'text' {
  if (
    type !== null &&
    typeof type === 'string' &&
    ['blob', 'json', 'text'].includes(type)
  ) {
    return type as 'blob' | 'json' | 'text';
  }
  return 'text';
}

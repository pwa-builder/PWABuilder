export interface AdminRoute {
  pathname: string;
  apiPath: string;
  kind: 'dashboard' | 'analysis' | 'package';
}

export const callbackPath = '/admin/signin-oidc';
export const returnPathKey = 'pwabuilder.support.return-path';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return uuid.test(value);
}

export function adminRoute(pathname: string): AdminRoute | null {
  if (pathname === '/admin' || pathname === '/admin/') {
    return { pathname: '/admin', apiPath: '/api/admin', kind: 'dashboard' };
  }
  const match = /^\/admin\/(analyses|package-jobs)\/([^/]+)$/.exec(pathname);
  if (!match) {
    return null;
  }
  let id: string;
  try {
    id = decodeURIComponent(match[2]);
  } catch {
    return null;
  }
  const analysis = match[1] === 'analyses';
  if (analysis
    ? !/^analysis:[\p{L}\p{N}._:[\]-]+:[0-9]+$/u.test(id) || id.length > 256
    : !isUuid(id)) {
    return null;
  }
  const path = `/admin/${match[1]}/${encodeURIComponent(id)}`;
  return { pathname: path, apiPath: `/api${path}`, kind: analysis ? 'analysis' : 'package' };
}

export function takeReturnPath(storage: Storage): string {
  const path = storage.getItem(returnPathKey);
  storage.removeItem(returnPathKey);
  return (path && adminRoute(path)?.pathname) || '/admin';
}

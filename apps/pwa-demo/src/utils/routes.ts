export type View = 'notes' | 'about';
export type NoteTool = '' | 'sketch' | 'photo' | 'tools';

export interface AppRoute {
  view: View;
  tool: NoteTool;
}

/** Query routes always request the static host's index document. */
export function viewPath(base: string, view: View = 'notes'): string {
  return view === 'about' ? `${base}?view=about` : base;
}

export function matchRoute(url: URL, base: string): AppRoute | undefined {
  if (!url.pathname.startsWith(base)) return undefined;
  const path = url.pathname.slice(base.length);
  // Old bookmarks still work when a service worker or host serves the shell.
  // New links never rely on these paths existing on the server.
  switch (path) {
    case '':
    case 'index.html':
    case 'notes': {
      const tool = url.searchParams.get('tool');
      return {
        view: url.searchParams.get('view') === 'about' ? 'about' : 'notes',
        tool: tool === 'sketch' || tool === 'photo' || tool === 'tools' ? tool : '',
      };
    }
    case 'about': return { view: 'about', tool: '' };
    case 'sketch': return { view: 'notes', tool: 'sketch' };
    case 'capture': return { view: 'notes', tool: 'photo' };
    case 'powers': return { view: 'notes', tool: 'tools' };
    default: return undefined;
  }
}

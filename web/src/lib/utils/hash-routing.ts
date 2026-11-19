// SvelteKit hash routing reads query parameters before the routing fragment.
export const toHashRoute = (path: string) => {
  const url = new URL(path, 'https://immich.invalid');
  return `./${url.search}#${url.pathname}${url.hash}`;
};

export const routePath = (url: Pick<URL, 'hash'>) => url.hash.slice(1).split('#', 1)[0] || '/';

export const routeHref = (url: Pick<URL, 'hash' | 'search'>) => `./${url.search}#${routePath(url)}`;

export const appUrl = (path: string, base = location.href) => {
  const entry = new URL(base);
  if (!entry.pathname.endsWith('/')) {
    entry.pathname += '/';
  }
  entry.search = '';
  entry.hash = '';
  return new URL(path, entry);
};

// The official server normalizes externalDomain to an origin. Keep the active
// deployment path when generating a public URL on that configured host.
export const publicAppUrl = (path: string, externalDomain: string, current = location.href) => {
  const base = new URL(externalDomain || current);
  if (base.pathname === '/') {
    base.pathname = new URL(current).pathname;
  }
  return appUrl(path, base.href);
};

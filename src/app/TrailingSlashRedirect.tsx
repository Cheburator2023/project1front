import { useLayoutEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/** Must match `BrowserRouter` basename in production (`App.tsx`). */
export const ROUTER_BASENAME_PROD = '/sum-rm';

/**
 * Normalizes `/sum-rm/.../` → `/sum-rm/...` in the address bar. React Router’s
 * internal location is the same for `/sum-rm/foo` and `/sum-rm/foo/`, so the
 * trailing slash must be fixed using `window.location.pathname`.
 */
export function TrailingSlashRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useLayoutEffect(() => {
    if (process.env.NODE_ENV === 'development') return;

    const basename = ROUTER_BASENAME_PROD;
    const full = window.location.pathname;

    if (!full.startsWith(basename)) return;

    if (full === `${basename}/`) {
      navigate({ pathname: '/', search: location.search, hash: location.hash }, { replace: true });
      return;
    }

    const rest = full.slice(basename.length) || '/';
    if (rest.endsWith('/') && rest.length > 1) {
      const pathname = rest.replace(/\/$/, '') || '/';
      navigate({ pathname, search: location.search, hash: location.hash }, { replace: true });
    }
  }, [navigate, location.pathname, location.search, location.hash]);

  return null;
}

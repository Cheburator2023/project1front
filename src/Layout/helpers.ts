import { useLocation } from 'react-router-dom';

export const getRootPath = () => {
  const location = useLocation();

  const parsedPathname = location.pathname.split('/');

  if (parsedPathname.length > 2) {
    return `/${parsedPathname[1]}`;
  }

  return '/';
};

import { useEffect } from 'react';

const SITE_NAME = 'Layers of Time';

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  }, [title]);
}

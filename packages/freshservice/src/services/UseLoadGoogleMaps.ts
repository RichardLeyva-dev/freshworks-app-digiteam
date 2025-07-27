import { useEffect, useState } from 'react';

export const useLoadGoogleMaps = (): boolean => {
  const [loaded, setLoaded] = useState(false);

  const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
  const GOOGLE_MAPS_SRC = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;

  useEffect(() => {
    let isMounted = true;
    const markLoaded = () => {
      if (isMounted) setLoaded(true);
    };

    if ((window as any).google?.maps) {
      markLoaded();
      return () => { isMounted = false };
    }
    const scriptExists = document.querySelector<HTMLScriptElement>(
      `script[src="${GOOGLE_MAPS_SRC}"]`
    );

    if (scriptExists) {
      scriptExists.addEventListener('load', markLoaded);
      return () => {
        isMounted = false;
        scriptExists.removeEventListener('load', markLoaded);
      };
    }

    const script = document.createElement('script');
    script.src = GOOGLE_MAPS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = markLoaded;
    document.body.appendChild(script);

    return () => {
      isMounted = false;
      script.onload = null;
    };
  }, [GOOGLE_MAPS_SRC]);

  return loaded;
};

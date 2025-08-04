import React, { useEffect, useRef } from 'react';
import { useLoadGoogleMaps } from '../../services/UseLoadGoogleMaps';



const MapToggle = () => {
  const loaded = useLoadGoogleMaps();
  const mapRef = useRef<HTMLDivElement>(null);
  

  useEffect(() => {
    if (loaded && mapRef.current) {
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: -15.77972, lng: -47.92972 },
        zoom: 15,
      });

      new google.maps.Marker({
        position: { lat: -15.77972, lng: -47.92972 },
        map,
        title: 'Ubicación de prueba',
      });
    }
  }, [loaded]);

  if (!loaded) {
    return <div className="text-sm text-gray-500">Cargando mapa...</div>;
  }

  return (
    <div className="w-full h-[300px] mt-2 border border-gray-300 rounded-md overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default MapToggle;

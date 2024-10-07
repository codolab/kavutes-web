import { useEffect, useRef } from 'react';

interface MapComponentProps {
  address: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ address }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const geocoder = new google.maps.Geocoder();
    const map = new google.maps.Map(mapRef.current as HTMLElement, {
      zoom: 15,
      mapId: 'da879e1c99caa391',
    });

    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results) {
        map.setCenter(results[0].geometry.location);
        // Check if AdvancedMarkerElement is available, otherwise fallback to standard Marker
        if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
          new google.maps.marker.AdvancedMarkerElement({
            map,
            position: results[0].geometry.location,
          });
        } else {
          new google.maps.Marker({
            map,
            position: results[0].geometry.location,
          });
        }
      } else {
        console.error('Geocode was not successful for the following reason:', status);
      }
    });
  }, [address]);

  return <div ref={mapRef} style={{ width: '100%', height: '300px' }} />;
};

export default MapComponent;

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useEffect, useRef } from 'react';
import { DonationCenter } from '../../data/donationCenters';
import { Button } from '../ui/button';
import { Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix leaflet marker icon issue in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = new Icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// A component to handle programmatic map movements
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

interface CentersMapProps {
  centers: DonationCenter[];
  selectedCenterId: string | null;
  onSelectCenter: (id: string) => void;
  userLocation: [number, number] | null;
}

const typeLabels: Record<string, string> = {
  blood: 'دم',
  food: 'طعام',
  furniture: 'أثاث',
  clothes: 'ملابس',
  medicine: 'أدوية',
  money: 'مال',
  volunteer: 'تطوع',
};

export function CentersMap({ centers, selectedCenterId, onSelectCenter, userLocation }: CentersMapProps) {
  // Map center defaults to Amman
  let mapCenter: [number, number] = [31.9539, 35.9106];
  let mapZoom = 8;

  const selectedCenter = centers.find(c => c.id === selectedCenterId);
  if (selectedCenter) {
    mapCenter = [selectedCenter.lat, selectedCenter.lng];
    mapZoom = 14;
  } else if (userLocation) {
    mapCenter = userLocation;
    mapZoom = 12;
  } else if (centers.length > 0) {
    // Just center on the first one if nothing else
    mapCenter = [centers[0].lat, centers[0].lng];
    mapZoom = 9;
  }

  return (
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      className="w-full h-full rounded-2xl z-0 border border-border/50 shadow-sm"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController center={mapCenter} zoom={mapZoom} />

      {/* User Location Marker (Optional visual enhancement) */}
      {userLocation && (
        <Marker 
          position={userLocation}
          icon={new Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41]
          })}
        >
          <Popup>موقعك الحالي</Popup>
        </Marker>
      )}

      {/* Center Markers */}
      {centers.map((center) => {
        const isSelected = selectedCenterId === center.id;
        
        // Pick marker color based on centerType or acceptedTypes
        let markerColor = 'green';
        if (center.centerType === 'blood_bank' || center.acceptedTypes.includes('blood')) markerColor = 'red';
        else if (center.acceptedTypes.includes('furniture')) markerColor = 'orange';
        else if (center.acceptedTypes.includes('clothes')) markerColor = 'violet';

        const customIcon = new Icon({
          iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${markerColor}.png`,
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34]
        });

        return (
          <Marker
            key={center.id}
            position={[center.lat, center.lng]}
            icon={customIcon}
            eventHandlers={{
              click: () => onSelectCenter(center.id),
            }}
          >
            <Popup>
              <div className="text-right" dir="rtl">
                <h3 className="font-bold text-sm mb-1">{center.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{center.address}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {center.acceptedTypes.map(type => (
                    <span key={type} className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded">
                      {typeLabels[type] || type}
                    </span>
                  ))}
                </div>
                <Button 
                  size="sm" 
                  className="w-full h-8 text-xs bg-primary hover:bg-primary/90 text-white"
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`, '_blank')}
                >
                  <Navigation className="me-1 h-3 w-3" /> الاتجاهات
                </Button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

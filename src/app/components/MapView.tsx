import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MapLocation {
  id: string;
  title: string;
  lat: number;
  lng: number;
  type: 'donation' | 'request';
  address?: string;
}

interface MapViewProps {
  locations: MapLocation[];
  center?: [number, number];
  zoom?: number;
}

const SHADOW_URL = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png';
const ICON_OPTIONS = { iconSize: [25, 41] as [number, number], iconAnchor: [12, 41] as [number, number], popupAnchor: [1, -34] as [number, number], shadowSize: [41, 41] as [number, number], shadowUrl: SHADOW_URL };

const donationIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  ...ICON_OPTIONS,
});

const requestIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  ...ICON_OPTIONS,
});

export function MapView({ locations, center = [31.9522, 35.2332], zoom = 10 }: MapViewProps) {
  const validLocations = locations.filter(l => isFinite(l.lat) && isFinite(l.lng));

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="w-full h-[400px] md:h-[500px] rounded-lg z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validLocations.map((location) => (
        <Marker
          key={location.id}
          position={[location.lat, location.lng]}
          icon={location.type === 'donation' ? donationIcon : requestIcon}
        >
          <Popup>
            <div className="text-center">
              <h3 className="font-semibold">{location.title}</h3>
              <p className="text-sm text-muted-foreground">
                {location.type === 'donation' ? 'تبرع متاح' : 'طلب مساعدة'}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

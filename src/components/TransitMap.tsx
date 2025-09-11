import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import { motion } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Vehicle, Route, Stop } from "@/lib/mockData";
import { Bus, MapPin } from "lucide-react";

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface TransitMapProps {
  vehicles: Vehicle[];
  routes: Route[];
  stops: Stop[];
  selectedVehicleId?: string;
  onVehicleClick: (vehicleId: string) => void;
}

// Custom vehicle marker
const createVehicleIcon = (color: string, isSelected: boolean) => {
  return L.divIcon({
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        transform: ${isSelected ? 'scale(1.3)' : 'scale(1)'};
        transition: transform 0.2s ease;
      ">
        <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
    `,
    className: "custom-vehicle-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Custom stop marker
const createStopIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        width: 12px;
        height: 12px;
        background-color: #ffffff;
        border: 2px solid #3b82f6;
        border-radius: 50%;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      "></div>
    `,
    className: "custom-stop-marker",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
};

const MapController = ({ selectedVehicleId, vehicles }: { selectedVehicleId?: string; vehicles: Vehicle[] }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedVehicleId) {
      const vehicle = vehicles.find(v => v.id === selectedVehicleId);
      if (vehicle) {
        map.setView([vehicle.lat, vehicle.lon], 15, { animate: true });
      }
    }
  }, [selectedVehicleId, vehicles, map]);

  return null;
};

const TransitMap = ({ vehicles, routes, stops, selectedVehicleId, onVehicleClick }: TransitMapProps) => {
  const [mapReady, setMapReady] = useState(false);

  const center: [number, number] = [40.7589, -73.9851]; // Times Square

  const getRouteColor = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    return route?.color || "#3b82f6";
  };

  return (
    <div className="relative w-full h-full">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full rounded-lg overflow-hidden shadow-elevated"
      >
        <MapContainer
          center={center}
          zoom={12}
          className="w-full h-full"
          zoomControl={false}
          whenReady={() => setMapReady(true)}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Route Polylines */}
          {routes.map((route) => (
            <Polyline
              key={route.id}
              positions={route.shape}
              color={route.color}
              weight={4}
              opacity={0.8}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold">{route.name}</h3>
                  <p className="text-sm text-muted-foreground">Route line</p>
                </div>
              </Popup>
            </Polyline>
          ))}

          {/* Stops */}
          {stops.map((stop) => (
            <Marker
              key={stop.id}
              position={[stop.lat, stop.lon]}
              icon={createStopIcon()}
            >
              <Popup>
                <div className="p-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold">{stop.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Stop #{stop.stopOrder}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Vehicles */}
          {vehicles.map((vehicle) => {
            const route = routes.find(r => r.id === vehicle.routeId);
            const isSelected = selectedVehicleId === vehicle.id;
            
            return (
              <Marker
                key={vehicle.id}
                position={[vehicle.lat, vehicle.lon]}
                icon={createVehicleIcon(route?.color || "#3b82f6", isSelected)}
                eventHandlers={{
                  click: () => onVehicleClick(vehicle.id),
                }}
              >
                <Popup>
                  <div className="p-3 min-w-[200px]">
                    <div className="flex items-center space-x-2 mb-3">
                      <Bus className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold">{vehicle.name}</h3>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Route:</span>
                        <span className="font-medium">{route?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Speed:</span>
                        <span className="font-medium">{vehicle.speed} mph</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Update:</span>
                        <span className="font-medium">
                          {new Date(vehicle.lastUpdated).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Position:</span>
                        <span className="font-medium text-xs">
                          {vehicle.lat.toFixed(4)}, {vehicle.lon.toFixed(4)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-border">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                        <span className="text-xs text-muted-foreground">Live tracking</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          <MapController selectedVehicleId={selectedVehicleId} vehicles={vehicles} />
        </MapContainer>
      </motion.div>

      {/* Map overlay controls */}
      <div className="absolute top-4 left-4 z-[1000]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card/80 backdrop-blur-sm rounded-lg p-3 shadow-soft"
        >
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-accent rounded-full animate-pulse" />
            <span className="text-sm font-medium">Live Tracking</span>
          </div>
        </motion.div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[1000]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-card/90 backdrop-blur-sm rounded-lg p-3 shadow-soft space-y-2"
        >
          <h4 className="text-sm font-semibold mb-2">Legend</h4>
          {routes.map((route) => (
            <div key={route.id} className="flex items-center space-x-2 text-xs">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: route.color }}
              />
              <span>{route.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default TransitMap;
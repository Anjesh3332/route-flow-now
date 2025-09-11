import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngTuple, DivIcon } from 'leaflet';
import { motion } from 'framer-motion';
import { VehicleWithPosition, Route, Stop } from '@/hooks/useTransitData';
import { Bus, MapPin } from 'lucide-react';
import { renderToString } from 'react-dom/server';
import 'leaflet/dist/leaflet.css';

// Custom hook to handle map updates
function MapController({ 
  selectedVehicleId, 
  vehicles, 
  focusLocation 
}: { 
  selectedVehicleId?: string;
  vehicles: VehicleWithPosition[];
  focusLocation?: { lat: number; lon: number; zoom?: number };
}) {
  const map = useMap();

  useEffect(() => {
    if (focusLocation) {
      map.setView([focusLocation.lat, focusLocation.lon], focusLocation.zoom || 16);
    }
  }, [map, focusLocation]);

  useEffect(() => {
    if (selectedVehicleId) {
      const vehicle = vehicles.find(v => v.id === selectedVehicleId);
      if (vehicle?.position) {
        map.setView([vehicle.position.lat, vehicle.position.lon], 16);
      }
    }
  }, [map, selectedVehicleId, vehicles]);

  return null;
}

interface TransitMapNewProps {
  vehicles: VehicleWithPosition[];
  routes: Route[];
  stops: Stop[];
  selectedVehicleId?: string;
  onVehicleClick?: (vehicleId: string) => void;
  onStopClick?: (stopId: string) => void;
  focusLocation?: { lat: number; lon: number; zoom?: number };
  className?: string;
}

export function TransitMapNew({
  vehicles,
  routes,
  stops,
  selectedVehicleId,
  onVehicleClick,
  onStopClick,
  focusLocation,
  className = ''
}: TransitMapNewProps) {
  const mapRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);

  // Default center (New York City)
  const defaultCenter: LatLngTuple = [40.7589, -73.9851];

  // Create custom vehicle icon
  const createVehicleIcon = (vehicle: VehicleWithPosition, isSelected: boolean) => {
    const iconHtml = renderToString(
      <div 
        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
          isSelected 
            ? 'bg-primary shadow-lg scale-125 ring-2 ring-white' 
            : 'bg-primary/80 hover:bg-primary shadow-md'
        }`}
        style={{
          transform: vehicle.position?.heading ? `rotate(${vehicle.position.heading}deg)` : undefined
        }}
      >
        <Bus className="w-3 h-3 text-white" />
      </div>
    );

    return new DivIcon({
      html: iconHtml,
      className: 'custom-vehicle-icon',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  // Create custom stop icon
  const createStopIcon = () => {
    const iconHtml = renderToString(
      <div className="w-4 h-4 bg-accent rounded-full flex items-center justify-center shadow-sm border-2 border-white">
        <MapPin className="w-2 h-2 text-white" />
      </div>
    );

    return new DivIcon({
      html: iconHtml,
      className: 'custom-stop-icon',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
  };

  // Process route shapes for polylines
  const getRouteCoordinates = (route: Route): LatLngTuple[] => {
    if (!route.shape) return [];
    
    try {
      // Handle different shape formats (array of coordinates or GeoJSON)
      if (Array.isArray(route.shape)) {
        return route.shape.map(coord => [coord[0], coord[1]] as LatLngTuple);
      } else if (route.shape.coordinates) {
        // GeoJSON format
        return route.shape.coordinates.map((coord: number[]) => [coord[1], coord[0]] as LatLngTuple);
      }
      return [];
    } catch (error) {
      console.error('Error processing route shape:', error);
      return [];
    }
  };

  // Get route color
  const getRouteColor = (routeId: string) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
    const index = parseInt(routeId) % colors.length;
    return colors[index];
  };

  const handleVehicleMarkerClick = (vehicleId: string) => {
    onVehicleClick?.(vehicleId);
  };

  const handleStopMarkerClick = (stopId: string) => {
    onStopClick?.(stopId);
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      <MapContainer
        ref={mapRef}
        center={defaultCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        whenReady={() => setMapReady(true)}
        preferCanvas={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Map Controller */}
        <MapController 
          selectedVehicleId={selectedVehicleId}
          vehicles={vehicles}
          focusLocation={focusLocation}
        />

        {/* Route Polylines */}
        {routes.map((route) => {
          const coordinates = getRouteCoordinates(route);
          if (coordinates.length === 0) return null;

          return (
            <Polyline
              key={route.id}
              positions={coordinates}
              color={getRouteColor(route.id)}
              weight={4}
              opacity={0.8}
              smoothFactor={1}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-medium text-sm">{route.name}</h3>
                  <p className="text-xs text-muted-foreground">Route Line</p>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* Stop Markers */}
        {stops.map((stop) => (
          <Marker
            key={stop.id}
            position={[stop.lat, stop.lon]}
            icon={createStopIcon()}
            eventHandlers={{
              click: () => handleStopMarkerClick(stop.id),
            }}
          >
            <Popup>
              <div className="p-2 min-w-0">
                <h3 className="font-medium text-sm">{stop.name}</h3>
                <p className="text-xs text-muted-foreground">
                  Stop #{stop.stop_order}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stop.lat.toFixed(4)}, {stop.lon.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Vehicle Markers */}
        {vehicles
          .filter(vehicle => vehicle.position)
          .map((vehicle) => (
            <Marker
              key={vehicle.id}
              position={[vehicle.position!.lat, vehicle.position!.lon]}
              icon={createVehicleIcon(vehicle, selectedVehicleId === vehicle.id)}
              eventHandlers={{
                click: () => handleVehicleMarkerClick(vehicle.id),
              }}
            >
              <Popup>
                <div className="p-2 min-w-0">
                  <h3 className="font-medium text-sm">{vehicle.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    {vehicle.route?.name || 'Unknown Route'}
                  </p>
                  {vehicle.position && (
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Speed:</span>
                        <span className="font-medium">
                          {vehicle.position.speed ? `${Math.round(vehicle.position.speed)} km/h` : 'Stopped'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium">
                          {vehicle.position.lat.toFixed(4)}, {vehicle.position.lon.toFixed(4)}
                        </span>
                      </div>
                      {vehicle.position.heading && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Heading:</span>
                          <span className="font-medium">{Math.round(vehicle.position.heading)}°</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* Loading overlay */}
      {!mapReady && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 bg-muted/20 flex items-center justify-center z-10"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"
            />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
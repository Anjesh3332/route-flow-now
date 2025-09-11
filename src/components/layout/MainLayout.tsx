import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from './Header';
import { VehicleSidebarNew } from './VehicleSidebarNew';
import { MobileBottomSheet } from './MobileBottomSheet';
import { TransitMapNew } from '../TransitMapNew';
import { useVehiclesWithPositions, useRoutes, useStops } from '@/hooks/useTransitData';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';

interface SearchResult {
  id: string;
  name: string;
  type: "route" | "stop";
  routeName?: string;
  lat?: number;
  lon?: number;
}

export function MainLayout() {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [focusLocation, setFocusLocation] = useState<{ lat: number; lon: number; zoom?: number }>();
  
  const { vehiclesWithPositions, loading: vehiclesLoading } = useVehiclesWithPositions();
  const { routes, loading: routesLoading } = useRoutes();
  const { stops, loading: stopsLoading } = useStops();
  const { toast } = useToast();

  // Handle responsive behavior
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Handle search result selection
  const handleSearchResult = (result: SearchResult) => {
    if (result.type === "route") {
      // Find first vehicle on this route
      const vehicleOnRoute = vehiclesWithPositions.find(v => v.route_id === result.id);
      if (vehicleOnRoute && vehicleOnRoute.position) {
        setSelectedVehicleId(vehicleOnRoute.id);
        setFocusLocation({ 
          lat: vehicleOnRoute.position.lat, 
          lon: vehicleOnRoute.position.lon, 
          zoom: 14 
        });
      } else {
        toast({
          title: "Route found",
          description: `${result.name} - No active vehicles currently`,
        });
      }
    } else if (result.type === "stop" && result.lat && result.lon) {
      // Focus on stop location
      setFocusLocation({ lat: result.lat, lon: result.lon, zoom: 16 });
      toast({
        title: "Stop located",
        description: `Showing ${result.name}`,
      });
    }
  };

  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleVehicleMapClick = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    // Show sidebar on mobile when clicking vehicle
    if (isMobile) {
      setIsSidebarOpen(true);
    }
  };

  const handleStopMapClick = (stopId: string) => {
    const stop = stops.find(s => s.id === stopId);
    if (stop) {
      toast({
        title: "Stop selected",
        description: stop.name,
      });
    }
  };

  const isLoading = vehiclesLoading || routesLoading || stopsLoading;

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <Header
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMobile={isMobile}
        vehicleCount={vehiclesWithPositions.length}
        routeCount={routes.length}
        onSearchResult={handleSearchResult}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <motion.div
            initial={false}
            animate={{
              width: isSidebarOpen ? 320 : 0,
              opacity: isSidebarOpen ? 1 : 0,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative overflow-hidden"
          >
            {isSidebarOpen && (
              <VehicleSidebarNew
                routes={routes}
                onVehicleSelect={handleVehicleSelect}
                selectedVehicleId={selectedVehicleId}
                className="border-r border-sidebar-border"
              />
            )}
          </motion.div>
        )}

        {/* Map Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 relative"
        >
          {isLoading ? (
            <div className="absolute inset-0 bg-background flex items-center justify-center z-10">
              <div className="text-center space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"
                />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Loading Transit Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Fetching routes, vehicles, and real-time positions...
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <TransitMapNew
              vehicles={vehiclesWithPositions}
              routes={routes}
              stops={stops}
              selectedVehicleId={selectedVehicleId}
              onVehicleClick={handleVehicleMapClick}
              onStopClick={handleStopMapClick}
              focusLocation={focusLocation}
              className="h-full w-full"
            />
          )}
        </motion.div>

        {/* Mobile Bottom Sheet */}
        {isMobile && (
          <MobileBottomSheet
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            title="Transit Control"
          >
            <VehicleSidebarNew
              routes={routes}
              onVehicleSelect={handleVehicleSelect}
              selectedVehicleId={selectedVehicleId}
              className="border-none bg-transparent"
            />
          </MobileBottomSheet>
        )}
      </div>

      {/* Status Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="h-10 bg-card/60 backdrop-blur-sm border-t border-border flex items-center justify-between px-4 text-sm relative z-10"
      >
        <div className="flex items-center space-x-4">
          <span className="text-muted-foreground">Last updated:</span>
          <span className="font-medium text-foreground">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-muted-foreground">Connected</span>
          </div>
          {selectedVehicleId && (
            <div className="text-primary font-medium">
              Tracking: {vehiclesWithPositions.find(v => v.id === selectedVehicleId)?.name}
            </div>
          )}
        </div>
      </motion.div>

      <Toaster />
    </div>
  );
}
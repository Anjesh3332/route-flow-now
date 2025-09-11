import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bus, MapPin, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import TransitMap from "./TransitMap";
import VehicleSidebar from "./VehicleSidebar";
import SearchBar from "./SearchBar";
import { mockRoutes, mockStops, mockVehicles, updateVehiclePositions, Vehicle } from "@/lib/mockData";

interface SearchResult {
  id: string;
  name: string;
  type: "route" | "stop";
  routeName?: string;
}

const Dashboard = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prevVehicles => updateVehiclePositions(prevVehicles));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Handle responsive behavior
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const handleSearchResult = (result: SearchResult) => {
    if (result.type === "route") {
      // Find first vehicle on this route
      const vehicleOnRoute = vehicles.find(v => v.routeId === result.id);
      if (vehicleOnRoute) {
        setSelectedVehicleId(vehicleOnRoute.id);
      }
    }
    // For stops, we could implement focusing on the stop
    console.log("Selected:", result);
  };

  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-16 bg-card/80 backdrop-blur-md border-b border-border shadow-soft flex items-center justify-between px-4 z-10"
      >
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-hero rounded-lg flex items-center justify-center">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">TransitLive</h1>
              <p className="text-xs text-muted-foreground">Real-time Transport</p>
            </div>
          </div>
        </div>

        {/* Center section - Search */}
        <div className="flex-1 max-w-md mx-4">
          <SearchBar onSelectResult={handleSearchResult} />
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span>{vehicles.length} Live</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{mockRoutes.length} Routes</span>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" className="p-2">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <motion.div
          initial={false}
          animate={{
            x: isMobile && !isSidebarOpen ? "-100%" : 0,
            width: isSidebarOpen ? "auto" : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`${isMobile ? "absolute inset-y-0 left-0 z-20" : "relative"} ${
            !isSidebarOpen && !isMobile ? "w-0" : ""
          }`}
        >
          <VehicleSidebar
            vehicles={vehicles}
            routes={mockRoutes}
            onVehicleSelect={handleVehicleSelect}
            selectedVehicleId={selectedVehicleId}
          />
        </motion.div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 relative"
        >
          <TransitMap
            vehicles={vehicles}
            routes={mockRoutes}
            stops={mockStops}
            selectedVehicleId={selectedVehicleId}
            onVehicleClick={setSelectedVehicleId}
          />
        </motion.div>

        {/* Mobile overlay */}
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 z-10"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>

      {/* Status Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="h-12 bg-card/60 backdrop-blur-sm border-t border-border flex items-center justify-between px-4 text-sm"
      >
        <div className="flex items-center space-x-4">
          <span className="text-muted-foreground">Last updated:</span>
          <span className="font-medium">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span>Connected</span>
          </div>
          {selectedVehicleId && (
            <div className="text-primary font-medium">
              Tracking: {vehicles.find(v => v.id === selectedVehicleId)?.name}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
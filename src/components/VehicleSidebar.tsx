import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bus, Clock, Gauge, ChevronRight, ChevronLeft, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Vehicle, Route } from "@/lib/mockData";

interface VehicleSidebarProps {
  vehicles: Vehicle[];
  routes: Route[];
  onVehicleSelect: (vehicleId: string) => void;
  selectedVehicleId?: string;
}

const VehicleSidebar = ({ vehicles, routes, onVehicleSelect, selectedVehicleId }: VehicleSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string>("all");

  const filteredVehicles = selectedRoute === "all" 
    ? vehicles 
    : vehicles.filter(v => v.routeId === selectedRoute);

  const getRouteInfo = (routeId: string) => {
    return routes.find(r => r.id === routeId);
  };

  const formatLastUpdated = (timestamp: string) => {
    const now = new Date();
    const updated = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - updated.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const getSpeedColor = (speed: number) => {
    if (speed < 10) return "text-destructive";
    if (speed < 20) return "text-transit-orange";
    return "text-accent";
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 60 : 380 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-full bg-card/95 backdrop-blur-md border-r border-border shadow-soft flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-2"
            >
              <Bus className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-lg">Live Vehicles</h2>
            </motion.div>
          )}
        </AnimatePresence>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-muted/50"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Filter */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 border-b border-border"
          >
            <div className="flex items-center space-x-2 mb-3">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by Route</span>
            </div>
            <Select value={selectedRoute} onValueChange={setSelectedRoute}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All routes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Routes</SelectItem>
                {routes.map((route) => (
                  <SelectItem key={route.id} value={route.id}>
                    {route.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vehicle List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {isCollapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-2 space-y-2"
            >
              {filteredVehicles.map((vehicle) => {
                const route = getRouteInfo(vehicle.routeId);
                return (
                  <motion.button
                    key={vehicle.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onVehicleSelect(vehicle.id)}
                    className={`w-full p-2 rounded-lg transition-colors ${
                      selectedVehicleId === vehicle.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div 
                      className="w-4 h-4 rounded-full mx-auto"
                      style={{ backgroundColor: route?.color }}
                    />
                  </motion.button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 space-y-3"
            >
              {filteredVehicles.map((vehicle, index) => {
                const route = getRouteInfo(vehicle.routeId);
                return (
                  <motion.div
                    key={vehicle.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-elevated border ${
                        selectedVehicleId === vehicle.id
                          ? 'border-primary shadow-glow bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => onVehicleSelect(vehicle.id)}
                    >
                      <div className="space-y-3">
                        {/* Vehicle Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full animate-pulse-slow"
                              style={{ backgroundColor: route?.color }}
                            />
                            <span className="font-medium text-sm">{vehicle.name}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {route?.name}
                          </Badge>
                        </div>

                        {/* Vehicle Stats */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="flex items-center space-x-1">
                            <Gauge className="w-3 h-3 text-muted-foreground" />
                            <span className={`font-medium ${getSpeedColor(vehicle.speed)}`}>
                              {vehicle.speed} mph
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {formatLastUpdated(vehicle.lastUpdated)}
                            </span>
                          </div>
                        </div>

                        {/* Status Indicator */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                            <span className="text-xs text-muted-foreground">Live</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {vehicle.lat.toFixed(4)}, {vehicle.lon.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats Footer */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 border-t border-border bg-muted/20"
          >
            <div className="text-center">
              <p className="text-sm font-medium">{filteredVehicles.length} Active Vehicles</p>
              <p className="text-xs text-muted-foreground">
                {routes.length} Routes • Real-time tracking
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VehicleSidebar;
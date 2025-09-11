import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bus, MapPin, Route, Filter, RefreshCw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VehicleCard } from '@/components/cards/VehicleCard';
import { RouteCard } from '@/components/cards/RouteCard';
import { useVehiclesWithPositions, Route as RouteType } from '@/hooks/useTransitData';
import { Skeleton } from '@/components/ui/skeleton';

interface VehicleSidebarNewProps {
  routes: RouteType[];
  onVehicleSelect: (vehicleId: string) => void;
  selectedVehicleId?: string;
  className?: string;
}

export function VehicleSidebarNew({ 
  routes, 
  onVehicleSelect, 
  selectedVehicleId,
  className = ''
}: VehicleSidebarNewProps) {
  const { vehiclesWithPositions, loading, refresh } = useVehiclesWithPositions();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('all');
  const [view, setView] = useState<'vehicles' | 'routes'>('vehicles');

  // Filter vehicles based on search and route selection
  const filteredVehicles = useMemo(() => {
    return vehiclesWithPositions.filter(vehicle => {
      const matchesSearch = vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          vehicle.route?.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRoute = selectedRouteId === 'all' || vehicle.route_id === selectedRouteId;
      return matchesSearch && matchesRoute;
    });
  }, [vehiclesWithPositions, searchQuery, selectedRouteId]);

  // Get vehicle count per route
  const routeVehicleCounts = useMemo(() => {
    return routes.reduce((acc, route) => {
      acc[route.id] = vehiclesWithPositions.filter(v => v.route_id === route.id).length;
      return acc;
    }, {} as Record<string, number>);
  }, [routes, vehiclesWithPositions]);

  const handleRefresh = () => {
    refresh();
  };

  return (
    <div className={`w-80 bg-sidebar border-r border-sidebar-border flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 space-y-4 border-b border-sidebar-border bg-sidebar/50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-sidebar-foreground">Transit Control</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="w-8 h-8 p-0"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* View Toggle */}
        <div className="flex space-x-1 bg-sidebar-accent rounded-lg p-1">
          <Button
            variant={view === 'vehicles' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('vehicles')}
            className="flex-1 h-8"
          >
            <Bus className="w-4 h-4 mr-1" />
            Vehicles
          </Button>
          <Button
            variant={view === 'routes' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('routes')}
            className="flex-1 h-8"
          >
            <Route className="w-4 h-4 mr-1" />
            Routes
          </Button>
        </div>

        {/* Search */}
        <div className="space-y-2">
          <Input
            type="text"
            placeholder={`Search ${view}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-sidebar-background border-sidebar-border"
          />
          
          {view === 'vehicles' && (
            <Select value={selectedRouteId} onValueChange={setSelectedRouteId}>
              <SelectTrigger className="bg-sidebar-background border-sidebar-border">
                <SelectValue placeholder="Filter by route" />
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
          )}
        </div>

        {/* Stats */}
        <div className="flex justify-between text-sm text-sidebar-foreground">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span>
              {view === 'vehicles' 
                ? `${filteredVehicles.length} vehicles` 
                : `${routes.length} routes`
              }
            </span>
          </div>
          {view === 'vehicles' && (
            <Badge variant="secondary" className="text-xs">
              {vehiclesWithPositions.filter(v => v.position?.speed && v.position.speed > 5).length} moving
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-20 w-full rounded-lg" />
                  </div>
                ))}
              </motion.div>
            ) : view === 'vehicles' ? (
              <motion.div
                key="vehicles"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                {filteredVehicles.length > 0 ? (
                  filteredVehicles.map((vehicle) => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      isSelected={selectedVehicleId === vehicle.id}
                      onClick={onVehicleSelect}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-sidebar-foreground/60">
                    <Bus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No vehicles found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="routes"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                {routes.length > 0 ? (
                  routes
                    .filter(route => route.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((route) => (
                      <RouteCard
                        key={route.id}
                        route={route}
                        vehicleCount={routeVehicleCounts[route.id] || 0}
                        onClick={(routeId) => {
                          // Switch to vehicles view and filter by route
                          setView('vehicles');
                          setSelectedRouteId(routeId);
                        }}
                      />
                    ))
                ) : (
                  <div className="text-center py-8 text-sidebar-foreground/60">
                    <Route className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No routes found</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar/50">
        <div className="text-xs text-sidebar-foreground/60 space-y-1">
          <div className="flex justify-between">
            <span>Last updated:</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span>Real-time updates active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
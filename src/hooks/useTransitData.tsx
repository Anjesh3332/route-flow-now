import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Route {
  id: string;
  name: string;
  shape: any; // GeoJSON or coordinate array
  created_at?: string;
  updated_at?: string;
}

export interface Stop {
  id: string;
  route_id: string;
  name: string;
  lat: number;
  lon: number;
  stop_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Vehicle {
  id: string;
  route_id: string;
  name: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Position {
  id: string;
  vehicle_id: string;
  lat: number;
  lon: number;
  speed?: number;
  heading?: number;
  timestamp?: string;
}

export interface VehicleWithPosition extends Vehicle {
  position?: Position;
  route?: Route;
}

export function useRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const { data, error } = await supabase
          .from('routes')
          .select('*')
          .order('name');

        if (error) throw error;
        setRoutes(data || []);
      } catch (error) {
        console.error('Error fetching routes:', error);
        toast({
          title: "Error loading routes",
          description: "Failed to load route data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, [toast]);

  return { routes, loading };
}

export function useStops(routeId?: string) {
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStops = async () => {
      try {
        let query = supabase.from('stops').select('*');
        
        if (routeId) {
          query = query.eq('route_id', routeId);
        }
        
        const { data, error } = await query.order('stop_order');

        if (error) throw error;
        setStops(data || []);
      } catch (error) {
        console.error('Error fetching stops:', error);
        toast({
          title: "Error loading stops",
          description: "Failed to load stop data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStops();
  }, [routeId, toast]);

  return { stops, loading };
}

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        setVehicles(data || []);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        toast({
          title: "Error loading vehicles",
          description: "Failed to load vehicle data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [toast]);

  return { vehicles, loading };
}

export function useVehiclesWithPositions() {
  const [vehiclesWithPositions, setVehiclesWithPositions] = useState<VehicleWithPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchVehiclesWithPositions = async () => {
      try {
        // Fetch vehicles with their latest positions
        const { data: vehicles, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('is_active', true);

        if (vehiclesError) throw vehiclesError;

        // Fetch latest positions for each vehicle
        const vehicleIds = vehicles?.map(v => v.id) || [];
        const { data: positions, error: positionsError } = await supabase
          .from('positions')
          .select('*')
          .in('vehicle_id', vehicleIds)
          .order('timestamp', { ascending: false });

        if (positionsError) throw positionsError;

        // Fetch routes
        const { data: routes, error: routesError } = await supabase
          .from('routes')
          .select('*');

        if (routesError) throw routesError;

        // Combine data
        const combined = vehicles?.map(vehicle => {
          const latestPosition = positions?.find(p => p.vehicle_id === vehicle.id);
          const route = routes?.find(r => r.id === vehicle.route_id);
          
          return {
            ...vehicle,
            position: latestPosition,
            route
          };
        }) || [];

        setVehiclesWithPositions(combined);
      } catch (error) {
        console.error('Error fetching vehicles with positions:', error);
        toast({
          title: "Error loading vehicles",
          description: "Failed to load vehicle data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVehiclesWithPositions();

    // Set up real-time subscription for position updates
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'positions'
        },
        (payload) => {
          console.log('New position:', payload);
          // Refetch data when new position is inserted
          fetchVehiclesWithPositions();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'vehicles'
        },
        (payload) => {
          console.log('Vehicle updated:', payload);
          fetchVehiclesWithPositions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return { vehiclesWithPositions, loading, refresh: () => window.location.reload() };
}

export function useSearchData() {
  const { routes } = useRoutes();
  const { stops } = useStops();

  const searchResults = (query: string) => {
    if (!query || query.length < 2) return [];

    const routeResults = routes
      .filter(route => 
        route.name.toLowerCase().includes(query.toLowerCase())
      )
      .map(route => ({
        id: route.id,
        name: route.name,
        type: 'route' as const,
      }));

    const stopResults = stops
      .filter(stop => 
        stop.name.toLowerCase().includes(query.toLowerCase())
      )
      .map(stop => {
        const route = routes.find(r => r.id === stop.route_id);
        return {
          id: stop.id,
          name: stop.name,
          type: 'stop' as const,
          routeName: route?.name,
          lat: stop.lat,
          lon: stop.lon,
        };
      });

    return [...routeResults, ...stopResults].slice(0, 8);
  };

  return { searchResults };
}
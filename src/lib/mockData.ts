// Mock data for the transit app
export interface Route {
  id: string;
  name: string;
  color: string;
  shape: [number, number][];
}

export interface Stop {
  id: string;
  routeId: string;
  name: string;
  lat: number;
  lon: number;
  stopOrder: number;
}

export interface Vehicle {
  id: string;
  routeId: string;
  name: string;
  lat: number;
  lon: number;
  speed: number;
  lastUpdated: string;
  direction: number;
}

export const mockRoutes: Route[] = [
  {
    id: "1",
    name: "Blue Line Express",
    color: "#3b82f6",
    shape: [
      [40.7589, -73.9851], // Times Square
      [40.7505, -73.9934], // Port Authority
      [40.7505, -73.9969], // Lincoln Tunnel
      [40.7489, -74.0014], // West Side
      [40.7282, -74.0776], // Jersey City
    ],
  },
  {
    id: "2", 
    name: "Green Line Local",
    color: "#10b981",
    shape: [
      [40.7831, -73.9712], // Central Park North
      [40.7794, -73.9632], // East Side
      [40.7589, -73.9851], // Times Square
      [40.7505, -73.9934], // Port Authority
      [40.7282, -74.0059], // Downtown
    ],
  },
  {
    id: "3",
    name: "Orange Express",
    color: "#f59e0b",
    shape: [
      [40.8176, -73.9482], // Bronx
      [40.7831, -73.9712], // Central Park
      [40.7589, -73.9851], // Times Square
      [40.7282, -74.0059], // Downtown
      [40.7074, -74.0113], // Brooklyn Bridge
    ],
  },
];

export const mockStops: Stop[] = [
  { id: "1", routeId: "1", name: "Times Square", lat: 40.7589, lon: -73.9851, stopOrder: 1 },
  { id: "2", routeId: "1", name: "Port Authority", lat: 40.7505, lon: -73.9934, stopOrder: 2 },
  { id: "3", routeId: "1", name: "Lincoln Tunnel", lat: 40.7505, lon: -73.9969, stopOrder: 3 },
  { id: "4", routeId: "2", name: "Central Park North", lat: 40.7831, lon: -73.9712, stopOrder: 1 },
  { id: "5", routeId: "2", name: "East Side", lat: 40.7794, lon: -73.9632, stopOrder: 2 },
  { id: "6", routeId: "3", name: "Bronx Terminal", lat: 40.8176, lon: -73.9482, stopOrder: 1 },
];

export const mockVehicles: Vehicle[] = [
  {
    id: "bus-001",
    routeId: "1",
    name: "Blue Express 001",
    lat: 40.7589,
    lon: -73.9851,
    speed: 25,
    lastUpdated: new Date().toISOString(),
    direction: 45,
  },
  {
    id: "bus-002", 
    routeId: "1",
    name: "Blue Express 002",
    lat: 40.7505,
    lon: -73.9934,
    speed: 18,
    lastUpdated: new Date().toISOString(),
    direction: 90,
  },
  {
    id: "bus-003",
    routeId: "2",
    name: "Green Local 003",
    lat: 40.7831,
    lon: -73.9712,
    speed: 22,
    lastUpdated: new Date().toISOString(),
    direction: 180,
  },
  {
    id: "bus-004",
    routeId: "3",
    name: "Orange Express 004",
    lat: 40.8176,
    lon: -73.9482,
    speed: 30,
    lastUpdated: new Date().toISOString(),
    direction: 225,
  },
];

// Simulate real-time vehicle updates
export const updateVehiclePositions = (vehicles: Vehicle[]): Vehicle[] => {
  return vehicles.map(vehicle => {
    const route = mockRoutes.find(r => r.id === vehicle.routeId);
    if (!route) return vehicle;

    // Simple animation along route
    const speed = 0.0001; // degrees per update
    const newLat = vehicle.lat + (Math.random() - 0.5) * speed;
    const newLon = vehicle.lon + (Math.random() - 0.5) * speed;

    return {
      ...vehicle,
      lat: newLat,
      lon: newLon,
      speed: Math.max(5, Math.min(35, vehicle.speed + (Math.random() - 0.5) * 5)),
      lastUpdated: new Date().toISOString(),
    };
  });
};
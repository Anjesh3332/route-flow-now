import { motion } from 'framer-motion';
import { Route as RouteIcon, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Route } from '@/hooks/useTransitData';

interface RouteCardProps {
  route: Route;
  vehicleCount?: number;
  stopCount?: number;
  onClick?: (routeId: string) => void;
}

export function RouteCard({ route, vehicleCount = 0, stopCount = 0, onClick }: RouteCardProps) {
  const handleClick = () => {
    onClick?.(route.id);
  };

  const getRouteColor = (index: number) => {
    const colors = [
      'bg-transit-blue',
      'bg-transit-green', 
      'bg-transit-orange',
      'bg-transit-purple',
      'bg-transit-red'
    ];
    return colors[index % colors.length];
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="cursor-pointer transition-all duration-200 hover:shadow-soft hover:bg-card/90 bg-card/60 backdrop-blur-sm border-border/50"
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full ${getRouteColor(parseInt(route.id))} flex items-center justify-center`}>
                <RouteIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-sm text-foreground">{route.name}</h4>
                <div className="flex items-center space-x-3 mt-1">
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{stopCount} stops</span>
                  </div>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {vehicleCount} active
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
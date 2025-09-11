import { motion } from 'framer-motion';
import { Bus, MapPin, Clock, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VehicleWithPosition } from '@/hooks/useTransitData';
import { formatDistanceToNow } from 'date-fns';

interface VehicleCardProps {
  vehicle: VehicleWithPosition;
  isSelected?: boolean;
  onClick?: (vehicleId: string) => void;
}

export function VehicleCard({ vehicle, isSelected, onClick }: VehicleCardProps) {
  const handleClick = () => {
    onClick?.(vehicle.id);
  };

  const getStatusColor = (speed?: number) => {
    if (!speed) return 'bg-muted text-muted-foreground';
    if (speed < 5) return 'bg-destructive/10 text-destructive';
    if (speed < 15) return 'bg-accent/20 text-accent';
    return 'bg-primary/20 text-primary';
  };

  const lastUpdated = vehicle.position?.timestamp 
    ? formatDistanceToNow(new Date(vehicle.position.timestamp), { addSuffix: true })
    : 'No data';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`cursor-pointer transition-all duration-200 hover:shadow-soft ${
          isSelected 
            ? 'ring-2 ring-primary shadow-glow bg-card/90' 
            : 'hover:bg-card/90 bg-card/60'
        } backdrop-blur-sm border-border/50`}
        onClick={handleClick}
      >
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center">
                <Bus className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-sm text-foreground">{vehicle.name}</h4>
                <p className="text-xs text-muted-foreground">{vehicle.route?.name || 'Unknown Route'}</p>
              </div>
            </div>
            <Badge 
              variant="secondary"
              className={`text-xs ${getStatusColor(vehicle.position?.speed)}`}
            >
              {vehicle.position?.speed ? `${Math.round(vehicle.position.speed)} km/h` : 'Stopped'}
            </Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-1 text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>
                {vehicle.position 
                  ? `${vehicle.position.lat.toFixed(4)}, ${vehicle.position.lon.toFixed(4)}`
                  : 'No location'
                }
              </span>
            </div>
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{lastUpdated}</span>
            </div>
          </div>

          {/* Speed indicator */}
          {vehicle.position?.speed && (
            <div className="flex items-center space-x-2">
              <Zap className="w-3 h-3 text-accent" />
              <div className="flex-1 bg-muted rounded-full h-1">
                <motion.div
                  className="h-1 rounded-full bg-gradient-to-r from-accent to-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((vehicle.position.speed / 50) * 100, 100)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
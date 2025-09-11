import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Stop } from '@/hooks/useTransitData';

interface StopCardProps {
  stop: Stop;
  routeName?: string;
  onClick?: (stopId: string) => void;
  className?: string;
}

export function StopCard({ stop, routeName, onClick, className }: StopCardProps) {
  const handleClick = () => {
    onClick?.(stop.id);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card 
        className="cursor-pointer transition-all duration-200 hover:shadow-soft hover:bg-card/90 bg-card/60 backdrop-blur-sm border-border/50"
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-sm text-foreground">{stop.name}</h4>
                {routeName && (
                  <p className="text-xs text-muted-foreground">{routeName}</p>
                )}
                <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                  <Navigation className="w-3 h-3" />
                  <span>{stop.lat.toFixed(4)}, {stop.lon.toFixed(4)}</span>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              Stop #{stop.stop_order}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
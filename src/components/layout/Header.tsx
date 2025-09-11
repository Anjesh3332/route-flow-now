import { motion } from 'framer-motion';
import { Bus, Menu, User, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ThemeToggle';
import SearchBar from '@/components/SearchBar';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  onMenuToggle?: () => void;
  isMobile?: boolean;
  vehicleCount?: number;
  routeCount?: number;
  onSearchResult?: (result: any) => void;
}

export function Header({ 
  onMenuToggle, 
  isMobile, 
  vehicleCount = 0, 
  routeCount = 0,
  onSearchResult 
}: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-16 bg-card/80 backdrop-blur-md border-b border-border shadow-soft flex items-center justify-between px-4 relative z-10"
    >
      {/* Left section */}
      <div className="flex items-center space-x-4">
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="p-2 hover:bg-muted/50"
          >
            <Menu className="w-5 h-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        )}
        
        <motion.div 
          className="flex items-center space-x-3"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-8 h-8 gradient-hero rounded-lg flex items-center justify-center shadow-soft">
            <Bus className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-lg text-foreground">TransitLive</h1>
            <p className="text-xs text-muted-foreground">Real-time Transport</p>
          </div>
        </motion.div>
      </div>

      {/* Center section - Search */}
      <div className="flex-1 max-w-md mx-4">
        <SearchBar onSelectResult={onSearchResult} />
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-3">
        {/* Stats */}
        <div className="hidden md:flex items-center space-x-4 text-sm">
          <motion.div 
            className="flex items-center space-x-1 text-muted-foreground"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span>{vehicleCount} Live</span>
          </motion.div>
          <div className="flex items-center space-x-1 text-muted-foreground">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <span>{routeCount} Routes</span>
          </div>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative p-2 hover:bg-muted/50">
          <Bell className="w-5 h-5" />
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
          >
            2
          </Badge>
          <span className="sr-only">Notifications</span>
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-card/95 backdrop-blur-md border-border" align="end" forceMount>
            <div className="flex flex-col space-y-1 p-2">
              <p className="text-sm font-medium leading-none">Transit User</p>
              <p className="text-xs leading-none text-muted-foreground">
                user@transit.app
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              Preferences
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}

import React, { useState, useEffect } from "react";
import { MapPin, Navigation, Phone, MessageSquare, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Driver {
  id: string;
  name: string;
  photo: string;
  rating: number;
  vehicle_number: string;
}

interface RideTrackerProps {
  driver: Driver;
  pickup: string;
  destination: string;
  fare: number;
  estimatedTime: string;
  onRideComplete: () => void;
  className?: string;
}

type RideStatus = "arriving" | "picked_up" | "in_progress" | "completed";

const RideTracker: React.FC<RideTrackerProps> = ({
  driver,
  pickup,
  destination,
  fare,
  estimatedTime,
  onRideComplete,
  className
}) => {
  const [rideStatus, setRideStatus] = useState<RideStatus>("arriving");
  const [progress, setProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState(estimatedTime);

  // Simulate ride progress
  useEffect(() => {
    if (rideStatus === "arriving") {
      const timer = setTimeout(() => {
        setRideStatus("picked_up");
        setProgress(25);
      }, 5000);
      return () => clearTimeout(timer);
    }
    
    if (rideStatus === "picked_up") {
      const timer = setTimeout(() => {
        setRideStatus("in_progress");
        setProgress(50);
      }, 5000);
      return () => clearTimeout(timer);
    }
    
    if (rideStatus === "in_progress") {
      const timer = setTimeout(() => {
        setRideStatus("completed");
        setProgress(100);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [rideStatus]);

  useEffect(() => {
    if (rideStatus === "completed") {
      const timer = setTimeout(() => {
        onRideComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [rideStatus, onRideComplete]);

  const getStatusText = (): string => {
    switch (rideStatus) {
      case "arriving": return "Driver is arriving";
      case "picked_up": return "Driver has arrived";
      case "in_progress": return "On the way to destination";
      case "completed": return "Ride completed";
      default: return "";
    }
  };

  return (
    <div className={cn("w-full animate-fade-in", className)}>
      <div className="bg-white rounded-xl shadow-md border overflow-hidden">
        <div className="p-4 border-b">
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-namma-blue h-2 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <h2 className="font-semibold text-lg mt-3">{getStatusText()}</h2>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className="w-14 h-14 rounded-full overflow-hidden mr-3 border-2 border-namma-blue">
                <img 
                  src={driver.photo} 
                  alt={driver.name}
                  className="w-full h-full object-cover" 
                />
              </div>
              <div>
                <h3 className="font-semibold">{driver.name}</h3>
                <p className="text-sm text-muted-foreground">{driver.vehicle_number}</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                size="icon"
                variant="outline"
                className="h-10 w-10 rounded-full border-namma-blue/30 text-namma-blue"
                onClick={() => alert("Calling driver...")}
              >
                <Phone className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-10 w-10 rounded-full border-namma-blue/30 text-namma-blue"
                onClick={() => alert("Messaging driver...")}
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
            {/* Pickup location */}
            <div className="flex items-start">
              <div className="w-8 flex-shrink-0 flex justify-center">
                <div className="w-8 h-8 bg-namma-blue/10 rounded-full flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-namma-blue" />
                </div>
              </div>
              <div className="ml-3">
                <span className="text-sm text-muted-foreground">Pickup</span>
                <p className="font-medium">{pickup}</p>
              </div>
            </div>
            
            {/* Line connecting pickup and destination */}
            <div className="flex items-center">
              <div className="w-8 flex-shrink-0 flex justify-center">
                <div className="w-0.5 h-6 bg-namma-blue/30"></div>
              </div>
            </div>
            
            {/* Destination */}
            <div className="flex items-start">
              <div className="w-8 flex-shrink-0 flex justify-center">
                <div className="w-8 h-8 bg-namma-blue/10 rounded-full flex items-center justify-center">
                  <Navigation className="h-4 w-4 text-namma-blue" />
                </div>
              </div>
              <div className="ml-3">
                <span className="text-sm text-muted-foreground">Destination</span>
                <p className="font-medium">{destination}</p>
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-sm text-muted-foreground">Estimated time:</span>
              <span className="ml-1.5 font-medium">{remainingTime}</span>
            </div>
            <div className="font-semibold">₹{fare}</div>
          </div>
          
          {rideStatus === "completed" && (
            <div className="mt-4 p-3 bg-namma-green/10 rounded-lg flex items-center">
              <CheckCircle2 className="h-5 w-5 text-namma-green mr-2" />
              <span className="text-namma-green font-medium">Your ride is complete! Thank you for riding with Namma Yatri.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideTracker;

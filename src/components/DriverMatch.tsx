
import React, { useState, useEffect } from "react";
import { Phone, MessageSquare, Star, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Driver {
  id: string;
  name: string;
  photo: string;
  rating: number;
  vehicle_number: string;
  distance: string;
  eta: string;
}

interface DriverMatchProps {
  onDriverConfirmed: (driver: Driver) => void;
  onCancel: () => void;
  className?: string;
}

const DriverMatch: React.FC<DriverMatchProps> = ({ 
  onDriverConfirmed, 
  onCancel,
  className 
}) => {
  const [isSearching, setIsSearching] = useState(true);
  const [matchedDriver, setMatchedDriver] = useState<Driver | null>(null);
  const [countdown, setCountdown] = useState(15);

  // Simulate driver matching process
  useEffect(() => {
    const searchTimer = setTimeout(() => {
      setIsSearching(false);
      setMatchedDriver({
        id: "d-123",
        name: "Ramesh Kumar",
        photo: "https://randomuser.me/api/portraits/men/32.jpg",
        rating: 4.8,
        vehicle_number: "KA 05 MJ 6789",
        distance: "1.2 km",
        eta: "4 min"
      });
    }, 3000);

    return () => clearTimeout(searchTimer);
  }, []);

  // Countdown timer for driver acceptance
  useEffect(() => {
    if (!isSearching && matchedDriver) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isSearching, matchedDriver]);

  // Auto-confirm when countdown reaches 0
  useEffect(() => {
    if (countdown === 0 && matchedDriver) {
      onDriverConfirmed(matchedDriver);
    }
  }, [countdown, matchedDriver, onDriverConfirmed]);

  return (
    <div className={cn("w-full animate-fade-in", className)}>
      <div className="bg-white rounded-xl shadow-md border overflow-hidden">
        {isSearching ? (
          <div className="p-8 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
              <RotateCw className="h-10 w-10 text-namma-blue animate-spin-slow" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Finding your driver</h2>
            <p className="text-muted-foreground text-center max-w-xs">
              We're connecting you with a nearby driver. This usually takes less than a minute.
            </p>
            <Button
              variant="outline"
              className="mt-8"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        ) : matchedDriver ? (
          <div className="p-5">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-namma-blue">
                  <img 
                    src={matchedDriver.photo} 
                    alt={matchedDriver.name}
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{matchedDriver.name}</h3>
                  <div className="flex items-center mt-1">
                    <span className="text-sm bg-namma-green/10 text-namma-green px-2 py-0.5 rounded-full font-medium flex items-center">
                      <Star className="h-3 w-3 mr-1 fill-namma-green text-namma-green" />
                      {matchedDriver.rating}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">
                      Auto • {matchedDriver.vehicle_number}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="bg-namma-blue/10 text-namma-blue px-3 py-1 rounded-full font-medium">
                  {matchedDriver.eta} away
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-muted/30 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Driver will arrive in</span>
                <span className="text-lg font-semibold">{countdown} seconds</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div
                  className="bg-namma-blue h-2 rounded-full transition-all"
                  style={{ width: `${(countdown / 15) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex mt-6 space-x-3">
              <Button
                variant="outline"
                className="flex-1 py-6 border-namma-blue/30 hover:bg-namma-blue/5 text-namma-blue"
                onClick={() => alert("Calling driver...")}
              >
                <Phone className="h-5 w-5 mr-2" />
                Call
              </Button>
              <Button
                variant="outline"
                className="flex-1 py-6 border-namma-blue/30 hover:bg-namma-blue/5 text-namma-blue"
                onClick={() => alert("Messaging driver...")}
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Message
              </Button>
            </div>
            
            <Button
              className="w-full mt-3 py-6 bg-namma-blue hover:bg-namma-blue/90 text-white font-medium"
              onClick={() => onDriverConfirmed(matchedDriver)}
            >
              Confirm Driver
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default DriverMatch;

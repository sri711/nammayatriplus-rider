
import React, { useState } from "react";
import LocationSearch from "./LocationSearch";
import RideOptions from "./RideOptions";
import DriverMatch from "./DriverMatch";
import RideTracker from "./RideTracker";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Types
interface RideOption {
  id: string;
  name: string;
  image: string;
  estimated_time: string;
  price: number;
  promocode?: string;
  discount?: number;
}

interface Driver {
  id: string;
  name: string;
  photo: string;
  rating: number;
  vehicle_number: string;
  distance: string;
  eta: string;
}

type BookingStep = "location" | "options" | "matching" | "tracking";

const RideBooking: React.FC = () => {
  const [step, setStep] = useState<BookingStep>("location");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedRide, setSelectedRide] = useState<RideOption | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  
  // Sample ride options
  const rideOptions: RideOption[] = [
    {
      id: "auto",
      name: "Auto",
      image: "/placeholder.svg", // Use placeholder for now
      estimated_time: "5 min",
      price: 120,
      promocode: "FIRST10",
      discount: 10
    },
    {
      id: "auto-xl",
      name: "Auto XL",
      image: "/placeholder.svg", // Use placeholder for now
      estimated_time: "8 min",
      price: 180
    },
    {
      id: "premium",
      name: "Premium Auto",
      image: "/placeholder.svg", // Use placeholder for now
      estimated_time: "4 min",
      price: 220
    }
  ];

  const handleLocationsSelected = (pickup: string, destination: string) => {
    setPickup(pickup);
    setDestination(destination);
    setStep("options");
  };

  const handleRideSelected = (option: RideOption) => {
    setSelectedRide(option);
    setStep("matching");
  };

  const handleDriverConfirmed = (driver: Driver) => {
    setSelectedDriver(driver);
    setStep("tracking");
  };

  const handleGoBack = () => {
    switch (step) {
      case "options":
        setStep("location");
        break;
      case "matching":
        setStep("options");
        break;
      case "tracking":
        // Usually you wouldn't go back from tracking, but allowing it for demo
        setStep("matching");
        break;
      default:
        setStep("location");
    }
  };

  const handleRideComplete = () => {
    // Reset and go back to location input
    setTimeout(() => {
      setStep("location");
      setPickup("");
      setDestination("");
      setSelectedRide(null);
      setSelectedDriver(null);
    }, 2000);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {step !== "location" && (
        <Button
          variant="ghost"
          size="icon"
          className="mb-4"
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}
      
      {step === "location" && (
        <LocationSearch onLocationsSelected={handleLocationsSelected} />
      )}
      
      {step === "options" && (
        <RideOptions 
          options={rideOptions} 
          onSelect={handleRideSelected} 
        />
      )}
      
      {step === "matching" && (
        <DriverMatch 
          onDriverConfirmed={handleDriverConfirmed}
          onCancel={() => setStep("options")}
        />
      )}
      
      {step === "tracking" && selectedRide && selectedDriver && (
        <RideTracker 
          driver={selectedDriver}
          pickup={pickup}
          destination={destination}
          fare={selectedRide.price}
          estimatedTime={selectedRide.estimated_time}
          onRideComplete={handleRideComplete}
        />
      )}
    </div>
  );
};

export default RideBooking;

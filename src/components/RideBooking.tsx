
import React, { useState, useEffect } from "react";
import LocationSearch from "./LocationSearch";
import RideOptions from "./RideOptions";
import DriverMatch from "./DriverMatch";
import RideTracker from "./RideTracker";
import Map from "./Map";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { 
  calculateDistance, 
  calculateETA, 
  calculateFare, 
  findNearestDrivers, 
  formatTime 
} from "@/utils/rideUtils";
import { 
  userLocation, 
  popularDestinations, 
  vehicleTypes, 
  availableDrivers 
} from "@/data/dummyData";

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
  vehicleNumber: string;
  distance: number;
  eta: number;
}

interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

type BookingStep = "location" | "options" | "matching" | "tracking";

const RideBooking: React.FC = () => {
  const [step, setStep] = useState<BookingStep>("location");
  const [pickup, setPickup] = useState<Location>(userLocation);
  const [destination, setDestination] = useState<Location | null>(null);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>("");
  const [selectedRide, setSelectedRide] = useState<RideOption | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [availableRideOptions, setAvailableRideOptions] = useState<RideOption[]>([]);
  const [nearestDrivers, setNearestDrivers] = useState<Driver[]>([]);
  const [driverLocation, setDriverLocation] = useState<{latitude: number, longitude: number} | null>(null);
  
  // Calculate options when destination changes
  useEffect(() => {
    if (destination) {
      // Calculate distance
      const distance = calculateDistance(
        pickup.latitude, 
        pickup.longitude, 
        destination.latitude, 
        destination.longitude
      );
      setDistanceKm(distance);
      
      // Generate ride options based on the distance
      const options = vehicleTypes.map(vehicle => {
        const etaMinutes = calculateETA(distance, vehicle.id);
        const fare = calculateFare(distance, etaMinutes, vehicle.id);
        
        return {
          id: vehicle.id,
          name: vehicle.name,
          image: vehicle.image,
          estimated_time: formatTime(etaMinutes),
          price: fare,
          // Add a promo code to the first option
          ...(vehicle.id === "bike" ? { promocode: "FIRST10", discount: 10 } : {})
        };
      });
      
      setAvailableRideOptions(options);
    }
  }, [destination, pickup]);

  const handleLocationsSelected = (pickupLoc: string, destinationLoc: string) => {
    // Find destination from popular destinations or use a default
    const foundDestination = popularDestinations.find(
      dest => dest.address.includes(destinationLoc) || destinationLoc.includes(dest.name)
    );
    
    if (foundDestination) {
      setDestination(foundDestination);
      setStep("options");
    } else {
      // For demo purposes, just use the first destination if not found
      setDestination(popularDestinations[0]);
      setStep("options");
    }
  };

  const handleRideSelected = (option: RideOption) => {
    setSelectedRide(option);
    setSelectedVehicleType(option.id);
    
    // Find nearest drivers for the selected vehicle type
    if (destination) {
      const drivers = findNearestDrivers(
        pickup.latitude,
        pickup.longitude,
        availableDrivers,
        option.id,
        3
      );
      
      const mappedDrivers = drivers.map(driver => ({
        id: driver.id,
        name: driver.name,
        photo: driver.photo,
        rating: driver.rating,
        vehicleNumber: driver.vehicleNumber,
        distance: driver.distance,
        eta: driver.eta
      }));
      
      setNearestDrivers(mappedDrivers);
      setStep("matching");
    }
  };

  const handleDriverConfirmed = (driver: Driver) => {
    setSelectedDriver(driver);
    
    // Find the driver in availableDrivers to get the location
    const driverData = availableDrivers.find(d => d.id === driver.id);
    if (driverData) {
      setDriverLocation({
        latitude: driverData.latitude,
        longitude: driverData.longitude
      });
    }
    
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
      setDestination(null);
      setSelectedRide(null);
      setSelectedDriver(null);
      setDriverLocation(null);
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
      
      {/* Show map for all steps except initial location search */}
      {step !== "location" && destination && (
        <Map 
          pickup={pickup}
          destination={destination}
          driverLocation={driverLocation}
          className="mb-4"
        />
      )}
      
      {step === "location" && (
        <LocationSearch onLocationsSelected={handleLocationsSelected} />
      )}
      
      {step === "options" && (
        <RideOptions 
          options={availableRideOptions} 
          onSelect={handleRideSelected}
          distance={distanceKm}
        />
      )}
      
      {step === "matching" && (
        <DriverMatch 
          drivers={nearestDrivers}
          onDriverConfirmed={handleDriverConfirmed}
          onCancel={() => setStep("options")}
        />
      )}
      
      {step === "tracking" && selectedRide && selectedDriver && destination && (
        <RideTracker 
          driver={selectedDriver}
          pickup={pickup.address}
          destination={destination.address}
          fare={selectedRide.price}
          estimatedTime={selectedRide.estimated_time}
          distance={distanceKm}
          onRideComplete={handleRideComplete}
        />
      )}
    </div>
  );
};

export default RideBooking;

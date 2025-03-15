import React, { useState, useEffect } from "react";
import LocationSearch from "./LocationSearch";
import RideOptions from "./RideOptions";
import FareBreakdown from "./FareBreakdown";
import DriverMatch from "./DriverMatch";
import RideTracker from "./RideTracker";
import Map from "./Map";
import PreScheduleRide from "./PreScheduleRide";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { 
  calculateDistance, 
  calculateETA, 
  calculateFare, 
  findNearestDrivers, 
  batchedMatchDrivers,
  formatTime 
} from "@/utils/rideUtils";
import { aiMatchScore } from "@/utils/aiMatch";
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

// Added new steps "fareBreakdown", "schedule" and "scheduled" to the union
type BookingStep = "location" | "options" | "fareBreakdown" | "matching" | "tracking" | "schedule" | "scheduled";

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
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  // Now storing an array of scheduled rides
  const [scheduledRides, setScheduledRides] = useState<{ time: Date; vehicleType: string; pickup: string; destination: string; fare: number }[]>([]);

  // Calculate options when destination changes
  useEffect(() => {
    if (destination) {
      const distance = calculateDistance(
        pickup.latitude, 
        pickup.longitude, 
        destination.latitude, 
        destination.longitude
      );
      setDistanceKm(distance);
      
      const options = vehicleTypes.map(vehicle => {
        const etaMinutes = calculateETA(distance, vehicle.id);
        let fare = calculateFare(distance, etaMinutes, vehicle.id);
        
        // Optionally adjust pricing for carpool – e.g. 20% discount
        if (vehicle.id === "carpool") {
          fare = fare * 0.8;
        }
        
        return {
          id: vehicle.id,
          name: vehicle.name,
          image: vehicle.image,
          estimated_time: formatTime(etaMinutes),
          price: fare,
          ...(vehicle.id === "bike" ? { promocode: "FIRST10", discount: 10 } : {})
        };
      });
      
      setAvailableRideOptions(options);
    }
  }, [destination, pickup]);

  const handleLocationsSelected = (pickupLoc: string, destinationLoc: string) => {
    const foundPickup = popularDestinations.find(
      dest => dest.address.toLowerCase().includes(pickupLoc.toLowerCase()) ||
              pickupLoc.toLowerCase().includes(dest.name.toLowerCase())
    );
    const foundDestination = popularDestinations.find(
      dest => dest.address.toLowerCase().includes(destinationLoc.toLowerCase()) ||
              destinationLoc.toLowerCase().includes(dest.name.toLowerCase())
    );
    
    if (foundPickup) {
      setPickup(foundPickup);
    } else {
      setPickup({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        address: pickupLoc
      });
    }
    
    if (foundDestination) {
      setDestination(foundDestination);
    } else {
      setDestination({
        latitude: userLocation.latitude + 0.02,
        longitude: userLocation.longitude + 0.02,
        address: destinationLoc
      });
    }
    
    setStep("options");
  };

  // When a ride option is selected, show fare breakdown instead of going directly to matching.
  const handleRideSelected = (option: RideOption) => {
    setSelectedRide(option);
    setSelectedVehicleType(option.id);
    setStep("fareBreakdown");
  };

  // Called when the user accepts the breakdown with an added extra amount.
  const handleFareAccepted = async (finalFare: number) => {
    if (destination && selectedRide) {
      const updatedRide = { ...selectedRide, price: finalFare };
      setSelectedRide(updatedRide);
      
      const drivers = batchedMatchDrivers(
        pickup.latitude,
        pickup.longitude,
        availableDrivers,
        selectedRide.id,
        3,
        2
      );
      
      const driversWithAIScore = await Promise.all(
        drivers.map(async (driver) => {
          const score = await aiMatchScore({ pickup, destination, rideOption: selectedRide }, driver);
          return { ...driver, aiScore: score };
        })
      );
      
      driversWithAIScore.sort((a, b) => b.aiScore - a.aiScore);
      
      const mappedDrivers = driversWithAIScore.map(driver => ({
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

  const handleFareDenied = () => {
    // Return back to the ride options screen
    setStep("options");
  };

  const handleDriverConfirmed = (driver: Driver) => {
    setSelectedDriver(driver);
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
      case "fareBreakdown":
        setStep("options");
        break;
      case "matching":
        setStep("options");
        break;
      case "tracking":
        setStep("matching");
        break;
      default:
        setStep("location");
    }
  };

  const handleRideComplete = () => {
    setTimeout(() => {
      setStep("location");
      setDestination(null);
      setSelectedRide(null);
      setSelectedDriver(null);
      setDriverLocation(null);
    }, 2000);
  };

  // When a ride is pre-scheduled, add it to the list and navigate to the Scheduled screen.
  const handlePreSchedule = (
    scheduledTime: Date,
    vehicleType: string,
    pickupLocation: string,
    destinationLocation: string,
    finalFare: number
  ) => {
    const newRide = {
      time: scheduledTime,
      vehicleType,
      pickup: pickupLocation,
      destination: destinationLocation,
      fare: finalFare,
    };
    setScheduledRides((prev) => [...prev, newRide]);
    setStep("scheduled");
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Top header with scheduled rides button */}
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" onClick={() => setStep("scheduled")}>
          Scheduled rides
        </Button>
      </div>

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
      
      {step !== "location" && destination && (
        <Button variant="outline" onClick={() => setShowHeatmap(prev => !prev)} className="mb-4">
          { showHeatmap ? "Hide Heatmap" : "Show Heatmap" }
        </Button>
      )}
      
      {step !== "location" && destination && (
        <Map 
          pickup={pickup}
          destination={destination}
          driverLocation={driverLocation}
          className="mb-4"
          showHeatmap={showHeatmap}
          drivers={availableDrivers}
        />
      )}
      
      {step === "location" && (
        <div className="flex justify-between mb-4">
          <Button variant="outline" onClick={() => setStep("options")}>
            Immediate Ride
          </Button>
          <Button variant="outline" onClick={() => setStep("schedule")}>
            Pre-schedule Ride
          </Button>
        </div>
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
      
      {step === "fareBreakdown" && selectedRide && (
        <FareBreakdown 
          baseFare={selectedRide.price} 
          rideOption={selectedRide} 
          onAccept={handleFareAccepted}
          onDeny={handleFareDenied}
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

      {step === "schedule" && (
        <PreScheduleRide
          vehicleOptions={vehicleTypes}
          onSchedule={handlePreSchedule}
          onCancel={() => setStep("location")}
        />
      )}

      {step === "scheduled" && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Scheduled Rides</h2>
          {scheduledRides.length === 0 ? (
            <p>No scheduled rides yet.</p>
          ) : (
            <ul className="space-y-3">
              {scheduledRides.map((ride, index) => (
                <li key={index} className="border p-3 rounded">
                  <p className="font-medium">Vehicle Type: {ride.vehicleType}</p>
                  <p>Pickup: {ride.pickup}</p>
                  <p>Destination: {ride.destination}</p>
                  <p>Fare: ₹{ride.fare.toFixed(2)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default RideBooking;

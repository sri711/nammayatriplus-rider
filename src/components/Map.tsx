
import React, { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

interface MapProps {
  pickup: {
    latitude: number;
    longitude: number;
    address: string;
  };
  destination?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  driverLocation?: {
    latitude: number;
    longitude: number;
  };
  className?: string;
}

const Map: React.FC<MapProps> = ({ 
  pickup, 
  destination, 
  driverLocation,
  className 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // For now, we'll use a static map image as a placeholder
    // In a real implementation, we would initialize Google Maps here
    setTimeout(() => {
      setMapLoaded(true);
    }, 1000);
  }, []);

  return (
    <div className={`w-full h-72 relative rounded-xl overflow-hidden ${className}`}>
      {/* Static map placeholder */}
      <div 
        ref={mapRef} 
        className="w-full h-full bg-gray-200 flex items-center justify-center"
      >
        {!mapLoaded ? (
          <div className="animate-pulse">Loading map...</div>
        ) : (
          <>
            {/* This is a placeholder for the Google Maps integration */}
            <div className="absolute inset-0 bg-gray-100 overflow-hidden">
              {/* Simulated map background with grid */}
              <div className="w-full h-full relative" style={{ 
                backgroundImage: `linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
              }}>
                {/* Pickup location */}
                <div className="absolute" style={{ 
                  left: '30%', 
                  top: '40%',
                  transform: 'translate(-50%, -50%)'
                }}>
                  <div className="bg-namma-blue text-white p-1 rounded-full">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="text-xs font-medium bg-white px-2 py-1 rounded shadow-sm mt-1">
                    Pickup
                  </div>
                </div>

                {/* Destination location (if provided) */}
                {destination && (
                  <div className="absolute" style={{ 
                    left: '70%', 
                    top: '30%',
                    transform: 'translate(-50%, -50%)'
                  }}>
                    <div className="bg-red-500 text-white p-1 rounded-full">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="text-xs font-medium bg-white px-2 py-1 rounded shadow-sm mt-1">
                      Destination
                    </div>
                  </div>
                )}

                {/* Driver location (if provided) */}
                {driverLocation && (
                  <div 
                    className="absolute animate-pulse" 
                    style={{ 
                      left: '20%', 
                      top: '60%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <div className="bg-yellow-500 text-white p-1 rounded-full">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" stroke="currentColor" strokeWidth="2" fill="currentColor"/>
                        <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" stroke="currentColor" strokeWidth="2" fill="currentColor"/>
                        <path d="M5 17h-2v-6l2 -5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                  </div>
                )}

                {/* Route line between pickup and destination */}
                {destination && (
                  <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
                    <defs>
                      <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L9,3 z" fill="#2563EB" />
                      </marker>
                    </defs>
                    <path 
                      d="M30%,40% Q50%,20% 70%,30%" 
                      stroke="#2563EB" 
                      strokeWidth="3" 
                      strokeDasharray="5,5"
                      fill="none"
                      markerEnd="url(#arrow)"
                    />
                  </svg>
                )}

                {/* Driver to pickup route (if driver location is provided) */}
                {driverLocation && (
                  <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
                    <path 
                      d="M20%,60% Q25%,50% 30%,40%" 
                      stroke="#FBBF24" 
                      strokeWidth="3" 
                      strokeDasharray="3,3"
                      fill="none"
                    />
                  </svg>
                )}
              </div>
            </div>
            
            {/* Map overlay with gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
          </>
        )}
      </div>
      
      <div className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md">
        <div className="text-xs text-gray-500">This is a placeholder map.</div>
        <div className="text-xs font-medium">Interactive Google Maps will be integrated later.</div>
      </div>
    </div>
  );
};

export default Map;

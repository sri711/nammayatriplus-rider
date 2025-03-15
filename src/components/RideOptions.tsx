
import React, { useState } from "react";
import { ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RideOption {
  id: string;
  name: string;
  image: string;
  estimated_time: string;
  price: number;
  promocode?: string;
  discount?: number;
}

interface RideOptionsProps {
  options: RideOption[];
  onSelect: (option: RideOption) => void;
  className?: string;
}

const RideOptions: React.FC<RideOptionsProps> = ({ options, onSelect, className }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSelect = (option: RideOption) => {
    setSelectedOption(option.id);
    onSelect(option);
  };

  return (
    <div className={cn("w-full animate-slide-up", className)}>
      <div className="bg-white rounded-xl shadow-md border overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">Select Ride</h2>
        </div>
        
        <div className="divide-y">
          {options.map((option) => (
            <div
              key={option.id}
              className={cn(
                "p-4 transition-colors hover:bg-muted/50",
                selectedOption === option.id && "bg-muted/50"
              )}
            >
              <button 
                className="w-full flex items-start justify-between"
                onClick={() => handleSelect(option)}
              >
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex items-center justify-center mr-3">
                    <img 
                      src={option.image} 
                      alt={option.name} 
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  
                  <div className="text-left">
                    <h3 className="font-semibold text-base">{option.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span>{option.estimated_time}</span>
                    </div>
                    {option.promocode && (
                      <div className="mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-primary-foreground font-medium">
                          {option.promocode}: {option.discount}% off
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className="font-semibold">₹{option.price}</span>
                  {option.discount && (
                    <span className="text-xs text-muted-foreground line-through">
                      ₹{Math.round(option.price / (1 - option.discount / 100))}
                    </span>
                  )}
                  <ChevronRight className="h-5 w-5 text-muted-foreground mt-2" />
                </div>
              </button>
            </div>
          ))}
        </div>
        
        <div className="p-4 bg-muted/30">
          <Button 
            className="w-full py-6 bg-namma-blue hover:bg-namma-blue/90 text-white font-medium"
            disabled={!selectedOption}
            onClick={() => {
              const selected = options.find(o => o.id === selectedOption);
              if (selected) onSelect(selected);
            }}
          >
            Confirm {selectedOption ? options.find(o => o.id === selectedOption)?.name : "Ride"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RideOptions;

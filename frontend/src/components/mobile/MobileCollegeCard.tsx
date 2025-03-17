import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileCollegeCardProps {
  college: {
    id: string;
    name: string;
    selected?: boolean;
  };
  onSelect?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  showCheckbox?: boolean;
}

export const MobileCollegeCard: React.FC<MobileCollegeCardProps> = ({
  college,
  onSelect,
  onViewDetails,
  showCheckbox = true,
}) => {
  return (
    <div className="relative">
      {showCheckbox && (
        <div 
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(college.id);
          }}
        >
          <div className={cn(
            "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors",
            college.selected ? "bg-primary border-primary" : "border-muted-foreground"
          )}>
            {college.selected && (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-4 h-4 text-primary-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </motion.svg>
            )}
          </div>
        </div>
      )}
      
      <motion.div
        className={cn(
          "relative flex items-center bg-card hover:bg-accent/50 transition-colors rounded-lg p-4 pr-12",
          showCheckbox && "pl-16"
        )}
        whileTap={{ scale: 0.98 }}
        onClick={() => onViewDetails?.(college.id)}
      >
        <div className="flex-1">
          <h3 className="font-medium text-base leading-tight">{college.name}</h3>
        </div>
        
        <ChevronRight 
          className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
        />
      </motion.div>
    </div>
  );
}; 
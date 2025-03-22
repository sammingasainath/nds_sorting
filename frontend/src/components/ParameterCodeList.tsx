import React from 'react';
import { Info } from 'lucide-react';
import { parameterInfo } from '@/lib/parameterInfo';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from './ui/badge';

interface ParameterCodeListProps {
  parameters: string[];
  onParameterClick?: (param: string) => void;
}

export const ParameterCodeList: React.FC<ParameterCodeListProps> = ({
  parameters,
  onParameterClick
}) => {
  return (
    <div className="bg-muted/40 rounded-lg p-4 border">
      <TooltipProvider>
        <div className="flex items-center gap-2 mb-3 border-b pb-2">
          <h3 className="text-sm font-medium">Parameter Codes</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-sm">
              <p>These are NIRF parameter codes used to evaluate colleges.</p>
              <p className="mt-1">Click on any code to learn more about what it measures.</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="space-y-1">
          {parameters.map(param => {
            const info = parameterInfo[param];
            return (
              <Tooltip key={param}>
                <TooltipTrigger asChild>
                  <div 
                    className="flex items-center gap-2 p-1.5 rounded-md hover:bg-accent cursor-pointer"
                    onClick={() => onParameterClick?.(param)}
                  >
                    <Badge variant="outline" className="font-mono">{param}</Badge>
                    <span className="text-xs truncate">{info?.fullName || param}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">{info?.fullName || param}</h4>
                      {info?.weight && (
                        <Badge variant="secondary" className="ml-2">Weight: {info.weight}</Badge>
                      )}
                    </div>
                    <p className="text-sm">{info?.description || "No description available"}</p>
                    {info?.examples && (
                      <div>
                        <h5 className="text-xs font-medium">Examples:</h5>
                        <p className="text-xs">{info.examples}</p>
                      </div>
                    )}
                    {info?.importance && (
                      <div>
                        <h5 className="text-xs font-medium">Why this matters:</h5>
                        <p className="text-xs">{info.importance}</p>
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}; 
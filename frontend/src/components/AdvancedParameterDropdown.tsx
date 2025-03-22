import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, Filter, X, Search, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ParameterInfoCard } from '@/components/ParameterInfoCard';
import { parameterInfo } from '@/lib/parameterInfo';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Parameter category colors
const categoryColors: Record<string, string> = {
  "Teaching, Learning & Resources (TLR)": "bg-blue-500",
  "Research and Professional Practice (RP)": "bg-purple-500",
  "Graduation Outcomes (GO)": "bg-green-500",
  "Outreach and Inclusivity (OI)": "bg-amber-500",
  "Perception (PR)": "bg-red-500",
  "Other": "bg-gray-400"
};

interface AdvancedParameterDropdownProps {
  parameters: string[];
  selectedParameters: string[];
  onParametersChange: (parameters: string[]) => void;
}

export const AdvancedParameterDropdown: React.FC<AdvancedParameterDropdownProps> = ({
  parameters,
  selectedParameters,
  onParametersChange
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Keep track of the single selected parameter
  const [singleParameter, setSingleParameter] = useState<string | null>(
    selectedParameters.length > 0 ? selectedParameters[0] : null
  );
  
  // Update selectedParameters when singleParameter changes
  useEffect(() => {
    if (singleParameter) {
      onParametersChange([singleParameter]);
    } else {
      onParametersChange([]);
    }
  }, [singleParameter, onParametersChange]);
  
  // Update singleParameter when selectedParameters changes externally
  useEffect(() => {
    if (selectedParameters.length === 1 && selectedParameters[0] !== singleParameter) {
      setSingleParameter(selectedParameters[0]);
    } else if (selectedParameters.length === 0 && singleParameter !== null) {
      setSingleParameter(null);
    }
  }, [selectedParameters, singleParameter]);
  
  // Group parameters by category
  const parametersByCategory = React.useMemo(() => {
    const categories: Record<string, string[]> = {};
    
    parameters.forEach(param => {
      const category = parameterInfo[param]?.category || "Other";
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(param);
    });
    
    return categories;
  }, [parameters]);

  // Filter parameters based on search and category
  const filteredParameters = React.useMemo(() => {
    let result: string[] = [];
    
    Object.entries(parametersByCategory).forEach(([category, params]) => {
      if (activeCategory && category !== activeCategory) return;
      
      if (searchValue) {
        const searchLower = searchValue.toLowerCase();
        const filtered = params.filter(param => {
          const info = parameterInfo[param];
          return param.toLowerCase().includes(searchLower) || 
                (info?.fullName || '').toLowerCase().includes(searchLower) ||
                (info?.description || '').toLowerCase().includes(searchLower);
        });
        result = [...result, ...filtered];
      } else {
        result = [...result, ...params];
      }
    });
    
    return result;
  }, [parametersByCategory, searchValue, activeCategory]);

  // Set a single parameter as selected
  const selectParameter = (param: string) => {
    setSingleParameter(param);
    setOpen(false);
  };

  // Clear the selected parameter
  const clearSelection = () => {
    setSingleParameter(null);
  };

  // Get color for the category
  const getCategoryColor = (category: string): string => {
    return categoryColors[category] || "bg-gray-400";
  };

  // Get selected parameter info
  const selectedParameterInfo = singleParameter ? parameterInfo[singleParameter] : null;

  return (
    <div className="w-full relative">
      <TooltipProvider>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-medium">Select Parameter</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full">
                <Info className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-sm">
              <p>Select a parameter to sort colleges by.</p>
              <p className="mt-1">Each parameter represents a specific measurement that affects the college's ranking.</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
      
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto py-3 text-left"
          >
            {singleParameter ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">{singleParameter}</Badge>
                <span className="font-medium">{selectedParameterInfo?.fullName || singleParameter}</span>
                {selectedParameterInfo?.weight && (
                  <Badge variant="secondary" className="text-xs">Weight: {selectedParameterInfo.weight}</Badge>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">Select a parameter...</span>
            )}
            <div className="flex items-center">
              {singleParameter && (
                <Button
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearSelection();
                  }}
                  className="mr-1 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" side="bottom" align="start" sideOffset={5} style={{ width: 'calc(100vw - 40px)', maxWidth: '500px' }}>
          <Command className="w-full" style={{ width: '100%' }}>
            <div className="p-3 pb-0">
              <div className="text-sm mb-2">
                <span className="font-semibold">Parameters</span> determine how colleges are ranked.
              </div>
            </div>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Search parameters..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
            
            <div className="flex gap-1 overflow-x-auto p-1 border-b">
              <Badge 
                variant={activeCategory === null ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setActiveCategory(null)}
              >
                All Categories
              </Badge>
              {Object.entries(parametersByCategory).map(([category]) => (
                <Badge 
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => setActiveCategory(activeCategory === category ? null : category)}
                >
                  <div className={`mr-1.5 h-2 w-2 rounded-full ${getCategoryColor(category)}`} />
                  {category.split(' ')[0]}
                </Badge>
              ))}
            </div>
            
            <CommandEmpty>No parameters found.</CommandEmpty>
            <CommandList>
              <ScrollArea className="h-[400px]">
                {Object.entries(parametersByCategory).map(([category, params]) => {
                  // Skip if this category should be filtered out
                  if (activeCategory && category !== activeCategory) return null;
                  
                  // Filter parameters in this category
                  const visibleParams = params.filter(param => filteredParameters.includes(param));
                  if (visibleParams.length === 0) return null;
                  
                  return (
                    <div key={category}>
                      <div className="px-3 py-2 text-sm font-medium text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${getCategoryColor(category)}`} />
                          <span>{category}</span>
                        </div>
                      </div>
                      
                      <CommandGroup>
                        {visibleParams.map(param => {
                          const info = parameterInfo[param];
                          const isSelected = param === singleParameter;
                          
                          return (
                            <CommandItem
                              key={param}
                              onSelect={() => selectParameter(param)}
                              className="px-6 py-2"
                            >
                              <div className={cn(
                                "h-4 w-4 mr-2 border rounded-sm flex items-center justify-center",
                                isSelected
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "border-muted-foreground"
                              )}>
                                {isSelected && <Check className="h-3 w-3" />}
                              </div>
                              
                              <div className="flex flex-col flex-1 mr-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="font-mono text-xs">{param}</Badge>
                                  <span className="font-medium">{info?.fullName || param}</span>
                                  {info?.weight && (
                                    <Badge variant="secondary" className="text-xs">Weight: {info.weight}</Badge>
                                  )}
                                </div>
                                {info?.description && (
                                  <span className="text-xs text-muted-foreground mt-1">
                                    {info.description}
                                  </span>
                                )}
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                      <Separator />
                    </div>
                  );
                })}
              </ScrollArea>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {singleParameter && (
        <div className="mt-2 p-3 bg-muted/20 rounded-md border text-sm">
          <div className="flex items-center justify-between">
            <div className="font-medium">{selectedParameterInfo?.fullName || singleParameter}</div>
            {selectedParameterInfo?.weight && (
              <Badge variant="secondary">Weight: {selectedParameterInfo.weight}</Badge>
            )}
          </div>
          {selectedParameterInfo?.description && (
            <p className="text-muted-foreground mt-1">{selectedParameterInfo.description}</p>
          )}
        </div>
      )}
    </div>
  );
}; 
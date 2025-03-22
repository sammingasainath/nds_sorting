import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Info, Filter, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface ParameterInfo {
  fullName?: string;
  description?: string;
  category?: string;
  weight?: string;
  formula?: string;
}

// Parameter category colors
const categoryColors: Record<string, string> = {
  "Teaching, Learning & Resources (TLR)": "bg-blue-500",
  "Research and Professional Practice (RP)": "bg-purple-500",
  "Graduation Outcomes (GO)": "bg-green-500",
  "Outreach and Inclusivity (OI)": "bg-amber-500",
  "Perception (PR)": "bg-red-500",
  "Other": "bg-gray-400"
};

interface ParameterSelectorProps {
  parameters: string[];
  selectedParameters: string[];
  parameterInfo: Record<string, ParameterInfo>;
  onParametersChange: (params: string[]) => void;
}

export const ParameterSelector: React.FC<ParameterSelectorProps> = ({
  parameters,
  selectedParameters,
  parameterInfo,
  onParametersChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

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
  }, [parameters, parameterInfo]);

  const filteredParameters = React.useMemo(() => {
    let result = [...parameters];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(param => {
        const info = parameterInfo[param];
        return param.toLowerCase().includes(query) || 
               (info?.fullName || '').toLowerCase().includes(query) ||
               (info?.description || '').toLowerCase().includes(query);
      });
    }
    
    // Apply category filter
    if (categoryFilter) {
      result = result.filter(param => {
        return parameterInfo[param]?.category === categoryFilter;
      });
    }
    
    return result;
  }, [parameters, searchQuery, categoryFilter, parameterInfo]);

  const toggleParameter = (param: string) => {
    if (selectedParameters.includes(param)) {
      onParametersChange(selectedParameters.filter(p => p !== param));
    } else {
      onParametersChange([...selectedParameters, param]);
    }
  };

  const toggleAllInCategory = (category: string) => {
    const categoryParams = parametersByCategory[category] || [];
    const allSelected = categoryParams.every(param => selectedParameters.includes(param));
    
    if (allSelected) {
      // Deselect all in category
      onParametersChange(selectedParameters.filter(param => !categoryParams.includes(param)));
    } else {
      // Select all in category
      const newSelected = [...selectedParameters];
      categoryParams.forEach(param => {
        if (!newSelected.includes(param)) {
          newSelected.push(param);
        }
      });
      onParametersChange(newSelected);
    }
  };

  const getCategoryColor = (category: string) => {
    return categoryColors[category] || "bg-gray-400";
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Parameters</CardTitle>
            <CardDescription>
              Choose parameters that matter most to you for comparing colleges
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>Parameters are criteria used to evaluate and compare colleges. Each parameter has a specific weight in the NIRF ranking system.</p>
                <p className="mt-2">Click on any parameter to select it for your comparison.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Input 
                type="text"
                placeholder="Search parameters..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
              <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <ScrollArea className="h-60 rounded-md">
            <div className="flex gap-1.5 pb-2 overflow-x-auto">
              <Badge 
                variant={categoryFilter === null ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setCategoryFilter(null)}
              >
                All Categories
              </Badge>
              {Object.keys(parametersByCategory).map(category => (
                <Badge 
                  key={category}
                  variant={categoryFilter === category ? "default" : "outline"}
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => setCategoryFilter(category === categoryFilter ? null : category)}
                >
                  <div className={`mr-1.5 h-2 w-2 rounded-full ${categoryColors[category]}`} />
                  {category.split(' ')[0]}
                </Badge>
              ))}
            </div>

            <Accordion type="multiple" className="w-full">
              {Object.entries(parametersByCategory)
                .filter(([category]) => !categoryFilter || category === categoryFilter)
                .map(([category, params]) => {
                  // Filter parameters in this category
                  const categoryParamsFiltered = params.filter(param => filteredParameters.includes(param));
                  if (categoryParamsFiltered.length === 0) return null;
                  
                  const allSelected = categoryParamsFiltered.every(param => selectedParameters.includes(param));
                  const someSelected = categoryParamsFiltered.some(param => selectedParameters.includes(param));
                  
                  return (
                    <AccordionItem key={category} value={category} className="border-b">
                      <AccordionTrigger className="hover:bg-accent hover:text-accent-foreground rounded-md px-2">
                        <div className="flex items-center gap-2 w-full">
                          <div className={`h-2 w-2 rounded-full ${categoryColors[category]}`} />
                          <span className="font-medium text-sm flex-grow">{category}</span>
                          <div 
                            className={cn(
                              "flex h-4 w-4 items-center justify-center rounded-sm border mr-2",
                              allSelected ? "bg-primary border-primary text-primary-foreground" :
                              someSelected ? "bg-primary/30 border-primary/30" :
                              "border-muted-foreground"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleAllInCategory(category);
                            }}
                          >
                            {allSelected && <Check className="h-3 w-3" />}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-1 pl-3 pt-1">
                          {categoryParamsFiltered.map(param => {
                            const info = parameterInfo[param];
                            return (
                              <div 
                                key={param}
                                className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                onClick={() => toggleParameter(param)}
                              >
                                <div className="flex items-center gap-2">
                                  <div 
                                    className={cn(
                                      "flex h-4 w-4 items-center justify-center rounded-sm border",
                                      selectedParameters.includes(param) 
                                        ? "bg-primary border-primary text-primary-foreground" 
                                        : "border-muted-foreground"
                                    )}
                                  >
                                    {selectedParameters.includes(param) && <Check className="h-3 w-3" />}
                                  </div>
                                  <div className="ml-2">
                                    <div className="flex gap-2 items-center">
                                      <span className="font-medium text-sm">{info?.fullName || param}</span>
                                      <Badge variant="outline" className="text-xs">{param}</Badge>
                                      {info?.weight && (
                                        <Badge variant="secondary" className="text-xs">Weight: {info.weight}</Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                      {info?.description || "No description available"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
            </Accordion>
          </ScrollArea>

          <div className="flex justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              {selectedParameters.length} of {parameters.length} parameters selected
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onParametersChange([])}
                disabled={selectedParameters.length === 0}
              >
                Clear All
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => onParametersChange(parameters)}
                disabled={selectedParameters.length === parameters.length}
              >
                Select All
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 
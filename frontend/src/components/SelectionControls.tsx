import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { College } from '@/types';
import { Check, Info, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SelectionControlsHeader } from './SelectionControlsHeader';
import { SortingOptions } from '@/types/selection';
import { parameterInfo } from '@/lib/parameterInfo';
import { CollegeDetails } from './CollegeDetails';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { useCollegeHistory } from '@/hooks/useCollegeHistory';

interface SelectionControlsProps {
  colleges: College[];
  parameters: string[];
  selectedColleges: string[];
  selectedParameters: string[];
  onCollegesChange: (colleges: string[]) => void;
  onParametersChange: (parameters: string[]) => void;
  isLoading?: boolean;
  iterationId?: string;
  isSubsequentIteration?: boolean;
}

export const SelectionControls: React.FC<SelectionControlsProps> = ({
  colleges = [],
  parameters = [],
  selectedColleges = [],
  selectedParameters = [],
  onCollegesChange,
  onParametersChange,
  isLoading = false,
  iterationId,
  isSubsequentIteration = false
}) => {
  // Log component mount and props
  console.log('🔄 [SelectionControls] Component mounted/updated with props:', {
    iterationId,
    isSubsequentIteration,
    collegesCount: colleges.length,
    selectedCollegesCount: selectedColleges.length
  });

  // Get iteration history
  const { getPreviouslySelectedColleges, isFirstIteration } = useCollegeHistory();

  // Determine if this is a first iteration
  const isFirst = iterationId ? isFirstIteration(iterationId) : true;
  const isSubsequent = iterationId ? !isFirstIteration(iterationId) : false;

  // Check localStorage directly as a backup
  const hasCompletedFirstIteration = localStorage.getItem('hasCompletedFirstIteration') === 'true';
  const effectiveIsSubsequentIteration = isSubsequentIteration || hasCompletedFirstIteration;

  console.log('🔍 [SelectionControls] Calculated iteration state:', {
    iterationId,
    isFirst,
    isSubsequent,
    propIsSubsequent: isSubsequentIteration,
    hasCompletedFirstIteration,
    effectiveIsSubsequentIteration
  });

  // State for college selection options - set initial value based on iteration
  const [collegeOptions, setCollegeOptions] = React.useState<SortingOptions>(() => {
    const initialFilter = effectiveIsSubsequentIteration ? 'selected' : 'all';
    console.log('🔧 [SelectionControls] Setting initial filter to:', initialFilter);
    return {
      sortBy: 'original',
      filterBy: initialFilter,
      searchQuery: ''
    };
  });

  // Reset to 'all' filter when selections are cleared
  useEffect(() => {
    if (selectedColleges.length === 0 && selectedParameters.length === 0) {
      console.log('🔄 [SelectionControls] Resetting filter to "all" due to cleared selections');
      setCollegeOptions(prev => ({
        ...prev,
        filterBy: 'all'
      }));
    }
  }, [selectedColleges.length, selectedParameters.length]);

  // State for parameter selection options
  const [parameterOptions, setParameterOptions] = React.useState<SortingOptions>({
    sortBy: 'original',
    filterBy: 'all',
    searchQuery: ''
  });

  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);

  // Force update filter when component mounts or iteration changes
  useEffect(() => {
    console.log('🔄 [SelectionControls] useEffect triggered for effectiveIsSubsequentIteration =', effectiveIsSubsequentIteration);
    
    // Set filter based on iteration type
    setCollegeOptions(prev => {
      const newFilter = effectiveIsSubsequentIteration ? 'selected' : 'all';
      console.log('🔧 [SelectionControls] Updating filter from', prev.filterBy, 'to', newFilter);
      return {
        ...prev,
        filterBy: newFilter
      };
    });
  }, [effectiveIsSubsequentIteration]);

  // First, filter colleges based on iteration history
  const availableColleges = useMemo(() => {
    if (!iterationId) return colleges;

    // If this is the first iteration, show all colleges
    if (isFirstIteration(iterationId)) {
      return colleges;
    }

    // For subsequent iterations, ONLY show previously selected colleges
    const previouslySelected = getPreviouslySelectedColleges(iterationId);
    if (previouslySelected) {
      return colleges.filter(college => previouslySelected.includes(college.Name));
    }

    // If no previous selection (shouldn't happen), return empty array
    return [];
  }, [colleges, iterationId, getPreviouslySelectedColleges, isFirstIteration]);

  // Ensure selectedColleges is always an array
  const effectiveSelectedColleges = Array.isArray(selectedColleges) ? selectedColleges : [];

  // Update the filtered colleges computation
  const filteredColleges = React.useMemo(() => {
    if (!colleges) return [];
    
    let filtered = [...colleges];

    // Apply search filter
    if (collegeOptions.searchQuery) {
      const query = collegeOptions.searchQuery.toLowerCase();
      filtered = filtered.filter(college => 
        college.Name.toLowerCase().includes(query)
      );
    }

    // Apply selected/all filter
    if (collegeOptions.filterBy === 'selected') {
      filtered = filtered.filter(college => 
        effectiveSelectedColleges.includes(college.Name) || 
        effectiveSelectedColleges.includes(college['Unnamed: 0'])
      );
    }

    // Apply sorting
    switch (collegeOptions.sortBy) {
      case 'name':
        filtered.sort((a, b) => a.Name.localeCompare(b.Name));
        break;
      case 'rank':
        filtered.sort((a, b) => {
          const rankA = parseFloat(a.PR) || 0;
          const rankB = parseFloat(b.PR) || 0;
          return rankB - rankA;
        });
        break;
      default:
        // Keep original order
        break;
    }

    return filtered;
  }, [colleges, collegeOptions, effectiveSelectedColleges]);

  // Filter and sort parameters based on options
  const filteredParameters = React.useMemo(() => {
    let result = [...parameters];

    if (parameterOptions.searchQuery) {
      const search = parameterOptions.searchQuery.toLowerCase();
      result = result.filter(param => 
        param.toLowerCase().includes(search)
      );
    }

    if (parameterOptions.filterBy === 'selected') {
      result = result.filter(param => selectedParameters.includes(param));
    } else if (parameterOptions.filterBy === 'unselected') {
      result = result.filter(param => !selectedParameters.includes(param));
    }

    if (parameterOptions.sortBy === 'alphabetical') {
      result.sort((a, b) => a.localeCompare(b));
    }

    return result;
  }, [parameters, parameterOptions, selectedParameters]);

  const isCollegeSelectable = useCallback((collegeName: string) => {
    if (!iterationId || isFirstIteration(iterationId)) return true;
    const previouslySelected = getPreviouslySelectedColleges(iterationId);
    return previouslySelected?.includes(collegeName) ?? false;
  }, [iterationId, isFirstIteration, getPreviouslySelectedColleges]);

  // Update the college selection handler
  const handleCollegeSelect = (collegeId: string) => {
    const college = colleges.find(c => c['Unnamed: 0'] === collegeId);
    if (!college) return;

    onCollegesChange(prev => {
      const prevArray = Array.isArray(prev) ? prev : [];
      if (prevArray.includes(college.Name)) {
        return prevArray.filter(id => id !== college.Name);
      }
      return [...prevArray, college.Name];
    });
  };

  // Handle select all colleges
  const handleSelectAll = useCallback(() => {
    console.log('🔄 [SelectionControls] Toggling select all colleges');
    
    // If all filtered colleges are selected, deselect all
    const allFilteredCollegeNames = filteredColleges.map(college => college.Name);
    const allSelected = allFilteredCollegeNames.every(name => selectedColleges.includes(name));
    
    if (allSelected) {
      // Remove all filtered colleges from selection
      const newSelection = selectedColleges.filter(name => !allFilteredCollegeNames.includes(name));
      onCollegesChange(newSelection);
    } else {
      // Add all filtered colleges to selection
      const newSelection = [...new Set([...selectedColleges, ...allFilteredCollegeNames])];
      onCollegesChange(newSelection);
    }
  }, [filteredColleges, selectedColleges, onCollegesChange]);

  const toggleParameter = (parameter: string) => {
    const newSelection = selectedParameters.includes(parameter)
      ? selectedParameters.filter(p => p !== parameter)
      : [...selectedParameters, parameter];
    onParametersChange(newSelection);
  };

  const toggleAllParameters = () => {
    const allFilteredAreSelected = filteredParameters.every(param => 
      selectedParameters.includes(param)
    );

    if (allFilteredAreSelected) {
      // Deselect all filtered parameters
      const newSelection = selectedParameters.filter(param => 
        !filteredParameters.includes(param)
      );
      onParametersChange(newSelection);
    } else {
      // Select all filtered parameters
      const newSelection = Array.from(new Set([
        ...selectedParameters,
        ...filteredParameters
      ]));
      onParametersChange(newSelection);
    }
  };

  const renderParameterTooltip = (parameter: string) => {
    const info = parameterInfo[parameter];
    if (!info) return parameter;

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help border-b-2 border-dotted border-muted-foreground hover:border-primary">
            {parameter}
          </span>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-md p-4">
          <div className="space-y-2">
            <h4 className="font-medium">{info.fullName || parameter}</h4>
            <p>{info.description}</p>
            {info.weight && <p><strong>Weight:</strong> {info.weight}</p>}
            {info.formula && <p><strong>Formula:</strong> {info.formula}</p>}
            {info.category && <p><strong>Category:</strong> {info.category}</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };

  // Helper function to extract parameter full name from description
  const getParameterFullName = (parameter: string): string => {
    const info = parameterInfo[parameter];
    if (!info) return parameter;
    
    // Use the explicit fullName field if available
    if (info.fullName) {
      return info.fullName;
    }
    
    // Fallback to extracting from description if fullName is not available
    if (info.description) {
      // Extract the full name from the description (usually before the first colon)
      const fullNameMatch = info.description.match(/^([^:]+):/);
      if (fullNameMatch && fullNameMatch[1]) {
        return fullNameMatch[1].trim();
      }
      
      // If no colon, use the first sentence or phrase
      const firstSentence = info.description.split('.')[0].trim();
      return firstSentence;
    }
    
    return parameter;
  };

  // Group parameters by category
  const categorizedParameters = React.useMemo(() => {
    const categories: Record<string, string[]> = {
      "Teaching, Learning & Resources (TLR)": [],
      "Research and Professional Practice (RP)": [],
      "Graduation Outcomes (GO)": [],
      "Outreach and Inclusivity (OI)": [],
      "Perception (PR)": []
    };
    
    // Add "Other" category for parameters without a category
    categories["Other"] = [];
    
    parameters.forEach(param => {
      const info = parameterInfo[param];
      if (info && info.category && categories[info.category]) {
        categories[info.category].push(param);
      } else {
        categories["Other"].push(param);
      }
    });
    
    return categories;
  }, [parameters]);

  // Get category color for visual indicators
  const getCategoryColor = (parameter: string): string => {
    const info = parameterInfo[parameter];
    if (!info || !info.category) return "bg-gray-400";
    
    switch(info.category) {
      case "Teaching, Learning & Resources (TLR)":
        return "bg-blue-500";
      case "Research and Professional Practice (RP)":
        return "bg-purple-500";
      case "Graduation Outcomes (GO)":
        return "bg-green-500";
      case "Outreach and Inclusivity (OI)":
        return "bg-amber-500";
      case "Perception (PR)":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  // Check if a college is selected
  const isCollegeSelected = useCallback((college: College) => {
    return selectedColleges.includes(college.Name);
  }, [selectedColleges]);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[0, 1].map((i) => (
          <Card key={i} className="border-2 bg-card/50 backdrop-blur-sm">
            <CardHeader className="animate-pulse">
              <div className="h-6 w-24 bg-muted rounded" />
              <div className="h-4 w-48 bg-muted rounded" />
            </CardHeader>
            <CardContent className="flex items-center justify-center py-10">
              <div className="h-32 w-32 rounded-full border-4 border-muted border-t-primary animate-spin" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const areAllFilteredCollegesSelected = filteredColleges.every(college => 
    selectedColleges.includes(college.Name)
  );

  const areAllFilteredParametersSelected = filteredParameters.every(param => 
    selectedParameters.includes(param)
  );

  return (
    <TooltipProvider>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">Colleges</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              {!isFirstIteration(iterationId) && getPreviouslySelectedColleges(iterationId)
                ? `Select from ${availableColleges.length} colleges chosen in previous iteration`
                : "Select the colleges you want to compare"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SelectionControlsHeader
              title="Colleges"
              totalCount={availableColleges.length}
              selectedCount={selectedColleges.length}
              options={collegeOptions}
              setOptions={setCollegeOptions}
              onSelectAll={handleSelectAll}
              areAllSelected={areAllFilteredCollegesSelected}
              parameters={parameters}
              isSubsequentIteration={effectiveIsSubsequentIteration}
            />
            <ScrollArea className="h-[400px] mt-4">
              <Command>
                <CommandGroup>
                  {filteredColleges.map((college) => {
                    const selectable = isCollegeSelectable(college.Name);
                    return (
                      <CommandItem
                        key={college.Name}
                        onSelect={() => handleCollegeSelect(college['Unnamed: 0'])}
                        className={cn(
                          "flex items-center justify-between py-3 px-4 cursor-pointer",
                          selectedColleges.includes(college.Name) && "bg-primary/10"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-sm border",
                            isCollegeSelected(college) 
                              ? "border-primary bg-primary text-primary-foreground" 
                              : "border-muted-foreground"
                          )}>
                            {isCollegeSelected(college) && <Check className="h-3.5 w-3.5" />}
                          </div>
                          <span>{college.Name}</span>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="ml-2"
                              disabled={!selectable}
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering the CommandItem onSelect
                                setSelectedCollege(college);
                              }}
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent onClick={(e) => e.stopPropagation()}>
                            <DialogHeader>
                              <DialogTitle>College Details</DialogTitle>
                              <DialogDescription>
                                Detailed information about {selectedCollege?.Name}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedCollege && (
                              <CollegeDetails 
                                college={selectedCollege} 
                                onClose={() => setSelectedCollege(null)} 
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </Command>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="border-2 bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">Parameters</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Choose the parameters for comparison
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SelectionControlsHeader
              title="Parameters"
              totalCount={parameters.length}
              selectedCount={selectedParameters.length}
              options={parameterOptions}
              setOptions={setParameterOptions}
              onSelectAll={toggleAllParameters}
              areAllSelected={areAllFilteredParametersSelected}
              parameters={parameters}
            />
            <ScrollArea className="h-[400px] mt-4">
              <Command>
                {Object.entries(categorizedParameters).map(([category, params]) => (
                  params.length > 0 && (
                    <CommandGroup key={category} heading={category}>
                      {params
                        .filter(param => {
                          if (parameterOptions.searchQuery) {
                            const search = parameterOptions.searchQuery.toLowerCase();
                            const info = parameterInfo[param];
                            return param.toLowerCase().includes(search) || 
                                  (info && info.description && info.description.toLowerCase().includes(search));
                          }
                          return true;
                        })
                        .map((param) => (
                          <CommandItem
                            key={param}
                            onSelect={() => toggleParameter(param)}
                            className="flex items-center justify-between py-3 px-4 cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "h-4 w-4 border rounded-sm flex items-center justify-center",
                                  selectedParameters.includes(param)
                                    ? "bg-primary border-primary"
                                    : "border-muted-foreground"
                                )}
                              >
                                {selectedParameters.includes(param) && (
                                  <Check className="h-3 w-3 text-primary-foreground" />
                                )}
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${getCategoryColor(param)}`}></div>
                                  <span className="font-medium">{getParameterFullName(param)}</span>
                                </div>
                                <span className="text-xs text-muted-foreground ml-4">
                                  {renderParameterTooltip(param)}
                                </span>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  )
                ))}
              </Command>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}; 
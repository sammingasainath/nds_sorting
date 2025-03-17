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
import { Checkbox } from "@/components/ui/checkbox";

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

  // Then apply other filters
  const filteredColleges = useMemo(() => {
    // Start with available colleges (already filtered by iteration)
    let result = [...availableColleges];

    // Apply search filter if any
    if (collegeOptions.searchQuery) {
      const search = collegeOptions.searchQuery.toLowerCase();
      result = result.filter(college => 
        college.Name.toLowerCase().includes(search)
      );
    }

    // Apply selected/unselected filter
    if (collegeOptions.filterBy === 'selected') {
      result = result.filter(college => selectedColleges.includes(college.Name));
    } else if (collegeOptions.filterBy === 'unselected') {
      result = result.filter(college => !selectedColleges.includes(college.Name));
    }

    // Apply sorting
    if (collegeOptions.sortBy === 'alphabetical') {
      result.sort((a, b) => a.Name.localeCompare(b.Name));
    } else if (collegeOptions.sortBy === 'parameter' && collegeOptions.sortParameter) {
      result.sort((a, b) => {
        const paramA = Number(a[collegeOptions.sortParameter!]);
        const paramB = Number(b[collegeOptions.sortParameter!]);
        return paramB - paramA;
      });
    }

    return result;
  }, [availableColleges, collegeOptions, selectedColleges]);

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

  // Toggle college selection
  const handleCollegeSelect = useCallback((college: College) => {
    console.log('🔄 [SelectionControls] Toggling college selection:', college.Name);
    
    // Check if the college is already selected by Name
    const isSelected = selectedColleges.includes(college.Name);
    
    // If selected, remove it; otherwise, add it
    if (isSelected) {
      onCollegesChange(selectedColleges.filter(name => name !== college.Name));
    } else {
      onCollegesChange([...selectedColleges, college.Name]);
    }
  }, [selectedColleges, onCollegesChange]);

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
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center justify-between">
            <span>College Selection</span>
            <span className="text-xs sm:text-sm font-normal text-muted-foreground">
              {selectedColleges.length} selected
            </span>
          </CardTitle>
          <CardDescription>
            {isSubsequent ? 
              "Select colleges from your previous iteration to continue sorting." : 
              "Select colleges to include in the sorting process."}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <div className="flex flex-1 gap-2">
              <Command className="rounded-lg border shadow-md flex-1">
                <input
                  placeholder="Search colleges..."
                  value={collegeOptions.searchQuery}
                  onChange={(e) => setCollegeOptions({
                    ...collegeOptions,
                    searchQuery: e.target.value
                  })}
                  className="flex h-9 w-full rounded-md bg-transparent px-3 py-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                />
              </Command>
            </div>
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <select
                value={collegeOptions.filterBy}
                onChange={(e) => setCollegeOptions({
                  ...collegeOptions,
                  filterBy: e.target.value as any
                })}
                className="flex h-9 items-center justify-between whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 min-w-[100px]"
              >
                <option value="all">All</option>
                <option value="selected">Selected</option>
                <option value="unselected">Unselected</option>
              </select>
              <select
                value={collegeOptions.sortBy}
                onChange={(e) => setCollegeOptions({
                  ...collegeOptions,
                  sortBy: e.target.value as any
                })}
                className="flex h-9 items-center justify-between whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 min-w-[100px]"
              >
                <option value="original">Original</option>
                <option value="alphabetical">A-Z</option>
              </select>
            </div>
          </div>
          <div className="flex justify-between items-center mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs sm:text-sm"
            >
              {filteredColleges.every(college => selectedColleges.includes(college.Name)) ? 
                "Deselect All" : "Select All"}
            </Button>
            <span className="text-xs text-muted-foreground">
              Showing {filteredColleges.length} of {availableColleges.length} colleges
            </span>
          </div>
          <ScrollArea className="h-[300px] sm:h-[400px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredColleges.map(college => {
                const isSelected = selectedColleges.includes(college.Name);
                const isDisabled = !isCollegeSelectable(college.Name);
                
                return (
                  <div
                    key={college.Name}
                    className={cn(
                      "flex items-center space-x-2 p-2 rounded border",
                      isSelected ? "bg-primary/10 border-primary" : "hover:bg-accent",
                      isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                    )}
                    onClick={() => !isDisabled && handleCollegeSelect(college)}
                  >
                    <Checkbox 
                      checked={isSelected}
                      disabled={isDisabled}
                      className="pointer-events-none"
                    />
                    <div className="flex-1 truncate">
                      <span className="font-medium block truncate">{college.Name}</span>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCollege(college);
                          }}
                        >
                          <Info className="h-3 w-3" />
                          <span className="sr-only">College details</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md max-h-[90vh] overflow-auto">
                        <DialogHeader>
                          <DialogTitle>{college.Name}</DialogTitle>
                        </DialogHeader>
                        <CollegeDetails college={college} />
                      </DialogContent>
                    </Dialog>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Parameter Selection Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center justify-between">
            <span>Parameter Selection</span>
            <span className="text-xs sm:text-sm font-normal text-muted-foreground">
              {selectedParameters.length} selected
            </span>
          </CardTitle>
          <CardDescription>
            Select parameters to use for sorting colleges.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <div className="flex flex-1 gap-2">
              <Command className="rounded-lg border shadow-md flex-1">
                <input
                  placeholder="Search parameters..."
                  value={parameterOptions.searchQuery}
                  onChange={(e) => setParameterOptions({
                    ...parameterOptions,
                    searchQuery: e.target.value
                  })}
                  className="flex h-9 w-full rounded-md bg-transparent px-3 py-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                />
              </Command>
            </div>
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <select
                value={parameterOptions.filterBy}
                onChange={(e) => setParameterOptions({
                  ...parameterOptions,
                  filterBy: e.target.value as any
                })}
                className="flex h-9 items-center justify-between whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 min-w-[100px]"
              >
                <option value="all">All</option>
                <option value="selected">Selected</option>
                <option value="unselected">Unselected</option>
              </select>
              <select
                value={parameterOptions.sortBy}
                onChange={(e) => setParameterOptions({
                  ...parameterOptions,
                  sortBy: e.target.value as any
                })}
                className="flex h-9 items-center justify-between whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 min-w-[100px]"
              >
                <option value="original">Original</option>
                <option value="alphabetical">A-Z</option>
              </select>
            </div>
          </div>
          <div className="flex justify-between items-center mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAllParameters}
              className="text-xs sm:text-sm"
            >
              {filteredParameters.every(param => selectedParameters.includes(param)) ? 
                "Deselect All" : "Select All"}
            </Button>
            <span className="text-xs text-muted-foreground">
              Showing {filteredParameters.length} of {parameters.length} parameters
            </span>
          </div>
          <ScrollArea className="h-[200px] sm:h-[300px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredParameters.map(parameter => {
                const isSelected = selectedParameters.includes(parameter);
                
                return (
                  <div
                    key={parameter}
                    className={cn(
                      "flex items-center space-x-2 p-2 rounded border cursor-pointer",
                      isSelected ? "bg-primary/10 border-primary" : "hover:bg-accent"
                    )}
                    onClick={() => toggleParameter(parameter)}
                  >
                    <Checkbox 
                      checked={isSelected}
                      className="pointer-events-none"
                    />
                    <div className="flex-1 truncate">
                      <TooltipProvider>
                        {renderParameterTooltip(parameter)}
                      </TooltipProvider>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}; 
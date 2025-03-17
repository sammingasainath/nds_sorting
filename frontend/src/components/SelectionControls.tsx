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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* College Selection */}
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">Select Colleges</CardTitle>
          <CardDescription>
            Choose colleges to compare
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Options Bar */}
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="w-full sm:w-auto"
              >
                {areAllFilteredCollegesSelected ? "Deselect All" : "Select All"}
              </Button>
              <div className="flex flex-1 gap-2 w-full sm:w-auto">
                <select
                  value={collegeOptions.filterBy}
                  onChange={(e) => setCollegeOptions(prev => ({ ...prev, filterBy: e.target.value }))}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">All</option>
                  <option value="selected">Selected</option>
                  <option value="unselected">Unselected</option>
                </select>
                <select
                  value={collegeOptions.sortBy}
                  onChange={(e) => setCollegeOptions(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="original">Original</option>
                  <option value="alphabetical">A-Z</option>
                </select>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search colleges..."
                value={collegeOptions.searchQuery}
                onChange={(e) => setCollegeOptions(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* College List */}
            <ScrollArea className="h-[300px] w-full rounded-md border p-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredColleges.map((college) => {
                  const isSelected = selectedColleges.includes(college.Name);
                  const isSelectable = isCollegeSelectable(college.Name);
                  
                  return (
                    <div
                      key={college.Name}
                      className={cn(
                        "flex items-center space-x-2 p-2 rounded border",
                        isSelected ? "bg-primary/10 border-primary" : "hover:bg-accent",
                        !isSelectable && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleCollegeSelect(college)}
                        disabled={!isSelectable}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium block truncate">{college.Name}</span>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="shrink-0">
                            <Info className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <CollegeDetails college={college} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Parameter Selection */}
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">Select Parameters</CardTitle>
          <CardDescription>
            Choose parameters to compare colleges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Options Bar */}
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAllParameters}
                className="w-full sm:w-auto"
              >
                {areAllFilteredParametersSelected ? "Deselect All" : "Select All"}
              </Button>
              <div className="flex flex-1 gap-2 w-full sm:w-auto">
                <select
                  value={parameterOptions.filterBy}
                  onChange={(e) => setParameterOptions(prev => ({ ...prev, filterBy: e.target.value }))}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">All</option>
                  <option value="selected">Selected</option>
                  <option value="unselected">Unselected</option>
                </select>
                <select
                  value={parameterOptions.sortBy}
                  onChange={(e) => setParameterOptions(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="original">Original</option>
                  <option value="alphabetical">A-Z</option>
                </select>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search parameters..."
                value={parameterOptions.searchQuery}
                onChange={(e) => setParameterOptions(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Parameter List */}
            <ScrollArea className="h-[300px] w-full rounded-md border p-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredParameters.map((parameter) => {
                  const isSelected = selectedParameters.includes(parameter);
                  const info = parameterInfo[parameter];
                  
                  return (
                    <div
                      key={parameter}
                      className={cn(
                        "flex items-center space-x-2 p-2 rounded border",
                        isSelected ? "bg-primary/10 border-primary" : "hover:bg-accent"
                      )}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleParameter(parameter)}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium block truncate">{parameter}</span>
                      </div>
                      {info && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="shrink-0">
                                <Info className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{info}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 
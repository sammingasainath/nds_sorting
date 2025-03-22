import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { College } from '@/types';
import { Check, ArrowUpRight, SortAsc, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandInput,
  CommandEmpty,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { SelectionControlsHeader } from './SelectionControlsHeader';
import { SortingOptions } from '@/types/selection';
import { CollegeDetails } from './CollegeDetails';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  searchQuery?: string;
  sortBy?: string;
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
  isSubsequentIteration,
  searchQuery = '',
  sortBy = 'nirf'
}) => {
  const [collegeOptions, setCollegeOptions] = useState<SortingOptions>({
    sortBy: sortBy as SortingOptions['sortBy'],
    filterBy: 'all',
    searchQuery: searchQuery
  });

  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);

  // Filter and sort colleges based on options
  const filteredColleges = useMemo(() => {
    let result = [...colleges];

    if (collegeOptions.searchQuery) {
      const search = collegeOptions.searchQuery.toLowerCase();
      result = result.filter(college => 
        college.Name.toLowerCase().includes(search) || 
        (college['Unnamed: 0'] && college['Unnamed: 0'].toString().toLowerCase().includes(search))
      );
    }

    if (collegeOptions.filterBy === 'selected') {
      result = result.filter(college => selectedColleges.includes(college.Name));
    } else if (collegeOptions.filterBy === 'unselected') {
      result = result.filter(college => !selectedColleges.includes(college.Name));
    }

    if (collegeOptions.sortBy === 'alphabetical') {
      result.sort((a, b) => a.Name.localeCompare(b.Name));
    } else if (collegeOptions.sortBy === 'parameter' && collegeOptions.sortParameter) {
      // Sort by selected parameter
      result.sort((a, b) => {
        const valueA = a[collegeOptions.sortParameter as keyof College];
        const valueB = b[collegeOptions.sortParameter as keyof College];
        
        if (typeof valueA === 'number' && typeof valueB === 'number') {
          return valueB - valueA; // Higher values first
        }
        return 0;
      });
    } else if (collegeOptions.sortBy === 'singleParameter' && selectedParameters.length === 1) {
      // Sort by the only selected parameter
      const param = selectedParameters[0];
      result.sort((a, b) => {
        const valueA = a[param as keyof College];
        const valueB = b[param as keyof College];
        
        if (typeof valueA === 'number' && typeof valueB === 'number') {
          return valueB - valueA; // Higher values first
        }
        return 0;
      });
    }

    return result;
  }, [colleges, collegeOptions, selectedColleges, selectedParameters]);

  // Toggle college selection
  const handleCollegeSelect = useCallback((college: College) => {
    const isSelected = selectedColleges.includes(college.Name);
    if (isSelected) {
      onCollegesChange(selectedColleges.filter(name => name !== college.Name));
    } else {
      onCollegesChange([...selectedColleges, college.Name]);
    }
  }, [selectedColleges, onCollegesChange]);

  // Handle select all colleges
  const handleSelectAll = useCallback(() => {
    const allFilteredCollegeNames = filteredColleges.map(college => college.Name);
    const allSelected = allFilteredCollegeNames.every(name => selectedColleges.includes(name));
    
    if (allSelected) {
      onCollegesChange(selectedColleges.filter(name => !allFilteredCollegeNames.includes(name)));
    } else {
      onCollegesChange([...new Set([...selectedColleges, ...allFilteredCollegeNames])]);
    }
  }, [filteredColleges, selectedColleges, onCollegesChange]);

  // Update sort options based on selected parameters
  useEffect(() => {
    if (selectedParameters.length === 1) {
      // If exactly one parameter is selected, set it as the sort parameter
      setCollegeOptions(prev => ({
        ...prev,
        sortBy: 'singleParameter',
        sortParameter: selectedParameters[0]
      }));
    } else if (collegeOptions.sortBy === 'singleParameter') {
      // If was sorted by single parameter but now multiple are selected, switch to NIRF rank
      setCollegeOptions(prev => ({
        ...prev,
        sortBy: 'nirf',
        sortParameter: undefined
      }));
    }
  }, [selectedParameters]);

  // Update internal state when props change
  useEffect(() => {
    setCollegeOptions(prev => ({
      ...prev,
      sortBy: sortBy as SortingOptions['sortBy'],
      searchQuery: searchQuery
    }));
  }, [sortBy, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="h-32 w-32 rounded-full border-4 border-muted border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[500px] rounded-md border">
        <div className="p-1">
          {filteredColleges.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No colleges found.
            </div>
          ) : (
            <div className="space-y-1">
              {filteredColleges.map((college) => (
                <div
                  key={college.Name}
                  onClick={() => handleCollegeSelect(college)}
                  className={cn(
                    "flex items-center justify-between py-3 px-4 cursor-pointer rounded-sm hover:bg-accent hover:text-accent-foreground",
                    selectedColleges.includes(college.Name) && "bg-primary/10"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-sm border",
                      selectedColleges.includes(college.Name)
                        ? "border-primary bg-primary text-primary-foreground" 
                        : "border-muted-foreground"
                    )}>
                      {selectedColleges.includes(college.Name) && <Check className="h-3.5 w-3.5" />}
                    </div>
                    <span>{college.Name}</span>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2"
                        onClick={(e) => {
                          e.stopPropagation();
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
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {selectedColleges.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {selectedColleges.length} colleges selected
        </div>
      )}
    </div>
  );
}; 
import React, { useState, useMemo, useCallback } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { College } from '@/types';
import { Check, ArrowUpRight } from "lucide-react";
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

interface SelectionControlsProps {
  colleges: College[];
  parameters: string[];
  selectedColleges: string[];
  selectedParameters: string[];
  onCollegesChange: (colleges: string[]) => void;
  onParametersChange: (parameters: string[]) => void;
  isLoading?: boolean;
}

export const SelectionControls: React.FC<SelectionControlsProps> = ({
  colleges = [],
  parameters = [],
  selectedColleges = [],
  selectedParameters = [],
  onCollegesChange,
  onParametersChange,
  isLoading = false,
}) => {
  const [collegeOptions, setCollegeOptions] = useState<SortingOptions>({
    sortBy: 'original',
    filterBy: 'all',
    searchQuery: ''
  });

  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);

  // Filter and sort colleges based on options
  const filteredColleges = useMemo(() => {
    let result = [...colleges];

    // Apply search filter
    if (collegeOptions.searchQuery) {
      const search = collegeOptions.searchQuery.toLowerCase();
      result = result.filter(college =>
        college.Name.toLowerCase().includes(search) || 
        college['Unnamed: 0'].toString().toLowerCase().includes(search)
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
    } else if (collegeOptions.sortBy === 'nirf') {
      // NIRF sorting is based on the original order in the 'colleges' array
      // Ensure we're sorting back to the original order
      result.sort((a, b) => {
        const indexA = colleges.findIndex(c => c.Name === a.Name);
        const indexB = colleges.findIndex(c => c.Name === b.Name);
        return indexA - indexB;
      });
    } else if (collegeOptions.sortBy === 'parameter' && collegeOptions.sortParameter) {
      // Sort by specific parameter (descending - higher values first)
      result.sort((a, b) => {
        const valueA = Number(a[collegeOptions.sortParameter!]) || 0;
        const valueB = Number(b[collegeOptions.sortParameter!]) || 0;
        return valueB - valueA;
      });
    }

    return result;
  }, [colleges, collegeOptions, selectedColleges]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="h-32 w-32 rounded-full border-4 border-muted border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Search colleges..."
              value={collegeOptions.searchQuery}
              onChange={(e) => setCollegeOptions(prev => ({ ...prev, searchQuery: e.target.value }))}
            />
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleSelectAll}
        >
          {filteredColleges.every(c => selectedColleges.includes(c.Name)) ? 'Deselect All' : 'Select All'}
        </Button>
      </div>

      <ScrollArea className="h-[500px] rounded-md border">
        <div className="p-1">
          {filteredColleges.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No colleges found.
            </div>
          ) : (
            <div className="space-y-1">
              {filteredColleges.map((college, index) => (
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
                    <div>
                      <div className="font-medium">{college.Name}</div>
                      <div className="text-xs text-muted-foreground">
                        ID: {college['Unnamed: 0']} 
                        {collegeOptions.sortBy === 'nirf' && ` • NIRF Rank: ${colleges.findIndex(c => c.Name === college.Name) + 1}`}
                      </div>
                    </div>
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
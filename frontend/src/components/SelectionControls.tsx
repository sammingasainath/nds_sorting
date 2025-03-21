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
    searchQuery: '',
    nirfRangeMin: 1,
    nirfRangeMax: colleges.length
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

    // Apply NIRF rank range filter if set
    if (collegeOptions.nirfRangeMin !== undefined && collegeOptions.nirfRangeMax !== undefined) {
      // The index in the array + 1 is considered the NIRF rank
      const indexed = result.map((college, index) => ({ college, initialIndex: index + 1 }));
      result = indexed
        .filter(item => 
          item.initialIndex >= collegeOptions.nirfRangeMin! && 
          item.initialIndex <= collegeOptions.nirfRangeMax!
        )
        .map(item => item.college);
    }

    // Apply sorting
    if (collegeOptions.sortBy === 'alphabetical') {
      result.sort((a, b) => a.Name.localeCompare(b.Name));
    } else if (collegeOptions.sortBy === 'nirf') {
      // NIRF sorting is based on the original order
      // No need to sort as the original order is the NIRF rank
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
              {filteredColleges.map((college) => (
                <CommandItem
                  key={college.Name}
                  onSelect={() => handleCollegeSelect(college)}
                  className="flex items-center py-2 px-4"
                >
                  <div className={cn(
                    "h-4 w-4 mr-2 border rounded-sm flex items-center justify-center",
                    selectedColleges.includes(college.Name)
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground"
                  )}>
                    {selectedColleges.includes(college.Name) && <Check className="h-3 w-3" />}
                  </div>
                  <div className="flex flex-col flex-1">
                    <div className="font-medium">{college.Name}</div>
                    <div className="text-xs text-muted-foreground">
                      ID: {college['Unnamed: 0']} {collegeOptions.sortBy === 'nirf' ? `• NIRF Rank: ${colleges.findIndex(c => c.Name === college.Name) + 1}` : ''}
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-2 h-6 w-6">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                      <CollegeDetails college={college} parameters={parameters} />
                    </DialogContent>
                  </Dialog>
                </CommandItem>
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
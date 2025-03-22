import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check, CheckSquare, ArrowUpDown, ArrowUp, ArrowDown, SortAsc } from "lucide-react";
import { NonDominatedSortingResult } from '@/types';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Types
interface CollegeDetails {
    'Unnamed: 0': string;
    Name: string;
    [key: string]: string | number;
}

interface FrontGroup {
    front: number;
    colleges: CollegeDetails[];
}

interface ParetoVisualizationProps {
    data: NonDominatedSortingResult[];
    onSelectionChange: (collegeIds: string[]) => void;
    selectedIds: string[];
}

interface ScrollControlsProps {
    onScroll: (direction: 'left' | 'right') => void;
    canScrollLeft: boolean;
    canScrollRight: boolean;
}

// Helper Components
const ScrollControls: React.FC<ScrollControlsProps> = ({
    onScroll,
    canScrollLeft,
    canScrollRight,
}) => (
    <div className="flex justify-end gap-2 mb-4">
        <Button
            variant="outline"
            size="icon"
            onClick={() => onScroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
        >
            <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
            variant="outline"
            size="icon"
            onClick={() => onScroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll right"
        >
            <ChevronRight className="h-4 w-4" />
        </Button>
    </div>
);

const ParameterValue: React.FC<{
    param: string;
    value: string | number;
}> = ({ param, value }) => (
    <div className="grid grid-cols-2 gap-2 text-xs">
        <span className="text-muted-foreground truncate">{param}:</span>
        <span className="truncate">{value}</span>
    </div>
);

const CollegeCard: React.FC<{
    college: CollegeDetails;
    parameters: string[];
    isSelected?: boolean;
    onSelect?: (collegeId: string) => void;
}> = ({ college, parameters, isSelected, onSelect }) => {
    return (
        <div 
            className={cn(
                "p-4 hover:bg-accent/5 transition-colors cursor-pointer",
                isSelected && "bg-primary/10 hover:bg-primary/20"
            )}
            onClick={() => onSelect?.(college['Unnamed: 0'])}
        >
            <div className="flex items-start justify-between">
                <div>
                    <h4 className="font-medium">{college.Name}</h4>
                    <div className="mt-2 space-y-1">
                        {parameters.map(param => (
                            <p key={param} className="text-sm">
                                <span className="font-medium">{param}:</span>{' '}
                                {college[param]}
                            </p>
                        ))}
                    </div>
                </div>
                {isSelected && (
                    <div className="text-primary">
                        <Check className="h-5 w-5" />
                    </div>
                )}
            </div>
        </div>
    );
};

interface FrontBoxProps {
    frontNumber: number;
    colleges: NonDominatedSortingResult[];
    onCollegeSelect: (collegeIds: string[]) => void;
    selectedCollegeIds: string[];
}

// Add sort options type
type SortOption = 'nirf' | 'alphabetical' | 'parameter';

const FrontBox: React.FC<FrontBoxProps> = ({
    frontNumber,
    colleges,
    onCollegeSelect,
    selectedCollegeIds,
}) => {
    // Add state for sorting
    const [sortBy, setSortBy] = useState<SortOption>('nirf');
    const [selectedParameter, setSelectedParameter] = useState<string>('');

    const handleCollegeSelect = (collegeId: string) => {
        const newSelection = selectedCollegeIds.includes(collegeId)
            ? selectedCollegeIds.filter(id => id !== collegeId)
            : [...selectedCollegeIds, collegeId];
        onCollegeSelect(newSelection);
    };

    const handleSelectAllInFront = () => {
        const frontCollegeIds = colleges.map(result => result.college['Unnamed: 0']);
        const allFrontCollegesSelected = frontCollegeIds.every(id => selectedCollegeIds.includes(id)); 

        const newSelection = allFrontCollegesSelected
            ? selectedCollegeIds.filter(id => !frontCollegeIds.includes(id))
            : [...new Set([...selectedCollegeIds, ...frontCollegeIds])];

        onCollegeSelect(newSelection);
    };

    const isSelected = (collegeId: string) => selectedCollegeIds.includes(collegeId);

    // Get all parameters from the first college to use for parameter sorting
    const availableParameters = colleges.length > 0 ? Object.keys(colleges[0].college).filter(key => 
        key !== 'Unnamed: 0' && 
        key !== 'Name' && 
        key !== 'NIRF 2022 Rank' && 
        !key.startsWith('_')
    ) : [];

    // Sort colleges based on selected sort option
    const sortedColleges = [...colleges].sort((a, b) => {
        switch (sortBy) {
            case 'nirf':
                const rankA = parseInt(a.college['NIRF 2022 Rank'] as string) || 1000;
                const rankB = parseInt(b.college['NIRF 2022 Rank'] as string) || 1000;
                return rankA - rankB;
            
            case 'alphabetical':
                return (a.college.Name as string).localeCompare(b.college.Name as string);
            
            case 'parameter':
                if (selectedParameter) {
                    const valueA = parseFloat(a.college[selectedParameter] as string) || 0;
                    const valueB = parseFloat(b.college[selectedParameter] as string) || 0;
                    return valueB - valueA; // Higher values first
                }
                return 0;
            
            default:
                return 0;
        }
    });

    return (
        <div className="min-w-[300px] border rounded-lg p-4 bg-card">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">
                    Optimal Group {frontNumber}
                </h3>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAllInFront}
                        className="text-xs h-8"
                    >
                        {colleges.every(result => selectedCollegeIds.includes(result.college['Unnamed: 0']))
                            ? "Deselect All"
                            : "Select All"}
                    </Button>
                </div>
            </div>
            
            {/* Add sorting controls */}
            <div className="flex items-center gap-2 mb-3 mt-1">
                <Select
                    value={sortBy}
                    onValueChange={(value) => setSortBy(value as SortOption)}
                >
                    <SelectTrigger className="h-8 text-xs">
                        <div className="flex items-center gap-1">
                            {sortBy === 'nirf' && <SortAsc className="h-3 w-3" />}
                            {sortBy === 'alphabetical' && <ArrowUpDown className="h-3 w-3" />}
                            {sortBy === 'parameter' && <ArrowDown className="h-3 w-3" />}
                            <SelectValue placeholder="Sort by" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="nirf">NIRF Rank</SelectItem>
                        <SelectItem value="alphabetical">Alphabetical</SelectItem>
                        <SelectItem value="parameter">Parameter</SelectItem>
                    </SelectContent>
                </Select>
                
                {sortBy === 'parameter' && (
                    <Select
                        value={selectedParameter}
                        onValueChange={setSelectedParameter}
                        disabled={availableParameters.length === 0}
                    >
                        <SelectTrigger className="h-8 text-xs flex-1">
                            <SelectValue placeholder="Select parameter" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableParameters.map(param => (
                                <SelectItem key={param} value={param}>
                                    {param}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            <div className="space-y-2">
                {sortedColleges.map((result) => (
                    <div
                        key={result.college['Unnamed: 0']}
                        className={cn(
                            "p-3 rounded-md border transition-colors",
                            isSelected(result.college['Unnamed: 0'])
                                ? "bg-primary/10 border-primary/30"
                                : "bg-background hover:bg-accent/5 border-border"
                        )}
                        onClick={() => handleCollegeSelect(result.college['Unnamed: 0'])}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        checked={isSelected(result.college['Unnamed: 0'])}
                                        onCheckedChange={() => handleCollegeSelect(result.college['Unnamed: 0'])}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <div className="font-medium text-sm">
                                        {result.college.Name as string}
                                    </div>
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground flex items-center gap-2 ml-6">
                                    <span>
                                        NIRF: {result.college['NIRF 2022 Rank'] || 'N/A'}
                                    </span>
                                    
                                    {/* Show the parameter value when sorting by parameter */}
                                    {sortBy === 'parameter' && selectedParameter && (
                                        <span className="font-medium text-primary">
                                            {selectedParameter}: {result.college[selectedParameter] || 'N/A'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Main Component
export const ParetoVisualization: React.FC<ParetoVisualizationProps> = ({
    data,
    onSelectionChange,
    selectedIds,
}) => {
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = React.useState(false);
    const [canScrollRight, setCanScrollRight] = React.useState(false);

    // Define updateScrollButtons first
    const updateScrollButtons = React.useCallback(() => {
        if (!scrollAreaRef.current) return;
        
        const container = scrollAreaRef.current;
        const scrollContainer = container.querySelector('[data-radix-scroll-area-viewport]');
        
        if (!scrollContainer) return;
        
        setCanScrollLeft(scrollContainer.scrollLeft > 0);
        setCanScrollRight(
            scrollContainer.scrollLeft < scrollContainer.scrollWidth - scrollContainer.clientWidth - 1
        );
    }, []);

    // Define handleScrollEvent next
    const handleScrollEvent = React.useCallback(() => {
        updateScrollButtons();
    }, [updateScrollButtons]);

    // Group results by front
    const frontGroups = React.useMemo(() => {
        const groups = new Map<number, NonDominatedSortingResult[]>();
        data.forEach(result => {
            const frontNumber = result.frontNumber;
            if (!groups.has(frontNumber)) {
                groups.set(frontNumber, []);
            }
            groups.get(frontNumber)?.push(result);
        });
        return Array.from(groups.entries())
            .sort(([a], [b]) => a - b)
            .map(([front, colleges]) => ({ front, colleges }));
    }, [data]);

    // Define handleScroll after updateScrollButtons
    const handleScroll = React.useCallback((direction: 'left' | 'right') => {
        if (!scrollAreaRef.current) return;
        
        const container = scrollAreaRef.current;
        const scrollContainer = container.querySelector('[data-radix-scroll-area-viewport]');
        
        if (!scrollContainer) return;
        
        const scrollAmount = 320; // Width of a card + gap
        
        if (direction === 'left') {
            scrollContainer.scrollLeft -= scrollAmount;
        } else {
            scrollContainer.scrollLeft += scrollAmount;
        }
        
        // Update scroll buttons after scrolling
        setTimeout(updateScrollButtons, 100);
    }, [updateScrollButtons]);

    React.useEffect(() => {
        const container = scrollAreaRef.current;
        if (!container) return;

        const scrollContainer = container.querySelector('[data-radix-scroll-area-viewport]');
        if (!scrollContainer) return;

        // Add event listeners
        scrollContainer.addEventListener('scroll', handleScrollEvent);
        window.addEventListener('resize', handleScrollEvent);

        // Initial check
        updateScrollButtons();

        return () => {
            // Clean up event listeners
            scrollContainer.removeEventListener('scroll', handleScrollEvent);
            window.removeEventListener('resize', handleScrollEvent);
        };
    }, [updateScrollButtons, handleScrollEvent]);

    // Additional effect to update scroll buttons when data changes
    React.useEffect(() => {
        // Update scroll buttons when data changes
        if (data.length > 0) {
            // Small delay to ensure DOM is updated
            setTimeout(updateScrollButtons, 100);
        }
    }, [data, updateScrollButtons]);

    if (frontGroups.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                        No results available. Start sorting to see the Pareto fronts.
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle>Optimal Groups</CardTitle>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[200px] text-center">
                        <p className="text-muted-foreground">
                            No sorting results available. Select colleges and parameters, then run the sorting algorithm.
                        </p>
                    </div>
                ) : (
                    <>
                        <ScrollControls
                            onScroll={handleScroll}
                            canScrollLeft={canScrollLeft}
                            canScrollRight={canScrollRight}
                        />
                        <div ref={scrollAreaRef}>
                            <ScrollArea className="w-full">
                                <div className="flex gap-4 pb-4">
                                    {frontGroups.map((group) => (
                                        <FrontBox
                                            key={group.front}
                                            frontNumber={group.front}
                                            colleges={data.filter(item => item.frontNumber === group.front)}
                                            onCollegeSelect={onSelectionChange}
                                            selectedCollegeIds={selectedIds}
                                        />
                                    ))}
                                </div>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}; 
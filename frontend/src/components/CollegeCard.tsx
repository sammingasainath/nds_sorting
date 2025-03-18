import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button } from '@/components/ui/card';
import { CheckCircle, Circle, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const CollegeCard: React.FC<CollegeCardProps> = ({
    college,
    isSelected = false,
    onSelect,
    showDetails = false,
    onToggleDetails
}) => {
    // Ensure we have valid college data
    if (!college) return null;

    const handleSelect = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onSelect) {
            onSelect(college['Unnamed: 0']);
        }
    };

    const handleToggleDetails = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onToggleDetails) {
            onToggleDetails(college['Unnamed: 0']);
        }
    };

    return (
        <Card className={cn(
            "relative w-full transition-all duration-200 ease-in-out",
            isSelected ? "border-primary" : "border-border"
        )}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold truncate">
                        {college.Name || 'Unknown College'}
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSelect}
                        className={cn(
                            "h-8 w-8",
                            isSelected && "text-primary"
                        )}
                    >
                        {isSelected ? <CheckCircle className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Rank:</span>
                        <span className="font-medium">{college.PR || 'N/A'}</span>
                    </div>
                    {showDetails && (
                        <div className="space-y-2 mt-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Location:</span>
                                <span className="font-medium">{college.Location || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Type:</span>
                                <span className="font-medium">{college.Type || 'N/A'}</span>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="pt-0">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleDetails}
                    className="w-full flex items-center justify-center gap-2"
                >
                    {showDetails ? (
                        <>
                            <ChevronUp className="h-4 w-4" />
                            <span>Show Less</span>
                        </>
                    ) : (
                        <>
                            <ChevronDown className="h-4 w-4" />
                            <span>Show More</span>
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}; 
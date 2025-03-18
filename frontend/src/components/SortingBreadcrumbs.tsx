import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface SortingBreadcrumbsProps {
  iterations: {
    id: string;
    collegeCount: number;
    timestamp: number;
  }[];
  currentIterationId: string | null;
  onIterationClick?: (iterationId: string) => void;
}

export const SortingBreadcrumbs: React.FC<SortingBreadcrumbsProps> = ({
  iterations,
  currentIterationId,
  onIterationClick
}) => {
  if (iterations.length === 0) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
      <Button 
        variant="ghost" 
        className="p-0 h-auto font-medium text-primary hover:bg-transparent"
        onClick={() => onIterationClick?.(iterations[0].id)}
      >
        Initial Sort
      </Button>
      {iterations.slice(1).map((iteration, index) => (
        <React.Fragment key={iteration.id}>
          <ChevronRight className="h-4 w-4" />
          <Button
            variant="ghost"
            className={`p-0 h-auto hover:bg-transparent ${iteration.id === currentIterationId ? "font-medium text-primary" : ""}`}
            onClick={() => onIterationClick?.(iteration.id)}
          >
            Iteration {index + 1}
            <span className="ml-1 text-xs">
              ({iteration.collegeCount} colleges)
            </span>
          </Button>
        </React.Fragment>
      ))}
    </nav>
  );
}; 
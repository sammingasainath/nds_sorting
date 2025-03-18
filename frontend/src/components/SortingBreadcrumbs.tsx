import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { useSortingHistory } from '@/contexts/SortingHistoryContext';

interface SortingBreadcrumbsProps {
  iterations: {
    id: string;
    collegeCount: number;
    timestamp: number;
  }[];
  currentIterationId: string | null;
  onIterationClick: (iterationId: string) => void;
}

export const SortingBreadcrumbs: React.FC<SortingBreadcrumbsProps> = ({
  iterations,
  currentIterationId,
  onIterationClick
}) => {
  const { history } = useSortingHistory();

  if (!history || Object.keys(history.entries).length === 0) {
    return null;
  }

  // Get sorted entries from history
  const sortedEntries = Object.values(history.entries)
    .sort((a, b) => a.timestamp - b.timestamp);

  if (sortedEntries.length === 0) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
      <Button 
        variant="ghost" 
        className={`p-0 h-auto hover:bg-transparent ${
          sortedEntries[0].id === currentIterationId ? "font-medium text-primary" : ""
        }`}
        onClick={() => onIterationClick(sortedEntries[0].id)}
      >
        Initial Sort
        <span className="ml-1 text-xs">
          ({sortedEntries[0].selectedColleges.length} colleges)
        </span>
      </Button>

      {sortedEntries.slice(1).map((entry, index) => (
        <React.Fragment key={entry.id}>
          <ChevronRight className="h-4 w-4" />
          <Button
            variant="ghost"
            className={`p-0 h-auto hover:bg-transparent ${
              entry.id === currentIterationId ? "font-medium text-primary" : ""
            }`}
            onClick={() => onIterationClick(entry.id)}
          >
            Iteration {index + 1}
            <span className="ml-1 text-xs">
              ({entry.selectedColleges.length} colleges)
            </span>
          </Button>
        </React.Fragment>
      ))}
    </nav>
  );
}; 
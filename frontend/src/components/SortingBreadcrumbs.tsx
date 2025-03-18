import React from 'react';
import { ChevronRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSortingHistory } from '@/contexts/SortingHistoryContext';
import { useCollegeHistory } from '@/hooks/useCollegeHistory';

export const SortingBreadcrumbs: React.FC<{
  onReset: () => void;
  currentIterationId: string;
}> = ({ onReset, currentIterationId }) => {
  const { state } = useSortingHistory();
  const { isFirstIteration } = useCollegeHistory();

  // Get the chain of iterations leading to the current one
  const getIterationChain = () => {
    const chain = [];
    let currentId = currentIterationId;
    
    while (currentId && state.entries[currentId]) {
      chain.unshift({
        id: currentId,
        number: chain.length + 1
      });
      const entry = state.entries[currentId];
      currentId = entry.parentId || '';
    }
    
    return chain;
  };

  const iterationChain = getIterationChain();
  const isFirst = isFirstIteration(currentIterationId);

  if (isFirst && iterationChain.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mb-4 px-4 py-2 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-2 flex-1">
        <span className="text-sm text-muted-foreground">Sorting Path:</span>
        {iterationChain.map((iteration, index) => (
          <React.Fragment key={iteration.id}>
            {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            <span className="text-sm font-medium">
              Iteration {iteration.number}
            </span>
          </React.Fragment>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        className="gap-2"
      >
        <RotateCcw className="h-4 w-4" />
        New Sort
      </Button>
    </div>
  );
}; 
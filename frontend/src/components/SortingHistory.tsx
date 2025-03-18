import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { NonDominatedSortingResult } from '@/types';
import { cn } from '@/lib/utils';
import { useSortingHistory } from '@/contexts/SortingHistoryContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowLeft, History, ArrowRight, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

// Component for the Pareto front results in the main sorting page
interface SortingHistoryProps {
  results: NonDominatedSortingResult[];
  onSelect: (collegeIds: string[]) => void;
  selectedIds: string[];
}

export const SortingHistory: React.FC<SortingHistoryProps> = ({
  results,
  onSelect,
  selectedIds
}) => {
  // Group results by front number
  const frontGroups = React.useMemo(() => {
    const groups: Record<number, NonDominatedSortingResult[]> = {};
    
    if (!results || results.length === 0) {
      return [];
    }
    
    results.forEach(result => {
      const frontNumber = result.frontNumber;
      if (!groups[frontNumber]) {
        groups[frontNumber] = [];
      }
      groups[frontNumber].push(result);
    });
    
    return Object.entries(groups)
      .map(([front, colleges]) => ({
        front: parseInt(front),
        colleges
      }))
      .sort((a, b) => a.front - b.front);
  }, [results]);

  const handleCollegeSelect = (collegeId: string) => {
    const newSelection = selectedIds.includes(collegeId)
      ? selectedIds.filter(id => id !== collegeId)
      : [...selectedIds, collegeId];
    
    onSelect(newSelection);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Pareto Front Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        {frontGroups.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No sorting results available.
          </div>
        ) : (
          <div className="space-y-6">
            {frontGroups.map(group => (
              <div key={`front-${group.front}`} className="space-y-2">
                <h3 className="text-lg font-semibold">Front {group.front}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {group.colleges.map(result => {
                    const collegeId = result.college['Unnamed: 0'];
                    const isSelected = selectedIds.includes(collegeId);
                    
                    return (
                      <div 
                        key={collegeId}
                        className={cn(
                          "flex items-center space-x-2 p-3 rounded border cursor-pointer",
                          isSelected ? "bg-primary/10 border-primary" : "hover:bg-accent"
                        )}
                        onClick={() => handleCollegeSelect(collegeId)}
                      >
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={() => handleCollegeSelect(collegeId)}
                          className="pointer-events-none"
                        />
                        <div className="flex-1">
                          <span className="font-medium block">{result.college.Name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Component for the history page
export const SortingHistoryView: React.FC = () => {
  const { history } = useSortingHistory();
  const navigate = useNavigate();

  const sortedEntries = React.useMemo(() => {
    return Object.values(history.entries)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [history.entries]);

  const handleRestore = (entryId: string) => {
    navigate('/explore', { state: { restoreId: entryId } });
  };

  if (sortedEntries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You haven't performed any sorting operations yet.
          </p>
          <Button
            className="mt-4"
            onClick={() => navigate('/explore')}
          >
            Start Sorting
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sortedEntries.map((entry) => (
        <Card key={entry.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Sorting #{entry.id.slice(0, 8)}
              </CardTitle>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-1 h-4 w-4" />
                {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Selected Colleges:</span>{' '}
                {entry.selectedColleges.length}
              </div>
              <div>
                <span className="font-medium">Parameters:</span>{' '}
                {entry.selectedParameters.join(', ')}
              </div>
              <Button
                className="mt-4 w-full sm:w-auto"
                onClick={() => handleRestore(entry.id)}
              >
                Restore This Sort
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}; 
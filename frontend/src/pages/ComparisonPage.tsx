import React, { useState, useCallback, useEffect } from 'react';
import { SelectionControls } from '@/components/SelectionControls';
import { CollegeComparison } from '@/components/CollegeComparison';
import { useCollegeData } from '@/hooks/useCollegeData';
import { useCollegeHistory } from '@/hooks/useCollegeHistory';
import { useComparison } from '@/contexts/ComparisonContext';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ArrowLeft, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ComparisonTable } from '@/components/ComparisonTable';

export const ComparisonPage: React.FC = () => {
  const {
    colleges,
    parameters,
    selectedColleges,
    setSelectedColleges,
    selectedParameters,
    setSelectedParameters,
    loading
  } = useCollegeData();
  
  const location = useLocation();
  const { selectedForComparison, clearComparison } = useComparison();
  const navigate = useNavigate();

  // Add iteration state
  const [currentIterationId, setCurrentIterationId] = useState<string>(() => 
    `iteration-${Date.now()}`
  );
  const { saveIteration, getPreviouslySelectedColleges, isFirstIteration } = useCollegeHistory();

  // Calculate available colleges for display
  const availableColleges = React.useMemo(() => {
    if (isFirstIteration(currentIterationId)) {
      return colleges;
    }
    
    const previouslySelected = getPreviouslySelectedColleges(currentIterationId);
    if (previouslySelected) {
      return colleges.filter(college => previouslySelected.includes(college.Name));
    }
    
    return [];
  }, [colleges, currentIterationId, getPreviouslySelectedColleges, isFirstIteration]);

  // Effect to clear invalid selections when iteration changes
  useEffect(() => {
    if (!isFirstIteration(currentIterationId)) {
      const previouslySelected = getPreviouslySelectedColleges(currentIterationId);
      if (previouslySelected) {
        // Clear any selected colleges that weren't in the previous iteration
        const validSelections = selectedColleges.filter(
          college => previouslySelected.includes(college)
        );
        if (validSelections.length !== selectedColleges.length) {
          setSelectedColleges(validSelections);
        }
      }
    }
  }, [currentIterationId, selectedColleges, getPreviouslySelectedColleges, setSelectedColleges, isFirstIteration]);

  // Effect to set selected colleges from context or location state
  useEffect(() => {
    // Check if we have colleges from location state (direct navigation)
    const stateColleges = location.state?.selectedColleges;
    if (stateColleges && stateColleges.length > 0) {
      setSelectedColleges(stateColleges);
      // Clear the location state to avoid reapplying on navigation
      window.history.replaceState({}, document.title);
    } 
    // Otherwise check if we have colleges from the comparison context
    else if (selectedForComparison.length > 0 && selectedColleges.length === 0) {
      setSelectedColleges(selectedForComparison);
      // Clear the comparison context after applying
      clearComparison();
    }
  }, [location.state, selectedForComparison, selectedColleges.length, setSelectedColleges, clearComparison]);

  // Track if we're in a subsequent iteration (not the first one)
  const [isSubsequentIteration, setIsSubsequentIteration] = useState(() => {
    // Check localStorage directly
    try {
      const hasHistory = localStorage.getItem('collegeIterationHistory');
      const parsedHistory = hasHistory ? JSON.parse(hasHistory) : {};
      return Object.keys(parsedHistory).length > 0;
    } catch (e) {
      return false;
    }
  });

  // Update isSubsequentIteration when iterationId changes
  useEffect(() => {
    const isFirst = isFirstIteration(currentIterationId);
    setIsSubsequentIteration(!isFirst);
    
    console.log('🔄 [ComparisonPage] Updated isSubsequentIteration:', !isFirst);
  }, [currentIterationId, isFirstIteration]);

  // Log the current iteration state
  useEffect(() => {
    console.log('🔍 [ComparisonPage] Iteration state updated:', {
      iterationId: currentIterationId,
      isFirst: isFirstIteration(currentIterationId),
      isSubsequent: isSubsequentIteration,
      availableColleges: availableColleges.length,
      selectedColleges: selectedColleges.length,
      hasCompletedFirstIteration: localStorage.getItem('hasCompletedFirstIteration') === 'true'
    });
  }, [currentIterationId, isFirstIteration, isSubsequentIteration, availableColleges.length, selectedColleges.length]);

  // Handle starting a new iteration
  const handleNewIteration = useCallback(() => {
    if (selectedColleges.length === 0) return;
    
    console.log('🔄 [ComparisonPage] Starting new iteration with selected colleges:', selectedColleges);
    
    // Save current selection to history
    saveIteration(currentIterationId, selectedColleges);
    
    // Set flag in localStorage to indicate we're in a subsequent iteration
    localStorage.setItem('hasCompletedFirstIteration', 'true');
    
    // Generate new iteration ID
    const newIterationId = `iteration-${Date.now()}`;
    console.log('🆕 [ComparisonPage] Generated new iteration ID:', newIterationId);
    
    // Force isSubsequentIteration to true for the next render
    setIsSubsequentIteration(true);
    
    // Clear current selection since we're starting a new iteration
    setSelectedColleges([]);
    setSelectedParameters([]);
    
    // Set the new iteration ID last to trigger re-renders with cleared selections
    setCurrentIterationId(newIterationId);
    
    console.log('✅ [ComparisonPage] New iteration ID set:', newIterationId);
    
    // Force a re-render by updating a state variable
    setForceUpdate(prev => prev + 1);
    console.log('🔄 [ComparisonPage] Force update triggered:', forceUpdate + 1);
  }, [currentIterationId, selectedColleges, saveIteration, setSelectedColleges, setSelectedParameters]);

  // Add a state variable to force re-renders
  const [forceUpdate, setForceUpdate] = useState(0);

  // Force a complete remount of SelectionControls when iteration changes
  const selectionControlsKey = `selection-controls-${currentIterationId}-${forceUpdate}`;

  const handleNewComparison = () => {
    clearComparison();
    navigate('/explore');
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="gap-2"
              onClick={() => navigate('/explore')}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Explore
            </Button>
            <h1 className="text-2xl font-bold">College Comparison</h1>
          </div>
          <Button
            onClick={handleNewComparison}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Comparison
          </Button>
        </div>

        {selectedColleges.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Colleges Selected</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Select colleges from the explore page to compare them.
              </p>
              <Button
                className="mt-4 gap-2"
                onClick={() => navigate('/explore')}
              >
                <Plus className="h-4 w-4" />
                Add Colleges
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="rounded-lg border bg-card">
            <ComparisonTable colleges={selectedColleges} />
          </ScrollArea>
        )}
      </div>
    </Layout>
  );
}; 
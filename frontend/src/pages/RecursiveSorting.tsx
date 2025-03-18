import React, { useState, useEffect, useCallback } from 'react';
import { useCollegeData } from '@/hooks/useCollegeData';
import { SelectionControls } from '@/components/SelectionControls';
import { ParetoVisualization } from '@/components/ParetoVisualization';
import { Button } from '@/components/ui/button';
import { Play, Settings, Sparkles, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatInterface } from '@/components/LLMChat/ChatInterface';
import { InsightCard } from '@/components/LLMInsights/InsightCard';
import { ParameterSuggestion } from '@/components/LLMInsights/ParameterSuggestion';
import { ProviderSelector } from '@/components/APIKeyManagement/ProviderSelector';
import { AISidebarConfig } from '@/components/APIKeyManagement/AISidebarConfig';
import { useLLM } from '@/contexts/LLMContext';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useCollegeHistory } from '@/hooks/useCollegeHistory';
import { useSortingHistory } from '@/contexts/SortingHistoryContext';
import { SortingBreadcrumbs } from '@/components/SortingBreadcrumbs';

export const RecursiveSorting: React.FC = () => {
    const {
        colleges,
        parameters,
        selectedColleges,
        setSelectedColleges,
        selectedParameters,
        setSelectedParameters,
        sortingResults,
        setSortingResults,
        loading,
        error,
        runSorting,
        resetState
    } = useCollegeData();

    // Add college history hook
    const { saveIteration, isFirstIteration } = useCollegeHistory();
    
    // Add sorting history context
    const { addSorting, state: sortingHistoryState } = useSortingHistory();

    // Add iteration state
    const [currentIterationId, setCurrentIterationId] = useState<string>(() => 
        `iteration-${Date.now()}`
    );

    // Track if we're in a subsequent iteration
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

    const [selectedForNextIteration, setSelectedForNextIteration] = useState<string[]>([]);
    const navigate = useNavigate();
    const { llmService, isConfigured, initializeLLMService, hasSkippedConfig } = useLLM();
    const [collegeInsight, setCollegeInsight] = useState<string | null>(null);
    const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
    const [activeTab, setActiveTab] = useState<string>("selection");
    const [showAIInsights, setShowAIInsights] = useState<boolean>(false);
    const [needsApiKey, setNeedsApiKey] = useState(false);

    // Add college options state
    const [collegeOptions, setCollegeOptions] = useState<SortingOptions>(() => ({
        sortBy: 'original',
        filterBy: 'all',
        searchQuery: ''
    }));

    // Debug current tab
    useEffect(() => {
        console.log("Current active tab:", activeTab);
    }, [activeTab]);

    // Function to directly switch tabs - completely rewritten
    const switchTab = (tab: string) => {
        console.log(`ATTEMPTING TO SWITCH TAB TO: ${tab}`);
        // Force immediate state update
        setActiveTab(tab);
        
        // Log the state update
        console.log(`Tab state updated to: ${tab}`);
        
        // Force a re-render and DOM update
        requestAnimationFrame(() => {
            console.log(`Animation frame executed, tab should be: ${tab}`);
            // Dispatch an event to ensure any listeners update
            window.dispatchEvent(new Event('resize'));
        });
    };

    const handleStartSort = React.useCallback(() => {
        if (selectedColleges.length === 0 || selectedParameters.length === 0) {
            console.log('[handleStartSort] Cannot start - missing selections:', {
                collegesSelected: selectedColleges.length,
                parametersSelected: selectedParameters.length
            });
            return;
        }
        console.log('[handleStartSort] Starting sort with:', {
            selectedColleges,
            selectedParameters
        });
        
        // Log the actual college objects that match the selected IDs or names
        const matchingColleges = colleges.filter(college => 
            selectedColleges.includes(college.Name) || selectedColleges.includes(college['Unnamed: 0'])
        );
        console.log('[handleStartSort] Found matching colleges:', matchingColleges.length);
        console.log('[handleStartSort] College details:', matchingColleges.map(c => ({ 
            id: c['Unnamed: 0'], 
            name: c.Name,
            matchedById: selectedColleges.includes(c['Unnamed: 0']),
            matchedByName: selectedColleges.includes(c.Name)
        })));
        
        setSelectedForNextIteration([]); // Clear any previous selections
        runSorting();
    }, [selectedColleges, selectedParameters, runSorting, colleges]);

    // Effect to switch to Results tab after sorting is complete
    React.useEffect(() => {
        if (sortingResults.length > 0) {
            console.log('SORTING RESULTS DETECTED - SWITCHING TO RESULTS TAB');
            setActiveTab("results");
            
            // Save sorting results to history context
            console.log('Saving sorting results to history:', {
                selectedColleges,
                selectedParameters,
                sortingResults
            });
            
            addSorting({
                parentId: null,
                selectedColleges,
                selectedParameters,
                sortingResults
            });
        }
    }, [sortingResults, selectedColleges, selectedParameters, addSorting]);

    // Generate insights only when explicitly requested
    const generateInsights = async () => {
        setIsGeneratingInsight(true);
        setNeedsApiKey(false);

        try {
            // Initialize LLM service if needed
            if (!isConfigured) {
                const initialized = await initializeLLMService();
                if (!initialized) {
                    setNeedsApiKey(true);
                    setCollegeInsight('Please configure your API key in the settings to use AI features.');
                    setIsGeneratingInsight(false);
                    return;
                }
            }

            // Now we should have a valid llmService
            if (!llmService || sortingResults.length === 0) {
                setCollegeInsight('LLM service is not available or no sorting results to analyze.');
                setIsGeneratingInsight(false);
                return;
            }

            // Get the top colleges from the first front
            const topColleges = sortingResults
                .filter(result => result.frontNumber === 1)
                .map(result => result.college);

            // Generate insights
            const insight = await llmService.getCollegeInsights({
                colleges: topColleges,
                parameters: selectedParameters
            });

            setCollegeInsight(insight);
        } catch (error) {
            console.error('Error generating insights:', error);
            setCollegeInsight('Failed to generate insights. Please try again.');
        } finally {
            setIsGeneratingInsight(false);
        }
    };

    // Handle starting a new iteration with selected colleges
    const handleStartNewIterationClick = () => {
        if (selectedForNextIteration.length === 0) {
            console.log('No colleges selected for next iteration');
            return;
        }

        console.log('🔄 [RecursiveSorting] Starting new iteration with selected colleges:', selectedForNextIteration);
        
        // Convert college IDs to college names
        const selectedCollegeNames = colleges
            .filter(college => selectedForNextIteration.includes(college['Unnamed: 0']))
            .map(college => college.Name);
        
        console.log('🔄 [RecursiveSorting] Converted to college names:', selectedCollegeNames);
        
        // Save current selection to history
        saveIteration(currentIterationId, selectedCollegeNames);
        
        // Set flag in localStorage to indicate we're in a subsequent iteration
        localStorage.setItem('hasCompletedFirstIteration', 'true');
        
        // Generate new iteration ID
        const newIterationId = `iteration-${Date.now()}`;
        console.log('🆕 [RecursiveSorting] Generated new iteration ID:', newIterationId);
        
        // Force isSubsequentIteration to true for the next render
        setIsSubsequentIteration(true);
        
        // Set the selected colleges to those chosen for the next iteration
        setSelectedColleges(selectedCollegeNames);
        
        // Reset the sorting results
        setSortingResults([]);
        
        // Clear the selection for next iteration
        setSelectedForNextIteration([]);
        
        // Set the new iteration ID
        setCurrentIterationId(newIterationId);
        
        // Switch back to the selection tab
        switchTab("selection");
        
        // Log the state for debugging
        console.log('🔄 [RecursiveSorting] New iteration started with:', {
            newIterationId,
            selectedColleges: selectedCollegeNames,
            isSubsequentIteration: true
        });
    };

    const canStartSort = selectedColleges.length > 0 && selectedParameters.length > 0;

    // Load restored entry data when component mounts or when current entry ID changes
    React.useEffect(() => {
        const currentEntryId = sortingHistoryState.currentEntryId;
        if (currentEntryId && sortingHistoryState.entries[currentEntryId]) {
            console.log('Loading restored entry data:', currentEntryId);
            const entry = sortingHistoryState.entries[currentEntryId];
            
            // Set selected colleges and parameters
            setSelectedColleges(entry.selectedColleges);
            setSelectedParameters(entry.selectedParameters);
            
            // Set sorting results
            setSortingResults(entry.sortingResults);
            
            // Switch to results tab if there are sorting results
            if (entry.sortingResults.length > 0) {
                console.log('Switching to results tab due to restored entry');
                setActiveTab("results");
            } else {
                console.log('Switching to selection tab due to restored entry');
                setActiveTab("selection");
            }
        }
    }, [sortingHistoryState.currentEntryId, sortingHistoryState.entries, setSelectedColleges, setSelectedParameters, setSortingResults]);

    // Handle reset/new sort
    const handleReset = useCallback(() => {
        console.log('🔄 [RecursiveSorting] Resetting sort');
        
        // Clear selections
        setSelectedColleges([]);
        setSelectedParameters([]);
        
        // Clear sorting results
        setSortingResults([]);
        
        // Generate new iteration ID
        const newIterationId = `iteration-${Date.now()}`;
        setCurrentIterationId(newIterationId);
        
        // Reset iteration state
        setIsSubsequentIteration(false);
        localStorage.removeItem('hasCompletedFirstIteration');
        
        // Switch to selection tab
        setActiveTab("selection");
        
        // Reset college options to show all items
        setCollegeOptions({
            sortBy: 'original',
            filterBy: 'all',
            searchQuery: ''
        });
        
        console.log('✅ [RecursiveSorting] Sort reset complete');
    }, [setSelectedColleges, setSelectedParameters, setSortingResults]);

    if (loading) {
        return (
            <Layout>
                <motion.div 
                    className="flex h-screen items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div 
                        className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                </motion.div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto py-6 space-y-6">
                <SortingBreadcrumbs 
                    onReset={handleReset}
                    currentIterationId={currentIterationId}
                />
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex justify-between items-center mb-6">
                        <TabsList className="grid grid-cols-3">
                            <TabsTrigger value="selection">Selection</TabsTrigger>
                            <TabsTrigger value="results" disabled={sortingResults.length === 0}>Results</TabsTrigger>
                            <TabsTrigger value="insights" disabled={sortingResults.length === 0}>AI Insights</TabsTrigger>
                        </TabsList>
                        
                        <div className="flex gap-2">
                            <AISidebarConfig>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Settings className="h-4 w-4" />
                                    Configure AI
                                </Button>
                            </AISidebarConfig>
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <MessageSquare className="h-4 w-4" />
                                        Chat
                                    </Button>
                                </SheetTrigger>
                                <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                                    <SheetHeader>
                                        <SheetTitle>AI Assistant</SheetTitle>
                                        <SheetDescription>
                                            Ask questions about colleges, parameters, or the sorting process
                                        </SheetDescription>
                                    </SheetHeader>
                                    <div className="mt-4">
                                        <ChatInterface />
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>

                    <TabsContent value="selection" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <SelectionControls
                                    colleges={colleges}
                                    parameters={parameters}
                                    selectedColleges={selectedColleges}
                                    selectedParameters={selectedParameters}
                                    onCollegesChange={setSelectedColleges}
                                    onParametersChange={setSelectedParameters}
                                    isLoading={loading}
                                    iterationId={currentIterationId}
                                    isSubsequentIteration={isSubsequentIteration}
                                    collegeOptions={collegeOptions}
                                    setCollegeOptions={setCollegeOptions}
                                    key={`selection-controls-${currentIterationId}`
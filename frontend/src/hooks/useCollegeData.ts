import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { College, NonDominatedSortingResult } from '@/types';
import { nonDominatedSort } from '@/utils/sorting';

// Create an axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Mock data for development fallback
const mockColleges: College[] = [
    { 'Unnamed: 0': '1', Name: "MIT", Rank: 1, Research: 95, Teaching: 98, Employment: 92 },
    { 'Unnamed: 0': '2', Name: "Stanford", Rank: 2, Research: 94, Teaching: 96, Employment: 95 },
    { 'Unnamed: 0': '3', Name: "Harvard", Rank: 3, Research: 96, Teaching: 97, Employment: 90 },
    { 'Unnamed: 0': '4', Name: "Caltech", Rank: 4, Research: 97, Teaching: 92, Employment: 88 },
    { 'Unnamed: 0': '5', Name: "Oxford", Rank: 5, Research: 93, Teaching: 95, Employment: 89 }
];

const mockParameters = ["Rank", "Research", "Teaching", "Employment"];

export function useCollegeData() {
    const [colleges, setColleges] = useState<College[]>([]);
    const [parameters, setParameters] = useState<string[]>([]);
    const [selectedColleges, setSelectedColleges] = useState<string[]>([]);
    const [selectedParameters, setSelectedParameters] = useState<string[]>([]);
    const [sortingResults, setSortingResults] = useState<NonDominatedSortingResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUsingMockData, setIsUsingMockData] = useState(false);

    // Reset state for new iteration
    const resetState = useCallback(() => {
        setSelectedParameters([]);
        setSortingResults([]);
        setError(null);
        setLoading(false);
    }, []);

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [collegesResponse, parametersResponse] = await Promise.all([
                    api.get('/colleges'),
                    api.get('/parameters')
                ]);

                // Extract colleges from the actual API response structure
                if (collegesResponse.data.status === 'success') {
                    setColleges(collegesResponse.data.data);
                    // Extract parameters from the first college
                    if (collegesResponse.data.data.length > 0) {
                        const firstCollege = collegesResponse.data.data[0];
                        // Filter out non-parameter fields
                        const paramList = Object.keys(firstCollege).filter(key => 
                            !['Unnamed: 0', 'Name'].includes(key)
                        );
                        setParameters(paramList);
                    }
                    setError(null);
                    setIsUsingMockData(false);
                } else {
                    throw new Error('Invalid response format from server');
                }
            } catch (err) {
                console.warn('Failed to fetch from backend, using mock data:', err);
                // Fallback to mock data
                setColleges(mockColleges);
                setParameters(mockParameters);
                setIsUsingMockData(true);
                setError('Using mock data for demonstration. Backend connection failed.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Run sorting
    const runSorting = useCallback(async () => {
        if (selectedColleges.length === 0 || selectedParameters.length === 0) {
            setError('Please select both colleges and parameters before sorting.');
            return;
        }

        try {
            setLoading(true);
            // Get selected college objects - handle both Name and ID (Unnamed: 0) selection
            const selectedCollegeData = colleges.filter(college => 
                selectedColleges.includes(college.Name) || selectedColleges.includes(college['Unnamed: 0'])
            );

            if (selectedCollegeData.length === 0) {
                throw new Error('No matching colleges found');
            }

            // Perform client-side sorting
            const results = nonDominatedSort(selectedCollegeData, selectedParameters);
            
            if (results.length === 0) {
                throw new Error('Sorting produced no results');
            }

            setSortingResults(results);
            setError(null);
        } catch (err) {
            console.error('Error during sorting:', err);
            setError('Failed to perform sorting. Please try again.');
            setSortingResults([]);
        } finally {
            setLoading(false);
        }
    }, [selectedColleges, selectedParameters, colleges]);

    return {
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
        resetState,
        isUsingMockData
    };
} 
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { College, NonDominatedSortingResult } from '@/types';
import { nonDominatedSort } from '@/utils/sorting';

// Debug all available Vite environment variables
console.log('All Vite env variables:', import.meta.env);

// Get the API URL from the environment and ensure proper formatting
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const apiBaseUrl = rawBaseUrl.endsWith('/api') 
    ? rawBaseUrl.slice(0, -4) // Remove /api if it exists
    : rawBaseUrl;

console.log('Raw Base URL:', rawBaseUrl);
console.log('Processed API Base URL:', apiBaseUrl);

// Create axios instance with explicit error handling for the base URL
const api = axios.create({
    baseURL: `${apiBaseUrl}/api`,  // Ensure we have exactly one /api in the path
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 10000,
    withCredentials: false
});

// Add request interceptor for debugging
api.interceptors.request.use(
    (config) => {
        const fullUrl = `${config.baseURL}${config.url}`;
        console.log('Making request to:', fullUrl);
        console.log('Request headers:', config.headers);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for debugging
api.interceptors.response.use(
    (response) => {
        console.log('Received response from:', response.config.url);
        console.log('Response headers:', response.headers);
        console.log('Response data:', response.data);
        return response;
    },
    (error) => {
        console.error('Response error:', error);
        if (error.response) {
            console.error('Error response:', error.response.data);
            console.error('Error response headers:', error.response.headers);
            console.error('Error response status:', error.response.status);
        } else if (error.request) {
            console.error('Error request:', error.request);
        }
        return Promise.reject(error);
    }
);

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
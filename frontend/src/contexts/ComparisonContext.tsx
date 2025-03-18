import React, { createContext, useContext, useState, useCallback } from 'react';
import { College } from '@/types';

interface ComparisonContextType {
  selectedColleges: College[];
  addCollege: (college: College) => void;
  removeCollege: (collegeId: string) => void;
  clearComparison: () => void;
  isCollegeSelected: (collegeId: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedColleges, setSelectedColleges] = useState<College[]>([]);

  const addCollege = useCallback((college: College) => {
    setSelectedColleges(prev => {
      // Check if college is already selected
      if (prev.some(c => c['Unnamed: 0'] === college['Unnamed: 0'])) {
        return prev;
      }
      return [...prev, college];
    });
  }, []);

  const removeCollege = useCallback((collegeId: string) => {
    setSelectedColleges(prev => prev.filter(c => c['Unnamed: 0'] !== collegeId));
  }, []);

  const clearComparison = useCallback(() => {
    setSelectedColleges([]);
  }, []);

  const isCollegeSelected = useCallback((collegeId: string) => {
    return selectedColleges.some(c => c['Unnamed: 0'] === collegeId);
  }, [selectedColleges]);

  return (
    <ComparisonContext.Provider value={{
      selectedColleges,
      addCollege,
      removeCollege,
      clearComparison,
      isCollegeSelected
    }}>
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
}; 
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { SortingHistoryEntry, SortingHistoryState } from '@/types';

interface SortingHistoryContextType {
    history: SortingHistoryState;
    addEntry: (entry: Omit<SortingHistoryEntry, "id" | "timestamp">) => string;
    getEntry: (id: string) => SortingHistoryEntry | undefined;
    setCurrentEntry: (id: string | null) => void;
}

const SortingHistoryContext = createContext<SortingHistoryContextType | undefined>(undefined);

const STORAGE_KEY = 'sorting-history';

export const SortingHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [history, setHistory] = useState<SortingHistoryState>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                console.log('Loaded sorting history from localStorage on mount:', parsed);
                return parsed;
            } catch (e) {
                console.error('Failed to parse sorting history from localStorage:', e);
            }
        }
        return { entries: {}, currentEntryId: null };
    });

    useEffect(() => {
        console.log('Saved sorting history to localStorage:', history);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }, [history]);

    const addEntry = useCallback((entry: Omit<SortingHistoryEntry, "id" | "timestamp">) => {
        const id = crypto.randomUUID();
        const timestamp = Date.now();
        
        setHistory(prev => {
            const newEntry = {
                ...entry,
                id,
                timestamp
            };
            
            return {
                entries: {
                    ...prev.entries,
                    [id]: newEntry
                },
                currentEntryId: id
            };
        });
        
        return id;
    }, []);

    const getEntry = useCallback((id: string) => {
        return history.entries[id];
    }, [history.entries]);

    const setCurrentEntry = useCallback((id: string | null) => {
        setHistory(prev => ({
            ...prev,
            currentEntryId: id
        }));
    }, []);

    return (
        <SortingHistoryContext.Provider value={{
            history,
            addEntry,
            getEntry,
            setCurrentEntry
        }}>
            {children}
        </SortingHistoryContext.Provider>
    );
};

export const useSortingHistory = () => {
    const context = useContext(SortingHistoryContext);
    if (context === undefined) {
        throw new Error('useSortingHistory must be used within a SortingHistoryProvider');
    }
    return context;
}; 
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { NonDominatedSortingResult } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface SortingHistoryEntry {
    id: string;
    parentId: string | null;
    selectedColleges: string[];
    selectedParameters: string[];
    sortingResults: NonDominatedSortingResult[];
    timestamp: number;
}

interface SortingHistoryState {
    entries: Record<string, SortingHistoryEntry>;
    currentEntryId: string | null;
}

type SortingHistoryAction =
    | { type: 'ADD_ENTRY'; payload: Omit<SortingHistoryEntry, 'id' | 'timestamp'> }
    | { type: 'RESTORE_ENTRY'; payload: { entryId: string } };

const initialState: SortingHistoryState = {
    entries: {},
    currentEntryId: null,
};

function sortingHistoryReducer(
    state: SortingHistoryState,
    action: SortingHistoryAction
): SortingHistoryState {
    switch (action.type) {
        case 'ADD_ENTRY': {
            const id = uuidv4();
            return {
                ...state,
                entries: {
                    ...state.entries,
                    [id]: {
                        ...action.payload,
                        id,
                        timestamp: Date.now(),
                    },
                },
                currentEntryId: id,
            };
        }
        case 'RESTORE_ENTRY': {
            return {
                ...state,
                currentEntryId: action.payload.entryId,
            };
        }
        default:
            return state;
    }
}

interface SortingHistoryContextType {
    state: SortingHistoryState;
    addSorting: (entry: Omit<SortingHistoryEntry, 'id' | 'timestamp'>) => void;
    restoreEntry: (entryId: string) => void;
}

const SortingHistoryContext = createContext<SortingHistoryContextType | null>(null);

export function SortingHistoryProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(sortingHistoryReducer, initialState);

    const addSorting = useCallback((entry: Omit<SortingHistoryEntry, 'id' | 'timestamp'>) => {
        dispatch({ type: 'ADD_ENTRY', payload: entry });
    }, []);

    const restoreEntry = useCallback((entryId: string) => {
        dispatch({ type: 'RESTORE_ENTRY', payload: { entryId } });
    }, []);

    return (
        <SortingHistoryContext.Provider value={{ state, addSorting, restoreEntry }}>
            {children}
        </SortingHistoryContext.Provider>
    );
}

export function useSortingHistory() {
    const context = useContext(SortingHistoryContext);
    if (!context) {
        throw new Error('useSortingHistory must be used within a SortingHistoryProvider');
    }
    return context;
} 
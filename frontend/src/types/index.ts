export interface College {
    'Unnamed: 0': string;  // This is the actual ID field from the CSV
    Name: string;
    [key: string]: string | number; // For dynamic parameters
}

export interface ParetoFront {
    front: number;
    colleges: College[];
}

export interface NonDominatedSortingResult {
    college: College;
    frontNumber: number;
    dominatedBy: string[];
    dominates: string[];
}

export interface SortingHistoryEntry {
    id: string;
    parentId: string | null;
    selectedColleges: string[];
    selectedParameters: string[];
    sortingResults: NonDominatedSortingResult[];
    timestamp: number;
}

export interface SortingHistoryState {
    entries: Record<string, SortingHistoryEntry>;
    currentEntryId: string | null;
} 
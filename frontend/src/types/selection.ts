export type SortOption = 'original' | 'alphabetical' | 'parameter' | 'nirf';
export type FilterOption = 'all' | 'selected' | 'unselected';

export interface SortingOptions {
    sortBy: SortOption;
    sortParameter?: string;
    filterBy: FilterOption;
    searchQuery: string;
    nirfRangeMin?: number;
    nirfRangeMax?: number;
}

export interface SelectionState {
    options: SortingOptions;
    setOptions: (options: SortingOptions) => void;
} 
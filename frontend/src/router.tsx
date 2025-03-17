import { createBrowserRouter } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import HistoryPage from '@/pages/HistoryPage';
import HistoryDetailPage from '@/pages/HistoryDetailPage';
import ComparePage from '@/pages/ComparePage';
import SearchPage from '@/pages/SearchPage';
import SettingsPage from '@/pages/SettingsPage';
import SortPage from '@/pages/SortPage';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage />
    },
    {
        path: '/sort',
        element: <SortPage />
    },
    {
        path: '/history',
        element: <HistoryPage />
    },
    {
        path: '/history/:id',
        element: <HistoryDetailPage />
    },
    {
        path: '/compare',
        element: <ComparePage />
    },
    {
        path: '/search',
        element: <SearchPage />
    },
    {
        path: '/settings',
        element: <SettingsPage />
    }
]); 
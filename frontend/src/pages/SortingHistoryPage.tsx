import React from 'react';
import { Layout } from '@/components/Layout';
import { SortingHistory } from '@/components/SortingHistory';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SortingHistoryPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Layout>
            <div className="container mx-auto py-6">
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        className="gap-2"
                        onClick={() => navigate('/explore')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Explore
                    </Button>
                </div>
                <SortingHistory />
            </div>
        </Layout>
    );
}; 
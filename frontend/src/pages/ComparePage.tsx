import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCollegeData } from '@/hooks/useCollegeData';
import { useMobileDetect } from '@/hooks/useMobileDetect';
import { MobileCollegeCard } from '@/components/mobile/MobileCollegeCard';
import { MobileCollegeDetails } from '@/components/mobile/MobileCollegeDetails';
import { cn } from '@/lib/utils';

export const ComparePage = () => {
  const navigate = useNavigate();
  const isMobile = useMobileDetect();
  const { colleges, parameters } = useCollegeData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColleges, setSelectedColleges] = useState<string[]>([]);
  const [filteredColleges, setFilteredColleges] = useState(colleges);
  const [selectedCollege, setSelectedCollege] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Filter colleges based on search
  useEffect(() => {
    const filtered = colleges.filter(college => 
      college.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 10); // Limit to 10 results for performance
    setFilteredColleges(filtered);
  }, [searchQuery, colleges]);

  const handleSelectCollege = (id: string) => {
    setSelectedColleges(prev => {
      if (prev.includes(id)) {
        return prev.filter(collegeId => collegeId !== id);
      }
      if (prev.length < 4) {
        return [...prev, id];
      }
      return prev;
    });
  };

  const handleViewDetails = (id: string) => {
    const college = colleges.find(c => c.id === id);
    setSelectedCollege(college);
    setIsDetailsOpen(true);
  };

  const handleCompare = () => {
    if (selectedColleges.length >= 2) {
      navigate(`/compare/results?colleges=${selectedColleges.join(',')}`);
    }
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        {/* Search Section */}
        <div className="sticky top-0 bg-background/95 backdrop-blur z-30 p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search colleges..."
              className="w-full h-12 pl-10 pr-4 rounded-full bg-muted text-base"
            />
          </div>
          {selectedColleges.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedColleges.length} of 4 selected
              </span>
              <button
                onClick={() => setSelectedColleges([])}
                className="text-sm text-primary"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Selected Colleges */}
        {selectedColleges.length > 0 && (
          <div className="p-4 border-b">
            <h2 className="text-base font-medium mb-3">Selected Colleges</h2>
            <div className="space-y-2">
              {selectedColleges.map(id => {
                const college = colleges.find(c => c.id === id);
                if (!college) return null;
                return (
                  <div
                    key={id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <span className="text-sm">{college.name}</span>
                    <button
                      onClick={() => handleSelectCollege(id)}
                      className="p-1 hover:bg-background rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* College List */}
        <div className="p-4 space-y-2">
          {filteredColleges.map(college => (
            <MobileCollegeCard
              key={college.id}
              college={{
                id: college.id,
                name: college.name,
                selected: selectedColleges.includes(college.id)
              }}
              onSelect={handleSelectCollege}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>

        {/* Compare Button */}
        {selectedColleges.length >= 2 && (
          <div className="fixed bottom-20 left-4 right-4 p-4">
            <button
              onClick={handleCompare}
              className="w-full h-12 bg-primary text-primary-foreground rounded-full font-medium"
            >
              Compare {selectedColleges.length} Colleges
            </button>
          </div>
        )}

        {/* College Details Modal */}
        <MobileCollegeDetails
          college={selectedCollege}
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedCollege(null);
          }}
        />
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="container mx-auto py-8">
      {/* Desktop implementation */}
    </div>
  );
}; 
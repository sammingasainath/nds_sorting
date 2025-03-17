import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Linkedin, Youtube } from 'lucide-react';

interface MobileCollegeDetailsProps {
  college: {
    name: string;
    website?: string;
    linkedin?: string;
    youtube?: string;
    description?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MobileCollegeDetails: React.FC<MobileCollegeDetailsProps> = ({
  college,
  isOpen,
  onClose,
}) => {
  if (!college) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 right-0 bottom-0 z-50 bg-background rounded-t-[20px] max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold pr-8">{college.name}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
              {/* Description */}
              {college.description && (
                <div className="space-y-2">
                  <h3 className="text-base font-medium">About</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {college.description}
                  </p>
                </div>
              )}

              {/* Links */}
              <div className="space-y-2">
                <h3 className="text-base font-medium">Official Links</h3>
                <div className="space-y-3">
                  {college.website && (
                    <a
                      href={college.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 hover:bg-accent rounded-lg transition-colors"
                    >
                      <Globe className="w-5 h-5" />
                      <span className="text-sm">Official Website</span>
                    </a>
                  )}
                  
                  {college.linkedin && (
                    <a
                      href={college.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 hover:bg-accent rounded-lg transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                      <span className="text-sm">LinkedIn</span>
                    </a>
                  )}
                  
                  {college.youtube && (
                    <a
                      href={college.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 hover:bg-accent rounded-lg transition-colors"
                    >
                      <Youtube className="w-5 h-5" />
                      <span className="text-sm">YouTube</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Safe Area Spacing */}
            <div className="h-[env(safe-area-inset-bottom)]" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}; 
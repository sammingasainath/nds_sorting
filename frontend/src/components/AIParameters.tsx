import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Info } from 'lucide-react';

interface AIParametersProps {
  onSuggest: (query: string) => void;
}

export const AIParameters: React.FC<AIParametersProps> = ({ onSuggest }) => {
  const [query, setQuery] = useState('');

  const examples = [
    'Find colleges with strong research programs',
    'Identify colleges with good faculty-student ratio',
    'Suggest parameters for colleges with good placement records',
    'Parameters for colleges with diverse student population'
  ];

  return (
    <div className="ai-parameters">
      <h2 className="ai-parameters-title">
        AI Parameter Recommendations
      </h2>
      
      <p className="ai-parameters-description text-wrap">
        Get AI-powered parameter suggestions based on your goals (optional)
      </p>

      <div className="ai-parameters-note">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="text-wrap">
            AI suggestions are optional and not required for sorting. You can manually select parameters in the panel on the left.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., Find colleges with strong"
          className="ai-parameters-input"
        />
        <Button
          onClick={() => onSuggest(query)}
          className="ai-parameters-button"
        >
          Suggest
        </Button>
      </div>

      <div className="ai-parameters-examples">
        <h3 className="text-sm font-medium mb-2">Example goals you can try:</h3>
        <div className="space-y-2">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => {
                setQuery(example);
                onSuggest(example);
              }}
              className="ai-parameters-example w-full text-left hover:bg-accent/50 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}; 
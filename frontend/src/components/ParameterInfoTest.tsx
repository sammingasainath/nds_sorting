import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ParameterInfoCard } from './ParameterInfoCard';
import { parameterInfo } from '@/lib/parameterInfo';

export const ParameterInfoTest: React.FC = () => {
  // Get first three parameters for testing
  const testParameters = Object.keys(parameterInfo).slice(0, 3);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Parameter Info Card Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {testParameters.map(param => {
          const info = parameterInfo[param];
          return (
            <div key={param} className="flex items-center justify-between p-3 border rounded-md">
              <div>
                <p className="font-medium">{info.fullName} ({param})</p>
                <p className="text-sm text-muted-foreground">{info.category}</p>
              </div>
              <ParameterInfoCard
                name={info.fullName || param}
                code={param}
                description={info.description}
                examples={info.examples}
                importance={info.importance}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ParameterInfoTest; 
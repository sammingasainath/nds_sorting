import React from 'react';
import { Layout } from '@/components/Layout';
import { ParameterInfoTest } from '@/components/ParameterInfoTest';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const UITestPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container mx-auto py-10 px-4 max-w-[1400px]">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            UI Components Test
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>UI Improvements</CardTitle>
            <CardDescription>
              Preview of various UI components and improvements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="parameter-info">
              <TabsList>
                <TabsTrigger value="parameter-info">Parameter Info Cards</TabsTrigger>
                <TabsTrigger value="mobile">Mobile UI</TabsTrigger>
                <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
              </TabsList>
              <TabsContent value="parameter-info" className="mt-4">
                <ParameterInfoTest />
              </TabsContent>
              <TabsContent value="mobile" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Mobile UI Improvements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Mobile UI improvements will be displayed here.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="accessibility" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Accessibility Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Accessibility features will be displayed here.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default UITestPage; 
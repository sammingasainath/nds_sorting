import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { College } from '@/types';
import { useComparison } from '@/contexts/ComparisonContext';
import { Button } from './ui/button';
import { X } from 'lucide-react';

interface ComparisonTableProps {
    colleges: College[];
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ colleges }) => {
    const { removeCollege } = useComparison();

    // Get all unique parameters from colleges
    const parameters = React.useMemo(() => {
        const paramSet = new Set<string>();
        colleges.forEach(college => {
            Object.keys(college).forEach(key => {
                if (key !== 'Unnamed: 0' && key !== 'Name') {
                    paramSet.add(key);
                }
            });
        });
        return Array.from(paramSet);
    }, [colleges]);

    if (colleges.length === 0) {
        return null;
    }

    return (
        <div className="w-full overflow-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="min-w-[200px] font-medium">College Name</TableHead>
                        {parameters.map(param => (
                            <TableHead key={param} className="min-w-[150px] font-medium">
                                {param}
                            </TableHead>
                        ))}
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {colleges.map(college => (
                        <TableRow key={college['Unnamed: 0']}>
                            <TableCell className="font-medium">{college.Name}</TableCell>
                            {parameters.map(param => (
                                <TableCell key={param}>
                                    {college[param]}
                                </TableCell>
                            ))}
                            <TableCell>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeCollege(college['Unnamed: 0'])}
                                    className="h-8 w-8"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}; 
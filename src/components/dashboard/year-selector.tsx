'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface YearSelectorProps {
    selectedYear: number;
    onYearChange: (year: number) => void;
    availableYears: number[];
}

export function YearSelector({
    selectedYear,
    onYearChange,
    availableYears,
}: YearSelectorProps) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Año:</span>
            <Select
                value={selectedYear.toString()}
                onValueChange={(value) => onYearChange(parseInt(value))}
            >
                <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent>
                    {availableYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                            {year}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

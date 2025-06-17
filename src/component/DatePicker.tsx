'use client';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components_bonus/my-button/components/ui/button';
import { Calendar } from '../components_bonus/my-calendar/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '../components_bonus/my-popover/components/ui/popover';

interface DatePickerProps {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
    placeholder?: string;
}

export function DatePicker({
    date,
    setDate,
    placeholder = 'Chọn ngày',
}: DatePickerProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={'outline'}
                    className={cn(
                        'w-[200px] justify-start text-left font-normal',
                        !date && 'text-muted-foreground'
                    )}
                >

                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                        format(date, 'dd/MM/yyyy')
                    ) : (
                        <span>{placeholder}</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-gray-50 shadow-xl rounded-md border-gray-100">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}

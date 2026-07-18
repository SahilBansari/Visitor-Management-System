import React from 'react';
import { Input, Label, InputProps } from '@fluentui/react-components';

interface CustomTextInputProps extends Omit<InputProps, 'value' | 'onChange'> {
    label: string;
    helperText?: string;
    value: string | number;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
}

const TextInput: React.FC<CustomTextInputProps> = ({ label, helperText, ...props }) => {
    return (
        <div className="flex flex-col w-full group">
            {/* UPDATED: Darker, bolder label for better readability */}
            <Label size="small" className="text-gray-700 dark:text-gray-200 mb-1.5 font-semibold tracking-wide">{label}</Label>
            
            {/* UPDATED: Solid White Background, Visible Border, Shadow-sm, Professional Height (h-11) */}
            <Input
                appearance="outline"
                className="!bg-white !border !border-neutral-300 !rounded-md !h-11 !text-gray-900 focus-within:!border-[#1B7E6C] focus-within:!ring-2 focus-within:!ring-[#1B7E6C]/20 shadow-sm transition-all duration-200"
                {...props}
            />
             {helperText && <p className="mt-1.5 text-xs text-gray-500 px-1">{helperText}</p>}
        </div>
    );
};

export default TextInput;

import React from 'react';

interface CheckboxGroupProps {
  options: { value: string; label: string }[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  name: string;
  columns?: number;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ options, selectedValues, onChange, name, columns = 3 }) => {
  const handleCheckboxChange = (value: string) => {
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onChange(newSelectedValues);
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${columns} gap-2`}>
      {options.map(option => (
        <div key={option.value} className="flex items-center">
          <input
            id={`${name}-${option.value}`}
            name={name}
            type="checkbox"
            value={option.value}
            checked={selectedValues.includes(option.value)}
            onChange={() => handleCheckboxChange(option.value)}
            className="form-checkbox"
          />
          <label htmlFor={`${name}-${option.value}`} className="ml-2 block text-sm" style={{ color: 'var(--color-text-default)' }}>
            {option.label}
          </label>
        </div>
      ))}
    </div>
  );
};
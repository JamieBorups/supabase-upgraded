
import React, { useState } from 'react';

interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({ tags, onChange, placeholder = "Add tags..." }) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = inputValue.trim();
            if (newTag && !tags.includes(newTag)) {
                onChange([...tags, newTag]);
            }
            setInputValue('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        onChange(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div>
            <div className="flex flex-wrap gap-2 p-2 border border-slate-400 rounded-md bg-white">
                {tags.map(tag => (
                    <span key={tag} className="flex items-center gap-2 bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="text-blue-500 hover:text-blue-700">&times;</button>
                    </span>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-grow bg-transparent outline-none p-1 text-sm"
                    placeholder={tags.length === 0 ? placeholder : ''}
                />
            </div>
             <p className="text-xs text-slate-500 mt-1">Separate tags with a comma or press Enter.</p>
        </div>
    );
};

export default TagInput;

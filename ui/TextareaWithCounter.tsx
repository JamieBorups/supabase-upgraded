
import React from 'react';

interface TextareaWithCounterProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  wordLimit: number;
}

export const TextareaWithCounter: React.FC<TextareaWithCounterProps> = ({ wordLimit, value, ...props }) => {
  const countWords = (text: string) => {
    if (!text) return 0;
    // This regex handles multiple spaces between words and leading/trailing spaces correctly.
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };
  
  // The word count is derived directly from the `value` prop on every render.
  // This removes the need for internal state and ensures the count is always
  // in sync with the displayed text, whether it's changed by user typing or by an external update (like AI integration).
  const wordCount = countWords(value as string || '');

  return (
    <div>
      <textarea
        {...props}
        value={value}
        className={`block w-full px-3 py-2 bg-white border border-slate-400 rounded-md shadow-sm placeholder-slate-400 
                   focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent 
                   sm:text-sm transition-shadow duration-150 ${props.className}`}
      />
      <div className="text-right text-xs text-slate-500 mt-1" aria-live="polite">
        {wordLimit - wordCount} words left
      </div>
    </div>
  );
};

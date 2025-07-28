
import React from 'react';

interface TextareaWithCharacterCounterProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  characterLimit: number;
}

export const TextareaWithCharacterCounter: React.FC<TextareaWithCharacterCounterProps> = ({ characterLimit, value, ...props }) => {
  const characterCount = (value as string || '').length;
  const isOverLimit = characterCount > characterLimit;

  return (
    <div>
      <textarea
        {...props}
        value={value}
        className={`form-textarea ${props.className || ''} ${isOverLimit ? 'border-red-500 focus:ring-red-500' : ''}`}
        maxLength={characterLimit}
      />
      <div 
        className={`text-right text-xs mt-1 ${isOverLimit ? 'text-red-600 font-bold' : 'text-slate-500'}`} 
        aria-live="polite"
      >
        {characterCount} / {characterLimit} characters
      </div>
    </div>
  );
};

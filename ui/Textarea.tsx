
import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  // no custom props needed for now
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>((props, ref) => {
  return (
    <textarea
      {...props}
      ref={ref}
      className={`block w-full px-3 py-2 bg-white border border-slate-400 rounded-md shadow-sm placeholder-slate-400 
                 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent 
                 sm:text-sm transition-shadow duration-150 ${props.className || ''}`}
    />
  );
});

Textarea.displayName = 'Textarea';

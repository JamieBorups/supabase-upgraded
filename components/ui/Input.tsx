
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  //
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return (
    <input
      {...props}
      ref={ref}
      className={`form-input ${props.className || ''}`}
    />
  );
});

Input.displayName = 'Input';
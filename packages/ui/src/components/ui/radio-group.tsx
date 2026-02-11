'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  onChange: (value: string) => void;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps {
  name: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

function RadioGroup({
  name,
  value: controlledValue,
  defaultValue,
  onValueChange,
  children,
  className,
}: RadioGroupProps): React.ReactElement {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue ?? '');
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const onChange = React.useCallback(
    (v: string) => {
      if (!isControlled) setUncontrolledValue(v);
      onValueChange?.(v);
    },
    [isControlled, onValueChange],
  );

  const ctx: RadioGroupContextValue = { name, value, onChange };
  return (
    <RadioGroupContext.Provider value={ctx}>
      <div className={cn('grid gap-2', className)} role="radiogroup">
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

export interface RadioGroupItemProps {
  value: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function RadioGroupItem({
  value,
  id,
  disabled,
  className,
  children,
}: RadioGroupItemProps): React.ReactElement {
  const ctx = React.useContext(RadioGroupContext);
  const inputId = id ?? `radio-${value}`;
  const checked = ctx?.value === value;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        'flex items-center gap-2 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
    >
      <input
        id={inputId}
        type="radio"
        name={ctx?.name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => ctx?.onChange(value)}
        className="h-4 w-4 rounded-full border border-input accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      {children}
    </label>
  );
}

export { RadioGroup, RadioGroupItem };

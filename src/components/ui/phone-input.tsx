import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import * as RPNInput from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export type PhoneInputValue = RPNInput.Value;

type PhoneInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> &
  Omit<RPNInput.Props<typeof RPNInput.default>, 'onChange'> & {
    onChange?: (value: string) => void;
  };

const PhoneInput = React.forwardRef<React.ElementRef<typeof RPNInput.default>, PhoneInputProps>(
  ({ className, onChange, ...props }, ref) => (
    <RPNInput.default
      ref={ref}
      className={cn('flex', className)}
      flagComponent={FlagComponent}
      countrySelectComponent={CountrySelect}
      inputComponent={InputComponent}
      onChange={(value) => onChange?.(value ?? '')}
      {...props}
    />
  ),
);
PhoneInput.displayName = 'PhoneInput';

const InputComponent = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, ...props }, ref) => (
    <Input
      className={cn('rounded-s-none rounded-e-lg h-11 text-base relative z-10', className)}
      autoComplete="new-password"
      {...props}
      ref={ref}
    />
  ),
);
InputComponent.displayName = 'PhoneInputField';

type CountrySelectOption = { label: string; value: RPNInput.Country };

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  onChange: (value: RPNInput.Country) => void;
  options: CountrySelectOption[];
};

const CountrySelect = ({ disabled, value, onChange, options }: CountrySelectProps) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

  React.useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1.5 px-3 h-11',
          'rounded-s-lg border border-r-0 border-input bg-background',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        <FlagComponent country={value} countryName={value} />
        <ChevronsUpDown className={cn('h-4 w-4 opacity-50 shrink-0', disabled && 'hidden')} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-[200] mt-1 w-72 rounded-md border bg-popover shadow-md">
          <div className="flex items-center border-b px-3">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country..."
              className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto p-1">
            {filtered.length === 0 && (
              <li className="py-6 text-center text-sm text-muted-foreground">No country found.</li>
            )}
            {filtered.map((option) => (
              <li
                key={option.value ?? 'ZZ'}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                  setSearch('');
                }}
                className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
              >
                <FlagComponent country={option.value} countryName={option.label} />
                <span className="flex-1">{option.label}</span>
                {option.value && (
                  <span className="text-foreground/50 shrink-0">
                    {`+${RPNInput.getCountryCallingCode(option.value)}`}
                  </span>
                )}
                <Check
                  className={cn('h-4 w-4 shrink-0', option.value === value ? 'opacity-100' : 'opacity-0')}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];
  return (
    <span className="overflow-hidden rounded-sm w-6 h-4 shrink-0 [&_svg]:w-full [&_svg]:h-full [&_svg]:object-cover">
      {Flag && <Flag title={countryName} />}
    </span>
  );
};

export { PhoneInput };

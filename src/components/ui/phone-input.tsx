import * as React from 'react';
import { Check, ChevronsUpDown, Globe } from 'lucide-react';
import * as RPNInput from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import countryLabels from 'react-phone-number-input/locale/en.json';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export type PhoneInputValue = RPNInput.Value;

type PhoneInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> & {
  value?: string;
  defaultCountry?: RPNInput.Country;
  onChange?: (value: string) => void;
};

function parsePhone(text: string, country?: RPNInput.Country) {
  const phone = RPNInput.parsePhoneNumber(text, { defaultCountry: country, extract: false });
  // Extensions are not supported by the booking API; don't silently discard one.
  return phone?.ext ? undefined : phone;
}

function formatPhone(text: string, country?: RPNInput.Country) {
  const phone = parsePhone(text, country);
  return phone?.isValid() ? phone.formatInternational() : text;
}

const countryOptions = [
  { label: countryLabels.ZZ, value: undefined },
  ...RPNInput.getCountries()
    .map((country) => ({ label: countryLabels[country] || country, value: country }))
    .sort((a, b) => a.label.localeCompare(b.label, 'en')),
];

const callingCodePrefixes = [...new Set(RPNInput.getCountries().map((country) => `+${RPNInput.getCountryCallingCode(country)}`))];

function nationalText(text: string, country?: RPNInput.Country) {
  const phone = parsePhone(text, country);
  if (phone) return phone.nationalNumber;
  // Parsing needs at least two national digits. Preserve even a single digit
  // when changing country after a partial international number such as +4207.
  const compact = text.replace(/[\s()-]/g, '').replace(/^00/, '+');
  const prefix = callingCodePrefixes.find((code) => compact.startsWith(code));
  return prefix ? compact.slice(prefix.length) : compact === '+' ? '' : text;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value = '', defaultCountry = 'CZ', onChange, onBlur, disabled, readOnly, ...props }, ref) => {
    // Keep the user's draft separate from the E.164 value reflected by the form.
    // Writing that normalized value back on each keystroke would move the caret.
    const [text, setText] = React.useState(() => formatPhone(value, defaultCountry));
    const [country, setCountry] = React.useState<RPNInput.Country | undefined>(() => {
      const phone = parsePhone(value, defaultCountry);
      return phone ? phone.country : defaultCountry;
    });
    const lastReportedValue = React.useRef(value);
    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => inputRef.current!, []);

    React.useEffect(() => {
      if (value === lastReportedValue.current) return;
      lastReportedValue.current = value;
      const phone = parsePhone(value, defaultCountry);
      setCountry(phone ? phone.country : defaultCountry);
      setText(formatPhone(value, defaultCountry));
    }, [value, defaultCountry]);

    const reportValue = (nextText: string, nextCountry?: RPNInput.Country) => {
      const phone = parsePhone(nextText, nextCountry);
      const nextValue = phone?.number ?? '';
      lastReportedValue.current = nextValue;
      onChange?.(nextValue);
      return phone;
    };

    const handleCountryChange = (nextCountry?: RPNInput.Country) => {
      const phone = parsePhone(text, country);
      // Reinterpret national digits under the chosen country, not an old +prefix.
      const nextText = nextCountry ? nationalText(text, country) : phone?.number ?? text;
      setCountry(nextCountry);
      setText(nextText);
      reportValue(nextText, nextCountry);
      inputRef.current?.focus({ preventScroll: true });
    };

    return (
      <div className={cn('flex min-w-0', className)}>
        <CountrySelect
          value={country}
          options={countryOptions}
          onChange={handleCountryChange}
          disabled={disabled || readOnly}
        />
        <Input
          name="phone"
          autoComplete="tel"
          inputMode="tel"
          {...props}
          type="tel"
          ref={inputRef}
          disabled={disabled}
          readOnly={readOnly}
          className="min-w-0 rounded-s-none rounded-e-lg h-11 text-base md:text-base relative z-10"
          value={text}
          onChange={(event) => {
            const nextText = event.target.value;
            setText(nextText);
            const phone = reportValue(nextText, country);
            if (phone?.country) setCountry(phone.country);
            else if (phone?.isNonGeographic()) setCountry(undefined);
          }}
          onBlur={(event) => {
            setText(formatPhone(event.currentTarget.value, country));
            onBlur?.(event);
          }}
        />
      </div>
    );
  },
);
PhoneInput.displayName = 'PhoneInput';

type CountrySelectOption = { label: string; value?: RPNInput.Country };

type CountrySelectProps = {
  disabled?: boolean;
  value?: RPNInput.Country;
  onChange: (value?: RPNInput.Country) => void;
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
        aria-label={`${countryLabels.country}: ${value ? countryLabels[value] : countryLabels.ZZ}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1.5 px-3 h-11',
          'rounded-s-lg border border-r-0 border-input bg-background',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        <FlagComponent country={value} countryName={value ? countryLabels[value] : countryLabels.ZZ} />
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
              aria-label="Search country"
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.stopPropagation();
                  setOpen(false);
                  setSearch('');
                  containerRef.current?.querySelector('button')?.focus();
                }
              }}
              className="flex h-11 w-full bg-transparent py-3 text-base outline-none placeholder:text-muted-foreground"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto p-1">
            {filtered.length === 0 && (
              <li className="py-6 text-center text-sm text-muted-foreground">No country found.</li>
            )}
            {filtered.map((option) => (
              <li key={option.value ?? 'ZZ'}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                    setSearch('');
                  }}
                  className="flex min-h-11 w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  <FlagComponent country={option.value} countryName={option.label} />
                  <span className="flex-1">{option.label}</span>
                  {option.value && (
                    <span className="text-foreground/50 shrink-0">
                      {`+${RPNInput.getCountryCallingCode(option.value)}`}
                    </span>
                  )}
                  <Check
                    aria-hidden="true"
                    className={cn('h-4 w-4 shrink-0', option.value === value ? 'opacity-100' : 'opacity-0')}
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const FlagComponent = ({ country, countryName }: { country?: RPNInput.Country; countryName: string }) => {
  const Flag = country ? flags[country] : undefined;
  return (
    <span className="overflow-hidden rounded-sm w-6 h-4 shrink-0 [&_svg]:w-full [&_svg]:h-full [&_svg]:object-cover">
      {Flag ? <Flag title={countryName} /> : <Globe aria-hidden="true" />}
    </span>
  );
};

export { PhoneInput };

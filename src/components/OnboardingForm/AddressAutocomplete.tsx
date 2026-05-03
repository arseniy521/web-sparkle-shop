import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useMapyCzSuggest, MapySuggestion } from '@/hooks/useMapyCzSuggest';
import { AddressGeo } from './useOnboardingForm';
import { cn } from '@/lib/utils';

interface AddressAutocompleteProps
  extends Omit<React.ComponentProps<typeof Input>, 'onChange' | 'onSelect' | 'value'> {
  value: string;
  onValueChange: (value: string) => void;
  onSelect: (geo: AddressGeo) => void;
}

function suggestionToGeo(s: MapySuggestion): AddressGeo {
  const country = s.regionalStructure.find((r) => r.type === 'regional.country');
  const city = s.regionalStructure.find((r) => r.type === 'regional.municipality');
  const cityPart = s.regionalStructure.find((r) => r.type === 'regional.municipality_part');
  return {
    label: s.location ? `${s.name}, ${s.location}` : s.name,
    lat: s.position.lat,
    lon: s.position.lon,
    zip: s.zip ?? null,
    city: city?.name ?? null,
    cityPart: cityPart?.name ?? null,
    country: country?.isoCode ?? 'CZE',
    source: 'mapy',
  };
}

export const AddressAutocomplete = forwardRef<HTMLInputElement, AddressAutocompleteProps>(
  ({ value, onValueChange, onSelect, className, onBlur, onFocus, onKeyDown, ...rest }, forwardedRef) => {
    const { t } = useTranslation();
    const reactId = useId();
    const listId = reactId.replace(/:/g, '');
    const { results, loading, error } = useMapyCzSuggest(value);
    const [focused, setFocused] = useState(false);
    const [highlightIdx, setHighlightIdx] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const blurTimerRef = useRef<number | null>(null);
    const safeHighlightIdx = useMemo(
      () => Math.min(highlightIdx, Math.max(0, results.length - 1)),
      [highlightIdx, results.length],
    );

    const setRefs = useCallback(
      (el: HTMLInputElement | null) => {
        inputRef.current = el;
        if (typeof forwardedRef === 'function') {
          forwardedRef(el);
        } else if (forwardedRef) {
          forwardedRef.current = el;
        }
      },
      [forwardedRef],
    );

    useEffect(() => {
      return () => {
        if (blurTimerRef.current !== null) {
          window.clearTimeout(blurTimerRef.current);
        }
      };
    }, []);

    const showSuggestions = focused && results.length > 0;
    const showLoading = focused && loading;
    const showNoResults =
      focused &&
      !loading &&
      !error &&
      value.trim().length >= 3 &&
      results.length === 0;
    const showError = focused && !loading && error;
    const open = showSuggestions || showLoading || showNoResults || showError;

    const handleSelect = (s: MapySuggestion) => {
      const geo = suggestionToGeo(s);
      onValueChange(geo.label);
      onSelect(geo);
      setFocused(false);
      inputRef.current?.blur();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(e);
      if (!showSuggestions) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightIdx((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = results[safeHighlightIdx];
        if (item) handleSelect(item);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setFocused(false);
      }
    };

    const activeOptionId =
      showSuggestions && results.length > 0 ? `${listId}-opt-${safeHighlightIdx}` : undefined;

    return (
      <div className="relative">
        <Input
          ref={setRefs}
          role="combobox"
          aria-expanded={open}
          aria-controls={showSuggestions ? listId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={activeOptionId}
          value={value}
          onChange={(e) => {
            onValueChange(e.target.value);
            setHighlightIdx(0);
          }}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            if (blurTimerRef.current !== null) {
              window.clearTimeout(blurTimerRef.current);
            }
            blurTimerRef.current = window.setTimeout(() => setFocused(false), 150);
            onBlur?.(e);
          }}
          onKeyDown={handleKeyDown}
          className={cn('pr-10', className)}
          autoComplete="off"
          {...rest}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground pointer-events-none" />
        )}
        {open && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border bg-popover p-1 shadow-md">
            {showSuggestions && (
              <ul role="listbox" id={listId} aria-label={t('onboarding.step2.addressLabel')} className="max-h-56 overflow-y-auto">
                {results.map((s, i) => (
                  <li
                    key={s.id}
                    id={`${listId}-opt-${i}`}
                    role="option"
                    aria-selected={i === safeHighlightIdx}
                    onMouseDown={(e) => e.preventDefault()}
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(s)}
                    onMouseEnter={() => setHighlightIdx(i)}
                    className={cn(
                      'flex items-start gap-2 px-2 py-2 rounded-md cursor-pointer text-sm',
                      i === safeHighlightIdx ? 'bg-muted' : 'hover:bg-muted/50',
                    )}
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="font-medium text-foreground truncate">{s.name}</div>
                      {s.location && (
                        <div className="text-xs text-muted-foreground truncate">{s.location}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {showLoading && !showSuggestions && (
              <div className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('onboarding.step2.addressSearching')}
              </div>
            )}
            {showNoResults && (
              <div className="px-2 py-2 text-sm text-muted-foreground">
                {t('onboarding.step2.addressNoResults')}
              </div>
            )}
            {showError && (
              <div className="px-2 py-2 text-sm text-destructive">
                {t('onboarding.step2.addressRequestFailed')}
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);
AddressAutocomplete.displayName = 'AddressAutocomplete';

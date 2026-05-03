import { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionStepProps {
  number: number;
  title: string;
  isOpen: boolean;
  isCompleted: boolean;
  summary?: string | null;
  onOpen: () => void;
  children: ReactNode;
}

export const AccordionStep = ({
  number,
  title,
  isOpen,
  isCompleted,
  summary,
  onOpen,
  children,
}: AccordionStepProps) => {
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-background text-left transition-colors',
          isCompleted ? 'hover:bg-muted/40' : 'hover:bg-muted/20',
        )}
      >
        <div
          className={cn(
            'h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0',
            isCompleted
              ? 'bg-primary text-primary-foreground'
              : 'border border-border text-muted-foreground',
          )}
        >
          {isCompleted ? <Check className="h-3.5 w-3.5" /> : number}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground">{title}</div>
          {isCompleted && summary && (
            <div className="text-xs text-muted-foreground truncate">{summary}</div>
          )}
        </div>
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-primary/30 bg-background shadow-sm">
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold flex-shrink-0">
          {number}
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="px-4 pb-4">{children}</div>
    </div>
  );
};

import { useTranslation } from './i18n';
import type { OnboardingFormData } from '@/scripts/draft-types';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface Step5NoteProps {
  data: OnboardingFormData;
  setField: <K extends keyof OnboardingFormData>(key: K, value: OnboardingFormData[K]) => void;
}

const MAX_LEN = 1000;

export const Step5Note = ({ data, setField }: Step5NoteProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <Label htmlFor="onboarding-note" className="text-xs">
        {t('onboarding.step5.noteLabel')}{' '}
        <span className="text-muted-foreground font-normal">({t('onboarding.optional')})</span>
      </Label>
      <Textarea
        id="onboarding-note"
        placeholder={t('onboarding.step5.notePlaceholder')}
        value={data.patientNote}
        onChange={(e) => setField('patientNote', Array.from(e.target.value).slice(0, MAX_LEN).join(''))}
        rows={3}
        className="resize-none text-sm"
      />
      <div className="text-xs text-muted-foreground text-right">
        {data.patientNote.length} / {MAX_LEN}
      </div>
    </div>
  );
};

import { useTranslation } from 'react-i18next';

interface MedicalNoticeProps {
  /** "footer" = light text on the dark footer; "page" = muted block at the end of a service page. */
  variant?: 'footer' | 'page';
  className?: string;
}

/**
 * Legally relevant notice for healthcare services: who provides them, that a doctor
 * decides on every medical procedure, and that NIUS is not an emergency service.
 */
export const MedicalNotice = ({ variant = 'page', className = '' }: MedicalNoticeProps) => {
  const { t } = useTranslation();
  const color = variant === 'footer' ? 'rgba(255,255,255,0.5)' : 'var(--color-text-muted)';

  return (
    <div
      className={`text-[11px] leading-relaxed font-body space-y-1 ${className}`}
      style={{ color }}
      role="note"
    >
      <p>{t('medicalNotice.doctor')}</p>
      <p>{t('medicalNotice.emergency')}</p>
      <p>{t('medicalNotice.provider')}</p>
    </div>
  );
};

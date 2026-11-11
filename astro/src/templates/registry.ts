import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import type { TemplateId } from '@/routes/types.ts';
import PrivacyPolicy from '@/templates/PrivacyPolicy.astro';
import SestrickaPraha1 from '@/templates/SestrickaPraha1.astro';
import SestrickaPrahaVinohrady from '@/templates/SestrickaPrahaVinohrady.astro';
import SestrickaPrahaZizkov from '@/templates/SestrickaPrahaZizkov.astro';

export const templates: Partial<Record<TemplateId, AstroComponentFactory>> = {
  PrivacyPolicy,
  SestrickaPraha1,
  SestrickaPrahaVinohrady,
  SestrickaPrahaZizkov,
};

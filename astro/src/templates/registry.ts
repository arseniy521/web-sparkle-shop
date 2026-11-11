import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import type { TemplateId } from '@/routes/types.ts';
import SestrickaPraha1 from '@/templates/SestrickaPraha1.astro';

export const templates: Partial<Record<TemplateId, AstroComponentFactory>> = {
  SestrickaPraha1,
};

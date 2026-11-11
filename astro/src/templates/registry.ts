import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import type { TemplateId } from '@/routes/types.ts';

export const templates: Partial<Record<TemplateId, AstroComponentFactory>> = {};

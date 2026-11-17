import { stripTags } from '@/i18n/rich.ts';

/** FAQPage JSON-LD from the page's own questions; answers lose their markup, as on the old site. */
export function faqPageSchema(items: Array<{ question: string; answerHtml: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: stripTags(item.answerHtml),
      },
    })),
  };
}

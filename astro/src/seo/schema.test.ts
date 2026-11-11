import { describe, expect, it } from 'vitest';
import { faqPageSchema } from './schema';

describe('faqPageSchema', () => {
  it('builds FAQPage with one Question per item, in order', () => {
    const schema = faqPageSchema([
      { question: 'Q1?', answerHtml: 'A1.' },
      { question: 'Q2?', answerHtml: 'A2.' },
    ]);
    expect(schema).toEqual({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Q1?', acceptedAnswer: { '@type': 'Answer', text: 'A1.' } },
        { '@type': 'Question', name: 'Q2?', acceptedAnswer: { '@type': 'Answer', text: 'A2.' } },
      ],
    });
  });

  it('removes the markup from the answers, keeping their text', () => {
    const schema = faqPageSchema([
      {
        question: 'Hangover?',
        answerHtml: "Try <strong><a href='/kapacka-na-kocovinu-praha/'>Nausea Relief</a></strong> now.",
      },
    ]) as { mainEntity: Array<{ acceptedAnswer: { text: string } }> };
    expect(schema.mainEntity[0]?.acceptedAnswer.text).toBe('Try Nausea Relief now.');
  });
});

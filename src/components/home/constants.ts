/** One colour treatment for all site photos so they read as a single set (old:src/constants/photoFilter.ts). */
export const PHOTO_FILTER = 'brightness(1.02) contrast(0.98) saturate(0.92)';

/**
 * Google Business rating shown in visible text (old:src/constants/reviews.ts). Deliberately not
 * used in schema.org markup (owner's decision of 2026-11-12: no rating nodes).
 */
export const GOOGLE_RATING = { ratingValue: '5.0', url: 'https://g.page/r/Cb4BmqPTZRSSEBE/review' } as const;

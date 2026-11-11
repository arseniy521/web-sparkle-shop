import { blogPosts } from '../../../src/data/blogPosts.ts';
import type { Lang, PageRoute, RedirectRoute } from './types.ts';

function sameEverywhere(path: string): Record<Lang, string> {
  return { cs: path, en: `/en${path}`, ru: `/ru${path}`, uk: `/uk${path}` };
}

export const pages: readonly PageRoute[] = [
  { id: 'home', template: 'Home', paths: { cs: '/', en: '/en/', ru: '/ru/', uk: '/uk/' } },
  { id: 'blog', template: 'Blog', paths: sameEverywhere('/blog/'), noindex: ['ru', 'uk'] },
  ...blogPosts.map(
    (post): PageRoute => ({
      id: `blog:${post.slug}`,
      template: 'BlogPost',
      paths: sameEverywhere(`/blog/${post.slug}/`),
      noindex: ['ru', 'uk'],
      slug: post.slug,
    }),
  ),
  { id: 'ivf-support', template: 'IvfSupport', paths: sameEverywhere('/ivf-support-prague/') },
  {
    id: 'post-surgery',
    template: 'PostSurgeryCare',
    paths: sameEverywhere('/post-surgery-recovery-care-prague/'),
  },
  {
    id: 'disabled-care',
    template: 'DisabledCare',
    paths: sameEverywhere('/disabled-daily-care-prague/'),
  },
  {
    id: 'privacy',
    template: 'PrivacyPolicy',
    paths: sameEverywhere('/privacy/'),
    canonicalLang: 'cs',
  },
  {
    id: 'iv-drips',
    template: 'IvDripTherapy',
    paths: {
      cs: '/iv-kapacky-praha/',
      en: '/en/iv-drips-prague/',
      ru: '/ru/kapelnitsy-praga/',
      uk: '/uk/iv-drips-prague/',
    },
  },
  {
    id: 'hangover-drip',
    template: 'HangoverIvDrip',
    paths: {
      cs: '/kapacka-na-kocovinu-praha/',
      en: '/en/hangover-iv-drip-prague/',
      ru: '/ru/kapelnica-ot-pokhmelya-praga/',
      uk: '/uk/krapelnytsia-vid-pokhmellia-praga/',
    },
  },
  {
    id: 'womens-day-gift',
    template: 'WomensDayGift',
    paths: {
      cs: '/darek-8-brezna/',
      en: '/en/womens-day-gift-prague/',
      ru: '/ru/podarok-na-8-marta/',
    },
  },
  {
    id: 'birthday-gift',
    template: 'BirthdayGift',
    paths: {
      cs: '/narozeninovy-darek-praha/',
      en: '/en/birthday-gift-prague/',
      ru: '/ru/podatok-k-dnju-rozhdenija-praga/',
    },
  },
  { id: 'district-praha-1', template: 'SestrickaPraha1', paths: { cs: '/sestricka-praha-1/' } },
  {
    id: 'district-vinohrady',
    template: 'SestrickaPrahaVinohrady',
    paths: { cs: '/sestricka-praha-vinohrady/' },
  },
  {
    id: 'district-zizkov',
    template: 'SestrickaPrahaZizkov',
    paths: { cs: '/sestricka-praha-zizkov/' },
  },
  { id: 'iv-drip-hotel', template: 'IvDripHotel', paths: { en: '/en/iv-drip-hotel-prague/' } },
];

export const redirects: readonly RedirectRoute[] = [
  { from: '/iv-drips-prague/', to: { id: 'iv-drips', lang: 'cs' } },
  { from: '/iv-drip-therapy-prague/', to: { id: 'iv-drips', lang: 'cs' } },
  { from: '/ru/iv-drips-prague/', to: { id: 'iv-drips', lang: 'ru' } },
  { from: '/ru/iv-drip-therapy-prague/', to: { id: 'iv-drips', lang: 'ru' } },
  { from: '/en/iv-drip-therapy-prague/', to: { id: 'iv-drips', lang: 'en' } },
  { from: '/uk/iv-drip-therapy-prague/', to: { id: 'iv-drips', lang: 'uk' } },
  { from: '/ivf-injection-support-prague/', to: { id: 'ivf-support', lang: 'cs' } },
  { from: '/en/ivf-injection-support-prague/', to: { id: 'ivf-support', lang: 'en' } },
  { from: '/ru/ivf-injection-support-prague/', to: { id: 'ivf-support', lang: 'ru' } },
  { from: '/uk/ivf-injection-support-prague/', to: { id: 'ivf-support', lang: 'uk' } },
];

export const NOT_FOUND_PATH = '/404.html';

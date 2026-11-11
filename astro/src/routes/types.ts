export type Lang = 'cs' | 'en' | 'ru' | 'uk';
export const LANGS: readonly Lang[] = ['cs', 'en', 'ru', 'uk'];
export type TemplateId =
  | 'Home'
  | 'Blog'
  | 'BlogPost'
  | 'IvfSupport'
  | 'PostSurgeryCare'
  | 'DisabledCare'
  | 'PrivacyPolicy'
  | 'IvDripTherapy'
  | 'HangoverIvDrip'
  | 'IvDripHotel'
  | 'WomensDayGift'
  | 'BirthdayGift'
  | 'SestrickaPraha1'
  | 'SestrickaPrahaVinohrady'
  | 'SestrickaPrahaZizkov';
export interface PageRoute {
  id: string;
  template: TemplateId;
  paths: Partial<Record<Lang, string>>;
  noindex?: readonly Lang[];
  canonicalLang?: Lang;
  slug?: string;
}
export interface RedirectRoute {
  from: string;
  to: { id: string; lang: Lang };
}

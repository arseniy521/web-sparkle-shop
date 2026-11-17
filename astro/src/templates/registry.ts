import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import type { TemplateId } from '@/routes/types.ts';
import BirthdayGift from '@/templates/BirthdayGift.astro';
import Blog from '@/templates/Blog.astro';
import BlogPost from '@/templates/BlogPost.astro';
import DisabledCare from '@/templates/DisabledCare.astro';
import Home from '@/templates/Home.astro';
import HydrationIvDrip from '@/templates/HydrationIvDrip.astro';
import IvDripHotel from '@/templates/IvDripHotel.astro';
import IvDripTherapy from '@/templates/IvDripTherapy.astro';
import IvfSupport from '@/templates/IvfSupport.astro';
import PostSurgeryCare from '@/templates/PostSurgeryCare.astro';
import PrivacyPolicy from '@/templates/PrivacyPolicy.astro';
import SestrickaPraha1 from '@/templates/SestrickaPraha1.astro';
import SestrickaPrahaVinohrady from '@/templates/SestrickaPrahaVinohrady.astro';
import SestrickaPrahaZizkov from '@/templates/SestrickaPrahaZizkov.astro';
import WomensDayGift from '@/templates/WomensDayGift.astro';

export const templates: Partial<Record<TemplateId, AstroComponentFactory>> = {
  BirthdayGift,
  Blog,
  BlogPost,
  DisabledCare,
  Home,
  HydrationIvDrip,
  IvDripHotel,
  IvDripTherapy,
  IvfSupport,
  PostSurgeryCare,
  PrivacyPolicy,
  SestrickaPraha1,
  SestrickaPrahaVinohrady,
  SestrickaPrahaZizkov,
  WomensDayGift,
};

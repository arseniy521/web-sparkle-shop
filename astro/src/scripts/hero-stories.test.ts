import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IMAGE_MS, REVEAL_DELAY_MS, initHeroStories, type StoriesClock } from './hero-stories';

// Three slides as the hero renders them: an image, a video, an image; captions per key.
const MARKUP = `
  <div data-stories tabindex="0">
    <img data-story data-caption="hotel" data-alt="First" alt="First" aria-hidden="false" style="opacity: 1">
    <video data-story data-caption="home" aria-label="Video" style="opacity: 0"></video>
    <img data-story data-caption="bring" data-alt="Third" alt="" aria-hidden="true" style="opacity: 0">
    <span><span data-story-progress style="width: 0%"></span></span>
    <span><span data-story-progress style="width: 0%"></span></span>
    <span><span data-story-progress style="width: 0%"></span></span>
    <div data-story-caption="hotel"><span class="animate-in">Hotel</span></div>
    <div data-story-caption="bring" hidden><span class="animate-in">Bring</span></div>
    <div data-story-caption="home" hidden><span class="animate-in">Home</span></div>
    <button data-story-prev>Previous</button>
    <button data-story-next>Next</button>
    <div data-story-gestures></div>
  </div>`;

function fakeClock() {
  let time = 0;
  let next = 0;
  const frames = new Map<number, (t: number) => void>();
  const clock: StoriesClock & { advance(ms: number): void; pending(): number } = {
    now: () => time,
    frame(cb) {
      frames.set(++next, cb);
      return next;
    },
    cancelFrame(id) {
      frames.delete(id);
    },
    advance(ms) {
      const end = time + ms;
      while (time < end) {
        time = Math.min(time + 16, end);
        const due = [...frames.values()];
        frames.clear();
        for (const cb of due) cb(time);
      }
    },
    pending: () => frames.size,
  };
  return clock;
}

let reduced = false;
const slides = () => [...document.querySelectorAll<HTMLElement>('[data-story]')];
const active = () => slides().findIndex((s) => s.style.opacity === '1');
const bars = () => [...document.querySelectorAll<HTMLElement>('[data-story-progress]')].map((b) => b.style.width);
const shownCaption = () =>
  [...document.querySelectorAll<HTMLElement>('[data-story-caption]')].filter((c) => !c.hidden).map((c) => c.textContent);
const card = () => document.querySelector<HTMLElement>('[data-stories]')!;
const click = (selector: string) => document.querySelector<HTMLElement>(selector)!.click();
const key = (k: string) => card().dispatchEvent(new KeyboardEvent('keydown', { key: k }));

let play: ReturnType<typeof vi.fn>;
let pause: ReturnType<typeof vi.fn>;

beforeEach(() => {
  document.body.innerHTML = MARKUP;
  reduced = false;
  window.matchMedia = vi.fn((query: string) => ({
    matches: query.includes('reduce') && reduced,
    addEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
  play = vi.fn(() => Promise.resolve());
  pause = vi.fn();
  HTMLMediaElement.prototype.play = play as unknown as HTMLMediaElement['play'];
  HTMLMediaElement.prototype.pause = pause as unknown as HTMLMediaElement['pause'];
});

describe('initHeroStories', () => {
  it('keeps the first slide of the HTML and labels only the shown photo', () => {
    initHeroStories(document, fakeClock());
    expect(active()).toBe(0);
    const [first, , third] = slides() as HTMLImageElement[];
    expect([first.alt, first.getAttribute('aria-hidden')]).toEqual(['First', 'false']);
    expect([third.alt, third.getAttribute('aria-hidden')]).toEqual(['', 'true']);
    expect(shownCaption()).toEqual(['Hotel']);
  });

  it('goes forward and back with the hidden buttons and the arrow keys, wrapping around', () => {
    initHeroStories(document, fakeClock());
    click('[data-story-next]');
    expect(active()).toBe(1);
    expect(shownCaption()).toEqual(['Home']);
    key('ArrowRight');
    expect(active()).toBe(2);
    const third = slides()[2] as HTMLImageElement;
    expect([third.alt, third.getAttribute('aria-hidden')]).toEqual(['Third', 'false']);
    expect((slides()[0] as HTMLImageElement).alt).toBe('');
    expect(shownCaption()).toEqual(['Bring']);
    key('ArrowRight');
    expect(active()).toBe(0);
    click('[data-story-prev]');
    expect(active()).toBe(2);
    key('ArrowLeft');
    expect(active()).toBe(1);
    expect(bars()).toEqual(['100%', '0%', '0%']);
  });

  it('advances an image slide after IMAGE_MS with a growing progress bar', () => {
    const clock = fakeClock();
    initHeroStories(document, clock);
    clock.advance(IMAGE_MS / 2);
    expect(active()).toBe(0);
    expect(parseFloat(bars()[0])).toBeCloseTo(50, 0);
    expect(slides()[0].style.transform).toMatch(/^scale\(1\.0[23]/);
    clock.advance(IMAGE_MS / 2 + 16);
    expect(active()).toBe(1);
    expect(bars()).toEqual(['100%', '0%', '0%']);
  });

  it('plays the video slide and goes on when it ends', () => {
    const clock = fakeClock();
    initHeroStories(document, clock);
    click('[data-story-next]');
    expect(play).toHaveBeenCalled();
    expect(clock.pending()).toBe(0);
    const video = slides()[1] as HTMLVideoElement;
    Object.defineProperty(video, 'duration', { value: 10, configurable: true });
    video.currentTime = 4;
    video.dispatchEvent(new Event('timeupdate'));
    expect(parseFloat(bars()[1])).toBeCloseTo(40, 0);
    video.dispatchEvent(new Event('ended'));
    expect(active()).toBe(2);
  });

  it('does not play by itself with reduced motion, but still goes forward on request', () => {
    reduced = true;
    const clock = fakeClock();
    initHeroStories(document, clock);
    expect(clock.pending()).toBe(0);
    clock.advance(IMAGE_MS * 2);
    expect(active()).toBe(0);
    click('[data-story-next]');
    expect(active()).toBe(1);
    expect(play).not.toHaveBeenCalled();
  });

  it('pauses while the pointer is over the card', () => {
    const clock = fakeClock();
    initHeroStories(document, clock);
    card().dispatchEvent(new MouseEvent('mouseenter'));
    clock.advance(IMAGE_MS * 2);
    expect(active()).toBe(0);
    card().dispatchEvent(new MouseEvent('mouseleave'));
    clock.advance(IMAGE_MS + 32);
    expect(active()).toBe(1);
  });

  it('a tap on the left part goes back, elsewhere forward; a long press only pauses', () => {
    vi.useFakeTimers();
    try {
      const clock = fakeClock();
      initHeroStories(document, clock);
      const layer = document.querySelector<HTMLElement>('[data-story-gestures]')!;
      layer.getBoundingClientRect = () => ({ left: 0, width: 100 }) as DOMRect;
      const tap = (x: number) => {
        layer.dispatchEvent(new MouseEvent('pointerdown'));
        layer.dispatchEvent(new MouseEvent('pointerup', { clientX: x }));
      };
      tap(80);
      expect(active()).toBe(1);
      tap(20);
      expect(active()).toBe(0);
      layer.dispatchEvent(new MouseEvent('pointerdown'));
      vi.advanceTimersByTime(200);
      clock.advance(IMAGE_MS * 2);
      expect(active()).toBe(0);
      layer.dispatchEvent(new MouseEvent('pointerup', { clientX: 80 }));
      expect(active()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('displays and fetches the other slides only after the page has loaded, or on a change', () => {
    const hideOthers = () => {
      document.body.innerHTML = MARKUP;
      for (const slide of slides().slice(1)) slide.hidden = true;
      const video = slides()[1] as HTMLVideoElement;
      video.dataset.poster = '/videos/poster.jpg';
      video.preload = 'none';
    };
    const state = () => slides().map((s) => s.hidden);
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const readyState = vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading');
    try {
      hideOthers();
      initHeroStories(document, fakeClock());
      expect(state()).toEqual([false, true, true]);
      const video = slides()[1] as HTMLVideoElement;
      expect([video.getAttribute('poster'), video.preload]).toEqual([null, 'none']);
      window.dispatchEvent(new Event('load'));
      vi.advanceTimersByTime(REVEAL_DELAY_MS - 1);
      expect(state()).toEqual([false, true, true]);
      vi.advanceTimersByTime(1);
      expect(state()).toEqual([false, false, false]);
      expect([video.getAttribute('poster'), video.preload]).toEqual(['/videos/poster.jpg', 'metadata']);

      hideOthers();
      initHeroStories(document, fakeClock());
      click('[data-story-next]');
      expect(state()).toEqual([false, false, false]);

      // A script that starts after the load event waits the same delay.
      readyState.mockReturnValue('complete');
      hideOthers();
      initHeroStories(document, fakeClock());
      expect(state()).toEqual([false, true, true]);
      vi.advanceTimersByTime(REVEAL_DELAY_MS);
      expect(state()).toEqual([false, false, false]);
    } finally {
      readyState.mockRestore();
      vi.useRealTimers();
    }
  });

  it('does nothing on a page without the card and binds a card once', () => {
    document.body.innerHTML = '';
    expect(() => initHeroStories(document, fakeClock())).not.toThrow();
    document.body.innerHTML = MARKUP;
    initHeroStories(document, fakeClock());
    initHeroStories(document, fakeClock());
    click('[data-story-next]');
    expect(active()).toBe(1);
  });
});

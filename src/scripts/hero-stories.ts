/**
 * The stories card of the home page hero (port of old:src/components/HeroStories.tsx).
 *
 * The HTML shows the first slide. Here: an image slide runs IMAGE_MS with a progress bar and a
 * slow zoom, a video slide plays muted and advances when it ends. Hover, a long press, leaving the
 * viewport or a hidden tab pause it; "reduce motion" turns autoplay and zoom off. A tap on the left
 * 35 % goes back, elsewhere forward; arrow keys and two visually hidden buttons do the same.
 */
export const IMAGE_MS = 5000;
const ZOOM = 0.06;
const HOLD_MS = 180;
/** How long after the page's load event the other slides start loading. */
export const REVEAL_DELAY_MS = 1500;

export interface StoriesClock {
  now(): number;
  frame(cb: (time: number) => void): number;
  cancelFrame(id: number): void;
}

const browserClock: StoriesClock = {
  now: () => performance.now(),
  frame: (cb) => requestAnimationFrame(cb),
  cancelFrame: (id) => cancelAnimationFrame(id),
};

export function initHeroStories(root: ParentNode = document, clock: StoriesClock = browserClock): void {
  const card = root.querySelector<HTMLElement>('[data-stories]');
  if (!card || card.dataset.storiesReady) return;
  card.dataset.storiesReady = 'true';

  const slides = [...card.querySelectorAll<HTMLImageElement | HTMLVideoElement>('[data-story]')];
  const bars = [...card.querySelectorAll<HTMLElement>('[data-story-progress]')];
  const captions = [...card.querySelectorAll<HTMLElement>('[data-story-caption]')];
  const gestures = card.querySelector<HTMLElement>('[data-story-gestures]');
  if (slides.length === 0) return;

  let index = 0;
  let progress = 0;
  let paused = false;
  let inView = true;
  const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let reduced = motion?.matches ?? false;
  let frameId: number | null = null;
  let holdTimer: number | undefined;
  let held = false;

  const running = () => !paused && inView && !reduced;
  const current = () => slides[index];
  const isVideo = (el: Element): el is HTMLVideoElement => el instanceof HTMLVideoElement;

  // The HTML displays only the first slide, so the others do not compete with it for the network.
  // They are displayed (still transparent) and fetched REVEAL_DELAY_MS after the page has loaded,
  // well before the first change of slide, or at once on a change by the visitor; the video gets
  // its poster and fetches its metadata then.
  let revealed = false;
  const reveal = () => {
    if (revealed) return;
    revealed = true;
    for (const slide of slides) {
      slide.hidden = false;
      if (isVideo(slide)) {
        if (slide.dataset.poster) slide.poster = slide.dataset.poster;
        slide.preload = 'metadata';
      }
    }
  };
  const revealLater = () => window.setTimeout(reveal, REVEAL_DELAY_MS);
  if (document.readyState === 'complete') revealLater();
  else window.addEventListener('load', revealLater, { once: true });

  function render() {
    slides.forEach((slide, i) => {
      const active = i === index;
      const zoom = active && !reduced ? 1 + ZOOM * Math.min(progress, 1) : 1;
      slide.style.opacity = active ? '1' : '0';
      slide.style.transform = `scale(${zoom})`;
      if (!isVideo(slide)) {
        slide.alt = active ? (slide.dataset.alt ?? '') : '';
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      }
    });
    bars.forEach((bar, i) => {
      const width = i < index ? 100 : i === index ? Math.min(progress, 1) * 100 : 0;
      bar.style.width = `${width}%`;
    });
  }

  // Per frame only the shown slide's zoom and bar change: touching every slide restyled the page
  // on each frame.
  function renderProgress() {
    const zoom = reduced ? 1 : 1 + ZOOM * Math.min(progress, 1);
    current().style.transform = `scale(${zoom})`;
    if (bars[index]) bars[index].style.width = `${Math.min(progress, 1) * 100}%`;
  }

  function showCaption() {
    const key = current().dataset.caption;
    for (const caption of captions) {
      const shown = caption.dataset.storyCaption === key;
      caption.hidden = !shown;
      if (!shown) continue;
      // Restart the fade-in on every slide, as the old caption re-mounted per slide.
      const pill = caption.firstElementChild;
      pill?.classList.remove('animate-in');
      void caption.offsetWidth;
      pill?.classList.add('animate-in');
    }
  }

  function stopFrames() {
    if (frameId !== null) clock.cancelFrame(frameId);
    frameId = null;
  }

  // Starts or stops the image timer and the video, as the old effects did on every change.
  function sync() {
    stopFrames();
    const slide = current();
    for (const other of slides) if (isVideo(other) && other !== slide) other.pause();
    if (isVideo(slide)) {
      if (running()) void slide.play()?.catch(() => undefined);
      else slide.pause();
      return;
    }
    if (!running()) return;
    let last = clock.now();
    const tick = (time: number) => {
      const dt = time - last;
      last = time;
      progress += dt / IMAGE_MS;
      if (progress >= 1) {
        progress = 1;
        renderProgress();
        frameId = null;
        go(index + 1);
        return;
      }
      renderProgress();
      frameId = clock.frame(tick);
    };
    frameId = clock.frame(tick);
  }

  function go(next: number) {
    reveal();
    index = ((next % slides.length) + slides.length) % slides.length;
    progress = 0;
    const slide = current();
    // A video slide always starts from the beginning when it comes back around.
    if (isVideo(slide)) slide.currentTime = 0;
    render();
    showCaption();
    sync();
  }

  function setPaused(value: boolean) {
    if (paused === value) return;
    paused = value;
    sync();
  }

  function setInView(value: boolean) {
    if (inView === value) return;
    inView = value;
    sync();
  }

  for (const slide of slides) {
    if (!isVideo(slide)) continue;
    slide.addEventListener('timeupdate', () => {
      if (slide !== current() || !slide.duration) return;
      progress = slide.currentTime / slide.duration;
      renderProgress();
    });
    slide.addEventListener('ended', () => {
      if (slide === current()) go(index + 1);
    });
  }

  motion?.addEventListener?.('change', () => {
    reduced = motion.matches;
    render();
    sync();
  });

  if (typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.4 });
    observer.observe(card);
    document.addEventListener('visibilitychange', () => setInView(!document.hidden));
  }

  card.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') go(index + 1);
    if (event.key === 'ArrowLeft') go(index - 1);
  });
  card.addEventListener('mouseenter', () => setPaused(true));
  card.addEventListener('mouseleave', () => setPaused(false));
  card.querySelector('[data-story-prev]')?.addEventListener('click', () => go(index - 1));
  card.querySelector('[data-story-next]')?.addEventListener('click', () => go(index + 1));

  const cancelHold = () => {
    window.clearTimeout(holdTimer);
    if (held) setPaused(false);
    held = false;
  };
  gestures?.addEventListener('pointerdown', () => {
    held = false;
    holdTimer = window.setTimeout(() => {
      held = true;
      setPaused(true);
    }, HOLD_MS);
  });
  gestures?.addEventListener('pointerup', (event) => {
    window.clearTimeout(holdTimer);
    if (held) {
      held = false;
      setPaused(false);
      return;
    }
    const rect = gestures.getBoundingClientRect();
    const leftZone = event.clientX - rect.left < rect.width * 0.35;
    go(leftZone ? index - 1 : index + 1);
  });
  gestures?.addEventListener('pointercancel', cancelHold);
  gestures?.addEventListener('pointerleave', cancelHold);

  render();
  sync();
}

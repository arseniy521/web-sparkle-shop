import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { PHOTO_FILTER } from "@/constants/photoFilter";
import { GOOGLE_RATING } from "@/constants/reviews";

type CaptionKey = "hotel" | "home" | "visit" | "bring";

type Slide =
  | { type: "image"; src: string; alt: string; caption?: CaptionKey; position?: string }
  | { type: "video"; src: string; poster: string; alt: string; caption?: CaptionKey };

// Photos are real. To add a video, push { type: "video", src, poster, alt, caption }:
// it plays muted and the story advances when it ends.
const SLIDES: Slide[] = [
  { type: "image", src: "/photos/hotel-group.jpg", alt: "Three guests receiving IV drips in a Prague hotel suite", caption: "hotel", position: "50% 70%" },
  { type: "image", src: "/photos/hero-iv-bag.webp", alt: "NIUS branded IV drip bag", caption: "bring", position: "center" },
  { type: "video", src: "/videos/story-barter.mp4", poster: "/videos/story-barter.jpg", alt: "A guest relaxing on the sofa during an IV drip at home", caption: "home" },
  { type: "image", src: "/photos/nurse-close-up.jpg", alt: "NIUS nurse setting up an IV drip at home", caption: "home", position: "50% 40%" },
  { type: "image", src: "/photos/nurse-hotel-drip.jpg", alt: "NIUS nurse checking an IV drip in a hotel room", caption: "bring", position: "50% 60%" },
  { type: "image", src: "/photos/hotel-client.jpg", alt: "IV drip in a Prague hotel room", caption: "hotel", position: "50% 60%" },
  { type: "image", src: "/photos/nurse-home-visit.jpg", alt: "NIUS nurse during a home visit", caption: "visit", position: "50% 55%" },
];

const IMAGE_MS = 5000;
const ZOOM = 0.06; // slow Ken Burns push-in over one slide

export const HeroStories = () => {
  const { t } = useTranslation();
  const captions: Record<CaptionKey, string> = {
    hotel: t("heroNew.captions.hotel"),
    home: t("heroNew.captions.home"),
    visit: t("heroNew.captions.visit"),
    bring: t("heroNew.captions.bring"),
  };

  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1 within the current slide
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const [reduced, setReduced] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const holdTimer = useRef<number>();
  const held = useRef(false);

  const slide = SLIDES[index];
  const running = !paused && inView && !reduced;

  const go = useCallback((next: number) => {
    setIndex(((next % SLIDES.length) + SLIDES.length) % SLIDES.length);
    setProgress(0);
  }, []);

  // Respect "reduce motion": no autoplay or zoom, user can still tap through.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Pause when scrolled out of view or the tab is hidden.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    const onVis = () => setInView(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // Image timer
  useEffect(() => {
    if (slide.type !== "image" || !running) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      setProgress((p) => {
        const n = p + dt / IMAGE_MS;
        if (n >= 1) {
          queueMicrotask(() => go(index + 1));
          return 1;
        }
        return n;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [slide.type, running, index, go]);

  // A video slide always starts from the beginning when it comes back around.
  useEffect(() => {
    if (videoRef.current) videoRef.current.currentTime = 0;
  }, [index]);

  // Video pause/resume
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (running) void v.play().catch(() => undefined);
    else v.pause();
  }, [running, index]);

  const onPointerDown = () => {
    held.current = false;
    holdTimer.current = window.setTimeout(() => {
      held.current = true;
      setPaused(true);
    }, 180);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    window.clearTimeout(holdTimer.current);
    if (held.current) {
      setPaused(false);
      held.current = false;
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const leftZone = e.clientX - rect.left < rect.width * 0.35;
    go(leftZone ? index - 1 : index + 1);
  };
  const onPointerCancel = () => {
    window.clearTimeout(holdTimer.current);
    if (held.current) setPaused(false);
    held.current = false;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") go(index + 1);
    if (e.key === "ArrowLeft") go(index - 1);
  };

  return (
    <div className="relative w-full max-w-[340px] md:max-w-[440px] lg:max-w-[480px]">
      {/* Stack of cards behind, in brand colors */}
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-2xl"
        style={{ backgroundColor: "var(--color-peach)", transform: "rotate(5deg) translate(10px, 4px)" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-2xl"
        style={{ backgroundColor: "var(--color-blue)", opacity: 0.4, transform: "rotate(-4deg) translate(-8px, 6px)" }}
      />

      <div
        ref={rootRef}
        role="group"
        aria-roledescription="carousel"
        aria-label="NIUS"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="relative w-full overflow-hidden rounded-2xl select-none touch-pan-y"
        style={{ aspectRatio: "3 / 4", backgroundColor: "var(--color-indigo)", boxShadow: "0 24px 60px rgba(21,63,77,0.22)" }}
      >
        {/* Slides (all mounted so the next photo is already decoded) */}
        {SLIDES.map((s, i) => {
          const active = i === index;
          const zoom = active && !reduced ? 1 + ZOOM * Math.min(progress, 1) : 1;
          const common = {
            className: "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
            style: {
              opacity: active ? 1 : 0,
              filter: PHOTO_FILTER,
              transform: `scale(${zoom})`,
              objectPosition: s.type === "image" ? s.position : undefined,
            } as React.CSSProperties,
          };
          return s.type === "image" ? (
            <img
              key={s.src}
              src={s.src}
              alt={active ? s.alt : ""}
              aria-hidden={!active}
              width={1086}
              height={1448}
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "auto"}
              draggable={false}
              {...common}
            />
          ) : (
            <video
              key={s.src}
              ref={active ? videoRef : undefined}
              src={s.src}
              poster={s.poster}
              aria-label={s.alt}
              muted
              playsInline
              preload="metadata"
              onTimeUpdate={(e) => {
                const v = e.currentTarget;
                if (active && v.duration) setProgress(v.currentTime / v.duration);
              }}
              onEnded={() => active && go(index + 1)}
              {...common}
            />
          );
        })}

        {/* Shades so the header and caption stay readable on any photo */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-32"
          style={{ background: "linear-gradient(to bottom, rgba(13,42,53,0.6), rgba(13,42,53,0))" }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
          style={{ background: "linear-gradient(to top, rgba(13,42,53,0.55), rgba(13,42,53,0))" }}
        />

        {/* Progress segments */}
        <div className="pointer-events-none absolute inset-x-3 top-3 flex gap-1" aria-hidden="true">
          {SLIDES.map((_, i) => (
            <span key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/35">
              <span
                className="block h-full rounded-full bg-white"
                style={{ width: `${i < index ? 100 : i === index ? Math.min(progress, 1) * 100 : 0}%` }}
              />
            </span>
          ))}
        </div>

        {/* Story header: avatar with the NIUS mark + name + place */}
        <div className="pointer-events-none absolute left-3 top-7 flex items-center gap-2.5">
          <span
            className="grid h-9 w-9 place-items-center rounded-full ring-2 ring-white"
            style={{ backgroundColor: "var(--color-indigo)" }}
          >
            <img src="/brand/logo-mark-light.svg" alt="" width={20} height={20} className="h-5 w-5" />
          </span>
          <span className="leading-tight text-white drop-shadow">
            <span className="block font-display text-sm font-bold">NIUS</span>
            <span className="block font-body text-[11px] opacity-85">Praha · 8:00–21:00</span>
          </span>
        </div>

        {/* Caption pill (re-mounts per slide so it fades in) */}
        {slide.caption && (
          <div className="pointer-events-none absolute inset-x-4 bottom-4">
            <span
              key={index}
              className="inline-block animate-in fade-in slide-in-from-bottom-2 duration-500 rounded-full bg-white px-4 py-2 font-body text-sm font-medium"
              style={{ color: "var(--color-indigo)" }}
            >
              {captions[slide.caption]}
            </span>
          </div>
        )}

        {/* Controls for keyboard / assistive tech */}
        <button type="button" className="sr-only" onClick={() => go(index - 1)}>Previous</button>
        <button type="button" className="sr-only" onClick={() => go(index + 1)}>Next</button>

        {/* Gesture layer */}
        <div
          className="absolute inset-0 cursor-pointer"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onPointerLeave={onPointerCancel}
        />
      </div>

      {/* Rating chip on the card edge */}
      <div
        className="absolute -bottom-3 -right-2 md:-right-5 flex items-center gap-2 rounded-full bg-white px-4 py-2 font-body"
        style={{ boxShadow: "0 8px 24px rgba(21,63,77,0.18)" }}
      >
        <span className="font-display text-sm font-bold" style={{ color: "var(--color-ink)" }}>
          {GOOGLE_RATING.ratingValue}★
        </span>
        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{t("heroNew.statsGoogle")}</span>
      </div>
    </div>
  );
};

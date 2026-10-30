import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Pause,
  Play,
  RotateCw,
  Send,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatTime,
  getDomain,
  getPage,
  getVideo,
  reviewQueue,
  type Lang,
  type StyleKind,
} from "@/lib/mock-data";
import { Btn, StatusBadge } from "@/components/studio";

export const Route = createFileRoute("/review/$videoId")({
  head: () => ({
    meta: [
      { title: "Review a video — FB Content Studio" },
      {
        name: "description",
        content:
          "Watch the reel in both languages, check every source and license, edit captions, then approve and schedule.",
      },
      { property: "og:title", content: "Review a video — FB Content Studio" },
      {
        property: "og:description",
        content:
          "Watch the reel in both languages, check every source and license, edit captions, then approve and schedule.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReviewScreen,
});

function ReviewScreen() {
  const { videoId } = Route.useParams();
  const video = getVideo(videoId);
  if (!video || !video.script) throw notFound();

  const navigate = useNavigate();
  const queue = reviewQueue;
  const idx = queue.findIndex((v) => v.id === video.id);
  const prev = idx > 0 ? queue[idx - 1] : null;
  const next = idx < queue.length - 1 ? queue[idx + 1] : null;
  const domain = getDomain(video.domainId);
  const pageEn = getPage("fin-en");
  const pageVi = getPage("fin-vi");

  const [lang, setLang] = useState<Lang>(video.langs[0] ?? "EN");
  const [style, setStyle] = useState<StyleKind>(video.style);
  const [rendering, setRendering] = useState(false);
  const renderTimer = useRef<number | undefined>(undefined);
  const [captions, setCaptions] = useState({
    en: video.captions?.en ?? "",
    vi: video.captions?.vi ?? "",
  });
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [regenerating, setRegenerating] = useState<string[]>([]);
  const [reqOpen, setReqOpen] = useState(false);
  const [note, setNote] = useState("");
  const [postEn, setPostEn] = useState(video.langs.includes("EN"));
  const [postVi, setPostVi] = useState(video.langs.includes("VI"));
  const [aiLabel, setAiLabel] = useState(video.aiLabelNeeded ?? false);
  const [when, setWhen] = useState<"next" | "now" | "pick">("next");

  // Simulated playback
  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => {
      setProgress((p) => Math.min(p + 1, video.lengthSec));
    }, 1000);
    return () => window.clearInterval(t);
  }, [playing, video.lengthSec]);
  useEffect(() => {
    if (progress >= video.lengthSec) setPlaying(false);
  }, [progress, video.lengthSec]);
  useEffect(() => () => window.clearTimeout(renderTimer.current), []);

  const activeSection =
    video.script.find((s) => progress >= s.start && progress < s.end) ??
    (progress >= video.lengthSec ? video.script[video.script.length - 1] : video.script[0]);

  function switchStyle(s: StyleKind) {
    if (s === style) return;
    setStyle(s);
    setRendering(true);
    window.clearTimeout(renderTimer.current);
    renderTimer.current = window.setTimeout(() => setRendering(false), 2500);
  }

  function regenerate(sectionId: string) {
    setRegenerating((r) => [...r, sectionId]);
    window.setTimeout(() => setRegenerating((r) => r.filter((id) => id !== sectionId)), 1800);
  }

  const thumb = video.thumbs[style] ?? Object.values(video.thumbs)[0] ?? "";
  const goToNext = () =>
    navigate({ to: next ? "/review/$videoId" : "/review", params: next ? { videoId: next.id } : {} });

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/review"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Review queue ({idx + 1}/{queue.length})
        </Link>
        <div className="ml-auto flex gap-1">
          <Btn
            variant="outline"
            disabled={!prev}
            onClick={() => prev && navigate({ to: "/review/$videoId", params: { videoId: prev.id } })}
            aria-label="Previous video"
          >
            <ArrowLeft className="size-4" />
          </Btn>
          <Btn
            variant="outline"
            disabled={!next}
            onClick={() => next && navigate({ to: "/review/$videoId", params: { videoId: next.id } })}
            aria-label="Next video"
          >
            <ArrowRight className="size-4" />
          </Btn>
        </div>
      </div>

      <div className="mt-3">
        <h1 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {video.title}
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {domain?.name} · {domain?.pipelineName} · {video.lengthSec}s · 9:16
        </p>
        <StatusBadge status={video.status} className="mt-2" />
      </div>

      <div className="mt-6 grid gap-8 pb-4 lg:grid-cols-[360px_1fr]">
        {/* Left column — preview */}
        <div className="space-y-4 self-start lg:sticky lg:top-20">
          <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-secondary p-1">
            <button
              onClick={() => setLang("EN")}
              className={cn(
                "cursor-pointer rounded-md px-2 py-2 text-xs transition-colors sm:text-sm",
                lang === "EN" ? "bg-card font-medium text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              English · page EN
            </button>
            <button
              onClick={() => setLang("VI")}
              className={cn(
                "cursor-pointer rounded-md px-2 py-2 text-xs transition-colors sm:text-sm",
                lang === "VI" ? "bg-card font-medium text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              Tiếng Việt · page VI
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Switching language switches the video, the voiceover and the subtitles.
          </p>

          <div className="relative aspect-9/16 overflow-hidden rounded-lg border border-border bg-primary">
            {thumb && (
              <img src={thumb} alt={`${video.title} preview`} width={608} height={1088} className="h-full w-full object-cover" />
            )}
            <span className="absolute top-3 left-3 rounded-sm bg-primary/85 px-2 py-1 font-display text-[10px] font-bold tracking-widest text-primary-foreground">
              {activeSection?.label.toUpperCase()}
            </span>
            {!rendering && (
              <button
                onClick={() => {
                  if (progress >= video.lengthSec) setProgress(0);
                  setPlaying((p) => !p);
                }}
                className="absolute inset-0 m-auto flex size-14 cursor-pointer items-center justify-center rounded-full bg-primary/85 text-primary-foreground transition-transform hover:scale-105"
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? <Pause className="size-6" /> : <Play className="size-6" />}
              </button>
            )}
            {rendering && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-primary/80 text-primary-foreground">
                <RotateCw className="size-6 animate-spin" />
                <p className="font-display text-xs font-semibold tracking-widest uppercase">
                  Re-rendering style {style}
                </p>
              </div>
            )}
          </div>

          <div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-review transition-all duration-1000 ease-linear"
                style={{ width: `${(progress / video.lengthSec) * 100}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(video.lengthSec)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-secondary p-1">
            <button
              onClick={() => switchStyle("A")}
              className={cn(
                "cursor-pointer rounded-md px-2 py-2 text-xs transition-colors sm:text-sm",
                style === "A" ? "bg-card font-medium text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              A · Archival
            </button>
            <button
              onClick={() => switchStyle("B")}
              className={cn(
                "cursor-pointer rounded-md px-2 py-2 text-xs transition-colors sm:text-sm",
                style === "B" ? "bg-card font-medium text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              B · Motion graphics
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Switching style re-renders the video — the new cut appears here when it's ready.
          </p>
        </div>

        {/* Right column — script, sources, details */}
        <div className="min-w-0 space-y-8">
          <section>
            <h2 className="eyebrow text-foreground">
              Script · {lang === "EN" ? "English narration" : "Vietnamese narration"}
            </h2>
            <div className="mt-3 space-y-2">
              {video.script.map((s) => {
                const active = activeSection?.id === s.id;
                const busy = regenerating.includes(s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      setProgress(s.start);
                      setPlaying(true);
                    }}
                    className={cn(
                      "cursor-pointer rounded-lg border p-3 transition-colors",
                      active ? "border-review bg-review-wash" : "border-border bg-card hover:border-input",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-xs font-bold tracking-wide text-foreground">
                          {s.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {formatTime(s.start)}–{formatTime(s.end)}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          regenerate(s.id);
                        }}
                        className="inline-flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                      >
                        <RotateCw className={cn("size-3", busy && "animate-spin")} /> Regenerate
                      </button>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-foreground">{s.text[lang]}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="eyebrow text-foreground">Sources &amp; photo licenses</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Fact-check and originality check before publishing — Meta penalises unoriginal
              content.
            </p>
            <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-[11px] tracking-wide text-muted-foreground uppercase">
                    <th className="px-3 py-2 font-display">Item</th>
                    <th className="px-3 py-2 font-display">Used in</th>
                    <th className="px-3 py-2 font-display">Source</th>
                    <th className="px-3 py-2 font-display">License</th>
                  </tr>
                </thead>
                <tbody>
                  {(video.sources ?? []).map((src, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 text-foreground">{src.subject}</td>
                      <td className="px-3 py-2 text-muted-foreground">{src.usedIn}</td>
                      <td className="px-3 py-2">
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-foreground underline underline-offset-2 hover:text-muted-foreground"
                        >
                          {src.sourceName}
                        </a>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{src.license}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="eyebrow text-foreground">Post details</h2>
            <div className="space-y-3">
              <div>
                <label className="font-display text-xs font-semibold text-foreground">
                  Caption · {pageEn?.name} (EN)
                </label>
                <textarea
                  value={captions.en}
                  onChange={(e) => setCaptions((c) => ({ ...c, en: e.target.value }))}
                  rows={2}
                  className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                />
              </div>
              <div>
                <label className="font-display text-xs font-semibold text-foreground">
                  Caption · {pageVi?.name} (VI)
                </label>
                <textarea
                  value={captions.vi}
                  onChange={(e) => setCaptions((c) => ({ ...c, vi: e.target.value }))}
                  rows={2}
                  className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={postEn}
                  onChange={(e) => setPostEn(e.target.checked)}
                  className="size-4 accent-[var(--primary)]"
                />
                Post to page EN · {pageEn?.name}
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={postVi}
                  onChange={(e) => setPostVi(e.target.checked)}
                  className="size-4 accent-[var(--primary)]"
                />
                Post to page VI · {pageVi?.name}
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={aiLabel}
                  onChange={(e) => setAiLabel(e.target.checked)}
                  className="size-4 accent-[var(--primary)]"
                />
                Label as AI-generated
                <span className="text-xs text-muted-foreground">
                  (required when AI imagery looks real)
                </span>
              </label>
            </div>

            <div className="space-y-2">
              <p className="font-display text-xs font-semibold text-foreground">When to post</p>
              {(
                [
                  {
                    key: "next",
                    label: "Next free slot",
                    detail: `EN: ${pageEn?.nextSlot} · VI: ${pageVi?.nextSlot}`,
                  },
                  { key: "now", label: "Post now", detail: "Goes live immediately after approval" },
                  { key: "pick", label: "Pick a time", detail: "" },
                ] as const
              ).map((opt) => (
                <div key={opt.key}>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                    <input
                      type="radio"
                      name="when"
                      checked={when === opt.key}
                      onChange={() => setWhen(opt.key)}
                      className="size-4 accent-[var(--primary)]"
                    />
                    {opt.label}
                  </label>
                  {when === opt.key && opt.detail && (
                    <p className="mt-0.5 ml-6 text-xs text-muted-foreground">{opt.detail}</p>
                  )}
                  {when === "pick" && opt.key === "pick" && (
                    <input
                      type="datetime-local"
                      className="mt-1 ml-6 rounded-md border border-input bg-card px-2 py-1.5 text-sm text-foreground"
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Request-changes note */}
      {reqOpen && (
        <div className="mt-6 rounded-lg border border-warning/40 bg-warning-wash p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-warning" />
            <p className="font-display text-sm font-semibold text-foreground">
              Request changes — the system rebuilds the video from your notes
            </p>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="e.g. make the hook punchier — start with the $500 mistake"
            className="mt-2 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
          />
          <div className="mt-2 flex gap-2">
            <Btn
              variant="primary"
              disabled={!note.trim()}
              onClick={() => {
                setReqOpen(false);
                goToNext();
              }}
            >
              <Send className="size-3.5" /> Send to production
            </Btn>
            <Btn variant="ghost" onClick={() => setReqOpen(false)}>
              Cancel
            </Btn>
          </div>
        </div>
      )}

      {/* Action bar — sticks to the bottom on phones */}
      <div className="sticky bottom-0 z-30 -mx-4 mt-8 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <Btn
            variant="danger"
            onClick={() => {
              setReqOpen(false);
              navigate({ to: "/review" });
            }}
          >
            <X className="size-4" /> Reject
          </Btn>
          <Btn variant="outline" onClick={() => setReqOpen((o) => !o)}>
            Request changes…
          </Btn>
          <Btn variant="review" onClick={goToNext} className="ml-auto">
            <Check className="size-4" /> Approve &amp; schedule
          </Btn>
        </div>
      </div>
    </div>
  );
}

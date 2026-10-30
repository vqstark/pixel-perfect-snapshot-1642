import { Link, useLocation } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  reviewQueue,
  statusLabels,
  type Domain,
  type Lang,
  type StyleKind,
  type Video,
  type VideoStatus,
} from "@/lib/mock-data";

// ---------- Buttons ----------

export function Btn({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "review" | "danger" | "ghost";
}) {
  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/85",
        variant === "outline" &&
          "border border-input bg-card text-foreground hover:bg-accent",
        variant === "review" && "bg-review text-review-foreground hover:bg-review/85",
        variant === "danger" &&
          "border border-destructive/40 bg-card text-destructive hover:bg-destructive/10",
        variant === "ghost" && "text-muted-foreground hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

// ---------- Labels & badges ----------

const statusStyles: Record<VideoStatus, string> = {
  producing: "border border-border bg-muted text-muted-foreground",
  pending_review: "bg-review text-review-foreground",
  approved: "bg-success-wash text-success",
  scheduled: "bg-scheduled-wash text-scheduled",
  published: "bg-primary text-primary-foreground",
  error: "bg-destructive text-destructive-foreground",
  changes_requested: "bg-warning text-warning-foreground",
  rejected: "border border-border bg-transparent text-muted-foreground",
};

export function StatusBadge({ status, className }: { status: VideoStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide whitespace-nowrap",
        statusStyles[status],
        className,
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

export function LangLabel({ lang }: { lang: Lang }) {
  return (
    <span className="inline-flex items-center rounded-sm border border-border bg-card px-1.5 py-0.5 font-display text-[10px] font-semibold tracking-widest text-muted-foreground">
      {lang}
    </span>
  );
}

export function StyleLabel({ style }: { style: StyleKind }) {
  return (
    <span className="inline-flex items-center rounded-sm border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-muted-foreground whitespace-nowrap">
      {style} · {style === "A" ? "Archival" : "Motion"}
    </span>
  );
}

export function ConnectionDot({ status }: { status: "ok" | "warn" | "none" }) {
  return (
    <span
      className={cn(
        "inline-block size-2 rounded-full",
        status === "ok" && "bg-success",
        status === "warn" && "bg-warning",
        status === "none" && "bg-muted-foreground/40",
      )}
    />
  );
}

// ---------- Top bar ----------

const navItems = [
  { to: "/", label: "Dashboard", match: (p: string) => p === "/" },
  { to: "/domains", label: "Domains", match: (p: string) => p.startsWith("/domains") },
  { to: "/review", label: "Review queue", match: (p: string) => p.startsWith("/review") },
  { to: "/settings", label: "Pages & settings", match: (p: string) => p.startsWith("/settings") },
] as const;

export function TopBar() {
  const pathname = useLocation().pathname;
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-sm bg-primary font-display text-[13px] font-bold text-primary-foreground">
            FB
          </span>
          <span className="font-display text-[15px] font-semibold tracking-tight text-foreground">
            FB Content Studio
          </span>
        </Link>
        <nav className="ml-2 hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "relative rounded-md px-3 py-1.5 text-sm transition-colors",
                item.match(pathname)
                  ? "bg-secondary font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
              {item.to === "/review" && reviewQueue.length > 0 && (
                <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-review px-1.5 py-0.5 font-display text-[10px] font-bold text-review-foreground">
                  {reviewQueue.length}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Link
            to="/review"
            className="relative rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground md:hidden"
          >
            Review
            {reviewQueue.length > 0 && (
              <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-review px-1.5 py-0.5 font-display text-[10px] font-bold text-review-foreground">
                {reviewQueue.length}
              </span>
            )}
          </Link>
          <Link
            to="/new-video"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
          >
            <Plus className="size-4" /> New video
          </Link>
        </div>
      </div>
    </header>
  );
}

// ---------- Video card ----------

export function VideoCard({ video, className }: { video: Video; className?: string }) {
  const isTextPost = !video.formats.includes("reel");
  const thumb = video.thumbs[video.style] ?? Object.values(video.thumbs)[0];
  const to = video.status === "pending_review" ? "/review/$videoId" : "/domains/$domainId";
  const params =
    video.status === "pending_review"
      ? { videoId: video.id }
      : { domainId: video.domainId };

  return (
    <Link
      to={to}
      params={params}
      className={cn(
        "group block overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="relative aspect-9/16 w-full overflow-hidden bg-muted">
        {isTextPost || !thumb ? (
          <div className="flex h-full items-center justify-center bg-secondary">
            <span className="eyebrow text-muted-foreground">Text post</span>
          </div>
        ) : (
          <img
            src={thumb}
            alt={video.title}
            loading="lazy"
            width={608}
            height={1088}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        )}
        <div className="absolute right-2 bottom-2 flex flex-col items-end gap-1">
          {video.formats.includes("reel") && (
            <span className="rounded-sm bg-primary/80 px-1.5 py-0.5 font-display text-[10px] font-medium text-primary-foreground">
              Reel · 9:16
            </span>
          )}
        </div>
      </div>
      <div className="space-y-2 p-3">
        <h3 className="line-clamp-2 font-display text-sm leading-snug font-semibold text-foreground">
          {video.title}
        </h3>
        <p className="text-xs text-muted-foreground">
          Finance &amp; Investing · {video.lengthSec}s
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {video.langs.map((l) => (
            <LangLabel key={l} lang={l} />
          ))}
          <StyleLabel style={video.style} />
        </div>
        <StatusBadge status={video.status} />
      </div>
    </Link>
  );
}

// ---------- Pipeline progress ----------

export function PipelineProgress({
  total,
  current,
  className,
}: {
  total: number;
  current: number;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-1", className)}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 flex-1 rounded-full",
            i < current && "bg-success",
            i === current && "bg-review",
            i > current && "bg-muted",
          )}
        />
      ))}
    </div>
  );
}

// ---------- Domain card ----------

export function DomainMiniCard({ domain, children }: { domain: Domain; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-lg p-4",
        domain.status === "active"
          ? "border border-border bg-card"
          : "border border-dashed border-border bg-transparent opacity-70",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-base font-semibold text-foreground">{domain.name}</h3>
        {domain.status === "active" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-wash px-2 py-0.5 text-[11px] font-semibold text-success">
            <ConnectionDot status="ok" /> Active
          </span>
        ) : (
          <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            Not set up
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

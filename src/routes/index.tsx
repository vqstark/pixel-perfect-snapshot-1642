import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight } from "lucide-react";
import {
  activeDomain,
  domains,
  domainCounts,
  pages,
  producingVideos,
  reviewQueue,
} from "@/lib/mock-data";
import {
  Btn,
  ConnectionDot,
  DomainMiniCard,
  VideoCard,
} from "@/components/studio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — FB Content Studio" },
      {
        name: "description",
        content:
          "Today at a glance: videos waiting for your review, domain pipelines, and posting limits for every Facebook page.",
      },
      { property: "og:title", content: "Dashboard — FB Content Studio" },
      {
        property: "og:description",
        content:
          "Today at a glance: videos waiting for your review, domain pipelines, and posting limits for every Facebook page.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const counts = domainCounts(activeDomain.id);
  const financePages = pages.filter((p) => p.domainId === activeDomain.id);
  const expiring = pages.filter(
    (p) => p.status === "token_expiring" || p.status === "token_expired",
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Token warning sits above everything */}
      {expiring.length > 0 && (
        <div className="mb-6 flex flex-col gap-2 rounded-lg border border-warning/40 bg-warning-wash p-4 sm:flex-row sm:items-center">
          <AlertTriangle className="size-4 shrink-0 text-warning" />
          <p className="text-sm text-foreground">
            {expiring
              .map(
                (p) =>
                  `Facebook token for ${p.name} (${p.lang}) expires ${p.tokenExpires}`,
              )
              .join(" · ")}
          </p>
          <Link
            to="/settings"
            className="text-sm font-medium text-foreground underline underline-offset-2 sm:ml-auto"
          >
            Reconnect in Pages &amp; settings
          </Link>
        </div>
      )}

      <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Everything runs on autopilot.
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        You only step in once: approve each video before it posts.
      </p>

      {/* Waiting for you */}
      <section className="mt-8">
        <div className="flex items-end justify-between gap-3">
          <h2 className="eyebrow text-foreground">Waiting for you</h2>
          <Link
            to="/review"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Open review queue <ArrowRight className="size-3.5" />
          </Link>
        </div>
        {reviewQueue.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed border-border bg-card p-8 text-center">
            <p className="font-display text-sm font-semibold text-foreground">
              Nothing needs your review
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              The next video should be ready around 2:40 PM — the pipeline keeps producing.
            </p>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {reviewQueue.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        )}
      </section>

      {/* Domains */}
      <section className="mt-10">
        <h2 className="eyebrow text-foreground">Domains</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {domains.map((d) => (
            <DomainMiniCard key={d.id} domain={d}>
              {d.status === "active" ? (
                <>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Pipeline · <span className="font-medium text-foreground">{d.pipelineName}</span>
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {financePages.map((p) => (
                      <li key={p.id} className="flex items-center gap-1.5">
                        <ConnectionDot
                          status={
                            p.status === "connected" ? "ok" : p.status === "token_expiring" ? "warn" : "none"
                          }
                        />
                        <span className="truncate">
                          {p.name} ({p.lang}) ·{" "}
                          {p.status === "connected"
                            ? "Connected"
                            : p.status === "token_expiring"
                              ? `Token expires ${p.tokenExpires}`
                              : "Not connected"}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex gap-4 border-t border-border pt-3 text-xs">
                    <span>
                      <span className="font-display text-base font-bold text-foreground">{counts.queued}</span>
                      <span className="ml-1 text-muted-foreground">queued</span>
                    </span>
                    <span>
                      <span className="font-display text-base font-bold text-foreground">{counts.producing}</span>
                      <span className="ml-1 text-muted-foreground">producing</span>
                    </span>
                    <span>
                      <span className="font-display text-base font-bold text-review">{counts.pendingReview}</span>
                      <span className="ml-1 text-muted-foreground">in review</span>
                    </span>
                  </div>
                  <Link
                    to="/domains/$domainId"
                    params={{ domainId: d.id }}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
                  >
                    Open domain workspace <ArrowRight className="size-3.5" />
                  </Link>
                </>
              ) : (
                <>
                  <p className="mt-2 text-xs text-muted-foreground">Pipeline not designed yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Pages EN / VI · Not connected
                  </p>
                  <Btn variant="outline" className="mt-3">
                    Set up domain
                  </Btn>
                </>
              )}
            </DomainMiniCard>
          ))}
        </div>
      </section>

      {/* Posting limits */}
      <section className="mt-10">
        <h2 className="eyebrow text-foreground">Posting limits · last 24 hours</h2>
        <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
          Meta allows up to 30 posts per page per 24 hours; Reels count toward the limit. The
          pipeline spreads videos across slots so pages stay well under it.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {pages.map((p) => (
            <div key={p.id} className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-foreground">
                  {p.name}{" "}
                  <span className="font-display text-[10px] font-semibold tracking-widest text-muted-foreground">
                    {p.lang}
                  </span>
                </p>
                <span className="text-xs text-muted-foreground">
                  {p.status === "not_linked" ? "—" : `${p.postsLast24h} / ${p.dailyLimit}`}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={
                    p.postsLast24h / p.dailyLimit > 0.8
                      ? "h-full rounded-full bg-warning"
                      : "h-full rounded-full bg-success"
                  }
                  style={{ width: `${(p.postsLast24h / p.dailyLimit) * 100}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {p.status === "not_linked"
                  ? "Not linked yet"
                  : `${Math.round((p.postsLast24h / p.dailyLimit) * 100)}% of the Meta 24h limit`}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Producing strip */}
      {producingVideos.length > 0 && (
        <section className="mt-10">
          <div className="flex items-end justify-between gap-3">
            <h2 className="eyebrow text-foreground">In production right now</h2>
            <Link
              to="/domains/$domainId"
              params={{ domainId: activeDomain.id }}
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {activeDomain.name} workspace <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {producingVideos.map((v) => (
              <span
                key={v.id}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground"
              >
                <span className="max-w-52 truncate">{v.title}</span>
                <span className="text-muted-foreground">
                  {v.status === "error" ? "· needs attention" : "· producing"}
                </span>
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

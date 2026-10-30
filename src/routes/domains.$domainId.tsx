import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, ChevronUp, CircleAlert, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getPage,
  getDomain,
  getPagesForDomain,
  topics as allTopics,
  videos,
  type Topic,
} from "@/lib/mock-data";
import { addQueued, getQueued } from "@/lib/session-store";
import { Btn, PipelineProgress, StatusBadge, StyleLabel, ConnectionDot } from "@/components/studio";

export const Route = createFileRoute("/domains/$domainId")({
  head: () => ({
    meta: [
      { title: "Domain workspace — FB Content Studio" },
      {
        name: "description",
        content:
          "See what this domain's pipeline is producing, manage the topic queue and check the publishing schedule.",
      },
      { property: "og:title", content: "Domain workspace — FB Content Studio" },
      {
        property: "og:description",
        content:
          "See what this domain's pipeline is producing, manage the topic queue and check the publishing schedule.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Workspace,
});

interface MadeVideo {
  id: string;
  title: string;
  detail: string;
}

function Workspace() {
  const { domainId } = Route.useParams();
  const domain = getDomain(domainId);
  if (!domain) throw notFound();

  const [paused, setPaused] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [handled, setHandled] = useState<Record<string, string>>({});
  const [made, setMade] = useState<MadeVideo[]>([]);
  const [newTopic, setNewTopic] = useState("");
  const [addedTopics, setAddedTopics] = useState<Topic[]>([]);

  if (domain.status === "not_setup") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="eyebrow text-muted-foreground">{domain.name}</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-foreground">
          This domain doesn't have a pipeline yet
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Once designed, its pipeline will show here — steps, production and the publishing
          schedule for its two pages.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Btn variant="primary">Set up domain</Btn>
          <Link
            to="/domains"
            className="inline-flex items-center rounded-md border border-input bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            Back to domains
          </Link>
        </div>
      </div>
    );
  }

  const domainPages = getPagesForDomain(domain.id);
  const domainVideos = videos.filter(
    (v) => v.domainId === domain.id && (v.status === "producing" || v.status === "error" || v.status === "changes_requested"),
  );
  const queuedHere = getQueued().filter((q) => q.domainId === domain.id);
  const domainTopics = [
    ...addedTopics.filter((t) => t.domainId === domain.id),
    ...allTopics.filter((t) => t.domainId === domain.id),
  ];

  function makeNow(title: string, note?: string) {
    const id = `made-${Date.now()}`;
    setMade((m) => [
      { id, title, detail: note ? `Queued with your note · ${note}` : "Queued · starting research" },
      ...m,
    ]);
    setExpanded(id);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Header */}
      <Link
        to="/domains"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Domains
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {domain.name}
        </h1>
        <span className="rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          {domain.pipelineName}
        </span>
        <div className="ml-auto flex gap-2">
          <Btn variant="outline">Pipeline settings</Btn>
          <Btn variant="outline" onClick={() => setPaused((p) => !p)}>
            {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
            {paused ? "Resume automation" : "Pause automation"}
          </Btn>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {domainPages.map((p) => (
          <span key={p.id} className="inline-flex items-center gap-1.5">
            <ConnectionDot
              status={
                p.status === "connected" ? "ok" : p.status === "token_expiring" ? "warn" : "none"
              }
            />
            {p.name} ({p.lang})
          </span>
        ))}
      </div>
      {paused && (
        <div className="mt-3 rounded-lg border border-warning/40 bg-warning-wash px-4 py-2.5 text-sm text-foreground">
          Automation paused — nothing new starts until you resume.
        </div>
      )}

      {/* Pipeline diagram */}
      <section className="mt-6">
        <h2 className="eyebrow text-foreground">Pipeline · {domain.pipelineName}</h2>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {domain.pipeline.map((step, i) => (
            <div
              key={step.id}
              className={cn(
                "min-w-44 flex-1 rounded-lg border p-3",
                step.manual ? "border-review bg-review-wash" : "border-border bg-card",
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full font-display text-[10px] font-bold",
                    step.manual
                      ? "bg-review text-review-foreground"
                      : "bg-secondary text-foreground",
                  )}
                >
                  {i + 1}
                </span>
                <p className="font-display text-xs font-semibold whitespace-nowrap text-foreground">
                  {step.name}
                </p>
              </div>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                {step.description}
              </p>
              {step.manual && (
                <p className="mt-1.5 font-display text-[10px] font-bold tracking-widest text-foreground">
                  YOU
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Production + topic queue */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="min-w-0">
          <h2 className="eyebrow text-foreground">
            In production ({domainVideos.length + made.length + queuedHere.length})
          </h2>
          <div className="mt-3 space-y-3">
            {queuedHere.map((q, i) => (
              <div
                key={`q-${i}`}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-display text-sm font-semibold text-foreground">{q.title}</h3>
                  <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                    Just queued
                  </span>
                </div>
                <PipelineProgress total={domain.pipeline.length} current={0} className="mt-3" />
                <p className="mt-2 text-xs text-muted-foreground">
                  Working on: <span className="font-medium text-foreground">Topic</span>
                  {q.note ? ` · with your note: “${q.note}”` : " · waiting to start"}
                </p>
              </div>
            ))}
            {made.map((m) => (
              <div key={m.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-display text-sm font-semibold text-foreground">{m.title}</h3>
                  <StatusBadge status="producing" />
                </div>
                <PipelineProgress total={domain.pipeline.length} current={0} className="mt-3" />
                <p className="mt-2 text-xs text-muted-foreground">
                  Working on: <span className="font-medium text-foreground">Topic</span> ·{" "}
                  {m.detail}
                </p>
              </div>
            ))}
            {domainVideos.map((v) => {
              const step = domain.pipeline[v.stepIndex ?? 0];
              const isErr = v.status === "error" && !handled[v.id];
              return (
                <div
                  key={v.id}
                  className={cn(
                    "rounded-lg border p-4",
                    isErr ? "border-destructive/40 bg-destructive/5" : "border-border bg-card",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-display text-sm font-semibold text-foreground">{v.title}</h3>
                    <div className="flex items-center gap-1.5">
                      <StyleLabel style={v.style} />
                      <StatusBadge status={v.status} />
                    </div>
                  </div>
                  <PipelineProgress
                    total={domain.pipeline.length}
                    current={v.stepIndex ?? 0}
                    className="mt-3"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Working on:{" "}
                    <span className="font-medium text-foreground">{step?.name}</span>
                    {v.stepDetail ? ` · ${v.stepDetail}` : ""}
                  </p>

                  {isErr && (
                    <div className="mt-3 rounded-md border border-destructive/30 bg-card p-3">
                      <div className="flex items-start gap-2">
                        <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
                        <p className="text-xs leading-relaxed text-foreground">{v.errorReason}</p>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(v.errorActions ?? []).map((a) => (
                          <Btn
                            key={a}
                            variant="outline"
                            className="px-2 py-1 text-xs"
                            onClick={() => setHandled((h) => ({ ...h, [v.id]: a }))}
                          >
                            {a}
                          </Btn>
                        ))}
                      </div>
                    </div>
                  )}
                  {handled[v.id] && (
                    <p className="mt-3 rounded-md bg-success-wash px-3 py-2 text-xs text-foreground">
                      {handled[v.id] === "Switch to style B"
                        ? "Switched to style B — re-rendering with motion graphics."
                        : "Upload picker would open here (demo)."}
                    </p>
                  )}
                  {v.status === "changes_requested" && v.reviewNote && (
                    <p className="mt-3 rounded-md bg-warning-wash px-3 py-2 text-xs text-foreground">
                      Your note: {v.reviewNote}
                    </p>
                  )}

                  <button
                    onClick={() => setExpanded((e) => (e === v.id ? null : v.id))}
                    className="mt-3 inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    {expanded === v.id ? (
                      <>
                        <ChevronUp className="size-3.5" /> Hide details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="size-3.5" /> View details
                      </>
                    )}
                  </button>
                  {expanded === v.id && (
                    <ul className="mt-2 space-y-1.5 rounded-md bg-secondary p-3">
                      {domain.pipeline.map((s, i) => (
                        <li key={s.id} className="flex items-center gap-2 text-xs">
                          <span
                            className={cn(
                              "w-4 text-center",
                              i < (v.stepIndex ?? 0) && "text-success",
                              i === (v.stepIndex ?? 0) && "text-review",
                              i > (v.stepIndex ?? 0) && "text-muted-foreground/50",
                            )}
                          >
                            {i < (v.stepIndex ?? 0) ? "✓" : i === (v.stepIndex ?? 0) ? "●" : "○"}
                          </span>
                          <span className="text-foreground">{s.name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Topic queue */}
        <section className="min-w-0 self-start rounded-lg border border-border bg-card p-4">
          <h2 className="eyebrow text-foreground">Topic queue ({domainTopics.length})</h2>
          <ul className="mt-3 divide-y divide-border">
            {domainTopics.map((t) => (
              <li key={t.id} className="py-2.5 first:pt-0 last:pb-0">
                <p className="text-sm leading-snug text-foreground">{t.title}</p>
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-muted-foreground">
                    {t.source === "system" ? `System · ${t.kind}` : "You added"}
                  </span>
                  <Btn
                    variant="outline"
                    className="px-2 py-1 text-xs"
                    onClick={() => makeNow(t.title)}
                  >
                    Make now
                  </Btn>
                </div>
              </li>
            ))}
          </ul>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!newTopic.trim()) return;
              const t: Topic = {
                id: `you-${Date.now()}`,
                domainId: domain.id,
                title: newTopic.trim(),
                source: "you",
                kind: "evergreen",
              };
              setAddedTopics((a) => [t, ...a]);
              setNewTopic("");
            }}
          >
            <input
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="Add a topic…"
              className="w-full min-w-0 rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            />
            <Btn variant="outline" type="submit" className="px-2.5">
              Add
            </Btn>
          </form>
        </section>
      </div>

      {/* Publishing schedule */}
      <section className="mt-8">
        <h2 className="eyebrow text-foreground">Publishing schedule</h2>
        <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] tracking-wide text-muted-foreground uppercase">
                <th className="px-4 py-2.5 font-display">Page</th>
                <th className="px-4 py-2.5 font-display">Slots per day</th>
                <th className="px-4 py-2.5 font-display">Page timezone</th>
                <th className="px-4 py-2.5 font-display">Next post</th>
              </tr>
            </thead>
            <tbody>
              {domainPages.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-foreground">
                    {p.name}{" "}
                    <span className="font-display text-[10px] font-semibold tracking-widest text-muted-foreground">
                      {p.lang}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.slotsPerDay}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.timezone}</td>
                  <td className="px-4 py-3 text-foreground">{p.nextSlot}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Approved videos automatically take the next free slot on each page — you never pick a
          slot unless you want to.
        </p>
      </section>
    </div>
  );
}

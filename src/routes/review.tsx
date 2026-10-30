import { createFileRoute } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { reviewQueue } from "@/lib/mock-data";
import { VideoCard } from "@/components/studio";

export const Route = createFileRoute("/review")({
  head: () => ({
    meta: [
      { title: "Review queue — FB Content Studio" },
      {
        name: "description",
        content:
          "Videos waiting for your approval: watch both language versions, check sources and licenses, then approve, reject or request changes.",
      },
      { property: "og:title", content: "Review queue — FB Content Studio" },
      {
        property: "og:description",
        content:
          "Videos waiting for your approval: watch both language versions, check sources and licenses, then approve, reject or request changes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReviewQueuePage,
});

function ReviewQueuePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Review queue
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {reviewQueue.length} {reviewQueue.length === 1 ? "video" : "videos"} waiting for your
        decision. Open one to watch, check sources and approve.
      </p>
      {reviewQueue.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-lg border border-dashed border-border bg-card p-10 text-center">
          <Clock className="size-5 text-muted-foreground" />
          <p className="mt-2 font-display text-sm font-semibold text-foreground">
            Nothing needs your review
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            The next video should be ready around 2:40 PM — the pipeline keeps producing.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {reviewQueue.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      )}
    </div>
  );
}

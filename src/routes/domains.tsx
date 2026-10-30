import { createFileRoute, Link } from "@tanstack/react-router";
import { domains, getPagesForDomain } from "@/lib/mock-data";
import { Btn, ConnectionDot, DomainMiniCard } from "@/components/studio";

export const Route = createFileRoute("/domains")({
  head: () => ({
    meta: [
      { title: "Domains — FB Content Studio" },
      {
        name: "description",
        content:
          "Four domains, each with an English and a Vietnamese Facebook page and its own production pipeline.",
      },
      { property: "og:title", content: "Domains — FB Content Studio" },
      {
        property: "og:description",
        content:
          "Four domains, each with an English and a Vietnamese Facebook page and its own production pipeline.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DomainsPage,
});

function DomainsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Domains
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Each domain runs its own pipeline and posts to two pages: English and Vietnamese.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {domains.map((d) => {
          const dPages = getPagesForDomain(d.id);
          return (
            <DomainMiniCard key={d.id} domain={d}>
              {d.status === "active" ? (
                <>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Pipeline · <span className="font-medium text-foreground">{d.pipelineName}</span>
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {dPages.map((p) => (
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
                  <Link
                    to="/domains/$domainId"
                    params={{ domainId: d.id }}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
                  >
                    Open domain workspace →
                  </Link>
                </>
              ) : (
                <>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Pipeline · {d.pipelineName.toLowerCase()}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Pages EN / VI · Not linked
                  </p>
                  <Btn variant="outline" className="mt-3">
                    Set up domain
                  </Btn>
                </>
              )}
            </DomainMiniCard>
          );
        })}
      </div>
    </div>
  );
}

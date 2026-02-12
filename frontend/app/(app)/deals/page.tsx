"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, LayoutGrid, List } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Deal, DealStage } from "@/lib/types";
import { DEAL_STAGES } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/data-table";
import { StageBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function DealsPage() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "pipeline">("pipeline");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      let query = supabase
        .from("deals")
        .select(
          "*, contact:contacts(first_name, last_name), company:companies(name)"
        )
        .order("created_at", { ascending: false });

      if (search) {
        query = query.ilike("title", `%${search}%`);
      }

      const { data } = await query;
      setDeals((data as Deal[]) ?? []);
      setLoading(false);
    }
    load();
  }, [search]);

  const pipelineStages = DEAL_STAGES.filter(
    (s) => s.value !== "won" && s.value !== "lost"
  );
  const closedStages = DEAL_STAGES.filter(
    (s) => s.value === "won" || s.value === "lost"
  );

  function dealsByStage(stage: DealStage) {
    return deals.filter((d) => d.stage === stage);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Deals" description="Manage your sales pipeline">
        <Button
          variant={view === "pipeline" ? "default" : "outline"}
          size="icon"
          onClick={() => setView("pipeline")}
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant={view === "list" ? "default" : "outline"}
          size="icon"
          onClick={() => setView("list")}
        >
          <List className="h-4 w-4" />
        </Button>
        <Link href="/deals/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Deal
          </Button>
        </Link>
      </PageHeader>

      <Input
        placeholder="Search deals..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : view === "list" ? (
        <DataTable
          columns={[
            { header: "Title", accessor: "title" },
            {
              header: "Value",
              accessor: (row) =>
                row.value ? formatCurrency(row.value) : "—",
            },
            {
              header: "Stage",
              accessor: (row) => <StageBadge stage={row.stage} />,
            },
            {
              header: "Contact",
              accessor: (row) =>
                row.contact
                  ? `${row.contact.first_name} ${row.contact.last_name}`
                  : "—",
            },
            {
              header: "Close Date",
              accessor: (row) =>
                row.expected_close_date
                  ? formatDate(row.expected_close_date)
                  : "—",
            },
          ]}
          data={deals}
          onRowClick={(row) => router.push(`/deals/${row.id}`)}
          emptyMessage="No deals found."
        />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-4">
            {pipelineStages.map((stage) => {
              const stageDeals = dealsByStage(stage.value);
              const total = stageDeals.reduce(
                (sum, d) => sum + (d.value || 0),
                0
              );
              return (
                <Card key={stage.value}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {stage.label}
                      </CardTitle>
                      <span className="text-xs text-muted-foreground">
                        {stageDeals.length} deals
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(total)}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {stageDeals.length === 0 ? (
                      <p className="py-4 text-center text-xs text-muted-foreground">
                        No deals
                      </p>
                    ) : (
                      stageDeals.map((deal) => (
                        <Link
                          key={deal.id}
                          href={`/deals/${deal.id}`}
                          className="block rounded-md border border-border p-3 transition-colors hover:bg-muted"
                        >
                          <p className="text-sm font-medium">{deal.title}</p>
                          {deal.value && (
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(deal.value)}
                            </p>
                          )}
                          {deal.contact && (
                            <p className="text-xs text-muted-foreground">
                              {deal.contact.first_name}{" "}
                              {deal.contact.last_name}
                            </p>
                          )}
                        </Link>
                      ))
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {(dealsByStage("won").length > 0 ||
            dealsByStage("lost").length > 0) && (
            <div className="grid gap-4 lg:grid-cols-2">
              {closedStages.map((stage) => {
                const stageDeals = dealsByStage(stage.value);
                if (stageDeals.length === 0) return null;
                return (
                  <Card key={stage.value}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        {stage.label} ({stageDeals.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {stageDeals.map((deal) => (
                        <Link
                          key={deal.id}
                          href={`/deals/${deal.id}`}
                          className="block rounded-md border border-border p-3 transition-colors hover:bg-muted"
                        >
                          <p className="text-sm font-medium">{deal.title}</p>
                          {deal.value && (
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(deal.value)}
                            </p>
                          )}
                        </Link>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

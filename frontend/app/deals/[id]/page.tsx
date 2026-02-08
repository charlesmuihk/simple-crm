"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Deal, Activity } from "@/lib/types";
import { DEAL_STAGES } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, StageBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: dealData }, { data: activityData }] = await Promise.all([
        supabase
          .from("deals")
          .select(
            "*, contact:contacts(id, first_name, last_name), company:companies(id, name)"
          )
          .eq("id", id)
          .single(),
        supabase
          .from("activities")
          .select("*")
          .eq("deal_id", id)
          .order("created_at", { ascending: false }),
      ]);
      setDeal(dealData as Deal);
      setActivities((activityData as Activity[]) ?? []);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleStageChange(newStage: string) {
    const updates: Record<string, unknown> = { stage: newStage };
    if (newStage === "won" || newStage === "lost") {
      updates.closed_at = new Date().toISOString();
    }
    const { data } = await supabase
      .from("deals")
      .update(updates)
      .eq("id", id)
      .select(
        "*, contact:contacts(id, first_name, last_name), company:companies(id, name)"
      )
      .single();
    if (data) setDeal(data as Deal);
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this deal?")) return;
    await supabase.from("deals").delete().eq("id", id);
    router.push("/deals");
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  if (!deal) {
    return <p className="text-muted-foreground">Deal not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/deals">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader title={deal.title} className="flex-1">
          <Link href={`/deals/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </PageHeader>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Value</p>
              <p className="text-sm">
                {deal.value
                  ? `${formatCurrency(deal.value, deal.currency)} ${deal.currency}`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stage</p>
              <StageBadge stage={deal.stage} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact</p>
              <p className="text-sm">
                {deal.contact ? (
                  <Link
                    href={`/contacts/${deal.contact.id}`}
                    className="text-primary hover:underline"
                  >
                    {deal.contact.first_name} {deal.contact.last_name}
                  </Link>
                ) : (
                  "—"
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Company</p>
              <p className="text-sm">
                {deal.company ? (
                  <Link
                    href={`/companies/${deal.company.id}`}
                    className="text-primary hover:underline"
                  >
                    {deal.company.name}
                  </Link>
                ) : (
                  "—"
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Expected Close Date
              </p>
              <p className="text-sm">
                {deal.expected_close_date
                  ? formatDate(deal.expected_close_date)
                  : "—"}
              </p>
            </div>
            {deal.closed_at && (
              <div>
                <p className="text-sm text-muted-foreground">Closed At</p>
                <p className="text-sm">{formatDate(deal.closed_at)}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-sm">{formatDate(deal.created_at)}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Move Stage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {DEAL_STAGES.map((stage) => (
                  <Button
                    key={stage.value}
                    variant={
                      deal.stage === stage.value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleStageChange(stage.value)}
                    disabled={deal.stage === stage.value}
                  >
                    {stage.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No activities yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <Badge variant="secondary" className="mt-0.5 shrink-0">
                        {activity.type}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                          {activity.subject}
                        </p>
                        {activity.description && (
                          <p className="text-xs text-muted-foreground">
                            {activity.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

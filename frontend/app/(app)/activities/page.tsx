"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Activity } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeTime, formatDate } from "@/lib/utils";

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      let query = supabase
        .from("activities")
        .select(
          "*, contact:contacts(first_name, last_name), deal:deals(title)"
        )
        .order("created_at", { ascending: false });

      if (search) {
        query = query.ilike("subject", `%${search}%`);
      }

      const { data } = await query;
      setActivities((data as Activity[]) ?? []);
      setLoading(false);
    }
    load();
  }, [search]);

  return (
    <div className="space-y-6">
      <PageHeader title="Activities" description="Track all interactions">
        <Link href="/activities/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Log Activity
          </Button>
        </Link>
      </PageHeader>

      <Input
        placeholder="Search activities..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : activities.length === 0 ? (
        <p className="text-muted-foreground">No activities found.</p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <Card key={activity.id}>
              <CardContent className="flex items-start gap-4 p-4">
                <Badge variant="secondary" className="mt-0.5 shrink-0">
                  {activity.type}
                </Badge>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{activity.subject}</p>
                      {activity.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                      )}
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {activity.contact && (
                          <Link
                            href={`/contacts/${activity.contact_id}`}
                            className="text-primary hover:underline"
                          >
                            {activity.contact.first_name}{" "}
                            {activity.contact.last_name}
                          </Link>
                        )}
                        {activity.deal && (
                          <Link
                            href={`/deals/${activity.deal_id}`}
                            className="text-primary hover:underline"
                          >
                            {activity.deal.title}
                          </Link>
                        )}
                        {activity.due_date && (
                          <span>Due: {formatDate(activity.due_date)}</span>
                        )}
                        {activity.completed && (
                          <Badge variant="secondary">Completed</Badge>
                        )}
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelativeTime(activity.created_at)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

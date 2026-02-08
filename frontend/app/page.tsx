"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Building2, HandshakeIcon, DollarSign } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StageBadge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import type { Deal, Activity } from "@/lib/types";

interface DashboardStats {
  totalContacts: number;
  totalCompanies: number;
  openDeals: number;
  pipelineValue: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalContacts: 0,
    totalCompanies: 0,
    openDeals: 0,
    pipelineValue: 0,
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [upcomingDeals, setUpcomingDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const [
        { count: contactCount },
        { count: companyCount },
        { data: openDealsData },
        { data: activities },
        { data: closing },
      ] = await Promise.all([
        supabase
          .from("contacts")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("companies")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("deals")
          .select("value")
          .not("stage", "in", "(won,lost)"),
        supabase
          .from("activities")
          .select("*, contact:contacts(first_name, last_name), deal:deals(title)")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("deals")
          .select("*, contact:contacts(first_name, last_name)")
          .not("stage", "in", "(won,lost)")
          .not("expected_close_date", "is", null)
          .order("expected_close_date", { ascending: true })
          .limit(5),
      ]);

      const pipelineValue =
        openDealsData?.reduce((sum, d) => sum + (d.value || 0), 0) ?? 0;

      setStats({
        totalContacts: contactCount ?? 0,
        totalCompanies: companyCount ?? 0,
        openDeals: openDealsData?.length ?? 0,
        pipelineValue,
      });
      setRecentActivities((activities as Activity[]) ?? []);
      setUpcomingDeals((closing as Deal[]) ?? []);
      setLoading(false);
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of your CRM activity"
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Contacts
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContacts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Companies
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open Deals
            </CardTitle>
            <HandshakeIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openDeals}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pipeline Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.pipelineValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{activity.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.type}
                        {activity.contact &&
                          ` - ${activity.contact.first_name} ${activity.contact.last_name}`}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelativeTime(activity.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deals Closing Soon */}
        <Card>
          <CardHeader>
            <CardTitle>Deals Closing Soon</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeals.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No upcoming close dates.
              </p>
            ) : (
              <div className="space-y-4">
                {upcomingDeals.map((deal) => (
                  <Link
                    key={deal.id}
                    href={`/deals/${deal.id}`}
                    className="flex items-center justify-between gap-4 rounded-md p-2 transition-colors hover:bg-muted"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{deal.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Closes{" "}
                        {deal.expected_close_date &&
                          new Date(deal.expected_close_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {deal.value && (
                        <span className="text-sm font-medium">
                          {formatCurrency(deal.value)}
                        </span>
                      )}
                      <StageBadge stage={deal.stage} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Contact, Activity } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatRelativeTime } from "@/lib/utils";

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: contactData }, { data: activityData }] = await Promise.all(
        [
          supabase
            .from("contacts")
            .select("*, company:companies(*)")
            .eq("id", id)
            .single(),
          supabase
            .from("activities")
            .select("*")
            .eq("contact_id", id)
            .order("created_at", { ascending: false }),
        ]
      );
      setContact(contactData as Contact);
      setActivities((activityData as Activity[]) ?? []);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    await supabase.from("contacts").delete().eq("id", id);
    router.push("/contacts");
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  if (!contact) {
    return <p className="text-muted-foreground">Contact not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/contacts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title={`${contact.first_name} ${contact.last_name}`}
          className="flex-1"
        >
          <Link href={`/contacts/${id}/edit`}>
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
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-sm">{contact.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="text-sm">{contact.phone ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Company</p>
              <p className="text-sm">
                {contact.company ? (
                  <Link
                    href={`/companies/${contact.company.id}`}
                    className="text-primary hover:underline"
                  >
                    {contact.company.name}
                  </Link>
                ) : (
                  "—"
                )}
              </p>
            </div>
            {contact.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="text-sm whitespace-pre-wrap">{contact.notes}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-sm">{formatDate(contact.created_at)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activities yet.</p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-0.5 shrink-0">
                      {activity.type}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{activity.subject}</p>
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
  );
}

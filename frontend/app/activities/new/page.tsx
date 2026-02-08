"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Contact, Deal } from "@/lib/types";
import { ACTIVITY_TYPES } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function NewActivityPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase
        .from("contacts")
        .select("id, first_name, last_name")
        .order("first_name"),
      supabase.from("deals").select("id, title").order("title"),
    ]).then(([{ data: c }, { data: d }]) => {
      setContacts((c as Contact[]) ?? []);
      setDeals((d as Deal[]) ?? []);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const { error } = await supabase.from("activities").insert({
      type: formData.get("type") as string,
      subject: formData.get("subject") as string,
      description: (formData.get("description") as string) || null,
      contact_id: (formData.get("contact_id") as string) || null,
      deal_id: (formData.get("deal_id") as string) || null,
      due_date: (formData.get("due_date") as string) || null,
    });

    if (!error) {
      router.push("/activities");
    }
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Log Activity" />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select id="type" name="type" defaultValue="note" required>
              {ACTIVITY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input id="subject" name="subject" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact_id">Contact</Label>
            <Select id="contact_id" name="contact_id">
              <option value="">None</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.first_name} {c.last_name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="deal_id">Deal</Label>
            <Select id="deal_id" name="deal_id">
              <option value="">None</option>
              {deals.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="due_date">Due Date (for tasks)</Label>
          <Input id="due_date" name="due_date" type="datetime-local" />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Log Activity"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/activities")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

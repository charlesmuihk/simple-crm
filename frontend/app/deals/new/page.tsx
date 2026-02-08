"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Contact, Company } from "@/lib/types";
import { DEAL_STAGES } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export default function NewDealPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase
        .from("contacts")
        .select("id, first_name, last_name")
        .order("first_name"),
      supabase.from("companies").select("id, name").order("name"),
    ]).then(([{ data: c }, { data: comp }]) => {
      setContacts((c as Contact[]) ?? []);
      setCompanies((comp as Company[]) ?? []);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const value = formData.get("value") as string;

    const { error } = await supabase.from("deals").insert({
      title: formData.get("title") as string,
      value: value ? parseFloat(value) : null,
      currency: (formData.get("currency") as string) || "USD",
      stage: formData.get("stage") as string,
      contact_id: formData.get("contact_id") as string,
      company_id: (formData.get("company_id") as string) || null,
      expected_close_date:
        (formData.get("expected_close_date") as string) || null,
    });

    if (!error) {
      router.push("/deals");
    }
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="New Deal" />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Deal Title *</Label>
          <Input id="title" name="title" required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              name="value"
              type="number"
              step="0.01"
              min="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" name="currency" defaultValue="USD" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="stage">Stage *</Label>
            <Select id="stage" name="stage" defaultValue="lead" required>
              {DEAL_STAGES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="expected_close_date">Expected Close Date</Label>
            <Input
              id="expected_close_date"
              name="expected_close_date"
              type="date"
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact_id">Contact *</Label>
            <Select id="contact_id" name="contact_id" required>
              <option value="">Select a contact</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.first_name} {c.last_name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_id">Company</Label>
            <Select id="company_id" name="company_id">
              <option value="">None</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Create Deal"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/deals")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

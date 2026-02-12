"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Contact, Company } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function EditContactPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("contacts").select("*").eq("id", id).single(),
      supabase.from("companies").select("id, name").order("name"),
    ]).then(([{ data: c }, { data: comp }]) => {
      setContact(c as Contact);
      setCompanies((comp as Company[]) ?? []);
    });
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const { error } = await supabase
      .from("contacts")
      .update({
        first_name: formData.get("first_name") as string,
        last_name: formData.get("last_name") as string,
        email: (formData.get("email") as string) || null,
        phone: (formData.get("phone") as string) || null,
        company_id: (formData.get("company_id") as string) || null,
        notes: (formData.get("notes") as string) || null,
      })
      .eq("id", id);

    if (!error) {
      router.push(`/contacts/${id}`);
    }
    setSaving(false);
  }

  if (!contact) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Edit Contact" />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name *</Label>
            <Input
              id="first_name"
              name="first_name"
              defaultValue={contact.first_name}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name *</Label>
            <Input
              id="last_name"
              name="last_name"
              defaultValue={contact.last_name}
              required
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={contact.email ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              defaultValue={contact.phone ?? ""}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="company_id">Company</Label>
          <Select
            id="company_id"
            name="company_id"
            defaultValue={contact.company_id ?? ""}
          >
            <option value="">None</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={contact.notes ?? ""}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/contacts/${id}`)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

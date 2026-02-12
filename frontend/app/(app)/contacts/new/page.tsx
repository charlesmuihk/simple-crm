"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Company } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function NewContactPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("companies")
      .select("id, name")
      .order("name")
      .then(({ data }) => setCompanies((data as Company[]) ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const { error } = await supabase.from("contacts").insert({
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
      company_id: (formData.get("company_id") as string) || null,
      notes: (formData.get("notes") as string) || null,
    });

    if (!error) {
      router.push("/contacts");
    }
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="New Contact" />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name *</Label>
            <Input id="first_name" name="first_name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name *</Label>
            <Input id="last_name" name="last_name" required />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" />
          </div>
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
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Create Contact"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/contacts")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

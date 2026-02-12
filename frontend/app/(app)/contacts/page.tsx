"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Contact } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/data-table";
import { formatDate } from "@/lib/utils";

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      let query = supabase
        .from("contacts")
        .select("*, company:companies(name)")
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(
          `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
        );
      }

      const { data } = await query;
      setContacts((data as Contact[]) ?? []);
      setLoading(false);
    }
    load();
  }, [search]);

  return (
    <div className="space-y-6">
      <PageHeader title="Contacts" description="Manage your contacts">
        <Link href="/contacts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </Link>
      </PageHeader>

      <Input
        placeholder="Search contacts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <DataTable
          columns={[
            {
              header: "Name",
              accessor: (row) =>
                `${row.first_name} ${row.last_name}`,
            },
            { header: "Email", accessor: "email" },
            { header: "Phone", accessor: "phone" },
            {
              header: "Company",
              accessor: (row) => row.company?.name ?? "—",
            },
            {
              header: "Created",
              accessor: (row) => formatDate(row.created_at),
            },
          ]}
          data={contacts}
          onRowClick={(row) => router.push(`/contacts/${row.id}`)}
          emptyMessage="No contacts found."
        />
      )}
    </div>
  );
}

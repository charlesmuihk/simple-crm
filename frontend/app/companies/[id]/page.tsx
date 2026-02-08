"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Company, Contact, Deal } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { StageBadge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: comp }, { data: contactData }, { data: dealData }] =
        await Promise.all([
          supabase.from("companies").select("*").eq("id", id).single(),
          supabase
            .from("contacts")
            .select("*")
            .eq("company_id", id)
            .order("created_at", { ascending: false }),
          supabase
            .from("deals")
            .select("*, contact:contacts(first_name, last_name)")
            .eq("company_id", id)
            .order("created_at", { ascending: false }),
        ]);
      setCompany(comp as Company);
      setContacts((contactData as Contact[]) ?? []);
      setDeals((dealData as Deal[]) ?? []);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this company?")) return;
    await supabase.from("companies").delete().eq("id", id);
    router.push("/companies");
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  if (!company) {
    return <p className="text-muted-foreground">Company not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/companies">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader title={company.name} className="flex-1">
          <Link href={`/companies/${id}/edit`}>
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

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Industry</p>
            <p className="text-sm">{company.industry ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Website</p>
            <p className="text-sm">{company.website ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Address</p>
            <p className="text-sm whitespace-pre-wrap">
              {company.address ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Created</p>
            <p className="text-sm">{formatDate(company.created_at)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contacts ({contacts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              {
                header: "Name",
                accessor: (row) => `${row.first_name} ${row.last_name}`,
              },
              { header: "Email", accessor: (row) => row.email ?? "—" },
              { header: "Phone", accessor: (row) => row.phone ?? "—" },
            ]}
            data={contacts}
            onRowClick={(row) => router.push(`/contacts/${row.id}`)}
            emptyMessage="No contacts at this company."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deals ({deals.length})</CardTitle>
        </CardHeader>
        <CardContent>
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
            ]}
            data={deals}
            onRowClick={(row) => router.push(`/deals/${row.id}`)}
            emptyMessage="No deals with this company."
          />
        </CardContent>
      </Card>
    </div>
  );
}

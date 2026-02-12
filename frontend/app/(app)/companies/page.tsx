"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Company } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/data-table";
import { formatDate } from "@/lib/utils";

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      let query = supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false });

      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      const { data } = await query;
      setCompanies((data as Company[]) ?? []);
      setLoading(false);
    }
    load();
  }, [search]);

  return (
    <div className="space-y-6">
      <PageHeader title="Companies" description="Manage your companies">
        <Link href="/companies/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        </Link>
      </PageHeader>

      <Input
        placeholder="Search companies..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <DataTable
          columns={[
            { header: "Name", accessor: "name" },
            {
              header: "Industry",
              accessor: (row) => row.industry ?? "—",
            },
            {
              header: "Website",
              accessor: (row) => row.website ?? "—",
            },
            {
              header: "Created",
              accessor: (row) => formatDate(row.created_at),
            },
          ]}
          data={companies}
          onRowClick={(row) => router.push(`/companies/${row.id}`)}
          emptyMessage="No companies found."
        />
      )}
    </div>
  );
}

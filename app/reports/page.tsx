"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { reportsNav } from "@/components/shell/nav-items";
import { PageHeader } from "@/components/ui/page-header";

const reportLinks = reportsNav.filter((r) => r.href !== "/reports");

export default function ReportsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Reports"
        description="Read-only views of tasks, resources, and cost breakdowns."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reportLinks.map((r) => {
          const Icon = r.icon;
          return (
            <Link
              key={r.href}
              href={r.href}
              className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-foreground">{r.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-primary">
                Open report
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

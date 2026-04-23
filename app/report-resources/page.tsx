"use client";

import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableWrapper, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

interface Resource {
  id: number;
  name: string;
  type: string;
  max: string;
  stRate: string;
  ovtRate?: string;
  costUse: string;
}

export default function ReportResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("resources");
    if (saved) {
      try {
        setResources(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing resources:", e);
      }
    }
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Report — All Resources"
        description="Read-only list of every resource."
      />

      <Card>
        <CardHeader>
          <CardTitle>All Resources</CardTitle>
          <CardDescription>
            {resources.length === 0
              ? "No resources."
              : `${resources.length} ${resources.length === 1 ? "resource" : "resources"}.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <TableWrapper>
            {resources.length === 0 ? (
              <div className="p-6">
                <EmptyState icon={Users} title="No resources to display" description="Add resources first to see them here." />
              </div>
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Name</TH>
                    <TH>Type</TH>
                    <TH>Max</TH>
                    <TH>St. Rate</TH>
                    <TH>Ovt. Rate</TH>
                    <TH>Cost / Use</TH>
                  </TR>
                </THead>
                <TBody>
                  {resources.map((r) => (
                    <TR key={r.id}>
                      <TD className="font-medium text-foreground">{r.name}</TD>
                      <TD>
                        {r.type ? (
                          <Badge variant={r.type === "Work" ? "default" : "outline"}>{r.type}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TD>
                      <TD>{r.max || "—"}</TD>
                      <TD>{r.stRate || "—"}</TD>
                      <TD>{r.ovtRate || "—"}</TD>
                      <TD>{r.costUse || "—"}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </TableWrapper>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Wallet } from "lucide-react";
import { calculateTaskCost, getResourceNamesForTask } from "@/lib/cost";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableWrapper, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { useProjectData } from "@/lib/use-project-data";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/dates";

export default function ReportTaskCostPage() {
  const { tasks, resources, allocations, loading } = useProjectData();

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Report — Cost per Task"
        description="Total cost for each task based on current allocations."
      />

      <Card>
        <CardHeader>
          <CardTitle>Cost breakdown by task</CardTitle>
          <CardDescription>
            {loading ? "Loading…" : `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <TableWrapper>
            {loading ? (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">Loading…</div>
            ) : tasks.length === 0 ? (
              <div className="p-6">
                <EmptyState icon={Wallet} title="No tasks to display" description="Add tasks and allocate resources to see their cost." />
              </div>
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH className="w-16">ID</TH>
                    <TH>Task Name</TH>
                    <TH>Duration</TH>
                    <TH>Start Date</TH>
                    <TH>Finish Date</TH>
                    <TH>Resources</TH>
                    <TH className="text-right">Total Cost</TH>
                  </TR>
                </THead>
                <TBody>
                  {tasks.map((task) => {
                    const cost = calculateTaskCost(task, resources, allocations);
                    const names = getResourceNamesForTask(task.id, resources, allocations);
                    return (
                      <TR key={task.id}>
                        <TD className="font-medium text-muted-foreground">#{task.id}</TD>
                        <TD className="font-medium text-foreground">{task.name}</TD>
                        <TD className="whitespace-nowrap">{task.duration} days</TD>
                        <TD className="whitespace-nowrap">{formatDate(task.startDate)}</TD>
                        <TD className="whitespace-nowrap">{formatDate(task.finishDate)}</TD>
                        <TD className={names === "None" ? "text-muted-foreground" : ""}>{names}</TD>
                        <TD className="whitespace-nowrap text-right font-semibold text-foreground">
                          {formatCurrency(cost)}
                        </TD>
                      </TR>
                    );
                  })}
                </TBody>
              </Table>
            )}
          </TableWrapper>
        </CardContent>
      </Card>
    </div>
  );
}

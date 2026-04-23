"use client";

import { PieChart as PieChartIcon, DollarSign } from "lucide-react";
import {
  calculateTaskCost,
  calculateTotalProjectCost,
  getResourceNamesForTask,
} from "@/lib/cost";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Table, TableWrapper, THead, TBody, TFoot, TR, TH, TD } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { useProjectData } from "@/lib/use-project-data";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/dates";

export default function ReportTotalCostPage() {
  const { tasks, resources, allocations, loading } = useProjectData();
  const total = calculateTotalProjectCost(tasks, resources, allocations);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Report — Total Project Cost"
        description="Task-wise breakdown with a grand total for the project."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatCard
          label="Grand Total"
          value={loading ? "—" : formatCurrency(total)}
          hint="Sum of all task costs"
          icon={DollarSign}
          accent="success"
        />
        <StatCard
          label="Tasks Counted"
          value={loading ? "—" : tasks.length}
          hint={tasks.length === 1 ? "task" : "tasks"}
          icon={PieChartIcon}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Project Cost (task-wise)</CardTitle>
          <CardDescription>
            {loading ? "Loading…" : "All costs are derived from current allocations."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <TableWrapper>
            {loading ? (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">Loading…</div>
            ) : tasks.length === 0 ? (
              <div className="p-6">
                <EmptyState icon={PieChartIcon} title="No tasks to display" description="Add tasks and allocate resources first." />
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
                <TFoot>
                  <TR>
                    <TD colSpan={6} className="text-right text-sm font-semibold">Total Project Cost</TD>
                    <TD className="whitespace-nowrap text-right text-base font-bold text-foreground">
                      {formatCurrency(total)}
                    </TD>
                  </TR>
                </TFoot>
              </Table>
            )}
          </TableWrapper>
        </CardContent>
      </Card>
    </div>
  );
}

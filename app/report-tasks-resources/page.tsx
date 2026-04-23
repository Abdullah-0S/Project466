"use client";

import { Workflow } from "lucide-react";
import { getResourceNamesForTask } from "@/lib/cost";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableWrapper, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { useProjectData } from "@/lib/use-project-data";
import { formatDate } from "@/lib/dates";

export default function ReportTasksResourcesPage() {
  const { tasks, resources, allocations, loading } = useProjectData();

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Report — Tasks + Resources"
        description="Every task with the resources currently assigned to it."
      />

      <Card>
        <CardHeader>
          <CardTitle>Tasks with assigned resources</CardTitle>
          <CardDescription>
            {loading ? "Loading…" : `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"} shown.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <TableWrapper>
            {loading ? (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">Loading…</div>
            ) : tasks.length === 0 ? (
              <div className="p-6">
                <EmptyState icon={Workflow} title="No tasks to display" description="Add tasks and resources first." />
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
                  </TR>
                </THead>
                <TBody>
                  {tasks.map((task) => {
                    const names = getResourceNamesForTask(task.id, resources, allocations);
                    return (
                      <TR key={task.id}>
                        <TD className="font-medium text-muted-foreground">#{task.id}</TD>
                        <TD className="font-medium text-foreground">{task.name}</TD>
                        <TD className="whitespace-nowrap">{task.duration} days</TD>
                        <TD className="whitespace-nowrap">{formatDate(task.startDate)}</TD>
                        <TD className="whitespace-nowrap">{formatDate(task.finishDate)}</TD>
                        <TD className={names === "None" ? "text-muted-foreground" : ""}>{names}</TD>
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

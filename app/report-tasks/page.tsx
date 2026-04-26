"use client";

import { useState, useEffect } from "react";
import { ListTodo } from "lucide-react";
import { Task } from "@/lib/cost";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableWrapper, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/dates";

export default function ReportTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Task[]) => setTasks(data))
      .catch((err) => console.error("Failed to fetch tasks:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Report — All Tasks"
        description="Read-only list of every task."
      />

      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
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
                <EmptyState icon={ListTodo} title="No tasks to display" description="Add tasks first to see them here." />
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
                  </TR>
                </THead>
                <TBody>
                  {tasks.map((task) => (
                    <TR key={task.id}>
                      <TD className="font-medium text-muted-foreground">#{task.id}</TD>
                      <TD className="font-medium text-foreground">{task.name}</TD>
                      <TD className="whitespace-nowrap">{task.duration} days</TD>
                      <TD className="whitespace-nowrap">{formatDate(task.startDate)}</TD>
                      <TD className="whitespace-nowrap">{formatDate(task.finishDate)}</TD>
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

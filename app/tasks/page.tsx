"use client";

import { useState, useEffect } from "react";
import { ListTodo, Pencil, Trash2, X, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Table, TableWrapper, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { addDaysToDate, daysBetweenInclusive, formatDate } from "@/lib/dates";

interface Task {
  id: number;
  name: string;
  duration: number;
  startDate: string;
  finishDate: string;
}

const emptyForm = { name: "", duration: "", startDate: "", finishDate: "" };

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) setTasks(await res.json());
    } catch (e) {
      console.error("Failed to fetch tasks:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const taskData = {
      name: formData.name,
      duration: parseInt(formData.duration) || 0,
      startDate: formData.startDate,
      finishDate: formData.finishDate,
    };
    try {
      if (editingId) {
        await fetch("/api/tasks", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...taskData }),
        });
        setEditingId(null);
      } else {
        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });
      }
      await fetchTasks();
      setFormData(emptyForm);
    } catch (e) {
      console.error("Failed to save task:", e);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingId(task.id);
    setFormData({
      name: task.name,
      duration: task.duration.toString(),
      startDate: task.startDate,
      finishDate: task.finishDate,
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
      await fetchTasks();
      if (editingId === id) {
        setEditingId(null);
        setFormData(emptyForm);
      }
    } catch (e) {
      console.error("Failed to delete task:", e);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(emptyForm);
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Tasks"
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{editingId ? "Edit Task" : "Add New Task"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Task Name" htmlFor="task-name">
              <Input
                id="task-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Problem Identification"
              />
            </FormField>
            <FormField label="Duration (Days)" htmlFor="task-duration">
              <Input
                id="task-duration"
                type="number"
                required
                min="0"
                step="1"
                value={formData.duration}
                onChange={(e) => {
                  const newDuration = e.target.value;
                  const days = parseInt(newDuration);
                  if (!isNaN(days) && days >= 0 && formData.startDate) {
                    setFormData({
                      ...formData,
                      duration: newDuration,
                      finishDate: addDaysToDate(formData.startDate, days),
                    });
                  } else {
                    setFormData({ ...formData, duration: newDuration });
                  }
                }}
                placeholder="e.g., 5"
              />
            </FormField>
            <FormField label="Start Date" htmlFor="task-start">
              <Input
                id="task-start"
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => {
                  const newStartDate = e.target.value;
                  if (formData.duration) {
                    const days = parseInt(formData.duration);
                    if (!isNaN(days) && days >= 0) {
                      setFormData({
                        ...formData,
                        startDate: newStartDate,
                        finishDate: addDaysToDate(newStartDate, days),
                      });
                      return;
                    }
                  }
                  if (formData.finishDate) {
                    setFormData({
                      ...formData,
                      startDate: newStartDate,
                      duration: daysBetweenInclusive(newStartDate, formData.finishDate).toString(),
                    });
                    return;
                  }
                  setFormData({ ...formData, startDate: newStartDate });
                }}
              />
            </FormField>
            <FormField label="Finish Date" htmlFor="task-finish">
              <Input
                id="task-finish"
                type="date"
                required
                value={formData.finishDate}
                onChange={(e) => {
                  const newFinishDate = e.target.value;
                  if (formData.startDate) {
                    setFormData({
                      ...formData,
                      finishDate: newFinishDate,
                      duration: daysBetweenInclusive(formData.startDate, newFinishDate).toString(),
                    });
                  } else {
                    setFormData({ ...formData, finishDate: newFinishDate });
                  }
                }}
              />
            </FormField>
            <div className="md:col-span-2 flex flex-wrap items-center gap-2 pt-1">
              <Button type="submit">
                {editingId ? <Pencil /> : <Plus />}
                {editingId ? "Update Task" : "Add Task"}
              </Button>
              {editingId ? (
                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                  <X /> Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
          <CardDescription>
            {loading ? "Loading…" : `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"} on file.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <TableWrapper>
            {loading ? (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">Loading tasks…</div>
            ) : tasks.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={ListTodo}
                  title="No tasks yet"
                  description="Use the form above to create your first task."
                />
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
                    <TH className="text-right">Actions</TH>
                  </TR>
                </THead>
                <TBody>
                  {tasks.map((task) => (
                    <TR
                      key={task.id}
                      className={cn(editingId === task.id && "bg-primary/5 hover:bg-primary/10")}
                    >
                      <TD className="font-medium text-muted-foreground">#{task.id}</TD>
                      <TD className="font-medium text-foreground">{task.name}</TD>
                      <TD className="whitespace-nowrap">{task.duration} days</TD>
                      <TD className="whitespace-nowrap">{formatDate(task.startDate)}</TD>
                      <TD className="whitespace-nowrap">{formatDate(task.finishDate)}</TD>
                      <TD className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(task)}
                            aria-label={`Edit ${task.name}`}
                            title="Edit"
                          >
                            <Pencil />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(task.id)}
                            aria-label={`Delete ${task.name}`}
                            title="Delete"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </TD>
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

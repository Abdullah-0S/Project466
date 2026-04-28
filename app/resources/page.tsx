"use client";

import { useState, useEffect, useRef } from "react";
import { Users, Pencil, Trash2, X, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Table, TableWrapper, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Resource {
  id: number;
  name: string;
  type: string;
  max: string;
  stRate: string;
  costUse: string;
}

const STORAGE_KEY = "resources";
const emptyForm = { name: "", type: "", max: "", stRate: "", costUse: "" };

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setResources(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing resources:", e);
      }
    }
    setTimeout(() => {
      isLoaded.current = true;
    }, 100);
  }, []);

  useEffect(() => {
    if (!isLoaded.current) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
  }, [resources]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setResources(resources.map((res) => (res.id === editingId ? { ...res, ...formData } : res)));
      setEditingId(null);
    } else {
      const newResource: Resource = {
        id: resources.length > 0 ? Math.max(...resources.map((r) => r.id)) + 1 : 1,
        ...formData,
      };
      setResources([...resources, newResource]);
    }
    setFormData(emptyForm);
  };

  const handleEdit = (resource: Resource) => {
    setEditingId(resource.id);
    setFormData({
      name: resource.name,
      type: resource.type,
      max: resource.max,
      stRate: resource.stRate,
      costUse: resource.costUse,
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    setResources(resources.filter((res) => res.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setFormData(emptyForm);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleTypeChange = (type: string) => {
    if (type === "Work") {
      setFormData({ ...formData, type, costUse: "" });
    } else if (type === "Cost") {
      setFormData({ ...formData, type, max: "", stRate: "" });
    } else if (type === "Material") {
      setFormData({ ...formData, type, max: "", costUse: "" });
    } else {
      setFormData({ ...formData, type });
    }
  };

  const isWork = formData.type === "Work";
  const isCost = formData.type === "Cost";
  const isMaterial = formData.type === "Material";

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Resources"
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{editingId ? "Edit Resource" : "Add New Resource"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FormField label="Resource Name" htmlFor="res-name">
              <Input
                id="res-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Project Manager"
              />
            </FormField>
            <FormField label="Type" htmlFor="res-type">
              <Select
                id="res-type"
                required
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value)}
              >
                <option value="">Select type…</option>
                <option value="Work">Work</option>
                <option value="Cost">Cost</option>
                <option value="Material">Material</option>
              </Select>
            </FormField>
            {isWork && (
              <FormField
                label="Max (Availability)"
                htmlFor="res-max"
                hint="Use % for availability (e.g. 100%, 50%)"
              >
                <Input
                  id="res-max"
                  type="text"
                  required
                  value={formData.max}
                  onChange={(e) => setFormData({ ...formData, max: e.target.value })}
                  placeholder="e.g., 100%"
                />
              </FormField>
            )}
            {(isWork || isMaterial) && (
              <FormField
                label="St. Rate"
                htmlFor="res-strate"
                hint={isWork ? "Hourly rate (e.g. 15 for $15/hr)" : "Fixed cost per unit"}
              >
                <Input
                  id="res-strate"
                  type="text"
                  required
                  value={formData.stRate}
                  onChange={(e) => setFormData({ ...formData, stRate: e.target.value })}
                  placeholder={isWork ? "e.g., 15 or 15$/hr" : "e.g., 50"}
                />
              </FormField>
            )}
            {isCost && (
              <FormField label="Cost / Use" htmlFor="res-cost" hint="Fixed cost per use">
                <Input
                  id="res-cost"
                  type="text"
                  required
                  value={formData.costUse}
                  onChange={(e) => setFormData({ ...formData, costUse: e.target.value })}
                  placeholder="e.g., 1000"
                />
              </FormField>
            )}
            <div className="md:col-span-2 lg:col-span-3 flex flex-wrap items-center gap-2 pt-1">
              <Button type="submit">
                {editingId ? <Pencil /> : <Plus />}
                {editingId ? "Update Resource" : "Add Resource"}
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
          <CardTitle>All Resources</CardTitle>
          <CardDescription>
            {resources.length === 0
              ? "No resources yet."
              : `${resources.length} ${resources.length === 1 ? "resource" : "resources"} on file.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <TableWrapper>
            {resources.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={Users}
                  title="No resources yet"
                  description="Add people or materials via the form above."
                />
              </div>
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Name</TH>
                    <TH>Type</TH>
                    <TH>Max / Qty</TH>
                    <TH>St. Rate</TH>
                    <TH>Cost / Use</TH>
                    <TH className="text-right">Actions</TH>
                  </TR>
                </THead>
                <TBody>
                  {resources.map((r) => (
                    <TR
                      key={r.id}
                      className={cn(editingId === r.id && "bg-primary/5 hover:bg-primary/10")}
                    >
                      <TD className="font-medium text-foreground">{r.name}</TD>
                      <TD>
                        {r.type ? (
                          <Badge variant={r.type === "Work" ? "default" : r.type === "Material" ? "secondary" : "outline"}>{r.type}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TD>
                      <TD>{r.max || "—"}</TD>
                      <TD>{r.stRate || "—"}</TD>
                      <TD>{r.costUse || "—"}</TD>
                      <TD className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(r)}
                            aria-label={`Edit ${r.name}`}
                            title="Edit"
                          >
                            <Pencil />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(r.id)}
                            aria-label={`Delete ${r.name}`}
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

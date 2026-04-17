"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Resource {
  id: number;
  name: string;
  type: string;
  max: string;
  stRate: string;
  costUse: string;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    max: "",
    stRate: "",
    costUse: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const STORAGE_KEY = "resources";
  const isLoaded = useRef(false);

  // Load resources from localStorage on mount
  useEffect(() => {
    console.log("Resources page - Starting load...");

    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setResources(parsed);
      } catch (e) {
        console.error("Error parsing resources:", e);
      }
    } else {
      setResources([]);
    }

    console.log("Load complete - resources:", saved);

    // Mark as loaded after state is set
    setTimeout(() => {
      isLoaded.current = true;
      console.log("Marked as loaded");
    }, 100);
  }, []);

  // Save resources to localStorage
  useEffect(() => {
    // Skip save during initial load
    if (!isLoaded.current) {
      return;
    }

    // Only save if there are resources
    if (resources.length === 0) {
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
  }, [resources]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      setResources(resources.map(res =>
        res.id === editingId
          ? { ...res, ...formData }
          : res
      ));
      setEditingId(null);
    } else {
      const newResource: Resource = {
        id: resources.length > 0 ? Math.max(...resources.map(r => r.id)) + 1 : 1,
        ...formData,
      };
      setResources([...resources, newResource]);
    }

    setFormData({ name: "", type: "", max: "", stRate: "", costUse: "" });
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
    if (confirm("Are you sure you want to delete this resource?")) {
      setResources(resources.filter(res => res.id !== id));
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", type: "", max: "", stRate: "", costUse: "" });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-primary text-white p-6 shadow-lg">
        <Link href="/" className="text-blue-200 hover:text-white mb-4 inline-block">← Back to Home</Link>
        <h1 className="text-3xl font-bold mt-2">Resource Management</h1>
      </div>

      <div className="container mx-auto mt-8 p-6">
        {/* Add/Edit Form */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Resource" : "Add New Resource"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resource Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="e.g., Project Manager"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Select Type</option>
                <option value="Work">Work</option>
                <option value="Cost">Cost</option>
                <option value="Material">Material</option>
                <option value="Equipment">Equipment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max (Availability)</label>
              <input
                type="text"
                required
                value={formData.max}
                onChange={(e) => setFormData({ ...formData, max: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="e.g., 100%"
              />
              <p className="text-xs text-gray-500">Use % for availability (e.g., 100%, 50%)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">St. Rate</label>
              <input
                type="text"
                value={formData.stRate}
                onChange={(e) => setFormData({ ...formData, stRate: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="e.g., 15 or 15$/hr"
              />
              <p className="text-xs text-gray-500">Hourly rate (e.g., 15 for $15/hr)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost/Use</label>
              <input
                type="text"
                value={formData.costUse}
                onChange={(e) => setFormData({ ...formData, costUse: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="e.g., 1000"
              />
              <p className="text-xs text-gray-500">Fixed cost per use (optional)</p>
            </div>
            <div className="md:col-span-2 lg:col-span-5 flex gap-2">
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                {editingId ? "Update Resource" : "Add Resource"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Resources Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">All Resources</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max (Availability)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">St. Rate ($/hr)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost/Use</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {resources.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No resources yet. Add your first resource above.</td>
                  </tr>
                ) : (
                  resources.map((resource) => (
                    <tr key={resource.id} className={editingId === resource.id ? "bg-blue-50" : ""}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{resource.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{resource.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{resource.max}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{resource.stRate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{resource.costUse}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => handleEdit(resource)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(resource.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

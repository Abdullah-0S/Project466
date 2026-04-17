"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Task {
  id: number;
  name: string;
  duration: number;
  startDate: string;
  finishDate: string;
}

// Helper function to add days to a date string
const addDaysToDate = (dateStr: string, days: number): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return ""; // Handle invalid dates
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

// Helper function to calculate days between two dates (including start day)
const calculateDaysBetween = (startDate: string, finishDate: string): number => {
  if (!startDate || !finishDate) return 0;
  const start = new Date(startDate);
  const end = new Date(finishDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

  // Calculate difference in milliseconds
  const diffTime = end.getTime() - start.getTime();
  // Convert to days and add 1 to include the starting day
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    duration: "",
    startDate: "",
    finishDate: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Load tasks from API on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
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
        // Update existing task
        await fetch('/api/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...taskData }),
        });
        setEditingId(null);
      } else {
        // Add new task
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        });
      }

      await fetchTasks();
      setFormData({ name: "", duration: "", startDate: "", finishDate: "" });
    } catch (error) {
      console.error('Failed to save task:', error);
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
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' });
        await fetchTasks();
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", duration: "", startDate: "", finishDate: "" });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-primary text-white p-6 shadow-lg">
        <Link href="/" className="text-blue-200 hover:text-white mb-4 inline-block">← Back to Home</Link>
        <h1 className="text-3xl font-bold mt-2">Tasks Management</h1>
      </div>

      <div className="container mx-auto mt-8 p-6">
        {/* Add/Edit Form */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Task" : "Add New Task"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="e.g., Problem Identification"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Days)</label>
              <input
                type="number"
                required
                min="0"
                step="1"
                value={formData.duration}
                onChange={(e) => {
                  const newDuration = e.target.value;
                  const days = parseInt(newDuration);

                  // Auto-calculate finish date if start date is set
                  if (!isNaN(days) && days >= 0 && formData.startDate) {
                    const calculatedFinish = addDaysToDate(formData.startDate, days);
                    setFormData({ ...formData, duration: newDuration, finishDate: calculatedFinish });
                  } else {
                    setFormData({ ...formData, duration: newDuration });
                  }
                }}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="e.g., 5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => {
                  const newStartDate = e.target.value;

                  // Auto-calculate finish date if duration is set
                  if (formData.duration) {
                    const days = parseInt(formData.duration);
                    if (!isNaN(days) && days >= 0) {
                      const calculatedFinish = addDaysToDate(newStartDate, days);
                      setFormData({ ...formData, startDate: newStartDate, finishDate: calculatedFinish });
                    } else {
                      setFormData({ ...formData, startDate: newStartDate });
                    }
                  } else if (formData.finishDate) {
                    // Auto-calculate duration if finish date is set
                    const days = calculateDaysBetween(newStartDate, formData.finishDate);
                    setFormData({ ...formData, startDate: newStartDate, duration: days.toString() });
                  } else {
                    setFormData({ ...formData, startDate: newStartDate });
                  }
                }}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Finish Date</label>
              <input
                type="date"
                required
                value={formData.finishDate}
                onChange={(e) => {
                  const newFinishDate = e.target.value;

                  // Auto-calculate duration if start date is set
                  if (formData.startDate) {
                    const days = calculateDaysBetween(formData.startDate, newFinishDate);
                    setFormData({ ...formData, finishDate: newFinishDate, duration: days.toString() });
                  } else {
                    setFormData({ ...formData, finishDate: newFinishDate });
                  }
                }}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4 flex gap-2">
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                {editingId ? "Update Task" : "Add Task"}
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

        {/* Tasks Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">All Tasks</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration (Days)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Finish Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : tasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No tasks yet. Add your first task above.</td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task.id} className={editingId === task.id ? "bg-blue-50" : ""}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.duration} days</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.startDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.finishDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => handleEdit(task)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
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

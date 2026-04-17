"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Resource {
  id: number;
  name: string;
  type: string;
  max: string;
  stRate: string;
  costUse: string;
}

export default function ReportResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("resources");
    if (saved) {
      setResources(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-primary text-white p-6 shadow-lg">
        <Link href="/" className="text-blue-200 hover:text-white mb-4 inline-block">← Back to Home</Link>
        <h1 className="text-3xl font-bold mt-2">Report: All Resources</h1>
      </div>

      <div className="container mx-auto mt-8 p-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">All Resources (View Only)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type (List)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max (No. of resources)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">St. Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ovt. Cost/Use</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {resources.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No resources to display.</td>
                  </tr>
                ) : (
                  resources.map((resource) => (
                    <tr key={resource.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{resource.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{resource.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{resource.max}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{resource.stRate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{resource.costUse}</td>
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

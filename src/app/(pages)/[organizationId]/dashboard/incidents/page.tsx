"use client";

import { useEffect, useState } from "react";

 type Incident = {
  id: string;
  title: string;
  description: string;
  status: "OPEN" | "INVESTIGATING" | "RESOLVED";
  componentId: string;
  createdAt: string;
};

type IncidentsPageProps = {
  params: {
    orgid: string;
  };
};

const fetchIncidents = async (orgId: string, page: number): Promise<{ incidents: Incident[]; total: number }> => {
  const res = await fetch(`/api/v3/incidents?orgId=${orgId}&page=${page}`);
  if (!res.ok) throw new Error("Failed to fetch incidents");
  return res.json();
};

const addIncident = async (title: string, description: string, componentId: string, status: Incident["status"]): Promise<void> => {
  await fetch("/api/v3/incidents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description, componentId, status }),
  });
};

export default function IncidentsPage({ params }: IncidentsPageProps) {
  const { orgid } = params;
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [newIncident, setNewIncident] = useState({ title: "", description: "", componentId: "", status: "OPEN" as Incident["status"] });

  useEffect(() => {
    fetchIncidents(orgid, page)
      .then(({ incidents, total }) => {
        setIncidents(incidents);
        setTotalPages(Math.ceil(total / 10));
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [orgid, page]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold text-center mb-6">Incidents</h1>
      {isLoading ? (
        <p className="text-center">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">Failed to load incidents</p>
      ) : (
        <div className="space-y-6">
          <table className="w-full border border-gray-700">
            <thead>
              <tr className="bg-gray-800">
                <th className="border border-gray-600 px-4 py-2">Title</th>
                <th className="border border-gray-600 px-4 py-2">Status</th>
                <th className="border border-gray-600 px-4 py-2">Description</th>
                <th className="border border-gray-600 px-4 py-2">Created At</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => (
                <tr key={incident.id} className="text-center">
                  <td className="border border-gray-600 px-4 py-2">{incident.title}</td>
                  <td className="border border-gray-600 px-4 py-2">{incident.status}</td>
                  <td className="border border-gray-600 px-4 py-2">{incident.description}</td>
                  <td className="border border-gray-600 px-4 py-2">{new Date(incident.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between mt-4">
            <button
              disabled={page === 1}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              disabled={page === totalPages}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Next
            </button>
          </div>
          <div className="mt-4">
            <input
              type="text"
              className="p-2 text-black rounded"
              placeholder="Incident Title"
              value={newIncident.title}
              onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
            />
            <button
              className="ml-2 px-3 py-1 bg-green-600 hover:bg-green-500 rounded"
              onClick={() => addIncident(newIncident.title, newIncident.description, newIncident.componentId, newIncident.status)}
            >
              Add Incident
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

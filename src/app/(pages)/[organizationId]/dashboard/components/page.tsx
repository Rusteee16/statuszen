"use client";

import { useEffect, useState } from "react";

 type Component = {
  id: string;
  name: string;
  status: "OPERATIONAL" | "PERFORMANCE_ISSUES" | "PARTIAL_OUTAGE" | "MAJOR_OUTAGE" | "UNKNOWN";
  groupId: string;
  url: string;
};

type Group = {
  id: string;
  name: string;
};

type ComponentsPageProps = {
  params: {
    orgid: string;
  };
};

const fetchComponents = async (orgId: string): Promise<Component[]> => {
  const res = await fetch(`/api/v3/components?orgId=${orgId}`);
  if (!res.ok) throw new Error("Failed to fetch components");
  return res.json();
};

const fetchGroups = async (orgId: string): Promise<Group[]> => {
  const res = await fetch(`/api/v3/groups?orgId=${orgId}`);
  if (!res.ok) throw new Error("Failed to fetch groups");
  return res.json();
};

const deleteComponent = async (componentId: string): Promise<void> => {
  await fetch("/api/v3/components", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ componentId }),
  });
};

const addComponent = async (orgId: string, name: string, groupId: string, status: Component["status"], url: string): Promise<void> => {
  await fetch("/api/v3/components", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orgId, name, groupId, status, url }),
  });
};

export default function ComponentsPage({ params }: ComponentsPageProps) {
  const { orgid } = params;
  const [components, setComponents] = useState<Component[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newComponent, setNewComponent] = useState({ name: "", groupId: "", status: "OPERATIONAL" as Component["status"], url: "" });

  useEffect(() => {
    Promise.all([fetchComponents(orgid), fetchGroups(orgid)])
      .then(([componentsData, groupsData]) => {
        setComponents(componentsData);
        setGroups(groupsData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [orgid]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold text-center mb-6">Components</h1>
      {isLoading ? (
        <p className="text-center">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">Failed to load components</p>
      ) : (
        <div className="space-y-6">
          <table className="w-full border border-gray-700">
            <thead>
              <tr className="bg-gray-800">
                <th className="border border-gray-600 px-4 py-2">Component Name</th>
                <th className="border border-gray-600 px-4 py-2">Status</th>
                <th className="border border-gray-600 px-4 py-2">Group</th>
                <th className="border border-gray-600 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {components.map((component) => (
                <tr key={component.id} className="text-center">
                  <td className="border border-gray-600 px-4 py-2">{component.name}</td>
                  <td className="border border-gray-600 px-4 py-2">{component.status}</td>
                  <td className="border border-gray-600 px-4 py-2">{groups.find(g => g.id === component.groupId)?.name || "Unknown"}</td>
                  <td className="border border-gray-600 px-4 py-2">
                    <button
                      className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded"
                      onClick={() => deleteComponent(component.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4">
            <input
              type="text"
              className="p-2 text-black rounded"
              placeholder="Component Name"
              value={newComponent.name}
              onChange={(e) => setNewComponent({ ...newComponent, name: e.target.value })}
            />
            <select
              className="p-2 ml-2 text-black rounded"
              value={newComponent.groupId}
              onChange={(e) => setNewComponent({ ...newComponent, groupId: e.target.value })}
            >
              <option value="">Select Group</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
            <button
              className="ml-2 px-3 py-1 bg-green-600 hover:bg-green-500 rounded"
              onClick={() => addComponent(orgid, newComponent.name, newComponent.groupId, newComponent.status, newComponent.url)}
            >
              Add Component
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

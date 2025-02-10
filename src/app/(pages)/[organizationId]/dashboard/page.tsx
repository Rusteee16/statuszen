"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

 type Component = {
  id: string;
  name: string;
  status: "OPERATIONAL" | "PERFORMANCE_ISSUES" | "PARTIAL_OUTAGE" | "MAJOR_OUTAGE" | "UNKNOWN";
  groupId: string;
};

type GroupedComponents = Record<string, Component[]>;

type DashboardPageProps = {
  params: {
    orgid: string;
  };
};

const fetchDashboardData = async (orgId: string): Promise<Component[]> => {
  const res = await fetch(`/api/components?orgId=${orgId}`);
  if (!res.ok) throw new Error("Failed to fetch components");
  return res.json();
};

const updateComponentStatus = async (componentId: string, status: Component["status"]): Promise<void> => {
  await fetch("/api/components", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ componentId, status }),
  });
};

export default function DashboardPage({ params }: DashboardPageProps) {
  const { orgid } = params;
  const [groups, setGroups] = useState<GroupedComponents>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [incidents, setIncidents] = useState<number>(0);

  useEffect(() => {
    if (!orgid) return;
    fetchDashboardData(orgid)
      .then((data) => {
        const groupedComponents: GroupedComponents = data.reduce((acc: GroupedComponents, component) => {
          if (!acc[component.groupId]) acc[component.groupId] = [];
          acc[component.groupId]?.push(component);
          return acc;
        }, {});
        setGroups(groupedComponents);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));

    fetch(`/api/incidents?orgId=${orgid}`)
      .then((res) => res.json())
      .then((data) => setIncidents(data.length))
      .catch(console.error);
  }, [orgid]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold text-center mb-6">Dashboard - {orgid}</h1>
      {isLoading ? (
        <p className="text-center">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">Failed to load data</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(([groupId, components]) => (
            <div key={groupId} className="bg-gray-800 p-4 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Group: {groupId}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {components.map((component) => (
                  <div key={component.id} className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-xl font-bold">{component.name}</h3>
                    <p className="text-gray-300">Status: {component.status}</p>
                    <div className="mt-2 flex space-x-2">
                      {["OPERATIONAL", "PERFORMANCE_ISSUES", "PARTIAL_OUTAGE", "MAJOR_OUTAGE", "UNKNOWN"].map((status) => (
                        <button
                          key={status}
                          className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500"
                          onClick={() => updateComponentStatus(component.id, status as Component["status"])}
                        >
                          {status.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="bg-gray-800 p-4 rounded-lg shadow-md text-center text-lg font-bold">
            Total Incidents: {incidents}
          </div>
        </div>
      )}
    </div>
  );
}
